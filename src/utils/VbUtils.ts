import { WalletEntity } from '../entities/WalletEntity';
import { Hash, ProviderFactory } from '@cmts-dev/carmentis-sdk-core';

export class VbUtils {
	/**
	 * Canonical form under which virtual blockchain ids are stored and compared: the indexer
	 * answers in upper-case hexadecimal while the SDK may encode in lower-case.
	 */
	static normalizeVbId(vbId: string): string {
		return vbId.trim().toUpperCase();
	}

	static async getVbSeedFromVbId(wallet: WalletEntity, vbId: Uint8Array) {
		const provider = ProviderFactory.createInMemoryProviderWithExternalProvider(wallet.rpcEndpoint)
		const vb = await provider.loadVirtualBlockchain(Hash.from(vbId))
		const vbSeed = await vb.getGenesisSeed();
		return vbSeed.toBytes();
	}
}