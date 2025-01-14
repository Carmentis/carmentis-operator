import { useParams, usePathname } from 'next/navigation';
import { useInterfaceContext } from '@/contexts/interface.context';
import Link from 'next/link';
import { useAuthenticationContext } from '@/contexts/user-authentication.context';
import Skeleton from 'react-loading-skeleton';
import Avatar from 'boring-avatars';

export function SidebarItem(
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


export function LinkSidebarItem(
	input: { icon: string, text: string, link: string, className?: string,  activeRegex?: RegExp, id?: string }
) {
	const activePath = usePathname();
	const interfaceStore = useInterfaceContext();

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

	return  <Link href={input.link} className={itemClass}> {content} </Link>;
}

export function AuthenticatedUserSidebarItem() {
	const authenticatedUserContext = useAuthenticationContext();
	const interfaceContext = useInterfaceContext();

	if (!authenticatedUserContext.isAuthenticated())
		return <div className={"p-4"}>
			<Skeleton count={1} height={30}/>
	</div>

	const user = authenticatedUserContext.getAuthenticatedUser();


	return <div className={"flex flex-row visible-sidebar-item"}>
		{ interfaceContext.sidebarHidden &&
			<>
				<Avatar className={"w-full h-full"}  variant={"beam"} name={`${user.firstname} ${user.lastname}`}/>
			</>
		}

		{ !interfaceContext.sidebarHidden &&
			<>
				<Avatar width={20} variant={"beam"} name={`${user.firstname} ${user.lastname}`}/>
				<span className={"ml-2"} >{user.firstname} {user.lastname}</span>
			</>
		}
	</div>
}


export function ClickableSidebarItem(
	input: { icon: string, text: string, className?: string, onClick: () => void, activeRegex?: RegExp, id?: string },
) {
	const activePath = usePathname();
	const interfaceStore = useInterfaceContext();

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


	return <div className={`cursor-pointer ${itemClass}`} onClick={input.onClick} id={input.id}> {content} </div>

}


export function SidebarSeparator() {
	return <div className={"w-full mb-8"}></div>
}