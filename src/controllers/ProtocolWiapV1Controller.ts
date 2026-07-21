import { Public } from '../decorators/PublicDecorator';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { Body, Controller, Logger, Post } from '@nestjs/common';
import {
	WalletInteractiveAnchoringRequest,
	WalletInteractiveAnchoringRequestType,
	WalletInteractiveAnchoringResponse,
	WalletInteractiveAnchoringResponseType,
	WalletInteractiveAnchoringValidation,
} from '@cmts-dev/carmentis-sdk-core';
import { WalletAnchoringRequestService } from '../services/wallet-anchoring-request.service';
import { AnchorRequestService } from '../services/AnchorRequestService';
import { AnchorRequestEntity } from '../entities/AnchorRequestEntity';
import { AnchorRequestStatus } from '../utils/AnchorRequestStatus';

@Controller('/api')
export class ProtocolWiapV1Controller {

	private logger = new Logger();
	constructor(
		private readonly operatorService: WalletAnchoringRequestService,
		private readonly anchorService: AnchorRequestService
	) {}

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
			// mark the anchor request as initiated
			const anchorRequest = await AnchorRequestEntity.findOneBy({
				anchorRequestId: request.anchorRequestId
			})
			if (anchorRequest.status === AnchorRequestStatus.CREATED) {
				anchorRequest.status = AnchorRequestStatus.INITIATED;
				await anchorRequest.save();
			}


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