import {
	BadRequestException,
	Body,
	Controller,
	Get,
	NotFoundException,
	Param,
	ParseIntPipe,
	Post,
	Render,
	Req,
	Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SignatureSchemeId } from '@cmts-dev/carmentis-sdk-core';
import { WalletEntity } from '../../entities/WalletEntity';
import { WalletService } from '../../services/WalletService';
import { WalletCreationDto } from '../../dto/wallet/WalletCreationDto';
import { WalletUpdateDto } from '../../dto/admin/WalletUpdateDto';
import { PrivateKeyObjectType } from '../../types/types';
import { CUSTOM_NETWORK_ID, DEFAULT_NETWORK_ID, resolveNetwork, WALLET_NETWORKS } from '../../config/WalletNetworks';
import { OPERATOR_ADMIN_UI_PREFIX } from './OperatorAdminUiController';
import {
	emptyToUndefined,
	getErrorMessage,
	redirectWithFlash,
	validateForm,
} from '../../utils/AdminForm';

const WALLETS_PATH = `${OPERATOR_ADMIN_UI_PREFIX}/wallets`;

@Controller(WALLETS_PATH)
export class OperatorAdminUiWalletController {
	constructor(
		@InjectRepository(WalletEntity)
		private readonly walletRepository: Repository<WalletEntity>,
		private readonly walletService: WalletService,
	) {}

	@Get()
	@Render('wallets')
	async list(@Req() req: Request): Promise<any> {
		// Explicit column selection: the encrypted columns (actorPassphrase) and the private
		// key relation must never be fetched just to render a list.
		const wallets = await this.walletRepository.find({
			select: {
				id: true,
				name: true,
				rpcEndpoint: true,
				indexerEndpoint: true,
				createdAt: true,
			},
			order: { createdAt: 'DESC' },
		});

		return {
			currentSection: 'wallets',
			user: (req as any).user,
			flash: req.query?.flash,
			flashType: req.query?.flashType,
			wallets,
		};
	}

	@Get('new')
	@Render('wallet-form')
	async newForm(@Req() req: Request): Promise<any> {
		return {
			currentSection: 'wallets',
			user: (req as any).user,
			mode: 'create',
			keyType: PrivateKeyObjectType.SEED,
			...this.buildCreationDefaults(DEFAULT_NETWORK_ID),
		};
	}

	/** Stateless helper for the "regenerate" button of the actor passphrase: nothing is persisted. */
	@Post('passphrase')
	generatePassphrase(): { passphrase: string } {
		return { passphrase: this.walletService.generateActorPassphrase() };
	}

	/** Stateless helper for the "generate" button of the creation form: nothing is persisted. */
	@Post('seed')
	generateSeed(): { seed: string } {
		return { seed: this.walletService.generateSeed() };
	}

	@Post()
	async create(@Req() req: Request, @Body() body: Record<string, string>, @Res() res: Response) {
		try {
			const endpoints = this.resolveEndpoints(body);
			const dto = await validateForm(WalletCreationDto, {
				name: body.name,
				rpcEndpoint: endpoints.rpcEndpoint,
				indexerEndpoint: endpoints.indexerEndpoint,
				allowedEndpointsRegex: emptyToUndefined(body.allowedEndpointsRegex),
				actorPassphrase: body.actorPassphrase,
				privateKey: this.buildPrivateKeyObject(body),
			});
			await this.walletService.createWallet(dto);
			return redirectWithFlash(res, WALLETS_PATH, 'Wallet created.', 'success');
		} catch (error) {
			// Re-render the form (rather than redirecting) so the user does not lose the
			// pasted key; the secret fields are deliberately not echoed back.
			return res.status(400).render('wallet-form', {
				currentSection: 'wallets',
				user: (req as any).user,
				mode: 'create',
				keyType: body.keyType === PrivateKeyObjectType.JWK ? PrivateKeyObjectType.JWK : PrivateKeyObjectType.SEED,
				...this.buildCreationDefaults(body.network),
				flash: getErrorMessage(error, 'Could not create this wallet.'),
				flashType: 'error',
				wallet: undefined,
				form: {
					name: body.name,
					rpcEndpoint: body.rpcEndpoint,
					indexerEndpoint: body.indexerEndpoint,
					allowedEndpointsRegex: body.allowedEndpointsRegex,
				},
			});
		}
	}

