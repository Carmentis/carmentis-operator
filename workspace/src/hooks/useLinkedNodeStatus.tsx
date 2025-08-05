import { useGetLinkedNodeQuery } from '@/generated/graphql';
import { useAsync } from 'react-use';
import { BlockchainFacade } from '@cmts-dev/carmentis-sdk/client';

export function useLinkedNodeStatus() {
	const {data: nodeEndpoint, loading: loadingNodeEndpoint, error: errorWhenLoadingEndpoint} = useGetLinkedNodeQuery();
	const {value: nodeStatus, loading: loadingStatus, error: errorWhenLoadingStatus} = useAsync(async () => {
		if (typeof nodeEndpoint !== 'object' || typeof nodeEndpoint.getLinkedNode !== 'string')
			throw new Error(`Invalid node endpoint: ${nodeEndpoint}`)
		const blockchain = BlockchainFacade.createFromNodeUrl(nodeEndpoint.getLinkedNode);
		return await blockchain.getNodeStatus();
	}, [nodeEndpoint]);

	return { status: nodeStatus, loading: loadingNodeEndpoint || loadingStatus, error: errorWhenLoadingEndpoint || errorWhenLoadingStatus }
}