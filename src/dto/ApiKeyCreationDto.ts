import { IsHexadecimal, IsISO8601, IsOptional, IsString } from 'class-validator';

export class ApiKeyCreationDto {
	@IsString()
	name: string;


	@IsOptional()
	@IsISO8601()
	activeUntil?: string;

	@IsHexadecimal()
	applicationVbId: string;
}