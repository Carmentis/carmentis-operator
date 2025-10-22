import { useOrganisation } from '@/contexts/organisation-store.context';
import { alpha, Box, Chip, IconButton, Menu, MenuItem, Tab, Tabs, Tooltip, Typography, useTheme } from '@mui/material';
import Avatar from 'boring-avatars';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import GridViewIcon from '@mui/icons-material/GridView';
import HubIcon from '@mui/icons-material/Hub';
import KeyIcon from '@mui/icons-material/Key';
import PaidIcon from '@mui/icons-material/Paid';
import React, { useState } from 'react';
import PublishIcon from '@mui/icons-material/Publish';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import OrganisationPublicationStatusChip
	from '@/app/home/organisation/[organisationId]/OrganisationPublicationStatusChip';
import { useDeleteOrganisationMutation, useForceChainSyncMutation } from '@/generated/graphql';


export function OrganisationHeader() {
	const organisation = useOrganisation();
	const navigate = useRouter();
	const [value, setValue] = useState(0);
	const handleChange = (event: React.SyntheticEvent, newValue: number) => {
		setValue(newValue);
	};

	function goToHome() {
		setValue(0);
		navigate.push(`/home/organisation/${organisation.id}/`)
	}

	function goToMembers() {
		setValue(1)
		navigate.push(`/home/organisation/${organisation.id}/user`)
	}

	function goToApplications() {
		setValue(2);
		navigate.push(`/home/organisation/${organisation.id}/application`)
	}

	function goToNode() {
		setValue(3);
		navigate.push(`/home/organisation/${organisation.id}/node`)
	}

	function goToApiKeys() {
		setValue(4);
		navigate.push(`/home/organisation/${organisation.id}/apiKeys`)
	}

	function goToTransactions() {
		setValue(5);
		navigate.push(`/home/organisation/${organisation.id}/transactions`)
	}

	return <Box mb={2}>
		<Box display="flex" flexDirection="row" justifyContent={"space-between"}>
			<Box display="flex" flexDirection="row" gap={2}>
				<Avatar name={organisation.publicSignatureKey} square={true} width={20} variant={"bauhaus"}/>
				<Typography variant={"h6"}>{organisation.name}</Typography>
			</Box>

			<Box display="flex" alignItems="center" gap={2}>
				<OrganisationStatus organisation={organisation} />
				<OrganisationMenu />
			</Box>
		</Box>

		<Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
			<Tabs value={value} onChange={handleChange}>
				<Tab label={<Typography>Home</Typography>}  icon={<HomeIcon/>} iconPosition={'start'} onClick={goToHome}/>
				<Tab label={<Typography>Members</Typography>} icon={<PersonIcon/>} iconPosition={'start'} onClick={goToMembers}  />
				<Tab label={<Typography>Applications</Typography>}   icon={<GridViewIcon/>} iconPosition={'start'} onClick={goToApplications}/>
				<Tab label={<Typography>Nodes</Typography>}  icon={<HubIcon/>} iconPosition={'start'} onClick={goToNode}/>
				<Tab label={<Typography>API Keys</Typography>}  icon={<KeyIcon/>} iconPosition={'start'} onClick={goToApiKeys}/>
				<Tab label={<Typography>Transactions</Typography>}  icon={<PaidIcon/>} iconPosition={'start'} onClick={goToTransactions}/>
			</Tabs>
		</Box>
	</Box>;
}

/**
 * Component to display organisation status chips with enhanced styling
 */
