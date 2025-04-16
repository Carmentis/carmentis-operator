'use client';

import * as sdk from '@cmts-dev/carmentis-sdk/client';
import OrganisationAccountBalance from '@/components/organisation-account-balance.component';
import { useOrganisation, useOrganisationContext } from '@/contexts/organisation-store.context';
import { Button, TextField, Typography } from '@mui/material';
import FullSpaceSpinner from '@/components/full-page-spinner.component';
import { useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import GenericTableComponent from '@/components/generic-table.component';
import { useGetTransactionsOfOrganisationQuery } from '@/generated/graphql';

export default function TransactionsHistoryPage() {
		const organisation = useOrganisation();
		const [limit, setLimit] = useState(10);
		const {data, loading: isLoading, error} = useGetTransactionsOfOrganisationQuery({
			variables: {
				organisationId: organisation.id,
				limit
			}
		})
		//const {data, isLoading} = useFetchTokenAccountExistence(organisation.id);
		if (isLoading||!data) return <FullSpaceSpinner/>

		let content;
		if (data.organisation.hasTokenAccount) {
			const transactions = data.organisation.transactions;
			content = <>
				<OrganisationBalance/>
				<GenericTableComponent
					data={transactions}
					extractor={(v, i) => [
						{head: 'Date', value: new Date(v.timestamp).toLocaleString()},
						{head: 'Type', value: v.name},
						{head: 'Linked account', value: v.linkedAccount},
						{head: 'Amount', value: <Typography color={v.amount >= 0 ? "green" : "red"}>
								{`${v.amount / sdk.constants.ECO.TOKEN} CMTS`}
							</Typography>}
					]}
				/>
				<Button onClick={() => setLimit(l => l * 2)}>Load more</Button>
			</>
		} else {
			content = <NoAccountFound/>
		}
		return <div className={"space-y-4"}>
			<Typography variant={"h6"} fontWeight={"bold"}>Transactions</Typography>
			{content}
		</div>
}

function NoAccountFound() {
	const organisation = useOrganisationContext();
	return <div className={"space-y-4"}>
		<>
			<Typography>
				We have not found token account associated with your organisation.
				Go to the Carmentis exchange page to create your token account and add tokens.
				During the token account creation and token delivery, a public key will be required. Below is shown the
				public key of your organisation:
			</Typography>
		</>

		<div>
			<Typography fontWeight={"bold"}>Public key of your organisation</Typography>
			<TextField size={"small"} fullWidth value={organisation.organisation.publicSignatureKey} disabled={true}/>
		</div>
	</div>
}


function OrganisationBalance() {
	return <>
		<Typography variant={"h6"}>Balance</Typography>
		<Typography>
			<OrganisationAccountBalance/>
		</Typography>
	</>
}
