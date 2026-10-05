import { Body, Controller, Get, NotFoundException, Param, Post, Render, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplicationEntity } from '../../entities/ApplicationEntity';
import { WalletEntity } from '../../entities/WalletEntity';
import { ApplicationService } from '../../services/ApplicationService';
import { ApplicationCreationDto } from '../../dto/ApplicationCreationDto';
import { ApplicationUpdateDto } from '../../dto/ApplicationUpdateDto';
import { getErrorMessage, redirectWithFlash, toOptionalNumber, validateForm } from '../../utils/AdminForm';
import { OPERATOR_ADMIN_UI_PREFIX } from './OperatorAdminUiController';

const APPLICATIONS_PATH = `${OPERATOR_ADMIN_UI_PREFIX}/applications`;

@Controller(APPLICATIONS_PATH)
export class OperatorAdminUiApplicationController {
	constructor(
		@InjectRepository(ApplicationEntity)
		private readonly applicationRepository: Repository<ApplicationEntity>,
		@InjectRepository(WalletEntity)
		private readonly walletRepository: Repository<WalletEntity>,
		private readonly applicationService: ApplicationService,
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
			flash: req.query?.flash,
			flashType: req.query?.flashType,
		};
	}

	@Post()
	async create(@Body() body: Record<string, string>, @Res() res: Response) {
		try {
			const dto = await validateForm(ApplicationCreationDto, {
				name: body.name,
				vbId: body.vbId,
				walletId: toOptionalNumber(body.walletId),
			});
			const wallet = await this.walletRepository.findOneBy({ id: dto.walletId });
			if (!wallet) {
				throw new NotFoundException('Wallet not found');
			}
			await this.applicationRepository.save({ vbId: dto.vbId, name: dto.name, wallet });
			return redirectWithFlash(res, APPLICATIONS_PATH, 'Application created.', 'success');
		} catch (error) {
			return redirectWithFlash(
				res,
				`${APPLICATIONS_PATH}/new`,
				getErrorMessage(error, 'Could not create this application.'),
				'error',
			);
		}
	}

	@Post(':vbId/update')
	async update(@Param('vbId') vbId: string, @Body() body: Record<string, string>, @Res() res: Response) {
		try {
			const dto = await validateForm(ApplicationUpdateDto, { name: body.name });
			await this.applicationService.updateApplication(vbId, dto);
			return redirectWithFlash(res, APPLICATIONS_PATH, 'Application updated.', 'success');
		} catch (error) {
			return redirectWithFlash(
				res,
				`${APPLICATIONS_PATH}/${encodeURIComponent(vbId)}/edit`,
				getErrorMessage(error, 'Could not save this application.'),
				'error',
			);
		}
	}

	@Post(':vbId/delete')
	async delete(@Param('vbId') vbId: string, @Res() res: Response) {
		try {
			await this.applicationService.deleteApplication(vbId);
			return redirectWithFlash(res, APPLICATIONS_PATH, 'Application deleted.', 'success');
		} catch (error) {
			return redirectWithFlash(res, APPLICATIONS_PATH, getErrorMessage(error, 'Could not delete this application.'), 'error');
		}
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
			flash: req.query?.flash,
			flashType: req.query?.flashType,
		};
	}
}
