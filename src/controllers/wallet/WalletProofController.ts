import { Controller, Get, Logger, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
	GetVirtualBlockchainAuthenticityProofRequestDto
} from '../../dto/wallet/GetVirtualBlockchainAuthenticityProofRequestDto';
import { WalletByIdPipe } from '../../pipes/WalletByIdPipe';
import { WalletEntity } from '../../entities/WalletEntity';
import { ProofService } from '../../services/ProofService';
import { API_V1 } from '../../api/ApiVersion';

@ApiTags('Wallet Proof')
@Controller({ path: 'wallet', version: API_V1 })
export class WalletProofController {

	private logger = new Logger();
	constructor(
		private readonly proofService: ProofService,
	) {}

	@ApiOperation({
		summary: 'Get authenticity proof for a virtual blockchain',
		description: 'Retrieves the authenticity proof for a specific virtual blockchain associated with a wallet.'
	})
	@ApiResponse({
		status: 200,
		description: 'The authenticity proof has been successfully retrieved.'
	})
	@Get('/:walletId/proof/authenticity')
	async getRecord(
		@Param('walletId', WalletByIdPipe) wallet: WalletEntity,
		@Query() request: GetVirtualBlockchainAuthenticityProofRequestDto
	) {
		const vbId = request.virtualBlockchainId;
		const author = request.proofAuthor;
		this.logger.log(`Returning authenticity proof for vb ${vbId} with author ${author}`)
		const proof = await this.proofService.getVbProof(vbId, wallet, author);
		return proof;
	}
}
