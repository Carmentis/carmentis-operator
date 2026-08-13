import { Injectable, NotFoundException, PipeTransform } from '@nestjs/common';
import { WalletEntity } from '../entities/WalletEntity';
import { WalletService } from '../services/WalletService';

/**
 * Pipe to retrieve a wallet by its id
 */
@Injectable()
export class WalletByIdPipe implements PipeTransform<number, Promise<WalletEntity>> {
	constructor(private readonly walletService: WalletService) {}

	async transform(walletId: number): Promise<WalletEntity> {
		const wallet = await this.walletService.findOneBy({ id: walletId });
		if (!wallet) {
			throw new NotFoundException(`Wallet ${walletId} not found`);
		}
		return wallet;
	}
}