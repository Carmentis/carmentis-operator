import { Body, Controller, Get, Post, Render, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { OPERATOR_ADMIN_UI_PREFIX } from './OperatorAdminUiController';
import { RenamePseudoDto } from '../../dto/RenamePseudoDto';
import { UserService } from '../../services/UserService';
import { clearAdminSessionCookie } from '../../utils/AdminSession';
import { getErrorMessage, redirectWithFlash, validateForm } from '../../utils/AdminForm';

const ACCOUNT_PATH = `${OPERATOR_ADMIN_UI_PREFIX}/account`;

@Controller(ACCOUNT_PATH)
export class OperatorAdminUiAccountController {
	constructor(private readonly userService: UserService) {}

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

	@Post('pseudo')
	async renamePseudo(@Req() req: Request, @Body() body: Record<string, string>, @Res() res: Response) {
		try {
			const dto = await validateForm(RenamePseudoDto, { pseudo: (body.pseudo ?? '').trim() });
			await this.userService.renamePseudo((req as any).user.sub, dto.pseudo);
			return redirectWithFlash(res, ACCOUNT_PATH, 'Pseudo updated. It takes effect after you log in again.', 'success');
		} catch (error) {
			return redirectWithFlash(res, ACCOUNT_PATH, getErrorMessage(error, 'Could not update pseudo.'), 'error');
		}
	}

	@Post('delete')
	async deleteAccount(@Req() req: Request, @Body() body: Record<string, string>, @Res() res: Response) {
		try {
			if (body.confirmation !== 'DELETE') {
				throw new Error('Type DELETE to confirm the deletion of your account.');
			}
			await this.userService.deleteUserById((req as any).user.sub);
			clearAdminSessionCookie(res);
			return res.redirect(`${OPERATOR_ADMIN_UI_PREFIX}/login`);
		} catch (error) {
			return redirectWithFlash(res, ACCOUNT_PATH, getErrorMessage(error, 'Could not delete your account.'), 'error');
		}
	}
}
