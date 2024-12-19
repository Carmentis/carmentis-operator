import { createStore } from 'zustand/index';
import { createContext, ReactNode } from 'react';


export type InterfaceState = {
	sidebarHidden: boolean;
}

export type InterfaceActions = {
	toggleSidebar: () => void
}

export type InterfaceStore = InterfaceState & InterfaceActions

export const defaultInitState: InterfaceState = {
	sidebarHidden: true,
}

export const createInterfaceStore = (
	initState: InterfaceState = defaultInitState,
) => {
	return createStore<InterfaceStore>()((set) => ({
		...initState,
		toggleSidebar: () => set((state) => ({ sidebarHidden: !state.sidebarHidden })),
	}))
}