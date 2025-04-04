import { useParams, usePathname } from 'next/navigation';
import { useInterfaceContext } from '@/contexts/interface.context';
import Link from 'next/link';
import { useAuthenticationContext } from '@/contexts/user-authentication.context';
import Skeleton from 'react-loading-skeleton';
import Avatar from 'boring-avatars';
import Image from 'next/image';
import { Typography } from '@mui/material';
import { useCustom } from '@refinedev/core';
import { useCustomRouter } from '@/contexts/application-navigation.context';

export function CarmentisLogo() {
	return <div className={"w-full p-2"}>
		<Image src={"/logo-full.svg"} alt={"test"} width={100} height={100}/>
	</div>
}

export function SidebarItem(
	input: { icon: string, text: string, link?: string, className?: string, onClick?: () => void, activeRegex?: RegExp, id?: string },
) {
	const activePath = usePathname();
	const interfaceStore = useInterfaceContext();
	const router = useCustomRouter();

	// check if active and set the active classes
	const isActive = input.activeRegex && input.activeRegex.test(activePath);
	const activeClasses = isActive ? 'active-sidebar-item' : '';

	// check if hidden or not
	const toggleSidebarItemClasses = interfaceStore.sidebarHidden ? 'hidden-sidebar-item' : 'visible-sidebar-item';
	const itemClass = `p-2 rounded cursor-pointer hover:bg-white  ${input.className} ${activeClasses} ${toggleSidebarItemClasses}`;

	const content = <>
		<i className={`bi ${input.icon}  mr-2 flex-shrink-0 w-5 h-5 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white`}></i>
		<span
			hidden={interfaceStore.sidebarHidden}
			className=" text-left rtl:text-right whitespace-nowrap">
						{input.text}
					</span>
	</>

	if (input.link) {
		return  <div onClick={() => router.push(input.link)} className={itemClass}> {content} </div>;
	} else {
		return <div className={itemClass} onClick={input.onClick} id={input.id}> {content} </div>
	}
}


export function AuthenticatedUserSidebarItem() {
	const authenticatedUserContext = useAuthenticationContext();
	const interfaceContext = useInterfaceContext();

	if (!authenticatedUserContext.isAuthenticated())
		return <div className={"p-4"}>
			<Skeleton count={1} height={30}/>
	</div>

	const user = authenticatedUserContext.getAuthenticatedUser();


	return <div className={"flex flex-row visible-sidebar-item p-2 hover:bg-white hover:cursor-pointer rounded"}>
		{ interfaceContext.sidebarHidden &&
			<>
				<Avatar className={"w-full h-full"}  variant={"beam"} name={user.publicKey}/>
			</>
		}

		{ !interfaceContext.sidebarHidden &&
			<>
				<Avatar width={20} variant={"beam"} name={user.publicKey}/>
				<Typography className={"pl-2"}>{user.firstname} {user.lastname}</Typography>
			</>
		}
	</div>
}


export function SidebarSeparator() {
	return <div className={"w-full mb-8"}></div>
}