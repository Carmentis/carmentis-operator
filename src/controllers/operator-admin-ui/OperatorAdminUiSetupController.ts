import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { Public } from '../../decorators/PublicDecorator';
import { UserService } from '../../services/UserService';
import { OPERATOR_ADMIN_UI_PREFIX } from './OperatorAdminUiController';

@Controller(`${OPERATOR_ADMIN_UI_PREFIX}/setup`)
export class OperatorAdminUiSetupController {
	constructor(private readonly userService: UserService) {}

	@Public()
	@Get()
	async renderSetup(@Res() res: Response) {
		if (await this.userService.isInitialized()) {
			return res.redirect('/admin/login');
		}
		return res.render('setup', {});
	}
}
