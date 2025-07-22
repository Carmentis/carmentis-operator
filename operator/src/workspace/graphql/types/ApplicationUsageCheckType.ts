import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ApplicationUsageCheckType {

	@Field(() => Boolean)
	isOrganisationPublished: boolean;

	@Field(() => Boolean)
	isPublishedOnChain: boolean;
}