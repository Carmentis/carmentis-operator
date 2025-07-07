import { Field, Float, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class OrganisationChainStatusType {

	@Field(() => Boolean)
	hasTokenAccount: boolean;

	@Field(() => Boolean)
	isPublishedOnChain: boolean;
}