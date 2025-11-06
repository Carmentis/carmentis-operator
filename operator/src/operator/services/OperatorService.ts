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
	ApplicationLedger,
	ApplicationLedgerNotFoundError, ApplicationLedgerVb,
	ApplicationLedgerWrapper, Blockchain,
	BlockchainFacade, CMTSToken,
	CryptoEncoderFactory,
	EncoderFactory,
	Hash,
	MessageSerializer,
	MSG_ANS_ACTOR_KEY_REQUIRED, MSG_ANS_APPROVAL_DATA,
	MSG_ANS_APPROVAL_SIGNATURE, ProviderFactory, RecordPublicationExecutionContext,
	StringSignatureEncoder,
	WALLET_OP_MESSAGES,
} from '@cmts-dev/carmentis-sdk/server';

export interface ApprovalObject {
	approvalObject: AnchorWithWalletDto,
	vb: ApplicationLedgerVb
}

//const approvalData = new Map<string, ApprovalObject>();
/**
 * This map is used to store the application ledger under approval process (only after approval data being sent to the wallet).
 * The key is the anchor request ID.
 * The value is the ApplicationLedger instance.
 */
const applicationLedgerUnderApproval = new Map<string, ApplicationLedger>(); 

@Injectable()
export class OperatorService {


	constructor(
		private envService: EnvService,
		private anchorRequestService: AnchorRequestService,
		private organisationService: OrganisationService,
		private applicationService: ApplicationService,
	) {}


	private logger = new Logger(OperatorService.name);
	async createAnchorWithWalletSession( organisation: OrganisationEntity, application: ApplicationEntity, request: AnchorWithWalletDto ) {
		this.logger.debug("Initiating session to anchor with a wallet.")

		// check the anchor request by loading the virtual blockchain
		const blockchain = BlockchainFacade.createFromNodeUrl(this.envService.nodeUrl);
		const isVirtualBlockchainIdDefined = typeof request.virtualBlockchainId === 'string';
		if (isVirtualBlockchainIdDefined) {
			const appLedgerId = Hash.from(request.virtualBlockchainId);
			try {
				const appLedger = await blockchain.loadApplicationLedger(appLedgerId);
			} catch (e) {
				if (e instanceof ApplicationLedgerNotFoundError) {
					this.logger.error(`Virtual blockchain id ${appLedgerId.encode()} specified but cannot load: ${e}`)
				}
				throw e;
			}
		}


		// store the request
		const gasPrice = this.extractGasPrice(request);
		const storedRequest = await this.anchorRequestService.storeAnchorRequest(organisation, application, request, gasPrice);
		return { anchorRequestId: storedRequest.anchorRequestId }
	};


	async isPublished( anchorRequestId: string ) {
		const request = await this.anchorRequestService.findAnchorRequestByAnchorRequestId(anchorRequestId);
		return request.isCompleted();
	}

	async getVirtualBlockchainId( anchorRequestId: string ) {
		const request = await this.anchorRequestService.findAnchorRequestByAnchorRequestId(anchorRequestId);
	}

	/**
	 * This method is called when the wallet wants to proceed with the approval, starting with the handshake.
	 * @param req 
	 * @returns 
	 */
	async approvalHandshake(req: object) {

		// check that the request is well-formed
		const containsAnchorRequestId = 'anchorRequestId' in req;
		if (!containsAnchorRequestId) throw new BadRequestException("Missing anchor request ID");


		const rawDataId: Uint8Array = req.anchorRequestId as Uint8Array;
		const encoder = EncoderFactory.defaultBytesToStringEncoder();
		const anchorRequestId = encoder.encode(rawDataId);
		this.logger.debug(`AnchorRequestId ${anchorRequestId}: Proceeding to approval handshake`)

		// load the initial anchor request and halts if the request is not pending
		const storedRequest = await this.loadAnchorRequestFromDataId(anchorRequestId);
		const {application, organisation} = await this.loadApplicationAndOrganisationFromAnchorRequest(storedRequest);
		const organisationPrivateKey = organisation.getPrivateSignatureKey();
		const provider = ProviderFactory.createKeyedProviderExternalProvider(organisationPrivateKey, this.envService.nodeUrl);
		const blockchain = Blockchain.createFromProvider(provider);
		let applicationLedger = await this.loadApplicationLedger(blockchain, application, storedRequest.request);

		// if the actor key is missing, asks the wallet
		const endorser = storedRequest.request.endorser;
		if(applicationLedger.actorIsSubscribed(endorser)) {
			this.logger.debug("Endorser already subscribed")
		} else {
			this.logger.debug(`Endorser not subscribed: asking actor key to the wallet`);
			const genesisSeed = await applicationLedger.getGenesisSeed();
			const schemaSerializer = new MessageSerializer(WALLET_OP_MESSAGES);
			return schemaSerializer.serialize(
				MSG_ANS_ACTOR_KEY_REQUIRED,
				{ genesisSeed },
			);
		}


		this.logger.log("Sending approval data to the wallet")
		return await this.sendApprovalData(anchorRequestId, applicationLedger);
	}

