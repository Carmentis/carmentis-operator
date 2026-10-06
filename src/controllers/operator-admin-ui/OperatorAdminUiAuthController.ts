import { Body, Controller, Get, Post, Req, Res, UnauthorizedException } from '@nestjs/common';
import { Request, Response } from 'express';
import { Public } from '../../decorators/PublicDecorator';
import { UserService } from '../../services/UserService';
import { OperatorConfigService } from '../../config/services/operator-config.service';
import { OPERATOR_ADMIN_UI_PREFIX } from './OperatorAdminUiController';
import { clearAdminSessionCookie, setAdminSessionCookie } from '../../utils/AdminSession';
import { CarmentisDeskAuthService } from '../../services/CarmentisDeskAuthService';
import { AuthTokenService } from '../../services/AuthTokenService';
import { DeskAuthVerifyDto } from '../../dto/DeskAuthVerifyDto';

/**
 * Login pages and the Carmentis Desk exchange behind them.
 *
 * The Desk sign-in is the one admin flow that cannot be a plain form post: the browser must
 * run the Desk popup ceremony (see `carmentis-desk-auth.js`), which needs a JSON challenge
 * endpoint and a JSON verification endpoint. `challenge` is shared by login, first-admin setup
 * and invitation registration.
 */
@Controller(OPERATOR_ADMIN_UI_PREFIX)
export class OperatorAdminUiAuthController {
	constructor(
		private readonly userService: UserService,
		private readonly config: OperatorConfigService,
		private readonly deskAuthService: CarmentisDeskAuthService,
		private readonly authTokenService: AuthTokenService,
	) {}

	@Public()
	@Get('login')
	async renderLogin(@Req() req: Request, @Res() res: Response) {
		if (!(await this.userService.isInitialized())) {
			return res.redirect('/admin/setup');
		}
		return res.render('login', {
			error: req.query?.error,
			next: req.query?.next,
			relayUrl: this.config.getDeskAuthConfig().relayUrl,
		});
	}

	@Public()
	@Post('auth/challenge')
	async challenge() {
		return this.deskAuthService.startChallenge();
	}

	@Public()
	@Post('auth/login')
	async login(@Body() dto: DeskAuthVerifyDto, @Res() res: Response) {
		const publicKey = await this.deskAuthService.verifySignedChallenge(dto);

		const user = await this.userService.findByPublicKey(publicKey);
		if (!user) {
			throw new UnauthorizedException('Unknown wallet. Ask an administrator for an invitation.');
		}

		const { token } = this.authTokenService.issueToken(user);
		setAdminSessionCookie(res, token, this.config.getJwtTokenValidity());
		return res.json({ success: true });
	}

	@Public()
	@Post('logout')
	async logout(@Res() res: Response) {
		clearAdminSessionCookie(res);
		return res.redirect('/admin/login');
	}
}
