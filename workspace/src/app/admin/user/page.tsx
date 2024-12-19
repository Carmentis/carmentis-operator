'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import User from '@/entities/user.entity';


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
				</tr>;
			})
		}
		</tbody>
	</table>;
}


export default function UserPage() {
	// to display the users
	const [existingAdmin, setExistingAdmin] = useState<User[]>([]);

	// to handle the addition form
	const addFormDefaultValue = {
		publicKey: '',
		firstname: '',
		lastname: '',
	};
	const [formValues, setFormValues] = useState(addFormDefaultValue);

	// to handle the deletion form
	const [deletedAdminPublicKey, setDeletedAdminPublicKey] = useState('');

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormValues({ ...formValues, [name]: value });
	};


	// load all admins
	useEffect(() => {
		fetch(process.env.NEXT_PUBLIC_WORKSPACE_API_BASE_URL +  '/admin/user',{})
			.then(res => res.json())
			.then(setExistingAdmin)
	}, [])


	/**
	 * Sends a request to add the administrator
	 * @param event
	 */
	function addAdministrator( event: FormEvent ) {
		event.preventDefault();

		fetch(process.env.NEXT_PUBLIC_WORKSPACE_API_BASE_URL  + "/admin/user", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(formValues),
		})
			.then(response => response.json())
			.then((createdAdmin: User) => {
				// display the created admin
				setExistingAdmin(admins => {
					console.log("Add the new admin", createdAdmin)
					admins.push(createdAdmin);
					return admins
				})

				// clear the input
				setFormValues(addFormDefaultValue)
			})
	}

	/**
	 * Sends a request to remove an administrator
	 * @param event
	 */
	function removeAdministrator( event: FormEvent ) {
		event.preventDefault();

		fetch(process.env.NEXT_PUBLIC_WORKSPACE_API_BASE_URL  + "/admin/user", {
			method: "DELETE",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				publicKey: deletedAdminPublicKey
			}),
		})
			.then(res => {
				if ( res.ok ) {
					// remove the deleted admin
					setExistingAdmin(admins => {
						return admins.filter(
							admin => admin.publicKey !== deletedAdminPublicKey
						)
					})

					// clear the input
					setDeletedAdminPublicKey('')
				}

			}).catch(console.error)
	}

	return <div className={"space-y-4 p-4"}>


		<form className="w-100 card  space-y-2" onSubmit={addAdministrator}>
			<h2><i className={"bi bi-person-add mr-2"}></i>Add a user</h2>
			<p>
				Paste the public key of the user to allow the user
				to sign into the workspace.
			</p>
			<div className="flex flex-row space-x-2">
				<input type="text" id="publicKey"
					   name={'publicKey'}
					   value={formValues.publicKey}
					   onChange={handleChange}
					   className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded  focus:ring-blue-500 focus:border-blue-500 w-full p-2.5"
					   placeholder="Public key" required  />
				<input type="text" id="firstname"
					   name="firstname"
					   value={formValues.firstname}
					   onChange={handleChange}
					   className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded  focus:ring-blue-500 focus:border-blue-500 w-full p-2.5"
					   placeholder="Firstname" required />
				<input type="text" id="lastname"
					   name="lastname"
					   value={formValues.lastname}
					   onChange={handleChange}
					   className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded  focus:ring-blue-500 focus:border-blue-500 w-full p-2.5"
					   placeholder="Lastname" required />
				<button
					type={"submit"}
					className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 border border-blue-700 rounded w-32">
					Add
				</button>
			</div>

		</form>

		<div className="card w-100">
			<form className="w-100 mr-2 space-y-2 mb-4" onSubmit={removeAdministrator}>
				<h2><i className={"bi bi-person-dash mr-2"}></i>Remove a user</h2>
				<p>
					Paste the public key of the user to remove the user.
				</p>
				<div className="flex flex-row space-x-2">
					<input type="text" id="publicKey"
						   value={deletedAdminPublicKey}
						   onChange={(e) => setDeletedAdminPublicKey(e.target.value)}
						   className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5"
						   placeholder="Public key" required />
					<button
						type={"submit"}
						className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 border border-red-700 rounded-lg w-32">
						Remove
					</button>
				</div>

			</form>
		</div>

		<div className="card w-100">
			<div className="card-title mb-2">
				<h1>Users</h1>
			</div>


			<div className="card-body flex flex-row w-100 space-x-4">
				<div className="w-full">

					<div className="relative overflow-x-auto">
						<Table users={existingAdmin} />
					</div>
				</div>

			</div>
		</div>

	</div>;
}