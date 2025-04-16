'use client';

import { useState } from 'react';
import { UserSearchResult, UserSummary } from '@/entities/user.entity';
import Skeleton from 'react-loading-skeleton';
import { Dialog } from '@material-tailwind/react';
import { Box, Button, DialogActions, DialogContent, Typography } from '@mui/material';
import { SearchInputForm } from '@/components/form/search-input.form';
import { SearchUserInputComponent } from '@/components/form/search-user-form';
import { useToast } from '@/app/layout';
import { useOrganisation, useOrganisationContext } from '@/contexts/organisation-store.context';
import { useModal } from 'react-modal-hook';
import TableOfUsers from '@/components/table/table-of-users';
import {
	useAddExistingUserInOrganisationMutation,
	useGetUsersInOrganisationQuery,
	useRemoveUserInOrganisationMutation,
	UserEntityFragment,
} from '@/generated/graphql';

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

	const [removeUserFromOrganisation, {loading: isRemoving}] = useRemoveUserInOrganisationMutation();
	const [insertUserInOrganisation, {loading: isInserting}] = useAddExistingUserInOrganisationMutation();
	const organisation = useOrganisation();
	const organisationId = organisation.id;
	const {data, loading: isLoading, error, refetch: mutate} = useGetUsersInOrganisationQuery({
		variables: { id: organisationId },
	})

	const [search, setSearch] = useState('');
	const notify = useToast();


	const [showAddExistingUserModal, hideAddExistingUserModal] = useModal(() => {
		return <Dialog open={true}>
			<DialogContent>
				<InsertExistingUserPanel onClick={insertExistingUser} />
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
		if (isInserting) return
		insertUserInOrganisation({
			variables: { organisationId, userPublicKey: user.publicKey }
		}).then(result => {
			const {data, errors} = result;
			if (data) {
				notify.info("User added in organisation");
				mutate();
				hideAddExistingUserModal()
			} else if (errors) {
				notify.error(errors)
			}
		}).catch(notify.error);
	}


	if (!data) {
		return <Skeleton count={3} />;
	}

	function match(user: UserEntityFragment, search: string) {
		return search === '' ||
			user.publicKey.includes(search) ||
			user.firstname.includes(search) ||
			user.lastname.includes(search)
 	}

	let content = <Skeleton count={10}/>
	if (data) {
		const users = data.organisation.users;
		const shownUsers = users.filter(u => match(u, search));
		content = <TableOfUsers
			users={shownUsers}
			onClick={user => console.log(user)}
			onDelete={pk => {
				removeUserFromOrganisation({
					variables: { organisationId, userPublicKey: pk }
				}).then(result => {
					const {errors} = result
					if (errors) {
						notify.error(errors)
					} else {
						notify.info("User successfully removed")
						mutate()
					}
				}).catch(notify.error)
			}}
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

