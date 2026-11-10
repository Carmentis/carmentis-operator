import fs from 'fs';
import path from 'path';
import type { Token } from 'markdown-it';
import pdfmake from 'pdfmake';
import type { Content, ContentColumns, TDocumentDefinitions } from 'pdfmake/interfaces';
import { MarkdownProcessor } from '../templates/MarkdownProcessor';
import { InjectionCodec } from '../templates/InjectionCodec';

const FONT_PATH = path.resolve(__dirname, '../../assets/fonts');
const IMG_PATH = path.resolve(__dirname, '../../assets/img');

const PROOF_CHECKER_LINK = 'https://proof-checker.server4.devnet.carmentis.io/';

const INJECTED_TEXT_COLOR   = '#0a5';
const CODE_BG_COLOR         = '#f0f0f0';
const BLOCKQUOTE_COLOR      = '#555';
const HR_COLOR              = '#999';
const TABLE_HEADER_BG_COLOR = '#eeeeee';
const LINK_COLOR            = '#0645ad';
const MARKER_COLOR          = '#888';
const POWERED_BY_COLOR      = '#888';
const PAGINATION_COLOR      = '#888';
const IMAGE_ALT_TEXT_COLOR  = '#888';

// Placeholder for the future footnote references
const MARKER = '' // ' [1] [2]';

interface Language {
    en: string
    fr: string
}

const TEXTS: Record<string, Language> = {
    defaultTitle: {
        en: "Proof Document",
        fr: "Document justificatif",
    },
    certifiedBy: {
        en: "certified by",
        fr: "certifié par",
    },
    documentCheck: {
        en: "To verify this document's authenticity, upload it to",
        fr: "Pour vérifier l'authenticité de ce document, téléversez-le sur",
    },
};

export interface CoverPageOptions {
    logo?: Buffer | string;             // free logo: PNG/JPEG bytes, or SVG markup as a string
    poweredBySvg?: string;              // Carmentis logo, SVG markup
    title?: string;                     // main title on the title page
}

export interface InjectedTextOptions {
    color?: string;                     // color (default: INJECTED_TEXT_COLOR)
    bold?: boolean;                     // force bold
    italics?: boolean;                  // force italics
}

export interface PdfOptions {
    creationDate?: string;              // pin it if you want reproducible output
    defaultFont?: string;               // default: first key of `fonts`
    fontRatio?: number;                 // font ratio as a float multiplier
    coverPage?: CoverPageOptions;       // cover page
    language?: string;                  // language of built-in texts (default: 'en')
    injectedText?: InjectedTextOptions; // options for injected texts
}

export class MarkdownToPdf {
    private readonly markdownProcessor: MarkdownProcessor;

    constructor(
        private readonly codec: InjectionCodec,
        private readonly pdfOptions?: PdfOptions,
    ) {
        this.pdfOptions ||= {};
        this.pdfOptions.fontRatio ||= 1.0;
        this.pdfOptions.language ||= 'en';
        pdfmake.setFonts({
            Roboto: {
                normal: path.join(FONT_PATH, "Roboto-Regular.ttf"),
                bold: path.join(FONT_PATH, "Roboto-Medium.ttf"),
                italics: path.join(FONT_PATH, "Roboto-Italic.ttf"),
                bolditalics: path.join(FONT_PATH, "Roboto-MediumItalic.ttf"),
            },
        });
        this.markdownProcessor = new MarkdownProcessor(codec);
    }

    async render(markdown: string): Promise<Buffer> {
        const tokens = this.markdownProcessor.parse(markdown);
        const body = this.blocksToPdf(tokens, 0).nodes;
        const hasCoverPage = this.pdfOptions.coverPage !== undefined;
        const isoDate = this.pdfOptions.creationDate ?? (new Date()).toISOString();
        const proofCheckerLink = PROOF_CHECKER_LINK;

        const definition: TDocumentDefinitions = {
            pageSize: 'A4',
            pageMargins: [50, 50, 50, 60],
            info: { creationDate: new Date(isoDate) },
            defaultStyle: { font: this.pdfOptions.defaultFont, ...this.fontSize(11), lineHeight: 1.2 },
            styles: {
                h1: { ...this.fontSize(22), bold: true, margin: [0, 14, 0, 8] },
                h2: { ...this.fontSize(18), bold: true, margin: [0, 12, 0, 6] },
                h3: { ...this.fontSize(15), bold: true, margin: [0, 10, 0, 4] },
                h4: { ...this.fontSize(13), bold: true, margin: [0, 8, 0, 4] },
                h5: { ...this.fontSize(11), bold: true, margin: [0, 6, 0, 2] },
                h6: { ...this.fontSize(11), bold: true, italics: true, margin: [0, 6, 0, 2] },
                code: { ...this.fontSize(9), background: CODE_BG_COLOR, margin: [0, 0, 0, 8] },
            },
            footer: (page: number, pages: number) =>
                hasCoverPage && page === 1
                    ? null
                    : {
                        text: hasCoverPage ? `${page - 1} / ${pages - 1}` : `${page} / ${pages}`,
                        alignment: 'center',
                        ...this.fontSize(10),
                        color: PAGINATION_COLOR,
                    },
            content: hasCoverPage
                ? [...this.coverPage(this.pdfOptions.coverPage, proofCheckerLink), ...body]
                : body,
        };

        const buffer = await pdfmake.createPdf(definition).getBuffer();
        return Buffer.from(buffer);
    }

