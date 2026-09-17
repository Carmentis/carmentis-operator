import { Controller, Get, Param, Render, Req } from '@nestjs/common';
import { Request } from 'express';
import { Public } from '../../decorators/PublicDecorator';
import { InvitationService } from '../../services/InvitationService';
import { OperatorConfigService } from '../../config/services/operator-config.service';
import { OPERATOR_ADMIN_UI_PREFIX } from './OperatorAdminUiController';

@Controller(`${OPERATOR_ADMIN_UI_PREFIX}/invitations`)
export class OperatorAdminUiInvitationController {
	constructor(
		private readonly invitationService: InvitationService,
		private readonly config: OperatorConfigService,
	) {}

	@Get()
	@Render('invitations')
	async list(@Req() req: Request): Promise<any> {
		return {
			currentSection: 'invitations',
			user: (req as any).user,
			flash: req.query?.flash,
			flashType: req.query?.flashType,
		};
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
}
