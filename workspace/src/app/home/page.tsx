'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useFetchOrganisationsOfUser, useOrganisationCreation, useSandboxCreationApi } from '@/components/api.hook';
import SimpleTextModalComponent from '@/components/modals/simple-text-modal.component';
import Avatar from 'boring-avatars';
import { Chip, IconButton, Menu, MenuHandler, MenuItem, MenuList, Typography } from '@material-tailwind/react';
import { useApplicationNavigationContext } from '@/contexts/application-navigation.context';
import FullPageLoadingComponent from '@/components/full-page-loading.component';
import { useToast } from '@/app/layout';
import ConditionallyHiddenLayout from '@/components/conditionally-hidden-layout.component';
import { OrganisationSummary, OrganisationSummaryList } from '@/entities/organisation.entity';
import { useAuthenticationContext } from '@/contexts/user-authentication.context';
import AvatarOrganisation from '@/components/avatar-organisation';
import { Container } from '@mui/material';

function OrganisationCard(input: { organisation: OrganisationSummary }) {
	return <Link className={'card w-52 flex flex-col justify-center items-center space-y-2 h-52 hover:cursor-pointer'}
				 href={`/home/organisation/${input.organisation.id}`}>
			<AvatarOrganisation organisationId={input.organisation.publicSignatureKey || input.organisation.id} width={60} height={60} />
		<p className={'organisation-name'}>{input.organisation.name}</p>

		<ConditionallyHiddenLayout showOn={input.organisation.isSandbox}>
			<Chip value={"sandbox"} className={"bg-secondary-light"}/>
		</ConditionallyHiddenLayout>
	</Link>;
}

function LeftTopMenu() {

}

function RightTopMenu() {
	const [open, setOpen] = useState(false);
	const navigation = useApplicationNavigationContext();
	const auth = useAuthenticationContext();
	const user = auth.getAuthenticatedUser();

	function handleClose() {
		setOpen(false);
	}

	function handleLogout() {
		auth.disconnect();
		navigation.navigateToLogin()
		setOpen(false)
	}

	function handleAdmin() {
		navigation.navigateToAdmin()
		setOpen(false)
	}

	return <div className={'absolute right-5 top-5 bg-white flex items-center shadow rounded p-4 space-x-4'}>
		<div className={"flex items-center"}>
			<Avatar variant={'beam'} name={user.publicKey} width={30} height={30} />
			<Typography className={'ml-4'}>{user.firstname} {user.lastname}</Typography>
		</div>
		<Menu>
			<MenuHandler>
				<IconButton
					id="basic-button"
					aria-controls={open ? 'basic-menu' : undefined}
					aria-haspopup="true"
					aria-expanded={open ? 'true' : undefined}
					onClick={() => setOpen(true)}
				><i className={'bi bi-gear-fill'}></i>
				</IconButton>
			</MenuHandler>
			<MenuList>
				<MenuItem onClick={handleAdmin}>Admin</MenuItem>
				<MenuItem onClick={handleLogout}>Logout</MenuItem>
			</MenuList>
		</Menu>
	</div>;
}

export default function HomePage() {
	const [search, setSearch] = useState('');
	const [showNewOrganisationModal, setShowNewOrganisationModal] = useState(false);

	const [organisations, setOrganisations] = useState<OrganisationSummaryList>([]);
	const authenticationContext = useAuthenticationContext();
	const authenticatedUser = authenticationContext.getAuthenticatedUser();
	const { data, isLoading } = useFetchOrganisationsOfUser(authenticatedUser.publicKey);
	const [isSpinning, setIsSpinning] = useState(false);
	const callOrganisationCreation = useOrganisationCreation();
	const callSandboxCreation = useSandboxCreationApi();
	const navigation = useApplicationNavigationContext();
	const notify = useToast();


	useEffect(() => {
		if (data) {
			setOrganisations(data);
		}
	},[data])


	function createOrganisation(organisationName: string) {
		setIsSpinning(true);
		setShowNewOrganisationModal(false);
		callOrganisationCreation(organisationName, {
			onSuccessData: (data: {id: number}) => {
				navigation.navigateToOrganisation(data.id)
			},
			onError: notify.error,
			onEnd: () => setIsSpinning(false)
		})
	}


	function handleSandoxCreationClicked() {
		setIsSpinning(true);
		callSandboxCreation({
			onSuccessData: (data) => {
				notify.success('Sandbox created');
				navigation.navigateToOrganisation(data.id)
			},
			onError: notify.error,
			onEnd: () => setIsSpinning(false)
		})
	}

	if ( isSpinning ) return <FullPageLoadingComponent label={"Creation of your sandbox"}/>

	if ( !data || isLoading ) {
		return <FullPageLoadingComponent label={""}/>
	}

	return <Container sx={{p: 4}}>
		<LeftTopMenu/>
		<RightTopMenu/>
		<div id="filter" className={'flex flex-col space-y-4 w-100 justify-center items-center mb-8'}>
			<Image src={'/logo-full.svg'} alt={'logo'} width={120} height={120} />
			<div className="relative z-0 w-3/12 mb-5 ">
				<input type="text" name="filter"
					   className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
					   placeholder=" " required onChange={event => setSearch(event.target.value)} />
				<label htmlFor="floating_email"
					   className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
					Search
				</label>
			</div>
		</div>

		<Container
			className="flex flex-row items-center justify-center px-6 py-4 mx-auto  lg:py-0 gap-2 flex-wrap w-8/12">
			<div
				onClick={() => setShowNewOrganisationModal(true)}
				className={'card w-52 flex flex-col justify-center items-center space-y-2 h-52 bg-opacity-15 bg-primary-light border-primary-light hover:cursor-pointer border-dashed text-primary-light'}>
				<div
					className="organisation-logo h-24 w-24 rounded-full flex justify-center items-center uppercase text-center">
					Create an organisation
				</div>
			</div>
			<div
				onClick={handleSandoxCreationClicked}
				className={'card w-52 flex flex-col justify-center items-center space-y-2 h-52 bg-opacity-15 bg-secondary-light border-secondary-light hover:cursor-pointer border-dashed text-secondary-light'}>
				<div
					className="organisation-logo h-24 w-24 rounded-full flex justify-center items-center uppercase text-center">
					Create a sandbox
				</div>
			</div>
			{
				organisations
					.filter((organisation) => search === '' || organisation.name.toLowerCase().includes(search.toLowerCase()))
					.map((organisation, index) => <OrganisationCard key={index} organisation={organisation} />)
			}

		</Container>

		{
			showNewOrganisationModal &&
			<SimpleTextModalComponent label={"Organisation Name"}
									  onSubmit={createOrganisation}
									  onClose={() => setShowNewOrganisationModal(false)}
									  placeholder={"Name"} />
		}
	</Container>;
}