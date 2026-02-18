import { IsHexadecimal, IsISO8601, IsString } from 'class-validator';

export class ApiKeyCreationDto {
	@IsString()
	name: string;

	@IsISO8601()
	activeUntil: string;

	@IsHexadecimal()
	applicationVbId: string;
}