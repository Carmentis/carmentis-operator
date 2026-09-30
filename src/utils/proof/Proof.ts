import { WalletEntity } from 'src/entities/WalletEntity';
import { WalletUtils } from '../WalletUtils';
import { Hash } from '@cmts-dev/carmentis-sdk-core';

export class Proof {
    static async getVbProof(vbId: string, wallet: WalletEntity, proofAuthor?: string) {
        const author = proofAuthor ?? wallet.name;
        const accountCrypto = await WalletUtils.getAccountCryptoFromWallet(wallet);
        const vb = await Proof.getVb(vbId, wallet);
        const customInfo = { author };

        return await vb.exportProof(customInfo, accountCrypto);
    }

    private static async getVb(vbId: string, wallet: WalletEntity) {
        const provider = wallet.getProvider();
        const vb = await provider.loadApplicationLedgerVirtualBlockchain(Hash.from(vbId));
        return vb;
    }
}
