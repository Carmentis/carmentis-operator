export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

// PNGs are decoded by pdfmake: guard against huge declared sizes
const MAX_PNG_PIXELS = 25_000_000;

export function imageKind(bytes: Uint8Array): 'png' | 'jpeg' | null {
    if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return 'png';
    if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'jpeg';
    return null;
}

/** Accepts only base64 PNG/JPEG data URLs whose content matches the declared type; anything else becomes '#'. */
export function sanitizeImageDataUrl(url: string): string {
    const m = /^data:image\/(png|jpeg);base64,([A-Za-z0-9+/]+={0,2})$/.exec(url);
    if (!m || m[2].length > Math.ceil(MAX_IMAGE_BYTES * 4 / 3) + 4) return '#';

    const bytes = Buffer.from(m[2], 'base64');
    if (bytes.length > MAX_IMAGE_BYTES || imageKind(bytes) !== m[1]) return '#';

    if (m[1] === 'png') {
        // width/height are big-endian uint32 at offsets 16 and 20 (IHDR)
        if (bytes.length < 24 || bytes.readUInt32BE(16) * bytes.readUInt32BE(20) > MAX_PNG_PIXELS) return '#';
    }
    return url;
}
