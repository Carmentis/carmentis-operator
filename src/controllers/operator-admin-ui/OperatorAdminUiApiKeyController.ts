import { Controller, Get, NotFoundException, Param, ParseIntPipe, Render, Req } from '@nestjs/common';
import { Request } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiKeyEntity } from '../../entities/ApiKeyEntity';
import { ApplicationEntity } from '../../entities/ApplicationEntity';
import { WalletEntity } from '../../entities/WalletEntity';
import { OPERATOR_ADMIN_UI_PREFIX } from './OperatorAdminUiController';

@Controller(`${OPERATOR_ADMIN_UI_PREFIX}/api-keys`)
export class OperatorAdminUiApiKeyController {
	constructor(
		@InjectRepository(ApiKeyEntity)
		private readonly apiKeyRepository: Repository<ApiKeyEntity>,
		@InjectRepository(ApplicationEntity)
		private readonly applicationRepository: Repository<ApplicationEntity>,
		@InjectRepository(WalletEntity)
		private readonly walletRepository: Repository<WalletEntity>,
	) {}

	@Get()
	@Render('api-keys')
	async list(@Req() req: Request): Promise<any> {
		// Explicit column selection: ApiKeyEntity.apiKey is an @EncryptedColumn() and must
		// never be fetched (it is decrypted transparently on read) just to render a list.
		const apiKeys = await this.apiKeyRepository.find({
			select: {
				id: true,
				name: true,
				isActive: true,
				createdAt: true,
				activeUntil: true,
				endpointRegex: true,
				application: { vbId: true, name: true },
				wallet: { id: true, name: true },
			},
			relations: { application: true, wallet: true },
			order: { createdAt: 'DESC' },
		});

		return {
			currentSection: 'api-keys',
			user: (req as any).user,
			flash: req.query?.flash,
			flashType: req.query?.flashType,
			apiKeys,
		};
	}

	@Get('new')
	@Render('api-key-form')
	async newForm(@Req() req: Request): Promise<any> {
		const [applications, wallets] = await Promise.all([
			this.applicationRepository.find({ select: { vbId: true, name: true }, order: { name: 'ASC' } }),
			this.walletRepository.find({ select: { id: true, name: true }, order: { name: 'ASC' } }),
		]);
		return {
			currentSection: 'api-keys',
			user: (req as any).user,
			mode: 'create',
			applications,
			wallets,
		};
	}

	@Get(':id/edit')
	@Render('api-key-form')
	async editForm(@Req() req: Request, @Param('id', ParseIntPipe) id: number): Promise<any> {
		const [apiKey, applications, wallets] = await Promise.all([
			this.apiKeyRepository.findOne({
				where: { id },
				select: {
					id: true,
					name: true,
					endpointRegex: true,
					activeUntil: true,
					gasMinAtomics: true,
					gasMaxAtomics: true,
					application: { vbId: true, name: true },
					wallet: { id: true, name: true },
				},
				relations: { application: true, wallet: true },
			}),
			this.applicationRepository.find({ select: { vbId: true, name: true }, order: { name: 'ASC' } }),
			this.walletRepository.find({ select: { id: true, name: true }, order: { name: 'ASC' } }),
		]);
		if (!apiKey) {
			throw new NotFoundException('API key not found');
		}
		return {
			currentSection: 'api-keys',
			user: (req as any).user,
			mode: 'edit',
			apiKey,
			applications,
			wallets,
		};
	}
}
