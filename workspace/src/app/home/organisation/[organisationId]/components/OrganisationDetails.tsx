import React, { useEffect, useState } from 'react';
import { Box, Button, Card, Stack, TextField, Tooltip, Typography } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import PublishIcon from '@mui/icons-material/Publish';
import { useOrganisation } from '@/contexts/organisation-store.context';
import { useOrganisationMutationContext } from '@/contexts/organisation-mutation.context';
import { useToast } from '@/app/layout';
import {
	useHasPublishedAccountOnChainQuery,
	usePublishOrganisationMutation,
	useUpdateOrganisationMutation,
} from '@/generated/graphql';

export function OrganisationDetails() {
	const organisation = useOrganisation();
	const refreshOrganisation = useOrganisationMutationContext();
	const notify = useToast();

	const [formData, setFormData] = useState({
		name: organisation.name,
		city: organisation.city,
		countryCode: organisation.countryCode,
		website: organisation.website,
	});
	const [isModified, setIsModified] = useState(false);

	const { data: tokenAccountData, loading: isCheckingTokenAccount } = useHasPublishedAccountOnChainQuery({
		variables: { organisationId: organisation.id },
	});

	const [updateOrganisation, { loading: isSaving }] = useUpdateOrganisationMutation({
		refetchQueries: ['organisation'],
	});

	const [publishOrganisation, { loading: isPublishing }] = usePublishOrganisationMutation({
		refetchQueries: ['organisation'],
	});

	useEffect(() => {
		setFormData({
			name: organisation.name,
			city: organisation.city,
			countryCode: organisation.countryCode,
			website: organisation.website,
		});
	}, [organisation]);

	const handleFieldChange = (field: keyof typeof formData) => (
		e: React.ChangeEvent<HTMLInputElement>
	) => {
		setFormData((prev) => ({ ...prev, [field]: e.target.value }));
		setIsModified(true);
	};

	const handleSave = async () => {
		try {
			const response = await updateOrganisation({
				variables: {
					organisationId: organisation.id,
					organisation: formData,
				},
			});

			if (response.data) {
				refreshOrganisation.mutate();
				setIsModified(false);
				notify.success('Organisation updated successfully');
			}
		} catch (error) {
			notify.error(error);
		}
	};

	const handlePublish = async () => {
		try {
			await publishOrganisation({
				variables: { organisationId: organisation.id },
			});
			notify.success('Organisation published successfully');
		} catch (error) {
			notify.error(error);
		}
	};

	const hasTokenAccount = tokenAccountData?.hasPublishedAccountOnChain;
	const canPublish = !isModified && organisation.isDraft && hasTokenAccount;
	const showPublishButton = !isModified && organisation.isDraft;

	return (
		<Card sx={{ p: 3 }}>
			<Stack spacing={3}>
				{/* Header */}
				<Box display="flex" justifyContent="space-between" alignItems="center">
					<Typography variant="h6" fontWeight={500}>
						Organisation Details
					</Typography>
					<Box>
						{isModified && (
							<Button
								variant="contained"
								onClick={handleSave}
								disabled={isSaving}
								startIcon={<SaveIcon />}
							>
								Save Changes
							</Button>
						)}
						{showPublishButton && (
							<Tooltip
								title={
									!hasTokenAccount
										? 'Create a token account first to publish your organisation'
										: ''
								}
							>
								<span>
									<Button
										variant="contained"
										onClick={handlePublish}
										disabled={isPublishing || !hasTokenAccount || isCheckingTokenAccount}
										startIcon={<PublishIcon />}
									>
										Publish
									</Button>
								</span>
							</Tooltip>
						)}
					</Box>
				</Box>

				{/* Form Fields */}
				<Stack spacing={2}>
					<Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={2}>
						<TextField
							label="Name"
							value={formData.name}
							onChange={handleFieldChange('name')}
							fullWidth
							size="small"
						/>
						<TextField
							label="Website"
							value={formData.website}
							onChange={handleFieldChange('website')}
							fullWidth
							size="small"
						/>
					</Box>

					<Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={2}>
						<TextField
							label="Country Code"
							value={formData.countryCode}
							onChange={handleFieldChange('countryCode')}
							fullWidth
							size="small"
						/>
						<TextField
							label="City"
							value={formData.city}
							onChange={handleFieldChange('city')}
							fullWidth
							size="small"
						/>
					</Box>

					<TextField
						label="Virtual Blockchain ID"
						value={organisation.virtualBlockchainId || ''}
						disabled
						fullWidth
						size="small"
						helperText="This ID is assigned automatically"
					/>
				</Stack>
			</Stack>
		</Card>
	);
}
