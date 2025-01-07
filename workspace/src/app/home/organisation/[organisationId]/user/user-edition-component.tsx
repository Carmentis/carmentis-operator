'use client';

import Skeleton from 'react-loading-skeleton';
import { Button, Card, CardBody } from '@material-tailwind/react';
import { DefaultUserIcon } from '@/components/icons/default-user.icon';
import { AccessRight, useFetchUserDetailsInOrganisation, useUpdateAccessRight } from '@/components/api.hook';
import SwitchForm from '@/components/form/switch.form';
import { useToast } from '@/app/layout';
import { useEffect, useState } from 'react';
import Avatar from 'boring-avatars';

export default function UserInOrganisationDetailsPage(
	input: { organisationId: number, userPublicKey: string, onRemove: (userPublicKey: string) => void }
) {
	const organisationId = input.organisationId;
	const userPublicKey = input.userPublicKey;
	const notify = useToast();
	const updateAccessRight = useUpdateAccessRight();
	const {data, isLoading, error, mutate} = useFetchUserDetailsInOrganisation(
		organisationId,
		userPublicKey
	)
	const [rights, setRights] = useState<AccessRight|undefined>(undefined);
	useEffect(() => {
		if (data) setRights(data.accessRights[0]);
	}, [data])


	function notifyUpdate() {
		notify.info('Access rights updated')
	}

	function toggleAdmin() {
		if ( !rights ) return;
		rights.isAdmin = !rights.isAdmin;
		rights.editUsers = rights.isAdmin;
		rights.editOracles = rights.isAdmin;
		rights.editApplications = rights.isAdmin;
		setRights(rights);
		updateAccessRight(organisationId, userPublicKey, rights, {
			onSuccess: () => {
				notifyUpdate();
				mutate()
			}
		})
	}

	function toggleEditUsers() {
		if ( !rights ) return;
		rights.editUsers = !rights.editUsers;
		updateAccessRight(organisationId, userPublicKey, rights, {
			onSuccess: () => {
				notifyUpdate();
				mutate()
			}
		})
	}

	function toggleEditApplications() {
		if ( !rights ) return;
		rights.editApplications = !rights.editApplications;
		updateAccessRight(organisationId, userPublicKey, rights, {
			onSuccess: () => {
				notifyUpdate();
				mutate()
			}
		})
	}

	function toggleEditOracles() {
		if ( !rights ) return;
		rights.editOracles = !rights.editOracles;
		updateAccessRight(organisationId, userPublicKey, rights, {
			onSuccess: () => {
				notifyUpdate();
				mutate()
			}
		})
	}






	// if the data is
	let content = <></>;
	if (!data || isLoading) {
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
					<Avatar name={`${user.firstname} ${user.lastname}`} variant={"bauhaus"} width={42} className={"mb-4 mr-4"}/>
					<h1>{user.firstname} {user.lastname}</h1>
				</div>
				<Button className={"h-10"} onClick={() => input.onRemove(user.publicKey)}>Remove</Button>
			</div>
			<div className="space-y-2">
				<h2>Access Rights</h2>
				<div className="setting flex space-x-2">
					<div className="flex flex-col space-y-2">
						<SwitchForm property="Administrator"
									value={accessRight.isAdmin}
									onChange={() => toggleAdmin()}
						/>
						<SwitchForm property="Edit oracles" value={accessRight.editOracles}
									onChange={() => toggleEditOracles()} />
					</div>
					<div className="flex flex-col space-y-2">
						<SwitchForm property="Edit user" value={accessRight.editUsers}
									onChange={() => toggleEditUsers()} />
					</div>
					<div className="flex flex-col space-y-2">
						<SwitchForm property="Edit application" value={accessRight.editApplications}
									onChange={() => toggleEditApplications()} />
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