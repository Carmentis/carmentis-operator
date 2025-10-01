'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import ApplicationDetailsNavbar
	from '@/app/home/organisation/[organisationId]/application/[applicationId]/ApplicationDetailsNavbar';
import { useAtom } from 'jotai';
import {
	applicationAtom,
	referenceApplicationAtom,
} from '@/app/home/organisation/[organisationId]/application/[applicationId]/atoms';
import ApiKeysPage from '@/app/home/organisation/[organisationId]/application/[applicationId]/api-keys';
import ApplicationOverview
	from '@/app/home/organisation/[organisationId]/application/[applicationId]/general-information';
import { useGetApplicationInOrganisationQuery } from '@/generated/graphql';
import { Alert, Box, Card, Container, Grid, Typography } from '@mui/material';
import FullSpaceSpinner from '@/components/FullSpaceSpinner';
import { useApplication } from '@/hooks/useApplication';

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

type ApplicationEditionViewProps = {
	refreshApplication: () => void;
}

function ApplicationEditionView(props: ApplicationEditionViewProps) {
	const application = useApplication();
	
	return (
		<Box display="flex" flexDirection="column" gap={4}>
			<ApplicationDetailsNavbar refreshApplication={props.refreshApplication} />
			
			{!application.published && (
				<Alert 
					severity="warning"
					variant="outlined"
				>
					<Typography variant="body1">
						This application is not yet published. The application is not registered on the blockchain, and no transactions can be associated with it or the organization.
					</Typography>
				</Alert>
			)}
			
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
