'use client';

import {
	Box,
	Button,
	Chip,
	Container,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Divider,
	Grid,
	IconButton,
	Menu,
	MenuItem,
	Paper,
	Stack,
	TextField,
	Tooltip,
	Typography,
} from '@mui/material';
import Skeleton from 'react-loading-skeleton';
import React, { useEffect, useState } from 'react';
import { useToast } from '@/app/layout';
import { useOrganisation } from '@/contexts/organisation-store.context';
import { useOrganisationMutationContext } from '@/contexts/organisation-mutation.context';
import { useApplicationNavigationContext } from '@/contexts/application-navigation.context';
import WelcomeCards, { WelcomeCard } from '@/components/welcome-cards.component';
import OrganisationAccountBalance from '@/components/organisation-account-balance.component';
import AvatarOrganisation from '@/components/avatar-organisation';
import {
	useGetOrganisationStatisticsQuery,
	useGetOrganisationBalanceQuery,
	usePublishOrganisationMutation,
	useUpdateOrganisationMutation, useHasPublishedAccountOnChainQuery, useGetOrganisationChainStatusQuery,
} from '@/generated/graphql';
import SaveIcon from '@mui/icons-material/Save';
import PublishIcon from '@mui/icons-material/Publish';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import PeopleIcon from '@mui/icons-material/People';
import AppsIcon from '@mui/icons-material/Apps';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import CheckIcon from '@mui/icons-material/Check';
import PendingIcon from '@mui/icons-material/Pending';
import { StringSignatureEncoder } from '@cmts-dev/carmentis-sdk/client';

/**
 * Component to display organisation status chips
 */
function OrganisationStatus({ organisation }) {
	if (!organisation) return null;

	return (
		<Box display="flex" gap={1}>
			{organisation.isDraft && (
				<Chip
					label="Draft"
					variant="outlined"
					color="primary"
					size="small"
				/>
			)}
			{organisation.published && (
				<Chip
					label={`Published ${new Date(organisation.publishedAt).toLocaleDateString()}`}
					color="primary"
					size="small"
					icon={<PublishIcon />}
				/>
			)}
		</Box>
	);
}

/**
 * QuickAccessCards component provides quick navigation to important organisation pages
 * such as Applications, API Keys, Team Members, and Transactions.
 */
function QuickAccessCards() {
	const organisation = useOrganisation();
	const navigation = useApplicationNavigationContext();
	const baseLink = `/home/organisation/${organisation.id}`;

	const quickAccessItems = [
		{
			title: "Applications",
			icon: <AppsIcon />,
			description: "Manage your applications",
			onClick: () => navigation.push(`${baseLink}/application`)
		},
		{
			title: "API Keys",
			icon: <VpnKeyIcon />,
			description: "Manage your API keys",
			onClick: () => navigation.push(`${baseLink}/apiKeys`)
		},
		{
			title: "Team Members",
			icon: <PeopleIcon />,
			description: "Manage your team",
			onClick: () => navigation.push(`${baseLink}/user`)
		},
		{
			title: "Transactions",
			icon: <ReceiptLongIcon />,
			description: "View your transactions",
			onClick: () => navigation.push(`${baseLink}/transactions`)
		}
	];

	return (
		<Box mb={4}>
			<Typography variant="h5" fontWeight="500" mb={3}>
				Quick Access
			</Typography>
			<Grid container spacing={3}>
				{quickAccessItems.map((item, index) => (
					<Grid item xs={12} sm={6} md={3} key={index}>
						<Paper
							elevation={0}
							sx={{
								p: 3,
								height: '100%',
								borderRadius: 2,
								border: '1px solid #eaeaea',
								cursor: 'pointer',
								transition: 'all 0.2s ease-in-out',
								'&:hover': {
									transform: 'translateY(-4px)',
									boxShadow: '0 6px 20px rgba(0, 0, 0, 0.05)',
								}
							}}
							onClick={item.onClick}
						>
							<Box display="flex" flexDirection="column" alignItems="center" textAlign="center" gap={2}>
								<Box
									sx={{
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										p: 1.5,
										borderRadius: '50%',
										bgcolor: 'primary.main',
										color: 'white',
										mb: 1
									}}
								>
									{item.icon}
								</Box>
								<Typography variant="h6" fontWeight="500">
									{item.title}
								</Typography>
								<Typography variant="body2" color="text.secondary">
									{item.description}
								</Typography>
							</Box>
						</Paper>
					</Grid>
				))}
			</Grid>
		</Box>
	);
}

