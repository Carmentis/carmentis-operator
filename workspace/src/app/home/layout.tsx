'use client';

import { PropsWithChildren, ReactNode } from 'react';
import { UserAuthenticationContextProvider } from '@/contexts/user-authentication.context';
import NavbarSidebarLayout from '@/components/navbar-sidebar-layout.component';
import { usePathname } from 'next/navigation';
import OrganisationSideBar from '@/components/sidebar/organisation-sidebar';
import HomeSideBar from '@/components/sidebar/home-sidebar';



export type LayoutProps = {
	sidebar: ReactNode,
}

export default function RootLayout({ children }: PropsWithChildren<LayoutProps>) {

	const pathname = usePathname();
	const isOrganisation = pathname.startsWith('/home/organisation');
	const sidebar = isOrganisation ? <OrganisationSideBar/> : <HomeSideBar/>;

	return (
		<>
			<UserAuthenticationContextProvider>
				<NavbarSidebarLayout sidebar={sidebar}>
					{children}
				</NavbarSidebarLayout>
			</UserAuthenticationContextProvider>
		</>
	);
}
