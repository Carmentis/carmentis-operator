import { WalletEntity } from "src/entities/WalletEntity";
import { WalletUtils } from "../WalletUtils";
import { OperatorResolverHydrator } from "./OperatorResolverHydrator";
import {
    Provider,
    Resolver,
    ResolutionProof,
    ResolverInput,
} from "@cmts-dev/carmentis-sdk-core";

export class ResolverHandler {
    private walletEntity: WalletEntity;
    private provider: Provider;

    constructor(walletEntity: WalletEntity, provider: Provider) {
        this.walletEntity = walletEntity;
        this.provider = provider;
    }

    async resolve(input: ResolverInput): Promise<ResolutionProof> {
        const accountCrypto = await WalletUtils.getAccountCryptoFromWallet(this.walletEntity);
        const hydrator = new OperatorResolverHydrator(accountCrypto, this.provider);
        const resolver = new Resolver(hydrator);
        const resolvedJson = await resolver.resolveFromInput(input);
        const proofs = hydrator.getProofs();
        const offchainData = hydrator.getOffchainData();

        return {
            linkedJson: input.linkedJson,
            resolvedJson,
            proofs,
            offchainData,
        };
    }
}
