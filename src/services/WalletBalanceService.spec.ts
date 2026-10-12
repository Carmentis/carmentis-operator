import { toBreakdown, WalletBalanceService } from './WalletBalanceService';

const account = (overrides: object = {}) => ({
	id: 'AB',
	publicKey: 'pk',
	height: 42,
	balance: 1000,
	spendable: 600,
	lockedInStaking: 250,
	lockedInVesting: 100,
	lockedInEscrows: 50,
	stakingLocks: [{}, {}],
	vestingLocks: [{}],
	escrowLocks: [],
	...overrides,
}) as any;

// 1 CMTS = 100000 atomics (see the WalletService spec: 42 atomics = 0.00042 CMTS)
const NODE_BALANCE = '0.01 CMTS';

describe('toBreakdown', () => {
	it('formats every amount as CMTS and counts the locks behind the locked amounts', () => {
		expect(toBreakdown(account(), NODE_BALANCE)).toEqual({
			spendable: '0.006 CMTS',
			lockedInStaking: '0.0025 CMTS',
			lockedInVesting: '0.001 CMTS',
			lockedInEscrows: '0.0005 CMTS',
			stakingLocks: 2,
			vestingLocks: 1,
			escrowLocks: 0,
			indexedHeight: 42,
			inSync: true,
		});
	});

	it('groups the thousands of large amounts, consistently with the balance of the node', () => {
		const big = account({ balance: 1147189900158, spendable: 1047189900158, lockedInStaking: 100000000000, lockedInVesting: 0, lockedInEscrows: 0 });

		expect(toBreakdown(big, '11,471,899.00158 CMTS')).toEqual(
			expect.objectContaining({
				spendable: '10,471,899.00158 CMTS',
				lockedInStaking: '1,000,000 CMTS',
				lockedInVesting: '0 CMTS',
				inSync: true,
			}),
		);
	});

	it('reports an indexer that lags behind the node as out of sync', () => {
		expect(toBreakdown(account({ balance: 900 }), NODE_BALANCE).inSync).toBe(false);
	});
});

describe('WalletBalanceService', () => {
	const wallet = { id: 1, indexerEndpoint: 'https://indexer.example' } as any;
	const attached = { attached: true, accountId: 'AB', balance: NODE_BALANCE };

	function setup(status: object, indexer: object) {
		const walletService = { getAccountStatus: jest.fn().mockResolvedValue(status) };
		const indexerService = { for: jest.fn().mockReturnValue(indexer) };
		return { service: new WalletBalanceService(walletService as any, indexerService as any), indexerService };
	}

	it('adds the indexer breakdown to the balance read from the node', async () => {
		const getAccountById = jest.fn().mockResolvedValue(account());
		const { service } = setup(attached, { getAccountById });

		const balances = await service.getBalances(wallet);

		expect(getAccountById).toHaveBeenCalledWith('AB');
		expect(balances).toEqual({ ...attached, breakdown: expect.objectContaining({ spendable: '0.006 CMTS', inSync: true }) });
	});

	it('does not query the indexer for a wallet without account', async () => {
		const { service, indexerService } = setup({ attached: false }, {});

		await expect(service.getBalances(wallet)).resolves.toEqual({ attached: false });
		expect(indexerService.for).not.toHaveBeenCalled();
	});

	it('keeps the node balance when the indexer does not know the account yet', async () => {
		const { service } = setup(attached, { getAccountById: jest.fn().mockResolvedValue(null) });

		await expect(service.getBalances(wallet)).resolves.toEqual({
			...attached,
			breakdownError: 'The indexer does not know this account yet.',
		});
	});

	it('keeps the node balance when the indexer fails', async () => {
		const { service } = setup(attached, { getAccountById: jest.fn().mockRejectedValue(new Error('indexer down')) });

		await expect(service.getBalances(wallet)).resolves.toEqual({ ...attached, breakdownError: 'indexer down' });
	});

	it('keeps the node balance when the wallet has no indexer configured', async () => {
		const walletService = { getAccountStatus: jest.fn().mockResolvedValue(attached) };
		const indexerService = { for: jest.fn(() => { throw new Error('No indexer is configured for this wallet'); }) };
		const service = new WalletBalanceService(walletService as any, indexerService as any);

		await expect(service.getBalances(wallet)).resolves.toEqual({
			...attached,
			breakdownError: 'No indexer is configured for this wallet',
		});
	});

	it('lets a node failure through: an outage must not look like a missing account', async () => {
		const walletService = { getAccountStatus: jest.fn().mockRejectedValue(new Error('node down')) };
		const service = new WalletBalanceService(walletService as any, {} as any);

		await expect(service.getBalances(wallet)).rejects.toThrow('node down');
	});
});