function OrganisationStatus({ organisation }) {
	const theme = useTheme();

	if (!organisation) return null;

	return (
		<Box display="flex" gap={1}>
			<OrganisationPublicationStatusChip/>
			<Chip
				label={organisation.balance}
				color="primary"
				size="small"
				icon={<PaidIcon />}
				sx={{
					borderRadius: '16px',
					background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${alpha(theme.palette.primary.main, 0.8)})`,
					color: 'white',
					fontWeight: 500,
					boxShadow: '0 2px 10px rgba(21, 154, 156, 0.2)',
					'& .MuiChip-label': {
						px: 1.5
					},
					'& .MuiChip-icon': {
						color: 'white'
					}
				}}
			/>
		</Box>
	);
}

function OrganisationMenu() {
	const organisation = useOrganisation();
	const navigation = useRouter();
	const theme = useTheme();
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const open = Boolean(anchorEl);
	const [forceSync, {loading: isSyncing}] = useForceChainSyncMutation();

	const [deleteOrganization, {loading: isDeleting}] = useDeleteOrganisationMutation();

	const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
		setAnchorEl(event.currentTarget);
	};

	const handleDeletion = () => {
		deleteOrganization({ variables: { id: organisation.id } })
			.then(response => {
				if (response.data) {
					navigation.push('/home')
				}
			})
	}

	const handleClose = () => {
		setAnchorEl(null);
	};

	return (
		<motion.div
			initial={{ opacity: 0, scale: 0.9 }}
			animate={{ opacity: 1, scale: 1 }}
			transition={{ duration: 0.3 }}
		>
			<Tooltip title="Organisation options">
				<IconButton
					id="organisation-menu-button"
					aria-controls={open ? 'organisation-menu' : undefined}
					aria-haspopup="true"
					aria-expanded={open ? 'true' : undefined}
					onClick={handleClick}
					size="small"
					sx={{
						bgcolor: alpha(theme.palette.primary.main, 0.1),
						backdropFilter: 'blur(5px)',
						'&:hover': {
							bgcolor: alpha(theme.palette.primary.main, 0.2),
						}
					}}
				>
					<MoreVertIcon color="primary" />
				</IconButton>
			</Tooltip>
			<Menu
				id="organisation-menu"
				anchorEl={anchorEl}
				open={open}
				onClose={handleClose}
				MenuListProps={{
					'aria-labelledby': 'organisation-menu-button',
				}}
				PaperProps={{
					elevation: 0,
					sx: {
						overflow: 'visible',
						filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
						background: 'rgba(255, 255, 255, 0.9)',
						backdropFilter: 'blur(10px)',
						borderRadius: 2,
						border: '1px solid rgba(255, 255, 255, 0.5)',
						mt: 1.5,
						'&:before': {
							content: '""',
							display: 'block',
							position: 'absolute',
							top: 0,
							right: 14,
							width: 10,
							height: 10,
							bgcolor: 'rgba(255, 255, 255, 0.9)',
							transform: 'translateY(-50%) rotate(45deg)',
							zIndex: 0,
							borderLeft: '1px solid rgba(255, 255, 255, 0.5)',
							borderTop: '1px solid rgba(255, 255, 255, 0.5)',
						},
					},
				}}
				transformOrigin={{ horizontal: 'right', vertical: 'top' }}
				anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
			>
				<MenuItem
					onClick={() => window.open(organisation.website, '_blank')}
					sx={{
						borderRadius: 1,
						mx: 0.5,
						my: 0.5,
						'&:hover': {
							bgcolor: alpha(theme.palette.primary.main, 0.1),
						}
					}}
				>
					<Box display="flex" alignItems="center" gap={1}>
						<Typography>Visit website</Typography>
					</Box>
				</MenuItem>
				<MenuItem
					onClick={() => forceSync({ variables: { id: organisation.id } })}
					sx={{
						borderRadius: 1,
						mx: 0.5,
						my: 0.5,
						'&:hover': {
							bgcolor: alpha(theme.palette.primary.main, 0.1),
						}
					}}
				>
					<Box display="flex" alignItems="center" gap={1}>
						<Typography>Force sync</Typography>
					</Box>
				</MenuItem>
				<MenuItem
					onClick={() => handleDeletion()}
					sx={{
						borderRadius: 1,
						mx: 0.5,
						my: 0.5,
						'&:hover': {
							bgcolor: alpha(theme.palette.primary.main, 0.1),
						}
					}}
				>
					<Box display="flex" alignItems="center" gap={1}>
						<Typography>Delete organization</Typography>
					</Box>
				</MenuItem>
			</Menu>
		</motion.div>
	);
}