    /** Converts block tokens starting at `i` until the `until` close token (or the end). */
    private blocksToPdf(tokens: Token[], i: number, until?: string): { nodes: Content[]; next: number } {
        const nodes: Content[] = [];

        while (i < tokens.length) {
            if (until && tokens[i].type === until) {
                return { nodes, next: i + 1 };
            }
            i = this.blockToPdf(nodes, tokens, i);
        }
        return { nodes, next: i };
    }

    private blockToPdf(nodes: Content[], tokens: Token[], i: number) {
        const t = tokens[i];

        switch (t.type) {
            case 'heading_open': {
                nodes.push({ text: this.inlineToPdf(tokens[i + 1].children ?? []), style: t.tag });
                return i + 3;
            }
            case 'paragraph_open': {
                // hidden = paragraph inside a tight list item
                nodes.push({
                    text: this.inlineToPdf(tokens[i + 1].children ?? []),
                    margin: t.hidden ? [0, 0, 0, 0] : [0, 0, 0, 8],
                });
                return i + 3;
            }
            case 'bullet_list_open':
            case 'ordered_list_open': {
                const ordered = t.type === 'ordered_list_open';
                const r = this.blocksToPdf(tokens, i + 1, ordered ? 'ordered_list_close' : 'bullet_list_close');
                nodes.push(ordered
                    ? { ol: r.nodes, start: Number(t.attrGet('start') ?? 1), margin: [0, 0, 0, 8] }
                    : { ul: r.nodes, margin: [0, 0, 0, 8] });
                return r.next;
            }
            case 'list_item_open': {
                const r = this.blocksToPdf(tokens, i + 1, 'list_item_close');
                nodes.push({ stack: r.nodes });
                return r.next;
            }
            case 'blockquote_open': {
                const r = this.blocksToPdf(tokens, i + 1, 'blockquote_close');
                nodes.push({ stack: r.nodes, margin: [14, 0, 0, 8], color: BLOCKQUOTE_COLOR });
                return r.next;
            }
            case 'fence':
            case 'code_block': {
                nodes.push({ text: t.content.replace(/\n$/, ''), style: 'code', preserveLeadingSpaces: true });
                return i + 1;
            }
            case 'hr': {
                nodes.push(this.hr());
                return i + 1;
            }
            case 'table_open': {
                const body: Content[][] = [];
                // longest text per column, used to pick the stretchy one
                const maxLen: number[] = [];
                let headerRows = 0;
                let inHead = false;
                let row: Content[] = [];
                let j = i + 1;
                for (; tokens[j].type !== 'table_close'; j++) {
                    const u = tokens[j];
                    if (u.type === 'thead_open') inHead = true;
                    else if (u.type === 'thead_close') inHead = false;
                    else if (u.type === 'tr_open') row = [];
                    else if (u.type === 'th_open' || u.type === 'td_open') {
                        const header = u.type === 'th_open';
                        const children = tokens[j + 1].children ?? [];
                        const col = row.length;
                        maxLen[col] = Math.max(maxLen[col] ?? 0, this.plainLength(children));
                        row.push({
                            text: this.inlineToPdf(children),
                            bold: header,
                            fillColor: header ? TABLE_HEADER_BG_COLOR : undefined,
                        } as Content);
                    } else if (u.type === 'tr_close') {
                        body.push(row);
                        if (inHead) {
                            headerRows++;
                        }
                    }
                }
                if (body.length > 0) {
                    // The widest column fills the remaining space, the others keep their natural width
                    const stretch = maxLen.indexOf(Math.max(...maxLen));
                    const widths = body[0].map((_, c) => (c === stretch ? '*' : 'auto'));
                    nodes.push({ table: { headerRows, widths, body }, margin: [0, 0, 0, 8] });
                }
                return j + 1;
            }
            default: {
                console.log(`ignoring ${t.type}`);
                return i + 1;
            }
        }
    }

    private plainLength(children: Token[]): number {
        let n = 0;
        for (const t of children) {
            if (t.type === 'text' || t.type === 'code_inline' || t.type === 'injected' || t.type === 'image') {
                n += t.content.length;
            }
        }
        return n;
    }

