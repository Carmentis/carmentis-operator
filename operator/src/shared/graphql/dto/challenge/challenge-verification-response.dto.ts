import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ChallengeVerificationResponse {
	@Field()
	token: string;
}