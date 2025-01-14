'use client';

import { useParams } from 'next/navigation';
import User, { UserSearchResult } from '@/entities/user.entity';
import { Button, Card, CardBody, Typography } from '@material-tailwind/react';
import { SearchUserInputComponent } from '@/components/form/search-user-form';
import {
	fetchOrganisation,
	fetchUsersInOrganisation,
	useUserOrganisationInsertion, useUserOrganisationRemoval,
} from '@/components/api.hook';
import SwitchForm from '@/components/form/switch.form';
import WelcomeCards from '@/components/welcome-cards.component';
import Avatar from 'boring-avatars';
import Skeleton from 'react-loading-skeleton';

interface Organisation {
	name: string,
	createdAt: Date,
	lastUpdateAt: Date,
	logoUrl: string,
	owner: User | null
}


function OrganisationUsers(input: { organisationId: number }) {
	const { data, loading, error } = fetchUsersInOrganisation(input.organisationId);
	const deleteUser = useUserOrganisationRemoval();
	const addExistingUserInOrganisation = useUserOrganisationInsertion();

	if (!data || loading) return <p>Chargement...</p>;


	function addUserInOrganisation(user: UserSearchResult) {
		addExistingUserInOrganisation(input.organisationId, user.publicKey, undefined);
	}

	function removeUserFromOrganisation(userPublicKey: string) {
		deleteUser(input.organisationId, userPublicKey, undefined);
	}

	function updateUserAccessRights(user: UserSearchResult) {
		console.log(user);
	}

	return <Card>
		<CardBody>
			<div className={'mb-2'}>
				<Typography>Add user</Typography>
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
			<div className={'space-y-2'}>
				{
					data.map((user, index) => {
							const accessRight = user.accessRights[0];
							return <Card key={index}
										 className={'w-full flex flex-row justify-between items-center w-100 not:last:border-b-2'}>
								<CardBody className={'w-full flex flex-row justify-between p-4'}>
									<div className="flex flex-row justify-center items-center">
										<Avatar width={30} name={`${user.firstname} ${user.lastname}`} className={'mr-2'} />
										<span>{user.firstname} {user.lastname}</span>
									</div>

									<div className="setting flex space-x-2">
										<div className="flex flex-col space-y-2">
											<SwitchForm property="Administrator"
														value={accessRight.isAdmin}
														onChange={() => updateUserAccessRights(user)}
											/>
											<SwitchForm property="Can publish" value={accessRight.canPublish}
														onChange={() => updateUserAccessRights(user)} />
										</div>
										<div className="flex flex-col space-y-2">
											<SwitchForm property="Edit users" value={accessRight.editUsers}
														onChange={() => updateUserAccessRights(user)} />
										</div>
										<div className="flex flex-col space-y-2">
											<SwitchForm property="Add application" value={accessRight.addApplication}
														onChange={() => updateUserAccessRights(user)} />
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
								</CardBody>


							</Card>;
						},
					)
				}
			</div>


		</CardBody>
	</Card>;

}

function OrganisationProperties(
	{ organisation }: { organisation: Organisation },
) {
	return <Card className={'w-full'}>
		<CardBody>
			<h1 className={'mb-4'}>Property</h1>
			<table>
				<tbody>
				<tr>
					<td>Created at</td>
					<td>{organisation.createdAt}</td>
				</tr>
				<tr>
					<td>Organisation Name</td>
					<td>{organisation.name}</td>
				</tr>
				</tbody>
			</table>
		</CardBody>
	</Card>;
}


export default function OrganisationDetailsPage() {

	// get the current organisation
	const params: { organisationId: string } = useParams();
	const organisationId = parseInt(params.organisationId);

	const { data, isLoading, mutate } = fetchOrganisation(organisationId);


	// render an empty page if the organisation is loading
	if (isLoading || !data) {
		return <Skeleton className={"h-full"} />;
	}


	const organisation = data;
	// welcome data
	const welcomeData = [
		{ icon: 'bi-currency-dollar', title: 'Balance', value: organisation.balance.toString() + ' CMTS' },
	];


	return <div className={'h-full flex flex-col space-y-4'}>
		<WelcomeCards items={welcomeData} />
		<OrganisationProperties organisation={organisation} />
		<OrganisationUsers organisationId={organisationId} />
	</div>;
}