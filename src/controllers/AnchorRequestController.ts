import { BadRequestException, Body, Controller, Delete, Get, Logger, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { WalletAnchoringRequestService } from '../services/wallet-anchoring-request.service';
import { AnchorRequestService } from '../services/AnchorRequestService';
import { AnchorRequestStatusResponseDto } from '../dto/AnchorRequestStatusResponseDto';
import { AnchorRequestEntity } from '../entities/AnchorRequestEntity';
import { GetAllElementsDto } from '../dto/GetAllElementsDto';
import { WalletService } from '../services/WalletService';
import { MicroblockUtils } from '../utils/MicroblockUtils';
import { AnchorRequestStatus } from '../utils/AnchorRequestStatus';
import { GetAuthenticityProofRequestDto } from '../dto/wallet/GetVirtualBlockchainAuthenticityProofRequestDto';
import { VbUtils } from '../utils/VbUtils';
import { WalletUtils } from '../utils/WalletUtils';
import { Hash } from '@cmts-dev/carmentis-sdk-core';
import { UserService } from '../services/UserService';
import { ApiKey } from '../decorators/ApiKeyDecorator';
import { ApiKeyEntity } from '../entities/ApiKeyEntity';

@ApiTags('Anchor Request')
@Controller('/api/anchorRequest')
export class AnchorRequestController {

	private logger = new Logger();
	constructor(
		private readonly operatorService: WalletAnchoringRequestService,
		private readonly anchorService: AnchorRequestService,
		private readonly walletService: WalletService,
		private readonly userService: UserService,
	) {}


	/**
	 * Returns the status of an anchor request.
	 *
	 * @param anchorRequestId
	 */
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
	@Get(':anchorRequestId/status')
	async getAnchorRequestStatus(
		@Param('anchorRequestId') anchorRequestId: string,
	): Promise<AnchorRequestStatusResponseDto> {
		const request = await this.operatorService.getAnchorRequestFromAnchorRequestId(anchorRequestId);
		return {
			status: request.status,
			virtualBlockchainId: request.virtualBlockchainId,
			submittedMicroblockHash: request.submittedMicroblockHash
		}
	}


	/**
	 * Cancels an anchor request.
	 * @param anchorRequestId
	 */
	@ApiOperation({
		summary: 'Cancel an anchor request',
		description: 'This endpoint is used to cancel an anchor request.'
	})
	@ApiSecurity('api-key')
	@Post(':anchorRequestId/cancel')
	async cancelAnchorRequest(
		@Param('anchorRequestId') anchorRequestId: string,
	) {
		return this.anchorService.cancelAnchorRequestByAnchorRequestId(anchorRequestId);
	}


	/**
	 * Returns all anchor requests.
	 *
	 * @param getAllElementsDto
	 */
	@ApiOperation({
		summary: 'Returns all anchor requests',
		description: 'This endpoint is used to get all anchor requests.'
	})
	@ApiSecurity('api-key')
	@Get()
	async getAllAnchorRequests(
		@Body() getAllElementsDto: GetAllElementsDto = new GetAllElementsDto(),
	) {
		const anchorRequest = await this.anchorService.getAllAnchorRequests(
			getAllElementsDto.offset,
			getAllElementsDto.limit
		);

		return await Promise.all(anchorRequest.map(async ar => await this.formatAnchorRequestInJSON(ar)));
	}



	@ApiOperation({
		summary: 'Get authenticity proof for a virtual blockchain',
		description: 'Retrieves the authenticity proof for a specific virtual blockchain associated with a wallet.'
	})
	@ApiResponse({
		status: 200,
		description: 'The authenticity proof has been successfully retrieved.'
	})
	@Get(':anchorRequestId/proof/authenticity')
	async getRecord(
		@ApiKey() apiKey: ApiKeyEntity,
		@Param('anchorRequestId') anchorRequestId: string,
		@Body() request: GetAuthenticityProofRequestDto
	) {
		// fetch the wallet from the api key
		const wallet = apiKey.wallet;
		if (!wallet) {
			throw new BadRequestException('Cannot produce a proof for an api key not associated with a wallet.');
		}

		// fetch the virtual blockchain id from the anchor request
		const anchorRequest = await this.anchorService.findOneByAnchorRequestId(anchorRequestId);
		if (
			anchorRequest.status !== AnchorRequestStatus.SUBMITTED ||
			!anchorRequest.virtualBlockchainId
		) {
			throw new BadRequestException('Cannot produce a proof for an anchor request that is not submitted.');
		}

		const vbId = anchorRequest.virtualBlockchainId;

		const author = !!request && request.proofAuthor ?
			request.proofAuthor :
			wallet.name;

		this.logger.log(`Returning authenticity proof for vb ${vbId} with author ${author}`)
		const rawVbId = Buffer.from(vbId, 'hex')
		const vbSeed = await VbUtils.getVbSeedFromVbId(wallet, rawVbId)
		const actorCrypto = await WalletUtils.getActorCryptoFromWallet(wallet, vbSeed);
		const provider = wallet.getProvider();
		const vb = await provider.loadApplicationLedgerVirtualBlockchain(Hash.from(vbId))
		this.logger.log(`Returning authenticity proof for vb ${vbId} with author ${author}`)
		return await vb.exportProof({
			author
		}, actorCrypto);
	}


	/**
	 * Returns an anchor request.
	 *
	 * @param anchorRequestId
	 */
	@ApiOperation({
		summary: 'Get an anchor request by ID',
		description: 'Retrieves detailed information about a specific anchor request.'
	})
	@ApiResponse({
		status: 200,
		description: 'The anchor request details.'
	})
	@ApiSecurity('api-key')
	@Get(`:anchorRequestId`)
	async getAnchorRequestById(
		@Param('anchorRequestId') anchorRequestId: string,
	) {
		return await AnchorRequestEntity.findOne({
			where: {
				anchorRequestId
			},
			select: [
				'anchorRequestId',
				'submittedMicroblockHash',
				'virtualBlockchainId',
				'createdAt',
				'virtualBlockchainExpiration',
				'submittedMicroblockHeight',
				'generatedGenesisSeed',
				'receivedAnchorRequest',
				'status'
			]
		})
	}

	private async formatAnchorRequestInJSON(ar: AnchorRequestEntity) {
		return {
			anchorRequestId: ar.anchorRequestId,
			status: ar.getStatus(),
			applicationVbId: ar.application.vbId,
			submittedMicroblockHash: ar.submittedMicroblockHash,
			createdAt: ar.createdAt,
			submittedAt: ar.submittedAt,
			virtualBlockchainId: ar.virtualBlockchainId,
		}
	}


	/**
	 * Deletes an anchor request.
	 *
	 * @param anchorRequestId
	 */
	@ApiOperation({
		summary: 'Delete an anchor request',
		description: 'Deletes a specific anchor request by its ID.'
	})
	@ApiResponse({
		status: 200,
		description: 'The anchor request has been deleted.',
		schema: {
			properties: {
				affected: { type: 'number' }
			}
		}
	})
	@ApiSecurity('api-key')
	@Delete(`:anchorRequestId`)
	async deleteAnchorRequestById(
		@Param('anchorRequestId') anchorRequestId: string,
	) {
		const anchorRequest = await this.anchorService.deleteAnchorRequestByAnchorRequestId(anchorRequestId);
		return { affected: anchorRequest.affected };
	}


	/**
	 * Checks if a microblock is published on the blockchain.
	 */
	@ApiOperation({
		summary: 'Checks if a microblock is published on the blockchain.',
	})
	@ApiSecurity('api-key')
	@Get(':anchorRequestId/published')
	async isPublishedOnChain(
		@Param('anchorRequestId') anchorRequestId: string,
	) {
		// return false if not submitted
		const anchorRequest = await this.anchorService.getAnchorRequestByAnchorRequestId(anchorRequestId);
		if (anchorRequest.status !== AnchorRequestStatus.SUBMITTED)
			return { isPublished: false };

		const applicationId = anchorRequest.application.vbId;
		const wallet = await this.walletService.getWalletByApplicationId(applicationId);
		const provider = wallet.getProvider();
		try {
			await provider.loadMicroblockByMicroblockHash(
				MicroblockUtils.decodeMicroblockHash(anchorRequest.submittedMicroblockHash)
			);
			return { isPublished: true };
		} catch (e) {
			return { isPublished: false };
		}

	}
}