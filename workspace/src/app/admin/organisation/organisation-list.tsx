'use client';
import { useState } from 'react';
import { OrganisationSummary } from '@/entities/organisation.entity';
import SimpleTextModalComponent from '@/components/modals/simple-text-modal.component';
import Link from 'next/link';
import { Button, Card, CardBody } from '@material-tailwind/react';
import { useAdminListOfOrganisationsApi } from '@/components/api.hook';
import { SearchInputForm } from '@/components/form/search-input.form';
import Avatar from 'boring-avatars';
import Skeleton from 'react-loading-skeleton';

/**
 * Represents the properties required for listing organisations.
 *
 * @typedef {Object} ListOrganisationsProps
 * @property {Function} createOrganisationClicked - A callback function invoked when the "Create Organisation" action is triggered.
 * @property {OrganisationSummary[]} organisations - An array containing summaries of organisations to be listed.
 */
type ListOrganisationsProps = {
	createOrganisationClicked: () => void,
	organisations: OrganisationSummary[]
}
/**
 * Renders a list of organisations with search functionality and a button to create a new organisation.
 *
 * @param {Object} props - The properties for the component.
 * @param {Function} props.createOrganisationClicked - Callback function triggered when the "Create organisation" button is clicked.
 * @param {Array<OrganisationSummary>} props.organisations - Array of organisation summaries to display.
 *
 */
function ListOrganisations(
	{createOrganisationClicked, organisations}: ListOrganisationsProps
) {

	function formatOrganisationSummary(organisation: OrganisationSummary) {
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
		<CardBody className={"flex flex-col justify-between h-full space-y-4"}>
			<SearchInputForm searchFilter={searchFilter} setSearchFilter={setSearchFilter}></SearchInputForm>
			<div id="search" className={'flex justify-start max-h-fit overflow-y-auto w-full'}>
				<ul className={"w-full"}>
					{
						organisations
							.filter(org => searchFilter === '' || org.name.toLowerCase().includes(searchFilter.toLowerCase()))
							.map(org => formatOrganisationSummary(org))
					}
				</ul>
			</div>
			<div id="create">
				<Button className={'w-full'} onClick={createOrganisationClicked}>Create organisation</Button>
			</div>
		</CardBody>
	</Card>
}

/**
 * OrganisationSidebar component is responsible for displaying a list of organisations
 * or a message indicating that no organisations are found. It also provides functionality
 * to create a new organisation using a modal.
 *
 * The component fetches the list of organisations via an API call, shows a loading state
 * while the data is fetching, and displays appropriate content based on the availability
 * of organisations. If the user opts to create a new organisation, it opens a modal
 * allowing the entry of a new organisation's name.
 */
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
	const content = <ListOrganisations createOrganisationClicked={showOrganisationCreationModal} organisations={organisations}/>;


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