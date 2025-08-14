import useNodeEndpoint from '@/hooks/useNodeEndpoint';
import { useOrganisation } from '@/contexts/organisation-store.context';
import useSWR from 'swr';
import { BlockchainFacade, Hash } from '@cmts-dev/carmentis-sdk/client';

export default function useOrganisationPublicationStatus() {
	const { data: endpoint, loading: loadingEndpoint, error: errorLoadingEndpoint } = useNodeEndpoint();
	const organisation = useOrganisation();
	const { data, error, isLoading: isLoadingPublicationStatus } = useSWR(
		['organisationPublicationStatus', organisation.id, endpoint?.getLinkedNode || undefined],
		async () => {
			// not published if no virtual blockchain id (nowhere to search)
			if (!organisation.virtualBlockchainId) return false;
			if (!endpoint?.getLinkedNode) return undefined;
			const blockchain = BlockchainFacade.createFromNodeUrl(endpoint.getLinkedNode);
			try {
				await blockchain.loadOrganization(Hash.from(organisation.virtualBlockchainId));
				return true;
			} catch (e) {
				return false;
			}
		});

	return { published: data, loading: isLoadingPublicationStatus, error: errorLoadingEndpoint }
}