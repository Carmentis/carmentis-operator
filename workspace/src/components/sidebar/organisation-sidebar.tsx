'use client';

import { useInterfaceContext } from '@/contexts/interface.context';
import { SidebarItem, SidebarSeparator } from '@/components/sidebar/sidebar-components';
import HomeSideBar from '@/components/sidebar/home-sidebar';
import { useAtomValue } from 'jotai/index';
import { organisationAtom } from '@/app/home/organisation/atom';

/**
 * Sidebar component that renders a navigation menu with multiple selectable items.
 * Items include links to various sections such as Home, Users, Applications, Oracles, and Exchange.
 * It also includes a toggle button to show or hide the sidebar.
 *
 * @return {JSX.Element} A JSX element representing the sidebar with navigation items and functionality.
 */
export default function OrganisationSideBar() {
	const organisation = useAtomValue(organisationAtom);

	// search the organisation base link
	let baseLink = "/"
	if (organisation && organisation.id) {
		baseLink = `/home/organisation/${organisation.id}`;
	}

	// search the organisation name
	let name = "Home"
	if ( organisation && organisation.name ) {
		name = organisation.name;
	}


	return <>
		<HomeSideBar/>
		<SidebarSeparator/>
		<SidebarItem icon={"bi-house"} text={name} link={baseLink}
					 activeRegex={new RegExp('/organisation/[0-9]+$')}></SidebarItem>
		<SidebarItem icon={"bi-key"} text={"API Keys"} link={`${baseLink}/apiKeys`}
					 activeRegex={new RegExp('/apiKeys')}></SidebarItem>
		<SidebarItem icon={"bi-people"} text={"Members"} link={`${baseLink}/user`}
					 activeRegex={new RegExp('/user')}></SidebarItem>
		<SidebarItem icon={"bi-boxes"} text={"Applications"} link={`${baseLink}/application`}
					 activeRegex={new RegExp('/application')}></SidebarItem>
		<SidebarItem icon={"bi-currency-dollar"} text={"Transactions"} link={`${baseLink}/transactions`}
					 activeRegex={new RegExp('/transactions')}></SidebarItem>
	</>
}