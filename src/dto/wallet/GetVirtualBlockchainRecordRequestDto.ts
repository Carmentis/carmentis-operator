import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GetVirtualBlockchainRecordRequestDto {
	@Type(() => Number)
	@ApiProperty({ description: 'The block height to retrieve the record from', example: 42 })
	@IsInt()
	@Min(1, { message: 'Height must be higher or equal to 1' })
	height: number
}
