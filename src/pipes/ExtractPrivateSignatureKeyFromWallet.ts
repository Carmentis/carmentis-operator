import { Injectable, NotFoundException, PipeTransform } from '@nestjs/common';
import { WalletEntity } from '../entities/WalletEntity';
import { WalletService } from '../services/WalletService';
import { PrivateSignatureKey } from '@cmts-dev/carmentis-sdk-core';
import { WalletUtils } from '../utils/WalletUtils';

/**
 * Pipe to retrieve a wallet by its id
 */
@Injectable()
export class ExtractPrivateSignatureKeyFromWallet implements PipeTransform<WalletEntity, Promise<PrivateSignatureKey>> {
	constructor() {}

	async transform(wallet: WalletEntity): Promise<PrivateSignatureKey> {
		return WalletUtils.getPrivateSignatureKeyFromWallet(wallet)
	}
}