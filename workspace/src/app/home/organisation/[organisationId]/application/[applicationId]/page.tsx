'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAtom } from 'jotai';
import { Alert, Box, Stack } from '@mui/material';
import { applicationAtom, referenceApplicationAtom } from './atoms';
import { useGetApplicationInOrganisationQuery } from '@/generated/graphql';
import FullSpaceSpinner from '@/components/FullSpaceSpinner';
import { useApplication } from '@/hooks/useApplication';
import ApplicationDetailsNavbar from './ApplicationDetailsNavbar';
import ApplicationOverview from './general-information';
import ApiKeysPage from './api-keys';

export default function ApplicationPage() {
	const [application, setApplication] = useAtom(applicationAtom);
	const [referenceApplication, setReferenceApplication] = useAtom(referenceApplicationAtom);
	const params = useParams<{ organisationId: string; applicationId: string }>();
	const applicationId = parseInt(params.applicationId);
	const { data, loading: isLoading, error, refetch } = useGetApplicationInOrganisationQuery({
		variables: { applicationId },
	});

	useEffect(() => {
		if (data?.getApplicationInOrganisation) {
			setReferenceApplication(data.getApplicationInOrganisation);
		}
	}, [data, setReferenceApplication]);

	useEffect(() => {
		setApplication(referenceApplication);
	}, [referenceApplication, setApplication]);

	if (isLoading) {
		return <FullSpaceSpinner label="Loading application" />;
	}

	if (error || !application) {
		return (
			<Box sx={{ maxWidth: 800, mx: 'auto', p: 4 }}>
				<Alert severity="error">
					{error?.message || 'An error occurred while loading the application'}
				</Alert>
			</Box>
		);
	}

	return (
		<ApplicationDetailsView
			key={applicationId}
			refreshApplication={() => refetch()}
		/>
	);
}

interface ApplicationDetailsViewProps {
	refreshApplication: () => void;
}

function ApplicationDetailsView({ refreshApplication }: ApplicationDetailsViewProps) {
	const application = useApplication();

	return (
		<Box sx={{ maxWidth: 1400, mx: 'auto', p: 3 }}>
			<Stack spacing={3}>
				<ApplicationDetailsNavbar refreshApplication={refreshApplication} />

				{!application.published && (
					<Alert severity="warning">
						This application is not published on the blockchain. Publish it to enable transactions
						and full functionality.
					</Alert>
				)}

				<Stack spacing={3}>
					<ApplicationOverview />
					<ApiKeysPage />
				</Stack>
			</Stack>
		</Box>
	);
}
