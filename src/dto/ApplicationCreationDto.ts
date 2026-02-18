import { IsDefined, IsHexadecimal, IsISO8601, IsNumber, IsString } from 'class-validator';

export class ApplicationCreationDto {
	@IsString()
	name: string;

	@IsHexadecimal()
	vbId: string;

	@IsNumber()
	walletId: number;
}