import useOrganisationBalance from '@/hooks/useOrganisationBalance';

export default function useOrganisationHasAccount() {
	const {hasAccount, loading} = useOrganisationBalance();
	console.debug("useOrganisationHasAccount", hasAccount, loading);
	return {hasAccount, loading}
}