/**
 * The WelcomeCards function fetches organisation statistics and displays them in a set of styled cards.
 * Each card represents key metrics such as Balance, Applications, and Users.
 */
function OverviewOrganisationWelcomeCards() {
	const organisation = useOrganisation();
	const { data: statistics, loading, error } = useGetOrganisationStatisticsQuery({
		variables: {
			id: organisation.id
		}
	});

	if (loading) return (
		<Box
			sx={{
				display: 'grid',
				gridTemplateColumns: {
					xs: '1fr',
					sm: 'repeat(2, 1fr)',
					md: 'repeat(3, 1fr)'
				},
				gap: 3,
				mb: 4
			}}
		>
			{[1, 2, 3].map(i => (
				<Skeleton key={i} height={140} />
			))}
		</Box>
	);

	if (!statistics || error) return (
		<Typography color="error">
			{error?.message || "Failed to load statistics"}
		</Typography>
	);

	const welcomeCardData = [
		{
			icon: 'bi-wallet2',
			title: 'Account Balance',
			value: <OrganisationAccountBalance />
		},
		{
			icon: 'bi-app',
			title: 'Applications',
			value: statistics.getOrganisationStatistics.numberOfApplications.toString()
		},
		{
			icon: 'bi-person-badge',
			title: 'Team Members',
			value: statistics.getOrganisationStatistics.numberOfUsers.toString()
		},
	];

	return (
		<Box mb={4}>

			<WelcomeCards items={welcomeCardData} />
		</Box>
	);
}

export default function Home() {
	const organisation = useOrganisation();



	if (!organisation) {
		return (
			<Container maxWidth={false} disableGutters>
				<Box py={4}>
					<Skeleton height={40} width={300} />
					<Box mt={2}>
						<Skeleton height={24} width={200} />
					</Box>
					<Box mt={4}>
						<Skeleton height={100} count={3} />
					</Box>
				</Box>
			</Container>
		);
	}

	const signatureEncoder = StringSignatureEncoder.defaultStringSignatureEncoder();
	const publicKey = signatureEncoder.decodePublicKey(organisation.publicSignatureKey);
	return (
		<Container maxWidth={false} disableGutters>
			{/* Organisation Header with Status on the right */}
			<Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
				<Box display="flex" alignItems="center" gap={2}>
					<AvatarOrganisation
						organisationId={organisation.publicSignatureKey || organisation.id}
						width={56}
						height={56}
					/>
					<Typography variant="h4" fontWeight="500" color="primary">
						{organisation.name}
					</Typography>
				</Box>
				<Box display="flex" alignItems="center" gap={2}>
					<OrganisationStatus organisation={organisation} />
					<OrganisationMenu  />
				</Box>
			</Box>



			<Typography variant="h5" fontWeight="500" mb={3}>
				Organisation Overview
			</Typography>

			<Box mb={3}>
				<OrganisationChainStatus/>
			</Box>

			{/* Statistics Cards */}
			<OverviewOrganisationWelcomeCards />

			{/* Public Key Display */}
			<Box mb={4} px={2}>
				<Typography variant="body2" color="text.secondary" gutterBottom>
					Organisation public key
				</Typography>
				<Typography
					variant="body1"
					fontFamily="monospace"
					sx={{
						p: 2,
						bgcolor: 'rgba(0, 0, 0, 0.03)',
						borderRadius: 1,
						overflowX: 'auto',
						whiteSpace: 'nowrap'
					}}
				>
					{publicKey.getPublicKeyAsString()}
				</Typography>
			</Box>

			{/* Public Key Display */}
			<Box mb={4} px={2}>
				<Typography variant="body2" color="text.secondary" gutterBottom>
					Organisation tagged public key
				</Typography>
				<Typography
					variant="body1"
					fontFamily="monospace"
					sx={{
						p: 2,
						bgcolor: 'rgba(0, 0, 0, 0.03)',
						borderRadius: 1,
						overflowX: 'auto',
						whiteSpace: 'nowrap'
					}}
				>
					{signatureEncoder.encodePublicKey(publicKey)}
				</Typography>
			</Box>



			{/* Quick Access Cards */}
			<QuickAccessCards />

			{/* Organisation Details */}
			<OrganisationEdition />
		</Container>
	);
}


