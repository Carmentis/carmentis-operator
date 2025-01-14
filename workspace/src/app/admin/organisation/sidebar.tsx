'use client';
import { useState } from 'react';
import { Organisation } from '@/entities/organisation.entity';
import SimpleTextModalComponent from '@/components/modals/simple-text-modal.component';
import Link from 'next/link';
import { Button, Card, CardBody, Spinner, Typography } from '@material-tailwind/react';
import { useAdminListOfOrganisationsApi } from '@/components/api.hook';
import { SearchInputForm } from '@/components/form/search-input.form';
import Avatar from 'boring-avatars';
import Skeleton from 'react-loading-skeleton';


function NoOrganisationFound(
	{createOrganisationClicked}: {createOrganisationClicked: () => void}
) {
	return <div className={"text-center justify-center content-center h-auto"}>
		<p>No organisation found</p>

		<p className={"text-blue-900"} onClick={createOrganisationClicked}>Create a new organisation</p>
	</div>
}


type ListOrganisationsProps = {
	createOrganisationClicked: () => void,
	organisations: Organisation[]
}
function ListOrganisations(
	{createOrganisationClicked, organisations}: ListOrganisationsProps
) {

	function formatOrganisation(organisation: Organisation) {
		return <Link key={organisation.id} href={`/admin/organisation/${organisation.id}`}>
			<li className={'p-2 hover:bg-gray-100 flex items-center'}>
				<Avatar variant={"bauhaus"} width={30} name={organisation.name}
						className={"mr-2"}
				/>
				{organisation.name}
			</li>
		</Link>;
	}


	const [searchFilter, setSearchFilter] = useState('');

	return <Card className={"h-full w-full"}>
		<CardBody className={"flex flex-col justify-between h-full"}>
			<div id="search">
				<SearchInputForm searchFilter={searchFilter} setSearchFilter={setSearchFilter}></SearchInputForm>
				<ul>
					{
						organisations
							.filter(org => searchFilter === '' || org.name.toLowerCase().includes(searchFilter.toLowerCase()))
							.map(formatOrganisation)
					}
				</ul>
			</div>
			<div id="create">
				<Button className={'w-full'} onClick={createOrganisationClicked}>Create organisation</Button>
			</div>
		</CardBody>
	</Card>
}

export default function OrganisationSidebar() {

	// states to show the organisation creation additional popup
	const [showNewOrganisationModal, setShowNewOrganisationModal] = useState(false);

	// load the organisations
	const listOfOrganisationsResponse = useAdminListOfOrganisationsApi();



	function showOrganisationCreationModal() {
		setShowNewOrganisationModal(true);
	}


	if (listOfOrganisationsResponse.isLoading || !listOfOrganisationsResponse.data) {
		return <Skeleton className={"h-full rounded"}/>
	}

	const organisations = listOfOrganisationsResponse.data;
	const content = organisations.length === 0 ?
		<NoOrganisationFound createOrganisationClicked={showOrganisationCreationModal}/>:
		<ListOrganisations createOrganisationClicked={showOrganisationCreationModal} organisations={organisations}/>


	return <div id="organisation"
				className={"h-full overflow-y-auto "}>
		{showNewOrganisationModal &&
			<SimpleTextModalComponent
				label={"New organisation"}
				onSubmit={() => {}}
				onClose={() => setShowNewOrganisationModal(false)}
				placeholder={"Name"}/>
		}
		{content}
	</div>
}