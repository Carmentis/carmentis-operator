'use client';

import { Button, Card, CardBody, Typography } from '@material-tailwind/react';
import { SearchInputForm } from '@/components/form/search-input.form';
import { useState } from 'react';
import SimpleTextModalComponent from '@/components/modals/simple-text-modal.component';
import { fetchOrganisationApplications, useApplicationCreation } from '@/components/api.hook';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { DefaultAppIcon, DynamicAppIcon } from '@/components/icons/default-user.icon';



function ApplicationHorizontalCard(input: { application: {id: number, name: string, logoUrl: string}, onClick: () => void, className?: string }) {
	const application = input.application;
	return <Card
		onClick={input.onClick}
		className={`w-full flex flex-row justify-between items-center w-100 hover:shadow-xl transition-shadow cursor-pointer ${input.className}`}>
		<CardBody>
			<div className="flex flex-col justify-center items-center w-24 ">
				<DynamicAppIcon src={application.logoUrl}/>
				<span>{application.name}</span>
			</div>
		</CardBody>
	</Card>

}


function ListOfApplicationsComponent(
	input: {
		organisationId: number,
		data: {id: number, name: string}[]
	}
) {
	const applications: {id: number, name: string}[] = input.data;

	return <div className={"flex flex-col gap-2"}>
		{
			applications.map((app, index) => <Link key={index} href={`/home/organisation/${input.organisationId}/application/${app.id}`}>
				<ApplicationHorizontalCard
					application={app}
					onClick={() => {}}/>
			</Link>)
		}
	</div>
}

export default function ListOfApplicationsPage() {
	const [search, setSearch] = useState('');
	const [isShowingNameForm, setIsShowingNameForm] = useState(false);
	const createApplication = useApplicationCreation();
	const params: { organisationId: number } = useParams();

	const {data, loading, error} = fetchOrganisationApplications(
		params.organisationId
	);

	let listOfApplicationsContent = data ? <ListOfApplicationsComponent data={data} organisationId={params.organisationId} /> : <></>


	function submitApplicationNameCreation( name: string ) {
		createApplication( params.organisationId, name, {
			onSuccessData: (data) => {
				console.log(data)
			},
			onError: (error) => {console.error(error)}
		} )
		setIsShowingNameForm(false);
	}

	return <div className={"space-y-12"}>
		<Card>
			<CardBody className={"p-3"}>
				<div className="flex justify-between">
						<Typography variant={'h5'} color={'blue-gray'} className={"justify-center items-center content-center ml-4"}>
							Applications
						</Typography>

					<div className={"space-x-2"}>
						<Button onClick={() => setIsShowingNameForm(true)}>Create application</Button>
						<Button disabled={true}>Import application</Button>
					</div>
				</div>
			</CardBody>
		</Card>

		<Card>
			<CardBody>
				<Typography variant={'h5'} color={'blue-gray'}  className={'mb-4'}>
					Search an application
				</Typography>
				<SearchInputForm searchFilter={search} setSearchFilter={setSearch}/>
			</CardBody>
		</Card>


		{listOfApplicationsContent}

		{
			isShowingNameForm &&
			<SimpleTextModalComponent label={"Application name"}
									  onSubmit={submitApplicationNameCreation}
									  onClose={() => {setIsShowingNameForm(false)}}
									  placeholder={"Name"} />
		}
	</div>;
}