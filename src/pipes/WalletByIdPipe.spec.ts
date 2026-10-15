import { describe, expect, it, vi } from 'vitest';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { WalletByIdPipe } from './WalletByIdPipe';

const WALLET_ID = '11111111-1111-4111-8111-111111111111';

describe('WalletByIdPipe', () => {
	const createPipe = (wallet: unknown) => {
		const walletService = { getOneById: vi.fn().mockResolvedValue(wallet) };
		return { pipe: new WalletByIdPipe(walletService as any), walletService };
	};

	it('returns the wallet matching the id', async () => {
		const wallet = { id: WALLET_ID };
		const { pipe, walletService } = createPipe(wallet);

		await expect(pipe.transform(WALLET_ID)).resolves.toBe(wallet);
		expect(walletService.getOneById).toHaveBeenCalledWith(WALLET_ID);
	});

	it('rejects an id that is not a UUID without querying the database', async () => {
		const { pipe, walletService } = createPipe(null);

		await expect(pipe.transform('3')).rejects.toThrow(BadRequestException);
		expect(walletService.getOneById).not.toHaveBeenCalled();
	});

	it('answers not found for an unknown wallet', async () => {
		const { pipe } = createPipe(null);

		await expect(pipe.transform(WALLET_ID)).rejects.toThrow(NotFoundException);
	});
});
