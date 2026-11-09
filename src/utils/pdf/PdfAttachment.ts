import { PDF } from '@libpdf/core';

export class PdfAttachment {
    private pdfBytes: Buffer;

    constructor(pdfBytes: Buffer) {
        this.pdfBytes = pdfBytes;
    }

    getPdfBytes() {
        return this.pdfBytes;
    }

    async attach(name: string, content: string) {
        const pdfDoc = await PDF.load(new Uint8Array(this.pdfBytes));
        const contentAsBinary = new TextEncoder().encode(content);
        pdfDoc.addAttachment(name, contentAsBinary);
        this.pdfBytes = Buffer.from(await pdfDoc.save());
    }    
}
