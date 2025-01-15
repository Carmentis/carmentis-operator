'use client';

import { useParams } from 'next/navigation';
import {
	useFetchUsersInOrganisation,
	useUserCreation,
	useUserOrganisationInsertion,
	useUserOrganisationRemoval,
} from '@/components/api.hook';
import { FormEvent, useState } from 'react';
import { UserSearchResult, UserSummary } from '@/entities/user.entity';
import Skeleton from 'react-loading-skeleton';
import { Button, Card, CardBody, Input, Typography } from '@material-tailwind/react';
import { SearchInputForm } from '@/components/form/search-input.form';
import { SearchUserInputComponent } from '@/components/form/search-user-form';
import { useToast } from '@/app/layout';
import UserInOrganisationDetailsPage from '@/app/home/organisation/[organisationId]/user/user-edition-component';
import Avatar from 'boring-avatars';
import { useOrganisationContext } from '@/contexts/organisation-store.context';


function UserHorizontalCard(input: { user: UserSearchResult, onClick: () => void, className?: string }) {
	const user = input.user;
	return <Card
		onClick={() => input.onClick()}
		className={`w-full flex flex-row justify-between items-center w-100 hover:shadow-xl transition-shadow cursor-pointer ${input.className}`}>
		<CardBody className="flex flex-col justify-center items-center w-52 ">

			<Avatar name={`${user.firstname} ${user.lastname}`} variant={"bauhaus"} width={42} className={"mb-4"}/>
			<span>{user.firstname} {user.lastname}</span>

		</CardBody>
	</Card>

}


function InsertExistingUserPanel(
	input: { onClick: (user: UserSearchResult) => void },
) {
	return <Card className={`shadow transition-all hover:shadow-xl relative left-0`} title={"Search user"}>
		<CardBody>
			<h1 className={"mb-4"}>Add existing user</h1>
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
	</Card>
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


	const params: { organisationId: string } = useParams();
	const organisationId = parseInt(params.organisationId);
	const insertExistingUserInOrganisation = useUserOrganisationInsertion();
	const removeUserHook = useUserOrganisationRemoval();

	const { data, isLoading, mutate } = useFetchUsersInOrganisation(organisationId);
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
				mutate()
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
				mutate();
				setChosenUserPublicKey(undefined)
				notify.info(`User ${userPublicKey} removed from organisation`)
			},
			onError: notify.error
		})
	}

	if (!data || isLoading) {
		return <Skeleton count={3} />;
	}




	return <>
		<div className="w-full h-full flex flex-row space-x-4">
			<div id="list-users" className={"w-8/12"}>
				<Card className={"mb-4"}>
					<CardBody>
						<Typography variant="h5" color="blue-gray" className="mb-2">
							Search user in organisation
						</Typography>
						<SearchInputForm searchFilter={search} setSearchFilter={setSearch}/>
					</CardBody>
				</Card>
				<div className="flex flex-wrap gap-4">
					{
						data
							.filter((user) => search === "" || user.firstname.toLowerCase().includes(search.toLowerCase()))
							.map(
								(user: UserSearchResult, index: number) =>
									<div key={index}>
										<UserHorizontalCard
											onClick={() => setChosenUserPublicKey(user.publicKey)}
											className={ user.publicKey === chosenUserPublicKey ? 'shadow-xl bg-green-100' : '' }
											user={user} />
									</div>
							)
					}
				</div>
			</div>

			<div className="w-4/12 space-y-4">
				<InsertNewUserPanel onUserAdded={() => mutate()}/>
				<InsertExistingUserPanel onClick={insertExistingUser} />
				{
					chosenUserPublicKey &&
					<UserInOrganisationDetailsPage
						key={chosenUserPublicKey}
						onRemove={removeUserFromOrganisation}
						organisationId={organisationId}
						userPublicKey={chosenUserPublicKey}
					/>
				}
			</div>
		</div>
	</>
		;
}
