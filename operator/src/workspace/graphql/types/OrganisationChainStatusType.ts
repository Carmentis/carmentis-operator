import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class OrganisationChainStatusType {

	@Field(() => Boolean)
	hasTokenAccount: boolean;

	@Field(() => Boolean)
	isPublishedOnChain: boolean;


	@Field(() => Boolean)
	hasEditedOrganization: boolean;
}