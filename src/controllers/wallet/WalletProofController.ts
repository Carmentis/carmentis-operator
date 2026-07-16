import { Body, Controller, Get, Logger, Param, ParseIntPipe } from '@nestjs/common';
import { WalletService } from '../../services/WalletService';
import { GetVirtualBlockchainRecordRequestDto } from '../../dto/wallet/GetVirtualBlockchainRecordRequestDto';
import { VbUtils } from '../../utils/VbUtils';
import { WalletUtils } from '../../utils/WalletUtils';
import { Hash } from '@cmts-dev/carmentis-sdk-core';
import {
	GetVirtualBlockchainAuthenticityProofRequestDto
} from '../../dto/wallet/GetVirtualBlockchainAuthenticityProofRequestDto';

@Controller('/api/wallet')
export class WalletProofController {

	private logger = new Logger();
	constructor(
		private readonly walletService: WalletService,
	) {}


	@Get('/:walletId/proof/authenticity')
	async getRecord(
		@Param('walletId', ParseIntPipe) walletId: number,
		@Body() request: GetVirtualBlockchainAuthenticityProofRequestDto
	) {
		const vbId = request.vbId;
		this.logger.log(`Returning authenticity proof for vb ${vbId}`)
		const wallet = await this.walletService.findOneBy({ walletId });
		const rawVbId = Buffer.from(vbId, 'hex')
		const vbSeed = await VbUtils.getVbSeedFromVbId(wallet, rawVbId)
		const actorCrypto = await WalletUtils.getActorCryptoFromWallet(wallet, vbSeed);
		const provider = wallet.getProvider();
		const vb = await provider.loadApplicationLedgerVirtualBlockchain(Hash.from(vbId))
		const author = request.proofAuthor ?? wallet.name;
		const proof = await vb.exportProof({
			author
		}, actorCrypto)
		return proof;

	}
}