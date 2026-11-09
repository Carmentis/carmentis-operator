export type Segment = {
    injected: boolean;
    value: string
}

export class InjectionCodec {
    private static readonly OPEN = '\uE000';
    private static readonly CLOSE = '\uE001';
    private static readonly PATTERN = /\uE000([0-9a-f]*)\uE001/g;
    // Same token once markdown-it has percent-encoded it inside a link destination
    private static readonly PATTERN_IN_URL = /%EE%80%80([0-9a-f]*)%EE%80%81/gi;

    private readonly encoder = new TextEncoder();
    private readonly decoder = new TextDecoder();

    /** Called by template engines for every injected value. */
    encode(value: unknown): string {
        const hex = Array.from(
            this.encoder.encode(String(value ?? '')),
            b => b.toString(16).padStart(2, '0')
        ).join('');
        return `${InjectionCodec.OPEN}${hex}${InjectionCodec.CLOSE}`;
    }

    /** Removes sentinels from untrusted input, so only the engine can create tokens. */
    strip(text: string): string {
        return text.replace(/[\uE000\uE001]/g, '');
    }

    has(text: string): boolean {
        return text.includes(InjectionCodec.OPEN);
    }

    /** Splits text into plain and injected segments, in order. */
    split(text: string): Segment[] {
        const out: Segment[] = [];
        let last = 0;
        for (const m of text.matchAll(InjectionCodec.PATTERN)) {
            if (m.index! > last) out.push({ injected: false, value: text.slice(last, m.index) });
            out.push({ injected: true, value: this.decode(m[1]) });
            last = m.index! + m[0].length;
        }
        if (last < text.length) out.push({ injected: false, value: text.slice(last) });
        return out;
    }

    /** Replaces tokens by their plain value (code blocks, alt text...). */
    reveal(text: string): string {
        return text.replace(InjectionCodec.PATTERN, (_, hex: string) => this.decode(hex));
    }

    /** Same, for tokens percent-encoded in a URL. The value is URL-encoded. */
    revealInUrl(url: string): string {
        return url.replace(InjectionCodec.PATTERN_IN_URL, (_, hex: string) => encodeURI(this.decode(hex)));
    }

    private decode(hex: string): string {
        return this.decoder.decode(
            Uint8Array.from(
                hex.match(/../g) ?? [],
                x => parseInt(x, 16)
            )
        );
    }
}
