import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { AnchorDto, AnchorWithWalletDto } from '../dto/AnchorDto';
import { EnvService } from '../../shared/services/EnvService';
import { AnchorRequestService } from './AnchorRequestService';
import { OrganisationEntity } from '../../shared/entities/OrganisationEntity';
import { OrganisationService } from '../../shared/services/OrganisationService';
import { ApplicationEntity } from '../../shared/entities/ApplicationEntity';
import { ApplicationService } from '../../shared/services/ApplicationService';
import { AnchorRequestEntity } from '../entities/AnchorRequestEntity';
import {
	ApplicationLedgerMicroblockBuilder,
	ApplicationLedgerNotFoundError, ApplicationLedgerVb,
	CMTSToken,
	CryptoEncoderFactory,
	EncoderFactory, FeesCalculationFormulaFactory,
	Hash,
	MessageSerializer, Microblock,
	Provider, ProviderFactory, SectionType, SignatureSchemeId,
	WalletInteractiveAnchoringRequestActorKey,
	WalletInteractiveAnchoringRequestApprovalHandshake, WalletInteractiveAnchoringRequestApprovalSignature,
	WalletInteractiveAnchoringResponse, WalletInteractiveAnchoringResponseType,
	WalletRequestBasedApplicationLedgerMicroblockBuilder,
} from '@cmts-dev/carmentis-sdk/server';


@Injectable()
export class OperatorService {

	private provider: Provider;
	constructor(
		private envService: EnvService,
		private anchorRequestService: AnchorRequestService,
		private organisationService: OrganisationService,
		private applicationService: ApplicationService,
	) {
		this.provider = ProviderFactory.createInMemoryProviderWithExternalProvider(this.envService.nodeUrl);
	}
	private logger = new Logger(OperatorService.name);


	async createAnchorWithWalletSession( organisation: OrganisationEntity, application: ApplicationEntity, request: AnchorWithWalletDto ) {
		this.logger.debug("Initiating session to anchor with a wallet.")

		const appLedgerId = await this.loadApplicationLedger(application, request.virtualBlockchainId);
		const mb = await appLedgerId.createMicroblock();

		// store the request
		const gasPrice = this.extractGasPrice(request);
		const storedRequest = await this.anchorRequestService.storeAnchorRequest(organisation, application, request, gasPrice);
		console.log(storedRequest)
		const anchorRequestId = storedRequest.getAnchorRequestId();

		return { anchorRequestId }
	};


	/**
	 * This method is called when the wallet wants to proceed with the approval, starting with the handshake.
	 * @param req 
	 * @returns 
	 */
	async approvalHandshake(req: WalletInteractiveAnchoringRequestApprovalHandshake): Promise<WalletInteractiveAnchoringResponse> {
		const anchorRequestId = req.anchorRequestId;
		this.logger.debug(`AnchorRequestId ${anchorRequestId}: Proceeding to approval handshake`)

		// load the initial anchor request and halts if the request is not pending
		const storedRequest = await this.loadAnchorRequestFromDataId(anchorRequestId);
		const {application, organisation} = await this.loadApplicationAndOrganisationFromAnchorRequest(storedRequest);
		const wallet = organisation.getWallet().getDefaultAccountCrypto();
		let applicationLedger = await this.loadApplicationLedger(application, storedRequest.request.virtualBlockchainId);

		// if the actor key is missing, asks the wallet
		const endorser = storedRequest.request.endorser;
		if (applicationLedger.actorIsSubscribed(endorser)) {
			this.logger.debug("Endorser already subscribed")
			this.logger.log("Sending approval data to the wallet")
			const mbBuilder = await WalletRequestBasedApplicationLedgerMicroblockBuilder.createFromVirtualBlockchain(applicationLedger);
			const endorser = storedRequest.request.endorser;
			this.logger.debug(`Actor ${endorser} subscribed.`);
			const mb = await mbBuilder.createMicroblockFromStateUpdateRequest(wallet, {
				...storedRequest.request,
				applicationId: application.virtualBlockchainId
			})
			await this.anchorRequestService.saveMicroblock(anchorRequestId, mb);
			const {microblockData: serializedMb} = mb.serialize();
			return {
				type: WalletInteractiveAnchoringResponseType.APPROVAL_DATA,
				serializedMicroblock: serializedMb
			}
		} else {
			// we need the endorser public signature and encryption keys
			this.logger.debug(`Endorser not subscribed: asking actor key to the wallet`);
			const genesisSeed = await applicationLedger.getGenesisSeed();
			return {
				type: WalletInteractiveAnchoringResponseType.ACTOR_KEY_REQUIRED,
				genesisSeed: genesisSeed.toBytes(),
			}
		}



	}

