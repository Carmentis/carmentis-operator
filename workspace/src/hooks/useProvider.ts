import useNodeEndpoint from '@/hooks/useNodeEndpoint';
import { useAsync } from 'react-use';
import { ProviderFactory } from '@cmts-dev/carmentis-sdk/client';

export default function useProvider() {
	const { data: endpoint, loading: loadingEndpoint, error: errorLoadingEndpoint } = useNodeEndpoint();
	return useAsync(async () => {
		if (endpoint) {
			return ProviderFactory.createInMemoryProviderWithExternalProvider(endpoint.getLinkedNode);
		} else {
			return undefined;
		}
	}, [endpoint])
}