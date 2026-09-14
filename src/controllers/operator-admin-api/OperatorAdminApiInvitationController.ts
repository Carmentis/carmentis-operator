import { Body, Controller, Get, Param, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { OPERATOR_ADMIN_API_PREFIX } from './OperatorAdminApiController';
import { Public } from '../../decorators/PublicDecorator';
import { CurrentAdminUser } from '../../decorators/CurrentAdminUserDecorator';
import { InvitationRegistrationDto } from '../../dto/InvitationRegistrationDto';
import { WebauthnResponseDto } from '../../dto/WebauthnResponseDto';
import { InvitationService } from '../../services/InvitationService';
import { WebauthnService } from '../../services/WebauthnService';
import { RegistrationService } from '../../services/RegistrationService';
import { AuthTokenService } from '../../services/AuthTokenService';
import { UserService } from '../../services/UserService';
import { OperatorConfigService } from '../../config/services/operator-config.service';
import { setAdminSessionCookie } from '../../utils/AdminSession';
import { AdminJwtPayload } from '../../services/AuthTokenService';

@Controller(`${OPERATOR_ADMIN_API_PREFIX}/invitations`)
export class OperatorAdminApiInvitationController {
	constructor(
		private readonly invitationService: InvitationService,
		private readonly webauthnService: WebauthnService,
		private readonly registrationService: RegistrationService,
		private readonly authTokenService: AuthTokenService,
		private readonly userService: UserService,
		private readonly config: OperatorConfigService,
	) {}

	@Post()
	async create(@CurrentAdminUser() currentUser: AdminJwtPayload) {
		const createdBy = await this.userService.findUserById(currentUser.sub);
		const { token, invitation } = await this.invitationService.createInvitation(createdBy);
		return {
			token,
			expiresAt: invitation.expiresAt,
		};
	}

	@Get()
	async list(@CurrentAdminUser() currentUser: AdminJwtPayload) {
		const invitations = await this.invitationService.listForUser(currentUser.sub);
		return invitations.map((invitation) => ({
			id: invitation.id,
			createdAt: invitation.createdAt,
			expiresAt: invitation.expiresAt,
			usedAt: invitation.usedAt ?? null,
			usedByPseudo: invitation.usedBy?.pseudo ?? null,
			status: this.invitationService.getStatus(invitation),
		}));
	}

	@Public()
	@Post(':token/register/options')
	async registerOptions(@Param('token') token: string, @Body() dto: InvitationRegistrationDto) {
		const invitation = await this.invitationService.validateToken(token);
		return this.webauthnService.beginRegistration({
			userName: dto.pseudo,
			userDisplayName: dto.pseudo,
			pendingPseudo: dto.pseudo,
			pendingEmail: dto.email,
			invitationId: invitation.id,
		});
	}

	@Public()
	@Post(':token/register/verify')
	async registerVerify(@Param('token') token: string, @Body() dto: WebauthnResponseDto, @Res() res: Response) {
		const invitation = await this.invitationService.validateToken(token);

		const result = await this.webauthnService.finishRegistration(dto.response as any);
		const user = await this.registrationService.completeRegistration({
			challengeRow: result.challengeRow,
			credential: result,
			invitation,
		});

		const { token: sessionToken } = this.authTokenService.issueToken(user);
		setAdminSessionCookie(res, sessionToken, this.config.getJwtTokenValidity());

		return res.json({ success: true });
	}
}
