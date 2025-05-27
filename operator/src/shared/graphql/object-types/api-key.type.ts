import { Field, Int, ObjectType, PickType } from '@nestjs/graphql';
import { ApplicationType } from './application.type';
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

@ObjectType()
export class ApiKeyUsageType {

	@AutoMap()
	@Field(() => Number)
	id: number;

	@AutoMap()
	@Field(() => String)
	ip: string;

	@AutoMap()
	@Field(() => Date)
	usedAt: Date;

	@AutoMap()
	@Field(() => String)
	requestUrl: string;

	@AutoMap()
	@Field(() => String)
	requestMethod: string;

	@AutoMap()
	@Field(() => String)
	responseStatus: number;
}

@ObjectType()
export class RevealedApiKeyType extends ApiKeyType {
	@Field(() => String)
	key: string;
}

