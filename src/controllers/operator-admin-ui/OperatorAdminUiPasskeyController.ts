import { Controller, Get, Render, Req } from '@nestjs/common';
import { Request } from 'express';
import { OPERATOR_ADMIN_UI_PREFIX } from './OperatorAdminUiController';

@Controller(`${OPERATOR_ADMIN_UI_PREFIX}/passkeys`)
export class OperatorAdminUiPasskeyController {
	@Get()
	@Render('passkeys')
	async list(@Req() req: Request): Promise<any> {
		return {
			currentSection: 'passkeys',
			user: (req as any).user,
			flash: req.query?.flash,
			flashType: req.query?.flashType,
		};
	}
}
