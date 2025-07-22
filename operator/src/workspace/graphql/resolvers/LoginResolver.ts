import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';
import { ForbiddenException, Logger } from '@nestjs/common';

import { ChallengeService } from '../../../shared/services/ChallengeService';
import { UserService } from '../../../shared/services/UserService';
import { EnvService } from '../../../shared/services/EnvService';
import { Public } from '../../../shared/decorators/PublicDecorator';
import { ChallengeVerificationResponse } from '../dto/ChallengeVerificationResponseDto';
import { ChallengeEntity } from '../../../shared/entities/ChallengeEntity';
import { StringSignatureEncoder } from '@cmts-dev/carmentis-sdk/server';


@Resolver()
export class LoginResolver {
	private logger = new Logger(LoginResolver.name);

	constructor(
		private readonly challengeService: ChallengeService,
		private readonly userService: UserService,
		private readonly jwtService: JwtService,
		private readonly envService: EnvService,
	) {}

	@Public()
	@Query(() => ChallengeEntity)
	async getChallenge() {
		return this.challengeService.createChallenge();
	}

	@Public()
	@Mutation(() => ChallengeVerificationResponse)
	async verifyChallenge(
		@Args('challenge') challenge: string,
		@Args('publicKey') publicKey: string,
		@Args('signature') signature: string
	): Promise<ChallengeVerificationResponse> {
		await this.challengeService.deleteOutdatedChallenges();

		// parse the public key
		const signatureEncoder = StringSignatureEncoder.defaultStringSignatureEncoder();
		const parsedPublicKey =  signatureEncoder.decodePublicKey(publicKey);
		const parsedSignature = signatureEncoder.decodeSignature(signature);
		this.logger.debug(`Performing authentication for public key ${parsedPublicKey.getPublicKeyAsString()}`);

		// check that at a user should corresponds
		const user = await this.userService.findOneByPublicKey(publicKey);
		if (!user) {
			this.logger.debug("Login failed: User not found");
			throw new ForbiddenException('User not found.');
		}


		// check the signature
		const isVerified = await this.challengeService.verifyChallenge(challenge, parsedPublicKey, parsedSignature);
		if (!isVerified) {
			this.logger.debug("Login failed: Challenge verification failed");
			throw new ForbiddenException('Challenge not verified');
		}

		// TODO: we receive request twice, so we are required to disable this line for the presentation.
		//await this.challengeService.deleteChallenge(challenge);

		const payload = { publicKey };
		const token = this.jwtService.sign(payload);

		this.logger.debug(`Challenge verified: Connection accepted with token: ${token}`)

		return { token };
	}
}
