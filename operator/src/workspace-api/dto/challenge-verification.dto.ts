import { IsString } from 'class-validator';

export class ChallengeVerificationDto {
	@IsString()
	challenge: string;

	@IsString()
	signature: string;

	@IsString()
	publicKey: string;
}