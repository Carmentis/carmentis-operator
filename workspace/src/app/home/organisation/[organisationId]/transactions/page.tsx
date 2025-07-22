'use client';

import { CMTSToken } from '@cmts-dev/carmentis-sdk/client';
import OrganisationAccountBalance from '@/components/OrganisationAccountBalance';
import { useOrganisation, useOrganisationContext } from '@/contexts/organisation-store.context';
import {
	Box,
	Button,
	Container,
	Divider,
	Paper,
	TextField,
	Typography
} from '@mui/material';
import { useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import GenericTableComponent from '@/components/GenericTableComponent';
import { TransactionType, useGetTransactionsOfOrganisationQuery } from '@/generated/graphql';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import KeyIcon from '@mui/icons-material/Key';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

export default function TransactionsHistoryPage() {
	const organisation = useOrganisation();
	const [limit, setLimit] = useState(10);
	const { data, loading: isLoading, error } = useGetTransactionsOfOrganisationQuery({
		variables: {
			organisationId: organisation.id,
			limit
		}
	});

	if (isLoading || !data) {
		return (
			<Container maxWidth={false} disableGutters>
				<Box mb={4}>
					<Skeleton height={40} width={300} />
					<Box mt={4}>
						<Skeleton height={100} />
						<Skeleton height={60} />
						<Skeleton count={5} height={50} />
					</Box>
				</Box>
			</Container>
		);
	}

	return (
		<Container maxWidth={false} disableGutters>
			<Box mb={4}>
				<Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
					<Box display="flex" alignItems="center" gap={2}>
						<ReceiptLongIcon color="primary" fontSize="large" />
						<Typography variant="h4" fontWeight="500" color="primary">
							Transactions
						</Typography>
					</Box>
				</Box>
				<Divider />
			</Box>

			{data.organisation.hasTokenAccount ? (
				<TransactionsContent
					transactions={data.organisation.transactions}
					doubleDisplayedTransactionsNumber={() => setLimit(2 * limit)}
				/>
			) : (
				<NoAccountFound />
			)}
		</Container>
	);
}

function TransactionsContent({ transactions, doubleDisplayedTransactionsNumber }: { transactions: TransactionType[], doubleDisplayedTransactionsNumber: () => void }) {
	if (!transactions || transactions.length === 0) {
		return (
			<Box
				display="flex"
				flexDirection="column"
				alignItems="center"
				justifyContent="center"
				py={8}
				textAlign="center"
			>
				<Typography variant="h6" color="text.secondary" gutterBottom>
					No transactions found
				</Typography>
				<Typography variant="body2" color="text.secondary">
					Your account doesn't have any transactions yet
				</Typography>
			</Box>
		);
	}


	return (
		<Box display="flex" flexDirection="column" gap={4}>
			<OrganisationBalance />

			<Paper elevation={0} sx={{ borderRadius: 2, overflow: 'hidden', border: '1px solid #eaeaea' }}>
				<GenericTableComponent
					data={transactions}
					extractor={(v, i) => {
						const amount = CMTSToken.createAtomic(v.amountInAtomics);
						return [
							{
								head: 'ID',
								value: <Typography variant="body2">{v.height}</Typography>
							},
							{
								head: 'Date',
								value: <Typography variant="body2">{v.transferredAt}</Typography>
							},
							{
								head: 'Type',
								value: <Typography variant="body2" fontWeight="500">{v.label}</Typography>
							},
							{
								head: 'Linked account',
								value: (
									<Typography
										variant="body2"
										sx={{
											maxWidth: 200,
											overflow: 'hidden',
											textOverflow: 'ellipsis',
											whiteSpace: 'nowrap',
											fontFamily: 'monospace'
										}}
									>
										{v.linkedAccount}
									</Typography>
								)
							},
							{
								head: 'Amount',
								value: (
									<Typography
										variant="body2"
										fontWeight="500"
										sx={{
											color: amount.isPositive() ? 'success.main' : 'error.main'
										}}
									>
										{amount.toString()}
									</Typography>
								)
							}
						]
					}}
				/>
			</Paper>

			<Box display="flex" justifyContent="center" mt={2}>
				<Button
					variant="outlined"
					onClick={doubleDisplayedTransactionsNumber}
					startIcon={<MoreHorizIcon />}
					sx={{
						borderRadius: 2,
						textTransform: 'none',
						px: 3
					}}
				>
					Load more transactions
				</Button>
			</Box>
		</Box>
	);
}

function NoAccountFound() {
	const organisation = useOrganisationContext();

	return (
		<Paper
			elevation={0}
			sx={{
				p: 4,
				borderRadius: 2,
				border: '1px solid #eaeaea'
			}}
		>
			<Box display="flex" flexDirection="column" gap={3}>
				<Typography variant="h6" color="primary" gutterBottom>
					No Token Account Found
				</Typography>

				<Typography variant="body1">
					We have not found a token account associated with your organisation.
					Go to the Carmentis exchange page to create your token account and add tokens.
				</Typography>

				<Typography variant="body1">
					During the token account creation and token delivery, a public key will be required.
					Please use the public key shown below:
				</Typography>

				<Box mt={2}>
					<Box display="flex" alignItems="center" gap={1} mb={1}>
						<KeyIcon color="primary" fontSize="small" />
						<Typography variant="subtitle2" fontWeight="500">
							Public key of your organisation
						</Typography>
					</Box>

					<TextField
						size="small"
						fullWidth
						value={organisation.organisation.publicSignatureKey}
						disabled={true}
						InputProps={{
							readOnly: true,
							sx: { fontFamily: 'monospace' }
						}}
					/>
				</Box>
			</Box>
		</Paper>
	);
}

function OrganisationBalance() {
	return (
		<Paper
			elevation={0}
			sx={{
				p: 3,
				borderRadius: 2,
				border: '1px solid #eaeaea'
			}}
		>
			<Box display="flex" alignItems="center" gap={2}>
				<AccountBalanceIcon color="primary" />
				<Box>
					<Typography variant="subtitle1" fontWeight="500" gutterBottom>
						Current Balance
					</Typography>
					<Typography variant="h5" fontWeight="bold">
						<OrganisationAccountBalance />
					</Typography>
				</Box>
			</Box>
		</Paper>
	);
}
