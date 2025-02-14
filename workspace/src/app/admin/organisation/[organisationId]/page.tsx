'use client';

import User, { AccessRight, UserSearchResult, UserSummary } from '@/entities/user.entity';
import { Button, Card, CardBody, Typography } from '@material-tailwind/react';
import { SearchUserInputComponent } from '@/components/form/search-user-form';
import {
	useFetchOrganisation, useFetchUserInOrganisation,
	useFetchUsersInOrganisation, useUpdateAccessRight,
	useUserOrganisationInsertion,
	useUserOrganisationRemoval,
} from '@/components/api.hook';
import SwitchForm from '@/components/form/switch.form';
import WelcomeCards from '@/components/welcome-cards.component';
import Avatar from 'boring-avatars';
import { Organisation } from '@/entities/organisation.entity';
import FullPageLoadingComponent from '@/components/full-page-loading.component';
import { useParams } from 'next/navigation';
import { useToast } from '@/app/layout';
import Skeleton from 'react-loading-skeleton';
import { useEffect, useState } from 'react';
import OrganisationAccountBalance from '@/components/organisation-account-balance.component';

function OrganisationUsers({ organisationId }: { organisationId: number }) {
	const { data, isLoading, mutate } = useFetchUsersInOrganisation(organisationId);
	const removeUser = useUserOrganisationRemoval();
	const addExistingUser = useUserOrganisationInsertion();
	const notify = useToast();

	if (!data || isLoading) return <FullPageLoadingComponent />;

	const USER_LIST_ITEM_CLASS = 'p-2 border-b-2 border-gray-100 cursor-pointer hover:bg-gray-100';

	function addUserInOrganisation(user: UserSearchResult) {
		addExistingUser(organisationId, user.publicKey, {
			onSuccess: () => notify.success('User added'),
			onError: notify.error,
			onEnd: mutate
		});
	}

	function removeUserFromOrganisation(userPublicKey: string) {
		removeUser(organisationId, userPublicKey, {
			onSuccess: () => notify.success('User removed'),
			onError: notify.error,
			onEnd: mutate
		});
	}


	function formatUserSearchResult(user: UserSearchResult) {
		return (
			<li className={USER_LIST_ITEM_CLASS}>
				<p className="font-bold">{user.firstname} {user.lastname}</p>
				<p className="text-sm overflow-x-clip">{user.publicKey}</p>
			</li>
		);
	}

	return (
		<Card>
			<CardBody>
				<div className="mb-2">
					<Typography>Add user</Typography>
					<SearchUserInputComponent
						formatUserSearchResult={formatUserSearchResult}
						onSelectedUser={addUserInOrganisation}
					/>
				</div>
				<div className="space-y-2">
					{data.map((userSummary, index) => <UserEditionCard
						organisationId={organisationId}
						userSummary={userSummary}
						key={userSummary.publicKey}
						userRemovalClicked={() => removeUserFromOrganisation(
							userSummary.publicKey
						)}
					/>)}
				</div>
			</CardBody>
		</Card>
	);
}


function UserEditionCard(input: {
	organisationId: number,
	userSummary: UserSummary,
	userRemovalClicked: () => void
}) {
	const updateRights = useUpdateAccessRight();
	const notify = useToast();

	// fetch the data
	const {data, isLoading, mutate} = useFetchUserInOrganisation(
		input.organisationId,
		input.userSummary.publicKey
	);
	const user = data;

	const [accessRights, setAccessRights] = useState<AccessRight|undefined>(undefined);

	useEffect(() => {
		setAccessRights(
			user?.accessRights[0]
		)
	}, [user]);

	// loading page
	if (!user || !accessRights || isLoading) return <Skeleton height={60}/>



	function updateUserAccessRights(accessRights: AccessRight) {
		updateRights(input.organisationId, input.userSummary.publicKey, accessRights, {
			onSuccess: () => {
				notify.success('User rights updated');
				setAccessRights(accessRights)
			},
			onError: notify.error,
			onEnd: mutate
		})
	}

	const accessRight = user.accessRights[0];
	return (
		<Card
			className="w-full flex flex-row justify-between items-center not:last:border-b-2"
		>
			<CardBody className="w-full flex flex-row justify-between p-4">
				<div className="flex flex-row justify-center items-center">
					<Avatar width={30} variant={"beam"} name={user.publicKey} className="mr-2" />
					<span>{user.firstname} {user.lastname}</span>
				</div>
				<div className="setting flex space-x-2">
					<div className="flex flex-col space-y-2">
						<SwitchForm
							property="Administrator"
							value={accessRight.isAdmin}
							onChange={checked => {
								updateUserAccessRights({
									...accessRights,
									isAdmin: checked
								})
							}}
						/>
					</div>
					<div className="flex flex-col space-y-2">
						<SwitchForm
							property="Edit applications"
							value={accessRight.editApplications}
							onChange={checked => {
								updateUserAccessRights({
									...accessRights,
									editApplications: checked
								})
							}}
						/>
					</div>
					<div className="flex flex-col space-y-2">
						<SwitchForm
							property="Edit users"
							value={accessRight.editUsers}
							onChange={checked => {
								updateUserAccessRights({
									...accessRights,
									editUsers: checked
								})
							}}
						/>
					</div>
					<div className="flex flex-col space-y-2">
						<SwitchForm
							property="Edit oracles"
							value={accessRight.editOracles}
							onChange={checked => {
								updateUserAccessRights({
									...accessRights,
									editOracles: checked
								})
							}}
						/>
					</div>
				</div>
				<div className="flex flex-col space-y-2">
					<Button
						size="sm"
						onClick={input.userRemovalClicked}>
						Remove
					</Button>
				</div>
			</CardBody>
		</Card>
	);
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
					<td>{new Date(organisation.createdAt).toLocaleString()}</td>
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
	const params = useParams();
	const organisationId = parseInt(params.organisationId as string);
	const {data, isLoading} = useFetchOrganisation(organisationId)
	const organisation = data;

	if (!organisation || isLoading) return <FullPageLoadingComponent/>

	// welcome data
	const welcomeData = [
		{ icon: 'bi-currency-dollar', title: 'Balance', value: <OrganisationAccountBalance organisation={organisation}/> },
	];


	return <div className={'h-full flex flex-col space-y-4'}>
		<WelcomeCards items={welcomeData} />
		<OrganisationProperties organisation={organisation} />
		<OrganisationUsers organisationId={organisationId} />
	</div>;
}