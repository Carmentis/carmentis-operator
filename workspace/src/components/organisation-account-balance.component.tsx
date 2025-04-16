import Skeleton from 'react-loading-skeleton';
import { useGetOrganisationBalanceQuery } from '@/generated/graphql';
import { useOrganisation } from '@/contexts/organisation-store.context';

export default function OrganisationAccountBalance() {
	const organisation = useOrganisation();
	const {data, loading: isLoading, error} = useGetOrganisationBalanceQuery({
		variables: { id: organisation.id }
	});

	function formatBalance(balance:number) {
		return `${balance} CMTS`;
	}

	if (error) <>{'--'}</>
	if (!data || isLoading) return <Skeleton/>
	return <>
		{formatBalance(data.organisation.balance)}
	</>
}