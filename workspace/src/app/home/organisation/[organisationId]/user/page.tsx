'use client';

import {
	useAuthUserAccessRightInOrganisation, useCountUserInOrganisation, useFetchUserInOrganisation,
	useFetchUsersInOrganisation, useUpdateAccessRight, useUserAccessRightInOrganisation,
	useUserCreation, useUserDeletion,
	useUserOrganisationInsertion,
	useUserOrganisationRemoval,
} from '@/components/api.hook';
import { FormEvent, useState } from 'react';
import { UserSearchResult, UserSummary } from '@/entities/user.entity';
import Skeleton from 'react-loading-skeleton';
import { Button, Card, CardBody, IconButton, Input, Typography } from '@material-tailwind/react';
import { SearchInputForm } from '@/components/form/search-input.form';
import { SearchUserInputComponent } from '@/components/form/search-user-form';
import { useToast } from '@/app/layout';
import Avatar from 'boring-avatars';
import { useOrganisationContext } from '@/contexts/organisation-store.context';
import SwitchForm from '@/components/form/switch.form';


function UserHorizontalCard(input: { user: UserSearchResult, onClick: () => void, className?: string, onRemove: (publicKey: string) => void }) {
	const user = input.user;
	const notify = useToast();
	const updateAccessRight = useUpdateAccessRight();
	const organisation = useOrganisationContext();
	const organisationId = organisation.id;
	const userPublicKey = user.publicKey;
	const accessRightsResponse = useUserAccessRightInOrganisation(userPublicKey, organisationId)
	const mutate = () => accessRightsResponse.mutate();

	if (!accessRightsResponse.data || accessRightsResponse.isLoading) return <Skeleton/>
	const rights = accessRightsResponse.data;

	function notifyUpdate() {
		notify.info('Access rights updated')
	}

	const cb = {
		onSuccess: notifyUpdate,
		onError: notify.error,
		onEnd: mutate
	}

	function toggleAdmin() {
		if ( !rights ) return;
		rights.isAdmin = !rights.isAdmin
		updateAccessRight(organisationId, userPublicKey, rights, cb)
	}

	function toggleEditUsers() {
		if ( !rights ) return;
		rights.editUsers = !rights.editUsers;

		updateAccessRight(organisationId, userPublicKey, rights, cb)
	}

	function toggleEditApplications() {
		if ( !rights ) return;
		rights.editApplications = !rights.editApplications;

		updateAccessRight(organisationId, userPublicKey, rights, cb)
	}

	function toggleEditOracles() {
		if ( !rights ) return;
		rights.editOracles = !rights.editOracles;

		updateAccessRight(organisationId, userPublicKey, rights, cb)
	}



	return <Card
		onClick={() => input.onClick()}
		className={`w-full flex flex-row justify-between items-center hover:shadow-xl transition-shadow cursor-pointer`}>
		<CardBody className="flex flex-row items-center  w-full">
			<div className="w-36 flex flex-1 flex-col items-center justify-start">
				<Avatar name={user.publicKey} variant={"beam"} width={42} className={"mb-4"}/>
				<span>{user.firstname} {user.lastname}</span>
			</div>
			<div className="w-auto flex-2 justify-center items-center">
				<div className="flex space-x-2">
					<div className="flex flex-col space-y-2">
						<SwitchForm property="Administrator"
									value={rights.isAdmin}
									onChange={() => toggleAdmin()}
						/>
						<SwitchForm property="Edit oracles" value={rights.editOracles}
									onChange={() => toggleEditOracles()} />
					</div>
					<div className="flex flex-col space-y-2">
						<SwitchForm property="Edit user" value={rights.editUsers}
									onChange={() => toggleEditUsers()} />
					</div>
					<div className="flex flex-col space-y-2">
						<SwitchForm property="Edit application" value={rights.editApplications}
									onChange={() => toggleEditApplications()} />
					</div>
				</div>
			</div>
			<div className="flex flex-1 justify-end items-center">
					<IconButton onClick={() => input.onRemove(userPublicKey)}>
						<i className={"bi bi-trash-fill"}/>
					</IconButton>
			</div>
		</CardBody>
	</Card>

}


function InsertExistingUserPanel(
	input: { onClick: (user: UserSearchResult) => void },
) {
	return <Card className={`shadow transition-all hover:shadow-xl relative left-0`} title={'Search user'}>
		<CardBody>
			<h1 className={'mb-4'}>Add existing user</h1>
			<SearchUserInputComponent
				formatUserSearchResult={(user: UserSearchResult) => {
					return <li
						className={'p-2 border-b-2 border-gray-100 cursor-pointer hover:bg-gray-100 '}>
						<p className={'font-bold'}>{user.firstname} {user.lastname}</p>
						<p className={'text-sm overflow-x-clip'}>{user.publicKey}</p>
					</li>;
				}}
				onSelectedUser={(user) => input.onClick(user)} />
		</CardBody>
	</Card>;
}