	/**
	 * This method is called when the wallet sends the actor public keys for subscription.
	 * 
	 * @param req 
	 * @returns 
	 */
	async handleActorKeys(req: WalletInteractiveAnchoringRequestActorKey): Promise<WalletInteractiveAnchoringResponse> {
		const anchorRequestId = req.anchorRequestId;
		this.logger.debug(`Proceeding to approval actor key with dataId = ${anchorRequestId}`)

		// exctract the actor public signature and encryption keys from the request
		const containsActorPublicSignatureKey = 'actorSignaturePublicKey' in req && typeof req.actorSignaturePublicKey === 'string';
		if (!containsActorPublicSignatureKey) throw new BadRequestException("Missing actor public signature key");
		const actorPublicSignatureKey: string = req.actorSignaturePublicKey as string;

		const containsActorPublicEncryptionKey = 'actorPkePublicKey' in req && typeof req.actorPkePublicKey === 'string';
		if (!containsActorPublicEncryptionKey) throw new BadRequestException("Missing actor public encryption key");
		const actorPublicEncryptionKey: string = req.actorPkePublicKey as string;

		// decode the actor keys
		const signatureEncoder = CryptoEncoderFactory.defaultStringSignatureEncoder();
		const decodedActorPublicSignatureKey = await signatureEncoder.decodePublicKey(actorPublicSignatureKey);
		const pkeEncoder = CryptoEncoderFactory.defaultStringPublicKeyEncryptionEncoder();
		const decodedActorPublicEncryptionKey = await pkeEncoder.decodePublicEncryptionKey(actorPublicEncryptionKey);

		// proceed to load the anchor request and send the approval data
		try {
			// recover the organization and application associated with the anchor request
			const storedRequest = await this.loadAnchorRequestFromDataId(anchorRequestId);
			const {application, organisation} = await this.loadApplicationAndOrganisationFromAnchorRequest(storedRequest);
			const wallet = organisation.getWallet().getDefaultAccountCrypto();

			// recover the application ledger
			let applicationLedger = await this.loadApplicationLedger(application, storedRequest.request.virtualBlockchainId);
			const mbBuilder = await WalletRequestBasedApplicationLedgerMicroblockBuilder.createFromVirtualBlockchain(applicationLedger);


			const endorser = storedRequest.request.endorser;
			this.logger.debug(`Subscribing actor ${endorser} on the application ledger...`);
			await mbBuilder.subscribeActor(endorser, decodedActorPublicSignatureKey, decodedActorPublicEncryptionKey)
			this.logger.debug(`Actor ${endorser} subscribed.`);
			const mb = await mbBuilder.createMicroblockFromStateUpdateRequest(wallet, {
				...storedRequest.request,
				applicationId: application.virtualBlockchainId
			})
			const {microblockData: serializedMb} = mb.serialize();
			await this.anchorRequestService.saveMicroblock(anchorRequestId, mb);
			return {
				type: WalletInteractiveAnchoringResponseType.APPROVAL_DATA,
				serializedMicroblock: serializedMb
			}

			//return await this.sendApprovalData(anchorRequestId, applicationLedger);
		}
		catch(e) {
			this.logger.error(e);
			return {
				type: WalletInteractiveAnchoringResponseType.ERROR,
				errorMessage: `${e}`
			}
		}
	}




