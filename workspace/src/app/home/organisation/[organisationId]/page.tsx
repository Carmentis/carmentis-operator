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
import { motion } from 'framer-motion';
import { CheckComponent } from '@/app/home/organisation/[organisationId]/CheckComponent';
import { useOrganisationPublicKey } from '@/hooks/useOrganisationPublicKey';
import OrganisationWarnings from '@/app/home/organisation/[organisationId]/OrganisationWarnings';


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
		<>
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

					<Grid size={12} mb={2}>
						<Box display="flex" flexDirection={"column"}>
							<Typography color={"primary"} variant={"h5"}>Overview</Typography>
							<Typography>
								Find out more about your organisation and its status on the blockchain.
							</Typography>
						</Box>
					</Grid>
					
					<OrganisationWarnings />
					
					<Grid container spacing={2}>
						<Grid size={6}>
							<OrganisationEdition />
						</Grid>
						<Grid size={6}>

							<Card>
								<OrganisationPublicKey/>
							</Card>
						</Grid>
					</Grid>


				</motion.div>
			</Container>
		</>
	);
}


function OrganisationPublicKey() {
	const organisation = useOrganisation();
	const { value: orgPk, loading: loadingOrgPK } = useOrganisationPublicKey();
	const notify = useToast();

	const copyToClipboard = (text: string, label: string) => {
		navigator.clipboard.writeText(text).then(() => {
			notify.success(`${label} copied to clipboard`);
		}).catch(() => {
			notify.error('Failed to copy to clipboard');
		});
	};

	return <>
		<Box display={"flex"} flexDirection={"row"} justifyContent={"space-between"}>
			<Typography variant="h6" fontWeight="500" mb={2} color="primary">
				Organisation Keys
			</Typography>
		</Box>

		<Box display="flex" flexDirection="column" gap={3}>
			<Box>
				<Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
					<Typography variant="body2" color="text.secondary" gutterBottom>
						Public Key
					</Typography>
					<Button
						size="small"
						variant="outlined"
						onClick={() => copyToClipboard(organisation.publicSignatureKey, 'Public key')}
					>
						Copy
					</Button>
				</Box>
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
					{organisation.publicSignatureKey}
				</Typography>
			</Box>

			<Box>
				<Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
					<Typography variant="body2" color="text.secondary" gutterBottom>
						Private Key
					</Typography>
					<Button
						size="small"
						variant="outlined"
						onClick={() => copyToClipboard(organisation.privateSignatureKey, 'Private key')}
					>
						Copy
					</Button>
				</Box>
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
					{organisation.privateSignatureKey}
				</Typography>
			</Box>

			<Box>
				<Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
					<Typography variant="body2" color="text.secondary" gutterBottom>
						Wallet Seed
					</Typography>
					<Button
						size="small"
						variant="outlined"
						onClick={() => copyToClipboard(organisation.walletSeed, 'Wallet seed')}
					>
						Copy
					</Button>
				</Box>
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
					{organisation.walletSeed}
				</Typography>
			</Box>
		</Box>
	</>
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
		console.log("Organization update:", city)
		callOrganisationUpdate({
			variables: {
				organisationId: organisation.id,
				organisation: {
					name,
					city,
					countryCode,
					website
				}
			},
		}).then((response) => {
			if (response.data) {
				refreshOrganisation.mutate();
				setIsModified(false);
				notify.success("Organisation updated successfully");
			}

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
					/>
				</Grid>
			</Grid>
		</Card>
	);
}
