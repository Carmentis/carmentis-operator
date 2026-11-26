import {
    IsBoolean,
    IsHexColor,
    IsISO8601,
    IsNumber,
    IsOptional,
    IsString,
	IsUUID,
	IsEnum,
	IsArray,
    Max,
    Min,
    ValidateNested,
	ValidateIf,
	ArrayNotEmpty,
	ArrayMaxSize,
} from 'class-validator';
import {
	RepresentationSelectionEnum,
	PathSegment,
	PdfCoverPageOptions,
	PdfInjectedTextOptions,
	PdfRepresentationOptions,
	PdfOptions,
} from '@cmts-dev/carmentis-sdk-templating';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ResolutionProofDto } from './ResolverResponseDto';
import { ResolverDto } from './ResolverDto';

export class PdfCoverPageOptionsDto implements PdfCoverPageOptions {
	@ApiPropertyOptional({
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
    title: string;

	@ApiPropertyOptional({
		title: "Carmentis seal",
		description: "Whether to display the Carmentis seal on the cover page. True by default."
	})
    @IsOptional()
    @IsBoolean()
    showCarmentisSeal?: boolean;

	@ApiPropertyOptional({
		title: "Proof checker URL",
		description: "A custom proof checker URL. Defaults to https://proof-checker.carmentis.io."
	})
    @IsOptional()
    @IsString()
    proofCheckerUrl?: string;
}

export class PdfInjectedTextOptionsDto implements PdfInjectedTextOptions {
	@ApiPropertyOptional({
		title: "Color of injected text",
	})
    @IsOptional()
    @IsHexColor()
    color?: string;

	@ApiPropertyOptional({
		title: "Whether to use bold for injected text",
	})
    @IsOptional()
    @IsBoolean()
    bold?: boolean;
}

export class PdfRepresentationOptionsDto implements PdfRepresentationOptions {
    @ApiProperty({
        enum: RepresentationSelectionEnum,
        default: RepresentationSelectionEnum.FIRST,
        description: 'first: first representation in document order (usually the root one). '
            + 'all: every representation, in document order. '
            + 'selected: only the ones listed in `paths`, in the order given.',
    })
    @IsEnum(RepresentationSelectionEnum)
    select: RepresentationSelectionEnum;

    @ApiPropertyOptional({
        type: 'array',
        maxItems: 50,
        items: {
            type: 'array',
            maxItems: 32,
            items: { oneOf: [
				{ type: 'string', maxLength: 256 },
				{ type: 'integer', minimum: 0 }
			]},
        },
        example: [[], ['reception', 'recipient', 'representations', 0]],
        description: 'Required when select=selected, forbidden otherwise. A path is an array of object keys '
            + '(strings) and array indices (integers) from the root of the proof; [] is the root itself.',
    })
    @ValidateIf((o: PdfRepresentationOptionsDto) => o.select === RepresentationSelectionEnum.SELECTED)
    @IsArray() @ArrayNotEmpty() @ArrayMaxSize(50)
    paths?: PathSegment[][];
}

export class PdfOptionsDto implements PdfOptions {
	@ApiPropertyOptional({
		title: 'Representation selection',
		description: 'Options for representation selection.',
	})
	@IsOptional()
	@Type(() => PdfRepresentationOptionsDto)
	representations?: PdfRepresentationOptionsDto;

	@ApiPropertyOptional({
		title: "Font ratio in 0..1",
	})
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(1)
    fontRatio?: number;

	@ApiPropertyOptional({
		title: "PDF creation date",
		description: "The creation date to be put in the PDF file, in ISO 8601 format.",
	})
    @IsOptional()
    @IsISO8601()
    creationDate?: string;

	@ApiPropertyOptional({
		title: "Cover page options",
	})
    @IsOptional()
    @ValidateNested()
    @Type(() => PdfCoverPageOptionsDto)
    coverPage?: PdfCoverPageOptionsDto;

	@ApiPropertyOptional({
		title: "Injected text options",
	})
    @IsOptional()
    @ValidateNested()
    @Type(() => PdfInjectedTextOptionsDto)
    injectedText?: PdfInjectedTextOptionsDto;

	@ApiPropertyOptional({
		title: "Language",
		description: "Language of built-in texts. Currently supported: 'en' (default) or 'fr'."
	})
    @IsOptional()
    @IsString()
    language?: string;
}

export class PdfFromOutputDto {
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

export class PdfFromInputDto {
	@ApiProperty({
		title: 'resolution data',
		description: 'The data to be resolved, in the same format as for /resolve.',
	})
	@Type(() => ResolverDto)
	resolution: ResolverDto;

	@ApiProperty({
		title: 'PDF options',
		description: 'PDF options for customizing the generated file.',
	})
	@Type(() => PdfOptionsDto)
	options: PdfOptionsDto;
}
