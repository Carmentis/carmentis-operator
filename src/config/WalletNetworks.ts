/**
 * Network presets proposed when creating a wallet. The server is the source of truth: when a
 * preset is chosen, the endpoints posted by the form are ignored and replaced by these ones.
 */
export interface WalletNetwork {
	id: string;
	label: string;
	rpcEndpoint: string;
	indexerEndpoint: string;
}

/** Identifier of the "Custom" choice, for which the user provides the endpoints. */
export const CUSTOM_NETWORK_ID = 'custom';

export const DEFAULT_NETWORK_ID = 'devnet';

export const WALLET_NETWORKS: WalletNetwork[] = [
	{
		id: 'mainnet',
		label: 'Mainnet',
		rpcEndpoint: 'https://antevorta.carmentis.io',
		indexerEndpoint: 'https://indexer.carmentis.io',
	},
	{
		id: 'testnet',
		label: 'Testnet',
		rpcEndpoint: 'https://ares.testnet.carmentis.io',
		indexerEndpoint: 'https://indexer.testnet.carmentis.io',
	},
	{
		id: 'devnet',
		label: 'Devnet',
		rpcEndpoint: 'https://node3.server3.devnet.carmentis.io',
		indexerEndpoint: 'https://indexer.server4.devnet.carmentis.io',
	},
];

export function resolveNetwork(id: string | undefined): WalletNetwork | undefined {
	return WALLET_NETWORKS.find(network => network.id === id);
}
