import { BadRequestException, Body, Controller, Get, Logger, Post } from '@nestjs/common';
import { ChallengeVerificationDto } from '../dto/challenge-verification.dto';
import { ChallengeService } from '../../shared/services/challenge.service';
import { UserService } from '../../shared/services/user.service';
import { JwtService } from '@nestjs/jwt';
import { Public } from '../decorators/public.decorator';

@Controller("/workspace/api/login")
export class LoginController {

	private logger = new Logger(LoginController.name);

	constructor(
		private readonly challengeService: ChallengeService,
		private readonly userService: UserService,
		private jwtService: JwtService
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
			this.logger.log("Challenge not verified")
			throw new BadRequestException();
		}

		const user = this.userService.findOneByPublicKey(dto.publicKey);
		if (!user) {
			this.logger.log("User not found")
			throw new BadRequestException();
		}

		await this.challengeService.deleteChallenge(dto.challenge);
		const payload = {
			publicKey: dto.publicKey
		}
		const token = this.jwtService.sign(payload);
		return { token };

	}
}