/**
 * OrganisationChainStatus component displays the blockchain status of an organisation.
 * It shows whether the organisation has a token account and whether it is published on the blockchain.
 * The component uses visual indicators and descriptive text to make the information easy to understand.
 * 
 * @returns {JSX.Element} A component displaying the blockchain status of the organisation
 */
function OrganisationChainStatus() {
	const organisation = useOrganisation();
	const {data, loading} = useGetOrganisationChainStatusQuery({
		variables: {
			organisationId: organisation.id,
		},
	});

	if (loading) {
		return (
			<Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
				<Skeleton height={60} />
			</Paper>
		);
	}

	if (!data) {
		return (
			<Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
				<Typography color="error">No blockchain status data available</Typography>
			</Paper>
		);
	}

	const { hasTokenAccount, isPublishedOnChain, hasEditedOrganization } = data.organisation.chainStatus;

	const body = <>
		<Grid container spacing={3}>
			<CheckComponent condition={hasTokenAccount} title={"Token account"} onChecked={"Organisation has a token account"} onNotChecked={"Organisation does not have a token account"} />
			<CheckComponent condition={hasEditedOrganization} title={"Organization edited"} onChecked={"Organization is ready to be published"} onNotChecked={"Edit organization before to publish"} />
			<CheckComponent condition={isPublishedOnChain} title={"Published on the blockchain"} onChecked={"Organisation published on the blockchain"} onNotChecked={"Organisation not visible on the blockchain"}/>
		</Grid>
	</>
	return (
		<>{body}</>
	);
}


function CheckComponent(input: { condition: boolean, title: string, onChecked: string, onNotChecked: string }) {
	const {condition, title, onChecked, onNotChecked} = input;
	return <Grid item xs={12} md={6}>
		<Box display="flex" alignItems="center" gap={1}>
			<Box
				sx={{
					bgcolor: condition ? 'success.light' : 'warning.light',
					borderRadius: '50%',
					width: 40,
					height: 40,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center'
				}}
			>
				{condition ?
					<CheckIcon sx={{ color: 'success.contrastText' }} /> :
					<PendingIcon sx={{ color: 'warning.contrastText' }} />
				}
			</Box>
			<Box display={"flex"} flexDirection={"column"} justifyContent={"start"} alignItems={"start"}>
				<Typography variant="subtitle1">{title}</Typography>
				<Typography variant="body2" color="text.secondary">
					{condition ?
						onChecked :
						onNotChecked
					}
				</Typography>
			</Box>
		</Box>
	</Grid>
}

function OrganisationMenu() {
	const organisation = useOrganisation();
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const open = Boolean(anchorEl);

	const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};


	return (
		<div>
			<Tooltip title="Organisation options">
				<IconButton
					id="organisation-menu-button"
					aria-controls={open ? 'organisation-menu' : undefined}
					aria-haspopup="true"
					aria-expanded={open ? 'true' : undefined}
					onClick={handleClick}
					size="small"
				>
					<MoreVertIcon />
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
			>
				<MenuItem onClick={() => window.open(organisation.website, '_blank')}>
					<Box display="flex" alignItems="center" gap={1}>
						<OpenInNewIcon fontSize="small" />
						<Typography>Visit website</Typography>
					</Box>
				</MenuItem>
			</Menu>
		</div>
	);
}

