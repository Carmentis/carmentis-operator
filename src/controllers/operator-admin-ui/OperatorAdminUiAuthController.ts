import { Controller, Get, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { Public } from '../../decorators/PublicDecorator';
import { UserService } from '../../services/UserService';
import { OPERATOR_ADMIN_UI_PREFIX } from './OperatorAdminUiController';
import { clearAdminSessionCookie } from '../../utils/AdminSession';

@Controller(OPERATOR_ADMIN_UI_PREFIX)
export class OperatorAdminUiAuthController {
	constructor(private readonly userService: UserService) {}

	@Public()
	@Get('login')
	async renderLogin(@Req() req: Request, @Res() res: Response) {
		if (!(await this.userService.isInitialized())) {
			return res.redirect('/admin/setup');
		}
		return res.render('login', {
			error: req.query?.error,
			next: req.query?.next,
		});
	}

	@Public()
	@Post('logout')
	async logout(@Res() res: Response) {
		clearAdminSessionCookie(res);
		return res.redirect('/admin/login');
	}
}
