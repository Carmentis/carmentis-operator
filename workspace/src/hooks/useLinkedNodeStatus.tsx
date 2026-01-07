import { useGetLinkedNodeQuery } from '@/generated/graphql';
import { useAsync } from 'react-use';
import { ProviderFactory } from '@cmts-dev/carmentis-sdk/client';

export function useLinkedNodeStatus() {
	const {data: nodeEndpoint, loading: loadingNodeEndpoint, error: errorWhenLoadingEndpoint} = useGetLinkedNodeQuery();
	const {value: nodeStatus, loading: loadingStatus, error: errorWhenLoadingStatus} = useAsync(async () => {
		if (typeof nodeEndpoint !== 'object' || typeof nodeEndpoint.getLinkedNode !== 'string')
			throw new Error(`Invalid node endpoint: ${nodeEndpoint}`)
		const provider = ProviderFactory.createInMemoryProviderWithExternalProvider(nodeEndpoint.getLinkedNode);
		return await provider.getNodeStatus(nodeEndpoint.getLinkedNode);
	}, [nodeEndpoint]);

	return { status: nodeStatus, loading: loadingNodeEndpoint || loadingStatus, error: errorWhenLoadingEndpoint || errorWhenLoadingStatus }
}