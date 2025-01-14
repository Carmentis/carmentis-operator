'use client';

import Link from 'next/link';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { useApplicationNavigationContext } from '@/contexts/application-navigation.context';
import { useInterfaceContext } from '@/contexts/interface.context';
import { useAuthenticationContext } from '@/contexts/user-authentication.context';
import Skeleton from 'react-loading-skeleton';
import Avatar from 'boring-avatars';
import { AuthenticatedUserSidebarItem } from '@/components/sidebar-components';

function SidebarItem(
	input: { icon: string, text: string, link?: string, className?: string, onClick?: () => void, activeRegex?: RegExp, id?: string },
) {
	const activePath = usePathname();
	const interfaceStore = useInterfaceContext();
	const params : {organisationId: string} = useParams();

	// check if active and set the active classes
	const isActive = input.activeRegex && input.activeRegex.test(activePath);
	const activeClasses = isActive ? 'active-sidebar-item' : '';

	// check if hidden or not
	const toggleSidebarItemClasses = interfaceStore.sidebarHidden ? 'hidden-sidebar-item' : 'visible-sidebar-item';
	const itemClass = `cursor-pointer hover:bg-gray-100  ${input.className} ${activeClasses} ${toggleSidebarItemClasses}`;

	const content = <>
		<i className={`bi ${input.icon}  flex-shrink-0 w-5 h-5 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white`}></i>
		<span
			hidden={interfaceStore.sidebarHidden}
			className=" text-left rtl:text-right whitespace-nowrap">
						{input.text}
					</span>
	</>

	if (input.link) {
		return  <Link href={`/home/organisation/${params.organisationId}` + input.link} className={itemClass}> {content} </Link>;
	} else {
		return <div className={itemClass} onClick={input.onClick} id={input.id}> {content} </div>
	}
}




export default function Sidebar() {


	const router = useRouter();
	const navigation = useApplicationNavigationContext();
	const interfaceStore = useInterfaceContext();

	function backRouter() {
		router.back();
	}


	function exit() {
		navigation.navigateToHome()
	}

	function toggleSidebar() {
		interfaceStore.toggleSidebar()
	}


	return <>
		<SidebarItem
			icon={interfaceStore.sidebarHidden ? "bi-chevron-double-right" : 'bi-chevron-double-left'}
			id={"sidebar-toggle"}
			text={""}
			onClick={toggleSidebar}>
		</SidebarItem>

		<AuthenticatedUserSidebarItem/>
		<SidebarItem icon={"bi-arrow-left"} text={"Back"} onClick={backRouter}></SidebarItem>
		<SidebarItem icon={"bi-door-closed"} text={"Exit"} className={"separator"} onClick={exit}></SidebarItem>

		<SidebarItem icon={"bi-house"} text={"Home"} link={"/"}
					 activeRegex={new RegExp('/organisation/[0-9]+$')}></SidebarItem>
		<SidebarItem icon={"bi-people"} text={"Users"} link={`/user`}
					 activeRegex={new RegExp('/user')}></SidebarItem>
		<SidebarItem icon={"bi-boxes"} text={"Applications"} link={"/application"}
					 activeRegex={new RegExp('/application')}></SidebarItem>
		<SidebarItem icon={"bi-arrow-left-right"} text={"Oracles"} link={"/oracle"}
					 activeRegex={new RegExp('/oracle')}></SidebarItem>
		<SidebarItem icon={"bi-currency-dollar"} text={"Exchange"} link={"/exchange"}
					 activeRegex={new RegExp('/exchange')}></SidebarItem>

	</>
}