    private inlineToPdf(children: Token[]): Content[] {
        const out: Content[] = [];
        let bold = false, italics = false, strike = false;
        let link: string | undefined;

        for (const t of children) {
            switch (t.type) {
                case 'strong_open': { bold = true; break; }
                case 'strong_close': { bold = false; break; }
                case 'em_open': { italics = true; break; }
                case 'em_close': { italics = false; break; }
                case 's_open': { strike = true; break; }
                case 's_close': { strike = false; break; }
                case 'link_open': {
                    const href = t.attrGet('href');
                    link = href !== null && String(href) !== '#' ? String(href) : undefined;
                    break;
                }
                case 'link_close': { link = undefined; break; }
                case 'softbreak': { out.push({ text: ' ' }); break; }
                case 'hardbreak': { out.push({ text: '\n' }); break; }
                case 'text': {
                    out.push({
                        text: t.content, bold, italics, link,
                        decoration: strike ? 'lineThrough' : link ? 'underline' : undefined,
                        color: link ? LINK_COLOR : undefined,
                    } as Content);
                    break;
                }
                case 'code_inline': {
                    out.push({ text: t.content, background: CODE_BG_COLOR, ...this.fontSize(10) } as Content);
                    break;
                }
                case 'image': {
                    out.push({ text: t.content, italics: true, color: IMAGE_ALT_TEXT_COLOR }); // alt text only
                    break;
                }
                case 'injected': {
                    const options = this.pdfOptions.injectedText;
                    const color = options?.color ?? INJECTED_TEXT_COLOR;
                    const injectedBold = options?.bold ?? bold;
                    const injectedItalics = options?.italics ?? italics;
                    out.push({
                        text: t.content,
                        bold: injectedBold,
                        italics: injectedItalics,
                        color
                    } as Content);
//                  out.push({ text: MARKER, ...this.fontSize(7), color: MARKER_COLOR });
                    break;
                }
            }
        }
        return out;
    }

    private coverPage(coverPage: CoverPageOptions, proofCheckerLink: string): Content[] {
        const { logo, title } = coverPage;
        const page: Content[] = [];
        const poweredBySvg = fs.readFileSync(path.join(IMG_PATH, "carmentis.svg")).toString();

        if (logo) {
            page.push(this.centered(this.logoNode(logo, [260, 140]), [0, 120, 0, 40]));
        }
        page.push({
            text: title ?? this.getText(TEXTS.defaultTitle),
            alignment: 'center',
            ...this.fontSize(26),
            bold: true,
            margin: [0, logo ? 0 : 200, 0, 0],
        });

        page.push(this.hr());
        page.push({
            text: this.getText(TEXTS.certifiedBy),
            alignment: 'center',
            ...this.fontSize(12),
            color: POWERED_BY_COLOR,
            margin: [0, 60, 0, 2]
        });
        page.push(this.centered({ svg: poweredBySvg, fit: [90, 24] }));
        page.push({
            text: [
                this.getText(TEXTS.documentCheck) + ' ',
                {
                    text: 'proof-checker.carmentis.io',
                    link: proofCheckerLink,
                    color: LINK_COLOR,
                },
                ".",
            ],
            alignment: 'center',
            ...this.fontSize(12),
            color: POWERED_BY_COLOR,
            margin: [0, 30, 0, 6]
        });

        // Break after the last node of the cover page
        page.push({ text: '', pageBreak: 'after' });
        return page;
    }

    private getText(s: Language) {
        return s[this.pdfOptions.language];
    }

    private logoNode(logo: Buffer | string, fit: [number, number]): Content {
        console.log("logoNode", logo);
        if (typeof logo === 'string') {
            const isDataUrlImage = /^data:image\/(png|jpeg);base64,/.test(logo);
            console.log("logo is string", isDataUrlImage);
            if (isDataUrlImage) {
                return { image: logo, fit };
            }
            // if it does not look like a data URL, assume SVG markup
            return { svg: logo, fit };
        }
        const header = logo[0] << 8 | logo[1];
        const isPng = header === 0x8950;
        const isJpeg = header === 0xffd8;
        if (!isPng && !isJpeg) {
            throw new Error('Logo must be PNG/JPEG as a buffer, PNG/JPEG as a data URL, or SVG markup as a string');
        }
        return {
            image: `data:image/${isPng ? 'png' : 'jpeg'};base64,${logo.toString('base64')}`,
            fit, // keeps the aspect ratio, never exceeds the box
        };
    }

    private hr(marginTop = 8, marginBottom = 8): Content {
        return ({
            canvas: [{
                type: 'line',
                x1: 0, y1: 0,
                x2: 495, y2: 0,
                lineWidth: 0.5,
                lineColor: HR_COLOR
            }],
            margin: [0, marginTop, 0, marginBottom],
        });
    }

    // Two stretchy side columns around an auto-width one: centers any node, SVG included
    private centered(node: Content, margin?: [number, number, number, number]): ContentColumns {
        return {
            columns: [
                { width: '*', text: '' },
                { width: 'auto', stack: [node] },
                { width: '*', text: '' }
            ],
            margin,
        };
    }

    private fontSize(n: number) {
        return { fontSize: n * this.pdfOptions.fontRatio };
    }
}
