import { Body, Controller, Get, Logger, Param, ParseIntPipe } from '@nestjs/common';
import { ApiKeyService } from '../../services/ApiKeyService';
import { WalletAnchoringRequestService } from '../../services/wallet-anchoring-request.service';
import ChainService from '../../services/ChainService';
import { AnchorRequestService } from '../../services/AnchorRequestService';
import { VbUtils } from '../../utils/VbUtils';
import { WalletUtils } from '../../utils/WalletUtils';
import { GetVirtualBlockchainRecordRequestDto } from '../../dto/wallet/GetVirtualBlockchainRecordRequestDto';
import { Hash } from '@cmts-dev/carmentis-sdk-core';
import { WalletService } from '../../services/WalletService';

@Controller('/api/wallet')
export class WalletRecordController {

	private logger = new Logger();
	constructor(
		private readonly walletService: WalletService,
	) {}


	@Get('/:walletId/record')
	async getRecord(
		@Param('walletId', ParseIntPipe) walletId: number,
		@Body() request: GetVirtualBlockchainRecordRequestDto
	) {
		const vbId = request.vbId;
		const height = request.height;
		this.logger.log(`Accessing record for vb ${vbId} at height ${height}`)
		const wallet = await this.walletService.findOneBy({ walletId });
		const rawVbId = Buffer.from(vbId, 'hex')
		const vbSeed = await VbUtils.getVbSeedFromVbId(wallet, rawVbId)
		const actorCrypto = await WalletUtils.getActorCryptoFromWallet(wallet, vbSeed);
		const provider = wallet.getProvider();
		const vb = await provider.loadApplicationLedgerVirtualBlockchain(Hash.from(vbId))
		return vb.getRecord(height, actorCrypto);
	}
}