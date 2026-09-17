import { Controller, Get, Render, Req } from '@nestjs/common';
import { Request } from 'express';
import { OPERATOR_ADMIN_UI_PREFIX } from './OperatorAdminUiController';

@Controller(`${OPERATOR_ADMIN_UI_PREFIX}/account`)
export class OperatorAdminUiAccountController {
	@Get()
	@Render('account')
	async show(@Req() req: Request): Promise<any> {
		return {
			currentSection: 'account',
			user: (req as any).user,
			flash: req.query?.flash,
			flashType: req.query?.flashType,
		};
	}
}
