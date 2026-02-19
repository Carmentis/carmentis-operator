import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { AnchorDto, AnchorWithWalletDto } from '../dto/AnchorDto';
import { EnvService } from './EnvService';
import { AnchorRequestService } from './AnchorRequestService';
import { ApplicationService } from './ApplicationService';
import { AnchorRequestEntity } from '../entities/AnchorRequestEntity';
import {
	ActorNotSubscribedError,
	ApplicationLedgerVb,
	CMTSToken,
	CryptoEncoderFactory,
	EncoderFactory,
	FeesCalculationFormulaFactory,
	Hash,
	Microblock,
	Provider,
	SectionType,
	SeedEncoder,
	SignatureSchemeId,
	WalletCrypto,
	WalletInteractiveAnchoringRequestActorKey,
	WalletInteractiveAnchoringRequestApprovalHandshake,
	WalletInteractiveAnchoringRequestApprovalSignature,
	WalletInteractiveAnchoringResponse,
	WalletInteractiveAnchoringResponseType,
	WalletRequestBasedApplicationLedgerMicroblockBuilder,
} from '@cmts-dev/carmentis-sdk/server';
import { ApplicationEntity } from '../entities/ApplicationEntity';


@Injectable()
export class WalletAnchoringRequestService {

	constructor(
		private anchorRequestService: AnchorRequestService,
		private applicationService: ApplicationService,
	) {}

	private logger = new Logger(WalletAnchoringRequestService.name);


