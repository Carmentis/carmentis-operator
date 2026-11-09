import fs from 'fs';
import { LiquidProcessor } from '../src/utils/templates/LiquidProcessor';
import { InjectionCodec } from '../src/utils/templates/InjectionCodec';
import { MarkdownToPdf } from '../src/utils/pdf/MarkdownToPdf';
import { PdfAttachment } from '../src/utils/pdf/PdfAttachment';
import { PdfSigner } from '../src/utils/pdf/PdfSigner';
import { PdfAsDataUrl } from '../src/utils/pdf/PdfAsDataUrl';
import { Utils } from '@cmts-dev/carmentis-sdk-core';

(async function() {
    const logo = fs.readFileSync('./filesign.png');
    const logoBase64 = `data:image/png;base64,${logo.toString('base64')}`;
    const codec = new InjectionCodec;

    const mdToPdf = new MarkdownToPdf(
        codec,
        {
            fontRatio: 0.8,
            creationDate: (new Date(2026, 10, 4)).toISOString(),
            coverPage: {
                logo: logoBase64,
                title: "FileSign Proof",
            },
            injectedText: {
                color: "#5B21B6",
                bold: true,
            },
            language: "en",
        }
    );

    const template = fs.readFileSync("./template.md").toString();
    const json = fs.readFileSync("./data.json").toString();
    const data = JSON.parse(json);
    const liquidProcessor = new LiquidProcessor(codec);
    const markdown = await liquidProcessor.render(template, data);

    let pdf = await mdToPdf.render(markdown);

    // binary <-> data URL conversion test
    const pdfAsDataUrl = PdfAsDataUrl.binaryToDataUrl(pdf);
    const rebuiltPdf = PdfAsDataUrl.dataUrlToBinary(pdfAsDataUrl);
    if (!Utils.binaryIsEqual(pdf, rebuiltPdf)) {
        throw new Error('error during binary <-> data URL conversion');
    }

    // add attachment
    const attacher = new PdfAttachment(pdf);
    await attacher.attach("proof.json", json);
    pdf = attacher.getPdfBytes();
    fs.writeFileSync("test.pdf", pdf);

    // sign
    const signer = new PdfSigner(pdf);
    const p12Bytes = fs.readFileSync("./cert/demo.p12");
    await signer.signWithP12(p12Bytes, "demo");
    pdf = signer.getPdfBytes();
    fs.writeFileSync("signed.pdf", pdf);
})();
