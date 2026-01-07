import React, { useEffect, useState } from 'react';
import { useAtomValue } from 'jotai';
import { Box, Card, Stack, TextField, Typography } from '@mui/material';
import { applicationAtom, referenceApplicationAtom } from './atoms';
import { ApplicationTypeFragment } from '@/generated/graphql';
import { useUpdateApplication } from './atom-logic';

export default function ApplicationOverview() {
	const application = useAtomValue(applicationAtom) as ApplicationTypeFragment;
	const referenceApplication = useAtomValue(referenceApplicationAtom) as ApplicationTypeFragment;
	const callUpdateApplication = useUpdateApplication();

	const [formData, setFormData] = useState({
		name: application.name,
		logoUrl: application.logoUrl || '',
		website: application.website || '',
		description: application.description || '',
	});

	useEffect(() => {
		setFormData({
			name: referenceApplication.name,
			logoUrl: referenceApplication.logoUrl || '',
			website: referenceApplication.website || '',
			description: referenceApplication.description || '',
		});
	}, [referenceApplication]);

	useEffect(() => {
		const timeoutId = setTimeout(() => {
			callUpdateApplication({
				...application,
				...formData,
			});
		}, 300);

		return () => clearTimeout(timeoutId);
	}, [formData]);

	const handleFieldChange = (field: keyof typeof formData) => (
		e: React.ChangeEvent<HTMLInputElement>
	) => {
		setFormData((prev) => ({ ...prev, [field]: e.target.value }));
	};

	return (
		<Card sx={{ p: 3 }}>
			<Stack spacing={3}>
				<Box>
					<Typography variant="h6" fontWeight={500} gutterBottom>
						Application Information
					</Typography>
					<Typography variant="body2" color="text.secondary">
						Edit the application details below
					</Typography>
				</Box>

				<Stack spacing={2}>
					<Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={2}>
						<TextField
							label="Application Name"
							value={formData.name}
							onChange={handleFieldChange('name')}
							fullWidth
							size="small"
						/>
						<TextField
							label="Logo URL"
							value={formData.logoUrl}
							onChange={handleFieldChange('logoUrl')}
							fullWidth
							size="small"
							placeholder="https://example.com/logo.png"
						/>
					</Box>

					<TextField
						label="Website"
						value={formData.website}
						onChange={handleFieldChange('website')}
						fullWidth
						size="small"
						placeholder="https://example.com"
					/>

					<TextField
						label="Description"
						value={formData.description}
						onChange={handleFieldChange('description')}
						fullWidth
						size="small"
						multiline
						rows={3}
						placeholder="Describe your application..."
					/>

					<TextField
						label="Virtual Blockchain ID"
						value={application.virtualBlockchainId || 'Not assigned yet'}
						disabled
						fullWidth
						size="small"
						helperText="This ID is automatically assigned when the application is published"
					/>
				</Stack>
			</Stack>
		</Card>
	);
}

