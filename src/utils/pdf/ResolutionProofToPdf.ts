import { MarkdownToPdf, PdfOptions } from './MarkdownToPdf';
import { WalletEntity } from "../../entities/WalletEntity";
import { ResolverHandler } from 'src/utils/resolver/ResolverHandler';
import { PdfAttachment } from 'src/utils/pdf/PdfAttachment';
import { Injectable } from '@nestjs/common';
import {
    RepresentationSelectionEnum,
    InjectionCodec,
    RepresentationProcessor,
} from '@cmts-dev/carmentis-sdk-templating';
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
        const representationOptions = options.representations ?? { select: RepresentationSelectionEnum.ALL };
        const markdown = await RepresentationProcessor.toMarkdown(proof.resolvedJson, representations, representationOptions);

        // process markdown
        const codec = new InjectionCodec;
        const mdToPdf = new MarkdownToPdf(codec, options);
        let pdfBytes = await mdToPdf.render(markdown);

        // attach the proof
        const attacher = new PdfAttachment(pdfBytes);
        const proofAttachmentContent = JSON.stringify(resolutionProof);
        const hash = Crypto.Hashes.sha256((new TextEncoder).encode(proofAttachmentContent));
        const proofAttachmentName = `carmentis-proof-${hash.slice(0, 16)}.json`; 
        await attacher.attach(proofAttachmentName, proofAttachmentContent);

        // attach options.json
        const attachedOptions = {...options};
        attachedOptions.coverPage = {...attachedOptions.coverPage};
        delete attachedOptions.coverPage?.logo;
        const optionsAttachmentContent = JSON.stringify(attachedOptions);
        await attacher.attach("options.json", optionsAttachmentContent);

        pdfBytes = attacher.getPdfBytes();
        
        return pdfBytes;
    }
}
