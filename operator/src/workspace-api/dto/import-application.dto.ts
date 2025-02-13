import { IsOptional, IsString, IsUrl } from 'class-validator';

export class ImportApplicationDto {
	@IsString()
	name: string;


	@IsString()
	@IsOptional()
	logoUrl?: string;

	@IsString()
	@IsOptional()
	domain?: string;


	@IsOptional()
	data?: string;
}