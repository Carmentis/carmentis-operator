import Image from "next/image";
import NavbarSearchBar from "@/components/navbar/searchBar";
import Avatar from 'boring-avatars';
import { useParams, useRouter } from 'next/navigation';
import { fetchOrganisation, useFetchOrganisationsOfUser } from '@/components/api.hook';
import Skeleton from 'react-loading-skeleton';
import { Select, Option, Menu, MenuHandler, Button, MenuList, MenuItem } from '@material-tailwind/react';
import { useCurrentUser } from '@/app/layout';
import { Organisation } from '@/entities/organisation.entity';



const NAVBAR_CLASSES = 'navbar w-100 border-b-2 border-gray-200 flex flex-row px-10 p-2 h-14';
const SEARCH_BAR_CLASSES = 'search-bar w-full';
const AVATAR_CONTAINER_CLASSES = 'flex items-center justify-end w-52';
const USER_NAME_CLASSES = 'mr-2';

/**
 * Renders a navigation bar component that includes a logo, a search bar, and a user profile section.
 *
 * @return {JSX.Element} The rendered navigation bar component.
 */
export default function Navbar() {
	return (
		<nav className={NAVBAR_CLASSES}>
			<div className={"flex-1 flex items-center"}>

				<Logo />
			</div>
			<div className="flex-2 w-4/12">

				<SearchBar />
			</div>

			<div className={"flex flex-1 flex-row items-center justify-end space-x-4"}>
				<UserProfile/>
				<OrganisationDisplay/>
			</div>
		</nav>
	);
}

/**
 * Renders the Logo component with a specified image source, alt text, and dimensions.
 *
 * @return {JSX.Element} The Logo component containing an image element.
 */
function Logo() {
	return <Image src="/logo-full.svg" alt="logo" width={125} height={100} />;
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
	currentOrganisationResponse: { data: { name: string } };
	organisations: Organisation[];
};

function OrganisationSwitcher({ currentOrganisationResponse, organisations }: Props) {
	const router = useRouter();
	console.log(organisations)
	return (
		<Menu>
			<MenuHandler>
				<Button size="md" className={"bg-primary-light flex space-x-2"}>
					<span>{currentOrganisationResponse.data.name || "Switch Organisation"}</span>
					<i className={"bi bi-chevron-down"}></i>
				</Button>
			</MenuHandler>
			<MenuList>
				{organisations.map((org) => (
					<MenuItem
						key={org.id}
						onClick={() => router.push(`/home/organisation/${org.id}`)}
					>
						{org.name}
					</MenuItem>
				))}
			</MenuList>
		</Menu>
	);
}

export function OrganisationDisplay() {

	const router = useRouter();

	// Extract organisationId from the URL
	const { organisationId } = useParams<{ organisationId: string }>();

	// Load the current user and ensure it is not null
	const currentUser = useCurrentUser();
	if ( !currentUser ) {
		return <></>
	}


	// Ensure organisationId is a number
	const orgId = organisationId ? parseInt(organisationId, 10) : null;

	// Use the fetchOrganisation function to fetch the data
	const currentOrganisationResponse = fetchOrganisation(orgId);
	const userOrganisationsResponse = useFetchOrganisationsOfUser(currentUser.publicKey)
	if (currentOrganisationResponse.isLoading || userOrganisationsResponse.isLoading) {
		return <Skeleton width={50} height={20} />;
	}


	if (
		currentOrganisationResponse.error ||
		!userOrganisationsResponse.data ||
		!currentOrganisationResponse.data
	) {
		return <div>Error: Unable to fetch organisation details</div>;
	}

	const organisations = userOrganisationsResponse.data;
	return (
			<OrganisationSwitcher
				organisations={organisations}
				currentOrganisationResponse={currentOrganisationResponse}
			/>
	);
}

/**
 * Renders a user profile component containing a user's name and avatar.
 * @return {JSX.Element} The rendered user profile component with name and avatar.
 */
function UserProfile() {

	const currentUser = useCurrentUser();
	if ( !currentUser ) {
		return <></>
	}

	const name = currentUser.firstname + ' ' + currentUser.lastname;
	return (
		<div className={AVATAR_CONTAINER_CLASSES}>
			<p className={USER_NAME_CLASSES}>{name}</p>
			<Avatar name={name} variant="bauhaus" width={34} />
		</div>
	);
}