import {
    IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PdfSignatureDto {
    @ApiProperty({
        title: 'PDF content',
        description: 'The PDF content as a data url ("data:application/pdf;base64,...").',
    })
    @IsString()
    pdf: string;

    @ApiProperty({
        title: 'P12 content',
        description: 'The P12 content as a data url ("data:application/x-pkcs12;base64,...").',
    })
    @IsString()
    p12: string;

    @ApiProperty({
        title: 'P12 password',
        description: 'The P12 password.',
    })
    @IsString()
    password: string;
}
