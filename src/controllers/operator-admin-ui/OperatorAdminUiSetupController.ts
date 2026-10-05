import { BadRequestException, Body, Controller, Get, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { Public } from '../../decorators/PublicDecorator';
import { UserService } from '../../services/UserService';
import { OperatorConfigService } from '../../config/services/operator-config.service';
import { CarmentisDeskAuthService } from '../../services/CarmentisDeskAuthService';
import { RegistrationService } from '../../services/RegistrationService';
import { AuthTokenService } from '../../services/AuthTokenService';
import { DeskAuthVerifyDto } from '../../dto/DeskAuthVerifyDto';
import { setAdminSessionCookie } from '../../utils/AdminSession';
import { OPERATOR_ADMIN_UI_PREFIX } from './OperatorAdminUiController';

@Controller(`${OPERATOR_ADMIN_UI_PREFIX}/setup`)
export class OperatorAdminUiSetupController {
	constructor(
		private readonly userService: UserService,
		private readonly config: OperatorConfigService,
		private readonly deskAuthService: CarmentisDeskAuthService,
		private readonly registrationService: RegistrationService,
		private readonly authTokenService: AuthTokenService,
	) {}

	@Public()
	@Get()
	async renderSetup(@Res() res: Response) {
		if (await this.userService.isInitialized()) {
			return res.redirect('/admin/login');
		}
		return res.render('setup', { relayUrl: this.config.getDeskAuthConfig().relayUrl });
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
