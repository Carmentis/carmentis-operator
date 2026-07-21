import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, IsOptional, IsString } from 'class-validator';


export class GetAuthenticityProofRequestDto {
	@ApiProperty({ description: 'Optional author identifier for proof filtering', example: 'author_789', required: false })
	@IsOptional()
	@IsString()
	proofAuthor: string
}
export class GetVirtualBlockchainAuthenticityProofRequestDto {
	@ApiProperty({ description: 'The virtual blockchain identifier', example: 'vb_12345' })
	@IsString()
	virtualBlockchainId: string;

	@ApiProperty({ description: 'Optional author identifier for proof filtering', example: 'author_789', required: false })
	@IsOptional()
	@IsString()
	proofAuthor: string
}