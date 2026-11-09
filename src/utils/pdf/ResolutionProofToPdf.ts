import { LiquidProcessor } from '../templates/LiquidProcessor';
import { InjectionCodec } from '../templates/InjectionCodec';
import { MarkdownToPdf, PdfOptions } from './MarkdownToPdf';
import { OperatorResolverHydrator } from '../resolver/OperatorResolverHydrator';
import { WalletEntity } from "../../entities/WalletEntity";
import { WalletService } from '../../services/WalletService';
import { Injectable } from '@nestjs/common';
import {
    Resolver,
    ResolverOutput,
    Provider,
} from '@cmts-dev/carmentis-sdk-core'

@Injectable()
export class ResolutionProofToPdf {
    constructor(
        private readonly walletService: WalletService,
    ) {}

    async render(walletEntity: WalletEntity, provider: Provider, output: ResolverOutput, options: PdfOptions): Promise<Buffer> {
        const hydrator = new OperatorResolverHydrator(
            this.walletService,
            walletEntity,
            provider
        );
        const resolver = new Resolver(provider, hydrator);
        const resolvedJson = await resolver.resolveFromOutput(output);
        const report = resolver.getReport();
        if (report.representations.size !== 1) {
            throw new Error(`Expected exactly one representation, got ${report.representations.size}`);
        }
        const representation = report.representations.values().next().value;
        const template = representation.template;

        const codec = new InjectionCodec;
        const liquidProcessor = new LiquidProcessor(codec);
        const markdown = await liquidProcessor.render(template, resolvedJson);
        const mdToPdf = new MarkdownToPdf(codec, options);
        const pdf = await mdToPdf.render(markdown);

        return pdf;
    }
}
