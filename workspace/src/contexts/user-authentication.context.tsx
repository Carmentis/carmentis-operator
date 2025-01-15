'use client';

import { AuthenticatedUserDetailsResponse, useFetchAuthenticatedUser } from '@/components/api.hook';
import { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react';
import FullPageLoadingComponent from '@/components/full-page-loading.component';

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
	const currentUserDetails = useFetchAuthenticatedUser();

	useEffect(() => {
		setCurrentUser(currentUserDetails.data);
	}, [currentUserDetails.data]);


	if (!currentUserDetails.data || currentUserDetails.isLoading)
		return <FullPageLoadingComponent/>

	if (currentUserDetails.error)
		return <h1>An error has been occurred</h1>


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
		{children}
	</UserAuthenticationContext.Provider>
}


export function useAuthenticationContext() {
	const context = useContext(UserAuthenticationContext);
	if (context === undefined) {
		throw new Error('Cannot use useAuthenticateUser outside of UserAuthenticationContextProvider')
	}
	return context;

}
