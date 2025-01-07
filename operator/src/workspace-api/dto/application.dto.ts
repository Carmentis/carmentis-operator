import {Transform, Type} from "class-transformer";
import { IsDate, IsDefined, IsInt, IsObject, IsOptional, IsString } from 'class-validator';

export class ApplicationDto {
    @IsInt()
    id: number;


    @IsString()
    name: string;

    @IsString()
    @IsOptional()
    logoUrl: string;

    @IsString()
    @IsOptional()
    domain: string;

    @IsString()
    @IsOptional()
    website: string;


    @IsDefined()
    data: string;
}