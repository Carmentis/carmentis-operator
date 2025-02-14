import { IsString, IsNotEmpty, IsUrl, IsAlpha, IsPositive, IsOptional, ValidateIf } from 'class-validator';

export class UpdateOrganisationDto {
	@IsNotEmpty()
	@IsPositive()
	id: number;

	@IsNotEmpty()
	@IsString()
	name: string;

	@IsOptional()
	city?: string;

	@IsOptional()
	countryCode?: string;

	@IsOptional()
	website?: string;
}