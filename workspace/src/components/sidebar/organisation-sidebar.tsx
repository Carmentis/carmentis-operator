'use client';

import { useInterfaceContext } from '@/contexts/interface.context';
import { SidebarItem, SidebarSeparator } from '@/components/sidebar/sidebar-components';
import HomeSideBar from '@/components/sidebar/home-sidebar';
import { useAtomValue } from 'jotai/index';
import { organisationAtom } from '@/app/home/organisation/atom';
import { useOrganisation, useOrganisationContext } from '@/contexts/organisation-store.context';
import Skeleton from 'react-loading-skeleton';

/**
 * Sidebar component that renders a navigation menu with multiple selectable items.
 * Items include links to various sections such as Home, Users, Applications, Oracles, and Exchange.
 * It also includes a toggle button to show or hide the sidebar.
 *
 * @return {JSX.Element} A JSX element representing the sidebar with navigation items and functionality.
 */
export default function OrganisationSideBar() {
	const organisationQuery = useAtomValue(organisationAtom);

	let content = <HomeSideBar/>;

	if (organisationQuery && organisationQuery.organisation) {
		const organisation = organisationQuery.organisation;
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


		content = <>
			{content}
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
	} else {
		content = <>
			{content}
			<SidebarSeparator/>
			<Skeleton/>
		</>
	}

	return content;
}