import { Controller, ForbiddenException, Get, Param, ParseIntPipe, Post, Render, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../../entities/UserEntity';
import { UserService } from '../../services/UserService';
import { getErrorMessage, redirectWithFlash } from '../../utils/AdminForm';
import { OPERATOR_ADMIN_UI_PREFIX } from './OperatorAdminUiController';

const USERS_PATH = `${OPERATOR_ADMIN_UI_PREFIX}/users`;

@Controller(USERS_PATH)
export class OperatorAdminUiUserController {
	constructor(
		@InjectRepository(UserEntity)
		private readonly userRepository: Repository<UserEntity>,
		private readonly userService: UserService,
	) {}

	@Get()
	@Render('users')
	async list(@Req() req: Request): Promise<any> {
		const rows = await this.userRepository.find({
			select: {
				id: true,
				pseudo: true,
				publicKey: true,
				createdAt: true,
			},
			order: { createdAt: 'ASC' },
		});

		const users = rows.map((row) => ({
			id: row.id,
			pseudo: row.pseudo,
			publicKey: row.publicKey,
			createdAt: row.createdAt,
		}));

		return {
			currentSection: 'users',
			user: (req as any).user,
			flash: req.query?.flash,
			flashType: req.query?.flashType,
			users,
		};
	}

	@Post(':id/delete')
	async delete(@Req() req: Request, @Param('id', ParseIntPipe) id: number, @Res() res: Response) {
		try {
			if (id === (req as any).user?.sub) {
				throw new ForbiddenException('You cannot delete your own account');
			}
			await this.userService.deleteUserById(id);
			return redirectWithFlash(res, USERS_PATH, 'User deleted.', 'success');
		} catch (error) {
			return redirectWithFlash(res, USERS_PATH, getErrorMessage(error, 'Could not delete this user.'), 'error');
		}
	}
}
