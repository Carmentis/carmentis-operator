'use client';

import type {} from '@redux-devtools/extension';
import AdminSidebar from '@/app/admin/admin-sidebar';
import AdminNavbar from '@/app/admin/admin-navbar';
import NavbarSidebarLayout from '@/components/navbar-sidebar-layout.component'; // required for devtools typing


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
			<AdminComponent>
				{children}
			</AdminComponent>
		</>
	);
}