'use client';

import { useParams } from 'next/navigation';
import Skeleton from 'react-loading-skeleton';
import { Button, Card, CardBody } from '@material-tailwind/react';
import DefaultUserIcon from '@/components/icons/default-user.icon';
import { fetchUserInOrganisationDetails } from '@/components/api.hook';
import SwitchForm from '@/components/form/switch.form';

export default function UserInOrganisationDetailsPage() {
	const params: {organisationId: number, userPublicKey: string} = useParams();
	const organisationId = params.organisationId;
	const userPublicKey = params.userPublicKey;

	// get the user details
	const  {data, loading, error} = fetchUserInOrganisationDetails(
		organisationId,
		userPublicKey
	);

	let content = <></>;
	if (!data || loading) {
		content = <Skeleton count={1} className={"h-5/12 w-full"}></Skeleton>;
	}

	if (error) {
		content = <>
			<h1>An error occured</h1>
			<p>{error}</p>
		</>
	}

	if (data) {
		const user = data;
		const accessRight = data.accessRights[0];

		content = <div className={"space-y-4"}>
			<div className="header flex justify-between border-b-2 border-gray-100">
				<div className="name flex items-center content-center">
					<DefaultUserIcon className={'mr-2'}></DefaultUserIcon>
					<h1>{user.firstname} {user.lastname}</h1>
				</div>
				<Button className={"h-10"}>Remove</Button>
			</div>
			<div className="space-y-2">
				<h2>Access Rights</h2>
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
						<SwitchForm property="Add user" value={accessRight.addUser}
									onChange={() => updateUserAccessRights(user)} />
						<SwitchForm property="Remove user" value={accessRight.removeUser}
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
			</div>
		</div>
	}

	return <Card className={`shadow transition-all relative left-0`}>
		<CardBody>
			{content}
		</CardBody>
	</Card>;
}