	async createAnchorWithWalletSession(application: ApplicationEntity, request: AnchorWithWalletDto) {
		this.logger.debug("Initiating session to anchor with a wallet.")

		// store the request
		const storedRequest = await this.anchorRequestService.storeAnchorRequest(application, request);
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
		this.logger.debug(`Proceeding to approval handshake with anchor request id = ${anchorRequestId}`)

		// load the initial anchor request and halts if the request is not pending
		const storedRequest = await this.loadAnchorRequestFromDataId(anchorRequestId);
		const { application } = await this.loadApplicationFromAnchorRequest(storedRequest);
		const wallet = await this.loadWalletEntityFromApplication(application);
		const provider = wallet.getProvider();
		const accountCrypto = await this.loadAccountCryptoFromApplication(application);
		let applicationLedger = await this.loadApplicationLedger(
			provider,
			application,
			storedRequest
		);

		// we enable the draft mode to be able to work with the current microblock
		const endorser = storedRequest.request.endorser;
		const b64 = EncoderFactory.bytesToBase64Encoder();
		try {
			const mbBuilder = await this.getWalletRequestBasedApplicationLedgerMicroblockBuilder(
				Hash.fromHex(application.vbId),
				applicationLedger,
				anchorRequestId
			)
			const mb = await mbBuilder.createMicroblockFromStateUpdateRequest(accountCrypto, {
				...storedRequest.request,
			})

			this.logger.debug(`Endorser ${endorser} subscribed.`);
			this.logger.log("Sending approval data to the wallet")

			await this.anchorRequestService.saveMicroblock(anchorRequestId, mb);
			const { microblockData: serializedMb } = mb.serialize();
			this.logger.debug(`Microblock during approval handshake: ${mb.toString()}`)

			return {
				type: WalletInteractiveAnchoringResponseType.APPROVAL_DATA,
				b64SerializedMicroblock: b64.encode(serializedMb)
			}
		} catch (e) {
			if (e instanceof ActorNotSubscribedError) {
				// we need the endorser public signature and encryption keys
				if (e.getNotSubscribedActorName() === endorser) {
					this.logger.debug(`Endorser not subscribed: asking actor key to the wallet`);
					const genesisSeed = await applicationLedger.getGenesisSeed();
					console.log(`The genesis seed saved for anchor request id ${anchorRequestId}:`, genesisSeed.toBytes());
					await this.anchorRequestService.saveGenesisSeed(anchorRequestId, genesisSeed);
					return {
						type: WalletInteractiveAnchoringResponseType.ACTOR_KEY_REQUIRED,
						b64GenesisSeed: b64.encode(genesisSeed.toBytes()),
					}
				} else {
					this.logger.warn(`An actor (distinct of the endorser) is not subscribed: ${e.getNotSubscribedActorName()}`)
					throw e;
				}

			} else {
				this.logger.error(`Error while building the microblock: ${e}`)
				throw e
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
		this.logger.debug(`Proceeding to approval actor key with anchor request id = ${anchorRequestId}`)

		// extract the actor public signature and encryption keys from the request
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
		// recover the organization and application associated with the anchor request
		const storedRequest = await this.loadAnchorRequestFromDataId(anchorRequestId);
		const { application } = await this.loadApplicationFromAnchorRequest(storedRequest);
		const accountCrypto = await this.loadAccountCryptoFromApplication(application);
		const wallet = await this.loadWalletEntityFromApplication(application);
		const provider = wallet.getProvider();

		// recover the application ledger and attempt to generate the microblock
		const endorser = storedRequest.request.endorser;
		this.logger.debug(`Subscribing actor ${endorser} on the application ledger...`);
		let applicationLedger = await this.loadApplicationLedger(provider, application, storedRequest);
		const mbBuilder = await this.getWalletRequestBasedApplicationLedgerMicroblockBuilder(
			Hash.fromHex(application.vbId),
			applicationLedger,
			anchorRequestId
		)
		await mbBuilder.subscribeActor(endorser, decodedActorPublicSignatureKey, decodedActorPublicEncryptionKey)
		const mb = await mbBuilder.createMicroblockFromStateUpdateRequest(accountCrypto, {
			...storedRequest.request,
		})


		const { microblockData: serializedMb } = mb.serialize();
		await this.anchorRequestService.saveMicroblock(anchorRequestId, mb);

		const b64 = EncoderFactory.bytesToBase64Encoder();
		return {
			type: WalletInteractiveAnchoringResponseType.APPROVAL_DATA,
			b64SerializedMicroblock: b64.encode(serializedMb)
		}

	}

	private async getWalletRequestBasedApplicationLedgerMicroblockBuilder(
		applicationVbId: Hash,
		applicationLedgerVb: ApplicationLedgerVb,
		anchorRequestId: string
	) {
		// easy case: the application ledger is not empty, meaning that the genesis seed is already defined so
		// we only have to instantiate a microblock extending the application ledger
		if (!applicationLedgerVb.isEmpty()) {
			const mb = await applicationLedgerVb.createMicroblock();
			const mbBuilder = new WalletRequestBasedApplicationLedgerMicroblockBuilder(mb, applicationLedgerVb);
			applicationLedgerVb.setMicroblockSearchFailureFallback(mbBuilder);
			return mbBuilder;
		}

		// harder case: the application ledger is empty, meaning that we have to generate the genesis seed
		// and then create a microblock extending the application ledger.
		// Be aware that a genesis might already be generated and stored in the anchor request (which explains why we expect the anchor request id)
		const mb = await applicationLedgerVb.createMicroblock();
		const storedAnchorRequest = await this.anchorRequestService.findAnchorRequestByAnchorRequestId(anchorRequestId);
		if (!storedAnchorRequest.hexEncodedGenesisSeed) {
			// in this case, we use the genesis seed generated automatically in the mb and store it in the anchor request
			const genesisSeed = await mb.getPreviousHash();
			await this.anchorRequestService.saveGenesisSeed(anchorRequestId, genesisSeed);
			this.logger.debug(`Generated genesis seed for anchor request id ${anchorRequestId}: ${genesisSeed.encode()}`)
		} else {
			// in this case, we use the genesis seed stored in the anchor request
			const genesisSeed = storedAnchorRequest.getStoredGenesisSeed();
			mb.setPreviousHash(genesisSeed);
			this.logger.debug(`Using genesis seed stored in anchor request id ${anchorRequestId}: ${genesisSeed.encode()}`)
		}

		// here, the microblock is empty and the application ledger is empty too,
		// so we have to add the application ledger creation section to the microblock
		mb.addSection({
			type: SectionType.APP_LEDGER_CREATION,
			applicationId: applicationVbId.toBytes(),
		})

		// we return the builder
		const mbBuilder = new WalletRequestBasedApplicationLedgerMicroblockBuilder(mb, applicationLedgerVb);
		applicationLedgerVb.setMicroblockSearchFailureFallback(mbBuilder);
		return mbBuilder;
	}


	/**
	 * This method is called when the wallet sends the signature of the micro-block for approval.
	 *
	 * @param req
	 * @returns
	 */
	async approvalSignature(req: WalletInteractiveAnchoringRequestApprovalSignature): Promise<WalletInteractiveAnchoringResponse> {
		// check the request id is valid
		const anchorRequestId = req.anchorRequestId;
		this.logger.debug(`Proceeding to approval signature with anchor request id = ${anchorRequestId}`)

		// parse the signature
		const b64 = EncoderFactory.bytesToBase64Encoder();
		const signature = b64.decode(req.b64Signature);
		if (!(signature instanceof Uint8Array)) throw new BadRequestException("Missing signature");


		try {
			// load the stored anchor request from the database
			this.logger.debug("Recovering anchor request id")
			const storedRequest = await this.loadAnchorRequestFromDataId(anchorRequestId);
			const mb = storedRequest.getBuiltMicroblock().unwrap();


			// load the organization private signature key=
			const { application } = await this.loadApplicationFromAnchorRequest(storedRequest);
			const accountCrypto = await this.loadAccountCryptoFromApplication(application);
			const wallet = await this.loadWalletEntityFromApplication(application);
			const provider = wallet.getProvider();
			const organizationVbId = await this.loadOrganizationVbIdFromApplication(provider, application);
			const accountId = await this.loadAccountIdFromOrganizationVbId(provider, organizationVbId);
			const organisationPrivateKey = await accountCrypto.getPrivateSignatureKey(SignatureSchemeId.SECP256K1);


			// we finish the construction of the microblock
			this.logger.debug("Loading application ledger and endorser public key for verification")
			const appLedgerVb = await this.loadApplicationLedger(provider, application, storedRequest);
			appLedgerVb.enableDraftMode();
			await appLedgerVb.appendMicroBlock(mb);
			const endorserPk = await appLedgerVb.getPublicSignatureKeyByActorId(
				appLedgerVb.getActorIdFromActorName(storedRequest.request.endorser)
			);

			// add the signature of the endorser to the micro-block
			mb.addSection({
				type: SectionType.SIGNATURE,
				signature: signature,
				schemeId: endorserPk.getSignatureSchemeId(),
			})
			const isVerified = await mb.verify(endorserPk, { includeGas: false, verifiedSignatureIndex: 1 });
			if (!isVerified) this.logger.warn("The signature of the endorser is not valid.")

			// we compute the gas
			const gas = await this.getGasFromMicroblockAndSigningSchemeId(provider, mb, organisationPrivateKey.getSignatureSchemeId());
			mb.setGas(gas);

			await mb.seal(organisationPrivateKey, {
				feesPayerAccount: accountId.toBytes()
			})

			// publish the micro-block
			const mbHash = mb.getHash();
			const vbHash = appLedgerVb.getHeight() == 1 ? mbHash : appLedgerVb.getIdentifier();

			this.logger.debug(`Publishing micro-block ${mbHash.encode()} located at height ${mb.getHeight()} on virtual blockchain ${vbHash.encode()}`);
			await provider.publishMicroblock(mb);


			// mark the stored request has completed
			await this.anchorRequestService.markAnchorRequestAsPublished(
				storedRequest.getAnchorRequestId(),
				vbHash,
				mbHash,
			);

			// send the answer to the wallet
			const b64 = EncoderFactory.bytesToBase64Encoder();
			return {
				type: WalletInteractiveAnchoringResponseType.APPROVAL_SIGNATURE,
				b64MbHash: b64.encode(vbHash.toBytes()),
				b64VbHash: b64.encode(mbHash.toBytes()),
				height: appLedgerVb.getHeight(),
			}
		} catch (e) {
			throw e
		}
	}


	private async loadAnchorRequestFromDataId(dataId: string) {
		// load the initial anchor request and halts if the request is not pending
		const storedRequest = await this.anchorRequestService.findAnchorRequestByAnchorRequestId(dataId);
		if (!storedRequest.isPending()) throw new Error("Anchor request is not valid anymore.")
		return storedRequest;
	}

	private async loadApplicationFromAnchorRequest(storedRequest: AnchorRequestEntity) {
		const applicationVbId = storedRequest.application.vbId;
		this.logger.debug(`Loading application with vb id ${applicationVbId}`);
		const [application] = await Promise.all([
			this.applicationService.findApplicationByVbId(applicationVbId),
		])
		return { application };
	}

	private async loadWalletEntityFromApplication(application: ApplicationEntity) {
		return application.wallet;
	}
	private async loadAccountCryptoFromApplication(application: ApplicationEntity) {
		const wallet = application.wallet;
		const seed = new SeedEncoder().decode(wallet.seed);
		return WalletCrypto.fromSeed(seed).getDefaultAccountCrypto();

	}



	private async loadApplicationLedger(provider: Provider, application: ApplicationEntity, anchorRequest: AnchorRequestEntity): Promise<ApplicationLedgerVb> {
		const appLedgerVbId = anchorRequest.request.virtualBlockchainId;
		let appLedgerVb: ApplicationLedgerVb;
		if (appLedgerVbId) {
			this.logger.debug(`Loading application ledger ${appLedgerVbId} associated with application ${application.vbId}...`)
			appLedgerVb = await provider.loadApplicationLedgerVirtualBlockchain(Hash.fromHex(appLedgerVbId));
		} else {
			this.logger.debug(`Creating application ledger for application ${application.vbId}...`)
			appLedgerVb = ApplicationLedgerVb.createApplicationLedgerVirtualBlockchain(provider);
		}
		return appLedgerVb;
	}


	async getAnchorRequestFromAnchorRequestId(anchorRequestId: string) {
		return this.anchorRequestService.findAnchorRequestByAnchorRequestId(anchorRequestId);
	}

	private async getGasFromMicroblockAndSigningSchemeId(provider: Provider, mb: Microblock, signingSchemeId: SignatureSchemeId) {
		const protocolVariables = await provider.getProtocolState();
		const feesCalculationVersion = protocolVariables.getFeesCalculationVersion();
		const feesFormula = FeesCalculationFormulaFactory.getFeesCalculationFormulaByVersion(feesCalculationVersion);
		const gas = await feesFormula.computeFees(signingSchemeId, mb);
		return gas
	}

	async anchor(application: ApplicationEntity, anchorDto: AnchorDto) {

		// we first recover the crypto wallet for the organization
		const accountCrypto = await this.loadAccountCryptoFromApplication(application);
		const wallet = await this.loadWalletEntityFromApplication(application);
		const provider = wallet.getProvider();

		// we then load the application ledger if it is provided, otherwise we create a new application ledger
		let applicationLedgerVb = ApplicationLedgerVb.createApplicationLedgerVirtualBlockchain(provider);
		let isCreatingNewApplicationLedger = true;
		if (anchorDto.virtualBlockchainId) {
			applicationLedgerVb = await provider.loadApplicationLedgerVirtualBlockchain(Hash.fromHex(anchorDto.virtualBlockchainId));
			isCreatingNewApplicationLedger = false;
		}

		const organizationVbId = await this.loadOrganizationVbIdFromApplication(provider, application);
		const accountId = await this.loadAccountIdFromOrganizationVbId(provider, organizationVbId);

		// we construct the microblock builder
		const applicationId = Hash.fromHex(application.vbId);
		const mbBuilder = await WalletRequestBasedApplicationLedgerMicroblockBuilder.createFromVirtualBlockchain(applicationId, applicationLedgerVb);
		const mb = await mbBuilder.createMicroblockFromStateUpdateRequest(accountCrypto, {
			...anchorDto,
		})
		const organizationPrivateKey = await accountCrypto.getPrivateSignatureKey(SignatureSchemeId.SECP256K1);
		mb.setGasPrice(CMTSToken.createAtomic(1)) // TODO: use a source to define the gas price instead of constant
		mb.setGas(await this.getGasFromMicroblockAndSigningSchemeId(provider, mb, organizationPrivateKey.getSignatureSchemeId()))
		await mb.seal(organizationPrivateKey, {
			feesPayerAccount: accountId.toBytes()
		});
		const mbHash = await provider.publishMicroblock(mb);

		// compute the vb id
		const vbId = isCreatingNewApplicationLedger ? mbHash : applicationLedgerVb.getIdentifier();


		// create a new anchor request entry to save the interaction
		return this.anchorRequestService.createAndSaveCompletedAnchorRequest(
			vbId,
			mbHash,
			anchorDto,
			application
		);
	}

	async loadOrganizationVbIdFromApplication(provider: Provider, application: ApplicationEntity) {
		const applicationVbId = application.vbId;
		const applicationVb = await provider.loadApplicationVirtualBlockchain(Hash.from(applicationVbId));
		return applicationVb.getOrganizationId();
	}

	async loadAccountIdFromOrganizationVbId(provider: Provider, organizationId: Hash) {
		const orgVb = await provider.loadOrganizationVirtualBlockchain(organizationId);
		return orgVb.getAccountId();
	}

}