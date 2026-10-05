import { Injectable } from '@nestjs/common';
import { PrivateKeyObject } from '../types/types';
import { PrivateKeyEntity } from '../entities/PrivateKeyEntity';
import { WalletEntity } from '../entities/WalletEntity';

/**
 * This service is responsible for managing private keys.
 */
@Injectable()
export class PrivateKeyService {

	/**
	 * Creates and persists a private key entity.
	 * @param privateKey
	 */
	async createPrivateKey(privateKey: PrivateKeyObject) {
		return PrivateKeyEntity.create({
			privateKey,
		})
	}
}