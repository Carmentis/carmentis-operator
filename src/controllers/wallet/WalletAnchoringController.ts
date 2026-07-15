import { ApiBody, ApiCreatedResponse, ApiOperation, ApiResponse, ApiSecurity } from '@nestjs/swagger';
import { AnchorRequestStatusResponseDto } from '../../dto/AnchorRequestStatusResponseDto';
import { Body, Controller, Delete, Get, Logger, Param, Post } from '@nestjs/common';
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

@Controller('/api')
export class WalletAnchoringController {
	private logger = new Logger();
	constructor(
		private readonly apiKeyService: ApiKeyService,
		private readonly operatorService: WalletAnchoringRequestService,
		private readonly chainService: ChainService,
		private readonly anchorService: AnchorRequestService
	) {}


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
	@Post('/wallet/:walletId/anchorWithWallet')
	async anchorWithWallet(
		@Body() anchorDto: AnchorWithWalletDto,
		@ApiKey() key: ApiKeyEntity,
	): Promise<AnchorRequestResponseDto> {
		try {
			this.validateIfApiKeyAllowingPublicationToApplication(key, anchorDto.applicationId)
			this.validateGasPrice(key, anchorDto.gasPriceInAtomics);
			const application = await this.apiKeyService.findApplicationByApiKey(key);
			return this.operatorService.createAnchorWithWalletSession(application, anchorDto);
			this.logAnchorRequest(anchorDto)
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
	@Post('/wallet/:walletId/anchor')
	async anchor(
		@Body() anchorDto: AnchorDto,
		@ApiKey() key: ApiKeyEntity,
	): Promise<AnchorRequestResponseDto> {
		// find application and organization associated with the provided api key
		this.validateIfApiKeyAllowingPublicationToApplication(key, anchorDto.applicationId)
		this.validateGasPrice(key, anchorDto.gasPriceInAtomics);
		this.logAnchorRequest(anchorDto)
		const application = await this.apiKeyService.findApplicationByApiKey(key);
		const anchorRequest = await this.operatorService.anchor(application, anchorDto);
		return { anchorRequestId: anchorRequest.anchorRequestId }
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