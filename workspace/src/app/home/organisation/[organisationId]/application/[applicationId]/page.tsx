'use client';


import { Card, CardBody } from '@material-tailwind/react';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useFetchApplicationInOrganisation } from '@/components/api.hook';
import ApplicationDetailsNavbar
	from '@/app/home/organisation/[organisationId]/application/[applicationId]/application-navbar';
import StructurePanel from '@/app/home/organisation/[organisationId]/application/[applicationId]/structures-panel';
import FieldsPanel from '@/app/home/organisation/[organisationId]/application/[applicationId]/fields-panel';
import EnumerationPanel from '@/app/home/organisation/[organisationId]/application/[applicationId]/enumerations-panel';
import MasksPanel from '@/app/home/organisation/[organisationId]/application/[applicationId]/masks-panel';
import MessagesPanel from '@/app/home/organisation/[organisationId]/application/[applicationId]/message-panel';
import CodeViewPanel from '@/app/home/organisation/[organisationId]/application/[applicationId]/code-panel';
import TabsComponent from '@/components/tabs.component';
import FullPageLoadingComponent from '@/components/full-page-loading.component';
import { useAtom, useAtomValue } from 'jotai';
import {
	applicationAtom,
	referenceApplicationAtom,
} from '@/app/home/organisation/[organisationId]/application/[applicationId]/atoms';
import { useUpdateApplication } from '@/app/home/organisation/[organisationId]/application/[applicationId]/atom-logic';
import OraclesPanel from '@/app/home/organisation/[organisationId]/application/[applicationId]/oracles-panel';
import { TextField } from '@mui/material';
import ErrorsPanel from '@/app/home/organisation/[organisationId]/application/[applicationId]/errors-panel';


export default function ApplicationPage() {
	const [application, setApplication] = useAtom(applicationAtom);
	const [referenceApplication, setReferenceApplication] = useAtom(referenceApplicationAtom);
	const params = useParams<{organisationId: string, applicationId: string}>()
	const organisationId = parseInt(params.organisationId);
	const applicationId = parseInt(params.applicationId);
	const {data, isLoading, error, mutate} = useFetchApplicationInOrganisation(organisationId, applicationId);


	// init
	useEffect(() => {
		if (!application || !referenceApplication) {
			setApplication(data);
			setReferenceApplication(data)
		}
	}, [data]);



	if (isLoading) {
        return <FullPageLoadingComponent />;
    }
	if (!application || !data || error) return <>An error occurred</>


	return <ApplicationEditionLogic
		mutate={mutate}
	/>
}

export const useApplication = () => {
	const application = useAtomValue(applicationAtom);
	if (!application) throw 'Undefined application';
	return application;
}

function ApplicationEditionLogic(
	 input: {
		 mutate: () => void,
	 }
) {
	return <ApplicationEditionView/>
}


function ApplicationEditionView() {
	return <>
		<div className={'space-y-4'}>
			<Card>
				<CardBody>
					<ApplicationDetailsNavbar/>
					<ApplicationOverview />
				</CardBody>
			</Card>

			<Card>
				<CardBody>
					<TabsComponent
						defaultTabValue={'Fields'}
						panels={{
							'Fields': <FieldsPanel/>,
							'Structures': <StructurePanel/>,
							'Enumerations': <EnumerationPanel/>,
							'Oracles': <OraclesPanel/>,
							'Masks': <MasksPanel/>,
							'Messages': <MessagesPanel/>,
							'Code view': <CodeViewPanel/>,
							'Errors': <ErrorsPanel/>,
						}} />
				</CardBody>

			</Card>
		</div>
	</>
}



function ApplicationOverview() {
	const application = useApplication();
	const updateApplication = useUpdateApplication();
	const [name, setName] = useState<string>(application.name);
	const [logoUrl, setLogoUrl] = useState<string>(application.logoUrl);
	const [domainUrl, setDomainUrl] = useState<string>(application.domain);
	const [tag, setTag] = useState<string|undefined>(application.tag);
	const [description, setDescription] = useState<string>(application.description);


	useEffect(() => {
		updateApplication({
			...application,
			name,
			logoUrl,
			domain: domainUrl,
			description,
			tag
		})
	}, [name, logoUrl, domainUrl, tag, description]);

	const INPUTS = [
		{ label: 'Application name', value: name, onChange: setName },
		{ label: 'Tag', value: tag, onChange: setTag },
		{ label: 'Logo URL', value: logoUrl, onChange: setLogoUrl },
		{ label: 'Website', value: domainUrl, onChange: setDomainUrl },
		{ label: 'Application ID', value: application.virtualBlockchainId, disabled: true },
		{ label: 'Application version', value: application.version, disabled: true },
		{ label: 'Description', value: description, className: "w-full", onChange: setDescription }
	];

	const overviewContent = INPUTS.map((i,index) => <div key={index} className={`flex flex-col flex-1`}>
		<TextField size={"small"} label={i.label} value={i.value} disabled={i.disabled} onChange={(e) => i.onChange && i.onChange(e.target.value)} className={i.className}/>
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

