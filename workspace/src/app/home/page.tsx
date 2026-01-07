'use client';

import React from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { useGetOrganisationsQuery } from '@/generated/graphql';
import { OrganisationsList } from './components/OrganisationsList';
import { PageHeader } from './components/PageHeader';

export default function HomePage() {
	const { data, loading } = useGetOrganisationsQuery();

	return (
		<Box sx={{ maxWidth: 1400, mx: 'auto', p: 4 }}>
			<Stack spacing={4}>
				<PageHeader />
				<OrganisationsList
					organisations={data?.organisations || []}
					loading={loading}
				/>
			</Stack>
		</Box>
	);
}

