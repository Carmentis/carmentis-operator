import { ApiBody, ApiCreatedResponse, ApiOperation, ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { AnchorRequestStatusResponseDto } from '../../dto/AnchorRequestStatusResponseDto';
import { BadRequestException, Body, Controller, Delete, Get, Logger, Param, Post } from '@nestjs/common';
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
import { InvalidArgumentError } from 'commander';
import { WalletEntity } from '../../entities/WalletEntity';
import { ApplicationEntity } from '../../entities/ApplicationEntity';

@ApiTags('Wallet Anchoring')
@Controller('/api')
export class WalletAnchoringController {
	private logger = new Logger();
	constructor(
		private readonly operatorService: WalletAnchoringRequestService,
		private readonly applicationService: ApplicationService,
	) {}


	@ApiOperation({
		summary: 'Initiate an anchor request with wallet',
		description: 'Initiates an anchoring request that should be accepted by a wallet. This endpoint allows anchoring with explicit wallet approval.'
	})
	@ApiBody({ type: AnchorWithWalletDto })
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

			const applicationId = anchorDto.applicationId;
			this.validateIfApiKeyAllowingPublicationToApplication(key, applicationId)
			this.validateGasPrice(key, anchorDto.gasPriceInAtomics);
			const application = await this.applicationService.findApplicationByVbId(applicationId);
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










	@ApiOperation({
		summary: 'Initiate an anchor request',
		description: 'Initiates an anchoring request for an application. This endpoint is used to create an anchor request without explicit wallet approval.'
	})
	@ApiBody({ type: AnchorDto })
	@ApiCreatedResponse({
		description: 'The anchoring request has been created successfully.',
		type: AnchorRequestResponseDto
	})
	@ApiSecurity('api-key')
	@Post('/wallet/:walletId/anchor')
	async anchor(
		@Body() anchorDto: AnchorDto,
		@ApiKey() key: ApiKeyEntity,
	): Promise<AnchorRequestResponseDto> {
		// find application and organization
		const applicationId = anchorDto.applicationId;
		this.validateIfApiKeyAllowingPublicationToApplication(key, applicationId)
		this.validateGasPrice(key, anchorDto.gasPriceInAtomics);
		this.logAnchorRequest(anchorDto)
		const application = await this.applicationService.findApplicationByVbId(applicationId);
		const anchorRequestId = await this.operatorService.anchor(application, anchorDto);
		return { anchorRequestId: anchorRequestId }
	}



	@ApiOperation({
		summary: 'Initiate an anchor request with wallet',
		description: 'Initiates an anchoring request that should be accepted by a wallet. This endpoint allows anchoring with explicit wallet approval.'
	})
	@ApiBody({ type: AnchorWithWalletDto })
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










	@ApiOperation({
		summary: 'Initiate an anchor request',
		description: 'Initiates an anchoring request for an application. This endpoint is used to create an anchor request without explicit wallet approval.'
	})
	@ApiBody({ type: AnchorDto })
	@ApiCreatedResponse({
		description: 'The anchoring request has been created successfully.',
		type: AnchorRequestResponseDto
	})
	@ApiSecurity('api-key')
	@Post('/wallet/anchor')
	async anchorUsingImplicitWallet(
		@Body() anchorDto: AnchorDto,
		@ApiKey() key: ApiKeyEntity,
	): Promise<AnchorRequestResponseDto> {
		const application = await this.retrieveApplication(key, anchorDto);
		const wallet = await this.retrieveWallet(key, application);

		this.validateGasPrice(key, anchorDto.gasPriceInAtomics);
		this.logAnchorRequest(anchorDto)
		const anchorRequestId = await this.operatorService.anchor(application, anchorDto);
		return { anchorRequestId: anchorRequestId }
	}

	private async retrieveApplication(key: ApiKeyEntity, anchorDto: AnchorDto) {
		const isAssociatedWithApplication = !!key.application;
		const isApplicationSpecifiedInRequest = !!anchorDto.applicationId;
		if (!isAssociatedWithApplication) {
			if (!isApplicationSpecifiedInRequest) {
				throw new BadRequestException('Either a wallet or an application must be associated with the API key.');
			} else {
				return ApplicationEntity.findOneByOrFail({
					vbId: anchorDto.applicationId
				})
			}
		} else {
			return ApplicationEntity.findOneByOrFail({
				vbId: key.application.vbId
			})
		}
	}

	private async retrieveWallet(key: ApiKeyEntity, application: ApplicationEntity) {
		const isAssociatedWithWallet = !!key.wallet;
		if (!isAssociatedWithWallet) {
			return await WalletEntity.findOneBy({
				applications: {
					vbId: application.vbId
				}
			})
		} else {
			return await WalletEntity.findOneBy({
				id: key.wallet.id,
				applications: {
					vbId: application.vbId
				}
			})
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
		if (typeof gasPriceInAtomics !== 'number') {
			throw new Error(`Gas price ${gasPriceInAtomics} is not a number`);
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