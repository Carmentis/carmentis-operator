'use client';

import { AuthenticatedUserSidebarItem, CarmentisLogo, SidebarItem } from '@/components/sidebar/sidebar-components';
import Image from 'next/image'


export default function HomeSideBar() {
	return <>
		<AuthenticatedUserSidebarItem/>
		<SidebarItem icon={"bi-house"} text={"Organisations"} link={"/home"} activeRegex={/\/home$/}/>
		<SidebarItem icon={"bi-people"} text={"Users"} link={"/home/user"} activeRegex={/\/home\/user$/}/>
		<SidebarItem icon={"bi-gear"} text={"Parameters"} link={"/home/parameters"} activeRegex={/\/home\/parameters$/}/>
	</>
}