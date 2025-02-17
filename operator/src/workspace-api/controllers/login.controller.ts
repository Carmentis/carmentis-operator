import {
	BadRequestException,
	Body,
	Controller,
	ForbiddenException,
	Get,
	Logger,
	NotFoundException,
	Post,
} from '@nestjs/common';
import { ChallengeVerificationDto } from '../dto/challenge-verification.dto';
import { ChallengeService } from '../../shared/services/challenge.service';
import { UserService } from '../../shared/services/user.service';
import { JwtService } from '@nestjs/jwt';
import { Public } from '../decorators/public.decorator';
import { EnvService } from '../../shared/services/env.service';

@Controller("/workspace/api/login")
export class LoginController {

	private logger = new Logger(LoginController.name);

	constructor(
		private readonly challengeService: ChallengeService,
		private readonly userService: UserService,
		private jwtService: JwtService,
		private readonly envService: EnvService,
	) {}

	@Public()
	@Get("/challenge")
	getChallenge() {
		return this.challengeService.createChallenge()
	}

	@Public()
	@Post('/challenge/verify')
	async verifyChallenge(@Body() dto: ChallengeVerificationDto) {
		await this.challengeService.deleteOutdatedChallenges();
		const isVerified = await this.challengeService.verifyChallenge(
			dto.challenge,
			dto.publicKey,
			dto.signature
		)
		if (!isVerified) {
			throw new BadRequestException("Challenge not verified");
		}

		// check that the user exists. If the user is not found and if the
		// public user account creation is enabled, raise a not found error,
		// otherwise raise a forbidden exception.
		const user = await this.userService.findOneByPublicKey(dto.publicKey);
		if (!user) {
			if (this.envService.publicAccountCreationEnabled) {
				throw new NotFoundException("Account creation required")
			}
			throw new ForbiddenException("User not found.")
		}

		await this.challengeService.deleteChallenge(dto.challenge);
		const payload = {
			publicKey: dto.publicKey
		}
		const token = this.jwtService.sign(payload);
		return { token };

	}
}