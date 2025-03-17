import NavbarSearchBar from '@/components/navbar/searchBar';
import {
	useFetchAuthenticatedUser,
	useFetchOrganisationsOfUser, useOrganisationDeletionApi, useOrganisationUpdateApi,
	useUserAccessRightInOrganisation,
} from '@/components/api.hook';
import {
	Button,
	IconButton,
	Menu,
	MenuHandler,
	MenuItem,
	MenuList,
	Spinner,
	Typography,
} from '@material-tailwind/react';
import { Organisation, OrganisationSummaryList } from '@/entities/organisation.entity';
import { useAuthenticationContext } from '@/contexts/user-authentication.context';
import { useApplicationNavigationContext } from '@/contexts/application-navigation.context';
import { useOrganisationContext } from '@/contexts/organisation-store.context';
import AvatarOrganisation from '@/components/avatar-organisation';
import Skeleton from 'react-loading-skeleton';
import Avatar from 'boring-avatars';
import { Dialog, DialogBody, DialogFooter, DialogHeader } from '@material-tailwind/react';
import { useState } from 'react';
import { useToast } from '@/app/layout';
import { useConfirmationModal } from '@/contexts/popup-modal.component';



const SEARCH_BAR_CLASSES = 'search-bar w-full';

/**
 * Renders a navigation bar component that includes a logo, a search bar, and a user profile section.
 *
 * @return {JSX.Element} The rendered navigation bar component.
 */
export default function Navbar() {
	return (
		<>
			<div className={'flex-1 flex items-center'}>
				<OrganisationDisplay />
			</div>
			<div className="flex-2 w-4/12">

				<SearchBar />
			</div>

			<div className={'flex flex-1 flex-row items-center justify-end space-x-4'}>
				<UserDisplay/>
			</div>
		</>
	);
}


function UserDisplay() {
	const callOrganisationDeletionApi = useOrganisationDeletionApi()
	const toast = useToast();
	const navigation = useApplicationNavigationContext();
	const authentication = useAuthenticationContext();
	const {data, isLoading} = useFetchAuthenticatedUser();
	const organisation = useOrganisationContext();
	const accessRightsResponse = useUserAccessRightInOrganisation(authentication.getAuthenticatedUser().publicKey, organisation.id);
	if (!data || isLoading) return <Skeleton width={25} height={25} circle={true} />
	const isAdminInOrganisation = accessRightsResponse.data && accessRightsResponse.data.isAdmin;
	const confirmationDialog = useConfirmationModal();

	function disconnect() {
		authentication.disconnect();
		navigation.navigateToLogin()
	}

	function goToHome() {
		navigation.navigateToHome();
	}

	function deleteOrganisation() {
		confirmationDialog(
			"Delete Organisation",
			"This action cannot undone",
			"Delete",
			"Cancel",
			() => callOrganisationDeletionApi(organisation, {
				onSuccess: () => navigation.navigateToHome(),
				onError: (e) => toast.error(e)
			})
		)
	}

	return <div className={"flex space-x-4 items-center"}>
		<Avatar width={25} height={25} name={data.publicKey} variant={"beam"}/>
		<Typography color={"gray"} className={"uppercase"}>{data.firstname} {data.lastname}</Typography>
		<Menu>
			<MenuHandler>
				<IconButton color={"white"} className={"bg-white shadow-none"}>
					<i className={"bi bi-three-dots-vertical"}/>
				</IconButton>
			</MenuHandler>
			<MenuList>
				<MenuItem onClick={goToHome}>See organisations</MenuItem>
				{	isAdminInOrganisation &&
					<>
						<MenuItem onClick={() => deleteOrganisation()}>Delete organisation</MenuItem>
					</>
				}
				<MenuItem onClick={disconnect}>Logout</MenuItem>
				{	isAdminInOrganisation &&
					<>
						<hr className="my-2 border-blue-gray-50" />
						<MenuItem disabled={true}>You are admin</MenuItem>
					</>
				}
				{	data.isAdmin &&
					<>
						<MenuItem disabled={true}>You are super-admin</MenuItem>
					</>
				}

			</MenuList>
		</Menu>
	</div>
}




/**
 * Represents a search bar component that wraps the NavbarSearchBar.
 *
 * @return {JSX.Element} A React component containing the search bar with predefined styles.
 */
function SearchBar() {
	return (
		<div className={SEARCH_BAR_CLASSES}>
			<NavbarSearchBar />
		</div>
	);
}

type Props = {
	currentOrganisation: Organisation;
	organisations: OrganisationSummaryList;
};

function OrganisationSwitcher({ currentOrganisation, organisations }: Props) {
	const navigation = useApplicationNavigationContext();
	return (
		<Menu>
			<MenuHandler>
				<Button className={'bg-white flex flex-row justify-between items-center space-x-4 p-2 shadow-none'}>
					<AvatarOrganisation organisationId={currentOrganisation.publicSignatureKey || currentOrganisation.id} width={20} height={20} />
					<Typography color={'gray'}>{currentOrganisation.name || 'Switch Organisation'}</Typography>
				</Button>
			</MenuHandler>
			<MenuList>
				{organisations.map((org) => (
					<MenuItem
						key={org.id}
						onClick={() => navigation.navigateToOrganisation(org.id)}
					>
						{org.name}
					</MenuItem>
				))}
			</MenuList>
		</Menu>
	);
}

export function OrganisationDisplay() {

	// Extract organisationId from the URL
	const currentOrganisation = useOrganisationContext();

	// Load the current user and ensure it is not null
	const authenticationContext = useAuthenticationContext();
	const userOrganisationsResponse = useFetchOrganisationsOfUser(authenticationContext.authenticatedUser?.publicKey);
	if (userOrganisationsResponse.isLoading || !userOrganisationsResponse.data)
		return <Spinner />;

	const organisations = userOrganisationsResponse.data;
	return <>
		<OrganisationSwitcher
			organisations={organisations}
			currentOrganisation={currentOrganisation}
		/>
	</>;
}


