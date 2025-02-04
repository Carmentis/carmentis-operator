'use client';

import AdminSidebar from '@/app/admin/admin-sidebar';
import AdminNavbar from '@/app/admin/admin-navbar';
import NavbarSidebarLayout from '@/components/navbar-sidebar-layout.component';
import { UserAuthenticationContextProvider } from '@/contexts/user-authentication.context';
import { useFetchCurrentUserIsAdministrator } from '@/components/api.hook';
import FullSpaceSpinner from '@/components/full-page-spinner.component';
import { PropsWithChildren } from 'react';
import FlexCenter from '@/components/flex-center.component';
import { Button } from '@material-tailwind/react';
import { useApplicationNavigationContext } from '@/contexts/application-navigation.context';

function NotAuthorized() {
	const navigation = useApplicationNavigationContext();
	return <FlexCenter className={"flex-col"}>
		You are not authorized to access the administration page.
		<Button onClick={navigation.navigateToHome}>Back to home</Button>
	</FlexCenter>
}

function AdminComponent(
	{ children }: PropsWithChildren,
) {

	const {data, isLoading} = useFetchCurrentUserIsAdministrator();
	if (isLoading||!data) return <FullSpaceSpinner/>
	if (!data.isAdmin) return <NotAuthorized/>

	return <NavbarSidebarLayout
		navbar={<AdminNavbar />}
		sidebar={<AdminSidebar />}
	>
		{children}
	</NavbarSidebarLayout>;
}



export default function RootLayout(
	{ children }: Readonly<{ children: React.ReactNode; }>) {

	return (
		<>
			<UserAuthenticationContextProvider>
				<AdminComponent>
					{children}
				</AdminComponent>
			</UserAuthenticationContextProvider>
		</>
	);
}