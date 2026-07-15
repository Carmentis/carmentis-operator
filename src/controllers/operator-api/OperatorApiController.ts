import { Body, Controller, Delete, Get, Logger, Param, ParseIntPipe, Post } from '@nestjs/common';
import {
	BalanceAvailability,
	CarmentisError,
	CMTSToken,
	Hash,
	Microblock,
	WalletInteractiveAnchoringResponse,
	WalletInteractiveAnchoringResponseType,
	WalletInteractiveAnchoringValidation,
	WalletInteractiveAnchoringRequest,
} from '@cmts-dev/carmentis-sdk-core';
import { Public } from '../../decorators/PublicDecorator';
import { ApiKeyService } from '../../services/ApiKeyService';
import { AnchorDto, AnchorWithWalletDto } from '../../dto/AnchorDto';
import {
	ApiBody,
	ApiCreatedResponse,
	ApiExcludeEndpoint,
	ApiForbiddenResponse,
	ApiOperation,
	ApiResponse,
	ApiSecurity,
} from '@nestjs/swagger';
import { ApiKey } from '../../decorators/ApiKeyDecorator';
import { ApiKeyEntity } from '../../entities/ApiKeyEntity';
import { WalletAnchoringRequestService } from '../../services/wallet-anchoring-request.service';
import { HelloResponseDto } from '../../dto/HelloResponseDto';
import { AnchorRequestResponseDto } from '../../dto/AnchorRequestResponseDto';
import { AnchorRequestStatusResponseDto } from '../../dto/AnchorRequestStatusResponseDto';
import { WalletInteractiveAnchoringRequestType } from '@cmts-dev/carmentis-sdk-core';
import ChainService from '../../services/ChainService';
import { AnchorRequestService } from '../../services/AnchorRequestService';
import { AnchorRequestEntity } from '../../entities/AnchorRequestEntity';
import { WalletUtils } from '../../utils/WalletUtils';
import { VbUtils } from '../../utils/VbUtils';

/**
 * Controller for handling operator-related API requests.
 * Provides endpoints for server health checks, anchoring operations, and wallet message handling.
 */
@Controller('/api')
export class OperatorApiController{

	private logger = new Logger(OperatorApiController.name);
	constructor(
		private readonly apiKeyService: ApiKeyService,
		private readonly operatorService: WalletAnchoringRequestService,
		private readonly chainService: ChainService,
		private readonly anchorService: AnchorRequestService
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
	): Promise<AnchorRequestStatusResponseDto> {
		const request = await this.operatorService.getAnchorRequestFromAnchorRequestId(anchorRequestId);
		return {
			published: request.isCompleted(),
			status: request.getStatus(),
			virtualBlockchainId: request.getVirtualBlockchainId().unwrapOr(undefined),
			microBlockHash: request.getMicroBlockHash().unwrapOr(undefined),
		}
	}

	@ApiSecurity('api-key')
	@Get(`/anchorRequest`)
	async getAllAnchorRequests(

	) {
		const anchorRequest = await this.anchorService.getAllAnchorRequests();
		return Promise.all(anchorRequest.map(async ar => await this.formatAnchorRequestInJSON(ar)));
	}

	@ApiSecurity('api-key')
	@Get(`/anchorRequest/:anchorRequestId`)
	async getAnchorRequestById(
		@Param('anchorRequestId') anchorRequestId: string,
	) {
		const anchorRequest = await this.anchorService.getAnchorRequestByAnchorRequestId(anchorRequestId);
		return await this.formatAnchorRequestInJSON(anchorRequest);
	}

	private async formatAnchorRequestInJSON(ar: AnchorRequestEntity) {
		return {
			anchorRequestId: ar.anchorRequestId,
			status: ar.getStatus(),
			applicationVbId: ar.application.vbId,
			publishedMicroblockHash: ar.submittedMicroblockHash,
			createdAt: ar.createdAt,
			publishedAt: ar.submittedAt,
			virtualBlockchainId: ar.virtualBlockchainId
		}
	}

	@ApiSecurity('api-key')
	@Delete(`/anchorRequest/:anchorRequestId`)
	async deleteAnchorRequestById(
		@Param('anchorRequestId') anchorRequestId: string,
	) {
		const anchorRequest = await this.anchorService.deleteAnchorRequestByAnchorRequestId(anchorRequestId);
		return { affected: anchorRequest.affected };
	}



	@Public()
	@ApiExcludeEndpoint()
	@Post("/protocols/wiap/v1")
	async handleWalletMessage(
		@Body("data") unverifiedRequest : object
	): Promise<WalletInteractiveAnchoringResponse> {
		// parse the request
		this.logger.debug(`Handling request:`, unverifiedRequest)
		const request: WalletInteractiveAnchoringRequest = WalletInteractiveAnchoringValidation.validateRequest(unverifiedRequest);
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