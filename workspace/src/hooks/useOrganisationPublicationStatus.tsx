import useNodeEndpoint from '@/hooks/useNodeEndpoint';
import { useOrganisation } from '@/contexts/organisation-store.context';
import useSWR from 'swr';
import { ProviderFactory, Hash } from '@cmts-dev/carmentis-sdk/client';

export default function useOrganisationPublicationStatus({
	virtualBlockchainId,
	lastPublicationCheckTime
}: {
	virtualBlockchainId: string | undefined | null,
	lastPublicationCheckTime?: Date | string | null
}) {
	const { data: endpoint, loading: loadingEndpoint, error: errorLoadingEndpoint } = useNodeEndpoint();

	// Check if organization has virtualBlockchainId and lastPublicationCheckTime is set (meaning it's been verified on chain)
	const isPublished = typeof virtualBlockchainId === 'string' && lastPublicationCheckTime !== null && lastPublicationCheckTime !== undefined;
	const isPending = typeof virtualBlockchainId === 'string' && (lastPublicationCheckTime === null || lastPublicationCheckTime === undefined);

	const { data, error: errorLoadingVbId, isLoading: isLoadingPublicationStatus } = useSWR(
		['organisationPublicationStatus', virtualBlockchainId, endpoint?.getLinkedNode || undefined],
		async () => {
			if (!endpoint?.getLinkedNode) return undefined;
			if (typeof virtualBlockchainId !== 'string') return { published: false, pending: false, virtualBlockchainId: undefined  };
			const vbId = Hash.from(virtualBlockchainId);
			const provider = ProviderFactory.createFromNodeUrl(endpoint.getLinkedNode);
			try {
				await provider.loadOrganization(vbId);
				return { published: true, pending: false, virtualBlockchainId: vbId  };
			} catch (e) {
				return { published: false, pending: isPending, virtualBlockchainId: vbId  };
			}
		});

	const published = data?.published ?? isPublished;
	const pending = data?.pending ?? isPending;
	const vbId = data?.virtualBlockchainId;

	return {
		published,
		pending,
		virtualBlockchainId: vbId,
		loading: data === undefined && ( isLoadingPublicationStatus || loadingEndpoint),
		error: errorLoadingEndpoint || errorLoadingVbId
	}
}