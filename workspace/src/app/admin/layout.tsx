'use client';

import AdminSidebar from '@/app/admin/admin-sidebar';
import AdminNavbar from '@/app/admin/admin-navbar';
import NavbarSidebarLayout from '@/components/navbar-sidebar-layout.component';
import { UserAuthenticationContextProvider } from '@/contexts/user-authentication.context';


function AdminComponent(
	{ children }: Readonly<{ children: React.ReactNode; }>,
) {
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