	@Get(':id/edit')
	@Render('wallet-form')
	async editForm(@Req() req: Request, @Param('id', ParseIntPipe) id: number): Promise<any> {
		const wallet = await this.walletRepository.findOne({
			where: { id },
			select: { id: true, name: true, rpcEndpoint: true, indexerEndpoint: true, allowedEndpointsRegex: true },
		});
		if (!wallet) {
			throw new NotFoundException('Wallet not found');
		}
		return {
			currentSection: 'wallets',
			user: (req as any).user,
			mode: 'edit',
			wallet,
			flash: req.query?.flash,
			flashType: req.query?.flashType,
		};
	}

	@Post(':id/update')
	async update(@Param('id', ParseIntPipe) id: number, @Body() body: Record<string, string>, @Res() res: Response) {
		try {
			const dto = await validateForm(WalletUpdateDto, {
				name: body.name,
				rpcEndpoint: body.rpcEndpoint,
				indexerEndpoint: body.indexerEndpoint,
				allowedEndpointsRegex: body.allowedEndpointsRegex ?? '',
			});
			await this.walletService.updateWallet(id, dto);
			return redirectWithFlash(res, WALLETS_PATH, 'Wallet updated.', 'success');
		} catch (error) {
			return redirectWithFlash(
				res,
				`${WALLETS_PATH}/${id}/edit`,
				getErrorMessage(error, 'Could not save this wallet.'),
				'error',
			);
		}
	}

	@Post(':id/delete')
	async delete(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
		try {
			await this.walletService.deleteWallet(id);
			return redirectWithFlash(res, WALLETS_PATH, 'Wallet deleted.', 'success');
		} catch (error) {
			return redirectWithFlash(res, WALLETS_PATH, getErrorMessage(error, 'Could not delete this wallet.'), 'error');
		}
	}

	/** Network choices and the generated passphrase shown by the creation form. */
	private buildCreationDefaults(network: string | undefined) {
		return {
			networks: WALLET_NETWORKS,
			network: network === CUSTOM_NETWORK_ID || resolveNetwork(network) ? network : DEFAULT_NETWORK_ID,
			actorPassphrase: this.walletService.generateActorPassphrase(),
		};
	}

	/**
	 * A preset network always wins over the posted URLs, so a tampered form cannot point a
	 * preset at another node; only the custom network uses what the user typed.
	 */
	private resolveEndpoints(body: Record<string, string>) {
		if (body.network === CUSTOM_NETWORK_ID) {
			return { rpcEndpoint: body.rpcEndpoint, indexerEndpoint: body.indexerEndpoint };
		}
		const preset = resolveNetwork(body.network);
		if (!preset) {
			throw new BadRequestException('Choose a network');
		}
		return { rpcEndpoint: preset.rpcEndpoint, indexerEndpoint: preset.indexerEndpoint };
	}

	/** Turns the flat form fields into the nested private key object (validated by the service). */
	private buildPrivateKeyObject(body: Record<string, string>) {
		if (body.keyType === PrivateKeyObjectType.JWK) {
			let jwk: unknown;
			try {
				jwk = JSON.parse(body.jwk ?? '');
			} catch {
				throw new BadRequestException('The JWK is not valid JSON');
			}
			return { keyType: PrivateKeyObjectType.JWK, jwk };
		}
		if (body.keyType === PrivateKeyObjectType.SEED) {
			return {
				keyType: PrivateKeyObjectType.SEED,
				schemeId: SignatureSchemeId.SECP256K1,
				seed: (body.seed ?? '').trim(),
			};
		}
		throw new BadRequestException('Choose a key type (seed or JWK)');
	}
}
