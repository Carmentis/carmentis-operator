import { WalletEntity } from "src/entities/WalletEntity";
import { OperatorResolverHydrator } from "./OperatorResolverHydrator";
import {
    Provider,
    Resolver,
    ResolutionProof,
    ResolverInput,
} from "@cmts-dev/carmentis-sdk-core";
import { Injectable } from '@nestjs/common';
import { WalletService } from '../../services/WalletService';

@Injectable()
export class ResolverHandler {

    constructor(
        private readonly walletService: WalletService
    ) {
    }

    async resolve(walletEntity: WalletEntity, provider: Provider, input: ResolverInput): Promise<ResolutionProof> {
        const hydrator = new OperatorResolverHydrator(
            this.walletService,
            walletEntity,
            provider
        );
        const resolver = new Resolver(provider, hydrator);
        const resolvedJson = await resolver.resolveFromInput(input);
        const proofs = hydrator.getProofs();

        return {
            linkedJson: input.linkedJson,
            resolvedJson,
            proofs,
            digestData: input.digestData,
        };
    }
}
