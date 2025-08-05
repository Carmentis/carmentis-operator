'use client';

import {
	alpha,
	Box,
	Button, ButtonGroup, Card,
	Container,
	Divider,
	Grid,
	Paper,
	TextField,
	Tooltip,
	Typography,
	useTheme,
} from '@mui/material';
import Skeleton from 'react-loading-skeleton';
import React, { useEffect, useState } from 'react';
import { useToast } from '@/app/layout';
import { useOrganisation } from '@/contexts/organisation-store.context';
import { useOrganisationMutationContext } from '@/contexts/organisation-mutation.context';
import {
	useGetOrganisationChainStatusQuery,
	useHasPublishedAccountOnChainQuery,
	usePublishOrganisationMutation,
	useUpdateOrganisationMutation,
} from '@/generated/graphql';
import SaveIcon from '@mui/icons-material/Save';
import PublishIcon from '@mui/icons-material/Publish';
import CheckIcon from '@mui/icons-material/Check';
import PendingIcon from '@mui/icons-material/Pending';
import { StringSignatureEncoder } from '@cmts-dev/carmentis-sdk/client';
import { motion } from 'framer-motion';
import { OrganisationStepper } from '@/app/home/organisation/[organisationId]/OrganisationStepper';
import { CheckComponent } from '@/app/home/organisation/[organisationId]/CheckComponent';
import { useOrganisationPublicKey } from '@/hooks/useOrganisationPublicKey';


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
			<motion.div
				initial="hidden"
				animate="visible"
				variants={staggerContainer}
				className="organisation-content"
			>

				<Grid container spacing={2}>
					<Grid size={4}>
						<OrganisationChainStatus/>
					</Grid>
					<Grid size={8}>
						<Grid container spacing={2}>
							<OrganisationEdition />

							<Card>
								<OrganisationPublicKey/>
							</Card>
						</Grid>
					</Grid>
				</Grid>


			</motion.div>
		</Container>
	);
}


function OrganisationPublicKey() {
	const { publicKey, decodedPublicKey } = useOrganisationPublicKey();
	return <>
		<Box display={"flex"} flexDirection={"row"} justifyContent={"space-between"}>
			<Typography variant="h6" fontWeight="500" mb={2} color="primary">
				Organisation Keys
			</Typography>
			<Box display="flex" gap={2}>
				<Button variant={"contained"}>Copy public key</Button>
				<Button variant={"contained"}>Copy tagged public key</Button>
			</Box>
		</Box>

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
				{decodedPublicKey.getPublicKeyAsString()}
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
				{publicKey}
			</Typography>
		</Box>
	</>
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
			<Card><Skeleton height={60} /></Card>
		);
	}

	if (!data) {
		return (
			<Card><Typography color="error">No blockchain status data available</Typography></Card>
		);
	}

	const { hasTokenAccount, isPublishedOnChain, hasEditedOrganization } = data.organisation.chainStatus;

	// Calculate overall progress
	const completedSteps = [hasTokenAccount, hasEditedOrganization, isPublishedOnChain].filter(Boolean).length;
	const totalSteps = 3;
	const progressPercentage = (completedSteps / totalSteps) * 100;

	return (
		<Card>
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
		</Card>
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
			<Skeleton count={1} height={200} />
		);
	}

	return (
		<Card>
			<Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
				<Typography variant="h6" color="primary">
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
		</Card>
	);
}
