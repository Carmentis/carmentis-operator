import { Field, Int, ObjectType } from '@nestjs/graphql';
import { AutoMap } from '@automapper/classes';

@ObjectType()
export class ApiKeyType {
	@AutoMap()
	@Field(() => Int)
	id: number;

	@AutoMap()
	@Field(() => String)
	name: string;

	@AutoMap()
	@Field(() => Date)
	createdAt: Date;

	@AutoMap()
	@Field(() => Date)
	activeUntil: Date;

	@AutoMap()
	@Field(() => Boolean)
	isActive: boolean;
}

