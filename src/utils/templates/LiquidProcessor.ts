import { Liquid } from 'liquidjs'
import { TemplateProcessor } from './TemplateProcessor';
import { InjectionCodec } from './InjectionCodec';

export class LiquidProcessor implements TemplateProcessor {
    private readonly liquid: Liquid;

    constructor(private readonly codec: InjectionCodec) {
        this.liquid = new Liquid({
            strictVariables: true,
            // outputEscape() is called for every {{ ... }} output, after filters
            outputEscape: (value: unknown) => codec.encode(value),
        });
    }

    async render(template: string, data: unknown) {
        const safeTemplate = this.codec.strip(template);
        return await this.liquid.parseAndRender(safeTemplate, data as object);
    }
}
