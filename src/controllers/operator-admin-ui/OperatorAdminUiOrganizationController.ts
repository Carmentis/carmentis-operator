import {
	BadRequestException,
	Body,
	Controller,
	Get,
	NotFoundException,
	Param,
	ParseIntPipe,
	Post,
	Query,
	Render,
	Req,
	Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrganizationEntity } from '../../entities/OrganizationEntity';
import { WalletEntity } from '../../entities/WalletEntity';
import { OrganizationService } from '../../services/OrganizationService';
import { CatalogService } from '../../services/CatalogService';
import { OnChainPublicationService } from '../../services/OnChainPublicationService';
import { OrganizationCreationDto } from '../../dto/OrganizationCreationDto';
import { OrganizationUpdateDto } from '../../dto/OrganizationUpdateDto';
import { getErrorMessage, redirectWithFlash, toOptionalNumber, validateForm } from '../../utils/AdminForm';
import { OPERATOR_ADMIN_UI_PREFIX } from './OperatorAdminUiController';

const ORGANIZATIONS_PATH = `${OPERATOR_ADMIN_UI_PREFIX}/organizations`;

/** Wallet columns needed to talk to the node and the indexer: the encrypted ones are never fetched. */
const WALLET_NETWORK_SELECT = { id: true, name: true, rpcEndpoint: true, indexerEndpoint: true } as const;

@Controller(ORGANIZATIONS_PATH)
export class OperatorAdminUiOrganizationController {
	constructor(
		@InjectRepository(OrganizationEntity)
		private readonly organizationRepository: Repository<OrganizationEntity>,
		@InjectRepository(WalletEntity)
		private readonly walletRepository: Repository<WalletEntity>,
		private readonly organizationService: OrganizationService,
		private readonly catalogService: CatalogService,
		private readonly publicationService: OnChainPublicationService,
	) {}

	@Get()
	@Render('organizations')
	async list(@Req() req: Request): Promise<any> {
		const [organizations, wallets] = await Promise.all([
			this.organizationRepository.find({
				select: {
					id: true,
					vbId: true,
					name: true,
					city: true,
					countryCode: true,
					website: true,
					createdAt: true,
					// Nested select keeps the join from ever touching the encrypted wallet columns.
					wallet: { id: true, name: true },
				},
				relations: { wallet: true },
				order: { createdAt: 'DESC' },
			}),
			this.walletRepository.find({ select: { id: true, name: true }, order: { name: 'ASC' } }),
		]);
		return {
			currentSection: 'organizations',
			user: (req as any).user,
			flash: req.query?.flash,
			flashType: req.query?.flashType,
			organizations,
			wallets,
		};
	}

	/**
	 * Local organizations of a wallet merged with what the indexer knows, fetched by the list
	 * page after it has loaded so that a slow or unreachable indexer never blocks the page.
	 */
	@Get('discover')
	async discover(@Query('walletId', ParseIntPipe) walletId: number) {
		const wallet = await this.walletRepository.findOne({ where: { id: walletId }, select: WALLET_NETWORK_SELECT });
		if (!wallet) {
			throw new NotFoundException('Wallet not found');
		}
		const { entries, attached, onChainError } = await this.catalogService.listOrganizations(wallet);
		return {
			walletId: wallet.id,
			walletName: wallet.name,
			attached,
			onChainError,
			entries: entries.map(({ status, local, onChain }) => ({ status, localId: local?.id, onChain })),
		};
	}

	@Get('new')
	@Render('organization-form')
	async newForm(@Req() req: Request): Promise<any> {
		const wallets = await this.walletRepository.find({ select: { id: true, name: true }, order: { name: 'ASC' } });
		return {
			currentSection: 'organizations',
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
			const dto = await validateForm(OrganizationCreationDto, {
				walletId: toOptionalNumber(body.walletId),
				name: body.name,
				city: body.city,
				countryCode: body.countryCode?.trim().toUpperCase(),
				website: body.website,
			});
			await this.organizationService.createOrganization(dto);
			return redirectWithFlash(res, ORGANIZATIONS_PATH, 'Organization created locally.', 'success');
		} catch (error) {
			return redirectWithFlash(
				res,
				`${ORGANIZATIONS_PATH}/new`,
				getErrorMessage(error, 'Could not create this organization.'),
				'error',
			);
		}
	}

	/** Registers locally an organization found on-chain. */
	@Post('import')
	async import(@Body() body: Record<string, string>, @Res() res: Response) {
		try {
			const walletId = toOptionalNumber(body.walletId);
			if (walletId === undefined || !body.vbId) {
				throw new BadRequestException('A wallet and a virtual blockchain ID are required');
			}
			const wallet = await this.walletRepository.findOne({ where: { id: walletId }, select: WALLET_NETWORK_SELECT });
			if (!wallet) {
				throw new NotFoundException('Wallet not found');
			}
			await this.catalogService.importOrganization(wallet, body.vbId);
			return redirectWithFlash(res, ORGANIZATIONS_PATH, 'Organization imported.', 'success');
		} catch (error) {
			return redirectWithFlash(res, ORGANIZATIONS_PATH, getErrorMessage(error, 'Could not import this organization.'), 'error');
		}
	}

	@Post(':id/publish')
	async publish(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
		try {
			await this.publicationService.publishOrganization(id);
			return redirectWithFlash(res, ORGANIZATIONS_PATH, 'Organization published on-chain.', 'success');
		} catch (error) {
			return redirectWithFlash(res, ORGANIZATIONS_PATH, getErrorMessage(error, 'Could not publish this organization.'), 'error');
		}
	}

	@Post(':id/update')
	async update(@Param('id', ParseIntPipe) id: number, @Body() body: Record<string, string>, @Res() res: Response) {
		try {
			const dto = await validateForm(OrganizationUpdateDto, {
				name: body.name,
				city: body.city,
				countryCode: body.countryCode?.trim().toUpperCase(),
				website: body.website,
			});
			await this.organizationService.updateOrganization(id, dto);
			return redirectWithFlash(res, ORGANIZATIONS_PATH, 'Organization updated locally.', 'success');
		} catch (error) {
			return redirectWithFlash(
				res,
				`${ORGANIZATIONS_PATH}/${id}/edit`,
				getErrorMessage(error, 'Could not save this organization.'),
				'error',
			);
		}
	}

	@Post(':id/delete')
	async delete(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
		try {
			await this.organizationService.deleteOrganization(id);
			return redirectWithFlash(res, ORGANIZATIONS_PATH, 'Organization deleted.', 'success');
		} catch (error) {
			return redirectWithFlash(res, ORGANIZATIONS_PATH, getErrorMessage(error, 'Could not delete this organization.'), 'error');
		}
	}

	@Get(':id/edit')
	@Render('organization-form')
	async editForm(@Req() req: Request, @Param('id', ParseIntPipe) id: number): Promise<any> {
		const organization = await this.organizationRepository.findOne({
			where: { id },
			select: {
				id: true,
				vbId: true,
				name: true,
				city: true,
				countryCode: true,
				website: true,
				wallet: { id: true, name: true },
			},
			relations: { wallet: true },
		});
		if (!organization) {
			throw new NotFoundException('Organization not found');
		}
		return {
			currentSection: 'organizations',
			user: (req as any).user,
			mode: 'edit',
			organization,
			flash: req.query?.flash,
			flashType: req.query?.flashType,
		};
	}
}
