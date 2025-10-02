import { useParams, usePathname } from 'next/navigation';
import { useInterfaceContext } from '@/contexts/interface.context';
import Link from 'next/link';
import { useAuthenticationContext } from '@/contexts/user-authentication.context';
import Skeleton from 'react-loading-skeleton';
import Avatar from 'boring-avatars';
import Image from 'next/image';
import { Box, Typography } from '@mui/material';
import { useCustomRouter } from '@/contexts/application-navigation.context';

export function CarmentisLogo() {
	return <div className={"w-full p-2"}>
		<Image src={"/logo-full.svg"} alt={"test"} width={100} height={100}/>
	</div>
}

export function SidebarItem(
	input: { icon: any, text: string, link?: string, className?: string, onClick?: () => void, activeRegex?: RegExp, id?: string },
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

	const content = <Box display={"flex"} flexDirection={'row'} gap={1}>
		{input.icon}
		<Typography
			className=" text-left rtl:text-right whitespace-nowrap">
						{input.text}
					</Typography>
	</Box>

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


	return <div className={"flex flex-row visible-sidebar-item p-2 hover:bg-white hover:cursor-pointer rounded mb-4"} style={{ backgroundColor: '#ffffff', boxShadow: '0 2px 5px rgba(0,0,0,0.08)' }}>
		{ interfaceContext.sidebarHidden &&
			<>
				<Avatar 
					className={"w-full h-full"} 
					variant={"beam"} 
					name={user.publicKey}
					size={40}
					square={false}
					colors={['#159A9C', '#9C8714', '#1E293B', '#0F172A', '#0D9488']}
				/>
			</>
		}

		{ !interfaceContext.sidebarHidden &&
			<>
				<Box 
					sx={{ 
						display: 'flex',
						alignItems: 'center',
						gap: 1.5,
						width: '100%'
					}}
				>
					<Avatar 
						width={32} 
						height={32}
						variant={"beam"} 
						name={user.publicKey}
						colors={['#159A9C', '#9C8714', '#1E293B', '#0F172A', '#0D9488']}
					/>
					<Typography 
						sx={{ 
							fontWeight: 600,
							color: '#1E293B',
							fontSize: '0.95rem'
						}}
					>
						{user.firstname} {user.lastname}
					</Typography>
				</Box>
			</>
		}
	</div>
}


export function SidebarSeparator() {
	return <div className={"w-full mb-8"}></div>
}