	/*
	private async sendApprovalData(
		anchorRequestId: string,
		applicationLedger: ApplicationLedger, 
	) {
		this.logger.debug(`Sending approval data`);

		try {
			// load the micro-block that should be signed by the wallet
			const microBlockToBeSigned = applicationLedger.getMicroblockData();

			// store the application ledger under approval process
			applicationLedgerUnderApproval.set(anchorRequestId, applicationLedger);
			
			// send the micro-block to be signed to the wallet
			console.log(`sending block data (${microBlockToBeSigned.length} bytes)`);
			const schemaSerializer = new MessageSerializer(WALLET_OP_MESSAGES);
			return schemaSerializer.serialize(
				MSG_ANS_APPROVAL_DATA,
				{
					data: microBlockToBeSigned
				}
			);
		}
		catch(e) {
			console.error(e);
			throw e;
		}
	}

	 */

	/**
	 * This method is called when the wallet sends the signature of the micro-block for approval.
	 * 
	 * @param req 
	 * @returns 
	 */
	async approvalSignature(req: WalletInteractiveAnchoringRequestApprovalSignature): Promise<WalletInteractiveAnchoringResponse> {
		// check the request id is valid
		const anchorRequestId = req.anchorRequestId;
		if (typeof anchorRequestId !== 'string') throw new BadRequestException("Missing anchor request ID");

		// parse the signature
		const signature = req.signature;
		if (!(signature instanceof Uint8Array)) throw new BadRequestException("Missing signature");



		try {
			// load the stored anchor request from the database
			const storedRequest = await this.loadAnchorRequestFromDataId(anchorRequestId);
			const mb = storedRequest.getBuiltMicroblock().unwrap();


			// load the organization private signature key
			const {organisation, application} = await this.loadApplicationAndOrganisationFromAnchorRequest(storedRequest);
			const orgVb = await this.provider.loadOrganizationVirtualBlockchain(Hash.from(organisation.virtualBlockchainId));
			const accountId = orgVb.getAccountId();
			const organisationPrivateKey = await organisation.getPrivateSignatureKey();


			// check if the application ledger is already published
			const appLedgerVb = await this.loadApplicationLedger(application, storedRequest.virtualBlockchainId);
			const endorserPk = await appLedgerVb.getPublicSignatureKeyByActorId(appLedgerVb.getActorIdFromActorName(storedRequest.request.endorser));

			// add the signature of the endorser to the micro-block
			mb.addSection({
				type: SectionType.SIGNATURE,
				signature: signature,
				schemeId: endorserPk.getSignatureSchemeId(),
			})
			await mb.verify(endorserPk, { includeGas: false, verifiedSignatureIndex: 1 });
			await mb.seal(organisationPrivateKey, {
				feesPayerAccount: accountId.toBytes()
			})


			// mark the stored request has completed
			const vbHash = Hash.from(appLedgerVb.getId());
			const mbHash = mb.getHash();
			await this.anchorRequestService.markAnchorRequestAsPublished(
				storedRequest.getAnchorRequestId(),
				vbHash,
				mbHash,
			);

			// send the answer to the wallet
			return {
				type: WalletInteractiveAnchoringResponseType.APPROVAL_SIGNATURE,
				vbHash: vbHash.toBytes(),
				mbHash: mbHash.toBytes(),
				height: appLedgerVb.getHeight(),
			}
		}
		catch(e) {
			throw e
		}
	}


	private async loadAnchorRequestFromDataId(dataId:string) {
		// load the initial anchor request and halts if the request is not pending
		const storedRequest = await this.anchorRequestService.findAnchorRequestByAnchorRequestId(dataId);
		if (!storedRequest.isPending()) throw new Error("Anchor request is not valid anymore.")
		return storedRequest;
	}

