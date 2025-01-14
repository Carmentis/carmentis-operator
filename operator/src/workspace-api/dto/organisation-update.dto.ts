import { IsString, IsNotEmpty, IsUrl, IsAlpha, IsPositive, IsOptional } from 'class-validator';

export class UpdateOrganisationDto {
	@IsNotEmpty()
	@IsPositive()
	id: number;

	@IsNotEmpty()
	@IsString()
	name: string;

	@IsNotEmpty()
	@IsString()
	city: string;

	@IsNotEmpty()
	@IsAlpha()
	countryCode: string;

	@IsNotEmpty()
	@IsUrl()
	website: string;

	@IsNotEmpty()
	operatorEndpoint:  string;
}