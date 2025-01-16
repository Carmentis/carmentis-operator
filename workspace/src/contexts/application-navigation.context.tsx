'use client';

import { createContext, PropsWithChildren, startTransition, useContext, useState } from 'react';
import { useRouter } from 'next/navigation';

export const ApplicationNavigationContext = createContext<NavigationInterface|null>(null);

export interface NavigationInterface {
	navigateToHome: () => void,
	navigateToAdmin: () => void,
	navigateToIndex: () => void,
	navigateToOrganisation: (organisationId: number) => void
	navigateToLogin: () => void;
	navigateToOperatorStatus(): void;
	navigateToSetup(): void;
}



export function ApplicationNavigationContextProvider({ children }: PropsWithChildren) {
	const router = useRouter();

	const navigate = (url: string) => {
		// Wrap the navigation in React's startTransition to improve transitions
		startTransition(() => {
			router.push(url);
		});
	};

	const navigation: NavigationInterface = {
		navigateToHome: () => navigate('/home'),
		navigateToOrganisation: (id) => navigate(`/home/organisation/${id}`),
		navigateToAdmin: () => navigate(`/admin`),
		navigateToIndex: () => navigate('/'),
		navigateToLogin: () => navigate('/'),
		navigateToOperatorStatus: () => navigate('/operator-status'),
		navigateToSetup: () => navigate('/setup')
	}

	return <ApplicationNavigationContext.Provider value={navigation}>
			{children}
	</ApplicationNavigationContext.Provider>
}

export function useApplicationNavigationContext() : NavigationInterface  {
	const context = useContext(ApplicationNavigationContext);
	if (context == null) throw new Error('Cannot use ApplicationNavigation outside of ApplicationNavigationContext');
	return context;

}