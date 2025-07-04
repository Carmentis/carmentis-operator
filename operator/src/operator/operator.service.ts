import { Injectable, Logger } from '@nestjs/common';
import {
	ApplicationLedger,
	ApplicationLedgerVb, Blockchain,
	EncoderFactory, Hash, MessageSerializer,
	MSG_ANS_ACTOR_KEY_REQUIRED,
	MSG_ANS_APPROVAL_DATA, MSG_ANS_APPROVAL_SIGNATURE,
	ProviderFactory,
	Secp256k1PrivateSignatureKey, StringSignatureEncoder, WALLET_OP_MESSAGES,
} from '@cmts-dev/carmentis-sdk/server';
import { AnchorWithWalletDto } from './dto/anchor.dto';
import { VirtualBlockchainLoadingError } from './errors/anchor-error';
import { EnvService } from '../shared/services/env.service';
import { randomBytes } from 'crypto';
import { AnchorRequestService } from './services/anchor-request.service';
import { OrganisationEntity } from '../shared/entities/organisation.entity';
import { OrganisationService } from '../shared/services/organisation.service';
import { ApplicationEntity } from '../shared/entities/application.entity';
import { ApplicationService } from '../shared/services/application.service';
import { AnchorRequestEntity } from './entities/anchor-request.entity';

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

		// TODO: check the anchor request

		// load the virtual blockchain
		const provider = ProviderFactory.createInMemoryProviderWithExternalProvider(this.envService.nodeUrl);
		let vb = new ApplicationLedgerVb({provider});
		const isVirtualBlockchainIdDefined = typeof request.virtualBlockchainId === 'string';
		if (isVirtualBlockchainIdDefined) {
			const encoder = EncoderFactory.defaultBytesToStringEncoder();
			const applicationLedgerId = encoder.decode(request.virtualBlockchainId);
			try {
				await vb.load(applicationLedgerId);
			} catch (e) {
				this.logger.error(`Virtual blockchain id ${applicationLedgerId} specified but cannot load: ${e}`)
				throw new VirtualBlockchainLoadingError(request.virtualBlockchainId);
			}
		}

		// store the request
		const storedRequest = await this.anchorRequestService.storeAnchorRequest(organisation, application, request);
		return { dataId: storedRequest.dataId }

	};


	async isPublished( request: AnchorWithWalletDto ) {
		// TODO: isPublished
	}

	async approvalHandshake(req: object) {


		// check that the request is well-formed
		const containsDataId = 'dataId' in req;
		if (!containsDataId) {
			this.logger.error("Cannot proceed to approval handshake: request does not contain a data ID.")
			return;
		}


		const rawDataId: Uint8Array = req.dataId as Uint8Array;
		const encoder = EncoderFactory.defaultBytesToStringEncoder();
		const dataId = encoder.encode(rawDataId);
		this.logger.debug(`DataID ${dataId}: Proceeding to approval handshake`)

		// load the initial anchor request and halts if the request is not pending
		const storedRequest = await this.loadAnchorRequestFromDataId(dataId);
		const {application, organisation} = await this.loadApplicationAndOrganisationFromAnchorRequest(storedRequest);
		const signatureEncoder = StringSignatureEncoder.defaultStringSignatureEncoder();
		const organisationPrivateKey = signatureEncoder.decodePrivateKey(organisation.privateSignatureKey);
		const provider = ProviderFactory.createKeyedProviderExternalProvider(organisationPrivateKey, this.envService.nodeUrl);
		const blockchain = Blockchain.createFromProvider(provider);
		let applicationLedger = await this.loadApplicationLedger(blockchain, application, storedRequest.request);

		// if the actor key is missing, asks the wallet
		const endorser = storedRequest.request.endorser;
		if(!applicationLedger.actorIsSubscribed(endorser)) {
			this.logger.debug(`Endorser not subscribed: asking actor key to the wallet`);
			const genesisSeed = await applicationLedger.getGenesisSeed();
			const schemaSerializer = new MessageSerializer(WALLET_OP_MESSAGES);
			return schemaSerializer.serialize(
				MSG_ANS_ACTOR_KEY_REQUIRED,
				{ genesisSeed },
			);
		} else {
			this.logger.debug("Endorser already subscribed")
		}


		this.logger.log("Sending approval data to the wallet")
		return await this.sendApprovalData(blockchain, application, applicationLedger.getVirtualBlockchain(), storedRequest.request);
	}

	async approvalActorKey(req) {

		const rawDataId: Uint8Array = req.dataId as Uint8Array;
		const encoder = EncoderFactory.defaultBytesToStringEncoder();
		const dataId = encoder.encode(rawDataId);
		this.logger.debug(`Proceeding to approval actor key with dataId = ${dataId}`)

		try {
			const storedRequest = await this.loadAnchorRequestFromDataId(dataId);
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

	async approvalSignature(req, gasPrice: number) {
		const rawDataId: Uint8Array = req.dataId as Uint8Array;
		const encoder = EncoderFactory.defaultBytesToStringEncoder();
		const dataId = encoder.encode(rawDataId);
		this.logger.debug(`Proceeding to approval signature with dataId = ${dataId}`)

		try {
			const storedRequest = await this.loadAnchorRequestFromDataId(dataId);
			const {application, organisation} = await this.loadApplicationAndOrganisationFromAnchorRequest(storedRequest);
			const signatureEncoder = StringSignatureEncoder.defaultStringSignatureEncoder();
			const organisationPrivateKey = signatureEncoder.decodePrivateKey(organisation.privateSignatureKey);
			const provider = ProviderFactory.createKeyedProviderExternalProvider(organisationPrivateKey, this.envService.nodeUrl);
			const blockchain = Blockchain.createFromProvider(provider);
			let applicationLedger = await this.loadApplicationLedger(blockchain, application, storedRequest.request);
			const vb = applicationLedger.getVirtualBlockchain();
			const privateSignatureKey = signatureEncoder.decodePrivateKey(organisation.privateSignatureKey);


			// publish the micro-block
			await vb.addEndorserSignature(req.signature);
			vb.setGasPrice(gasPrice);
			await vb.signAsAuthor(privateSignatureKey);
			let mb = await vb.publish();

			// mark the stored request has completed
			await this.anchorRequestService.markAnchorRequestAsCompleted(storedRequest)

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

		// the sending approval data works only with keyed provider
		if (!blockchain.isKeyed()) throw new Error("Approval data can only be sent with a keyed provider");


		try {
			const encoder = EncoderFactory.defaultBytesToStringEncoder();

			// form the request
			const request = {...approvalObject, applicationId: application.virtualBlockchainId};
			const vbIdentifier = vb.getId();
			if (vbIdentifier !== undefined) {
				request.virtualBlockchainId = encoder.encode(vbIdentifier);
			}

			this.logger.debug(`sendApprovalData: virtual blockchain identifier = ${vbIdentifier}` )
			// @ts-ignore
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
		const storedRequest = await this.anchorRequestService.findAnchorRequestByDataId(dataId);
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


}