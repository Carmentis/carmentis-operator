import { resolveNetwork, WALLET_NETWORKS } from './WalletNetworks';

describe('WalletNetworks', () => {
	it('proposes mainnet, testnet and devnet', () => {
		expect(WALLET_NETWORKS.map(network => network.id)).toEqual(['mainnet', 'testnet', 'devnet']);
	});

	it('resolves a preset and ignores unknown identifiers (including "custom")', () => {
		expect(resolveNetwork('devnet')?.rpcEndpoint).toMatch(/^https:\/\//);
		expect(resolveNetwork('nope')).toBeUndefined();
		expect(resolveNetwork('custom')).toBeUndefined();
		expect(resolveNetwork(undefined)).toBeUndefined();
	});
});
