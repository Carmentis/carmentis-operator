import { Field, ObjectType } from '@nestjs/graphql';
import { AutoMap } from '@automapper/classes';

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