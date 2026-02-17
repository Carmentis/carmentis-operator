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
} from '@cmts-dev/carmentis-sdk/server';
import { Public } from '../../decorators/PublicDecorator';
import { ApplicationService } from '../../services/ApplicationService';
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
import { WalletInteractiveAnchoringRequestType } from '@cmts-dev/carmentis-sdk/server';
import ChainService from '../../services/ChainService';
import { AnchorRequestService } from '../../services/AnchorRequestService';
import { AnchorRequestEntity } from '../../entities/AnchorRequestEntity';
import { WalletEntity } from '../../entities/WalletEntity';


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
			const application = await this.apiKeyService.findApplicationByApiKey(key);
			return this.operatorService.createAnchorWithWalletSession(application, anchorDto);
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
		const anchorRequest = await this.operatorService.anchor(application, anchorDto);
		return { anchorRequestId: anchorRequest.anchorRequestId }
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
			publishedMicroblockHash: ar.publishedMicroBlockHash,
			createdAt: ar.createdAt,
			publishedAt: ar.publishedAt,
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


	@ApiSecurity('api-key')
	@Get(`/microblock/hash/:microblockHash`)
	async getMicroblock(
		@ApiKey() key: ApiKeyEntity,
		@Param('microblockHash') microblockHash: string,
	) {
		const wallet = await this.apiKeyService.findWalletByApiKey(key);
		const mb = await this.chainService.getMicroblockByHash(wallet, Hash.from(microblockHash));
		return {
			header: {
				hash: mb.getHash().encode(),
				gas: this.formatCMTSTokenInJson(mb.getGas()),
				timestamp: mb.getTimestamp(),
				height: mb.getHeight(),
				gasPrice: this.formatCMTSTokenInJson(mb.getGasPrice()),
				previousHash: mb.getPreviousHash().encode(),
			},
			body: {
				sections: mb.getAllSections(),
			}
		}
	}

	@ApiSecurity('api-key')
	@Get(`/microblock/hash/:microblockHash`)
	async getMicroblockByHash(
		@Param('microblockHash') microblockHash: string,
		@ApiKey() key: ApiKeyEntity,
	) {
		const wallet = await this.apiKeyService.findWalletByApiKey(key);
		const provider = wallet.getProvider();
		const mb = await provider.loadMicroblockByMicroblockHash(Hash.from(microblockHash));
		return {
			header: this.formatMicroblockHeaderInJSON(mb),
			body: this.formatMicroblockBodyInJSON(mb),
		}
	}

	@ApiSecurity('api-key')
	@Get(`/microblock/hash/:microblockHash/header`)
	async getMicroblockHeaderByHash(
		@ApiKey() key: ApiKeyEntity,
		@Param('microblockHash') microblockHash: string,
	) {
		const wallet = await this.apiKeyService.findWalletByApiKey(key);
		const mb = await this.chainService.getMicroblockByHash(wallet, Hash.from(microblockHash));
		return this.formatMicroblockHeaderInJSON(mb);
	}

	@ApiSecurity('api-key')
	@Get(`/microblock/hash/:microblockHash/body`)
	async getMicroblockBodyByHash(
		@ApiKey() key: ApiKeyEntity,
		@Param('microblockHash') microblockHash: string,
	) {
		const wallet = await this.apiKeyService.findWalletByApiKey(key);
		const mb = await this.chainService.getMicroblockByHash(wallet, Hash.from(microblockHash));
		return this.formatMicroblockBodyInJSON(mb);
	}

	private formatMicroblockHeaderInJSON(mb: Microblock) {
		return  {
			hash: mb.getHash().encode(),
			gas: this.formatCMTSTokenInJson(mb.getGas()),
			timestamp: mb.getTimestamp(),
			height: mb.getHeight(),
			gasPrice: this.formatCMTSTokenInJson(mb.getGasPrice()),
			previousHash: mb.getPreviousHash().encode(),
		}
	}

	private formatMicroblockBodyInJSON(mb: Microblock) {
		return {
			sections: mb.getAllSections(),
		}
	}


	@ApiSecurity('api-key')
	@Get(`/account/vb/:vbId/tokens`)
	async getBalanceByVbId(
		@ApiKey() key: ApiKeyEntity,
		@Param('vbId') vbId: string,
	) {
		const wallet = await this.apiKeyService.findWalletByApiKey(key);
		const balance = await this.chainService.getBreakdownOfAccountByVbId(wallet, vbId);
		return this.createTokensResponseFromBreakdown(balance);
	}


	/**
	 * Creates a response object that contains token balances formatted as both human-readable strings and atomic values.
	 *
	 * @param {BalanceAvailability} balance - The balance breakdown object containing spendable, staked, and vested amounts.
	 * @return {Object} An object containing the token balances formatted in two ways:
	 *                  - `formatted`: Human-readable string representations of spendable, staked, and vested balances.
	 *                  - `atomics`: Atomic (raw numerical) representations of spendable, staked, and vested balances.
	 */
	private createTokensResponseFromBreakdown(balance: BalanceAvailability) {
		const spendable=  balance.getSpendable();
		const staked = balance.getStaked();
		const vested = balance.getVested();
		return {
			spendable: this.formatCMTSTokenInJson(spendable),
			staked: this.formatCMTSTokenInJson(staked),
			vested: this.formatCMTSTokenInJson(vested),
		};
	}


	@ApiSecurity('api-key')
	@Get(`/record/vb/:vbId/height/:height`)
	async getRecordForVbIdAtHeight(
		@ApiKey() key: ApiKeyEntity,
		@Param('vbId') vbId: string,
		@Param('height', ParseIntPipe) height: number,
	) {
		const wallet = await this.apiKeyService.findWalletByApiKey(key);
		const provider = wallet.getProvider();
		const vb = await provider.loadApplicationLedgerVirtualBlockchain(Hash.from(vbId))
		return vb.getRecord(height);
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

	private formatCMTSTokenInJson(token: CMTSToken) {
		return  {
			formatted: token.toString(),
			atomics: token.getAmountAsAtomic(),
		}
	}


}