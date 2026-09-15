import { Body, Controller, Post, Res, UnauthorizedException } from '@nestjs/common';
import { Response } from 'express';
import { OPERATOR_ADMIN_API_PREFIX } from './OperatorAdminApiController';
import { Public } from '../../decorators/PublicDecorator';
import { DeskAuthVerifyDto } from '../../dto/DeskAuthVerifyDto';
import { CarmentisDeskAuthService } from '../../services/CarmentisDeskAuthService';
import { UserService } from '../../services/UserService';
import { AuthTokenService } from '../../services/AuthTokenService';
import { OperatorConfigService } from '../../config/services/operator-config.service';
import { setAdminSessionCookie } from '../../utils/AdminSession';

/**
 * Carmentis Desk wallet login: a challenge is signed cryptographically ("challenge" endpoint
 * used by login/setup/invitation-registration alike, see `CarmentisDeskAuthService`), then here
 * the verified public key is resolved to an existing account and a session is issued.
 */
@Controller(`${OPERATOR_ADMIN_API_PREFIX}/auth`)
export class OperatorAdminApiAuthController {
	constructor(
		private readonly deskAuthService: CarmentisDeskAuthService,
		private readonly userService: UserService,
		private readonly authTokenService: AuthTokenService,
		private readonly config: OperatorConfigService,
	) {}

	@Public()
	@Post('challenge')
	async challenge() {
		return this.deskAuthService.startChallenge();
	}

	@Public()
	@Post('login')
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
}
