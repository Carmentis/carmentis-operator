import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, IsOptional, IsString } from 'class-validator';


export class GetAuthenticityProofRequestDto {
	@ApiProperty({ description: 'Optional author identifier for proof filtering', example: 'Proof Author', required: false })
	@IsOptional()
	@IsString()
	proofAuthor: string
}
export class GetVirtualBlockchainAuthenticityProofRequestDto {
	@ApiProperty({ description: 'The virtual blockchain identifier', example: 'A209BBB06FE1895E66E6624B86E59D9B4E8798119936A79917AE744BC709590A' })
	@IsString()
	virtualBlockchainId: string;

	@ApiProperty({ description: 'Optional author identifier for proof filtering', example: 'Proof Author', required: false })
	@IsOptional()
	@IsString()
	proofAuthor: string
}