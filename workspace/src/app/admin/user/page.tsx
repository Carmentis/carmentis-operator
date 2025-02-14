'use client';
import { FormEvent, useState } from 'react';
import { UserSummary } from '@/entities/user.entity';
import DefaultCard from '@/components/default-card.component';
import { Button, Checkbox, Chip, Input, Typography } from '@material-tailwind/react';
import { useAdminListOfUsersApi, useUserCreation, useUserDeletion } from '@/components/api.hook';
import Skeleton from 'react-loading-skeleton';
import { useToast } from '@/app/layout';

/**
 * TABLE_HEADERS is an array of strings representing the column headers
 * for a table display. Each element corresponds to a specific attribute
 * or property to be displayed in the table, such as user details
 * or roles.
 *
 * Headers include:
 * - 'Public key': Represents a unique public identifier for an entity.
 * - 'Firstname': Represents the first name of an individual.
 * - 'Lastname': Represents the last name of an individual.
 * - 'Role': Represents the role or designation assigned to an individual.
 */
const TABLE_HEADERS = ['Public key', 'Firstname', 'Lastname', 'Role'];

/**
 * Renders a table with user data.
 *
 * @param {Object} props The properties passed to the Table component.
 * @param {UserSummary[]} props.users An array of user summaries to display in the table.
 * @return {JSX.Element} A JSX element representing the table.
 */
function Table({ users }: { users: UserSummary[] }) {
	return (
		<table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400 h-100">
			<thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
			<tr>
				{TABLE_HEADERS.map((header) => (
					<th key={header} scope="col" className="px-6 py-3">
						{header}
					</th>
				))}
			</tr>
			</thead>
			<tbody>
			{users.map((user) => (
				<TableRow key={user.publicKey} user={user} />
			))}
			</tbody>
		</table>
	);
}

/**
 * Represents a table row component displaying user information.
 *
 * @param {Object} props The properties passed to the component.
 * @param {UserSummary} props.user An object representing the user information to be displayed in the table row.
 * @return {JSX.Element} A JSX element representing a table row with user details.
 */
function TableRow({ user }: { user: UserSummary }) {
	return (
		<tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
			<td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
				{user.publicKey}
			</td>
			<td className="px-6 py-4">{user.firstname}</td>
			<td className="px-6 py-4">{user.lastname}</td>
			<td className="px-6 py-4">{user.isAdmin && <Typography>Super-Admin</Typography>}</td>
		</tr>
	);
}

/**
 * Component for adding a new user with their details such as public key, first name, last name, and admin privileges.
 *
 * @param {Object} props - The props object.
 * @param {Function} props.addUser - A function that adds a user with the provided user details.
 *
 * @return {JSX.Element} A form component to collect user details and submit them.
 */
function UserAddition({ addUser }: { addUser: (user: UserSummary) => void }) {
	const [formData, setFormData] = useState<UserSummary>({
		publicKey: '',
		firstname: '',
		lastname: '',
		isAdmin: false,
	});

	function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
		const { name, value, type, checked } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: type === 'checkbox' ? checked : value,
		}));
	}

	function handleUserAddition(event: FormEvent) {
		event.preventDefault();
		addUser(formData);
		setFormData({ publicKey: '', firstname: '', lastname: '', isAdmin: false });
	}

	return (
		<DefaultCard>
			<form className="space-y-2" onSubmit={handleUserAddition}>
				<Typography>
					<i className="bi bi-person-add mr-2"></i>Add a user
				</Typography>
				<p>Paste the public key of the user to allow the user to sign into the workspace.</p>
				<div className="flex flex-row space-x-2">
					<Input name="publicKey" value={formData.publicKey} onChange={handleInputChange}
						   label="Public key" />
					<Input name="firstname" value={formData.firstname} onChange={handleInputChange} label="Firstname" />
					<Input name="lastname" value={formData.lastname} onChange={handleInputChange} label="Lastname" />
					<Checkbox name="isAdmin" checked={formData.isAdmin} onChange={handleInputChange} label="Admin" />
					<Button type="submit">Add</Button>
				</div>
			</form>
		</DefaultCard>
	);
}

/**
 * Component for deleting a user based on a provided public key.
 *
 * @param {Object} params - The parameters for the UserDeletion component.
 * @param {function(string): void} params.removeUser - Function to remove a user by their public key.
 * @return {JSX.Element} A React component rendering a user deletion form.
 */
function UserDeletion({ removeUser }: { removeUser: (publicKey: string) => void }) {
	const [publicKey, setPublicKey] = useState('');

	function handleUserDeletion(event: FormEvent) {
		event.preventDefault();
		removeUser(publicKey);
		setPublicKey('');
	}

	return (
		<DefaultCard>
			<form className="w-100 mr-2 space-y-2 mb-4" onSubmit={handleUserDeletion}>
				<Typography>
					<i className="bi bi-person-dash mr-2"></i>Remove a user
				</Typography>
				<p>Paste the public key of the user to remove the user.</p>
				<div className="flex flex-row space-x-2">
					<Input
						type="text"
						value={publicKey}
						onChange={(e) => setPublicKey(e.target.value)}
						label="Public key"
						required
					/>
					<Button type="submit">Remove</Button>
				</div>
			</form>
		</DefaultCard>
	);
}

/**
 * Renders a component displaying a list of users inside a styled card layout.
 *
 * @param {Object} props - The props object.
 * @param {UserSummary[]} props.existingUsers - An array of user summaries to be displayed in the table.
 * @return {JSX.Element} A React component rendering the list of users within a card structure.
 */
function ListOfUsers({ existingUsers }: { existingUsers: UserSummary[] }) {
	return (
		<DefaultCard>
			<div className="card-title mb-2">
				<Typography>Users</Typography>
			</div>
			<div className="card-body flex flex-row w-100 space-x-4">
				<div className="w-full">
					<div className="relative overflow-x-auto">
						<Table users={existingUsers} />
					</div>
				</div>
			</div>
		</DefaultCard>
	);
}


function PageTitle() {
	return <Typography><i className={"bi bi-person mr-2"}></i>Users</Typography>
}

/**
 * Represents the UserPage component which provides functionality for displaying,
 * adding, and removing users. It integrates with the administration APIs for listing,
 * creation, and deletion of users and updates the UI accordingly.
 *
 * @return {JSX.Element} A React component that includes a list of users, user addition,
 *              user deletion capabilities, and handles loading states.
 */
export default function UserPage() {
	const { data, isLoading, mutate } = useAdminListOfUsersApi();
	const callUserInsertion = useUserCreation();
	const callUserDeletion = useUserDeletion();
	const notify = useToast();

	function addUser(user: UserSummary) {
		callUserInsertion(user.publicKey, user.firstname, user.lastname, user.isAdmin, {
			onSuccess: () => {
				notify.success('User created');
				mutate();
			},
			onError: (error) => notify.error(error),
		});
	}

	function removeUser(publicKey: string) {
		callUserDeletion(publicKey, {
			onSuccess: () => {
				notify.success('User deleted');
				mutate();
			},
			onError: (error) => notify.error(error),
		});
	}

	return (
		<div className="space-y-4 p-4">
			<PageTitle/>
			<UserAddition addUser={addUser} />
			<UserDeletion removeUser={removeUser} />
			{isLoading || !data ? <Skeleton /> : <ListOfUsers existingUsers={data} />}
		</div>
	);
}