import { Controller, Get, NotFoundException, Param, Render, Req } from '@nestjs/common';
import { Request } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplicationEntity } from '../../entities/ApplicationEntity';
import { WalletEntity } from '../../entities/WalletEntity';
import { OPERATOR_ADMIN_UI_PREFIX } from './OperatorAdminUiController';

@Controller(`${OPERATOR_ADMIN_UI_PREFIX}/applications`)
export class OperatorAdminUiApplicationController {
	constructor(
		@InjectRepository(ApplicationEntity)
		private readonly applicationRepository: Repository<ApplicationEntity>,
		@InjectRepository(WalletEntity)
		private readonly walletRepository: Repository<WalletEntity>,
	) {}

	@Get()
	@Render('applications')
	async list(@Req() req: Request): Promise<any> {
		const applications = await this.applicationRepository.find({
			select: {
				vbId: true,
				name: true,
				createdAt: true,
				// Nested select keeps the join from ever touching WalletEntity.seed.
				wallet: { id: true, name: true },
			},
			relations: { wallet: true },
			order: { createdAt: 'DESC' },
		});

		return {
			currentSection: 'applications',
			user: (req as any).user,
			flash: req.query?.flash,
			flashType: req.query?.flashType,
			applications,
		};
	}

	@Get('new')
	@Render('application-form')
	async newForm(@Req() req: Request): Promise<any> {
		const wallets = await this.walletRepository.find({
			select: { id: true, name: true },
			order: { name: 'ASC' },
		});
		return {
			currentSection: 'applications',
			user: (req as any).user,
			mode: 'create',
			wallets,
		};
	}

	@Get(':vbId/edit')
	@Render('application-form')
	async editForm(@Req() req: Request, @Param('vbId') vbId: string): Promise<any> {
		const application = await this.applicationRepository.findOne({
			where: { vbId },
			select: { vbId: true, name: true, wallet: { id: true, name: true } },
			relations: { wallet: true },
		});
		if (!application) {
			throw new NotFoundException('Application not found');
		}
		return {
			currentSection: 'applications',
			user: (req as any).user,
			mode: 'edit',
			application,
		};
	}
}
