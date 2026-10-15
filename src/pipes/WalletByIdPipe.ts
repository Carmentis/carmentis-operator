import { BadRequestException, Injectable, NotFoundException, PipeTransform } from '@nestjs/common';
import { isUUID } from 'class-validator';
import { WalletEntity } from '../entities/WalletEntity';
import { WalletService } from '../services/WalletService';

/**
 * Pipe to retrieve a wallet by its id
 */
@Injectable()
export class WalletByIdPipe implements PipeTransform<string, Promise<WalletEntity>> {
	constructor(private readonly walletService: WalletService) {}

	async transform(walletId: string): Promise<WalletEntity> {
		if (!isUUID(walletId)) {
			throw new BadRequestException(`Wallet id "${walletId}" is not a valid UUID`);
		}
		const wallet = await this.walletService.getOneById(walletId);
		if (!wallet) {
			throw new NotFoundException(`Wallet ${walletId} not found`);
		}
		return wallet;
	}
}