import { BadRequestException, Body, Controller, Get, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { OPERATOR_ADMIN_API_PREFIX } from './OperatorAdminApiController';
import { Public } from '../../decorators/PublicDecorator';
import { DeskAuthVerifyDto } from '../../dto/DeskAuthVerifyDto';
import { UserService } from '../../services/UserService';
import { CarmentisDeskAuthService } from '../../services/CarmentisDeskAuthService';
import { RegistrationService } from '../../services/RegistrationService';
import { AuthTokenService } from '../../services/AuthTokenService';
import { OperatorConfigService } from '../../config/services/operator-config.service';
import { setAdminSessionCookie } from '../../utils/AdminSession';

@Controller(`${OPERATOR_ADMIN_API_PREFIX}/setup`)
export class OperatorAdminApiSetupController {
	constructor(
		private readonly userService: UserService,
		private readonly deskAuthService: CarmentisDeskAuthService,
		private readonly registrationService: RegistrationService,
		private readonly authTokenService: AuthTokenService,
		private readonly config: OperatorConfigService,
	) {}

	@Public()
	@Get('status')
	async status() {
		return {
			isInitialized: await this.userService.isInitialized(),
		};
	}

	/**
	 * Registers the very first admin account from a verified Carmentis Desk wallet. Only usable
	 * while the server has no user yet; once the first user exists, registration is only
	 * possible through an invitation link.
	 */
	@Public()
	@Post('register')
	async register(@Body() dto: DeskAuthVerifyDto, @Res() res: Response) {
		if (await this.userService.isInitialized()) {
			throw new BadRequestException('Server is already initialized');
		}

		const publicKey = await this.deskAuthService.verifySignedChallenge(dto);
		const user = await this.registrationService.completeRegistration({ publicKey });

		const { token } = this.authTokenService.issueToken(user);
		setAdminSessionCookie(res, token, this.config.getJwtTokenValidity());

		return res.json({ success: true });
	}
}