	/**
	 * This method is called when the wallet sends the actor public keys for subscription.
	 * 
	 * @param req 
	 * @returns 
	 */
	async handleActorKeys(req: object) {
		// check the request id is contained in the request, otherwise halt
		const containsAnchorRequestId = 'anchorRequestId' in req;
		if (!containsAnchorRequestId) throw new BadRequestException("Missing anchor request ID");

		// parse the anchor request id
 		const rawDataId: Uint8Array = req.anchorRequestId as Uint8Array;
		const encoder = EncoderFactory.defaultBytesToStringEncoder();
		const anchorRequestId = encoder.encode(rawDataId);
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
		const decodedActorPublicSignatureKey = signatureEncoder.decodePublicKey(actorPublicSignatureKey);
		const pkeEncoder = CryptoEncoderFactory.defaultStringPublicKeyEncryptionEncoder();
		const decodedActorPublicEncryptionKey = pkeEncoder.decodePublicEncryptionKey(actorPublicEncryptionKey);

		// proceed to load the anchor request and send the approval data
		try {
			// recover the organization and application associated with the anchor request
			const storedRequest = await this.loadAnchorRequestFromDataId(anchorRequestId);
			const {application, organisation} = await this.loadApplicationAndOrganisationFromAnchorRequest(storedRequest);
			
			// decode the organization private key
			const organisationPrivateKey = organisation.getPrivateSignatureKey();

			// recover the application ledger 
			const provider = ProviderFactory.createKeyedProviderExternalProvider(organisationPrivateKey, this.envService.nodeUrl);
			const blockchain = Blockchain.createFromProvider(provider);
			let applicationLedger = await this.loadApplicationLedger(blockchain, application, storedRequest.request);

			// declare the public keys of the actor by adding a subscribe section
			// containing the name of the actor and its public keys on the application ledger
			const endorser = storedRequest.request.endorser;
			this.logger.debug(`Subscribing actor ${endorser} on the application ledger...`);
			await applicationLedger.subscribeActor(
				endorser,
				decodedActorPublicSignatureKey,
				decodedActorPublicEncryptionKey,
			);
			this.logger.debug(`Actor ${endorser} subscribed.`);

			return await this.sendApprovalData(anchorRequestId, applicationLedger);
		}
		catch(e) {
			console.error(e);
		}
	}


