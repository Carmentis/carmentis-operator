import { useAsync } from 'react-use';
import { BlockchainFacade } from '@cmts-dev/carmentis-sdk/client';

export function useNodeStatusFromRpcEndpoint(rpcEndpoint: string) {
	return useAsync(async () => {
		const blockchain = BlockchainFacade.createFromNodeUrl(rpcEndpoint);
		return await blockchain.getNodeStatus();
	}, [rpcEndpoint]);
}