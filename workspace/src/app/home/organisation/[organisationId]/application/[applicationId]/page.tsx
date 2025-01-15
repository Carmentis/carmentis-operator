'use client';


import { Card, CardBody, Typography } from '@material-tailwind/react';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useFetchApplicationInOrganisation } from '@/components/api.hook';
import {
	ApplicationBuilder,
	ApplicationEditor,
} from '@/app/home/organisation/[organisationId]/application/[applicationId]/application-editor';
import ApplicationDetailsNavbar
	from '@/app/home/organisation/[organisationId]/application/[applicationId]/application-navbar';
import StructurePanel from '@/app/home/organisation/[organisationId]/application/[applicationId]/structures-panel';
import FieldsPanel from '@/app/home/organisation/[organisationId]/application/[applicationId]/fields-panel';
import EnumerationPanel from '@/app/home/organisation/[organisationId]/application/[applicationId]/enumerations-panel';
import MasksPanel from '@/app/home/organisation/[organisationId]/application/[applicationId]/masks-panel';
import MessagesPanel from '@/app/home/organisation/[organisationId]/application/[applicationId]/message-panel';
import CodeViewPanel from '@/app/home/organisation/[organisationId]/application/[applicationId]/code-panel';
import {
	ApplicationStoreContextProvider,
	useApplication,
	useApplicationStoreContext,
	useUpdateApplication,
} from '@/contexts/application-store.context';
import { EditionStatusContextProvider, useSetEditionStatus } from '@/contexts/edition-status.context';
import TabsComponent from '@/components/tabs.component';
import OverviewInput from '@/components/overview-input.component';
import FullPageLoadingComponent from '@/components/full-page-loading.component';


export default function ApplicationPage() {
	return <ApplicationStoreContextProvider>
		<EditionStatusContextProvider>
			<ApplicationDataAccess />
		</EditionStatusContextProvider>
	</ApplicationStoreContextProvider>;
}




function ApplicationOverview() {

	const application = useApplication();
	const saveApplication = useUpdateApplication();
	const setIsModified = useSetEditionStatus();
	const [name, setName] = useState<string>(application.name);
	const [logoUrl, setLogoUrl] = useState<string>(application.logoUrl);
	const [homepageUrl, setHomepageUrl] = useState<string>('');
	const [domainUrl, setDomainUrl] = useState<string>(application.domain);


	useEffect(() => {
		saveApplication(app => {
			app.name = name;
			app.logoUrl = logoUrl;
			app.domain = domainUrl;
		});
	}, [name, logoUrl, domainUrl]);

	function updateName(name: string) {
		setIsModified(true);
		setName(name);
	}


	function updateDomain(val: string) {
		setIsModified(true);
		setDomainUrl(val);
	}

	function updateLogo(val: string) {
		setIsModified(true);
		setLogoUrl(val);
	}


	return <>
		<Card>
			<CardBody>
				<Typography variant={'h4'} className={'mb-4'}>Overview</Typography>
				<form className="mb-2 w-full" onSubmit={e => e.preventDefault()}>
					<div className="flex gap-6">
						<OverviewInput label={'Application name'} value={name}
											 onChange={(val) => updateName(val)} />
						<OverviewInput label={'Logo URL'} value={logoUrl} onChange={(val) => updateLogo(val)} />
						<OverviewInput label={'Homepage URL'} value={homepageUrl} onChange={console.log} />
						<OverviewInput label={'Application domain'} value={domainUrl}
											 onChange={(val) => updateDomain(val)} />
					</div>
				</form>
			</CardBody>
		</Card>

	</>;
}


function ApplicationDetails() {
	return <Card>
		<CardBody>
			<TabsComponent
				defaultTabValue={'Fields'}
				panels={{
					'Fields': <FieldsPanel></FieldsPanel>,
					'Structures': <StructurePanel></StructurePanel>,
					'Enumerations': <EnumerationPanel />,
					'Masks': <MasksPanel />,
					'Messages': <MessagesPanel />,
					'Code view': <CodeViewPanel />,
				}} />
		</CardBody>

	</Card>;
}





/**
 * ApplicationDataAccess is a functional component responsible for fetching and displaying
 * application data within a given organisation. It utilizes hooks for state management,
 * API interaction, and updates the application context accordingly.
 */
function ApplicationDataAccess() {


	const { application, setApplication } = useApplicationStoreContext();

	// load the application
	const params = useParams();
	const organisationId = parseInt(params.organisationId as string);
	const applicationId = parseInt(params.applicationId as string);
	const { data, isLoading, error, mutate } = useFetchApplicationInOrganisation(
		organisationId,
		applicationId,
	);

	// create the application and edition states
	useEffect(() => {
		if (data) {
			setApplication(ApplicationBuilder.BuildFromApiResponse(data));
		}
	}, [data]);


	if (!data || isLoading || !application) {
		return <FullPageLoadingComponent/>;
	}


	const editor = new ApplicationEditor(application);
	return <>
		<div className={'space-y-10'}>
			<ApplicationDetailsNavbar
				refreshApplication={() => mutate()}
			/>
			<ApplicationOverview />
			<ApplicationDetails/>
		</div>
	</>;
}