import { IsString } from 'class-validator';
import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class ChallengeVerificationDto {
	@Field(() => String)
	challenge: string;

	@Field(() => String)
	signature: string;

	@Field(() => String)
	publicKey: string;
}