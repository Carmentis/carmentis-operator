import {Transform, Type} from "class-transformer";
import { IsDate, IsDefined, IsInt, IsISO8601, IsObject, IsOptional, IsString } from 'class-validator';

export class ApiKeyCreationDto {
    @IsString()
    name: string;

    @IsISO8601()
    activeUntil: string;
}