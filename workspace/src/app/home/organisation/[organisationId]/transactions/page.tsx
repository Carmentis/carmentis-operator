'use client';

import * as sdk from '@cmts-dev/carmentis-sdk/client';
import OrganisationAccountBalance from '@/components/organisation-account-balance.component';
import { useOrganisationContext } from '@/contexts/organisation-store.context';
import { Container } from '@mui/material';
import { useFetchOrganisationTransactions, useFetchTokenAccountExistence } from '@/components/api.hook';
import FullSpaceSpinner from '@/components/full-page-spinner.component';
import { Button, Card, CardBody, Input, Typography } from '@material-tailwind/react';
import FlexCenter from '@/components/flex-center.component';
import { ReactNode, useState } from 'react';
import { tree } from 'next/dist/build/templates/app-page';
import Skeleton from 'react-loading-skeleton';
import CardTableComponent from '@/components/card-table.component';

export default function TransactionsHistoryPage() {
	return <Container>
		<TransactionsHistoryContent/>
	</Container>
}

function TransactionsHistoryContent() {
		const organisation = useOrganisationContext();
		const {data, isLoading} = useFetchTokenAccountExistence(organisation.id);
		if (isLoading||!data) return <FullSpaceSpinner/>
		if (!data.hasTokenAccount) return <NoAccountFound/>
		return <div className={"space-y-4"}>
			<OrganisationBalance/>
			<TransactionHistoryTable/>
		</div>
}

function NoAccountFound() {
	const organisation = useOrganisationContext();
	return <div className={"space-y-4"}>
		<>
			<Typography variant={"h4"}>No token account found</Typography>
			<Typography>
				We have not found token account associated with your organisation.
				Go to the Carmentis exchange page to create your token account and add tokens.
				During the token account creation and token delivery, a public key will be required. Below is shown the
				public key of your organisation:
			</Typography>
		</>

		<div>
			<Typography>Public key of your organisation</Typography>
			<Input value={organisation.publicSignatureKey} disabled={true}/>
		</div>
	</div>
}


function OrganisationBalance() {
	const organisation = useOrganisationContext();
	return <Card className={"w-1/4"}>
		<CardBody className={"p-4"}>
			<Typography variant={"h6"}>Balance</Typography>
			<Typography>
				<OrganisationAccountBalance organisation={organisation}/>
			</Typography>
		</CardBody>
	</Card>
}


function TransactionHistoryTable() {
	const organisation = useOrganisationContext();
	const [limit, setLimit] = useState(2);
	const transactions = useFetchOrganisationTransactions(organisation.id, undefined, limit);
	if (transactions.error) return <Typography>An error has occurred.</Typography>
	if (transactions.isLoading || !transactions.data) return <Skeleton count={10}/>
	return <>
		<CardTableComponent
			key={transactions.data.length}
			data={transactions.data}
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
}
