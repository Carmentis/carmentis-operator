import MarkdownIt from 'markdown-it'
import type { Token, StateCore } from 'markdown-it'
import { InjectionCodec } from './InjectionCodec';
import { sanitizeImageDataUrl } from './ImageUrl';

const SAFE_URL = /^(https?:|mailto:|#)/i;

export class MarkdownProcessor {
    private readonly md = new MarkdownIt({ html: false });

    constructor(private readonly codec: InjectionCodec) {
        this.md.core.ruler.push('injected_fields', (state) => this.expandInjected(state));
    }

    parse(markdown: string): Token[] {
        return this.md.parse(markdown, {});
    }

    private expandInjected(state: StateCore) {
        for (const block of state.tokens) {
            // Sentinels inside code blocks: plain text, no styling
            if (block.type === 'fence' || block.type === 'code_block') {
                block.content = this.codec.reveal(block.content);
                continue;
            }
            if (block.type !== 'inline' || !block.children) continue;

            const out: Token[] = [];
            for (const child of block.children) {
                switch (child.type) {
                    case 'text': {
                        if (!this.codec.has(child.content)) { out.push(child); break; }
                        for (const seg of this.codec.split(child.content)) {
                            const t = new state.Token(seg.injected ? 'injected' : 'text', '', 0);
                            t.content = seg.value;
                            out.push(t);
                        }
                        break;
                    }
                    case 'code_inline': {
                        child.content = this.codec.reveal(child.content);
                        out.push(child);
                        break;
                    }
                    case 'link_open':
                    case 'image': {
                        const attr = child.type === 'link_open' ? 'href' : 'src';
                        const raw = child.attrGet(attr);
                        if (raw !== null) {
                            const value = String(raw);
                            child.attrSet(attr, child.type === 'image'
                                ? sanitizeImageDataUrl(this.codec.revealInUrl(value))
                                : this.sanitizeUrl(value));
                        }
                        if (child.type === 'image') {
                            // the alt text is rendered from the children: replace them with one revealed text token
                            const alt = new state.Token('text', '', 0);
                            alt.content = this.codec.reveal(child.content);
                            child.content = alt.content;
                            child.children = [alt];
                        }
                        out.push(child);
                        break;
                    }
                    default: {
                        out.push(child);
                        break;
                    }
                }
            }
            block.children = out;
        }
    }

    private sanitizeUrl(raw: string): string {
        const url = this.codec.revealInUrl(raw);
        return SAFE_URL.test(url) ? url : '#';
    }
}