function OrganisationEdition() {
	const organisation = useOrganisation();
	const [name, setName] = useState(organisation.name);
	const [city, setCity] = useState(organisation.city);
	const [countryCode, setCountryCode] = useState(organisation.countryCode);
	const [website, setWebsite] = useState(organisation.website);
	const [isModified, setIsModified] = useState(false);
	const refreshOrganisation = useOrganisationMutationContext();
	const notify = useToast();

	const { data: hasTokenAccount, loading: isLoadingAccountExistenceCheck } = useHasPublishedAccountOnChainQuery({
		variables: { organisationId: organisation.id }
	});

	const [callOrganisationUpdate, { loading: isUpdating }] = useUpdateOrganisationMutation({
		refetchQueries: ['organisation'],
	});

	const [callOrganisationPublication, { loading: isPublishing }] = usePublishOrganisationMutation({
		refetchQueries: ['organisation'],
	});

	useEffect(() => {
		if (organisation) {
			setName(organisation.name);
			setCity(organisation.city);
			setCountryCode(organisation.countryCode);
			setWebsite(organisation.website);
		}
	}, [organisation]);

	function save() {
		callOrganisationUpdate({
			variables: {
				id: organisation.id,
				name: name,
				city: city,
				countryCode,
				website
			}
		}).then(() => {
			refreshOrganisation.mutate();
			setIsModified(false);
			notify.success("Organisation updated successfully");
		}).catch(e => {
			notify.error(e);
		});
	}

	function publish() {
		callOrganisationPublication({
			variables: { organisationId: organisation.id }
		})
			.then(() => notify.success("Organisation published successfully"))
			.catch(notify.error);
	}

	if (!organisation || isLoadingAccountExistenceCheck) return <Skeleton count={1} height={200} />;

	return (
		<Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid #eaeaea' }}>
			<Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
				<Typography variant="h5" fontWeight="500">
					Organisation Details
				</Typography>
				<Box>
					{isModified && (
						<Button
							variant="contained"
							onClick={save}
							disabled={isUpdating}
							startIcon={<SaveIcon />}
							sx={{ borderRadius: 2, textTransform: 'none' }}
						>
							Save Changes
						</Button>
					)}
					{!isModified && organisation.isDraft && (
						<Tooltip title={!hasTokenAccount ? "You need to create a token account first to publish your organization" : ""}>
              <span>
                <Button
					variant="contained"
					onClick={publish}
					disabled={isPublishing || !hasTokenAccount}
					startIcon={<PublishIcon />}
					sx={{ borderRadius: 2, textTransform: 'none' }}
				>
                  Publish
                </Button>
              </span>
						</Tooltip>
					)}
				</Box>
			</Box>

			<Divider sx={{ mb: 3 }} />

			<Grid container spacing={3}>
				<Grid item xs={12} md={6}>
					<TextField
						fullWidth
						size="small"
						value={name}
						label="Name"
						onChange={e => {
							setIsModified(true);
							setName(e.target.value);
						}}
					/>
				</Grid>
				<Grid item xs={12} md={6}>
					<TextField
						fullWidth
						size="small"
						value={website}
						label="Website"
						onChange={e => {
							setIsModified(true);
							setWebsite(e.target.value);
						}}
					/>
				</Grid>
				<Grid item xs={12} md={6}>
					<TextField
						fullWidth
						size="small"
						value={countryCode}
						label="Country code"
						onChange={e => {
							setIsModified(true);
							setCountryCode(e.target.value);
						}}
					/>
				</Grid>
				<Grid item xs={12} md={6}>
					<TextField
						fullWidth
						size="small"
						value={city}
						label="City"
						onChange={e => {
							setIsModified(true);
							setCity(e.target.value);
						}}
					/>
				</Grid>
				<Grid item xs={12}>
					<TextField
						fullWidth
						size="small"
						value={organisation.virtualBlockchainId || ''}
						label="Virtual blockchain ID"
						disabled
					/>
				</Grid>
			</Grid>
		</Paper>
	);
}
