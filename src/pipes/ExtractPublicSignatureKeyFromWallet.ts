import { Injectable, NotFoundException, PipeTransform } from '@nestjs/common';
import { WalletEntity } from '../entities/WalletEntity';
import { WalletService } from '../services/WalletService';
import { PrivateSignatureKey, PublicSignatureKey } from '@cmts-dev/carmentis-sdk-core';
import { WalletUtils } from '../utils/WalletUtils';

/**
 * Pipe to retrieve a wallet by its id
 */
@Injectable()
export class ExtractPublicSignatureKeyFromWallet implements PipeTransform<WalletEntity, Promise<PublicSignatureKey>> {
	constructor() {}

	async transform(wallet: WalletEntity): Promise<PublicSignatureKey> {
		const sk = await WalletUtils.getPrivateSignatureKeyFromWallet(wallet)
		return sk.getPublicKey();
	}
}