'use client';

import Link from 'next/link';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { useInterfaceContext } from '@/contexts/interface.context';
import {version} from '@/../package.json';
import { Typography } from '@material-tailwind/react';


/**
 * A functional component that renders a sidebar item, which can either be a clickable link or a div.
 * The item can display an icon and text, and supports additional styling, callbacks, and active state detection.
 *
 * @param {Object} input - The input object containing the configuration for the sidebar item.
 * @param {string} input.icon - The icon class to display in the sidebar item.
 * @param {string} input.text - The text to display alongside the icon in the sidebar item.
 * @param {string} [input.link] - The optional URL path to link to. If provided, the sidebar item will render as a link.
 * @param {string} [input.className] - Additional CSS classes to apply to the sidebar item.
 * @param {Function} [input.onClick] - Optional event handler for click events when the sidebar item is not a link.
 * @param {RegExp} [input.activeRegex] - Optional regular expression to determine if the item should be marked as active.
 * @param {string} [input.id] - Optional ID to assign to the sidebar item element.
 *
 * @return {JSX.Element} The rendered sidebar item as a link or div element, styled and configured based on the input.
 */
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


/**
 * This function renders a sidebar item that displays the application version.
 * The item is positioned at the bottom-left corner of the interface.
 * If the sidebar is hidden, it renders an empty fragment.
 *
 * @return {JSX.Element} A JSX element representing the application version sidebar item or an empty fragment if the sidebar is hidden.
 */
function ApplicationVersionSidebarItem() {
	const interfaceStore = useInterfaceContext();
	if (interfaceStore.sidebarHidden) return <></>
	return (
       <div className={"absolute bottom-5 left-5"}>
		   <Typography color={'gray'}>Version {version}</Typography>
	   </div>
    );
}



/**
 * Sidebar component that renders a navigation menu with multiple selectable items.
 * Items include links to various sections such as Home, Users, Applications, Oracles, and Exchange.
 * It also includes a toggle button to show or hide the sidebar.
 *
 * @return {JSX.Element} A JSX element representing the sidebar with navigation items and functionality.
 */
export default function Sidebar() {
	const interfaceStore = useInterfaceContext();

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

		<ApplicationVersionSidebarItem/>

	</>
}