import useNodeEndpoint from './useNodeEndpoint';
import { useOrganisation } from '../contexts/organisation-store.context';
import useSWR from 'swr';
import { ProviderFactory, CMTSToken, Hash, Optional, CryptoEncoderFactory } from '@cmts-dev/carmentis-sdk/client';
import useOrganisationAsync from '@/hooks/useOrganisationAsync';
import useProvider from '@/hooks/useProvider';

interface useOrganisationBalanceResponse {
	balance: Optional<CMTSToken>,
	hasAccount: boolean,
	error: Error | undefined,
	loading: boolean,
}

export default function useOrganisationBalance(): useOrganisationBalanceResponse {
	const { value: provider } = useProvider();
	const {organisation} = useOrganisationAsync();
	const { data, error, isLoading: isLoadingPublicationStatus } = useSWR(
		['organisationHasAccount', organisation, provider],
		async () => {
			if (organisation && provider) {
				const publicKey = organisation.organisation.publicSignatureKey;
				const signatureEncoder = CryptoEncoderFactory.defaultStringSignatureEncoder();
				try {
					const pk = await signatureEncoder.decodePublicKey(publicKey);
					const orgId = await provider.getAccountIdFromPublicKey(pk);
					const balance = await provider.getAccountState(orgId.toBytes());
					return Optional.of(CMTSToken.createAtomic(balance.balance))
				} catch (e) {
					console.error(e);
				}
			}
			return Optional.none() as Optional<CMTSToken>;

		});

	const balance: Optional<CMTSToken> = data || Optional.none() as Optional<CMTSToken>;
	return {
		balance,
		hasAccount: balance.isSome(),
		loading: isLoadingPublicationStatus,
		error: error
	}
}