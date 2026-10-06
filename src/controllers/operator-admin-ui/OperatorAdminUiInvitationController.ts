import { Body, Controller, Get, Param, Post, Render, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { Public } from '../../decorators/PublicDecorator';
import { InvitationService } from '../../services/InvitationService';
import { OperatorConfigService } from '../../config/services/operator-config.service';
import { UserService } from '../../services/UserService';
import { CarmentisDeskAuthService } from '../../services/CarmentisDeskAuthService';
import { RegistrationService } from '../../services/RegistrationService';
import { AuthTokenService } from '../../services/AuthTokenService';
import { DeskAuthVerifyDto } from '../../dto/DeskAuthVerifyDto';
import { setAdminSessionCookie } from '../../utils/AdminSession';
import { getErrorMessage, redirectWithFlash } from '../../utils/AdminForm';
import { OPERATOR_ADMIN_UI_PREFIX } from './OperatorAdminUiController';

@Controller(`${OPERATOR_ADMIN_UI_PREFIX}/invitations`)
export class OperatorAdminUiInvitationController {
	constructor(
		private readonly invitationService: InvitationService,
		private readonly config: OperatorConfigService,
		private readonly userService: UserService,
		private readonly deskAuthService: CarmentisDeskAuthService,
		private readonly registrationService: RegistrationService,
		private readonly authTokenService: AuthTokenService,
	) {}

	@Get()
	@Render('invitations')
	async list(@Req() req: Request): Promise<any> {
		return this.buildListModel(req);
	}

	/**
	 * Creates an invitation and renders the list again with the link, which is only ever shown
	 * once (the token is not stored in clear and must not travel through the URL).
	 */
	@Post()
	async create(@Req() req: Request, @Res() res: Response) {
		try {
			const createdBy = await this.userService.findUserById((req as any).user.sub);
			const { token } = await this.invitationService.createInvitation(createdBy);
			const link = `${req.protocol}://${req.get('host')}${OPERATOR_ADMIN_UI_PREFIX}/invitations/${token}`;
			return res.render('invitations', { ...(await this.buildListModel(req)), newInvitationLink: link });
		} catch (error) {
			return redirectWithFlash(
				res,
				`${OPERATOR_ADMIN_UI_PREFIX}/invitations`,
				getErrorMessage(error, 'Could not create this invitation.'),
				'error',
			);
		}
	}

	/**
	 * Renders the registration landing page for an invitation link. Validation errors are
	 * caught here (never left to bubble to AllExceptionsFilter, which cannot render HTML for
	 * this route) and turned into an `invalid` state shown by the same template.
	 */
	@Public()
	@Get(':token')
	@Render('invitation-register')
	async register(@Param('token') token: string) {
		try {
			await this.invitationService.validateToken(token);
			return { valid: true, token, relayUrl: this.config.getDeskAuthConfig().relayUrl };
		} catch (error) {
			return { valid: false, reason: error?.message ?? 'This invitation link is not valid.' };
		}
	}

	/** JSON endpoint of the Desk ceremony driven by the registration page. */
	@Public()
	@Post(':token/register')
	async completeRegistration(@Param('token') token: string, @Body() dto: DeskAuthVerifyDto, @Res() res: Response) {
		const invitation = await this.invitationService.validateToken(token);

		const publicKey = await this.deskAuthService.verifySignedChallenge(dto);
		const user = await this.registrationService.completeRegistration({ publicKey, invitation });

		const { token: sessionToken } = this.authTokenService.issueToken(user);
		setAdminSessionCookie(res, sessionToken, this.config.getJwtTokenValidity());
		return res.json({ success: true });
	}

	private async buildListModel(req: Request) {
		const currentUser = (req as any).user;
		const invitations = await this.invitationService.listForUser(currentUser.sub);
		return {
			currentSection: 'invitations',
			user: currentUser,
			flash: req.query?.flash,
			flashType: req.query?.flashType,
			invitations: invitations.map(invitation => ({
				createdAt: invitation.createdAt,
				expiresAt: invitation.expiresAt,
				status: this.invitationService.getStatus(invitation),
				usedByPseudo: invitation.usedBy?.pseudo ?? null,
			})),
		};
	}
}
