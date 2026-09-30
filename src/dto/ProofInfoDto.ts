import {
    IsInt,
    IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ProofInfoDto {
    @ApiProperty({
        title: 'Proof format version',
    })
    @IsInt()
    version: number;

    @ApiProperty({
        title: 'Chain identifier',
    })
    @IsString()
    chainId: string;

    @ApiProperty({
        title: 'Proof description',
    })
    @IsString()
    description: string;

    @ApiProperty({
        title: 'Proof author',
    })
    @IsString()
    author: string;

    @ApiProperty({
        title: 'Proof creation date',
    })
    @IsString()
    date: string;
}
