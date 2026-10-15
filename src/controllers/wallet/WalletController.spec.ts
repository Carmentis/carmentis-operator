import { describe, expect, it, vi } from 'vitest';
import { WalletController } from './WalletController';

describe('WalletController', () => {
	it('lists the wallets without exposing secrets', async () => {
		const createdAt = new Date();
		const walletService = {
			findAll: vi.fn().mockResolvedValue([
				{
					id: '11111111-1111-4111-8111-111111111111',
					name: 'w',
					rpcEndpoint: 'https://rpc.example',
					indexerEndpoint: 'https://indexer.example',
					createdAt,
					actorPassphrase: 'secret',
					privateKey: { id: 'k' },
				},
			]),
		};

		const result = await new WalletController(walletService as any).listWallets();

		expect(result).toEqual([
			{
				id: '11111111-1111-4111-8111-111111111111',
				name: 'w',
				rpcEndpoint: 'https://rpc.example',
				indexerEndpoint: 'https://indexer.example',
				createdAt,
			},
		]);
	});
});
