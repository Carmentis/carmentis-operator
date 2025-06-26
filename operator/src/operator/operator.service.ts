import { Injectable, Logger } from '@nestjs/common';
import {
	ApplicationLedgerVb, Blockchain,
	EncoderFactory, MessageSerializer,
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
	) {

	}


	private logger = new Logger(OperatorService.name);
	async createAnchorWithWalletSession( organisation: OrganisationEntity, request: AnchorWithWalletDto ) {
		this.logger.debug("Initiating session to anchor with a wallet.")

		// TODO: check the anchor request

		// load the virtual blockchain
		const provider = ProviderFactory.createInMemoryProviderWithExternalProvider(this.envService.nodeUrl);
		let vb = new ApplicationLedgerVb({provider});
		const isVirtualBlockchainIdDefined = typeof request.applicationId === 'string';
		if (isVirtualBlockchainIdDefined) {
			const applicationLedgerId = request.applicationId;
			try {
				await vb.load(applicationLedgerId);
			} catch (e) {
				this.logger.error(`Virtual blockchain id ${applicationLedgerId} specified but cannot load: ${e}`)
				throw new VirtualBlockchainLoadingError(applicationLedgerId)
			}
		}

		// store the request
		const storedRequest = await this.anchorRequestService.storeAnchorRequest(organisation, request);
		return {
			success: true,
			error: "",
			data: { dataId: storedRequest.dataId },
		};


		/*
		// TODO: check the endorser
		const endorser = request.endorser;
		if(!vb.isEndorserSubscribed(endorser)) {
			// if the endorser does not yet belong to the ledger, create a random actor public key while waiting for the real one
			const endorserActorPrivateKey = Secp256k1PrivateSignatureKey.gen();
			const endorserPublicKey = endorserActorPrivateKey.getPublicKey();

			vb.setEndorserActorPublicKey(endorserActorPublicKey);
		}

		// this will throw an exception if 'approvalObject' is inconsistent
		const approvalObject = {}
		await vb.generateDataSections(approvalObject);

		 */


	};


	async isPublished( request: AnchorWithWalletDto ) {
		// TODO: isPublished
	}

	/*
	async prepareUserApproval(approvalObject) {
		console.log("Entering prepareUserApproval()");

		// Attempt to create all sections. The resulting microblock is ignored but this is a way to make sure that 'approvalObject'
		// is valid and consistent. We abort the request right away if it's not.
		try {
			let vb = await this.loadApplicationLedger(approvalObject.appLedgerId);

			if(!vb.isEndorserSubscribed(approvalObject.approval.endorser)) {
				// if the endorser does not yet belong to the ledger, create a random actor public key while waiting for the real one
				let endorserActorPrivateKey = crypto.generateKey256(),
					endorserActorPublicKey = crypto.secp256k1.publicKeyFromPrivateKey(endorserActorPrivateKey);

				vb.setEndorserActorPublicKey(endorserActorPublicKey);
			}

			// this will throw an exception if 'approvalObject' is inconsistent
			await vb.generateDataSections(approvalObject);

			// save 'approvalObject' associated to a random data ID and return this ID to the client
			let dataId = uint8.toHexa(crypto.getRandomBytes(32));

			approvalData.set(dataId, { approvalObject });

			console.log(`approvalObject successfully verified and stored with dataId = ${dataId}`);

			return this.successAnswer({
				dataId: dataId
			});
		}
		catch(e) {
			return this.errorAnswer(e);
		}
	}

	 */

	async approvalHandshake(req) {
		console.log(`Entering approvalHandshake() with dataId = ${req.dataId}`);

		try {
			const storedRequest = await this.anchorRequestService.findAnchorRequestByDataId(req.dataId);
			let vb = await this.loadApplicationLedger(storedRequest.request.applicationId);
			/*
			if(!vb.isEndorserSubscribed(approvalObject.endorser)) {
				console.log(`Endorser not subscribed: asking actor key to the wallet`);

				const schemaSerializer = new MessageSerializer(WALLET_OP_MESSAGES);
				return schemaSerializer.serialize(
					MSG_ANS_ACTOR_KEY_REQUIRED,
					{
						genesisSeed: vb.state.genesisSeed
					},
				);
			}

			 */

			return await this.sendApprovalData(vb, storedRequest.request);
		}
		catch(e) {
			console.error(e);
		}
	}

	async approvalActorKey(req) {
		try {
			const storedObject = await this.anchorRequestService.findAnchorRequestByDataId(req.dataId);
			const approvalObject = storedObject.request;
			const provider = ProviderFactory.createInMemoryProviderWithExternalProvider(this.envService.nodeUrl);
			const vb = new ApplicationLedgerVb({provider});
			if (approvalObject.applicationId) {
				await vb.load(approvalObject.applicationId);
			}
			//vb.setEndorserActorPublicKey(req.actorKey);
			return await this.sendApprovalData(vb, approvalObject);
		}
		catch(e) {
			console.error(e);
		}
	}

	async approvalSignature(req, gasPrice: number) {
		console.log(`Entering approvalSignature() with dataId = ${req.dataId}`);

		try {
			const dataId = req.dataId;
			const storedRequest = await this.anchorRequestService.findAnchorRequestByDataId(dataId);
			const organisationId = storedRequest.organisationId;
			const organisation = await this.organisationService.findOne(organisationId);
			const signatureEncoder = StringSignatureEncoder.defaultStringSignatureEncoder();
			const privateSignatureKey = signatureEncoder.decodePrivateKey(organisation.privateSignatureKey);
			let storedObject = approvalData.get(req.dataId);

			if(!storedObject) {
				throw "invalid data ID";
			}

			let { approvalObject, vb } = storedObject;

			console.log(`approvalObject:`);
			console.log(approvalObject);
			console.log(`VB instance:`);
			console.log(vb);

			if(!vb) {
				throw "no VB is associated to this data ID";
			}

			// TODO: fix bug: await vb.addEndorserSignature(req.signature);
			//await vb.addEndorserSignature(req.signature);
			vb.setGasPrice(gasPrice);
			await vb.signAsAuthor(privateSignatureKey);

			let mb = await vb.publish();

			approvalData.delete(req.dataId);

			const schemaSerializer = new MessageSerializer(WALLET_OP_MESSAGES);
			return schemaSerializer.serialize(
				MSG_ANS_APPROVAL_SIGNATURE,
				{
					vbHash: vb.identifier,
					mbHash: mb,
					height: vb.height
				},
			);
		}
		catch(e) {
			console.error(e);
		}
	}

	async sendApprovalData(vb: ApplicationLedgerVb, approvalObject: AnchorWithWalletDto) {
		console.log(`Sending approval data`);


		try {
			//TODO await vb.generateDataSections(approvalObject);
			const provider = ProviderFactory.createInMemoryProviderWithExternalProvider(this.envService.nodeUrl);
			const blockchain = new Blockchain(provider);
			// @ts-ignore
			const applicationLedger = await blockchain.getApplicationLedgerFromJson(approvalObject)


			console.log(`generateDataSections() succeeded`);

			//let mb = await vb.getMicroblock(vb.height);
			let mb = vb.getMicroblockData()

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
		}
	}


	async loadApplicationLedger(id: string): Promise<ApplicationLedgerVb> {
		const provider = ProviderFactory.createInMemoryProviderWithExternalProvider(this.envService.nodeUrl);
		const vb = new ApplicationLedgerVb({provider});
		if (typeof id === 'string') {
			await vb.load(id);
		}
		return vb;
	}


}