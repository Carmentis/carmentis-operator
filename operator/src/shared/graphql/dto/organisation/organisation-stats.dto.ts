import { IsString, IsNotEmpty, IsUrl, IsAlpha, IsPositive, IsOptional, ValidateIf } from 'class-validator';
import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class OrganisationStatsDto {
	@Field(() => Int)
	numberOfApplications: number;

	@Field(() => Int)
	numberOfUsers: number;
}