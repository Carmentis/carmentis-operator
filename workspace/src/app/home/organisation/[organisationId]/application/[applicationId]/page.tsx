'use client';


import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useFetchApplicationInOrganisation } from '@/components/api.hook';
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


export default function ApplicationPage() {
	const [application, setApplication] = useAtom(applicationAtom);
	const setReferenceApplication = useSetAtom(referenceApplicationAtom);
	const params = useParams<{ organisationId: string, applicationId: string }>();
	const organisationId = parseInt(params.organisationId);
	const applicationId = parseInt(params.applicationId);
	const { data, isLoading, error, mutate } = useFetchApplicationInOrganisation(organisationId, applicationId);


	// init
	useEffect(() => {
		setApplication(data);
		setReferenceApplication(data);
	}, [data]);


	if (isLoading) {
		return <FullPageLoadingComponent />;
	}
	if (!application || !data || error) return <>An error occurred</>;


	return <ApplicationEditionView
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

