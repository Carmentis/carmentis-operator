'use client';


import { Button, Card, CardBody, IconButton, Typography } from '@material-tailwind/react';

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
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import {
	applicationAtom,
	referenceApplicationAtom,
} from '@/app/home/organisation/[organisationId]/application/[applicationId]/atoms';
import { useUpdateApplication } from '@/app/home/organisation/[organisationId]/application/[applicationId]/atom-logic';
import OraclesPanel from '@/app/home/organisation/[organisationId]/application/[applicationId]/oracles-panel';
import { Box, TextField } from '@mui/material';
import ErrorsPanel from '@/app/home/organisation/[organisationId]/application/[applicationId]/errors-panel';
import { AppDataOracle } from '@/entities/application.entity';


export default function ApplicationPage() {
	const [application, setApplication] = useAtom(applicationAtom);
	const setReferenceApplication= useSetAtom(referenceApplicationAtom);
	const params = useParams<{organisationId: string, applicationId: string}>()
	const organisationId = parseInt(params.organisationId);
	const applicationId = parseInt(params.applicationId);
	const {data, isLoading, error, mutate} = useFetchApplicationInOrganisation(organisationId, applicationId);


	// init
	useEffect(() => {
		setApplication(data);
		setReferenceApplication(data)
	}, [data]);



	if (isLoading) {
        return <FullPageLoadingComponent />;
    }
	if (!application || !data || error) return <>An error occurred</>


	return <ApplicationEditionView
		refreshApplication={() => mutate()}
	/>
}

export const useApplication = () => {
	const application = useAtomValue(applicationAtom);
	if (!application) throw new Error('Undefined application');
	return application;
}



type ApplicationEditionViewProps = {
	refreshApplication: () => void;
}
function ApplicationEditionView( props: ApplicationEditionViewProps ) {
	return <>
		<div className={'space-y-4 flex flex-col relative'}>
			<Card className={"w-full top-0 z-20 sticky"}>
				<CardBody>
					<ApplicationDetailsNavbar refreshApplication={props.refreshApplication}/>
				</CardBody>
			</Card>

			<Card>
				<CardBody className={"flex flex-col gap-12"}>
					<ApplicationOverview />

					<Box display={"flex"} flexDirection={"column"}>
						<Box display={"flex"} flexDirection={"row"} justifyContent={"space-between"}>
							<Box>
								<Typography variant={"h6"}>Application Definition</Typography>
								<Typography variant={"paragraph"}>
									Edit the definition of your application below.
								</Typography>
							</Box>
							<Box>
								<a href={"https://docs.carmentis.io/how-to/declare-your-application"}  target={"_blank"} className={"hover:cursor-pointer"}>
									<i className={"bi bi-question-circle-fill"} />
								</a>
							</Box>
						</Box>
						<Box className={"min-h-screen z-10"}>
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
									//'Errors': <ErrorsPanel context={"application"}/>,
								}} />
						</Box>
					</Box>

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
		{ label: 'Description', value: description, className: "w-full", onChange: setDescription }
	];

	const overviewContent = INPUTS.map((i,index) => <div key={index} className={`flex flex-col flex-1`}>
		<TextField size={"small"} label={i.label} value={i.value} onChange={(e) => i.onChange && i.onChange(e.target.value)} className={i.className}/>
	</div>)


	return <>
		<div className={"flex flex-col space-y-4"}>
			<div>
				<Typography variant={"h6"}>Application Information</Typography>
				<Typography variant={"paragraph"}>
					Edit the name of the application, the tag, the logo and the description below.
				</Typography>
			</div>
			<div className="flex flex-col gap-6">
				{overviewContent}
			</div>
		</div>
		<div className={"mflex flex-col space-y-4"}>
			<div>
				<Typography variant={"h6"}>Publication Information</Typography>
				<Typography variant={"paragraph"}>
					Below are listed the application id and version. These information are useful to use this application declaration.
				</Typography>
			</div>
			<div className="flex flex-col gap-4">
				<div>
					<Typography variant={"paragraph"}>Application Id</Typography>
					<Typography
						className={"w-full bg-gray-300 p-2 rounded"}>{application.virtualBlockchainId || ''}</Typography>
				</div>
				<div>
					<Typography variant={"paragraph"}>Application Version</Typography>
					<Typography
						className={"w-full bg-gray-300 p-2 rounded"}>{application.version}</Typography>
				</div>
			</div>
		</div>
	</>;
}


