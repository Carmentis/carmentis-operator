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
		const controller = new OperatorAdminUiWalletController({} as any, walletService as any);
		const res = { redirect: jest.fn(), status: jest.fn().mockReturnThis(), render: jest.fn() };
		return { controller, walletService, res };
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
});
