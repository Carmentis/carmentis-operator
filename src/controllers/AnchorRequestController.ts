import { Body, Controller, Delete, Get, Logger, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiSecurity } from '@nestjs/swagger';
import { WalletAnchoringRequestService } from '../services/wallet-anchoring-request.service';
import { AnchorRequestService } from '../services/AnchorRequestService';
import { AnchorRequestStatusResponseDto } from '../dto/AnchorRequestStatusResponseDto';
import { AnchorRequestEntity } from '../entities/AnchorRequestEntity';
import { GetAllElementsDto } from '../dto/GetAllElementsDto';
import { WalletService } from '../services/WalletService';
import { MicroblockUtils } from '../utils/MicroblockUtils';

@Controller('/api/anchorRequest')
export class AnchorRequestController {

	private logger = new Logger();
	constructor(
		private readonly operatorService: WalletAnchoringRequestService,
		private readonly anchorService: AnchorRequestService,
		private readonly walletService: WalletService,
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
	) {
		return await this.operatorService.getAnchorRequestFromAnchorRequestId(anchorRequestId);
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


	/**
	 * Returns an anchor request.
	 *
	 * @param anchorRequestId
	 */
	@ApiSecurity('api-key')
	@Get(`:anchorRequestId`)
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
			submittedMicroblockHash: ar.submittedMicroblockHash,
			createdAt: ar.createdAt,
			submittedAt: ar.submittedAt,
			virtualBlockchainId: ar.virtualBlockchainId
		}
	}


	/**
	 * Deletes an anchor request.
	 *
	 * @param anchorRequestId
	 */
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
		// TODO: return false if not submitted
		const anchorRequest = await this.anchorService.getAnchorRequestByAnchorRequestId(anchorRequestId);
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