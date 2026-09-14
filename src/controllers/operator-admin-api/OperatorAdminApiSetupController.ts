import { BadRequestException, Body, Controller, Get, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { OPERATOR_ADMIN_API_PREFIX } from './OperatorAdminApiController';
import { Public } from '../../decorators/PublicDecorator';
import { SetupFirstUserDto } from '../../dto/SetupFirstUserDto';
import { WebauthnResponseDto } from '../../dto/WebauthnResponseDto';
import { UserService } from '../../services/UserService';
import { WebauthnService } from '../../services/WebauthnService';
import { RegistrationService } from '../../services/RegistrationService';
import { AuthTokenService } from '../../services/AuthTokenService';
import { OperatorConfigService } from '../../config/services/operator-config.service';
import { setAdminSessionCookie } from '../../utils/AdminSession';

@Controller(`${OPERATOR_ADMIN_API_PREFIX}/setup`)
export class OperatorAdminApiSetupController {
	constructor(
		private readonly userService: UserService,
		private readonly webauthnService: WebauthnService,
		private readonly registrationService: RegistrationService,
		private readonly authTokenService: AuthTokenService,
		private readonly config: OperatorConfigService,
	) {}

	@Public()
	@Get('/status')
	async status() {
		return {
			isInitialized: await this.userService.isInitialized(),
		};
	}

	/**
	 * Begins the passkey registration ceremony for the very first admin user. Only usable
	 * while the server has no user yet; once the first user exists, registration is only
	 * possible through an invitation link.
	 */
	@Public()
	@Post('register/options')
	async registerOptions(@Body() dto: SetupFirstUserDto) {
		if (await this.userService.isInitialized()) {
			throw new BadRequestException('Server is already initialized');
		}
		return this.webauthnService.beginRegistration({
			userName: dto.pseudo,
			userDisplayName: dto.pseudo,
			pendingPseudo: dto.pseudo,
			pendingEmail: dto.email,
		});
	}

	@Public()
	@Post('register/verify')
	async registerVerify(@Body() dto: WebauthnResponseDto, @Res() res: Response) {
		if (await this.userService.isInitialized()) {
			throw new BadRequestException('Server is already initialized');
		}

		const result = await this.webauthnService.finishRegistration(dto.response as any);
		const user = await this.registrationService.completeRegistration({
			challengeRow: result.challengeRow,
			credential: result,
		});

		const { token } = this.authTokenService.issueToken(user);
		setAdminSessionCookie(res, token, this.config.getJwtTokenValidity());

		return res.json({ success: true });
	}
}
