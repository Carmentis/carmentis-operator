import { BadRequestException, Body, Controller, Get, Logger, Param, Post } from '@nestjs/common';
import {
	CarmentisError,
	EncoderFactory,
	WalletInteractiveAnchoringEncoder, WalletInteractiveAnchoringResponse, WalletInteractiveAnchoringResponseType,
	WalletInteractiveAnchoringValidation
} from '@cmts-dev/carmentis-sdk/server';
import { Public } from '../../shared/decorators/PublicDecorator';
import { ApplicationService } from '../../shared/services/ApplicationService';
import { ApiKeyService } from '../../shared/services/ApiKeyService';
import { AnchorDto, AnchorWithWalletDto } from '../dto/AnchorDto';
import {
	ApiBody,
	ApiCreatedResponse,
	ApiExcludeEndpoint,
	ApiForbiddenResponse,
	ApiOperation,
	ApiResponse,
	ApiSecurity,
} from '@nestjs/swagger';
import { ApiKey } from '../decorators/ApiKeyDecorator';
import { ApiKeyEntity } from '../../shared/entities/ApiKeyEntity';
import { OperatorService } from '../services/OperatorService';
import { HelloResponseDto } from '../dto/HelloResponseDto';
import { AnchorRequestResponseDto } from '../dto/AnchorRequestResponseDto';
import { AnchorRequestStatusResponseDto } from '../dto/AnchorRequestStatusResponseDto';
import { WalletInteractiveAnchoringRequestType } from '@cmts-dev/carmentis-sdk/client';


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
			this.logger.error("An error occurred while processing anchoring with wallet request: ", e)
			if (CarmentisError.isCarmentisError(e)) {
				throw e
			} else {

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
		throw new Error("Method not implemented.")
		/*
		return {
			anchorRequestId: anchorRequest.anchorRequestId
		}

		 */
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
	@Post("/protocols/wiap/v1")
	async handleWalletMessage(
		@Body("data") unverifiedRequest : object
	): Promise<WalletInteractiveAnchoringResponse> {
		// parse the request
		this.logger.debug(`Handling request:`, unverifiedRequest)
		//const encoder = EncoderFactory.bytesToBase64Encoder();
		const request = WalletInteractiveAnchoringValidation.validateRequest(unverifiedRequest);
		const type = request.type;


		// handle the request
		try {
			this.logger.debug(`Handling request type ${type}`)
			let response: WalletInteractiveAnchoringResponse;
			switch(type) {
				case WalletInteractiveAnchoringRequestType.APPROVAL_HANDSHAKE: {
					this.logger.debug(`Entering approval handshake`)
					response = await this.operatorService.approvalHandshake(request);
					break
				}
				case WalletInteractiveAnchoringRequestType.ACTOR_KEY: {
					this.logger.debug(`Entering approval actor key`)
					response = await this.operatorService.handleActorKeys(request);
					break;
				}
				case WalletInteractiveAnchoringRequestType.APPROVAL_SIGNATURE:
					this.logger.debug(`Entering approval signature`)
					response = await this.operatorService.approvalSignature(request);
					break;
				default:
					const errorMessage = `Unknown request type: ${type}`
					this.logger.error(errorMessage)
					response = {
						type: WalletInteractiveAnchoringResponseType.ERROR,
						errorMessage: errorMessage
					}
			}


			this.logger.debug(`Request handled: answer: ${response.type}`)
			return response
		} catch(e) {
			if (e instanceof Error) {
				this.logger.error(`An error occured during wallet request handler: ${e}`);
				this.logger.debug(e.stack)
			} else if (typeof e === 'string') {
				this.logger.error(`An error occured during wallet request handler: ${e}`);
			} else {
				this.logger.error(`An error occured during wallet request handler: ${e}`);
			}

			return {
				type: WalletInteractiveAnchoringResponseType.ERROR,
				errorMessage: `${e}`
			}
		}

	}


}