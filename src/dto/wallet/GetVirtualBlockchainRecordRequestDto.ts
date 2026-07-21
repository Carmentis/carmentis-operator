import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, IsString } from 'class-validator';

export class GetVirtualBlockchainRecordRequestDto {
	@ApiProperty({ description: 'The virtual blockchain identifier', example: 'vb_12345' })
	@IsString()
	vbId: string;

	@ApiProperty({ description: 'The block height to retrieve the record from', example: 42 })
	@IsInt()
	height: number
}