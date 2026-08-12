import { Body, Controller, Get, Logger, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { WalletService } from '../../services/WalletService';
import { GetVirtualBlockchainRecordRequestDto } from '../../dto/wallet/GetVirtualBlockchainRecordRequestDto';
import { VbUtils } from '../../utils/VbUtils';
import { WalletUtils } from '../../utils/WalletUtils';
import { Hash } from '@cmts-dev/carmentis-sdk-core';
import {
	GetVirtualBlockchainAuthenticityProofRequestDto
} from '../../dto/wallet/GetVirtualBlockchainAuthenticityProofRequestDto';

@ApiTags('Wallet Proof')
@Controller('/api/wallet')
export class WalletProofController {

	private logger = new Logger();
	constructor(
		private readonly walletService: WalletService,
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
		@Param('walletId', ParseIntPipe) walletId: number,
		@Query() request: GetVirtualBlockchainAuthenticityProofRequestDto
	) {
		const vbId = request.virtualBlockchainId;
		this.logger.log(`Returning authenticity proof for vb ${vbId}`)
		const wallet = await this.walletService.getOneById(walletId)
		const rawVbId = Buffer.from(vbId, 'hex')
		const vbSeed = await VbUtils.getVbSeedFromVbId(wallet, rawVbId)
		const accountCrypto = await WalletUtils.getAccountCryptoFromWallet(wallet);
		const provider = wallet.getProvider();
		const vb = await provider.loadApplicationLedgerVirtualBlockchain(Hash.from(vbId))
		const author = request.proofAuthor ?? wallet.name;
		const proof = await vb.exportProof({
			author
		}, accountCrypto)
		return proof;
	}
}