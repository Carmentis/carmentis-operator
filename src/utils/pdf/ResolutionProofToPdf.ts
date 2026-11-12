import { LiquidProcessor } from '../templates/LiquidProcessor';
import { InjectionCodec } from '../templates/InjectionCodec';
import { MarkdownToPdf, PdfOptions } from './MarkdownToPdf';
import { WalletEntity } from "../../entities/WalletEntity";
import { ResolverHandler } from 'src/utils/resolver/ResolverHandler';
import { PdfAttachment } from 'src/utils/pdf/PdfAttachment';
import { Injectable } from '@nestjs/common';
import {
    ResolverInput,
    ResolverOutput,
    WrappedResolutionProof,
    ResolverReport,
    Provider,
    Crypto,
} from '@cmts-dev/carmentis-sdk-core'

@Injectable()
export class ResolutionProofToPdf {
    constructor(
        private readonly resolver: ResolverHandler,
    ) {}

    async renderFromInput(walletEntity: WalletEntity, provider: Provider, input: ResolverInput, options: PdfOptions): Promise<Buffer> {
        const { resolutionProof, report } = await this.resolver.resolveFromInput(walletEntity, provider, input);
        return this.render(resolutionProof, report, options);
    }

    async renderFromOutput(walletEntity: WalletEntity, provider: Provider, output: ResolverOutput, options: PdfOptions): Promise<Buffer> {
        const { resolutionProof, report } = await this.resolver.resolveFromOutput(walletEntity, provider, output);
        return this.render(resolutionProof, report, options);
    }

    private async render(resolutionProof: WrappedResolutionProof, report: ResolverReport, options: PdfOptions) {
        const proof = resolutionProof.proof;
        const representations = report.representations;

        // get the Liquid template
        if (representations.size !== 1) {
            throw new Error(`Expected exactly one representation, got ${representations.size}`);
        }
        const representation = representations.values().next().value;
        const template = representation.template;

        // process Liquid template
        const codec = new InjectionCodec;
        const liquidProcessor = new LiquidProcessor(codec);
        const markdown = await liquidProcessor.render(template, proof.resolvedJson);

        // process markdown
        const mdToPdf = new MarkdownToPdf(codec, options);
        let pdfBytes = await mdToPdf.render(markdown);

        // add attachment
        const attacher = new PdfAttachment(pdfBytes);
        const attachmentContent = JSON.stringify(resolutionProof);
        const hash = Crypto.Hashes.sha256((new TextEncoder).encode(attachmentContent));
        const attachmentName = `carmentis-proof-${hash.slice(0, 16)}.json`; 
        await attacher.attach(attachmentName, attachmentContent);
        pdfBytes = attacher.getPdfBytes();
        
        return pdfBytes;
    }
}
