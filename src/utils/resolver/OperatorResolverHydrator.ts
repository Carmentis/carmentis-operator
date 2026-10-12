import {
    Provider,
    JsonData,
    ResolverHydrator,
    MbRef,
    OnchainData,
    ApplicationLedgerVb,
    Utils,
    Hash,
    AppLedgerProof,
    JsonObject,
    DigestDataHandler,
} from "@cmts-dev/carmentis-sdk-core";
import { WalletEntity } from "../../entities/WalletEntity";
import { WalletService } from "../../services/WalletService";

export class OperatorResolverHydrator implements ResolverHydrator {
    private proofs: Map<string, AppLedgerProof> = new Map;
    private digestData: Map<string, JsonObject> = new Map;


    constructor(
        private readonly walletService: WalletService,
        private readonly walletEntity: WalletEntity,
        private readonly provider: Provider
    ) {}



    getProofs() {
        return Object.fromEntries(this.proofs);
    }

    getDigestData() {
        return Object.fromEntries(this.digestData);
    }

    async hydrateMicroblock(link: string, mbRef: MbRef): Promise<JsonData> {
        let vbId: string;
        let height: number;

        if (mbRef.hash !== undefined) {
            const mbInfo = await this.provider.getMicroblockInformation(Utils.binaryFromHexa(mbRef.hash));
            if (mbInfo === null) {
                throw new Error(`microblock not found`);
            }
            vbId = Utils.binaryToHexa(mbInfo.virtualBlockchainId);
            height = mbInfo.header.height;
        } else if (mbRef.vb !== undefined && mbRef.height !== undefined) {
            vbId = mbRef.vb.id;
            height = mbRef.height;            
        } else {
            throw new Error(`inconsistent microblock reference`);
        }

        const vb = await this.provider.loadVirtualBlockchain(Hash.from(vbId));

        if (!(vb instanceof ApplicationLedgerVb)) {
            throw new Error(`the microblock does not belong to an application ledger`);
        }

		const vbSeedHash = await vb.getGenesisSeed();
		const vbSeed = vbSeedHash.toBytes();
		const actorIdentity = await this.walletService.getActorIdentity(this.walletEntity, vbSeed);
        const data = await vb.getRecord(height, actorIdentity);
        const proof = await vb.exportProof(
            { author: "" },
            actorIdentity,
            [ height ]
        );
        this.proofs.set(link, proof.proof);
        return data;
    }

    async hydrateDigestData(onchainData: OnchainData): Promise<JsonData> {
        const digestData = {};
        const digest = onchainData.digest;
        const res = DigestDataHandler.jsonFromDigestData(onchainData, digestData);
        this.digestData.set(digest, digestData);
        return res;
    }
}
