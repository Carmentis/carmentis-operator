import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';
import { ChallengeVerificationDto } from '../dto/challenge/challenge-verification.dto';
import { BadRequestException, ForbiddenException, Logger, NotFoundException } from '@nestjs/common';

import { ChallengeService } from '../../services/challenge.service';
import { UserService } from '../../services/user.service';
import { EnvService } from '../../services/env.service';
import { Public } from '../../../workspace/decorators/public.decorator';
import { ChallengeVerificationResponse } from '../dto/challenge/challenge-verification-response.dto';
import { ChallengeEntity } from '../../entities/challenge.entity';


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

		const isVerified = await this.challengeService.verifyChallenge(challenge, publicKey, signature);
		if (!isVerified) {
			throw new BadRequestException('Challenge not verified');
		}

		const user = await this.userService.findOneByPublicKey(publicKey);
		if (!user) {
			throw new ForbiddenException('User not found.');
		}

		await this.challengeService.deleteChallenge(challenge);

		const payload = { publicKey };
		const token = this.jwtService.sign(payload);

		return { token };
	}
}
