import {
	BadRequestException,
	Body,
	Controller, Delete,
	Get,
	Logger,
	NotFoundException,
	Param,
	ParseIntPipe,
	Post,
} from '@nestjs/common';
import {
	BalanceAvailability,
	CarmentisError, CMTSToken,
	EncoderFactory, Hash, Microblock,
	WalletInteractiveAnchoringEncoder, WalletInteractiveAnchoringResponse, WalletInteractiveAnchoringResponseType,
	WalletInteractiveAnchoringValidation,
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
import { OrganisationService } from '../../shared/services/OrganisationService';
import ChainService from '../../shared/services/ChainService';
import { AnchorRequestService } from '../services/AnchorRequestService';
import { AnchorRequestEntity } from '../entities/AnchorRequestEntity';


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
		private readonly organisationService: OrganisationService,
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
	@Get('/organization')
	async getAllOrganizationsInThisOperator() {
		const organizations = await this.organisationService.getAllOrganizations();
		return organizations.map(org => ({
			id: org.id,
			name: org.name,
			vbId: org.virtualBlockchainId
		}));
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
		const application = await this.applicationService.findApplication(ar.applicationId);
		const organization = await this.organisationService.findOne(ar.localOrganisationId);
		return {
			anchorRequestId: ar.anchorRequestId,
			status: ar.getStatus(),
			organizationId: ar.localOrganisationId,
			applicationId: ar.applicationId,
			organizationVbId: organization.virtualBlockchainId,
			applicationVbId: application.virtualBlockchainId,
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
		@Param('microblockHash') microblockHash: string,
	) {
		const mb = await this.chainService.getMicroblockByHash(Hash.from(microblockHash));
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
	) {
		const provider = this.chainService.getProvider();
		const mb = await provider.loadMicroblockByMicroblockHash(Hash.from(microblockHash));
		return {
			header: this.formatMicroblockHeaderInJSON(mb),
			body: this.formatMicroblockBodyInJSON(mb),
		}
	}

	@ApiSecurity('api-key')
	@Get(`/microblock/hash/:microblockHash/header`)
	async getMicroblockHeaderByHash(
		@Param('microblockHash') microblockHash: string,
	) {
		const mb = await this.chainService.getMicroblockByHash(Hash.from(microblockHash));
		return this.formatMicroblockHeaderInJSON(mb);
	}

	@ApiSecurity('api-key')
	@Get(`/microblock/hash/:microblockHash/body`)
	async getMicroblockBodyByHash(
		@Param('microblockHash') microblockHash: string,
	) {
		const mb = await this.chainService.getMicroblockByHash(Hash.from(microblockHash));
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
	@Get(`/organization/id/:orgId/tokens`)
	async getBalanceById(
		@Param('orgId') orgId: string,
	) {
		const organisation = await this.organisationService.findOne(Number(orgId));
		if (!organisation) {
			throw new NotFoundException(`Organisation with id ${orgId} not found`);
		}
		const pk = await organisation.getPublicSignatureKey()
		const balance = await this.chainService.getBreakdownOfAccount(pk);
		return this.createTokensResponseFromBreakdown(balance);
	}

	@ApiSecurity('api-key')
	@Get(`/account/vb/:vbId/tokens`)
	async getBalanceByVbId(
		@Param('vbId') vbId: string,
	) {
		const balance = await this.chainService.getBreakdownOfAccountByVbId(vbId);
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
	@Get(`/organization/id/:orgId/application`)
	async getAllApplicationsInThisOrganization(
		@Param('orgId') orgId: string,
	) {
		const applications = await this.applicationService.findAllApplicationsInOrganisationByOrganisationId(Number(orgId));
		return applications.map(app => ({
			id: app.id,
			name: app.name,
			vbId: app.virtualBlockchainId
		}))
	}


	@ApiSecurity('api-key')
	@Get(`/record/vb/:vbId/height/:height`)
	async getRecordForVbIdAtHeight(
		@Param('vbId') vbId: string,
		@Param('height', ParseIntPipe) height: number,
	) {
		const provider = this.chainService.getProvider();
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