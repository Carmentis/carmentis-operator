import { Organisation } from '@/entities/organisation.entity';
import { createContext, Dispatch, PropsWithChildren, SetStateAction, useContext, useState } from 'react';

interface OrganisationStore {
	organisation: Organisation | undefined,
	setOrganisation: Dispatch<SetStateAction<Organisation|undefined>>
}

const OrganisationStoreContext = createContext<OrganisationStore|undefined>(undefined);
export function OrganisationStoreContextProvider({children}: PropsWithChildren) {
	const [organisation, setOrganisation] = useState<Organisation|undefined>(undefined);

	return (
        <OrganisationStoreContext.Provider value={{ organisation, setOrganisation }}>
            {children}
        </OrganisationStoreContext.Provider>
    );
}

export function useOrganisationStoreContext(): OrganisationStore {
	const context = useContext(OrganisationStoreContext);
	if (!context) throw new Error('Cannot use useOrganisationStoreContext outside of OrganisationStoreContextProvider');
	return context;
}

export function useOrganisationContext(): Organisation {
	const context = useOrganisationStoreContext();
	if (!context.organisation) throw new Error("Cannot access undefined organisation");
	return context.organisation;
}