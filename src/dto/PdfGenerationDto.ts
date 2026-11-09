import {
    IsBoolean,
    IsHexColor,
    IsISO8601,
    IsNumber,
    IsOptional,
    IsString,
	IsUUID,
    Max,
    Min,
    ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ResolutionProofDto } from './ResolverResponseDto';

export class PdfCoverPageDto {
    @IsOptional()
    @IsString()
    logo?: string;

    @IsString()
    title!: string;
}

export class PdfInjectedTextDto {
    @IsOptional()
    @IsHexColor()
    color?: string;

    @IsOptional()
    @IsBoolean()
    bold?: boolean;
}

export class PdfOptionsDto {
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(1)
    fontRatio?: number;

    @IsOptional()
    @IsISO8601()
    creationDate?: string;

    @IsOptional()
    @ValidateNested()
    @Type(() => PdfCoverPageDto)
    coverPage?: PdfCoverPageDto;

    @IsOptional()
    @ValidateNested()
    @Type(() => PdfInjectedTextDto)
    injectedText?: PdfInjectedTextDto;

    @IsOptional()
    @IsString()
    language?: string;
}

export class PdfGenerationDto {
	@ApiProperty({
		title: 'The wallet',
		description: 'The identifier of the wallet whose node is used to resolve the data.',
		format: 'uuid',
	})
	@IsUUID()
	walletId: string;

	@ApiProperty({
		title: 'Proof content',
		description: 'The resolution proof, as produced by the /resolve endpoint.',
	})
	@Type(() => ResolutionProofDto)
	proof: ResolutionProofDto;

	@ApiProperty({
		title: 'PDF options',
		description: 'PDF options for customizing the generated file.',
	})
	@Type(() => PdfOptionsDto)
	options: PdfOptionsDto;
}
