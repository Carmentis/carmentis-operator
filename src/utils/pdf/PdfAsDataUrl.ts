import { DataUrl } from '@cmts-dev/carmentis-sdk-templating';

export class PdfAsDataUrl {
    static dataUrlToBuffer(dataUrl: string) {
        const { subType } = DataUrl.getType(dataUrl, "application");
        if (subType !== 'pdf') {
            throw new Error("invalid application/pdf data URL");
        }
        const buffer = DataUrl.getDataAsBinary(dataUrl);
        PdfAsDataUrl.validateHeaderOrFail(buffer);
        return Buffer.from(buffer);
    }

    static bufferToDataUrl(buffer: Buffer) {
        PdfAsDataUrl.validateHeaderOrFail(buffer);
        return DataUrl.encode('application/pdf', buffer);
    }

    private static validateHeaderOrFail(data: Uint8Array) {
        // expected header: "%PDF-"
        const header = [ 0x25, 0x50, 0x44, 0x46, 0x2D ];
        if (header.some((v, i) => data[i] !== v)) {
            throw new Error("invalid PDF header");
        }
    }
}
