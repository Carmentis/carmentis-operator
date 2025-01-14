'use client';


import {
	Card,
	CardBody, Input,
	Typography,
} from '@material-tailwind/react';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { fetchApplicationInOrganisation } from '@/components/api.hook';
import Skeleton from 'react-loading-skeleton';
import {
	Application, ApplicationBuilder,
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
	useApplicationStoreContext, useUpdateApplication,
} from '@/contexts/application-store.context';
import { EditionStatusContextProvider, useSetEditionStatus } from '@/contexts/edition-status.context';
import TabsComponent from '@/components/tabs.component';

export function OverviewInput(
	input: {
		label: string,
		value: string,
		onChange: (value: string) => void
	},
) {
	return <div className={'flex flex-col space-y-4 w-3/12'}>
		<Typography variant="h6" color="blue-gray" className="-mb-3">
			{input.label}
		</Typography>
		<Input
			value={input.value}
			onChange={(e) => input.onChange(e.target.value)}
			className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
			labelProps={{
				className: 'before:content-none after:content-none',
			}}
		/>
	</div>;
}


export function ApplicationOverview() {

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


function ApplicationDetails(
	input: { application: Application, editor: ApplicationEditor },
) {
	const appEditor = input.editor;

	return <Card>
		<CardBody>
			<TabsComponent
				defaultTabValue={'Fields'}
				panels={{
					'Fields': <FieldsPanel></FieldsPanel>,
					'Structures': <StructurePanel appEditor={appEditor}></StructurePanel>,
					'Enumerations': <EnumerationPanel />,
					'Masks': <MasksPanel />,
					'Messages': <MessagesPanel />,
					'Code view': <CodeViewPanel />,
				}} />
		</CardBody>

	</Card>;
}


/**
 * Renders the ApplicationPage component.
 * Combines multiple context providers including ApplicationStoreContextProvider
 * and EditionStatusContextProvider to manage state and provides the
 * ApplicationDataAccess component as a child.
 *
 * @return {JSX.Element} The rendered ApplicationPage component wrapped with necessary context providers.
 */
export default function ApplicationPage() {
	return <ApplicationStoreContextProvider>
		<EditionStatusContextProvider>
			<ApplicationDataAccess />
		</EditionStatusContextProvider>
	</ApplicationStoreContextProvider>;
}


/**
 * ApplicationDataAccess is a functional component responsible for fetching and displaying
 * application data within a given organisation. It utilizes hooks for state management,
 * API interaction, and updates the application context accordingly.
 *
 * @return {JSX.Element} Returns a JSX element containing the application details and navbar,
 * or a loading skeleton when data is being fetched or unavailable.
 */
export function ApplicationDataAccess() {


	const { application, setApplication } = useApplicationStoreContext();

	// load the application
	const params: { organisationId: number, applicationId: number } = useParams();
	const { data, isLoading, error, mutate } = fetchApplicationInOrganisation(
		params.organisationId,
		params.applicationId,
	);

	// create the application and edition states
	useEffect(() => {
		if (data) {
			setApplication(ApplicationBuilder.BuildFromApiResponse(data));
		}
	}, [data]);


	if (!data || isLoading || !application) {
		return <Skeleton count={5}></Skeleton>;
	}


	const editor = new ApplicationEditor(application);
	return <>
		<div className={'space-y-10'}>
			<ApplicationDetailsNavbar
				refreshApplication={() => mutate()}
			/>
			<ApplicationOverview />
			<ApplicationDetails
				application={application}
				editor={editor}></ApplicationDetails>

		</div>
	</>;
}