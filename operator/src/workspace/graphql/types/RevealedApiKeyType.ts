import { Field, ObjectType } from '@nestjs/graphql';
import { ApiKeyType } from './ApiKeyType';

@ObjectType()
export class RevealedApiKeyType extends ApiKeyType {
	@Field(() => String)
	key: string;
}