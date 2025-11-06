'use client';

import { PropsWithChildren, useEffect } from 'react';

import { useParams } from 'next/navigation';
import { OrganisationMutationContextProvider } from '@/contexts/organisation-mutation.context';
import NotFoundPage from '@/app/home/organisation/[organisationId]/not-found';
import { useApplicationNavigationContext } from '@/contexts/application-navigation.context';
import { useToast } from '@/app/layout';
import { useAtom, useAtomValue } from 'jotai';
import { organisationAtom } from '@/app/home/organisation/atom';
import { useGetOrganisationQuery } from '@/generated/graphql';
import FullSpaceSpinner from '@/components/FullSpaceSpinner';
import { OrganisationHeader } from '@/app/home/organisation/[organisationId]/OrganisationHeader';
import useOrganisationHasAccount from '@/hooks/useOrganisationHasAccount';
import { useOrganisation } from '@/contexts/organisation-store.context';
import useOrganisationAsync from '@/hooks/useOrganisationAsync';
import { Box, Button, Card, CardActions, Container, Grid, Typography } from '@mui/material';
import { useOrganizationDeletion } from '@/hooks/useOrganizationDeletion';


export default function RootLayout({ children }: PropsWithChildren) {
	const {organisation, loading: loadingOrganisation, error: errorLoadingOrganisation, refetch} = useOrganisationAsync();
	const navigation = useApplicationNavigationContext();
	const notify = useToast();



	// display the loading page when checking if the organisation exists
	if (loadingOrganisation) {
		return <FullSpaceSpinner label={'Loading organisation'} />
	}

	// if not loading but data not available, redirect to the list of organisation
	if (!loadingOrganisation && !organisation) {
		console.error("Error loading organisation: ", errorLoadingOrganisation);
		notify.info(`Cannot load organisation`);
		navigation.navigateToHome();
		return <NotFoundPage/>
	}




	// create the organisation reader context and organisation mutation context
	return <OrganisationMutationContextProvider mutate={() => refetch()}>
		<OrganisationPage>
			{children}
		</OrganisationPage>
	</OrganisationMutationContextProvider>;
}

function OrganisationPage({children}: PropsWithChildren) {
	const organisation = useAtomValue(organisationAtom);
	const { hasAccount, loading: loadingHasAccount } = useOrganisationHasAccount();

	if (loadingHasAccount || organisation === undefined) {
		return <FullSpaceSpinner label={'Loading organisation'} />
	}


	if (!hasAccount) {
		return <NeedToCreateAccount/>
	}


	return <>
		<OrganisationHeader/>
		{children}
	</>
}




function NeedToCreateAccount() {
	const organisation = useOrganisation();
	const publicKey = organisation?.publicSignatureKey ?? '—';
	const {deleteOrg, isDeleting} = useOrganizationDeletion();
	return <Container>
		<Grid>
			<Card>
				<Box sx={{display: "flex", gap:2, justifyContent: "space-between"}}>
					<Box sx={{display: "flex", gap:2, alignItems: "center"}}>
						<div
							aria-hidden="true"
							style={{
								width: 38,
								height: 38,
								borderRadius: 8,
								background: '#eef2f7',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								fontWeight: 600,
								color: '#374151',
							}}
						>
							{organisation.name.slice(0, 1).toUpperCase()}
						</div>
						<Typography variant={"h5"}>{organisation.name}</Typography>
					</Box>
					<Button onClick={() => deleteOrg(organisation.id)}>Delete</Button>
				</Box>

				<Box sx={{display:"flex", flexDirection: "column", gap: 2, mt: 4}}>
					<Typography fontWeight={"bold"}>Welcome to your workspace.</Typography>
					<Typography>
						Before to perform any operation,
						you need to create a token account. Once created, you will be able to manage users, publish applications,
						create API keys, and more. To create a token account, copy the public key below and paste it
						on a token seller.
					</Typography>

					<div style={{ marginTop: 12 }}>
						<label style={{ display: 'block', fontSize: 12, color: '#6b7280' }}>
							Public key of your organisation:
						</label>
						<div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 4, flexWrap: 'wrap' }}>
							<code
								style={{
									fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
									fontSize: 13,
									background: '#f3f4f6',
									padding: '6px 8px',
									borderRadius: 6,
									overflowX: 'auto',
								}}
							>
								{publicKey}
							</code>
						</div>
					</div>
				</Box>
				<CardActions>
					<Button
						variant="contained"
						onClick={() => navigator.clipboard?.writeText(publicKey)}
					>
						Copy to clipboard
					</Button>
				</CardActions>
			</Card>
		</Grid>
	</Container>
	/*
	return (
		<section
			aria-labelledby="need-account-title"
			style={{
				maxWidth: 720,
				margin: '24px auto',
				padding: 16,
				border: '1px solid #e5e7eb',
				borderRadius: 8,
			}}
		>
			<header style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
				{organisation?.logoUrl ? (
					<img
						src={organisation.logoUrl}
						alt={`Logo de ${organisation?.name ?? 'organisation'}`}
						width={48}
						height={48}
						style={{ borderRadius: 8, objectFit: 'cover' }}
					/>
				) : (
					<div
						aria-hidden="true"
						style={{
							width: 48,
							height: 48,
							borderRadius: 8,
							background: '#eef2f7',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							fontWeight: 600,
							color: '#374151',
						}}
					>
						{(organisation?.name ?? '?').slice(0, 1).toUpperCase()}
					</div>
				)}

				<div>
					<h2 id="need-account-title" style={{ margin: 0 }}>
						Account creation required
					</h2>
					<small style={{ color: '#6b7280' }}>
						Welcome to your organisation.
					</small>
				</div>
			</header>

			<Typography>Welcome to your organisation's workspace.</Typography>
			<Typography>
				Before to perform any operation,
				you need to create a token account. Once created, you will be able to manage users, publish applications,
				create API keys, and more. To create a token account, copy the public key below and paste it
				on a token seller.
			</Typography>

			<div style={{ marginTop: 12 }}>
				<label style={{ display: 'block', fontSize: 12, color: '#6b7280' }}>
					Public key of your organisation:
				</label>
				<div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 4, flexWrap: 'wrap' }}>
					<code
						style={{
							fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
							fontSize: 13,
							background: '#f3f4f6',
							padding: '6px 8px',
							borderRadius: 6,
							overflowX: 'auto',
						}}
					>
						{publicKey}
					</code>

					{publicKey !== '—' && (
						<Button
							variant="contained"
							onClick={() => navigator.clipboard?.writeText(publicKey)}
						>
							Copy to clipboard
						</Button>
					)}
				</div>
			</div>
		</section>
	);

	 */
}
