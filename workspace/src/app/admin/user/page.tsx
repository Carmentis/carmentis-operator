'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import User from '@/entities/user.entity';
import DefaultCard from '@/components/default-card.component';
import { Button, Checkbox, Chip, Input, Typography } from '@material-tailwind/react';
import { useAdminListOfUsersApi, useUserCreation, useUserDeletion } from '@/components/api.hook';
import Skeleton from 'react-loading-skeleton';
import { useToast } from '@/app/layout';


function Table(input : {users: User[]}) {
	return <table className="w-full  text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400 h-100  ">
		<thead
			className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
		<tr>
			<th scope="col" className="px-6 py-3">
				Public key
			</th>
			<th scope="col" className="px-6 py-3">
				Firstname
			</th>
			<th scope="col" className="px-6 py-3">
				Lastname
			</th>
			<th scope="col" className="px-6 py-3">
				Role
			</th>
		</tr>
		</thead>
		<tbody>
		{
			input.users.map((user, index) => {
				return <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700" key={index}>
					<td scope="row"
						className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
						{user.publicKey}
					</td>
					<td className="px-6 py-4">
						{user.firstname}
					</td>
					<td className="px-6 py-4">
						{user.lastname}
					</td>
					<td className="px-6 py-4">
						{
							user.isAdmin && <Chip value={'admin'}/>
						}
					</td>
				</tr>;
			})
		}
		</tbody>
	</table>;
}


function UserAddition(
	input: { addUser: (pk: string, firstname: string, lastname: string, isAdmin: boolean) => void }
) {
	const [publicKey, setPublicKey] = useState('');
	const [firstname, setFirstname] = useState('');
	const [lastname, setLastname] = useState('');
	const [isAdmin, setIsAdmin] = useState(false);

	function hanldeUserAddition(event: FormEvent) {
		event.preventDefault();
		input.addUser(publicKey, firstname, lastname, isAdmin);
		setPublicKey('');
		setFirstname('');
		setLastname('');
		setIsAdmin(false);
	}

	return <DefaultCard>
		<form className="space-y-2" onSubmit={hanldeUserAddition}>
			<Typography><i className={'bi bi-person-add mr-2'}></i>Add a user</Typography>
			<p>
				Paste the public key of the user to allow the user
				to sign into the workspace.
			</p>
			<div className="flex flex-row space-x-2">
				<Input
					   value={publicKey}
					   onChange={e => setPublicKey(e.target.value)}
					   label="Public key" />
				<Input
					   value={firstname}
					   onChange={e => setFirstname(e.target.value)}
					   label="Firstname"  />
				<Input
					   value={lastname}
					   onChange={e => setLastname(e.target.value)}
					   label="Lastname" />
				<Checkbox
					   checked={isAdmin}
					   onChange={e => setIsAdmin(e.target.checked)}
					   label="Admin" />
				<Button type={'submit'}>Add</Button>
			</div>
		</form>
	</DefaultCard>
}


function UserDeletion(
	input: { removeUser: (publicKey: string) => void }
) {
	const [deletedAdminPublicKey, setDeletedAdminPublicKey] = useState('');

	function handleUserDeletion(event: FormEvent) {
		event.preventDefault();
		const pk = deletedAdminPublicKey;
		setDeletedAdminPublicKey('');
		input.removeUser(pk);
	}
	return <DefaultCard>
		<form className="w-100 mr-2 space-y-2 mb-4" onSubmit={handleUserDeletion}>
			<Typography><i className={'bi bi-person-dash mr-2'}></i>Remove a user</Typography>
			<p>
				Paste the public key of the user to remove the user.
			</p>
			<div className="flex flex-row space-x-2">
				<Input type="text"
					   value={deletedAdminPublicKey}
					   onChange={(e) => setDeletedAdminPublicKey(e.target.value)}
					   label="Public key" required />
				<Button type={'submit'}>Remove</Button>
			</div>

		</form>
	</DefaultCard>;
}


function ListOfUsers(
	input: {
		existingUsers: User[]
	}
) {
	return <DefaultCard>
		<div className="card-title mb-2">
			<Typography>Users</Typography>
		</div>


		<div className="card-body flex flex-row w-100 space-x-4">
			<div className="w-full">

				<div className="relative overflow-x-auto">
					<Table users={input.existingUsers} />
				</div>
			</div>

		</div>
	</DefaultCard>
}

export default function UserPage() {


	const {data, isLoading, mutate} = useAdminListOfUsersApi();
	const callUserInsertion = useUserCreation();
	const callUserDeletion = useUserDeletion();
	const notify = useToast();


	function addUser(pk: string, firstname: string, lastname: string, isAdmin: boolean) {
		callUserInsertion(pk, firstname, lastname, isAdmin, {
			onSuccess: () => {
				notify.success("User created");
				mutate()
			},
			onError: (error) => notify.error(error)
		})
	}


	function removeUser( pk: string ) {
		callUserDeletion(pk, {
			onSuccess: () => {
				notify.success("User deleted");
				mutate();
			},
			onError: (error) => notify.error(error)
		})
	}



	return <div className={"space-y-4 p-4"}>
		<UserAddition addUser={addUser}/>
		<UserDeletion removeUser={removeUser}/>
		{
			isLoading || !data ?
				<Skeleton/> : <ListOfUsers existingUsers={data}/>
		}
	</div>;
}