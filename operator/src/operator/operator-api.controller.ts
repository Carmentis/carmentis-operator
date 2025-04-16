import {
	BadRequestException,
	Body,
	Controller, Get,
	InternalServerErrorException,
	Logger,
	NotFoundException, Param,
	Post, Query,
	Req,
	UnprocessableEntityException, UseGuards,
} from '@nestjs/common';
import * as sdk from '@cmts-dev/carmentis-sdk/server';
import { Public } from '../workspace/decorators/public.decorator';
import { PrepareUserApprovalDto } from './dto/prepare-user-approval.dto';
import { OrganisationService } from '../shared/services/organisation.service';
import { EnvService } from '../shared/services/env.service';
import { base64 } from '@cmts-dev/carmentis-sdk/server';
import { OrganisationEntity } from '../shared/entities/organisation.entity';
import { ApplicationService } from '../shared/services/application.service';
import PackageConfigService from '../package.service';
import { ApiKeyService } from '../shared/services/api-key.service';
import { ApiKeyGuard } from '../shared/guards/api-key-guard';


@Controller('/api')
export class OperatorApiController{

	private organisationIdByDataId : Map<string, string> = new Map();
	private logger = new Logger(OperatorApiController.name);
	private readonly nodeUrl: string;
	constructor(
		private readonly envService: EnvService,
		private readonly organisationService: OrganisationService,
		private readonly applicationService: ApplicationService,
		private readonly packageService: PackageConfigService,
		private readonly apiKeyService: ApiKeyService,
	) {
		this.nodeUrl = envService.nodeUrl;
	}

	@Public()
	@Get()
	index(): string {
		return 'Carmentis Operator v' + this.packageService.operatorVersion
	}

	//@UseGuards(ApiKeyGuard)
	@Public()
	@Get('/hello')
	async hello() {
		return { message: 'Hello' };
	}



	@Public()
	@Post("/prepareUserApproval")
	async handleRequest(
		@Body() data: PrepareUserApprovalDto
	) {
		this.logger.debug("Handling prepareUserApproval")

		let organisation;
		try {
			organisation = await this.organisationService.findOrganisationFromApplicationVirtualBlockchainId(data.applicationId);
		} catch (e) {
			this.logger.debug(`Cannot find the organisation related to the application having ID ${data.applicationId} (${e})`)
			throw new NotFoundException(e);
		}

		const nodeUrl = this.envService.nodeUrl;
		const organisationId = organisation.virtualBlockchainId;
		const organisationPrivateKey = organisation.privateSignatureKey;

		if (!organisationId) throw new BadRequestException("The organisation is not published yet");

		const core = new sdk.operatorCore(
			nodeUrl,
			organisationId,
			organisationPrivateKey
		);

		const result = await core.prepareUserApproval({
			...data.data,
			appLedgerId: data.appLedgerVirtualBlockchainId
		});
		const dataId = result.data.dataId;
		if (typeof dataId !== 'string') {
			const error = result.error;
			this.logger.debug(`Invalid data id: Expected string, got ${dataId}`)
			this.logger.error("/prepareUserApproval: Error:", error)
			throw new BadRequestException(error);
		}
		this.logger.debug(`data id ${dataId} -> virtual blockchain id ${organisationId}`)
		this.organisationIdByDataId.set(dataId, organisationId);
		return result;
	}

	@Public()
	@Post("/operatorMessage")
	async operatorMessage(
		@Req() req: Request,
		@Body("data") data : any
	) {
		if (data === undefined) {
			this.logger.error('/operatorMessage: no data received:', req)
			throw new InternalServerErrorException("No data received")
		}
		this.logger.log('Operator API: /operatorMessage: ', data)
		let binaryResponse = await this.processOperatorMessage(base64.decodeBinary(data, base64.BASE64));
		return {
			response: base64.encodeBinary(binaryResponse, base64.BASE64, undefined)
		};
	}

