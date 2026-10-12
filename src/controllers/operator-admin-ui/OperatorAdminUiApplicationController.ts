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
import { ApplicationEntity } from '../../entities/ApplicationEntity';
import { OrganizationEntity } from '../../entities/OrganizationEntity';
import { WalletEntity } from '../../entities/WalletEntity';
import { ApplicationService } from '../../services/ApplicationService';
import { CatalogService } from '../../services/CatalogService';
import { OnChainPublicationService } from '../../services/OnChainPublicationService';
import { WalletService } from '../../services/WalletService';
import { ApplicationCreationDto } from '../../dto/ApplicationCreationDto';
import { ApplicationUpdateDto } from '../../dto/ApplicationUpdateDto';
import { getErrorMessage, redirectWithFlash, toOptionalNumber, validateForm } from '../../utils/AdminForm';
import { OPERATOR_ADMIN_UI_PREFIX } from './OperatorAdminUiController';

const APPLICATIONS_PATH = `${OPERATOR_ADMIN_UI_PREFIX}/applications`;

/** Wallet columns needed to talk to the node and the indexer: the encrypted ones are never fetched. */
const WALLET_NETWORK_SELECT = { id: true, name: true, rpcEndpoint: true, indexerEndpoint: true } as const;

@Controller(APPLICATIONS_PATH)
export class OperatorAdminUiApplicationController {
	constructor(
		@InjectRepository(ApplicationEntity)
		private readonly applicationRepository: Repository<ApplicationEntity>,
		@InjectRepository(OrganizationEntity)
		private readonly organizationRepository: Repository<OrganizationEntity>,
		@InjectRepository(WalletEntity)
		private readonly walletRepository: Repository<WalletEntity>,
		private readonly applicationService: ApplicationService,
		private readonly walletService: WalletService,
		private readonly catalogService: CatalogService,
		private readonly publicationService: OnChainPublicationService,
	) {}

	@Get()
	@Render('applications')
	async list(@Req() req: Request): Promise<any> {
		const [applications, wallets] = await Promise.all([
			this.applicationRepository.find({
				select: {
					id: true,
					vbId: true,
					name: true,
					createdAt: true,
					// Nested select keeps the join from ever touching the encrypted wallet columns.
					wallet: { id: true, name: true },
					organization: { id: true, name: true },
				},
				relations: { wallet: true, organization: true },
				order: { createdAt: 'DESC' },
			}),
			this.walletRepository.find({ select: { id: true, name: true }, order: { name: 'ASC' } }),
		]);

		return {
			currentSection: 'applications',
			user: (req as any).user,
			flash: req.query?.flash,
			flashType: req.query?.flashType,
			applications,
			wallets,
		};
	}

	/**
	 * Local applications of a wallet merged with what the indexer knows, fetched by the list
	 * page after it has loaded so that a slow or unreachable indexer never blocks the page.
	 */
	@Get('discover')
	async discover(@Query('walletId', ParseIntPipe) walletId: number) {
		const wallet = await this.walletRepository.findOne({ where: { id: walletId }, select: WALLET_NETWORK_SELECT });
		if (!wallet) {
			throw new NotFoundException('Wallet not found');
		}
		const { entries, attached, onChainError } = await this.catalogService.listApplications(wallet);
		return {
			walletId: wallet.id,
			walletName: wallet.name,
			attached,
			onChainError,
			entries: entries.map(({ status, local, onChain }) => ({ status, localId: local?.id, onChain })),
		};
	}

	@Get('new')
	@Render('application-form')
	async newForm(@Req() req: Request): Promise<any> {
		const [wallets, organizations] = await Promise.all([
			this.walletRepository.find({ select: { id: true, name: true }, order: { name: 'ASC' } }),
			this.organizationRepository.find({
				select: { id: true, name: true, wallet: { id: true } },
				relations: { wallet: true },
				order: { name: 'ASC' },
			}),
		]);
		return {
			currentSection: 'applications',
			user: (req as any).user,
			mode: 'create',
			wallets,
			organizations,
			flash: req.query?.flash,
			flashType: req.query?.flashType,
		};
	}

	@Post()
	async create(@Body() body: Record<string, string>, @Res() res: Response) {
		try {
			const dto = await validateForm(ApplicationCreationDto, {
				walletId: toOptionalNumber(body.walletId),
				organizationId: toOptionalNumber(body.organizationId),
				name: body.name,
				description: body.description,
				homepageUrl: body.homepageUrl,
				logoUrl: body.logoUrl,
			});
			await this.applicationService.createApplication(dto);
			return redirectWithFlash(res, APPLICATIONS_PATH, 'Application created locally.', 'success');
		} catch (error) {
			return redirectWithFlash(
				res,
				`${APPLICATIONS_PATH}/new`,
				getErrorMessage(error, 'Could not create this application.'),
				'error',
			);
		}
	}

