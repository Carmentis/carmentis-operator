import {
    Provider,
    JsonData,
    ResolverHydrator,
    LinkResolver,
    MbRef,
    ApplicationLedgerVb,
    AppLedgerProof,
    JsonObject,
} from "@cmts-dev/carmentis-sdk-core";
import { WalletEntity } from "../../entities/WalletEntity";
import { WalletService } from "../../services/WalletService";

export class OperatorResolverHydrator implements ResolverHydrator {
    private proofs: Map<string, AppLedgerProof> = new Map;

    constructor(
        private readonly walletService: WalletService,
        private readonly walletEntity: WalletEntity,
        private readonly provider: Provider
    ) {}

    getProofs() {
        return Object.fromEntries(this.proofs);
    }

    async hydrateMicroblock(link: string, mbRef: MbRef): Promise<JsonData> {
        const { vb, height } = await LinkResolver.getMicroblockLocation(this.provider, mbRef);

        if (!(vb instanceof ApplicationLedgerVb)) {
            throw new Error(`the microblock does not belong to an application ledger`);
        }

		const vbSeedHash = await vb.getGenesisSeed();
		const vbSeed = vbSeedHash.toBytes();
		const actorIdentity = await this.walletService.getActorIdentity(this.walletEntity, vbSeed);
        const data = await vb.getRecord(height, actorIdentity);
        const proof = await vb.exportMicroblockProof(
            actorIdentity,
            height,
        );
        this.proofs.set(link, proof);
        return data;
    }
}
