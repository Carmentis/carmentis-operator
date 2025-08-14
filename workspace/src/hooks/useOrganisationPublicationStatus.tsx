import useNodeEndpoint from '@/hooks/useNodeEndpoint';
import { useOrganisation } from '@/contexts/organisation-store.context';
import useSWR from 'swr';
import { BlockchainFacade, Hash } from '@cmts-dev/carmentis-sdk/client';

export default function useOrganisationPublicationStatus({virtualBlockchainId}: {virtualBlockchainId: string | undefined | null}) {
	const { data: endpoint, loading: loadingEndpoint, error: errorLoadingEndpoint } = useNodeEndpoint();
	const { data, error: errorLoadingVbId, isLoading: isLoadingPublicationStatus } = useSWR(
		['organisationPublicationStatus', virtualBlockchainId, endpoint?.getLinkedNode || undefined],
		async () => {
			if (!endpoint?.getLinkedNode) return undefined;
			if (typeof virtualBlockchainId !== 'string') return { published: false, virtualBlockchainId: undefined  };
			const vbId = Hash.from(virtualBlockchainId);
			const blockchain = BlockchainFacade.createFromNodeUrl(endpoint.getLinkedNode);
			try {

				await blockchain.loadOrganization(vbId);
				return { published: true, virtualBlockchainId: vbId  };
			} catch (e) {
				return { published: false, virtualBlockchainId: vbId  };;
			}
		});

	const published = data?.published;
	const vbId = data?.virtualBlockchainId;
	return {
		published,
		virtualBlockchainId: vbId,
		loading: data === undefined && ( isLoadingPublicationStatus || loadingEndpoint),
		error: errorLoadingEndpoint || errorLoadingVbId
	}
}