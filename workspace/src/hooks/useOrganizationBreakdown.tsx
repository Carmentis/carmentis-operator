import { useOrganisationPublicKey } from '@/hooks/useOrganisationPublicKey';
import { useAsync } from 'react-use';
import { BalanceAvailability, CryptoEncoderFactory } from '@cmts-dev/carmentis-sdk/client';
import useProvider from '@/hooks/useProvider';

export default function useOrganizationBreakdown() {
	const {value: provider} = useProvider();
	const {value: organizationPublicKey} = useOrganisationPublicKey();
	return useAsync(async () => {
		if (!organizationPublicKey) throw new Error("No organization public key found!")
		if (!provider) throw new Error("No provider found!")
		const accountId = await provider.getAccountIdByPublicKey(organizationPublicKey.publicKey);
		const accountState = await provider.getAccountState(accountId);
		return BalanceAvailability.createFromAccountStateAbciResponse(accountState);
	}, [organizationPublicKey])
}