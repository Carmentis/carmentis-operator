import { ApiBody, ApiCreatedResponse, ApiOperation, ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { AnchorRequestStatusResponseDto } from '../../dto/AnchorRequestStatusResponseDto';
import { BadRequestException, Body, Controller, Logger, NotFoundException, Post } from '@nestjs/common';
import { AnchorRequestEntity } from '../../entities/AnchorRequestEntity';
import { ApiKeyService } from '../../services/ApiKeyService';
import { WalletAnchoringRequestService } from '../../services/wallet-anchoring-request.service';
import ChainService from '../../services/ChainService';
import { AnchorRequestService } from '../../services/AnchorRequestService';
import { AnchorDto, AnchorWithWalletDto } from '../../dto/AnchorDto';
import { AnchorRequestResponseDto } from '../../dto/AnchorRequestResponseDto';
import { ApiKey } from '../../decorators/ApiKeyDecorator';
import { ApiKeyEntity } from '../../entities/ApiKeyEntity';
import { CarmentisError } from '@cmts-dev/carmentis-sdk-core';
import { ApplicationService } from '../../services/ApplicationService';
import { ApplicationEntity } from '../../entities/ApplicationEntity';
import { API_V1 } from '../../api/ApiVersion';


const AnchoringExamples = {
	createApplicationLedger: {
		summary: 'Create an application ledger',
		value: {
			"applicationId": "6AC2A4EBFD08F34C2EF4432041313F83EB4C8AB9154FAEF61ABB833613DA1C10",
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
			"applicationId": "6AC2A4EBFD08F34C2EF4432041313F83EB4C8AB9154FAEF61ABB833613DA1C10",
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










	private async retrieveApplication(key: ApiKeyEntity, anchorDto: AnchorDto) {
		const isAssociatedWithApplication = !!key.application;
		const isApplicationSpecifiedInRequest = !!anchorDto.applicationId;
		if (!isAssociatedWithApplication) {
			if (!isApplicationSpecifiedInRequest) {
				throw new BadRequestException('Either a wallet or an application must be associated with the API key.');
			} else {
				this.logger.debug(`Finding application via anchor request: ${anchorDto.applicationId}`);
				return this.applicationService.findApplicationByVbId(
					anchorDto.applicationId
				)
			}
		} else {
			this.logger.debug(`Finding application via API key: ${key.application.vbId}`);
			return this.applicationService.findApplicationByVbId(
				key.application.vbId
			)
		}
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