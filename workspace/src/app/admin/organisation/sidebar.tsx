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
 * Displays a message indicating no organisation was found and provides an option to create a new organisation.
 *
 * @param {Object} params - The parameter object.
 * @param {Function} params.createOrganisationClicked - A callback function to be invoked when the "Create a new organisation" option is clicked.
 * @return {JSX.Element} A JSX element that contains the message and clickable text to create a new organisation.
 */
function NoOrganisationFound(
	{createOrganisationClicked}: {createOrganisationClicked: () => void}
) {
	return <div className={"text-center justify-center content-center h-auto"}>
		<p>No organisation found</p>

		<p className={"text-blue-900"} onClick={createOrganisationClicked}>Create a new organisation</p>
	</div>
}


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
		<CardBody className={"flex flex-col justify-between h-full"}>
			<div id="search">
				<SearchInputForm searchFilter={searchFilter} setSearchFilter={setSearchFilter}></SearchInputForm>
				<ul>
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