import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ChainReferenceType {
	@Field()
	mbHash: string;

	@Field(() => Int)
	sectionIndex: number;
}