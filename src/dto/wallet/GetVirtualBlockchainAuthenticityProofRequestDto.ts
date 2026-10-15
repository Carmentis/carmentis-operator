import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class GetAuthenticityProofRequestDto {
	@ApiProperty({ description: 'Optional author identifier for proof filtering', example: 'Proof Author', required: false })
	@IsOptional()
	@IsString()
	proofAuthor: string
}

export class GetVirtualBlockchainAuthenticityProofRequestDto {
	@ApiProperty({ description: 'Optional author identifier for proof filtering', example: 'Proof Author', required: false })
	@IsOptional()
	@IsString()
	proofAuthor?: string
}
