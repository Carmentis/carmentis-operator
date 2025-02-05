import { IsString, IsNotEmpty, IsUrl, IsAlpha, IsPositive, IsOptional } from 'class-validator';

export class UpdateOrganisationDto {
	@IsNotEmpty()
	@IsPositive()
	id: number;

	@IsNotEmpty()
	@IsString()
	name: string;

	@IsOptional()
	@IsString()
	city: string;

	@IsOptional()
	@IsAlpha()
	countryCode: string;

	@IsOptional()
	website: string;
}