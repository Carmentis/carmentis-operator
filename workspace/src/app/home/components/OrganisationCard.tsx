import React from 'react';
import { Box, Button, ButtonBase, Card, Chip, Skeleton, Stack, Typography } from '@mui/material';
import AvatarOrganisation from '@/components/AvatarOrganisation';
import { useApplicationNavigationContext } from '@/contexts/application-navigation.context';
import useOrganisationPublicationStatus from '@/hooks/useOrganisationPublicationStatus';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import BusinessIcon from '@mui/icons-material/Business';

interface Organisation {
	id: number;
	name: string;
	createdAt: string;
	virtualBlockchainId?: string | null;
	lastPublicationCheckTime?: string | null;
}

interface OrganisationCardProps {
	organisation: Organisation;
}

export function OrganisationCard({ organisation }: OrganisationCardProps) {
	const navigation = useApplicationNavigationContext();
	const { published, pending, loading } = useOrganisationPublicationStatus({
		virtualBlockchainId: organisation.virtualBlockchainId,
		lastPublicationCheckTime: organisation.lastPublicationCheckTime,
	});

	const handleCardClick = () => {
		navigation.navigateToOrganisation(organisation.id);
	};

	return (
		<Card
			sx={{
				p: 3,
				display: 'flex',
				flexDirection: 'column',
				gap: 2,
				transition: 'all 0.2s',
				cursor: 'pointer',
				'&:hover': {
					boxShadow: 3,
					transform: 'translateY(-2px)',
				},
			}}
			onClick={handleCardClick}
		>
			<Stack spacing={2}>
				{/* Header */}
				<Box display="flex" alignItems="center" justifyContent="space-between">
					<Box display="flex" alignItems="center" gap={1.5}>
						<AvatarOrganisation organisationId={organisation.id} width={40} height={40} />
						<Typography variant="h6" fontWeight={600}>
							{organisation.name}
						</Typography>
					</Box>
					{!loading && (
						<>
							{published && (
								<Chip
									icon={<CheckCircleIcon />}
									label="Published"
									color="success"
									size="small"
								/>
							)}
							{pending && (
								<Chip
									icon={<PendingIcon />}
									label="Pending"
									color="warning"
									size="small"
								/>
							)}
							{!published && !pending && (
								<Chip label="Draft" color="default" size="small" />
							)}
						</>
					)}
				</Box>

				{/* Status */}
				<Typography variant="body2" color="text.secondary">
					{loading ? (
						<Skeleton width={200} />
					) : (
						<>
							{published && 'Published on blockchain'}
							{pending && 'Publication pending verification'}
							{!published && !pending && 'Not published yet'}
						</>
					)}
				</Typography>

				{/* Actions */}
				<Box
					display="flex"
					gap={1}
					onClick={(e) => e.stopPropagation()}
					sx={{ mt: 'auto' }}
				>
					<Button
						variant="contained"
						size="small"
						fullWidth
						onClick={() => navigation.navigateToOrganisation(organisation.id)}
					>
						Open
					</Button>
					<Button
						variant="outlined"
						size="small"
						onClick={() => navigation.navigateToOrganisationApplications(organisation.id)}
					>
						Apps
					</Button>
					<Button
						variant="outlined"
						size="small"
						onClick={() => navigation.navigateToOrganisationNodes(organisation.id)}
					>
						Nodes
					</Button>
				</Box>
			</Stack>
		</Card>
	);
}
