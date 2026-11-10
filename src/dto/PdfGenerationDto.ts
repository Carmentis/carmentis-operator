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
	@ApiProperty({
		title: "Cover page logo",
		description: "JPEG/PNG as a data url, or SVG markup."
	})
    @IsOptional()
    @IsString()
    logo?: string;

	@ApiProperty({
		title: "Cover page title",
	})
    @IsString()
    title!: string;
}

export class PdfInjectedTextDto {
	@ApiProperty({
		title: "Color of injected text",
	})
    @IsOptional()
    @IsHexColor()
    color?: string;

	@ApiProperty({
		title: "Whether to use bold for injected text",
	})
    @IsOptional()
    @IsBoolean()
    bold?: boolean;
}

export class PdfOptionsDto {
	@ApiProperty({
		title: "Font ratio in 0..1",
	})
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(1)
    fontRatio?: number;

	@ApiProperty({
		title: "PDF creation date",
		description: "The creation date to be put in the PDF file, in ISO 8601 format.",
	})
    @IsOptional()
    @IsISO8601()
    creationDate?: string;

	@ApiProperty({
		title: "Cover page options",
	})
    @IsOptional()
    @ValidateNested()
    @Type(() => PdfCoverPageDto)
    coverPage?: PdfCoverPageDto;

	@ApiProperty({
		title: "Injected text options",
	})
    @IsOptional()
    @ValidateNested()
    @Type(() => PdfInjectedTextDto)
    injectedText?: PdfInjectedTextDto;

	@ApiProperty({
		title: "Language",
		description: "Language of built-in texts. Currently supported: 'en' (default) or 'fr'."
	})
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
