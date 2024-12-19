import { createStore } from 'zustand/index';
import { createContext, ReactNode } from 'react';
import { GetOrganisationResponse } from '@/components/api.hook';


export interface OrganisationState {
	organisation: GetOrganisationResponse | null;
}


export type OrganisationActions = {
}

export type OrganisationStore = OrganisationState  & OrganisationActions;

export const defaultInitState: OrganisationState = {
	organisation: null
}

export const createOrganisationStore = (
	initState: OrganisationState = defaultInitState,
) => {
	return createStore<OrganisationStore>()((set) => ({
		...initState,
	}))
}