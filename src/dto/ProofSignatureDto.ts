import {
    IsInt,
    IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ProofSignatureCommitmentDto {
    @ApiProperty({
        title: 'Signature issuance date',
    })
    @IsString()
    issuedAt: string;

    @ApiProperty({
        title: 'Used digest algorithm',
    })
    @IsString()
    digestAlg: string;

    @ApiProperty({
        title: 'Digest target',
    })
    @IsString()
    digestTarget: string;

    @ApiProperty({
        title: 'Signed digest',
    })
    @IsString()
    digest: string;
}

export class ProofSignatureDto {
    @ApiProperty({
        title: 'The signature commitment',
    })
    commitment: ProofSignatureCommitmentDto;

    @ApiProperty({
        title: 'The signer of the proof',
    })
    @IsString()
    signer: string;

    @ApiProperty({
        title: 'The public key of the signer',
    })
    @IsString()
    pubkey: string;

    @ApiProperty({
        title: 'The signature algorithm',
    })
    @IsString()
    alg: string;

    @ApiProperty({
        title: 'The signature',
    })
    @IsString()
    sig: string;
}
