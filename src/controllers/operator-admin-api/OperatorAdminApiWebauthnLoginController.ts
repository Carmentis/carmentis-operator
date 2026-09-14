import { Body, Controller, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { OPERATOR_ADMIN_API_PREFIX } from './OperatorAdminApiController';
import { Public } from '../../decorators/PublicDecorator';
import { WebauthnResponseDto } from '../../dto/WebauthnResponseDto';
import { WebauthnService } from '../../services/WebauthnService';
import { AuthTokenService } from '../../services/AuthTokenService';
import { OperatorConfigService } from '../../config/services/operator-config.service';
import { setAdminSessionCookie } from '../../utils/AdminSession';

/**
 * Discoverable ("usernameless") passkey login: the browser is asked for any resident key
 * scoped to this Relying Party, without the server first needing to know who is signing in.
 */
@Controller(`${OPERATOR_ADMIN_API_PREFIX}/login/webauthn`)
export class OperatorAdminApiWebauthnLoginController {
	constructor(
		private readonly webauthnService: WebauthnService,
		private readonly authTokenService: AuthTokenService,
		private readonly config: OperatorConfigService,
	) {}

	@Public()
	@Post('options')
	async options() {
		return this.webauthnService.beginAuthentication();
	}

	@Public()
	@Post('verify')
	async verify(@Body() dto: WebauthnResponseDto, @Res() res: Response) {
		const { credential } = await this.webauthnService.finishAuthentication(dto.response as any);

		const { token } = this.authTokenService.issueToken(credential.user);
		setAdminSessionCookie(res, token, this.config.getJwtTokenValidity());

		return res.json({ success: true });
	}
}
