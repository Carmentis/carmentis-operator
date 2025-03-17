'use client';

import { useFetchOperatorInitialisationStatus } from '@/components/api.hook';
import { useApplicationNavigationContext } from '@/contexts/application-navigation.context';
import { PropsWithChildren,  useState } from 'react';
import { usePathname } from 'next/navigation';
import FullPageLoadingComponent from '@/components/full-page-loading.component';

export function InitialisationStatusContext({children}: PropsWithChildren) {
	const node = process.env.NEXT_PUBLIC_OPERATOR_URL;

	const {data, isLoading, error} = useFetchOperatorInitialisationStatus();
	/*{
		onSuccessData: data => {
			setInitialised(data.initialised)
		},
		onError: error => {
			setErrorEncountered(true)
		}
	});
	 */

	const navigation = useApplicationNavigationContext();
	const pathname = usePathname();

	if (isLoading) return <FullPageLoadingComponent />;
	if (error) return <OperatorErrorAlert
		message={`It seems that the operator located at ${node} is down. (${error.message})`}
	/>
	if ( !data || typeof data.initialised !== 'boolean')return <OperatorErrorAlert
		message={`It seems that the server has responded with invalid data. Are you sure to have correctly set the operator url? Current url set to ${node}.`}
	/>


	const initialised = data.initialised;
	if (!initialised && pathname !== '/setup')
		navigation.navigateToSetup();

	if (pathname === '/operator-status')
		return <>{children}</>

	return <>{children}</>
}


import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';

type ErrorMessageProps = {
	message: string;
};

export function OperatorErrorAlert({ message }: ErrorMessageProps) {
	return (
		<Alert severity="error">
			<AlertTitle>Error</AlertTitle>
			{message}
		</Alert>
	);
}