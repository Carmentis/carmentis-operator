'use client';

import { useContext, useState } from 'react';
import { AdminDataContext, AdminState } from '@/app/admin/layout';
import { useParams } from 'next/navigation';
import User, { UserSearchResult } from '@/entities/user.entity';
import { Button } from '@material-tailwind/react';
import { SearchUserInputComponent } from '@/components/form/search-user-form';
import {
	fetchOrganisation,
	fetchUsersInOrganisation,
	useAffectOwner, UserInOrganisationResponse,
	useUserDeletion, useUserOrganisationInsertion,
} from '@/components/api.hook';
import SwitchForm from '@/components/form/switch.form';

interface Organisation {
	name: string,
	createdAt: Date,
	lastUpdateAt: Date,
	logoUrl: string,
	owner: User | null
}




function CardOwner(input: { owner : User | null, organisationId: number }) {
	const affectOwner = useAffectOwner();

	// the function to associate the current organisation with the chosen user
	function associateOwner( user: UserSearchResult ) {
		affectOwner( input.organisationId, user.publicKey, undefined )
	}

	// the head content for the current owner
	let content = <div id="currentOwner" className="flex flex-row justify-between mb-4">
		<i className={'bi bi-person'}></i>
		{ input.owner && <h1>{input.owner.firstname} {input.owner.lastname}</h1> }
		{ !input.owner && <h1>--</h1> }
	</div>;

	return <div className="card transition-all ease-in duration-100">
		{content}
		<SearchUserInputComponent
			formatUserSearchResult={(user: UserSearchResult) => {
				return <li
					className={'p-2 border-b-2 border-gray-100 cursor-pointer hover:bg-gray-100 '}>
					<p className={'font-bold'}>{user.firstname} {user.lastname}</p>
					<p className={'text-sm overflow-x-clip'}>{user.publicKey}</p>
				</li>;
			}}
			onSelectedUser={associateOwner} />
	</div>;
}






function ListOfUserInOrganisation( input :{ organisationId: number } ) {
	const { data, loading, error } = fetchUsersInOrganisation(input.organisationId);
	const deleteUser = useUserDeletion();
	const addExistingUserInOrganisation = useUserOrganisationInsertion();

	if (!data || loading) return <p>Chargement...</p>;
	if (error) return <p>Erreur : {error}</p>;






	function addUserInOrganisation( user: UserSearchResult ) {
		addExistingUserInOrganisation(input.organisationId, user.publicKey, undefined);
	}

	function removeUserFromOrganisation(userPublicKey: string) {
		deleteUser( input.organisationId, userPublicKey, undefined )
	}

	function updateUserAccessRights( user: UserSearchResult ) {
		console.log(user)
	}

	return <>
		<h1>Users</h1>
		<div className={'space-y-4'}>
			<div className="w-full">
				<div className="card space-y-2">
					<h1>Add user</h1>

					<SearchUserInputComponent
						formatUserSearchResult={(user: UserSearchResult) => {
							return <li
								className={'p-2 border-b-2 border-gray-100 cursor-pointer hover:bg-gray-100 '}>
								<p className={'font-bold'}>{user.firstname} {user.lastname}</p>
								<p className={'text-sm overflow-x-clip'}>{user.publicKey}</p>
							</li>;
						}}
						onSelectedUser={addUserInOrganisation} />

				</div>
			</div>

			<div className="w-full space-y-2">
				{
					data.map((user, index) => {
							const accessRight = user.accessRights[0];
							return <div key={index}
										className={'w-full flex flex-row justify-between items-center w-100 not:last:border-b-2 card'}>
								<div className="flex flex-col justify-center items-center w-24 mr-2">
									<div
										className={'bg-gray-100 rounded-full p-2 w-12 h-12 items-center justify-center text-center align-middle mb-4'}>
										<i className={'bi bi-person large-icon'}></i>
									</div>
									<span>{user.firstname} {user.lastname}</span>
								</div>

								<div className="setting flex space-x-2">
									<div className="flex flex-col space-y-2">
										<SwitchForm property="Administrator"
													value={accessRight.isAdmin}
													onChange={() => updateUserAccessRights(user)}
										/>
										<SwitchForm property="Can publish" value={accessRight.canPublish} onChange={() => updateUserAccessRights(user)} />
									</div>
									<div className="flex flex-col space-y-2">
										<SwitchForm property="Add user" value={accessRight.addUser} onChange={() => updateUserAccessRights(user)} />
										<SwitchForm property="Remove user" value={accessRight.removeUser} onChange={() => updateUserAccessRights(user)}/>
									</div>
									<div className="flex flex-col space-y-2">
										<SwitchForm property="Add application" value={accessRight.addApplication} onChange={() => updateUserAccessRights(user)}/>
										<SwitchForm property="Remove application"
													value={accessRight.deleteApplication}
													onChange={() => updateUserAccessRights(user)}
										/>
									</div>
								</div>

								<div className="flex flex-col space-y-2">
									<Button size={'sm'}
											onClick={() => removeUserFromOrganisation(user.publicKey)}>Remove</Button>
								</div>


							</div>;
						},
					)
				}
			</div>

		</div>
	</>

}


export default function OrganisationDetailsPage() {

	const { useAdminDataStore } = useContext<AdminState>(AdminDataContext);
	const organisations: { id: number, name: string }[] = useAdminDataStore((state) => state.organisations);

	// get the current organisation
	const params: { organisationId: string } = useParams();
	const organisationId = parseInt(params.organisationId);

	const { data, loading, error } = fetchOrganisation(organisationId);



	// render an empty page if the organisation is loading
	if (loading) {
		return <div>
			<h1>Loading...</h1>
		</div>
	}

	const organisation: Organisation = data;
	return <div className={"w-full p-8 space-y-12"}>
		<p className={"mb-8"}>Dashboard <i className={"bi bi-chevron-double-right"}></i> {organisation.name}</p>

		<div>
			<h1 className={"mb-4"}>Overview</h1>
			<div className="flex flex-row space-x-4">
				<div className="card w-1/3 rounded flex flex-row justify-between bg-green border-green text-white">
					<h1 className="card-title">Balance</h1>
					<p>0.00 CMTS</p>
				</div>
				<div className="card w-1/3 rounded flex flex-row justify-between">
					<h1 className="card-title">Costs</h1>
					<p>0.00 CMTS</p>
				</div>
				<div className="card w-1/3 rounded flex flex-row justify-between">
					<h1 className="card-title">Last update</h1>
					<p>{organisation.lastUpdateAt}</p>
				</div>
			</div>
		</div>

		<div className={"w-full flex flex-row space-x-4"}>
			<div className="w-1/3">
				<h1 className={'mb-4'}>Owner</h1>
				<CardOwner owner={organisation.owner} organisationId={organisationId}></CardOwner>
			</div>
			<div className={'w-2/3'}>
				<h1 className={'mb-4'}>Property</h1>
				<table className={'horizontal-editable-table'}>
					<tbody>

					<tr>
						<td>Created at</td>
						<td>{organisation.createdAt}</td>
					</tr>
					<tr>
						<td>Created by</td>
						<td>{organisation.creatorPublicKey}</td>
					</tr>
					<tr>
						<td>Organisation Name</td>
						<td>{organisation.name}</td>
					</tr>
					</tbody>
				</table>
			</div>
		</div>


		<ListOfUserInOrganisation organisationId={organisationId} />
	</div>
}