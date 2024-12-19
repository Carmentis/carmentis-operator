'use client';

import { useEffect, useState } from 'react';
import { Organisation } from '@/entities/organisation.entity';
import SimpleTextModalComponent from '@/components/modals/simple-text-modal.component';
import Link from 'next/link';
import { SearchInputForm } from '@/components/form/search-input.form';

export default function OrganisationSidebar() {

	function noOrganisationFound( onNewOrganisation: () => void ) {
		return <div className={"text-center justify-center content-center h-full"}>
			<p>No organisation found</p>

			<p className={"text-blue-900"} onClick={onNewOrganisation}>Create a new organisation</p>
		</div>
	}

	const [searchFilter, setSearchFilter] = useState('');
	function listOrganisations(organisations: Organisation[], onNewOrganisation: () => void ) {

		return <div className={' h-full'}>
			<div className={"border-b-2 border-gray-200 flex flex-row justify-between"}>
				<i onClick={onNewOrganisation}
					className={'bi bi-plus w-5 h-5 p-2 m-1 flex justify-center items-center cursor-pointer hover:bg-gray-100'}></i>
				<i className={'bi bi-chevron-double-left w-5 h-5 p-2 m-1 flex justify-center items-center cursor-pointer hover:bg-gray-100'}></i>
			</div>
			<div className={'p-2 flex flex-col justify-between'}>

				<div className={'mb-2'}>
					<SearchInputForm searchFilter={searchFilter} setSearchFilter={setSearchFilter}></SearchInputForm>
			</div>

			<div className={"justify-start h-full"}>
				<ul>
					{
						organisations
							.filter(org => searchFilter === '' || org.name.toLowerCase().includes(searchFilter.toLowerCase()))
							.map(formatOrganisation)
					}
				</ul>
			</div>

			</div>

		</div>
	}

	function formatOrganisation(organisation: Organisation) {
		return <Link key={organisation.id} href={`/admin/organisation/${organisation.id}`}>
			<li className={'p-2 hover:bg-gray-100'}>
				{organisation.name}
			</li>
		</Link>;
	}


	// states to show the organisation creation additional popup
	const [showNewOrganisationModal, setShowNewOrganisationModal] = useState(false);
	const [organisations, setOrganisations] = useState<Organisation[]>([]);


	function showOrganisationCreationModal() {
		setShowNewOrganisationModal(true);
	}

	const content = organisations.length === 0 ?
		noOrganisationFound(showOrganisationCreationModal) :
		listOrganisations(organisations, showOrganisationCreationModal);

	// load organisations
	useEffect(() => {
		fetch(process.env.NEXT_PUBLIC_WORKSPACE_API_BASE_URL + '/admin/organisation')
			.then(response => {
				if (!response.ok) {
					throw new Error(response.statusText);
				}
				return response.json();
			})
			.then(setOrganisations);
	}, []);


	function onNewOrganisation(organisationName: string) {
		fetch(process.env.NEXT_PUBLIC_WORKSPACE_API_BASE_URL + '/admin/organisation', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				name: organisationName,
			}),
		})
			.then(response => {
				if (!response.ok) {
					throw new Error(response.statusText);
				}
				return response.json();
			})
			.then((createdOrg: Organisation) => {
				console.log(createdOrg)
				setOrganisations((organisations: Organisation[]) => {
					organisations.push(createdOrg);
					return organisations;
				});
			})
			.catch(console.error)
			.finally(() => setShowNewOrganisationModal(false))
	}


	return <div id="organisation"
				className={"h-[calc(100vh-56px)] w-60 bg-white overflow-y-auto fixed border-r-2 border-gray-100"}>
		{showNewOrganisationModal &&
			<SimpleTextModalComponent
				label={"New organisation"}
				onSubmit={onNewOrganisation}
				onClose={() => setShowNewOrganisationModal(false)}
				placeholder={"Name"}/>
		}
		{content}
	</div>
}