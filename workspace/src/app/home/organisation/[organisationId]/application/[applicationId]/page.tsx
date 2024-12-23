'use client';


import {
	Card,
	CardBody, IconButton, Input,
	SpeedDial, SpeedDialAction, SpeedDialContent, SpeedDialHandler,
	Tab, TabPanel,
	Tabs, TabsBody,
	TabsHeader, Tooltip,
	Typography,
} from '@material-tailwind/react';
import { PlusIcon } from '@heroicons/react/16/solid';
import { createContext, Dispatch, SetStateAction, useContext, useEffect, useState } from 'react';

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

function OverviewInput(
	input: {
		label: string,
		value: string,
		onChange: (value: string) => void
	}
) {
	const [value, setValue] = useState<string>('')
	return <div className={"flex flex-col space-y-4 w-3/12"}>
		<Typography variant="h6" color="blue-gray" className="-mb-3">
			{input.label}
		</Typography>
		<Input
			value={input.value}
			onChange={(e) => input.onChange(e.target.value)}
			className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
			labelProps={{
				className: "before:content-none after:content-none",
			}}
		/>
	</div>
}


export function ApplicationOverview(
) {

	const application  = useApplication();
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
		})
	}, [name, logoUrl, domainUrl]);

	function updateName( name: string ) {
		setIsModified(true);
		setName(name);
	}



	function updateDomain( val: string ) {
		setIsModified(true);
		setDomainUrl(val);
	}

	function updateLogo( val: string ) {
		setIsModified(true);
		setLogoUrl(val);
	}


	return <>
		<Card>
			<CardBody>
				<Typography variant={"h4"} className={"mb-4"}>Overview</Typography>
				<form className="mb-2 w-full" onSubmit={e => e.preventDefault()}>
					<div className="flex gap-6">
						<OverviewInput label={'Application name'} value={name} onChange={(val) => updateName(val)} />
						<OverviewInput label={'Logo URL'} value={logoUrl} onChange={(val) => updateLogo(val)} />
						<OverviewInput label={'Homepage URL'} value={homepageUrl} onChange={console.log} />
						<OverviewInput label={'Application domain'} value={domainUrl}
									   onChange={(val) => updateDomain(val)} />
					</div>
				</form>
			</CardBody>
		</Card>

	</>
}


function ApplicationDetails(
	input: { application: Application, editor: ApplicationEditor },
) {
	const appEditor = input.editor;

	return <Card>
		<CardBody>
			<Tabs className={'w-full'} value={'fields'}>
				<TabsHeader
					className="rounded-none border-b border-blue-gray-50 bg-transparent p-0"
					indicatorProps={{
						className:
							"bg-transparent border-b-2 border-gray-900 shadow-none rounded-none",
					}}
				>
					<Tab key={"fields"} value={"fields"}>Fields</Tab>
					<Tab key={"structures"} value={"structures"}>Structures</Tab>
					<Tab key={"enumerations"} value={"enumerations"}>Enumerations</Tab>
					<Tab key={"masks"} value={"masks"}>Masks</Tab>
					<Tab key={"messages"} value={"messages"}>Messages</Tab>
					<Tab key={"code"} value={"code"}>Code view</Tab>
				</TabsHeader>
				<TabsBody>
					<TabPanel key={"fields"} value={"fields"}>
						<FieldsPanel
							appEditor={appEditor}></FieldsPanel>
					</TabPanel>

					<TabPanel key={"structures"} value={"structures"}>
						<StructurePanel
							appEditor={appEditor}></StructurePanel>
					</TabPanel>

					<TabPanel key={"enumerations"} value={"enumerations"}>
						<EnumerationPanel></EnumerationPanel>
					</TabPanel>

					<TabPanel key={"masks"} value={"masks"}>
						<MasksPanel></MasksPanel>
					</TabPanel>

					<TabPanel key={"messages"} value={"messages"}>
						<MessagesPanel></MessagesPanel>
					</TabPanel>
					<TabPanel key={"code"} value={"code"}>
						<CodeViewPanel></CodeViewPanel>
					</TabPanel>
				</TabsBody>
			</Tabs>
		</CardBody>

	</Card>
}

