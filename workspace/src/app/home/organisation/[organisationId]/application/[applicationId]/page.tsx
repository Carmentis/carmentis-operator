'use client';


import {
	Card,
	CardBody, Chip, IconButton, Input,
	SpeedDial, SpeedDialAction, SpeedDialContent, SpeedDialHandler,
	Tab, TabPanel,
	Tabs, TabsBody,
	TabsHeader, Tooltip,
	Typography,
} from '@material-tailwind/react';
import { ArrowDownOnSquareIcon, ArrowUpOnSquareIcon, PlusIcon, TrashIcon } from '@heroicons/react/16/solid';
import { useState } from 'react';
import {
	EnumerationPanel,
	FieldsPanel, MasksPanel, MessagePanel,
	StructurePanel,
} from '@/app/home/organisation/[organisationId]/application/panels';

function ApplicationDetailsNavbar() {
	return <Card>
		<CardBody className={"p-3"}>
			<div className="flex justify-between">
				<div className="begin-section justify-center items-center content-center flex">
					<div className="border-r-2 border-gray-200  px-4">
						<Typography variant={'h5'} color={'blue-gray'}
									className={'justify-center items-center content-center'}>
							My Application
						</Typography>
					</div>

					<div className="border-r-2 border-gray-200  px-4">
						Version 2
					</div>
					<div className="border-r-2 border-gray-200  px-4">
						<Chip variant="outlined" value="Published" />
					</div>
				</div>


				<div className={'flex'}>

					<div className="space-x-2 border-r-2 border-gray-200 pr-2">
						<IconButton  >
							<ArrowDownOnSquareIcon className="h-5 w-5 transition-transform group-hover:rotate-45" />
						</IconButton>
						<IconButton  >
							<ArrowUpOnSquareIcon className="h-5 w-5 transition-transform group-hover:rotate-45" />
						</IconButton>
					</div>


					<IconButton  className={"border-l-2 border-gray-200 ml-2"} >
						<TrashIcon className="h-5 w-5 transition-transform group-hover:rotate-45" />
					</IconButton>
				</div>
			</div>
		</CardBody>
	</Card>
}




function ApplicationOverview() {
	function OverviewInput(
		input: {
			label: string,
			placeholder?: string,
		}
	) {
		const [value, setValue] = useState('');

		return <div className={"flex flex-col space-y-4 w-3/12"}>
			<Typography variant="h6" color="blue-gray" className="-mb-3">
				{input.label}
			</Typography>
			<Input
				value={value}
				onChange={(e) => setValue(e.target.value)}
				placeholder={input.placeholder}
				className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
				labelProps={{
					className: "before:content-none after:content-none",
				}}
			/>
		</div>
	}

	return <>
	<form className="mb-2 w-full">
		<div className="flex gap-6">
			<OverviewInput label={"Application name"} />
			<OverviewInput label={"Logo URL"} />
			<OverviewInput label={"Homepage URL"} />
			<OverviewInput label={"Application domain"} />
		</div>
	</form>
	</>
}




function ApplicationDetails() {
	return <Card>
		<CardBody>
			<div className="w-full mb-8">
				<ApplicationOverview/>
			</div>
			<Tabs className={"w-1/2"}>
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
				</TabsHeader>
				<TabsBody>
					<TabPanel key={"fields"} value={"fields"}>
						<FieldsPanel></FieldsPanel>
					</TabPanel>

					<TabPanel key={"structures"} value={"structures"}>
						<StructurePanel></StructurePanel>
					</TabPanel>

					<TabPanel key={"enumerations"} value={"enumerations"}>
						<EnumerationPanel></EnumerationPanel>
					</TabPanel>

					<TabPanel key={"masks"} value={"masks"}>
						<MasksPanel></MasksPanel>
					</TabPanel>

					<TabPanel key={"messages"} value={"messages"}>
						<MessagePanel></MessagePanel>
					</TabPanel>

				</TabsBody>
			</Tabs>
		</CardBody>

	</Card>
}

function SpeedCreation() {
	return <div className="absolute h-80 right-10 bottom-10">
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

export default function ApplicationDetailsPage() {
	return <div className={"space-y-10"}>
		<ApplicationDetailsNavbar />
		<ApplicationDetails></ApplicationDetails>

		<SpeedCreation></SpeedCreation>

	</div>
}