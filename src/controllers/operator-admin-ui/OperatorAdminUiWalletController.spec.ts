import { OperatorAdminUiWalletController } from './OperatorAdminUiWalletController';
import { resolveNetwork } from '../../config/WalletNetworks';

describe('OperatorAdminUiWalletController.create', () => {
	const seedBody = {
		name: 'w',
		actorPassphrase: 'pass',
		keyType: 'SEED',
		seed: 'seed',
		// forged URLs: must be ignored for a preset network
		rpcEndpoint: 'https://evil.example',
		indexerEndpoint: 'https://evil.example',
	};

	function setup() {
		const walletService = {
			createWallet: jest.fn().mockResolvedValue({ id: 1 }),
			generateActorPassphrase: jest.fn().mockReturnValue('generated'),
		};
		const walletBalanceService = { getBalances: jest.fn() };
		const controller = new OperatorAdminUiWalletController({} as any, walletService as any, walletBalanceService as any);
		const res = { redirect: jest.fn(), status: jest.fn().mockReturnThis(), render: jest.fn() };
		return { controller, walletService, walletBalanceService, res };
	}

	it('uses the server-side endpoints of a preset network, ignoring posted URLs', async () => {
		const { controller, walletService, res } = setup();

		await controller.create({} as any, { ...seedBody, network: 'devnet' }, res as any);

		const devnet = resolveNetwork('devnet')!;
		expect(walletService.createWallet).toHaveBeenCalledWith(
			expect.objectContaining({ rpcEndpoint: devnet.rpcEndpoint, indexerEndpoint: devnet.indexerEndpoint }),
		);
		expect(res.redirect).toHaveBeenCalled();
	});

	it('uses the posted URLs for the custom network', async () => {
		const { controller, walletService, res } = setup();

		await controller.create(
			{} as any,
			{ ...seedBody, network: 'custom', rpcEndpoint: 'https://rpc.mine', indexerEndpoint: 'https://idx.mine' },
			res as any,
		);

		expect(walletService.createWallet).toHaveBeenCalledWith(
			expect.objectContaining({ rpcEndpoint: 'https://rpc.mine', indexerEndpoint: 'https://idx.mine' }),
		);
	});

	it('rejects an unknown network and re-renders the form with a fresh passphrase', async () => {
		const { controller, walletService, res } = setup();

		await controller.create({} as any, { ...seedBody, network: 'nope' }, res as any);

		expect(walletService.createWallet).not.toHaveBeenCalled();
		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.render).toHaveBeenCalledWith(
			'wallet-form',
			expect.objectContaining({ network: 'devnet', actorPassphrase: 'generated', flashType: 'error' }),
		);
	});

	describe('account', () => {
		function setupAccount(wallet: object | null) {
			const walletRepository = { findOne: jest.fn().mockResolvedValue(wallet) };
			const walletBalanceService = { getBalances: jest.fn() };
			const controller = new OperatorAdminUiWalletController(walletRepository as any, {} as any, walletBalanceService as any);
			return { controller, walletRepository, walletBalanceService };
		}

		it('returns the balances of the wallet, loading what the node and the indexer need', async () => {
			const { controller, walletRepository, walletBalanceService } = setupAccount({ id: 1 });
			const balances = { attached: true, accountId: 'AB', balance: '5 CMTS' };
			walletBalanceService.getBalances.mockResolvedValue(balances);

			await expect(controller.account(1)).resolves.toBe(balances);
			expect(walletRepository.findOne).toHaveBeenCalledWith(
				expect.objectContaining({ select: { id: true, rpcEndpoint: true, indexerEndpoint: true } }),
			);
		});

		it('reports a node failure as an error message instead of throwing', async () => {
			const { controller, walletBalanceService } = setupAccount({ id: 1 });
			walletBalanceService.getBalances.mockRejectedValue(new Error('node down'));

			await expect(controller.account(1)).resolves.toEqual({ error: 'node down' });
		});

		it('is not found for an unknown wallet', async () => {
			const { controller } = setupAccount(null);

			await expect(controller.account(9)).rejects.toThrow('Wallet not found');
		});
	});
});
