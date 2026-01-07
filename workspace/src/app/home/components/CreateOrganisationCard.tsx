import React, { useState } from 'react';
import {
	Box,
	Button,
	Card,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Stack,
	TextField,
	Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useCreateOrganisationMutation } from '@/generated/graphql';
import { useApplicationNavigationContext } from '@/contexts/application-navigation.context';
import { useToast } from '@/app/layout';

export function CreateOrganisationCard() {
	const [open, setOpen] = useState(false);
	const [name, setName] = useState('');
	const [walletSeed, setWalletSeed] = useState('');
	const [createOrganisation, { loading }] = useCreateOrganisationMutation();
	const navigation = useApplicationNavigationContext();
	const notify = useToast();

	const handleCreate = async () => {
		if (!name.trim()) {
			notify.error('Organisation name is required');
			return;
		}

		try {
			const result = await createOrganisation({
				variables: {
					name: name.trim(),
					encodedWalletSeed: walletSeed.trim(),
				},
			});

			if (result.data?.createOrganisation) {
				notify.success('Organisation created successfully');
				navigation.navigateToOrganisation(result.data.createOrganisation.id);
				setOpen(false);
				setName('');
				setWalletSeed('');
			} else if (result.errors) {
				notify.error(result.errors);
			}
		} catch (error) {
			notify.error(error);
		}
	};

	return (
		<>
			<Card
				sx={{
					p: 3,
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					justifyContent: 'center',
					minHeight: 180,
					cursor: 'pointer',
					border: 2,
					borderStyle: 'dashed',
					borderColor: 'divider',
					bgcolor: 'background.default',
					transition: 'all 0.2s',
					'&:hover': {
						borderColor: 'primary.main',
						bgcolor: 'action.hover',
					},
				}}
				onClick={() => setOpen(true)}
			>
				<AddIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
				<Typography variant="h6" fontWeight={500} textAlign="center">
					Create Organisation
				</Typography>
				<Typography variant="body2" color="text.secondary" textAlign="center">
					Start managing your applications
				</Typography>
			</Card>

			<Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
				<DialogTitle>Create New Organisation</DialogTitle>
				<DialogContent>
					<Stack spacing={2} sx={{ mt: 2 }}>
						<TextField
							label="Organisation Name"
							value={name}
							onChange={(e) => setName(e.target.value)}
							fullWidth
							size="small"
							autoFocus
							placeholder="Enter organisation name"
						/>
						<TextField
							label="Wallet Seed (Optional)"
							value={walletSeed}
							onChange={(e) => setWalletSeed(e.target.value)}
							fullWidth
							size="small"
							placeholder="Leave empty to generate automatically"
							helperText="Optional. If provided, this seed will be used to generate organisation keys."
						/>
					</Stack>
				</DialogContent>
				<DialogActions sx={{ px: 3, pb: 3 }}>
					<Button onClick={() => setOpen(false)} variant="outlined">
						Cancel
					</Button>
					<Button
						onClick={handleCreate}
						variant="contained"
						disabled={loading || !name.trim()}
					>
						Create
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
}
