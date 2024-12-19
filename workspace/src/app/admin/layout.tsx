'use client';

import { create, createStore } from 'zustand';
import { createContext, ReactNode, useContext, useEffect, useRef } from 'react';
import type {} from '@redux-devtools/extension'
import { QueryClient } from '@tanstack/query-core';
import { QueryClientProvider } from '@tanstack/react-query';
import { useStore } from 'zustand/index';
import AdminSidebar from '@/app/admin/admin-sidebar';
import AdminNavbar from '@/app/admin/admin-navbar'; // required for devtools typing





export interface AdminState {
	organisations: { id: string; name: string }[];
}


export type InterfaceState = {
	sidebarHidden: boolean;
}

export type InterfaceActions = {
	toggleSidebar: () => void
}

export type InterfaceStore = InterfaceState & InterfaceActions

export const defaultInitState: InterfaceState = {
	sidebarHidden: false,
}

export const createInterfaceStore = (
	initState: InterfaceState = defaultInitState,
) => {
	return createStore<InterfaceStore>()((set) => ({
		...initState,
		toggleSidebar: () => set((state) => ({ sidebarHidden: !state.sidebarHidden })),
	}))
}



export type InterfaceStoreApi = ReturnType<typeof createInterfaceStore>

export const InterfaceStoreContext = createContext<InterfaceStoreApi | undefined>(
	undefined,
)

export interface InterfaceStoreProviderProps {
	children: ReactNode
}





const defaultAdminState = {
	organizations: [],
}
export const AdminDataContext = createContext<AdminState>(defaultAdminState);





function AdminComponent(
	{ children, }: Readonly<{ children: React.ReactNode; }>
) {
	// the classes when the navbar is hidden
	const context = useContext(InterfaceStoreContext)
	const store = useStore(context, (state) => state)
	const bodyClass = store.sidebarHidden ?
		"ml-12" : "ml-72";
	const navbarClass = store.sidebarHidden ?
		"left-12" : "left-72";

	return <>
		<AdminSidebar></AdminSidebar>

		<div className="flex flex-1">
			<div className={`fixed ${navbarClass} w-full border-r-2 border-gray-200`}>
				<AdminNavbar></AdminNavbar>
			</div>
			<div className={`${bodyClass} mt-14 flex-1 h-[calc(100vh-4rem)] overflow-y-scroll`}>
				{children}
			</div>

		</div>
	</>
}

export default function RootLayout(
	{ children, }: Readonly<{ children: React.ReactNode; }>)
{

	const useAdminDataStore =  create<AdminState>((set) => defaultAdminState);
	const storeRef = useRef<InterfaceStoreApi>( createInterfaceStore())
	const queryClient = new QueryClient();

	return (
		<>
			<QueryClientProvider client={queryClient}>
				<InterfaceStoreContext.Provider value={storeRef.current}>
					<AdminDataContext.Provider value={{ useAdminDataStore }}>
						<AdminComponent>
							{children}
						</AdminComponent>
					</AdminDataContext.Provider>
				</InterfaceStoreContext.Provider>

			</QueryClientProvider>
		</>
	);
}

/*
<div className={"p-4"}>
				<ul className="">
					<li>
						<button type="button"
								className="flex items-center w-10 p-2 text-base text-gray-900 transition duration-75 rounded-lg group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
								aria-controls="dropdown-example" data-collapse-toggle="dropdown-example">
							<i className={`bi bi-person flex-shrink-0 w-5 h-5 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white`}></i>
							<span
								className="flex-1 ms-3 text-left rtl:text-right whitespace-nowrap">Administrators</span>
							<i className={"bi bi-arrow-right"}></i>
						</button>
					</li>

				</ul>
			</div>
			<div className="flex flex-1">
				<div className="fixed top-14 left-0 w-96 h-[calc(100vh-4rem)] border-r-2 border-gray-200">

				</div>

				<div className="ml-96 flex-1 p-4 h-[calc(100vh-4rem)] bg-gray-50 overflow-y-scroll">
					{children}
				</div>
			</div>
 */
