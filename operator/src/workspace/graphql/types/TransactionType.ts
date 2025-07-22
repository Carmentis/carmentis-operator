import { Field, Float, Int, ObjectType } from '@nestjs/graphql';

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

	@Field()
	label: string;

	@Field()
	amountInAtomics: number;

	@Field()
	transferredAt: string;

	@Field()
	linkedAccount: string;

	@Field()
	amount: string;

	@Field()
	chainReference: string;
}


