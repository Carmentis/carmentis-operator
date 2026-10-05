import { PrivateKeyObject, PrivateKeyObjectType } from '../types/types';
import { WalletUtils } from './WalletUtils';
import { JwkPrivateSignatureKey } from '@cmts-dev/carmentis-sdk-core';

export class PrivateKeyUtils {

	/**
	 * Generatest the private signature key from the private signature key object stored in the database.
	 * @param privateKey
	 */
	static async getPrivateSignatureKeyFromPrivateKeyObject(privateKey: PrivateKeyObject) {
		if (privateKey.keyType === PrivateKeyObjectType.SEED) {
			const seed = privateKey.seed;
			const accountCrypto = await WalletUtils.getAccountCryptoFromSeed(seed);
			return accountCrypto.getPrivateSignatureKey(privateKey.schemeId)
		} else {
			const jwk = privateKey.jwk;
			return JwkPrivateSignatureKey.fromJwk(jwk);
		}
	}
}