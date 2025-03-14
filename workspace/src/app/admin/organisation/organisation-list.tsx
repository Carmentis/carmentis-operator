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
import { useAtom, useAtomValue } from 'jotai';
import { organisationQueryAtom } from '@/app/admin/organisation/query.atom';
import AvatarOrganisation from '@/components/avatar-organisation';

/**
 * Renders a list of organisations with search functionality and a button to create a new organisation.
 *
 * @param {Object} props - The properties for the component.
 * @param {Function} props.createOrganisationClicked - Callback function triggered when the "Create organisation" button is clicked.
 *
 */
function ListOrganisations() {

	const organisationQuery = useAtomValue(organisationQueryAtom);

	// load the organisations
	const listOfOrganisationsResponse = useAdminListOfOrganisationsApi(organisationQuery);


	function formatOrganisationSummary(organisation: OrganisationSummary) {
		return <Link key={organisation.id} href={`/admin/organisation/${organisation.id}`}>
			<li className={'p-2 hover:bg-gray-100 flex items-center'}>
				<AvatarOrganisation organisationId={organisation.publicSignatureKey || organisation.id} className={"mr-2"} height={30}/>

				{organisation.name}
			</li>
		</Link>;
	}

	if (listOfOrganisationsResponse.isLoading || !listOfOrganisationsResponse.data) return <Skeleton className={"h-full w-full"}/>
	const organisations = listOfOrganisationsResponse.data;
	return <ul className={'w-full h-full justify-start max-h-auto overflow-y-auto'}>
		{
			organisations
				.map(org => formatOrganisationSummary(org))
		}

	</ul>;
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
	const content = <ListOrganisations/>;

	return <div id="organisation"
				className={"h-full overflow-y-auto "}>
		{showNewOrganisationModal &&
			<SimpleTextModalComponent
				label={"New organisation"}
				onSubmit={() => {}}
				onClose={() => setShowNewOrganisationModal(false)}
				placeholder={"Name"}/>
		}

		<Card className={"h-full w-full"}>
			<CardBody className={"flex flex-col h-full space-y-4 max-h-auto"}>
				<div className={"h-auto"}>
					<OrganisationQueryForm/>
				</div>
				{content}
				<div id="search" className={'flex-1 max-h-full h-[calc(100%-200px)]'}>

				</div>
				<div id="create" className={"h-auto"}>
					<Button className={'w-full'} onClick={() => setShowNewOrganisationModal(true)}>Create organisation</Button>
				</div>
			</CardBody>
		</Card>


	</div>
}

function OrganisationQueryForm() {
	const [searchFilter, setSearchFilter] = useAtom(organisationQueryAtom);
	return <>
		<SearchInputForm searchFilter={searchFilter} setSearchFilter={setSearchFilter}></SearchInputForm>
	</>;
}