import {
    IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PdfGenerationResponseDto {
    @ApiProperty({
        title: 'PDF content',
        description: 'The PDF content as a data URL (data:application/pdf;base64,...).',
    })
    @IsString()
    pdf: string;
}
