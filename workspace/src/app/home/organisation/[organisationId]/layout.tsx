'use client';

import Sidebar from '@/app/home/organisation/[organisationId]/sidebar';
import Navbar from '@/app/home/organisation/[organisationId]/navbar';
import { createContext, useContext, useState } from 'react';
import {
	createOrganisationStore,
	OrganisationStore,
} from '@/app/home/organisation/[organisationId]/organisation.store';
import { StoreApi } from 'zustand';
import { fetchOrganisation } from '@/components/api.hook';
import { notFound, useParams } from 'next/navigation';
import { Spinner } from '@material-tailwind/react';


export type InterfaceState = {
	sidebarHidden: boolean;
}
export type InterfaceActions = {
	toggleSidebar: () => void
}

export type InterfaceStore = InterfaceState & InterfaceActions
export const UserInterfaceStoreContext = createContext<InterfaceStore>({
	sidebarHidden: true,
	toggleSidebar: () => {}
})




export const OrganisationStoreContext = createContext<StoreApi<OrganisationStore> | undefined>(undefined);

function HomeOrganisationPage(
	{
		children,
	}: Readonly<{ children: React.ReactNode; }>
) {



	// change the width of the sidebar if closed or not
	const interfaceStore = useContext(UserInterfaceStoreContext);
	const sidebarWidth = interfaceStore.sidebarHidden ? 'w-14' : 'w-64';
	const contentWidth = interfaceStore.sidebarHidden ? 'ml-14' : 'ml-64';


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

	// search the organisation by id and redirect to not found if do not exist
	const params = useParams();
	const organisationId = params.organisationId;
	const {data, loading, error} = fetchOrganisation(organisationId)

	// create the interface store
	const [sidebarHidden, setSidebarHidden] = useState(false);
	const interfaceStore: InterfaceStore = {
		sidebarHidden: sidebarHidden,
		toggleSidebar: () => setSidebarHidden(!sidebarHidden),
	}

	// display the loading page when checking if the organisation exists
	if (loading) {
		return <div className="flex items-center justify-center w-screen h-screen">
			<Spinner width={100} height={100} />
		</div>
	}

	// if not found, redirect to the not found page
	if (error) {
		notFound()
	}



	// create the organisation store
	const organisationStore = createOrganisationStore();

	return (<>
			<UserInterfaceStoreContext.Provider value={interfaceStore}>
				<OrganisationStoreContext.Provider value={organisationStore}>
					<HomeOrganisationPage>
						{children}
					</HomeOrganisationPage>
				</OrganisationStoreContext.Provider>
			</UserInterfaceStoreContext.Provider>

		</>
	);
}
