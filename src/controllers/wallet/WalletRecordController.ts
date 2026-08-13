import { Controller, Get, Logger, OnModuleInit, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiKeyService } from '../../services/ApiKeyService';
import { WalletAnchoringRequestService } from '../../services/wallet-anchoring-request.service';
import ChainService from '../../services/ChainService';
import { AnchorRequestService } from '../../services/AnchorRequestService';
import { VbUtils } from '../../utils/VbUtils';
import { WalletUtils } from '../../utils/WalletUtils';
import { GetVirtualBlockchainRecordRequestDto } from '../../dto/wallet/GetVirtualBlockchainRecordRequestDto';
import { Hash } from '@cmts-dev/carmentis-sdk-core';
import { WalletService } from '../../services/WalletService';
import { WalletEntity } from '../../entities/WalletEntity';
import { WalletByIdPipe } from '../../pipes/WalletByIdPipe';

@ApiTags('Wallet Record')
@Controller('/api/wallet')
export class WalletRecordController {

	private logger = new Logger();

	@ApiOperation({
		summary: 'Get a record from a virtual blockchain',
		description: 'Retrieves a record from a specific virtual blockchain at a given block height.'
	})
	@ApiResponse({
		status: 200,
		description: 'The record has been successfully retrieved.'
	})
	@Get('/:walletId/record')
	async getRecord(
		@Param('walletId', WalletByIdPipe) wallet: WalletEntity,
		@Query() request: GetVirtualBlockchainRecordRequestDto
	) {
		const vbId = request.vbId;
		const height = request.height;
		this.logger.log(`Accessing record for vb ${vbId} at height ${height}`)
		const accountCrypto = await WalletUtils.getAccountCryptoFromWallet(wallet);
		const provider = wallet.getProvider();
		const vb = await provider.loadApplicationLedgerVirtualBlockchain(Hash.from(vbId))
		return vb.getRecord(height, accountCrypto);
	}
}