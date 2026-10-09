import { WalletEntity } from "src/entities/WalletEntity";
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
        const hydrator = new OperatorResolverHydrator(this.walletEntity, this.provider);
        const resolver = new Resolver(hydrator);
        const resolvedJson = await resolver.resolveFromInput(input);
        const proofs = hydrator.getProofs();
        const digestData = hydrator.getDigestData();

        return {
            linkedJson: input.linkedJson,
            resolvedJson,
            proofs,
            digestData,
        };
    }
}
