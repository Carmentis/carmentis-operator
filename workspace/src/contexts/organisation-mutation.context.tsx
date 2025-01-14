import { createContext, PropsWithChildren, useContext } from 'react';

interface OrganisationMutation {
	mutate: () => void,
}


const OrgansationMutationContext = createContext<OrganisationMutation|undefined>(undefined);

export function OrganisationMutationContextProvider({children, mutate}: PropsWithChildren<OrganisationMutation>) {

	return <OrgansationMutationContext value={{mutate: mutate}}>
		{children}
	</OrgansationMutationContext>;
}

export function useOrganisationMutationContext(): OrganisationMutation {
	const context =  useContext(OrgansationMutationContext);
	if (!context) throw new Error("Cannot use useOrganisationMutationContext outside of OrganisationMutationContextProvider");
	return context
}