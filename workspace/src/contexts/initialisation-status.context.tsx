'use client';

import { useFetchOperatorInitialisationStatus } from '@/components/api.hook';
import { useApplicationNavigationContext } from '@/contexts/application-navigation.context';
import { PropsWithChildren,  useState } from 'react';
import { usePathname } from 'next/navigation';
import FullPageLoadingComponent from '@/components/full-page-loading.component';

export function InitialisationStatusContext({children}: PropsWithChildren) {
	const [initialised, setInitialised] = useState<boolean | undefined>(undefined);
	const [errorEncountered, setErrorEncountered] = useState(false);

	useFetchOperatorInitialisationStatus({
		onSuccessData: data => {
			setInitialised(data.initialised)
		},
		onError: error => {
			setErrorEncountered(true)
		}
	});

	const navigation = useApplicationNavigationContext();
	const pathname = usePathname();

	if (errorEncountered && pathname !== '/operator-setup') {
		navigation.navigateToOperatorStatus();
		return <h1>Redirecting to operator status...</h1>
	}

	if (initialised === false && pathname !== '/setup')
		navigation.navigateToSetup();

	if (initialised === undefined && pathname !== '/operator-setup')
		return <FullPageLoadingComponent/>

	if (initialised !== undefined && pathname === '/operator-status')
		return <>{children}</>

	return <>{children}</>
}