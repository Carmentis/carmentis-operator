import { Controller, Get, Logger, Render, Req } from '@nestjs/common';
import { Request } from 'express';
import { WalletEntity } from '../../entities/WalletEntity';
import { ApplicationEntity } from '../../entities/ApplicationEntity';
import { UserEntity } from '../../entities/UserEntity';
import { ApiKeyEntity } from '../../entities/ApiKeyEntity';
import { OPERATOR_ADMIN_UI_PREFIX } from './OperatorAdminUiController';

@Controller(`${OPERATOR_ADMIN_UI_PREFIX}`)
export class OperatorAdminUiDashboardController {
	private logger = new Logger(OperatorAdminUiDashboardController.name);

	@Get()
	@Render('dashboard')
	async dashboard(@Req() req: Request): Promise<any> {
		const [walletCount, applicationCount, userCount, apiKeyCount] =
			await Promise.all([
				WalletEntity.count(),
				ApplicationEntity.count(),
				UserEntity.count(),
				ApiKeyEntity.count(),
			]);

		return {
			user: (req as any).user,
			currentSection: 'dashboard',
			walletCount,
			applicationCount,
			userCount,
			apiKeyCount,
			flash: req.query?.flash,
			flashType: req.query?.flashType,
		};
	}
}