function InsertNewUserPanel(
	input: { onUserAdded: (user: UserSummary) => void },
) {

	const notify = useToast();
	const createUserHook = useUserCreation();
	const organisation = useOrganisationContext();
	const organisationId = organisation.id;
	const addUserInOrganisationHook = useUserOrganisationInsertion();
	const [publicKey, setPublicKey] = useState<string>();
	const [firstname, setFirstname] = useState<string>();
	const [lastname, setLastname] = useState<string>();



	function createUser(event: FormEvent) {
		event.preventDefault()
		if ( !publicKey || !firstname || !lastname ) {
			notify.error('Cannot add user: Missing fields');
		} else {
			createUserHook(publicKey, firstname, lastname, false, {
				onSuccessData: addCreatedUsedInOrganisation,
				onError: notify.error,
				onEnd: () => {
					setPublicKey('');
					setFirstname('');
					setLastname('')
				}
			})
		}
	}


	function addCreatedUsedInOrganisation( user: UserSummary ) {
		addUserInOrganisationHook(organisationId, user.publicKey, {
			onSuccess: () => {
				notify.info(`User ${user.publicKey} created and added successfully`)
				input.onUserAdded(user)
			},
		})
	}

	return <Card className={`shadow transition-all hover:shadow-xl relative left-0`} >
		<CardBody>
			<h1 className={"mb-4"}>Create user</h1>
			<form className={"flex flex-col space-y-4"} onSubmit={createUser}>
				<Input value={publicKey} onChange={e => setPublicKey(e.target.value)}  label={"Public key"}/>
				<Input value={firstname} onChange={e => setFirstname(e.target.value)}  label={"Firstname"}/>
				<Input value={lastname}  onChange={e => setLastname(e.target.value)} label={"Lastname"}/>
				<Button type={"submit"}>Create user</Button>
			</form>
		</CardBody>
	</Card>
}

export default function UserPage() {

	const organisation = useOrganisationContext();
	const organisationId = organisation.id;
	const insertExistingUserInOrganisation = useUserOrganisationInsertion();
	const removeUserHook = useUserOrganisationRemoval();
	const accessRightResponse = useAuthUserAccessRightInOrganisation(organisationId)
	const usersInOrganisationResponse = useFetchUsersInOrganisation(organisationId);
	const [search, setSearch] = useState('');
	const notify = useToast();
	const [chosenUserPublicKey, setChosenUserPublicKey] = useState<string|undefined>(undefined);




	/**
	 * Handles the user insertion in which a user is selected to be inserted into the application
	 * @param user
	 */
	function insertExistingUser(user: UserSearchResult) {
		insertExistingUserInOrganisation(organisationId, user.publicKey, {
			onSuccessData: (user) => {
				notify.info(`User "${user.firstname} ${user.lastname}" added successfully.`);
				usersInOrganisationResponse.mutate()
			},
			onError: (error) => {
				notify.error(error)
			},
			onEnd: () => {
				setSearch('')
			}
		});
	}


	function removeUserFromOrganisation(userPublicKey: string) {
		removeUserHook(organisationId, userPublicKey, {
			onSuccess: () => {
				usersInOrganisationResponse.mutate();
				setChosenUserPublicKey(undefined)
				notify.info(`User ${userPublicKey} removed from organisation`)
			},
			onError: notify.error
		})
	}

	if (!usersInOrganisationResponse.data || usersInOrganisationResponse.isLoading) {
		return <Skeleton count={3} />;
	}

	if (!accessRightResponse.data || accessRightResponse.isLoading) {
		return <Skeleton count={3} />;
	}


	// if the currently connected user is allowed to edit the current users, show the edition panel
	let usersInOrganisationEditionPanels = <></>;
	if (accessRightResponse.data.editUsers) {
		usersInOrganisationEditionPanels = <>
			<InsertNewUserPanel onUserAdded={() => usersInOrganisationResponse.mutate()} />
			<InsertExistingUserPanel onClick={insertExistingUser} />
		</>;
	}

	return <>
		<div className="w-full h-full flex flex-row space-x-4">
			<div id="list-users" className={'w-8/12'}>
				<Card className={'mb-4'}>
					<CardBody>
						<Typography variant="h5" color="blue-gray" className="mb-2">
							Search user in organisation
						</Typography>
						<SearchInputForm searchFilter={search} setSearchFilter={setSearch} />
					</CardBody>
				</Card>
				<div className="flex flex-wrap gap-4">
					{
						usersInOrganisationResponse.data
							.filter((user) => search === "" || user.firstname.toLowerCase().includes(search.toLowerCase()))
							.map(
								(user: UserSearchResult, index: number) =>
									<UserHorizontalCard
										key={index}
										onRemove={removeUserFromOrganisation}
										onClick={() => setChosenUserPublicKey(user.publicKey)}
										className={ user.publicKey === chosenUserPublicKey ? 'shadow-xl bg-green-100' : '' }
										user={user} />
							)
					}
				</div>
			</div>
			<div className="w-4/12 space-y-4">
				{usersInOrganisationEditionPanels}
			</div>

		</div>
	</>
		;
}