	@Public()
	@Post("/walletMessage")
	async walletMessage(
		@Req() req: Request,
		@Body("data") data : any
	) {
		if (data === undefined) {
			this.logger.error('/operatorMessage: no data received:', req)
			throw new InternalServerErrorException("No data received")
		}
		this.logger.log('Operator API: /walletMessage: ', data)
		let binaryResponse = await this.processWalletMessage( base64.decodeBinary(data, base64.BASE64));
		if (!binaryResponse) {
			this.logger.error('No binary response received')
			throw new BadRequestException()
		}
		return {
			response: base64.encodeBinary(binaryResponse, base64.BASE64, undefined)
		};
	}

	/**
	 * Loads an organisation using the provided data request.
	 *
	 * @return {Promise<any>} A promise that resolves to the organisation object if found, or rejects with a NotFoundException if no organisation is associated with the given `dataId`.
	 */
	async loadOrganisationFromDataId(dataId : string): Promise<any> {
		const organisationId = this.organisationIdByDataId.get(dataId);
		this.logger.log(`access data id ${dataId} -> organisation virtual blockchain id ${organisationId}`)
		const errorMessage = `No organisation id has been stored with data id ${dataId}`;
		if (organisationId === undefined) {
			this.logger.error(errorMessage);
			throw new NotFoundException(errorMessage);
		}

		this.logger.log(`searching organisation from organisation id: ${organisationId}`);
		return await this.organisationService.findOrganisationFromVirtualBlockchainId(organisationId);
	}

	createOperatorCoreInstanceFromOrganisation( org : OrganisationEntity ) {
		return  new sdk.operatorCore(this.nodeUrl, org.virtualBlockchainId, org.privateSignatureKey);
	}

	async processOperatorMessage( msg: any) {

		let answer;
		let [ id, object ] = sdk.serializers.schemaSerializer.decodeMessage(msg, sdk.constants.SCHEMAS.OP_OP_MESSAGES);
		this.logger.log("processOperatorMessage:", id, object)
		const dataId = object.dataId;
		if (typeof dataId !== 'string') throw new BadRequestException(`Invalid dataId: Expected string, got ${typeof dataId}`);
		const organisation : OrganisationEntity = await this.loadOrganisationFromDataId(dataId);
		const core = this.createOperatorCoreInstanceFromOrganisation(organisation);
		switch(id) {
			case sdk.constants.SCHEMAS.MSG_SUBMIT_ORACLE_REQUEST: {
				answer = await core.receivedOracleRequest(object);
				break;
			}
			// TODO add default
		}



		return answer;
	}

	async processWalletMessage(msg: any) {
		let answer;

		let [ id, object ] = sdk.serializers.schemaSerializer.decodeMessage(msg, sdk.constants.SCHEMAS.WALLET_OP_MESSAGES);
		this.logger.log("processWalletMessage:", id, object)
		const dataId = object.dataId;
		if (typeof dataId !== 'string') throw new BadRequestException(`Invalid dataId: Expected string, got ${typeof dataId}`);
		const organisation : OrganisationEntity = await this.loadOrganisationFromDataId(dataId);
		const core = this.createOperatorCoreInstanceFromOrganisation(organisation);

		switch(id) {
			case sdk.constants.SCHEMAS.MSG_APPROVAL_HANDSHAKE: {
				answer = await core.approvalHandshake(object);
				break;
			}
			case sdk.constants.SCHEMAS.MSG_ACTOR_KEY: {
				answer = await core.approvalActorKey(object);
				break;
			}
			case sdk.constants.SCHEMAS.MSG_APPROVAL_SIGNATURE:
				answer = await core.approvalSignature(object, sdk.constants.ECO.TOKEN);
				break;
			default:
				const errorMessage = `Unknown request type: ${id}`
				this.logger.error(errorMessage)
				throw new BadRequestException(errorMessage);
		}

		return answer
	}

}