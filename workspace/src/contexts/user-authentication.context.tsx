'use client';

import { AuthenticatedUserDetailsResponse, useFetchAuthenticatedUser } from '@/components/api.hook';
import { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react';
import FullPageLoadingComponent from '@/components/full-page-loading.component';
import { useApplicationNavigationContext } from '@/contexts/application-navigation.context';

export type UserAuthentication = {
	authenticatedUser: AuthenticatedUserDetailsResponse | undefined,
	getAuthenticatedUser: () => AuthenticatedUserDetailsResponse,
	isAuthenticated: () => boolean,
	connect: (publicKey: string) => void,
	disconnect: () => void
};
const UserAuthenticationContext = createContext<UserAuthentication | undefined>(undefined);


export function UserAuthenticationContextProvider({children}: PropsWithChildren) {
	const [currentUser, setCurrentUser] = useState<AuthenticatedUserDetailsResponse | undefined>(undefined);
	const {data, isLoading, error} = useFetchAuthenticatedUser();
	const navigation = useApplicationNavigationContext();

	useEffect(() => {
		setCurrentUser(data);
	}, [data]);

	// if not loading but data not available, redirect to the list of organisation
	if (!data && !isLoading || error) {
		return navigation.navigateToIndex();
	}

	if (!data || isLoading)
		return <FullPageLoadingComponent/>

	if (error)
		navigation.navigateToLogin();


	const state : UserAuthentication = {
		authenticatedUser: currentUser,
		isAuthenticated: () => currentUser !== undefined,
		connect: (pk: string) => {},
		disconnect: () => {},
		getAuthenticatedUser: () => {
			if (!currentUser) {
				throw new Error("Cannot access authenticated user: Currently not authenticated")
			}
			return currentUser;
		}
	}



	return <UserAuthenticationContext.Provider value={state}>
		 {currentUser && children}
	</UserAuthenticationContext.Provider>
}


export function useAuthenticationContext() {
	const context = useContext(UserAuthenticationContext);
	if (context === undefined) {
		throw new Error('Cannot use useAuthenticateUser outside of UserAuthenticationContextProvider')
	}
	return context;

}
