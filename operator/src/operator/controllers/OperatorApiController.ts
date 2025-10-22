import { BadRequestException, Body, Controller, Get, Logger, Param, Post, Req } from '@nestjs/common';
import {
	CarmentisError,
	CMTSToken,
	EncoderFactory,
	MessageUnserializer,
	MSG_ACTOR_KEY,
	MSG_APPROVAL_HANDSHAKE,
	MSG_APPROVAL_SIGNATURE,
	WALLET_OP_MESSAGES,
} from '@cmts-dev/carmentis-sdk/server';
import { Public } from '../../shared/decorators/PublicDecorator';
import { EnvService } from '../../shared/services/EnvService';
import { ApplicationService } from '../../shared/services/ApplicationService';
import { ApiKeyService } from '../../shared/services/ApiKeyService';
import { AnchorDto, AnchorWithWalletDto } from '../dto/AnchorDto';
import {
	ApiAcceptedResponse,
	ApiBody,
	ApiCreatedResponse,
	ApiExcludeEndpoint,
	ApiForbiddenResponse,
	ApiOperation,
	ApiResponse, ApiSecurity,
} from '@nestjs/swagger';
import { ApiKey } from '../decorators/ApiKeyDecorator';
import { ApiKeyEntity } from '../../shared/entities/ApiKeyEntity';
import { OperatorService } from '../services/OperatorService';
import { randomBytes } from 'crypto';
import { HelloResponseDto } from '../dto/HelloResponseDto';
import { AnchorRequestResponseDto } from '../dto/AnchorRequestResponseDto';
import { AnchorRequestStatusResponseDto } from '../dto/AnchorRequestStatusResponseDto';


/**
 * Controller for handling operator-related API requests.
 * Provides endpoints for server health checks, anchoring operations, and wallet message handling.
 */
@Controller('/api')
export class OperatorApiController{

	private logger = new Logger(OperatorApiController.name);
	constructor(
		private readonly applicationService: ApplicationService,
		private readonly apiKeyService: ApiKeyService,
		private readonly operatorService: OperatorService,
	) {}






	/**
	 * Handles the '/hello' endpoint request.
	 * This method serves as a health check to confirm server online status
	 * and validate the functionality of the provided API key.
	 *
	 * @return {Promise<HelloResponseDto>} A promise that resolves to an object containing the hello message.
	 */
	@Get('/hello')
	@ApiOperation({
		summary: 'Hello request handler.',
		description: 'This endpoint is used to check the online status of the server and the correct API key functionality.',
	})
	@ApiResponse({
		status: 200,
		description: 'OK',
		type: HelloResponseDto
	})
	@ApiSecurity('api-key')
	async hello(): Promise<HelloResponseDto> {
		return { message: 'Hello world!' };
	}



	@Public()
	@Get('/public/hello')
	@ApiOperation({
		summary: 'Public hello request handler.',
		description: 'This endpoint is used to check the online status of the server.'
	})
	@ApiResponse({
		status: 200,
		description: 'OK',
		type: HelloResponseDto
	})
	@ApiForbiddenResponse({
		description: "Invalid API key used.",
	})
	async publicHello() {
		return { message: 'Hello world!' };
	}



	@ApiOperation({
		summary: 'Initiate an anchor request',
		description: 'This endpoint is used by the server to initiate an anchoring request that should be accepted by a wallet.'
	})
	@ApiBody({ type: AnchorWithWalletDto })
	@ApiCreatedResponse({
		description: 'Anchoring session created',
		type: AnchorRequestResponseDto
	})
	@ApiSecurity('api-key')
	@Post('/anchorWithWallet')
	async anchorWithWallet(
		@Body() anchorDto: AnchorWithWalletDto,
		@ApiKey() key: ApiKeyEntity,
	): Promise<AnchorRequestResponseDto> {
		try {

			// find application and organization associated with the provided api key
			const application = await this.apiKeyService.findApplicationByApiKey(key);
			const organisation = await this.applicationService.getOrganisationByApplicationId(application.id);

			return this.operatorService.createAnchorWithWalletSession(organisation, application, anchorDto);

		} catch (e) {
			if (CarmentisError.isCarmentisError(e)) {
				throw e
			} else {
				this.logger.error("An error occurred while processing anchoring with wallet request: ", e)
				throw e;
			}
		}
	}







	@ApiOperation({
		summary: 'Initiate an anchor request',
		description: 'This endpoint is used by the server to initiate an anchoring request that should be accepted by a wallet.'
	})
	@ApiCreatedResponse({
		description: 'The anchoring request has been accepted.',
		type: AnchorRequestResponseDto
	})
	@ApiSecurity('api-key')
	@Post('/anchor')
	async anchor(
		@Body() anchorDto: AnchorDto,
		@ApiKey() key: ApiKeyEntity,
	): Promise<AnchorRequestResponseDto> {
		// find application and organization associated with the provided api key
		const application = await this.apiKeyService.findApplicationByApiKey(key);
		const organisation = await this.applicationService.getOrganisationByApplicationId(application.id);
		const anchorRequest = await this.operatorService.anchor(application, organisation, anchorDto);
		return {
			anchorRequestId: anchorRequest.anchorRequestId
		}
	}



	@ApiOperation({
		summary: 'Returns the status of an anchor request',
		description: 'This endpoint is used to track the publication status of an anchor request.'
	})
	@ApiResponse({
		status: 200,
		description: 'Returns the status of an anchor request.',
		type: AnchorRequestStatusResponseDto
	})
	@ApiSecurity('api-key')
	@Get('/anchor/status/:anchorRequestId')
	async getAnchorRequestStatus(
		@Param('anchorRequestId') anchorRequestId: string,
		@ApiKey() key: ApiKeyEntity,
	): Promise<AnchorRequestStatusResponseDto> {
		const request = await this.operatorService.getAnchorRequestFromAnchorRequestId(anchorRequestId);
		return {
			published: request.isCompleted(),
			status: request.getStatus(),
			virtualBlockchainId: request.getVirtualBlockchainId().unwrapOr(undefined),
			microBlockHash: request.getMicroBlockHash().unwrapOr(undefined),
		}
	}







	@Public()
	@ApiExcludeEndpoint()
	@Post("/walletMessage")
	async handleWalletMessage(
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
				answer = await this.operatorService.handleActorKeys(object);
				break;
			}
			case MSG_APPROVAL_SIGNATURE:
				this.logger.debug(`[${sessionId}] Entering approval signature`)
				answer = await this.operatorService.approvalSignature(
					object,
				);
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


}