	private async loadApplicationAndOrganisationFromAnchorRequest(storedRequest: AnchorRequestEntity) {
		const applicationId = storedRequest.applicationId;
		const organisationId = storedRequest.localOrganisationId;
		this.logger.debug(`Loading application with (local) id ${applicationId} and organisation with (local) id ${organisationId}`);
		const [application, organisation] = await Promise.all([
			this.applicationService.findApplication(applicationId),
			this.organisationService.findOne(organisationId)
		])
		this.logger.debug(`Application with (blockchain) id ${application.virtualBlockchainId} and organisation with (blockchain) id ${organisation.virtualBlockchainId}`);
		return {application, organisation};
	}


	private async loadApplicationLedger(application: ApplicationEntity, appLedgerId?: string): Promise<ApplicationLedgerVb> {
		const appLedgerVbId = appLedgerId;
		if (appLedgerVbId) {
			this.logger.debug(`Loading application ledger ${appLedgerId} associated with application ${application.virtualBlockchainId}...`)
			return this.provider.loadApplicationLedgerVirtualBlockchain(Hash.from(appLedgerVbId));
		} else {
			const vb = ApplicationLedgerVb.createApplicationLedgerVirtualBlockchain(this.provider);
			return vb;
		}
	}


	async getAnchorRequestFromAnchorRequestId(anchorRequestId: string) {
		return this.anchorRequestService.findAnchorRequestByAnchorRequestId(anchorRequestId);
	}

	private async getAccountIdFromOrganization(organization: OrganisationEntity) {
		const orgVb = await this.provider.loadOrganizationVirtualBlockchain(Hash.from(organization.virtualBlockchainId));
		const accountId = orgVb.getAccountId();
		return accountId
	}

	private async getGasFromMicroblockAndSigningSchemeId(mb: Microblock, signingSchemeId: SignatureSchemeId) {
		const protocolVariables = await this.provider.getProtocolVariables();
		const feesCalculationVersion = protocolVariables.getFeesCalculationVersion();
		const feesFormula = FeesCalculationFormulaFactory.getFeesCalculationFormulaByVersion(feesCalculationVersion);
		const gas = await feesFormula.computeFees(signingSchemeId, mb);
		return gas
	}

	async anchor(application: ApplicationEntity, organisation: OrganisationEntity, anchorDto: AnchorDto) {
		// perform the anchoring
		const nodeUrl = this.envService.nodeUrl;
		const wallet = organisation.getWallet().getDefaultAccountCrypto();
		const vb = await this.loadApplicationLedger(application, anchorDto.virtualBlockchainId);
		const mbBuilder = await WalletRequestBasedApplicationLedgerMicroblockBuilder.createFromVirtualBlockchain(vb);
		const mb = await mbBuilder.createMicroblockFromStateUpdateRequest(wallet, {
			...anchorDto,
			applicationId: application.virtualBlockchainId
		})
		const organizationPrivateKey = await organisation.getPrivateSignatureKey();
		mb.setGasPrice(CMTSToken.createAtomic(anchorDto.gasPriceInAtomic))
		mb.setGas(await this.getGasFromMicroblockAndSigningSchemeId(mb, organizationPrivateKey.getSignatureSchemeId()))
		await mb.seal(organizationPrivateKey, {
			feesPayerAccount: (await this.getAccountIdFromOrganization(organisation)).toBytes()
		});
		const mbHash = await this.provider.publishMicroblock(mb);

		// create a new anchor request entry to save the interaction
		return this.anchorRequestService.createAndSaveCompletedAnchorRequest(
			Hash.from(vb.getId()),
			mbHash,
			anchorDto,
			organisation,
			application
		)
	}

	private extractGasPrice(anchorDto: AnchorDto) {
		const gasPriceInAtomic = anchorDto.gasPriceInAtomic;
		return gasPriceInAtomic !== undefined ?
			CMTSToken.oneCMTS() :
			CMTSToken.createAtomic(gasPriceInAtomic);
	}
}