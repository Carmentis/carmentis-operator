import { Body, Controller, Get, Param, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { OPERATOR_ADMIN_API_PREFIX } from './OperatorAdminApiController';
import { Public } from '../../decorators/PublicDecorator';
import { CurrentAdminUser } from '../../decorators/CurrentAdminUserDecorator';
import { DeskAuthVerifyDto } from '../../dto/DeskAuthVerifyDto';
import { InvitationService } from '../../services/InvitationService';
import { CarmentisDeskAuthService } from '../../services/CarmentisDeskAuthService';
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
		private readonly deskAuthService: CarmentisDeskAuthService,
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
	@Post(':token/register')
	async register(@Param('token') token: string, @Body() dto: DeskAuthVerifyDto, @Res() res: Response) {
		const invitation = await this.invitationService.validateToken(token);

		const publicKey = await this.deskAuthService.verifySignedChallenge(dto);
		const user = await this.registrationService.completeRegistration({ publicKey, invitation });

		const { token: sessionToken } = this.authTokenService.issueToken(user);
		setAdminSessionCookie(res, sessionToken, this.config.getJwtTokenValidity());

		return res.json({ success: true });
	}
}
