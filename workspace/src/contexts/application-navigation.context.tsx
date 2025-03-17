'use client';

import { createContext, PropsWithChildren, useContext, useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Spinner from '@/components/spinner';

/**
 * A React context to manage the navigation state of an application.
 *
 * The `ApplicationNavigationContext` provides a mechanism to access and manipulate
 * the application's navigation state within the React component tree.
 * It can be used to manage navigation operations such as routing
 * or handling navigation-related logic.
 *
 * The context is initialized with a value of `null` and is expected to be updated
 * with an implementation of the `NavigationInterface` when used in a provider.
 *
 * Type:
 * NavigationInterface | null
 *
 * Intended Usage:
 * - Provide the context at the top level of your application or specific navigation scope.
 * - Consume the context to access navigation-related methods and properties.
 */
export const ApplicationNavigationContext = createContext<NavigationInterface|null>(null);

/**
 * Provides methods for navigating to various sections or pages within an application.
 */
export interface NavigationInterface {
	navigateToHome: () => void,
	navigateToAdmin: () => void,
	navigateToIndex: () => void,
	navigateToOrganisation: (organisationId: number) => void
	navigateToLogin: () => void;
	navigateToOperatorStatus(): void;
	navigateToSetup(): void;
	navigateToApplication(organisationId: number, applicationId: number): void;
	push(url: string): void,
}



/**
 * Provides the application navigation context, enabling navigation between different routes in the application.
 *
 * @param {Object} props - The component props.
 * @param {React.ReactNode} props.children - The child components to render within the provider.
 *
 * @return {JSX.Element} A context provider that supplies navigation functions and renders a spinner during transitions.
 */
export function ApplicationNavigationContextProvider({ children }: PropsWithChildren) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();

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
		navigateToSetup: () => navigate('/setup'),
		navigateToApplication: (organisationId, appId) => navigate(`/home/organisation/${organisationId}/application/${appId}`),
		push: (url) => navigate(url),
	}

	return <ApplicationNavigationContext.Provider value={navigation}>
		{
			isPending && <FullScreenSpinner/>
		}
			{children}
	</ApplicationNavigationContext.Provider>
}

/**
 * Provides the application navigation context, enabling access to navigation functionality and state.
 * Ensures the hook is used within a valid `ApplicationNavigationContext` provider.
 *
 * @throws {Error} If the hook is used outside of an `ApplicationNavigationContext` provider.
 * @return {NavigationInterface} The navigation interface provided by the application context.
 */
export function useApplicationNavigationContext() : NavigationInterface  {
	const context = useContext(ApplicationNavigationContext);
	if (context == null) throw new Error('Cannot use ApplicationNavigation outside of ApplicationNavigationContext');
	return context;
}

/**
 * A custom hook that provides access to the application's navigation context.
 * It ensures the hook is used within a valid `ApplicationNavigationContext`.
 * Throws an error if used outside the appropriate context.
 *
 * @return {NavigationInterface} The navigation interface from the application navigation context.
 */
export function useCustomRouter() : NavigationInterface  {
	const context = useContext(ApplicationNavigationContext);
	if (context == null) throw new Error('Cannot use ApplicationNavigation outside of ApplicationNavigationContext');
	return context;
}


/**
 * Displays a full-screen spinner component. It covers the entire viewport with a semi-transparent backdrop
 * and centers the spinner element horizontally and vertically.
 *
 * @return {JSX.Element} A JSX element rendering a full-screen spinner with a backdrop.
 */
export function FullScreenSpinner() {
	return (
		<div
			className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50 transition-opacity duration-300">
			<Spinner />
		</div>
	);
}