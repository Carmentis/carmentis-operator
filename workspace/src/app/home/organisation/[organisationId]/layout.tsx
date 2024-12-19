'use client';

import type { Metadata } from 'next';
import Sidebar from '@/app/home/organisation/[organisationId]/sidebar';
import Navbar from '@/app/home/organisation/[organisationId]/navbar';
import { createInterfaceStore, InterfaceStore } from '@/app/home/organisation/[organisationId]/interface.store';
import { createContext, useContext } from 'react';
import {
	createOrganisationStore,
	OrganisationStore,
} from '@/app/home/organisation/[organisationId]/organisation.store';
import { StoreApi } from 'zustand';

const InterfaceStoreContext = createContext<StoreApi<InterfaceStore> | undefined>(undefined);
const OrganisationStoreContext = createContext<StoreApi<OrganisationStore> | undefined>(undefined);

function HomeOrganisationPage(
	{
		children,
	}: Readonly<{ children: React.ReactNode; }>
) {



	// change the width of the sidebar if closed or not
	const interfaceStore = useContext(InterfaceStoreContext);
	const interfaceState = interfaceStore?.getState();
	const sidebarWidth = interfaceState.sidebarHidden ? 'w-14' : 'w-96';
	const contentWidth = interfaceState.sidebarHidden ? 'ml-14' : 'ml-96';


	return <>
		<Navbar></Navbar>
		<div className="flex flex-1">
			<div className={`fixed top-14 left-0 ${sidebarWidth} h-[calc(100vh-4rem)] border-r-2 border-gray-200`}>
				<Sidebar></Sidebar>
			</div>

			<div className={`${contentWidth} flex-1 p-4 h-[calc(100vh-4rem)] overflow-y-scroll bg-gray-100`}>
				{children}
			</div>
		</div>
	</>
}

export default function RootLayout({
									   children,
								   }: Readonly<{
	children: React.ReactNode;
}>) {

	const interfaceStore = createInterfaceStore();
	const organisationStore = createOrganisationStore();

	return (<>
			<InterfaceStoreContext.Provider value={interfaceStore}>
				<OrganisationStoreContext.Provider value={organisationStore}>
					<HomeOrganisationPage>
						{children}
					</HomeOrganisationPage>
				</OrganisationStoreContext.Provider>
			</InterfaceStoreContext.Provider>

		</>
	);
}
