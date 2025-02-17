'use client';


import { Card, CardBody, Input, Typography } from '@material-tailwind/react';

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
	const [description, setDescription] = useState<string>(application.description);


	useEffect(() => {
		saveApplication(app => {
			app.name = name;
			app.logoUrl = logoUrl;
			app.domain = domainUrl;
			app.description = description
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

	function updateDescription(val: string) {
		setIsModified(true);
		setDescription(val)
	}

	const INPUTS = [
		{ label: 'Application name', value: name, onChange: updateName },
		{ label: 'Logo URL', value: logoUrl, onChange: updateLogo },
		{ label: 'Homepage URL', value: homepageUrl, onChange: console.log },
		{ label: 'Domain', value: domainUrl, onChange: updateDomain },
		{ label: 'Application ID', value: application.virtualBlockchainId, disabled: true },
		{ label: 'Application version', value: application.version, disabled: true },
		{ label: 'Description', value: description, className: "w-full", onChange: updateDescription }
	];

	const overviewContent = INPUTS.map((i,index) => <div key={index} className={`flex flex-col flex-1`}>
		<Typography>{i.label}</Typography>
		<Input value={i.value} disabled={i.disabled} onChange={(e) => i.onChange && i.onChange(e.target.value)} className={i.className}/>
	</div>)

	const overviewWrapper = <form className="mb-2 w-full" onSubmit={e => e.preventDefault()}>
		<div className="flex flex-wrap gap-6">
			{overviewContent}
		</div>
	</form>;


	return <div className={"mt-4"}>
		{overviewWrapper}
	</div>;
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

	return <>
		<div className={'space-y-4'}>
			<Card>
				<CardBody>
					<ApplicationDetailsNavbar
						refreshApplication={() => mutate()}
					/>
					<ApplicationOverview />
				</CardBody>
			</Card>

			<ApplicationDetails/>
		</div>
	</>;
}