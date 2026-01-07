import { useAsync } from 'react-use';
import { ProviderFactory } from '@cmts-dev/carmentis-sdk/client';

export function useNodeStatusFromRpcEndpoint(rpcEndpoint: string) {
	return useAsync(async () => {
		const provider = ProviderFactory.createInMemoryProviderWithExternalProvider(rpcEndpoint);
		return await provider.getNodeStatus(rpcEndpoint);
	}, [rpcEndpoint]);
}