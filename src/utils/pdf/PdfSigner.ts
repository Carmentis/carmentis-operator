import { PDF, P12Signer, SignOptions } from '@libpdf/core';

export class PdfSigner {
    private pdfBytes: Buffer;

    constructor(pdfBytes: Buffer) {
        this.pdfBytes = pdfBytes;
    }

    getPdfBytes() {
        return this.pdfBytes;
    }

    async signWithP12(p12Bytes: Uint8Array, password: string) {
        const pdfDoc = await PDF.load(new Uint8Array(this.pdfBytes));
        const signer = await P12Signer.create(p12Bytes, password);
        const options: SignOptions = {
            signer
        };
        const signed = await pdfDoc.sign(options);
        this.pdfBytes = Buffer.from(signed.bytes);
    }    
}
