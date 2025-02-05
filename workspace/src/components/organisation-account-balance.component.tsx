import * as sdk from '@cmts-dev/carmentis-sdk/client';
import { Organisation } from '@/entities/organisation.entity';
import { useFetchAccountBalance } from '@/components/api.hook';
import Skeleton from 'react-loading-skeleton';

export type OrganisationAccountBalanceProps = {
	organisation: Organisation,
	onErrorContent?: string,
	formatBalance?: (balance:number) => string,
}
export default function OrganisationAccountBalance(
	input: OrganisationAccountBalanceProps
) {
	const organisation = input.organisation;
	const {data, isLoading, error} = useFetchAccountBalance(organisation.id);

	function formatBalance(balance:number) {
		if (input.formatBalance) return input.formatBalance(balance)
		return `${balance} CMTS`;
	}

	if (error) <>{input.onErrorContent || '--'}</>
	if (!data || isLoading) return <Skeleton/>
	return <>
		{formatBalance(data.balance / sdk.constants.ECO.TOKEN)}
	</>
}