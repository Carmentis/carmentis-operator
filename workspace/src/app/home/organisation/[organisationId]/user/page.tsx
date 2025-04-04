'use client';

import {
	useFetchUsersInOrganisation,
	useUserOrganisationInsertion,
	useUserOrganisationRemoval,
} from '@/components/api.hook';
import { useState } from 'react';
import { UserSearchResult, UserSummary } from '@/entities/user.entity';
import Skeleton from 'react-loading-skeleton';
import { Dialog } from '@material-tailwind/react';
import { Box, Button, DialogActions, DialogContent, Typography } from '@mui/material';
import { SearchInputForm } from '@/components/form/search-input.form';
import { SearchUserInputComponent } from '@/components/form/search-user-form';
import { useToast } from '@/app/layout';
import { useOrganisationContext } from '@/contexts/organisation-store.context';
import { useModal } from 'react-modal-hook';
import TableOfUsers from '@/components/table/table-of-users';

function InsertExistingUserPanel(
	input: { onClick: (user: UserSearchResult) => void },
) {
	return <>
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
	</>
}




export default function UserPage() {

	const organisation = useOrganisationContext();
	const organisationId = organisation.id;
	const insertExistingUserInOrganisation = useUserOrganisationInsertion();
	const removeUserHook = useUserOrganisationRemoval();
	const usersInOrganisationResponse = useFetchUsersInOrganisation(organisationId);
	const [search, setSearch] = useState('');
	const notify = useToast();


	const [showAddExistingUserModal, hideAddExistingUserModal] = useModal(() => {
		return <Dialog open={true}>
			<DialogContent>
				<InsertExistingUserPanel onClick={user => {
					insertExistingUser(user);
					hideAddExistingUserModal()
				}} />
			</DialogContent>
			<DialogActions>
				<Button onClick={hideAddExistingUserModal}>Cancel</Button>
			</DialogActions>
		</Dialog>
	})

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
				notify.info(`User ${userPublicKey} removed from organisation`)
			},
			onError: notify.error
		})
	}

	if (!usersInOrganisationResponse.data || usersInOrganisationResponse.isLoading) {
		return <Skeleton count={3} />;
	}

	function match(user: UserSummary, search: string) {
		return search === '' ||
			user.publicKey.includes(search) ||
			user.firstname.includes(search) ||
			user.lastname.includes(search)
 	}

	let content = <Skeleton count={10}/>
	if (usersInOrganisationResponse.data) {
		const users = usersInOrganisationResponse.data;
		const shownUsers = users.filter(u => match(u, search));
		content = <TableOfUsers
			users={shownUsers}
			onClick={user => console.log(user)}
			onDelete={pk => removeUserFromOrganisation(pk)}
		/>
	}


	return (
		<>
			<Box display="flex" justifyContent="space-between">
				<Typography variant={"h5"} fontWeight="bold">Members</Typography>
				<Box display={"flex"} flexDirection={"row"} gap={2}>
					<SearchInputForm searchFilter={search} setSearchFilter={setSearch}/>
					<Button variant={"contained"} onClick={showAddExistingUserModal}>add user</Button>
				</Box>
			</Box>
			{content}
		</>
	);


}

