import { WalletEntity } from '../entities/WalletEntity';
import { Hash, ProviderFactory } from '@cmts-dev/carmentis-sdk-core';

export class VbUtils {
	static async getVbSeedFromVbId(wallet: WalletEntity, vbId: Uint8Array) {
		const provider = ProviderFactory.createInMemoryProviderWithExternalProvider(wallet.rpcEndpoint)
		const vb = await provider.loadVirtualBlockchain(Hash.from(vbId))
		const vbSeed = await vb.getGenesisSeed();
		return vbSeed.toBytes();
	}
}