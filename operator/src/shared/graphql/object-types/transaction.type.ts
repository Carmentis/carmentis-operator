import { ObjectType, Field, Int, Float } from '@nestjs/graphql';

@ObjectType()
export class ChainReferenceType {
	@Field()
	mbHash: string;

	@Field(() => Int)
	sectionIndex: number;
}


@ObjectType()
export class TransactionType {
	@Field(() => Int)
	height: number;

	@Field()
	previousHistoryHash: string;

	@Field(() => Int)
	type: number;

	@Field()
	name: string;

	@Field()
	timestamp: Date;

	@Field()
	linkedAccount: string;

	@Field(() => Float)
	amount: number;

	@Field(() => ChainReferenceType)
	chainReference: ChainReferenceType;
}

