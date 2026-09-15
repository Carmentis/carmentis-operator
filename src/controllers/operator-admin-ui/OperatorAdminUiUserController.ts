import { Controller, Get, Render, Req } from '@nestjs/common';
import { Request } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../../entities/UserEntity';
import { OPERATOR_ADMIN_UI_PREFIX } from './OperatorAdminUiController';

@Controller(`${OPERATOR_ADMIN_UI_PREFIX}/users`)
export class OperatorAdminUiUserController {
	constructor(
		@InjectRepository(UserEntity)
		private readonly userRepository: Repository<UserEntity>,
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
}
