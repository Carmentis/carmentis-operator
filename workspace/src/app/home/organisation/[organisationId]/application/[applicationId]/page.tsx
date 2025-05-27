'use client';


import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import ApplicationDetailsNavbar
	from '@/app/home/organisation/[organisationId]/application/[applicationId]/application-navbar';
import FullPageLoadingComponent from '@/components/full-page-loading.component';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import {
	applicationAtom,
	referenceApplicationAtom,
} from '@/app/home/organisation/[organisationId]/application/[applicationId]/atoms';
import ApiKeysPage from '@/app/home/organisation/[organisationId]/application/[applicationId]/api-keys';
import ApplicationOverview
	from '@/app/home/organisation/[organisationId]/application/[applicationId]/general-information';
import { useGetApplicationInOrganisationQuery } from '@/generated/graphql';


export default function ApplicationPage() {
	const [application, setApplication] = useAtom(applicationAtom);
	const [referenceApplication, setReferenceApplication] = useAtom(referenceApplicationAtom);
	const params = useParams<{ organisationId: string, applicationId: string }>();
	const applicationId = parseInt(params.applicationId);
	const {data, loading: isLoading, error, refetch: mutate} = useGetApplicationInOrganisationQuery({
		variables: { applicationId }
	})

	// init
	useEffect(() => {
		if (data && data.getApplicationInOrganisation) {
			setReferenceApplication(data.getApplicationInOrganisation);
		}
	}, [data, setReferenceApplication]);

	useEffect(() => {
		setApplication(referenceApplication)
	}, [referenceApplication, setApplication]);


	if (!data || isLoading) {
		return <FullPageLoadingComponent />;
	}
	if (!application || !data || error) return <>An error occurred</>;


	return <ApplicationEditionView
		key={applicationId}
		refreshApplication={() => mutate()}
	/>;
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
	return <>
		<div className={'space-y-4 flex flex-col relative gap-4'}>
			<ApplicationDetailsNavbar refreshApplication={props.refreshApplication} />
			<ApplicationOverview />
			<ApiKeysPage/>
		</div>
	</>;
}

