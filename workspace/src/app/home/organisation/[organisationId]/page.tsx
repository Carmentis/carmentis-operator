'use client';

import { Box, Stack, Typography } from '@mui/material';
import React from 'react';
import { useOrganisation } from '@/contexts/organisation-store.context';
import OrganisationWarnings from '@/app/home/organisation/[organisationId]/OrganisationWarnings';
import { OrganisationDetails } from './components/OrganisationDetails';
import { OrganisationKeys } from './components/OrganisationKeys';
import { PageSkeleton } from './components/PageSkeleton';

export default function OrganisationHomePage() {
	const organisation = useOrganisation();

	if (!organisation) {
		return <PageSkeleton />;
	}

	return (
		<Box sx={{ maxWidth: 1400, mx: 'auto', p: 4 }}>
			<Stack spacing={4}>
				{/* Page Header */}
				<Box>
					<Typography variant="h4" fontWeight={600} gutterBottom>
						Overview
					</Typography>
					<Typography variant="body1" color="text.secondary">
						Manage your organisation details and blockchain status
					</Typography>
				</Box>

				{/* Warnings */}
				<OrganisationWarnings />

				{/* Main Content */}
				<Stack spacing={3}>
					<OrganisationDetails />
					<OrganisationKeys />
				</Stack>
			</Stack>
		</Box>
	);
}
