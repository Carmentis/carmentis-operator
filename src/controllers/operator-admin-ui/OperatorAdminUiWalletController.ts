import { Controller, Get, NotFoundException, Param, ParseIntPipe, Render, Req } from '@nestjs/common';
import { Request } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WalletEntity } from '../../entities/WalletEntity';
import { OPERATOR_ADMIN_UI_PREFIX } from './OperatorAdminUiController';

@Controller(`${OPERATOR_ADMIN_UI_PREFIX}/wallets`)
export class OperatorAdminUiWalletController {
	constructor(
		@InjectRepository(WalletEntity)
		private readonly walletRepository: Repository<WalletEntity>,
	) {}

	@Get()
	@Render('wallets')
	async list(@Req() req: Request): Promise<any> {
		// Explicit column selection: WalletEntity.seed is an @EncryptedColumn() and must
		// never be fetched (it is decrypted transparently on read) just to render a list.
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
		};
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
		};
	}
}
