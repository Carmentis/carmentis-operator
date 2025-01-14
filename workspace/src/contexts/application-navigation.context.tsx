import { createContext, PropsWithChildren, startTransition, Suspense, useContext, useState } from 'react';
import { useRouter } from 'next/navigation';
import Skeleton from 'react-loading-skeleton';
import { Spinner } from '@material-tailwind/react';

export const ApplicationNavigationContext = createContext<NavigationInterface|null>(null);

export interface NavigationInterface {
	navigateToHome: () => void,
	navigateToAdmin: () => void,
	navigateToIndex: () => void,
	navigateToOrganisation: (organisationId: number) => void
}



export function ApplicationNavigationContextProvider({ children }: PropsWithChildren) {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);

	const navigate = (url: string) => {
		setIsLoading(true);

		// Wrap the navigation in React's startTransition to improve transitions
		startTransition(() => {
			router.push(url);
		});

		// Simulate loading until navigation is complete
		setTimeout(() => {
			setIsLoading(false);  // You might need a more reliable way to determine when the navigation is complete
		}, 500); // Adjust this timeout as needed
	};

	const navigation: NavigationInterface = {
		navigateToHome: () => navigate('/home'),
		navigateToOrganisation: (id) => navigate(`/home/organisation/${id}`),
		navigateToAdmin: () => navigate(`/admin`),
		navigateToIndex: () => navigate('/')
	}

	return <ApplicationNavigationContext.Provider value={navigation}>
		{
			isLoading && <Spinner/>
		}
			{!isLoading && children}
	</ApplicationNavigationContext.Provider>
}

export function useApplicationNavigationContext() : NavigationInterface  {
	const context = useContext(ApplicationNavigationContext);
	if (context == null) throw new Error('Cannot use ApplicationNavigation outside of ApplicationNavigationContext');
	return context;

}