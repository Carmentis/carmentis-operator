export class PdfAsDataUrl {
    static dataUrlToBinary(dataUrl: string) {
        const match = dataUrl.match(/^data:application\/pdf;base64,(.*)/);
        if (!match) {
            throw new Error("invalid data URL");
        }
        const buffer = Buffer.from(match[1], 'base64');
        PdfAsDataUrl.validateHeaderOrFail(buffer);
        return buffer;
    }

    static binaryToDataUrl(buffer: Buffer) {
        PdfAsDataUrl.validateHeaderOrFail(buffer);
        return `data:application/pdf;base64,${buffer.toString('base64')}`;
    }

    private static validateHeaderOrFail(buffer: Buffer) {
        // expected header: "%PDF-"
        const header = [ 0x25, 0x50, 0x44, 0x46, 0x2D ];
        if (header.some((v, i) => buffer[i] !== v)) {
            throw new Error("invalid PDF header");
        }
    }
}
