import { WalletEntity } from 'src/entities/WalletEntity';
import { VbUtils } from 'src/utils/VbUtils';
import { WalletService } from './WalletService';
import { Hash } from '@cmts-dev/carmentis-sdk-core';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ProofService {
    constructor(
        private readonly walletService: WalletService,
    ) {}

    async getVbProof(vbId: string, wallet: WalletEntity, proofAuthor?: string) {
        const author = proofAuthor ?? wallet.name;
		const rawVbId = Buffer.from(vbId, 'hex')
		const vbSeed = await VbUtils.getVbSeedFromVbId(wallet, rawVbId)
		const actorIdentity = await this.walletService.getActorIdentity(wallet, vbSeed);
        const vb = await this.getVb(vbId, wallet);
        const customInfo = { author };

        return await vb.exportProof(customInfo, actorIdentity);
    }

    private async getVb(vbId: string, wallet: WalletEntity) {
        const provider = wallet.getProvider();
        const vb = await provider.loadApplicationLedgerVirtualBlockchain(Hash.from(vbId));
        return vb;
    }
}
