import { Body, Controller, Get, NotFoundException, Param, ParseIntPipe, Post, Render, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiKeyEntity } from '../../entities/ApiKeyEntity';
import { ApplicationEntity } from '../../entities/ApplicationEntity';
import { WalletEntity } from '../../entities/WalletEntity';
import { ApiKeyService } from '../../services/ApiKeyService';
import { ApiKeyCreationDto } from '../../dto/ApiKeyCreationDto';
import { ApiKeyUpdateDto } from '../../dto/ApiKeyUpdateDto';
import {
	emptyToUndefined,
	getErrorMessage,
	redirectWithFlash,
	toOptionalNumber,
	validateForm,
} from '../../utils/AdminForm';
import { OPERATOR_ADMIN_UI_PREFIX } from './OperatorAdminUiController';

const API_KEYS_PATH = `${OPERATOR_ADMIN_UI_PREFIX}/api-keys`;

@Controller(API_KEYS_PATH)
export class OperatorAdminUiApiKeyController {
	constructor(
		@InjectRepository(ApiKeyEntity)
		private readonly apiKeyRepository: Repository<ApiKeyEntity>,
		@InjectRepository(ApplicationEntity)
		private readonly applicationRepository: Repository<ApplicationEntity>,
		@InjectRepository(WalletEntity)
		private readonly walletRepository: Repository<WalletEntity>,
		private readonly apiKeyService: ApiKeyService,
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

	/**
	 * Creates a key and renders the form again with the secret, which is only ever shown once
	 * (so it is neither redirected through the URL nor stored anywhere else).
	 */
	@Post()
	async create(@Req() req: Request, @Body() body: Record<string, string>, @Res() res: Response) {
		try {
			const dto = await validateForm(ApiKeyCreationDto, {
				name: body.name,
				applicationVbId: emptyToUndefined(body.applicationVbId),
				walletId: toOptionalNumber(body.walletId),
				endpointRegex: emptyToUndefined(body.endpointRegex),
				activeUntil: this.toIsoDate(body.activeUntil),
				gasMinAtomics: toOptionalNumber(body.gasMinAtomics),
				gasMaxAtomics: toOptionalNumber(body.gasMaxAtomics),
			});
			const application = dto.applicationVbId
				? await this.applicationRepository.findOneByOrFail({ vbId: dto.applicationVbId })
				: undefined;
			const wallet = dto.walletId !== undefined
				? await this.walletRepository.findOneByOrFail({ id: dto.walletId })
				: undefined;
			const created = await this.apiKeyService.createKey(
				dto.name,
				application,
				dto.activeUntil ? new Date(dto.activeUntil) : undefined,
				dto.endpointRegex,
				dto.gasMinAtomics,
				dto.gasMaxAtomics,
				wallet,
			);
			return res.render('api-key-created', {
				currentSection: 'api-keys',
				user: (req as any).user,
				createdKey: created.apiKey,
			});
		} catch (error) {
			return redirectWithFlash(res, `${API_KEYS_PATH}/new`, getErrorMessage(error, 'Could not create this API key.'), 'error');
		}
	}

	@Post(':id/update')
	async update(@Param('id', ParseIntPipe) id: number, @Body() body: Record<string, string>, @Res() res: Response) {
		try {
			const dto = await validateForm(ApiKeyUpdateDto, {
				name: body.name,
				applicationVbId: emptyToUndefined(body.applicationVbId) ?? null,
				walletId: toOptionalNumber(body.walletId) ?? null,
				endpointRegex: emptyToUndefined(body.endpointRegex),
				activeUntil: this.toIsoDate(body.activeUntil),
				gasMinAtomics: toOptionalNumber(body.gasMinAtomics),
				gasMaxAtomics: toOptionalNumber(body.gasMaxAtomics),
			});
			await this.apiKeyService.updateKey(id, await this.buildUpdate(dto));
			return redirectWithFlash(res, API_KEYS_PATH, 'API key updated.', 'success');
		} catch (error) {
			return redirectWithFlash(res, `${API_KEYS_PATH}/${id}/edit`, getErrorMessage(error, 'Could not save this API key.'), 'error');
		}
	}

	@Post(':id/toggle')
	async toggle(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
		try {
			await this.apiKeyService.toggleActivityForApiKeyById(id);
			return redirectWithFlash(res, API_KEYS_PATH, 'API key updated.', 'success');
		} catch (error) {
			return redirectWithFlash(res, API_KEYS_PATH, getErrorMessage(error, 'Could not update this API key.'), 'error');
		}
	}

	@Post(':id/delete')
	async delete(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
		try {
			await this.apiKeyService.deleteKeyById(id);
			return redirectWithFlash(res, API_KEYS_PATH, 'API key deleted.', 'success');
		} catch (error) {
			return redirectWithFlash(res, API_KEYS_PATH, getErrorMessage(error, 'Could not delete this API key.'), 'error');
		}
	}

	/**
	 * Builds the partial update from an explicit allowlist, so that nothing but the editable
	 * fields (never `apiKey`, `id`, `createdAt` or `isActive`) can reach the service. A `null`
	 * `applicationVbId` / `walletId` unlinks the relation.
	 */
	async buildUpdate(dto: ApiKeyUpdateDto): Promise<Partial<ApiKeyEntity>> {
		const update: Partial<ApiKeyEntity> = {};

		if (dto.name !== undefined) update.name = dto.name;
		if (dto.endpointRegex !== undefined) update.endpointRegex = dto.endpointRegex;
		if (dto.gasMinAtomics !== undefined) update.gasMinAtomics = dto.gasMinAtomics;
		if (dto.gasMaxAtomics !== undefined) update.gasMaxAtomics = dto.gasMaxAtomics;
		if (dto.activeUntil !== undefined) update.activeUntil = new Date(dto.activeUntil);

		if (dto.applicationVbId !== undefined) {
			update.application = dto.applicationVbId
				? await this.applicationRepository.findOneByOrFail({ vbId: dto.applicationVbId })
				: null;
		}
		if (dto.walletId !== undefined) {
			update.wallet = dto.walletId
				? await this.walletRepository.findOneByOrFail({ id: dto.walletId })
				: null;
		}
		return update;
	}

	/** `<input type="date">` yields YYYY-MM-DD; the DTOs expect an ISO 8601 timestamp. */
	private toIsoDate(value: string | undefined): string | undefined {
		const text = emptyToUndefined(value);
		if (text === undefined) return undefined;
		const date = new Date(text);
		return Number.isNaN(date.getTime()) ? text : date.toISOString();
	}
}
