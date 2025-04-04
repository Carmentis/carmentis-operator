import {Transform, Type} from "class-transformer";
import { IsBoolean, IsDate, IsDefined, IsInt, IsISO8601, IsObject, IsOptional, IsString } from 'class-validator';

export class ApiKeyUpdateDto {
    @IsString()
    name: string;

    @IsBoolean()
    isActive: boolean
}