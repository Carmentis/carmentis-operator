import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, IsOptional, IsString } from 'class-validator';

export class GetVirtualBlockchainAuthenticityProofRequestDto {
	@ApiProperty({ description: 'The virtual blockchain identifier', example: 'vb_12345' })
	@IsString()
	vbId: string;

	@ApiProperty({ description: 'Optional author identifier for proof filtering', example: 'author_789', required: false })
	@IsOptional()
	@IsString()
	proofAuthor: string
}