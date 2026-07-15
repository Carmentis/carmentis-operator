import { IsHexadecimal, IsISO8601, IsOptional, IsString, IsNumber, Min, Max } from 'class-validator';

export class ApiKeyCreationDto {
	@IsString()
	name: string;


	@IsOptional()
	@IsISO8601()
	activeUntil?: string;

	@IsOptional()
	@IsHexadecimal()
	applicationVbId?: string;

	@IsOptional()
	@IsString()
	endpointRegex?: string;

	@IsOptional()
	@IsNumber()
	@Min(0)
	gasMinAtomics?: number;

	@IsOptional()
	@IsNumber()
	@Min(0)
	gasMaxAtomics?: number;
}