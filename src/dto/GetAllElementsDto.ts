import { IsInt, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class GetAllElementsDto {
	@ApiProperty({
		description: 'Limit of elements to return',
		example: 10,
		default: 100,
		required: false
	})
	@Type(() => Number)
	@IsInt()
	@IsOptional()
	limit?: number = 100;

	@ApiProperty({
		description: 'Offset of elements to return',
		example: 0,
		default: 0,
		required: false,
	})
	@IsInt()
	@Type(() => Number)
	offset?: number = 0;
}