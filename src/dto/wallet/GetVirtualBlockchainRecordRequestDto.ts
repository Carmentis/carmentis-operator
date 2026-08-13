import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GetVirtualBlockchainRecordRequestDto {
	@ApiProperty({ description: 'The virtual blockchain identifier', example: 'vb_12345' })
	@IsString()
	vbId: string;

	@Type(() => Number)
	@ApiProperty({ description: 'The block height to retrieve the record from', example: 42 })
	@IsInt()
	@Min(1, { message: 'Height must be higher or equal to 1' })
	height: number
}