	/** Registers locally an application found on-chain. */
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
			await this.catalogService.importApplication(wallet, body.vbId);
			return redirectWithFlash(res, APPLICATIONS_PATH, 'Application imported.', 'success');
		} catch (error) {
			return redirectWithFlash(res, APPLICATIONS_PATH, getErrorMessage(error, 'Could not import this application.'), 'error');
		}
	}

	@Post(':id/publish')
	async publish(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
		try {
			await this.publicationService.publishApplication(id);
			return redirectWithFlash(res, APPLICATIONS_PATH, 'Application published on-chain.', 'success');
		} catch (error) {
			return redirectWithFlash(res, APPLICATIONS_PATH, getErrorMessage(error, 'Could not publish this application.'), 'error');
		}
	}

	@Post(':id/update')
	async update(@Param('id', ParseIntPipe) id: number, @Body() body: Record<string, string>, @Res() res: Response) {
		try {
			const dto = await validateForm(ApplicationUpdateDto, {
				name: body.name,
				description: body.description,
				homepageUrl: body.homepageUrl,
				logoUrl: body.logoUrl,
			});
			await this.applicationService.updateApplication(id, dto);
			return redirectWithFlash(res, APPLICATIONS_PATH, 'Application updated locally.', 'success');
		} catch (error) {
			return redirectWithFlash(
				res,
				`${APPLICATIONS_PATH}/${id}/edit`,
				getErrorMessage(error, 'Could not save this application.'),
				'error',
			);
		}
	}

	@Post(':id/delete')
	async delete(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
		try {
			await this.applicationService.deleteApplication(id);
			return redirectWithFlash(res, APPLICATIONS_PATH, 'Application deleted.', 'success');
		} catch (error) {
			return redirectWithFlash(res, APPLICATIONS_PATH, getErrorMessage(error, 'Could not delete this application.'), 'error');
		}
	}

	@Get(':id')
	@Render('application-details')
	async details(@Req() req: Request, @Param('id', ParseIntPipe) id: number): Promise<any> {
		// Explicit selection: the encrypted columns of the wallet and of the API keys are never fetched.
		const application = await this.applicationRepository.findOne({
			where: { id },
			select: {
				id: true,
				vbId: true,
				name: true,
				description: true,
				homepageUrl: true,
				logoUrl: true,
				createdAt: true,
				wallet: { id: true, name: true },
				organization: { id: true, name: true, vbId: true },
				apiKeys: { id: true, name: true, isActive: true, activeUntil: true },
			},
			relations: { wallet: true, organization: true, apiKeys: true },
		});
		if (!application) {
			throw new NotFoundException('Application not found');
		}
		return {
			currentSection: 'applications',
			user: (req as any).user,
			flash: req.query?.flash,
			flashType: req.query?.flashType,
			application,
			anchorRequestCount: (await this.applicationService.countDependents(id)).anchorRequests,
		};
	}

	/**
	 * Live on-chain data of the application and of its organization, fetched by the details
	 * page after it has loaded so that a slow or unreachable node never blocks the page itself.
	 */
	@Get(':id/chain')
	async chain(@Param('id', ParseIntPipe) id: number) {
		const application = await this.applicationRepository.findOne({
			where: { id },
			select: { id: true, vbId: true, wallet: { id: true, rpcEndpoint: true } },
			relations: { wallet: true },
		});
		if (!application) {
			throw new NotFoundException('Application not found');
		}
		if (!application.vbId) {
			return { error: 'This application has not been published yet.' };
		}
		try {
			return await this.walletService.getApplicationOnChainDetails(application.wallet, application.vbId);
		} catch (error) {
			return { error: getErrorMessage(error, 'The application could not be retrieved from the node.') };
		}
	}

	@Get(':id/edit')
	@Render('application-form')
	async editForm(@Req() req: Request, @Param('id', ParseIntPipe) id: number): Promise<any> {
		const application = await this.applicationRepository.findOne({
			where: { id },
			select: {
				id: true,
				vbId: true,
				name: true,
				description: true,
				homepageUrl: true,
				logoUrl: true,
				wallet: { id: true, name: true },
				organization: { id: true, name: true },
			},
			relations: { wallet: true, organization: true },
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
