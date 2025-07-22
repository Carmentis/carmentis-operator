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

const approvalData = new Map<string, ApprovalObject>();
@Injectable()
export class OperatorService {


	constructor(
		private envService: EnvService,
		private anchorRequestService: AnchorRequestService,
		private organisationService: OrganisationService,
		private applicationService: ApplicationService,
	) {

	}


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
		const storedRequest = await this.anchorRequestService.storeAnchorRequest(organisation, application, request);
		return { anchorRequestId: storedRequest.anchorRequestId }
	};


	async isPublished( anchorRequestId: string ) {
		const request = await this.anchorRequestService.findAnchorRequestByAnchorRequestId(anchorRequestId);
		return request.isCompleted();
	}

	async getVirtualBlockchainId( anchorRequestId: string ) {
		const request = await this.anchorRequestService.findAnchorRequestByAnchorRequestId(anchorRequestId);
	}

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
		const signatureEncoder = StringSignatureEncoder.defaultStringSignatureEncoder();
		const organisationPrivateKey = signatureEncoder.decodePrivateKey(organisation.privateSignatureKey);
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
		return await this.sendApprovalData(blockchain, application, applicationLedger.getVirtualBlockchain(), storedRequest.request);
	}

	async approvalActorKey(req: object) {

		const containsAnchorRequestId = 'anchorRequestId' in req;
		if (!containsAnchorRequestId) throw new BadRequestException("Missing anchor request ID");
 		const rawDataId: Uint8Array = req.anchorRequestId as Uint8Array;
		const encoder = EncoderFactory.defaultBytesToStringEncoder();
		const anchorRequestId = encoder.encode(rawDataId);
		this.logger.debug(`Proceeding to approval actor key with dataId = ${anchorRequestId}`)

		try {
			const storedRequest = await this.loadAnchorRequestFromDataId(anchorRequestId);
			const {application, organisation} = await this.loadApplicationAndOrganisationFromAnchorRequest(storedRequest);
			const signatureEncoder = StringSignatureEncoder.defaultStringSignatureEncoder();
			const organisationPrivateKey = signatureEncoder.decodePrivateKey(organisation.privateSignatureKey);
			const provider = ProviderFactory.createKeyedProviderExternalProvider(organisationPrivateKey, this.envService.nodeUrl);
			const blockchain = Blockchain.createFromProvider(provider);
			let applicationLedger = await this.loadApplicationLedger(blockchain, application, storedRequest.request);


			return await this.sendApprovalData(blockchain, application, applicationLedger.getVirtualBlockchain(), storedRequest.request);
		}
		catch(e) {
			console.error(e);
		}
	}

	async approvalSignature(req: object, gasPrice: CMTSToken) {
		// parse the anchor request id
		const containsAnchorRequestId = 'anchorRequestId' in req;
		if (!containsAnchorRequestId) throw new BadRequestException("Missing anchor request ID");
		const rawDataId: Uint8Array = req.anchorRequestId as Uint8Array;
		const encoder = EncoderFactory.defaultBytesToStringEncoder();
		const dataId = encoder.encode(rawDataId);
		this.logger.debug(`Proceeding to approval signature with dataId = ${dataId}`)

		// parse the signature
		const containsSignature = 'signature' in req && req.signature instanceof Uint8Array;
		if (!containsSignature) throw new BadRequestException("Missing signature");

		try {
			const storedRequest = await this.loadAnchorRequestFromDataId(dataId);
			const {application, organisation} = await this.loadApplicationAndOrganisationFromAnchorRequest(storedRequest);
			const signatureEncoder = StringSignatureEncoder.defaultStringSignatureEncoder();
			const organisationPrivateKey = signatureEncoder.decodePrivateKey(organisation.privateSignatureKey);
			const provider = ProviderFactory.createKeyedProviderExternalProvider(organisationPrivateKey, this.envService.nodeUrl);
			const blockchain = Blockchain.createFromProvider(provider);
			//const blockchain = BlockchainFacade.createFromNodeUrlAndPrivateKey(this.envService.nodeUrl, organisationPrivateKey);
			const applicationLedger = await this.loadApplicationLedger(blockchain, application, storedRequest.request);
			const privateSignatureKey = signatureEncoder.decodePrivateKey(organisation.privateSignatureKey);


			// publish the micro-block
			const vb = applicationLedger.getVirtualBlockchain();
			await vb.addEndorserSignature(req.signature as Uint8Array);
			vb.setGasPrice(gasPrice);
			await vb.signAsAuthor(privateSignatureKey);
			let mb = await vb.publish();

			// mark the stored request has completed
			const vbHash = vb.getId();
			const mbHash = mb.toBytes();
			await this.anchorRequestService.markAnchorRequestAsPublished(
				storedRequest.getAnchorRequestId(),
				Hash.from(vbHash),
				Hash.from(mbHash),
			);

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

	async sendApprovalData(blockchain: Blockchain, application: ApplicationEntity, vb: ApplicationLedgerVb, approvalObject: AnchorWithWalletDto) {
		this.logger.debug(`Sending approval data`);

		try {
			// form the request
			const request = {...approvalObject, applicationId: application.virtualBlockchainId};

			if (vb.isVirtualBlockchainIdDefined()) {
				const vbIdentifier = Hash.from(vb.getId());
				request.virtualBlockchainId = vbIdentifier.encode();
				this.logger.debug(`sendApprovalData: virtual blockchain identifier = ${vbIdentifier.encode()}` )
			} else {
				this.logger.debug(`sendApprovalData: new virtual blockchain ` )
			}

			const applicationLedger = await blockchain.getApplicationLedgerFromJson(request)

			console.log(`generateDataSections() succeeded`);

			//let mb = await vb.getMicroblock(vb.height);
			//let mb = vb.getMicroblockData()
			let mb = applicationLedger.getMicroblockData();

			console.log(`sending block data (${mb.length} bytes)`);
			const schemaSerializer = new MessageSerializer(WALLET_OP_MESSAGES);
			return schemaSerializer.serialize(
				MSG_ANS_APPROVAL_DATA,
				{
					data: mb
				}
			);
		}
		catch(e) {
			console.error(e);
			throw e;
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
		const context = new RecordPublicationExecutionContext()
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
}