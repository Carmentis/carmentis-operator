import useNodeEndpoint from './useNodeEndpoint';
import { useOrganisation } from '../contexts/organisation-store.context';
import useSWR from 'swr';
import { BlockchainFacade, CMTSToken, Hash, Optional, StringSignatureEncoder } from '@cmts-dev/carmentis-sdk/client';
import useOrganisationAsync from '@/hooks/useOrganisationAsync';

interface useOrganisationBalanceResponse {
	balance: Optional<CMTSToken>,
	hasAccount: boolean,
	error: Error | undefined,
	loading: boolean,
}

export default function useOrganisationBalance(): useOrganisationBalanceResponse {
	const { data: endpoint, error: errorLoadingEndpoint } = useNodeEndpoint();
	const {organisation, loading: loadingOrganisation} = useOrganisationAsync();
	const { data, error, isLoading: isLoadingPublicationStatus } = useSWR(
		['organisationHasAccount', organisation, endpoint?.getLinkedNode || undefined],
		async () => {
			if (!endpoint?.getLinkedNode || !organisation) return Optional.none() as Optional<CMTSToken>;
			const publicKey = organisation.organisation.publicSignatureKey;
			const signatureEncoder = StringSignatureEncoder.defaultStringSignatureEncoder();
			const blockchain = BlockchainFacade.createFromNodeUrl(endpoint.getLinkedNode);
			try {
				const balance = await blockchain.getAccountBalanceFromPublicKey(
					signatureEncoder.decodePublicKey(publicKey)
				);
				return Optional.of(balance)
			} catch (e) {
				return Optional.none() as Optional<CMTSToken>;
			}
		});

	const balance: Optional<CMTSToken> = data || Optional.none() as Optional<CMTSToken>;
	return {
		balance,
		hasAccount: balance.isSome(),
		loading: isLoadingPublicationStatus,
		error: errorLoadingEndpoint
	}
}