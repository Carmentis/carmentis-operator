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
    OffchainDataHandler,
    AccountCrypto,
} from "@cmts-dev/carmentis-sdk-core";

export class OperatorResolverHydrator implements ResolverHydrator {
    private accountCrypto: AccountCrypto;
    private provider: Provider;
    private proofs: Map<string, AppLedgerProof> = new Map;
    private offchainData: Map<string, JsonObject> = new Map;

    constructor(accountCrypto: AccountCrypto, provider: Provider) {
        this.accountCrypto = accountCrypto;
        this.provider = provider;
    }

    getProofs() {
        return Object.fromEntries(this.proofs);
    }

    getOffchainData() {
        return Object.fromEntries(this.offchainData);
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

        const data = await vb.getRecord(height, this.accountCrypto);
        const proof = await vb.exportProof(
            { author: "" },
            this.accountCrypto,
            [ height ]
        );
        this.proofs.set(link, proof.proof);
        return data;
    }

    async hydrateOffchainData(onchainData: OnchainData): Promise<JsonData> {
        const offchainData = {};
        const digest = onchainData.digest;
        const res = OffchainDataHandler.inject(onchainData, offchainData);
        this.offchainData.set(digest, offchainData);
        return res;
    }
}
