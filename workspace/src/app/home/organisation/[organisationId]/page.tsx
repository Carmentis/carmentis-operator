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
	alpha,
	useTheme,
	Card,
	CardContent,
} from '@mui/material';
import Skeleton from 'react-loading-skeleton';
import React, { useEffect, useState } from 'react';
import { useToast } from '@/app/layout';
import { useOrganisation } from '@/contexts/organisation-store.context';
import { useOrganisationMutationContext } from '@/contexts/organisation-mutation.context';
import { useApplicationNavigationContext } from '@/contexts/application-navigation.context';
import { WelcomeCard } from '@/components/WelcomeCard';
import OrganisationAccountBalance from '@/components/OrganisationAccountBalance';
import AvatarOrganisation from '@/components/AvatarOrganisation';
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
import DashboardIcon from '@mui/icons-material/Dashboard';
import { StringSignatureEncoder } from '@cmts-dev/carmentis-sdk/client';
import {motion} from 'framer-motion';
import WelcomeCards from '@/components/WelcomeCards';

/**
 * Component to display organisation status chips with enhanced styling
 */
function OrganisationStatus({ organisation }) {
	const theme = useTheme();

	if (!organisation) return null;

	return (
		<Box display="flex" gap={1}>
			{organisation.isDraft && (
				<motion.div
				>
					<Chip
						label="Draft"
						variant="outlined"
						color="primary"
						size="small"
						sx={{
							borderRadius: '16px',
							backdropFilter: 'blur(5px)',
							fontWeight: 500,
							'& .MuiChip-label': {
								px: 1.5
							}
						}}
					/>
				</motion.div>
			)}
			{organisation.published && (
				<motion.div
					initial={{ opacity: 0, scale: 0.8 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ duration: 0.3, delay: 0.1 }}
				>
					<Chip
						label={`Published ${new Date(organisation.publishedAt).toLocaleDateString()}`}
						color="primary"
						size="small"
						icon={<PublishIcon />}
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
				</motion.div>
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
	const theme = useTheme();
	const baseLink = `/home/organisation/${organisation.id}`;

	const quickAccessItems = [
		{
			title: "Applications",
			icon: <AppsIcon />,
			description: "Manage your applications",
			onClick: () => navigation.push(`${baseLink}/application`),
			color: theme.palette.primary.main
		},
		{
			title: "API Keys",
			icon: <VpnKeyIcon />,
			description: "Manage your API keys",
			onClick: () => navigation.push(`${baseLink}/apiKeys`),
			color: theme.palette.secondary.main
		},
		{
			title: "Team Members",
			icon: <PeopleIcon />,
			description: "Manage your team",
			onClick: () => navigation.push(`${baseLink}/user`),
			color: theme.palette.info.main
		},
		{
			title: "Transactions",
			icon: <ReceiptLongIcon />,
			description: "View your transactions",
			onClick: () => navigation.push(`${baseLink}/transactions`),
			color: theme.palette.success.main
		}
	];

	return (
		<Paper 
			elevation={0} 
			sx={{
				...glassStyles,
				p: 3,
				mb: 4
			}}
		>
			<Typography variant="h6" fontWeight="500" mb={3} color="primary">
				Quick Access
			</Typography>
			<Grid container spacing={3}>
				{quickAccessItems.map((item, index) => (
					<Grid item xs={12} sm={6} md={3} key={index}>
						<motion.div>
							<Paper
								elevation={0}
								sx={{
									p: 3,
									height: '100%',
									borderRadius: 2,
									background: 'rgba(255, 255, 255, 0.7)',
									backdropFilter: 'blur(5px)',
									border: '1px solid rgba(255, 255, 255, 0.5)',
									cursor: 'pointer',
									overflow: 'hidden',
									position: 'relative',
									'&::before': {
										content: '""',
										position: 'absolute',
										top: 0,
										left: 0,
										width: '100%',
										height: '5px',
										backgroundColor: item.color,
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
											bgcolor: alpha(item.color, 0.15),
											color: item.color,
											mb: 1,
											width: 56,
											height: 56
										}}
									>
										{item.icon}
									</Box>
									<Typography variant="h6" fontWeight="600" color={item.color}>
										{item.title}
									</Typography>
									<Typography variant="body2" color="text.secondary">
										{item.description}
									</Typography>
								</Box>
							</Paper>
						</motion.div>
					</Grid>
				))}
			</Grid>
		</Paper>
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

// Glass effect styles
const glassStyles = {
  background: 'rgba(255, 255, 255, 0.25)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.18)',
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
  borderRadius: 2,
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 15px 30px 0 rgba(31, 38, 135, 0.25)',
  }
};

// Animation variants for Framer Motion
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function Home() {
	const organisation = useOrganisation();
	const theme = useTheme();

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
		<Container 
			maxWidth={false} 
			disableGutters
			sx={{
				minHeight: '100vh',
				padding: 3,
				borderRadius: 2
			}}
		>
			{/* Organisation Header with Status on the right */}
			<motion.div
				initial="hidden"
				animate="visible"
				variants={fadeInUp}
			>
				<Paper 
					elevation={0} 
					sx={{
						...glassStyles,
						p: 3,
						mb: 4,
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center'
					}}
				>
					<Box display="flex" alignItems="center" gap={2}>
						<AvatarOrganisation
							organisationId={organisation.publicSignatureKey || organisation.id}
							width={64}
							height={64}
						/>
						<Box>
							<Typography variant="h4" fontWeight="600" color="primary" gutterBottom>
								{organisation.name}
							</Typography>
							<Typography variant="body2" color="text.secondary">
								{organisation.city}, {organisation.countryCode}
							</Typography>
						</Box>
					</Box>
					<Box display="flex" alignItems="center" gap={2}>
						<OrganisationStatus organisation={organisation} />
						<OrganisationMenu />
					</Box>
				</Paper>
			</motion.div>

			<motion.div
				initial="hidden"
				animate="visible"
				variants={staggerContainer}
				className="organisation-content"
			>

				<motion.div variants={fadeInUp}>
					<Box mb={4}>
						<OrganisationChainStatus/>
					</Box>
				</motion.div>

				{/* Statistics Cards */}
				<motion.div variants={fadeInUp}>
					<OverviewOrganisationWelcomeCards />
				</motion.div>

				{/* Public Keys Section */}
				<motion.div variants={fadeInUp}>
					<Paper 
						elevation={0} 
						sx={{
							...glassStyles,
							p: 3,
							mb: 4
						}}
					>
						<Typography variant="h6" fontWeight="500" mb={2} color="primary">
							Organisation Keys
						</Typography>

						<Box mb={3}>
							<Typography variant="body2" color="text.secondary" gutterBottom>
								Organisation public key
							</Typography>
							<Typography
								variant="body1"
								fontFamily="monospace"
								sx={{
									p: 2,
									bgcolor: 'rgba(255, 255, 255, 0.5)',
									borderRadius: 1,
									overflowX: 'auto',
									whiteSpace: 'nowrap',
									border: '1px solid rgba(255, 255, 255, 0.3)',
								}}
							>
								{publicKey.getPublicKeyAsString()}
							</Typography>
						</Box>

						<Box>
							<Typography variant="body2" color="text.secondary" gutterBottom>
								Organisation tagged public key
							</Typography>
							<Typography
								variant="body1"
								fontFamily="monospace"
								sx={{
									p: 2,
									bgcolor: 'rgba(255, 255, 255, 0.5)',
									borderRadius: 1,
									overflowX: 'auto',
									whiteSpace: 'nowrap',
									border: '1px solid rgba(255, 255, 255, 0.3)',
								}}
							>
								{signatureEncoder.encodePublicKey(publicKey)}
							</Typography>
						</Box>
					</Paper>
				</motion.div>

				{/* Quick Access Cards */}
				<motion.div variants={fadeInUp}>
					<QuickAccessCards />
				</motion.div>

				{/* Organisation Details */}
				<motion.div variants={fadeInUp}>
					<OrganisationEdition />
				</motion.div>
			</motion.div>
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
			<Paper 
				elevation={0}
				sx={{ 
					...glassStyles,
					p: 3, 
					mb: 3, 
					borderRadius: 2 
				}}
			>
				<Skeleton height={60} />
			</Paper>
		);
	}

	if (!data) {
		return (
			<Paper 
				elevation={0}
				sx={{ 
					...glassStyles,
					p: 3, 
					mb: 3, 
					borderRadius: 2 
				}}
			>
				<Typography color="error">No blockchain status data available</Typography>
			</Paper>
		);
	}

	const { hasTokenAccount, isPublishedOnChain, hasEditedOrganization } = data.organisation.chainStatus;

	// Calculate overall progress
	const completedSteps = [hasTokenAccount, hasEditedOrganization, isPublishedOnChain].filter(Boolean).length;
	const totalSteps = 3;
	const progressPercentage = (completedSteps / totalSteps) * 100;

	return (
		<Paper 
			elevation={0}
			sx={{ 
				...glassStyles,
				p: 3, 
				mb: 3, 
				borderRadius: 2,
				position: 'relative',
				overflow: 'hidden'
			}}
		>
			<Box 
				sx={{
					position: 'absolute',
					bottom: 0,
					left: 0,
					height: '4px',
					width: `${progressPercentage}%`,
					bgcolor: progressPercentage === 100 ? 'success.main' : 'primary.main',
					transition: 'width 0.5s ease-in-out'
				}}
			/>

			<Typography variant="h6" fontWeight="500"  color="primary">
				Blockchain Status
			</Typography>
			<Typography  mb={3}>
				Below are shown the current status of the organisation. When all checks are green, the organization is ready to interact on chain.
			</Typography>

			<Grid container spacing={3}>
				<CheckComponent 
					condition={hasTokenAccount} 
					title="Token Account" 
					onChecked="Organisation has a token account" 
					onNotChecked="Organisation does not have a token account" 
				/>
				<CheckComponent 
					condition={hasEditedOrganization} 
					title="Organization Edited" 
					onChecked="Organization is ready to be published" 
					onNotChecked="Edit organization before publishing" 
				/>
				<CheckComponent 
					condition={isPublishedOnChain} 
					title="Published on Blockchain" 
					onChecked="Organisation published on the blockchain" 
					onNotChecked="Organisation not visible on the blockchain"
				/>
			</Grid>
		</Paper>
	);
}

function CheckComponent(input: { condition: boolean, title: string, onChecked: string, onNotChecked: string }) {
	const {condition, title, onChecked, onNotChecked} = input;
	const theme = useTheme();

	return (
		<Grid item xs={12} md={4}>
			<motion.div
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3 }}
			>
				<Box 
					sx={{
						display: 'flex',
						alignItems: 'center',
						gap: 2,
						p: 2,
						borderRadius: 2,
						bgcolor: condition 
							? alpha(theme.palette.success.main, 0.1)
							: alpha(theme.palette.warning.main, 0.1),
						border: '1px solid',
						borderColor: condition 
							? alpha(theme.palette.success.main, 0.2)
							: alpha(theme.palette.warning.main, 0.2),
					}}
				>
					<Box
						sx={{
							bgcolor: condition 
								? alpha(theme.palette.success.main, 0.2)
								: alpha(theme.palette.warning.main, 0.2),
							borderRadius: '50%',
							width: 48,
							height: 48,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center'
						}}
					>
						{condition ? (
							<CheckIcon sx={{ color: 'success.main' }} />
						) : (
							<PendingIcon sx={{ color: 'warning.main' }} />
						)}
					</Box>
					<Box>
						<Typography variant="subtitle1" fontWeight="600" color={condition ? 'success.main' : 'warning.main'}>
							{title}
						</Typography>
						<Typography variant="body2" color="text.secondary">
							{condition ? onChecked : onNotChecked}
						</Typography>
					</Box>
				</Box>
			</motion.div>
		</Grid>
	);
}

function OrganisationMenu() {
	const organisation = useOrganisation();
	const theme = useTheme();
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const open = Boolean(anchorEl);

	const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
		setAnchorEl(event.currentTarget);
	};

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
						<OpenInNewIcon fontSize="small" color="primary" />
						<Typography>Visit website</Typography>
					</Box>
				</MenuItem>
			</Menu>
		</motion.div>
	);
}

