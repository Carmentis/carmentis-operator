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
import {} from '@cmts-dev/carmentis-sdk/server';
import { Public } from '../workspace/decorators/public.decorator';
import { PrepareUserApprovalDto } from './dto/prepare-user-approval.dto';
import { OrganisationService } from '../shared/services/organisation.service';
import { EnvService } from '../shared/services/env.service';
import {
	EncoderFactory,
	MessageUnserializer, MSG_ACTOR_KEY, MSG_APPROVAL_HANDSHAKE,
	MSG_APPROVAL_SIGNATURE, TOKEN,
	WALLET_OP_MESSAGES,
} from '@cmts-dev/carmentis-sdk/server';
import { OrganisationEntity } from '../shared/entities/organisation.entity';
import { ApplicationService } from '../shared/services/application.service';
import PackageConfigService from '../package.service';
import { ApiKeyService } from '../shared/services/api-key.service';
import { ApiKeyGuard } from '../shared/guards/api-key-guard';
import { AnchorDto, AnchorWithWalletDto } from './dto/anchor.dto';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ApiKey } from '../workspace/decorators/api-key.decorator';
import { ApiKeyEntity } from '../shared/entities/api-key.entity';
import { OperatorService } from './operator.service';
import { randomBytes } from 'crypto';


@Controller('/api')
export class OperatorApiController{

	private base64Encoder = EncoderFactory.bytesToBase64Encoder();
	private organisationIdByDataId : Map<string, string> = new Map();
	private logger = new Logger(OperatorApiController.name);
	private readonly nodeUrl: string;
	constructor(
		private readonly envService: EnvService,
		private readonly organisationService: OrganisationService,
		private readonly applicationService: ApplicationService,
		private readonly packageService: PackageConfigService,
		private readonly apiKeyService: ApiKeyService,
		private readonly operatorService: OperatorService,
	) {
		this.nodeUrl = envService.nodeUrl;
	}


	@Public()
	@Get()
	index(): string {
		return 'Carmentis Operator v' + this.packageService.operatorVersion
	}

	@ApiOperation({
		summary: 'Hello request handler.',
		description: 'This endpoint is used to check the online status of the server and the correct API key functionality.'
	})
	@Get('/hello')
	async hello() {
		return { message: 'Hello' };
	}

	@ApiOperation({
		summary: 'Public hello request handler.',
		description: 'This endpoint is used to check the online status of the server.'
	})
	@Public()
	@Get('/public/hello')
	async publicHello() {
		return { message: 'Hello Anonymous' };
	}



	@ApiOperation({
		summary: 'Initiate an anchor request',
		description: 'This endpoint is used by the server to initiate an anchoring request that should be accepted by a wallet.'
	})
	@ApiBody({ type: AnchorWithWalletDto })
	@Post('/anchorWithWallet')
	async anchorWithWallet(
		@Body() anchorDto: AnchorWithWalletDto,
		@ApiKey() key: ApiKeyEntity,
	) {

		// find application and organization associated with the provided api key
		const application = await this.apiKeyService.findApplicationByApiKey(key);
		const organisation = await this.applicationService.getOrganisationByApplicationId(application.id);

		return this.operatorService.createAnchorWithWalletSession(organisation, application, anchorDto);
	}

	@Public()
	@Post("/walletMessage")
	async handleWalletMessage(
		@Req() req: Request,
		@Body("data") data : string
	) {

		// we generate a unique session identifier to help debugging
		const sessionId = randomBytes(8).toString("hex");

		// parse the request
		this.logger.debug(`[${sessionId}] Parsing request`)
		const encoder = EncoderFactory.defaultBytesToStringEncoder();
		const serializer = new MessageUnserializer(WALLET_OP_MESSAGES);
		let {type, object} = serializer.unserialize(encoder.decode(data));


		// handle the request
		this.logger.debug(`[${sessionId}] Handling request type ${type}`)
		let answer: Uint8Array;
		switch(type) {
			case MSG_APPROVAL_HANDSHAKE: {
				this.logger.debug(`[${sessionId}] Entering approval handshake`)
				answer = await this.operatorService.approvalHandshake(object);
				break
			}
			case MSG_ACTOR_KEY: {
				this.logger.debug(`[${sessionId}] Entering approval actor key`)
				answer = await this.operatorService.approvalActorKey(object);
				break;
			}
			case MSG_APPROVAL_SIGNATURE:
				this.logger.debug(`[${sessionId}] Entering approval signature`)
				answer = await this.operatorService.approvalSignature(object, TOKEN);
				break;
			default:
				const errorMessage = `Unknown request type: ${type}`
				this.logger.error(errorMessage)
				throw new BadRequestException(errorMessage);
		}


		this.logger.debug(`[${sessionId}] Request handled: answer: ${object}`)
		return {
			success: true,
			data: encoder.encode(answer)
		}
	}






	@ApiOperation({
		summary: 'Initiate an anchor request',
		description: 'This endpoint is used by the server to initiate an anchoring request that should be accepted by a wallet.'
	})
	@Post('/anchor')
	async anchor(
		@Body() anchorDto: AnchorDto,
		@ApiKey() key: ApiKeyEntity,
	) {
		// TODO: implement
	}




}