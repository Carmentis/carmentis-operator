import { AuthenticatedUserDetailsResponse, useFetchCurrentUserDetails } from '@/components/api.hook';
import { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react';
import { state } from 'sucrase/dist/types/parser/traverser/base';

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
	const currentUserDetails = useFetchCurrentUserDetails();

	useEffect(() => {
		setCurrentUser(currentUserDetails.data);
	}, [currentUserDetails.data]);


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