function SpeedCreation() {
	return <div className="absolute h-80 right-10 bottom-10 z-30">
		<div className="absolute bottom-0 right-0">
			<SpeedDial>
				<SpeedDialHandler>

					<IconButton size="lg" className="rounded-full">
						<PlusIcon className="h-5 w-5 transition-transform group-hover:rotate-45" />
					</IconButton>


				</SpeedDialHandler>
				<SpeedDialContent>
					<SpeedDialAction>
						<Tooltip content="Create structure" placement={"left"} offset={30}>
							<i className={"bi bi-braces"}></i>
						</Tooltip>
					</SpeedDialAction>
					<SpeedDialAction>
						<Tooltip content="Create field" placement={"left"} offset={30}>
							<i className={"bi bi-braces-asterisk"}></i>
						</Tooltip>
					</SpeedDialAction>
					<SpeedDialAction>
						<Tooltip content="Create message" placement={"left"} offset={30}>
							<i className={"bi bi-chat-left"}></i>
						</Tooltip>
					</SpeedDialAction>
					<SpeedDialAction>
						<Tooltip content="Create enumerates" placement={"left"} offset={30}>
							<i className={"bi bi-list-ul"}></i>
						</Tooltip>
					</SpeedDialAction>
					<SpeedDialAction>
						<Tooltip content="Create masks" placement={"left"} offset={30}>
							<i className={"bi bi-mask"}></i>
						</Tooltip>
					</SpeedDialAction>
				</SpeedDialContent>
			</SpeedDial>
		</div>
	</div>
}















export interface ApplicationState {
	application: Application;
	setApplication: Dispatch<SetStateAction<Application>>
}

export interface EditionStatus {
	isModified: boolean,
	setIsModified: Dispatch<SetStateAction<boolean>>
}

export const ApplicationContext = createContext<ApplicationState>();
export const EditionStatusContext = createContext<EditionStatus>();


export const useApplication = () => {
	const context = useContext(ApplicationContext);
	return context.application;
}

export const useApplicationFields = () => {
	const context = useContext(ApplicationContext);
	return context.application.data.fields;
}


export const useApplicationStrutures = () => {
	const context = useContext(ApplicationContext);
	return context.application.data.structures;
}


export const useApplicationEnum = () => {
	const context = useContext(ApplicationContext);
	return context.application.data.enumerations;
}

export const useApplicationMask = () => {
	const context = useContext(ApplicationContext);
	return context.application.data.masks;
}

export const useApplicationMessages = () => {
	const context = useContext(ApplicationContext);
	return context.application.data.messages;
}



export const useUpdateApplication = () => {
	const context = useContext(ApplicationContext);
	return (cb: (application: Application, editor: ApplicationEditor) => void) => {
		context.setApplication(app => {
			const editor = new ApplicationEditor(app);
			cb(app, editor)
			return {...app}
		})
	}
};


export const useEditionStatus = () => {
	const context = useContext(EditionStatusContext);
	return context.isModified;
}

export const useSetEditionStatus = () => {
	const context = useContext(EditionStatusContext);
	return (value: boolean) => {
		context.setIsModified(value)
	}
}


export default function ApplicationDetailsPage() {

	// load the application
	const params : { organisationId: number, applicationId: number } = useParams();
	const { data, loading, error } = fetchApplicationInOrganisation(
		params.organisationId,
		params.applicationId
	)

	// create the application and edition states
	const [application, setApplication] = useState<Application|null>(null);
	const [isModified, setIsModified] = useState<boolean>(false);
	useEffect(() => {
		if ( data ) {
			setApplication(ApplicationBuilder.BuildFromApiResponse(data))
		}
	}, [data]);



	if ( !data || loading || !application ) {
		return <Skeleton count={5}></Skeleton>
	}



	const editor = new ApplicationEditor(application);
	return <ApplicationContext.Provider value={{
		application: application,
		setApplication: setApplication
	}}>
		<EditionStatusContext.Provider value={{
			isModified,
			setIsModified
		}}>
			<div className={"space-y-10"}>
				<ApplicationDetailsNavbar />
				<ApplicationOverview/>
				<ApplicationDetails
					application={application}
					editor={editor}></ApplicationDetails>

			</div>
		</EditionStatusContext.Provider>

	</ApplicationContext.Provider>
}