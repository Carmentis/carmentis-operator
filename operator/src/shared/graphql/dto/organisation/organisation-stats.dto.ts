import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class OrganisationStatsDto {
	@Field(() => Int)
	numberOfApplications: number;

	@Field(() => Int)
	numberOfUsers: number;
}