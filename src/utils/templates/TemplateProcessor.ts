export interface TemplateProcessor {
    /** Renders `template` with `data`; every injected value must go through `codec.encode`. */
    render(template: string, data: unknown): Promise<string>;
}
