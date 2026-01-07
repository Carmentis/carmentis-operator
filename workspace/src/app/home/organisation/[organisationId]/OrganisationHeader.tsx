import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Box, Chip, IconButton, Menu, MenuItem, Stack, Tab, Tabs, Tooltip, Typography } from '@mui/material';
import Avatar from 'boring-avatars';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import GridViewIcon from '@mui/icons-material/GridView';
import HubIcon from '@mui/icons-material/Hub';
import KeyIcon from '@mui/icons-material/Key';
import PaidIcon from '@mui/icons-material/Paid';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useOrganisation } from '@/contexts/organisation-store.context';
import OrganisationPublicationStatusChip from '@/app/home/organisation/[organisationId]/OrganisationPublicationStatusChip';
import { useDeleteOrganisationMutation, useForceChainSyncMutation } from '@/generated/graphql';

interface NavTab {
	label: string;
	icon: React.ReactNode;
	path: string;
	pattern: RegExp;
}

export function OrganisationHeader() {
	const organisation = useOrganisation();
	const router = useRouter();
	const pathname = usePathname();

	const tabs: NavTab[] = [
		{
			label: 'Home',
			icon: <HomeIcon fontSize="small" />,
			path: `/home/organisation/${organisation.id}`,
			pattern: new RegExp(`/home/organisation/${organisation.id}$`),
		},
		{
			label: 'Members',
			icon: <PersonIcon fontSize="small" />,
			path: `/home/organisation/${organisation.id}/user`,
			pattern: new RegExp(`/home/organisation/${organisation.id}/user`),
		},
		{
			label: 'Applications',
			icon: <GridViewIcon fontSize="small" />,
			path: `/home/organisation/${organisation.id}/application`,
			pattern: new RegExp(`/home/organisation/${organisation.id}/application`),
		},
		{
			label: 'Nodes',
			icon: <HubIcon fontSize="small" />,
			path: `/home/organisation/${organisation.id}/node`,
			pattern: new RegExp(`/home/organisation/${organisation.id}/node`),
		},
		{
			label: 'API Keys',
			icon: <KeyIcon fontSize="small" />,
			path: `/home/organisation/${organisation.id}/apiKeys`,
			pattern: new RegExp(`/home/organisation/${organisation.id}/apiKeys`),
		},
		{
			label: 'Transactions',
			icon: <PaidIcon fontSize="small" />,
			path: `/home/organisation/${organisation.id}/transactions`,
			pattern: new RegExp(`/home/organisation/${organisation.id}/transactions`),
		},
	];

	const activeTabIndex = tabs.findIndex((tab) => tab.pattern.test(pathname));

	return (
		<Box sx={{ mb: 3 }}>
			{/* Header */}
			<Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
				<Box display="flex" alignItems="center" gap={2}>
					<Avatar
						name={organisation.publicSignatureKey}
						square
						size={40}
						variant="bauhaus"
					/>
					<Typography variant="h5" fontWeight={600}>
						{organisation.name}
					</Typography>
				</Box>

				<Stack direction="row" spacing={1} alignItems="center">
					<OrganisationPublicationStatusChip />
					<Chip
						icon={<PaidIcon />}
						label={organisation.balance}
						size="small"
						color="primary"
					/>
					<OrganisationMenu />
				</Stack>
			</Box>

			{/* Navigation Tabs */}
			<Tabs
				value={activeTabIndex !== -1 ? activeTabIndex : 0}
				variant="scrollable"
				scrollButtons="auto"
				sx={{
					borderBottom: 1,
					borderColor: 'divider',
					'& .MuiTab-root': {
						minHeight: 48,
						textTransform: 'none',
						fontWeight: 500,
					},
				}}
			>
				{tabs.map((tab, index) => (
					<Tab
						key={tab.path}
						label={tab.label}
						icon={tab.icon}
						iconPosition="start"
						onClick={() => router.push(tab.path)}
					/>
				))}
			</Tabs>
		</Box>
	);
}

function OrganisationMenu() {
	const organisation = useOrganisation();
	const router = useRouter();
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const [forceSync] = useForceChainSyncMutation();
	const [deleteOrganization] = useDeleteOrganisationMutation();

	const open = Boolean(anchorEl);

	const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	const handleVisitWebsite = () => {
		window.open(organisation.website, '_blank');
		handleClose();
	};

	const handleForceSync = () => {
		forceSync({ variables: { id: organisation.id } });
		handleClose();
	};

	const handleDelete = async () => {
		const response = await deleteOrganization({ variables: { id: organisation.id } });
		if (response.data) {
			router.push('/home');
		}
		handleClose();
	};

	return (
		<>
			<Tooltip title="More options">
				<IconButton
					onClick={handleClick}
					size="small"
					sx={{
						border: 1,
						borderColor: 'divider',
					}}
				>
					<MoreVertIcon fontSize="small" />
				</IconButton>
			</Tooltip>
			<Menu
				anchorEl={anchorEl}
				open={open}
				onClose={handleClose}
				transformOrigin={{ horizontal: 'right', vertical: 'top' }}
				anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
				slotProps={{
					paper: {
						sx: {
							mt: 1,
							minWidth: 180,
						},
					},
				}}
			>
				<MenuItem onClick={handleVisitWebsite}>Visit Website</MenuItem>
				<MenuItem onClick={handleForceSync}>Force Sync</MenuItem>
				<MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
					Delete Organisation
				</MenuItem>
			</Menu>
		</>
	);
}