function OrganisationEdition() {
	const organisation = useOrganisation();
	const theme = useTheme();
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

	if (!organisation || isLoadingAccountExistenceCheck) {
		return (
			<Paper 
				elevation={0} 
				sx={{ 
					...glassStyles,
					p: 3, 
					mb: 3, 
					borderRadius: 2 
				}}
			>
				<Skeleton count={1} height={200} />
			</Paper>
		);
	}

	return (
		<Paper 
			elevation={0} 
			sx={{ 
				...glassStyles,
				p: 3, 
				borderRadius: 2,
				position: 'relative',
				overflow: 'hidden'
			}}
		>
			{/* Decorative gradient accent */}
			<Box 
				sx={{
					position: 'absolute',
					top: 0,
					right: 0,
					width: '30%',
					height: '5px',
					background: `linear-gradient(to right, ${alpha(theme.palette.primary.main, 0)}, ${theme.palette.primary.main})`,
				}}
			/>

			<Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
				<Typography variant="h6" fontWeight="600" color="primary">
					Organisation Details
				</Typography>
				<Box>
					{isModified && (
						<motion.div
							whileHover={{ scale: 1.03 }}
							whileTap={{ scale: 0.97 }}
						>
							<Button
								variant="contained"
								onClick={save}
								disabled={isUpdating}
								startIcon={<SaveIcon />}
								sx={{ 
									borderRadius: 2, 
									textTransform: 'none',
									boxShadow: '0 4px 14px rgba(21, 154, 156, 0.3)',

								}}
							>
								Save Changes
							</Button>
						</motion.div>
					)}
					{!isModified && organisation.isDraft && (
						<Tooltip title={!hasTokenAccount ? "You need to create a token account first to publish your organization" : ""}>
							<span>
								<motion.div
									whileHover={{ scale: 1.03 }}
									whileTap={{ scale: 0.97 }}
								>
									<Button
										variant="contained"
										onClick={publish}
										disabled={isPublishing || !hasTokenAccount}
										startIcon={<PublishIcon />}
										sx={{ 
											borderRadius: 2, 
											textTransform: 'none',
											boxShadow: '0 4px 14px rgba(21, 154, 156, 0.3)',
											background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${alpha(theme.palette.primary.main, 0.8)})`,
											'&:hover': {
												boxShadow: '0 6px 20px rgba(21, 154, 156, 0.4)',
											}
										}}
									>
										Publish
									</Button>
								</motion.div>
							</span>
						</Tooltip>
					)}
				</Box>
			</Box>

			<Divider sx={{ mb: 4, opacity: 0.6 }} />

			<Grid container spacing={3}>
				<Grid item xs={12} md={6}>
					<TextField
						fullWidth
						size="small"
						value={name}
						label="Name"
						variant="outlined"
						InputProps={{
							sx: {
								borderRadius: 2,
								bgcolor: 'rgba(255, 255, 255, 0.5)',
								'& .MuiOutlinedInput-notchedOutline': {
									borderColor: 'rgba(255, 255, 255, 0.3)',
								},
								'&:hover .MuiOutlinedInput-notchedOutline': {
									borderColor: 'rgba(21, 154, 156, 0.5)',
								},
								'&.Mui-focused .MuiOutlinedInput-notchedOutline': {
									borderColor: theme.palette.primary.main,
								}
							}
						}}
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
						variant="outlined"
						InputProps={{
							sx: {
								borderRadius: 2,
								bgcolor: 'rgba(255, 255, 255, 0.5)',
								'& .MuiOutlinedInput-notchedOutline': {
									borderColor: 'rgba(255, 255, 255, 0.3)',
								},
								'&:hover .MuiOutlinedInput-notchedOutline': {
									borderColor: 'rgba(21, 154, 156, 0.5)',
								},
								'&.Mui-focused .MuiOutlinedInput-notchedOutline': {
									borderColor: theme.palette.primary.main,
								}
							}
						}}
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
						variant="outlined"
						InputProps={{
							sx: {
								borderRadius: 2,
								bgcolor: 'rgba(255, 255, 255, 0.5)',
								'& .MuiOutlinedInput-notchedOutline': {
									borderColor: 'rgba(255, 255, 255, 0.3)',
								},
								'&:hover .MuiOutlinedInput-notchedOutline': {
									borderColor: 'rgba(21, 154, 156, 0.5)',
								},
								'&.Mui-focused .MuiOutlinedInput-notchedOutline': {
									borderColor: theme.palette.primary.main,
								}
							}
						}}
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
						variant="outlined"
						InputProps={{
							sx: {
								borderRadius: 2,
								bgcolor: 'rgba(255, 255, 255, 0.5)',
								'& .MuiOutlinedInput-notchedOutline': {
									borderColor: 'rgba(255, 255, 255, 0.3)',
								},
								'&:hover .MuiOutlinedInput-notchedOutline': {
									borderColor: 'rgba(21, 154, 156, 0.5)',
								},
								'&.Mui-focused .MuiOutlinedInput-notchedOutline': {
									borderColor: theme.palette.primary.main,
								}
							}
						}}
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
						variant="outlined"
						InputProps={{
							sx: {
								borderRadius: 2,
								bgcolor: 'rgba(0, 0, 0, 0.03)',
								'& .MuiOutlinedInput-notchedOutline': {
									borderColor: 'rgba(0, 0, 0, 0.1)',
								}
							}
						}}
					/>
				</Grid>
			</Grid>
		</Paper>
	);
}
