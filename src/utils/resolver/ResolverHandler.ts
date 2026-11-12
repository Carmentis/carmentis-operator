import { WalletEntity } from "src/entities/WalletEntity";
import { OperatorResolverHydrator } from "./OperatorResolverHydrator";
import {
    Provider,
    Resolver,
    WrappedResolutionProof,
    ResolutionProofWrapper,
    ResolverInput,
    ResolverOutput,
    ResolverReport,
    JsonObject,
} from "@cmts-dev/carmentis-sdk-core";
import { Injectable } from '@nestjs/common';
import { WalletService } from '../../services/WalletService';

interface ResolutionResult {
    resolutionProof: WrappedResolutionProof,
    report: ResolverReport
}

@Injectable()
export class ResolverHandler {
    constructor(
        private readonly walletService: WalletService
    ) {}

    async resolveFromInput(walletEntity: WalletEntity, provider: Provider, input: ResolverInput): Promise<ResolutionResult> {
        return await this.resolve(walletEntity, provider, input, true);
    }

    async resolveFromOutput(walletEntity: WalletEntity, provider: Provider, output: ResolverOutput): Promise<ResolutionResult> {
        return await this.resolve(walletEntity, provider, output, false);
    }

    private async resolve(walletEntity: WalletEntity, provider: Provider, json: ResolverInput | ResolverOutput, fromInput: boolean) {
        const hydrator = new OperatorResolverHydrator(
            this.walletService,
            walletEntity,
            provider
        );
        const resolver = new Resolver(provider, hydrator);
        const chainId = await provider.getChainId();
        let resolvedJson: JsonObject;
        if (fromInput) {
            resolvedJson = await resolver.resolveFromInput(json as ResolverInput);
        }
        else {
            resolvedJson = await resolver.resolveFromOutput(json as ResolverOutput);
        }
        const proofs = hydrator.getProofs();
        const report = resolver.getReport();

        const proof = ResolutionProofWrapper.createEmptyProof(chainId);
        proof.setLinkedJson(json.linkedJson);
        proof.setResolvedJson(resolvedJson);
        proof.setDigestData(json.digestData);
        proof.setProofs(proofs);

        return {
            resolutionProof: proof.getObject(),
            report
        };
    }
}
