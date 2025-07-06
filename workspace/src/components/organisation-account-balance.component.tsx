import Skeleton from 'react-loading-skeleton';
import { useGetOrganisationBalanceQuery, useHasPublishedAccountOnChainQuery } from '@/generated/graphql';
import { useOrganisation } from '@/contexts/organisation-store.context';
import { Box, Link, Typography } from '@mui/material';
import { env } from 'next-runtime-env';

export default function OrganisationAccountBalance() {
	const organisation = useOrganisation();
	const {data, loading: isLoading, error} = useGetOrganisationBalanceQuery({
		variables: { id: organisation.id }
	});
	const { data: hasTokenAccount, loading: isLoadingAccountExistenceCheck } = useHasPublishedAccountOnChainQuery({
		variables: { organisationId: organisation.id }
	});
	const exchangeUrl = env('NEXT_PUBLIC_EXCHANGE_URL') || '';

	function formatBalance(balance:number) {
		return `${balance} CMTS`;
	}

	if (error) return <>{'--'}</>;
	if (!data || isLoading || isLoadingAccountExistenceCheck) return <Skeleton/>;

	// Check if the organization has a token account
	if (!hasTokenAccount?.organisation.hasTokenAccount) {
		return (
			<Box>
				<Typography variant="body2" color="text.secondary">
					Your organization does not have a token account yet.
				</Typography>
				<Typography variant="body2">
					<Link href={exchangeUrl} target="_blank" rel="noopener">
						Create an account and purchase tokens
					</Link>
				</Typography>
			</Box>
		);
	}

	return <>{formatBalance(data.organisation.balance)}</>;
}
