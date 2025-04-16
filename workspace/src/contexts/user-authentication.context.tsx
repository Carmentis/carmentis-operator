'use client';


export const TOKEN_STORAGE_ITEM = "carmentis-token";

import { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react';
import FullPageLoadingComponent from '@/components/full-page-loading.component';
import { useApplicationNavigationContext } from '@/contexts/application-navigation.context';
import { useGetCurrentUserQuery, UserFragment } from '@/generated/graphql';

export type UserAuthentication = {
	authenticatedUser: UserFragment | undefined,
	getAuthenticatedUser: () => UserFragment,
	isAuthenticated: () => boolean,
	connect: (publicKey: string) => void,
	disconnect: () => void
};
const UserAuthenticationContext = createContext<UserAuthentication | undefined>(undefined);


export function UserAuthenticationContextProvider({children}: PropsWithChildren) {
	const [currentUser, setCurrentUser] = useState<UserFragment | undefined>(undefined);
	const {data, loading: isLoading, error} = useGetCurrentUserQuery();
	//const {data, isLoading, error} = useFetchAuthenticatedUser();
	const navigation = useApplicationNavigationContext();

	useEffect(() => {
		if (data && data.getCurrentUser) {
			setCurrentUser(data.getCurrentUser);
		} else {
			setCurrentUser(undefined);
		}
	}, [data]);

	// if not loading but data not available, redirect to the list of organisation
	if (!data && !isLoading || error) {
		return navigation.navigateToIndex();
	}

	if (isLoading)
		return <FullPageLoadingComponent/>

	if (!data || error)
		return <>An error occurred</>

	if (error || localStorage.getItem(TOKEN_STORAGE_ITEM) === undefined)
		navigation.navigateToLogin();


	const state : UserAuthentication = {
		authenticatedUser: currentUser,
		isAuthenticated: () => currentUser !== undefined,
		connect: (pk: string) => {},
		disconnect: () => {
			localStorage.clear()
		},
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