	/**
	 * This method is used to send the approval data to the wallet.
	 * 
	 * Note: When sending the approval data, the application ledger is not yet stored in the blockchain and is 
	 * stored in the applicationLedgerUnderApproval map until the signature is received from the wallet.
	 * 
	 * @param blockchain
	 * @param application 
	 * @param applicationLedger 
	 * @param approvalObject 
	 * @returns 
	 */
	async sendApprovalData(
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

	/**
	 * This method is called when the wallet sends the signature of the micro-block for approval.
	 * 
	 * @param req 
	 * @returns 
	 */
	async approvalSignature(req: object) {
		// check the request id is contained in the request, otherwise halt
		const containsAnchorRequestId = 'anchorRequestId' in req;
		if (!containsAnchorRequestId) throw new BadRequestException("Missing anchor request ID");

		// parse the anchor request id
		const rawDataId: Uint8Array = req.anchorRequestId as Uint8Array;
		const encoder = EncoderFactory.defaultBytesToStringEncoder();
		const anchorRequestId = encoder.encode(rawDataId);
		this.logger.debug(`Proceeding to approval signature with anchor request id = ${anchorRequestId}`)

		// parse the signature
		const containsSignature = 'signature' in req && req.signature instanceof Uint8Array;
		if (!containsSignature) throw new BadRequestException("Missing signature");

		try {
			// load the stored anchor request from the database
			const storedRequest = await this.loadAnchorRequestFromDataId(anchorRequestId);

			// load the organization private signature key
			const {organisation} = await this.loadApplicationAndOrganisationFromAnchorRequest(storedRequest);
			const organisationPrivateKey = organisation.getPrivateSignatureKey();
			

			// search for the application ledger under approval in the map
			const applicationLedger = applicationLedgerUnderApproval.get(anchorRequestId);
			if (!applicationLedger) {
				throw new Error(`No application ledger under approval found for anchor request id ${anchorRequestId}`);
			}
			// publish the micro-block
			const vb = applicationLedger.getVirtualBlockchain();
			await vb.addEndorserSignature(req.signature as Uint8Array);
			vb.setGasPrice(storedRequest.getGasPrice());
			await vb.signAsAuthor(organisationPrivateKey);
			const shouldWaitUntilPublished = false;
			const mb = await vb.publish(shouldWaitUntilPublished);

			// remove the application ledger from the map as the approval process is completed
			applicationLedgerUnderApproval.delete(anchorRequestId);

			// mark the stored request has completed
			const vbHash = vb.getId();
			const mbHash = mb.toBytes();
			await this.anchorRequestService.markAnchorRequestAsPublished(
				storedRequest.getAnchorRequestId(),
				Hash.from(vbHash),
				Hash.from(mbHash),
			);

			// send the answer to the wallet
			const schemaSerializer = new MessageSerializer(WALLET_OP_MESSAGES);
			return schemaSerializer.serialize(
				MSG_ANS_APPROVAL_SIGNATURE,
				{
					vbHash: vb.getId(),
					mbHash: mb.toBytes(),
					height: vb.getHeight(),
				},
			);
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
		const organisationId = storedRequest.organisationId;
		this.logger.debug(`Loading application with (local) id ${applicationId} and organisation with (local) id ${organisationId}`);
		const [application, organisation] = await Promise.all([
			this.applicationService.findApplication(applicationId),
			this.organisationService.findOne(organisationId)
		])
		this.logger.debug(`Application with (blockchain) id ${application.virtualBlockchainId} and organisation with (blockchain) id ${organisation.virtualBlockchainId}`);
		return {application, organisation};
	}


	private async loadApplicationLedger(blockchain: Blockchain, application: ApplicationEntity, approvalObject: AnchorWithWalletDto): Promise<ApplicationLedger> {
		const encoder = EncoderFactory.defaultBytesToStringEncoder();
		if (approvalObject.virtualBlockchainId) {
			this.logger.debug(`Loading application ledger ${approvalObject.virtualBlockchainId} associated with application ${application.virtualBlockchainId}...`)
		} else {
			this.logger.debug(`Loading application ledger associated with application ${application.virtualBlockchainId}...`)
		}

		const result = await blockchain.getApplicationLedgerFromJson({
			...approvalObject,
			applicationId: application.virtualBlockchainId
		});

		const id = result.getVirtualBlockchain().getId();
		if (id) {
			this.logger.debug(`Application ledger ${encoder.encode(id)} loaded`)
		} else {
			this.logger.debug(`New application ledger created`)
		}

		return result
	}


	async getAnchorRequestFromAnchorRequestId(anchorRequestId: string) {
		return this.anchorRequestService.findAnchorRequestByAnchorRequestId(anchorRequestId);
	}

	async anchor(application: ApplicationEntity, organisation: OrganisationEntity, anchorDto: AnchorDto) {

		// perform the anchoring
		const nodeUrl = this.envService.nodeUrl;
		const privateSignatureKey = organisation.getPrivateSignatureKey();
		const blockchain = BlockchainFacade.createFromNodeUrlAndPrivateKey(nodeUrl, privateSignatureKey);
		const gasPrice = this.extractGasPrice(anchorDto);
		const context = new RecordPublicationExecutionContext()
			.withGasPrice(gasPrice)
			.withRecord({
				...anchorDto,
				applicationId: application.virtualBlockchainId,
			});
		const microBlockHash = await blockchain.publishRecord(context);

		// create the anchor request
		const virtualBlockId = anchorDto.virtualBlockchainId !== undefined ?
			Hash.from(anchorDto.virtualBlockchainId) :
			Hash.from(microBlockHash.encode());

		// create a new anchor request entry to save the interaction
		return this.anchorRequestService.createAndSaveCompletedAnchorRequest(virtualBlockId, microBlockHash, anchorDto, organisation, application)
	}

	private extractGasPrice(anchorDto: AnchorDto) {
		const gasPriceInAtomic = anchorDto.gasPriceInAtomic;
		return gasPriceInAtomic !== undefined ?
			CMTSToken.oneCMTS() :
			CMTSToken.createAtomic(gasPriceInAtomic);
	}
}