import NavbarSearchBar from '@/components/navbar/searchBar';
import { useFetchOrganisationsOfUser } from '@/components/api.hook';
import { Button, Menu, MenuHandler, MenuItem, MenuList, Spinner } from '@material-tailwind/react';
import { Organisation, OrganisationSummaryList } from '@/entities/organisation.entity';
import { useAuthenticationContext } from '@/contexts/user-authentication.context';
import { useApplicationNavigationContext } from '@/contexts/application-navigation.context';
import { useOrganisationContext } from '@/contexts/organisation-store.context';
import CarmentisLogo from '@/components/carmentis-logo.component';


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

				<CarmentisLogo/>
			</div>
			<div className="flex-2 w-4/12">

				<SearchBar />
			</div>

			<div className={'flex flex-1 flex-row items-center justify-end space-x-4'}>
				<OrganisationDisplay />
			</div>
		</>
	);
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
				<Button size="md" className={"bg-primary-light flex space-x-2"}>
					<span>{currentOrganisation.name || "Switch Organisation"}</span>
					<i className={"bi bi-chevron-down"}></i>
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
	const userOrganisationsResponse = useFetchOrganisationsOfUser(authenticationContext.authenticatedUser?.publicKey)
	if (userOrganisationsResponse.isLoading || !userOrganisationsResponse.data)
		return <Spinner/>

	const organisations = userOrganisationsResponse.data;
	return <>
		{  currentOrganisation.isSandbox && <Button className={"border-secondary-light text-secondary-light bg-white"} disabled variant={'outlined'}>sandbox</Button> }
		<OrganisationSwitcher
			organisations={organisations}
			currentOrganisation={currentOrganisation}
		/>
	</>
}


