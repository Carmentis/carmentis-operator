import {Transform, Type} from "class-transformer";

export class ApplicationDto {
    id: number;
    name: string;
    version: number;
    logoUrl: string;
    domain: string;
    website: string;
    lastUpdateAt: Date;
    published: boolean;
    publishedAt: Date;

    @Transform(({ value }) => JSON.stringify(value))
    data: string;
}