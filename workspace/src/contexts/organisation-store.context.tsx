import { Organisation } from '@/entities/organisation.entity';
import { createContext, Dispatch, PropsWithChildren, SetStateAction, useContext, useState } from 'react';
import { organisationAtom } from '@/app/home/organisation/atom';
import { useAtomValue } from 'jotai';


export function OrganisationStoreContextProvider({children}: PropsWithChildren) {

	return ({children});
}


export function useOrganisationContext(): Organisation {
	const organisation = useAtomValue(organisationAtom);
	if (!organisation) throw new Error("Organisation is undefined!")
	return organisation;
}