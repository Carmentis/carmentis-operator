import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class GetAuthenticityProofRequestDto {
	@ApiPropertyOptional({ description: 'Optional author identifier for proof filtering', example: 'Proof Author', required: false })
	@IsOptional()
	@IsString()
	proofAuthor: string
}

export class GetVirtualBlockchainAuthenticityProofRequestDto {
	@ApiPropertyOptional({ description: 'Optional author identifier for proof filtering', example: 'Proof Author', required: false })
	@IsOptional()
	@IsString()
	proofAuthor?: string
}
