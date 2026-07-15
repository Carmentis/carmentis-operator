import { WalletEntity } from '../entities/WalletEntity';
import { SeedEncoder, WalletCrypto } from '@cmts-dev/carmentis-sdk-core';

export class WalletUtils {

	static async getPrivateSignatureKeyFromWallet(wallet: WalletEntity) {
		const accountCrypto = await this.getAccountCryptoFromWallet(wallet);
		return accountCrypto.getPrivateSignatureKey(wallet.signatureSchemeId);
	}

	static async getPrivateDecryptionKeyFromWallet(wallet: WalletEntity) {
		const accountCrypto = await this.getAccountCryptoFromWallet(wallet);
		return accountCrypto.getPrivateDecryptionKey(wallet.publicKeyEncryptionSchemeId);
	}

	static async getActorPrivateSignatureKeyFromWallet(wallet: WalletEntity, vbSeed: Uint8Array) {
		const actorCrypto = await this.getActorCryptoFromWallet(wallet, vbSeed);
		return actorCrypto.getPrivateSignatureKey(wallet.signatureSchemeId);
	}

	static async getActorPrivateDecryptionKeyFromWallet(wallet: WalletEntity, vbSeed: Uint8Array) {
		const actorCrypto = await this.getActorCryptoFromWallet(wallet, vbSeed);
		return actorCrypto.getPrivateDecryptionKey(wallet.publicKeyEncryptionSchemeId);
	}

	static async getAccountCryptoFromWallet(wallet: WalletEntity) {
		const seed = wallet.seed;
		const seedEncoder = new SeedEncoder();
		const rawSeed = seedEncoder.decode(seed);
		const walletCrypto = WalletCrypto.fromSeed(rawSeed);
		return walletCrypto.getDefaultAccountCrypto();
	}

	static async getActorCryptoFromWallet(wallet: WalletEntity, vbSeed: Uint8Array) {
		const accountCrypto = await this.getAccountCryptoFromWallet(wallet);
		return accountCrypto.getActor(vbSeed);
	}
}