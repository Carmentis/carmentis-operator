import { Injectable, PipeTransform } from '@nestjs/common';
import { WalletEntity } from '../entities/WalletEntity';
import { WalletService } from '../services/WalletService';
import { PrivateSignatureKey } from '@cmts-dev/carmentis-sdk-core';

/**
 * Pipe to retrieve a wallet by its id
 */
@Injectable()
export class ExtractPrivateSignatureKeyFromWallet implements PipeTransform<WalletEntity, Promise<PrivateSignatureKey>> {
	constructor(
		private walletService: WalletService
	) {}

	async transform(wallet: WalletEntity): Promise<PrivateSignatureKey> {
		return await this.walletService.getPrivateKeyOfWallet(wallet.id);
	}
}