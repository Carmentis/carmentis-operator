import React from 'react';
import { Box, Skeleton, Stack, Typography } from '@mui/material';
import { OrganisationCard } from './OrganisationCard';
import { CreateOrganisationCard } from './CreateOrganisationCard';

interface Organisation {
	id: number;
	name: string;
	createdAt: string;
	virtualBlockchainId?: string | null;
	lastPublicationCheckTime?: string | null;
}

interface OrganisationsListProps {
	organisations: Organisation[];
	loading: boolean;
}

export function OrganisationsList({ organisations, loading }: OrganisationsListProps) {
	if (loading) {
		return (
			<Box>
				<Typography variant="h5" fontWeight={600} mb={3}>
					Your Organisations
				</Typography>
				<Box
					display="grid"
					gridTemplateColumns="repeat(auto-fill, minmax(320px, 1fr))"
					gap={2}
				>
					{[1, 2, 3].map((i) => (
						<Skeleton
							key={i}
							variant="rectangular"
							height={180}
							sx={{ borderRadius: 2 }}
						/>
					))}
				</Box>
			</Box>
		);
	}

	return (
		<Stack spacing={3}>
			<Typography variant="h5" fontWeight={600}>
				Your Organisations
			</Typography>

			<Box
				display="grid"
				gridTemplateColumns="repeat(auto-fill, minmax(320px, 1fr))"
				gap={2}
			>
				<CreateOrganisationCard />
				{organisations.map((org) => (
					<OrganisationCard key={org.id} organisation={org} />
				))}
			</Box>
		</Stack>
	);
}
