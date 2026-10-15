import { ApiBody, ApiCreatedResponse, ApiOperation, ApiQuery, ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { AnchorRequestStatusResponseDto } from '../../dto/AnchorRequestStatusResponseDto';
import { BadRequestException, Body, Controller, Get, Logger, NotFoundException, Param, Post, Query } from '@nestjs/common';
import { AnchorRequestEntity } from '../../entities/AnchorRequestEntity';
import { ApiKeyService } from '../../services/ApiKeyService';
import { WalletAnchoringRequestService } from '../../services/wallet-anchoring-request.service';
import ChainService from '../../services/ChainService';
import { AnchorRequestService } from '../../services/AnchorRequestService';
import { AnchorDto, AnchorWithWalletDto } from '../../dto/AnchorDto';
import { AnchorRequestResponseDto } from '../../dto/AnchorRequestResponseDto';
import { ApiKey } from '../../decorators/ApiKeyDecorator';
import { ApiKeyEntity } from '../../entities/ApiKeyEntity';
import { CarmentisError, Hash, ProviderFactory } from '@cmts-dev/carmentis-sdk-core';
import { ApplicationService } from '../../services/ApplicationService';
import { ApplicationEntity } from '../../entities/ApplicationEntity';
import { API_V1 } from '../../api/ApiVersion';
import { WalletByIdPipe } from '../../pipes/WalletByIdPipe';
import { WalletEntity } from '../../entities/WalletEntity';
import { WalletService } from '../../services/WalletService';
import { ProofService } from '../../services/ProofService';
import { ApplicationLedgerUtils } from '../../utils/ApplicationLedgerUtils';
import { GetVirtualBlockchainRecordRequestDto } from '../../dto/wallet/GetVirtualBlockchainRecordRequestDto';
import { GetVirtualBlockchainAuthenticityProofRequestDto } from '../../dto/wallet/GetVirtualBlockchainAuthenticityProofRequestDto';


const AnchoringExamples = {
	createApplicationLedger: {
		summary: 'Create an application ledger',
		value: {
			"walletId": "9d1c6f0a-7b3e-4a52-8e1f-2c4b6a8d0e13",
			"applicationId": "3f2b8c1e-5a47-4d0e-9b6a-1c2d3e4f5a6b",
			"chainStorageInDays": 360,
			"gasPriceInAtomics": 200000,
			"channels": [
				{
					"name": "New Channel 1",
					"public": true
				},
				{
					"name": "New Channel 2",
					"public": false
				}
			],
			"actors": [
				{
					"name": "New Actor 1"
				},
				{
					"name": "New Actor 2"
				}
			],
			"data": {
				"invoice_id": "INV-001",
				"amount": 1000,
				"customer": "ACME Corp"
			},
			"channelAssignations": [
				{
					"channelName": "New Channel 1",
					"fieldPath": "this.*"
				}
			],
			"actorAssignations": [
				{
					"channelName": "New Channel 1",
					"actorName": "New Actor 1"
				}
			],
			"author": "New Actor 1"
		}
	},
	appendToApplicationLedger: {
		summary: 'Append application ledger',
		value: {
			"walletId": "9d1c6f0a-7b3e-4a52-8e1f-2c4b6a8d0e13",
			"applicationId": "3f2b8c1e-5a47-4d0e-9b6a-1c2d3e4f5a6b",
			"virtualBlockchainId": '82A49C89ACA5F3ECA4139A040A028B4C5B0A686BC1CE4B58DDE1BFC6B1004FBD',
			"gasPriceInAtomics": 200000,
			"channels": [
				{
					"name": "New Channel 3",
					"public": true
				}
			],
			"actors": [
				{
					"name": "New Actor 3"
				},
			],
			"data": {
				"invoice_id": "INV-001",
				"amount": 1000,
				"customer": "ACME Corp"
			},
			"channelAssignations": [
				{
					"channelName": "Public",
					"fieldPath": "this.*"
				}
			],
			"author": "Endorser"
		}
	}
}

const AnchoringWithWalletExamples = {
	createApplicationLedger: {
		...AnchoringExamples.createApplicationLedger,
		endorser: 'New Actor 2'
	},
	appendToApplicationLedger: {
		...AnchoringExamples.appendToApplicationLedger,
		endorser: 'New Actor 2'
	}
}

@ApiTags('Wallet Application Ledger')
@Controller({ path: '', version: API_V1 })
export class WalletApplicationLedgerController {
	private logger = new Logger();
	constructor(
		private readonly operatorService: WalletAnchoringRequestService,
		private readonly applicationService: ApplicationService,
		private readonly walletService: WalletService,
		private readonly proofService: ProofService,
	) {}


	/*
	@ApiOperation({
		summary: 'Initiate an anchor request with wallet',
		description: 'Initiates an anchoring request that should be accepted by a wallet. This endpoint allows anchoring with explicit wallet approval.'
	})
	@ApiBody({ type: AnchorWithWalletDto, examples: AnchoringWithWalletExamples })
	@ApiCreatedResponse({
		description: 'The anchoring session has been created successfully.',
		type: AnchorRequestResponseDto
	})
	@ApiSecurity('api-key')
	@Post('/wallet/:walletId/anchorWithWallet')
	async anchorWithWallet(
		@Body() anchorDto: AnchorWithWalletDto,
		@ApiKey() key: ApiKeyEntity,
	): Promise<AnchorRequestResponseDto> {
		try {
			this.logAnchorRequest(anchorDto)

			const application = await this.retrieveApplication(key, anchorDto);
			const applicationId = application.vbId;
			this.validateIfApiKeyAllowingPublicationToApplication(key, applicationId)
			this.validateGasPrice(key, anchorDto.gasPriceInAtomics);
			return this.operatorService.createAnchorRequestWithWallet(application, anchorDto);
		} catch (e) {
			this.logger.error("An error occurred while processing anchoring with wallet request: ", e)
			if (CarmentisError.isCarmentisError(e)) {
				throw e
			} else {

				throw e;
			}
		}
	}


	 */









	@ApiOperation({
		summary: 'Initiate an anchor request',
		description: 'Initiates an anchoring request for an application. This endpoint is used to create an anchor request without explicit wallet approval. ' +
			'`walletId` is optional: when provided (or when the API key is bound to a wallet), the application must belong to that wallet.'
	})
	@ApiBody({ type: AnchorDto, examples: AnchoringExamples })
	@ApiCreatedResponse({
		description: 'The anchoring request has been created successfully.',
		type: AnchorRequestResponseDto
	})
	@ApiSecurity('api-key')
	@Post('/applicationLedger/anchor')
	async anchor(
		@Body() anchorDto: AnchorDto,
		@ApiKey() key: ApiKeyEntity,
	): Promise<AnchorRequestResponseDto> {
		// find application and organization
		const application = await this.retrieveApplication(key, anchorDto);
		this.validateApplicationBelongsToWallet(key, anchorDto, application);
		const applicationId = application.vbId;
		this.validateIfApiKeyAllowingPublicationToApplication(key, applicationId)
		this.validateGasPrice(key, anchorDto.gasPriceInAtomics);
		this.logAnchorRequest(anchorDto)
		const anchorRequestId = await this.operatorService.anchor(application, anchorDto);
		return { anchorRequestId: anchorRequestId }
	}



	/*
	@ApiOperation({
		summary: 'Initiate an anchor request with wallet',
		description: 'Initiates an anchoring request that should be accepted by a wallet. This endpoint allows anchoring with explicit wallet approval.'
	})
	@ApiBody({ type: AnchorWithWalletDto, examples: AnchoringWithWalletExamples })
	@ApiCreatedResponse({
		description: 'The anchoring session has been created successfully.',
		type: AnchorRequestResponseDto
	})
	@ApiSecurity('api-key')
	@Post('/wallet/anchorWithWallet')
	async anchorWithWalletUsingImplicitWallet(
		@Body() anchorDto: AnchorWithWalletDto,
		@ApiKey() key: ApiKeyEntity,
	): Promise<AnchorRequestResponseDto> {
		try {
			const application = await this.retrieveApplication(key, anchorDto);
			const wallet = await this.retrieveWallet(key, application);
			this.logAnchorRequest(anchorDto)
			this.validateIfApiKeyAllowingPublicationToApplication(key, application.vbId)
			this.validateGasPrice(key, anchorDto.gasPriceInAtomics);
			return this.operatorService.createAnchorRequestWithWallet(application, anchorDto);
		} catch (e) {
			this.logger.error("An error occurred while processing anchoring with wallet request: ", e)
			if (CarmentisError.isCarmentisError(e)) {
				throw e
			} else {

				throw e;
			}
		}
	}

	 */

	@ApiOperation({
		summary: 'Get a record from an application ledger',
		description: 'Retrieves a record from an application ledger at a given block height, read with the wallet identity.'
	})
	@ApiQuery({ name: 'walletId', type: String, format: 'uuid', description: 'Wallet whose node and actor identity are used' })
	@ApiResponse({ status: 200, description: 'The record has been successfully retrieved.' })
	@ApiSecurity('api-key')
	@Get('/applicationLedger/:applicationLedgerVbId/record')
	async getRecord(
		@Param('applicationLedgerVbId') applicationLedgerVbId: string,
		@Query('walletId', WalletByIdPipe) wallet: WalletEntity,
		@Query() request: GetVirtualBlockchainRecordRequestDto,
	) {
		const height = request.height;
		this.logger.log(`Accessing record for application ledger ${applicationLedgerVbId} at height ${height}`)
		const provider = wallet.getProvider();
		const vb = await provider.loadApplicationLedgerVirtualBlockchain(Hash.from(applicationLedgerVbId))
		const vbSeed = (await vb.getGenesisSeed()).toBytes();
		const actorIdentity = await this.walletService.getActorIdentity(wallet, vbSeed);
		return vb.getRecord(height, actorIdentity);
	}

	@ApiOperation({
		summary: 'Get the authenticity proof of an application ledger',
		description: 'Retrieves the authenticity proof of an application ledger, produced with the wallet identity.'
	})
	@ApiQuery({ name: 'walletId', type: String, format: 'uuid', description: 'Wallet whose node and actor identity are used' })
	@ApiResponse({ status: 200, description: 'The authenticity proof has been successfully retrieved.' })
	@ApiSecurity('api-key')
	@Get('/applicationLedger/:applicationLedgerVbId/proof/authenticity')
	async getAuthenticityProof(
		@Param('applicationLedgerVbId') applicationLedgerVbId: string,
		@Query('walletId', WalletByIdPipe) wallet: WalletEntity,
		@Query() request: GetVirtualBlockchainAuthenticityProofRequestDto,
	) {
		const author = request.proofAuthor;
		this.logger.log(`Returning authenticity proof for application ledger ${applicationLedgerVbId} with author ${author}`)
		return this.proofService.getVbProof(applicationLedgerVbId, wallet, author);
	}

	@ApiOperation({
		summary: 'Get the state of an application ledger',
		description: 'Returns the actors and channels of an application ledger, read from the given node.'
	})
	@ApiSecurity('api-key')
	@Get('/applicationLedger/:applicationLedgerVbId/state')
	async getApplicationLedgerState(
		@Param('applicationLedgerVbId') applicationLedgerVbId: string,
		@Query('nodeEndpoint') nodeEndpoint: string,
	) {
		this.logger.log(`Getting application ledger state for VB ${applicationLedgerVbId} from node ${nodeEndpoint}`);
		const provider = ProviderFactory.createInMemoryProviderWithExternalProvider(nodeEndpoint);
		const vb = await provider.loadApplicationLedgerVirtualBlockchain(Hash.fromHex(applicationLedgerVbId));
		return ApplicationLedgerUtils.getActorsAndChannels(vb);
	}

	@ApiOperation({
		summary: 'Get the public keys of an application ledger actor',
		description: 'Returns the public keys of an actor of an application ledger, read from the given node.'
	})
	@ApiSecurity('api-key')
	@Get('/applicationLedger/:applicationLedgerVbId/actor/:actorName/pk')
	async getActorKeys(
		@Param('applicationLedgerVbId') applicationLedgerVbId: string,
		@Param('actorName') actorName: string,
		@Query('nodeEndpoint') nodeEndpoint: string,
	) {
		this.logger.log(`Getting keys of actor ${actorName} of application ledger ${applicationLedgerVbId} from node ${nodeEndpoint}`);
		const provider = ProviderFactory.createInMemoryProviderWithExternalProvider(nodeEndpoint);
		const vb = await provider.loadApplicationLedgerVirtualBlockchain(Hash.fromHex(applicationLedgerVbId));
		return ApplicationLedgerUtils.getActorKeys(vb, actorName);
	}

	private async retrieveApplication(key: ApiKeyEntity, anchorDto: AnchorDto) {
		const isAssociatedWithApplication = !!key.application;
		const isApplicationSpecifiedInRequest = !!anchorDto.applicationId;
		let applicationId: string;
		if (!isAssociatedWithApplication) {
			if (!isApplicationSpecifiedInRequest) {
				throw new BadRequestException('Either an application must be specified in the request or associated with the API key.');
			}
			this.logger.debug(`Finding application via anchor request: ${anchorDto.applicationId}`);
			applicationId = anchorDto.applicationId;
		} else {
			if (isApplicationSpecifiedInRequest && anchorDto.applicationId !== key.application.id) {
				throw new BadRequestException('The application of the request differs from the application associated with the API key.');
			}
			this.logger.debug(`Finding application via API key: ${key.application.id}`);
			applicationId = key.application.id;
		}

		const application = await this.applicationService.findApplicationById(applicationId);
		if (!application) {
			throw new NotFoundException(`Application ${applicationId} not found`);
		}
		if (!application.vbId) {
			throw new BadRequestException(`Application ${applicationId} is not published online yet`);
		}
		return application;
	}

	/**
	 * The wallet is the one given in the request, or the one the API key is bound to.
	 * @throws BadRequestException If the request wallet differs from the API key wallet.
	 * @throws NotFoundException If the application does not belong to the wallet.
	 */
	private validateApplicationBelongsToWallet(key: ApiKeyEntity, anchorDto: AnchorDto, application: ApplicationEntity) {
		const keyWalletId = key.wallet?.id;
		if (anchorDto.walletId && keyWalletId && anchorDto.walletId !== keyWalletId) {
			throw new BadRequestException('The wallet of the request differs from the wallet associated with the API key.');
		}
		const walletId = anchorDto.walletId ?? keyWalletId;
		if (walletId && application?.wallet?.id !== walletId) {
			throw new NotFoundException(`Application ${application?.vbId} not found for wallet ${walletId}`);
		}
	}


	logAnchorRequest(request: AnchorDto | AnchorWithWalletDto) {
		this.logger.log("-------------------------------------")
		this.logger.log("A new anchor request id has been created:")
		this.logger.log(`Gas price: ${request.gasPriceInAtomics}`)
		this.logger.log(`Author : ${request.author}`)
		this.logger.log(`Endorser: ${'endorser' in request ? request.endorser : '___ (no endorser)'}`)
		this.logger.log(`Actors: ${request.actors.map(actor => actor.name).join(', ')}`)
		this.logger.log(`Channels: ${request.channels.map(channel => channel.name).join(', ')}`)
		this.logger.log("-------------------------------------")
	}

	private validateGasPrice(apiKey: ApiKeyEntity, gasPriceInAtomics: number) {
		if (!Number.isSafeInteger(gasPriceInAtomics)) {
			throw new Error(`Gas price ${gasPriceInAtomics} is not a safe integer`);
		}

		if (gasPriceInAtomics < apiKey.gasMinAtomics) {
			throw new Error(`Gas price ${gasPriceInAtomics} is below minimum allowed ${apiKey.gasMinAtomics}`);
		}
		if (gasPriceInAtomics > apiKey.gasMaxAtomics) {
			throw new Error(`Gas price ${gasPriceInAtomics} exceeds maximum allowed ${apiKey.gasMaxAtomics}`);
		}
	}


	private validateIfApiKeyAllowingPublicationToApplication(apiKey: ApiKeyEntity, applicationId: string) {
		if (!!apiKey.application && apiKey.application.vbId !== applicationId) {
			throw new Error(`API key ${apiKey.id} is not allowed to publish to application ${applicationId}`);
		}
		return true;
	}

}