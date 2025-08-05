'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import ApplicationDetailsNavbar from '@/app/home/organisation/[organisationId]/application/[applicationId]/ApplicationDetailsNavbar';
import { useAtom, useAtomValue } from 'jotai';
import {
	applicationAtom,
	referenceApplicationAtom,
} from '@/app/home/organisation/[organisationId]/application/[applicationId]/atoms';
import ApiKeysPage from '@/app/home/organisation/[organisationId]/application/[applicationId]/api-keys';
import ApplicationOverview from '@/app/home/organisation/[organisationId]/application/[applicationId]/general-information';
import { useGetApplicationInOrganisationQuery } from '@/generated/graphql';
import { Box, Container, Typography, Alert, Paper, Divider, Card, Grid } from '@mui/material';
import AppsIcon from '@mui/icons-material/Apps';
import FullSpaceSpinner from '@/components/FullSpaceSpinner';

export default function ApplicationPage() {
	const [application, setApplication] = useAtom(applicationAtom);
	const [referenceApplication, setReferenceApplication] = useAtom(referenceApplicationAtom);
	const params = useParams<{ organisationId: string, applicationId: string }>();
	const applicationId = parseInt(params.applicationId);
	const { data, loading: isLoading, error, refetch: mutate } = useGetApplicationInOrganisationQuery({
		variables: { applicationId }
	});

	// Initialize application state from query data
	useEffect(() => {
		if (data && data.getApplicationInOrganisation) {
			setReferenceApplication(data.getApplicationInOrganisation);
		}
	}, [data, setReferenceApplication]);

	useEffect(() => {
		setApplication(referenceApplication);
	}, [referenceApplication, setApplication]);

	if (!data || isLoading) {
		return <FullSpaceSpinner />;
	}

	if (!application || !data || error) {
		return (
			<Container maxWidth={false} disableGutters>
				<Box p={4}>
					<Alert
						severity="error"
						variant="outlined"
						sx={{
							borderRadius: 2,
							'& .MuiAlert-icon': {
								alignItems: 'center'
							}
						}}
					>
						<Typography variant="body1">
							{error?.message || "An error occurred while loading the application"}
						</Typography>
					</Alert>
				</Box>
			</Container>
		);
	}

	return (
		<Container maxWidth={false} disableGutters>
			<ApplicationEditionView
				key={applicationId}
				refreshApplication={() => mutate()}
			/>
		</Container>
	);
}

export const useApplication = () => {
	const application = useAtomValue(applicationAtom);
	if (!application) throw new Error('Undefined application');
	return application;
};

type ApplicationEditionViewProps = {
	refreshApplication: () => void;
}

function ApplicationEditionView(props: ApplicationEditionViewProps) {
	return (
		<Box display="flex" flexDirection="column" gap={4}>
			<ApplicationDetailsNavbar refreshApplication={props.refreshApplication} />
			<Grid container spacing={2}>
				<Grid size={4}>
					<Card>
						<ApplicationOverview />
					</Card>
				</Grid>
				<Grid size={8}>
					<Card>
						<ApiKeysPage />
					</Card>
				</Grid>
			</Grid>
		</Box>
	);
}
