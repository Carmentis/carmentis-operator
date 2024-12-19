'use client';

import { useParams } from 'next/navigation';
import { fetchUsersInOrganisation } from '@/components/api.hook';
import { useState } from 'react';
import { UserSearchResult } from '@/entities/user.entity';
import Skeleton from 'react-loading-skeleton';
import { Button, Card, CardBody, Typography } from '@material-tailwind/react';
import { SearchInputForm } from '@/components/form/search-input.form';
import DefaultUserIcon from '@/components/icons/default-user.icon';
import { SearchUserInputComponent } from '@/components/form/search-user-form';
import Link from 'next/link';



function UserHorizontalCard(input: { user: UserSearchResult, onClick: () => void, className?: string }) {
	const user = input.user;
	return <Card
		onClick={input.onClick}
		className={`w-full flex flex-row justify-between items-center w-100 hover:shadow-xl transition-shadow cursor-pointer ${input.className}`}>
		<CardBody>
			<div className="flex flex-col justify-center items-center w-24 ">
				<DefaultUserIcon></DefaultUserIcon>
				<span>{user.firstname} {user.lastname}</span>
			</div>
		</CardBody>
	</Card>

}


function SearchUserPanel() {
	return <Card className={`shadow transition-all hover:shadow-xl relative left-full left-0`} title={"Search user"}>
		<CardBody>
			<h1 className={"mb-4"}>Search user</h1>
			<SearchUserInputComponent
				formatUserSearchResult={(user: UserSearchResult) => {
					return <li
						className={'p-2 border-b-2 border-gray-100 cursor-pointer hover:bg-gray-100 '}>
						<p className={'font-bold'}>{user.firstname} {user.lastname}</p>
						<p className={'text-sm overflow-x-clip'}>{user.publicKey}</p>
					</li>;
				}}
				onSelectedUser={() => {}} />
		</CardBody>
	</Card>
}

export default function RootLayout({
									   children,
								   }: Readonly<{
	children: React.ReactNode;
}>) {

	const params: { organisationId: string } = useParams();
	const organisationId = params.organisationId;


	const { data, loading, error } = fetchUsersInOrganisation(parseInt(params.organisationId));
	const [showSearch, setShowSearch] = useState<boolean>(false);
	const [search, setSearch] = useState('');

	function enableSearch() {
		setShowSearch(true);
	}

	function selectUser(user: UserSearchResult) {
		setShowSearch(false);
	}

	if (!data || loading) {
		return <Skeleton count={3} />;
	}


	let panel = <></>;
	if (showSearch) {
		panel = <SearchUserPanel />;
	} else {
		panel = children;
	}


	return <>
		<div className="mb-2">
			<Button onClick={enableSearch}>Add user</Button>
		</div>
		<div className="w-full h-full flex flex-row space-x-4">
			<div id="list-users" className={"w-8/12 h-full space-y-12"}>
				<Card className={"mb-10"}>
					<CardBody>
						<Typography variant="h5" color="blue-gray" className="mb-2">
							Search user in organisation
						</Typography>
						<SearchInputForm searchFilter={search} setSearchFilter={setSearch}/>
					</CardBody>
				</Card>
				{
					data
						.filter((user) => search === "" || user.firstname.toLowerCase().includes(search.toLowerCase()))
						.map(
							(user: UserSearchResult, index: number) =>
								<Link href={`/home/organisation/${organisationId}/user/${user.publicKey}`}
									  className={"mb-10"}
									  key={index}>
									<UserHorizontalCard
										onClick={() => selectUser(user)}
										className={"mb-2"}
										user={user} />
								</Link>
						)
				}
			</div>

			<div className="w-4/12">
				{panel}
			</div>
		</div>
	</>
		;
}
