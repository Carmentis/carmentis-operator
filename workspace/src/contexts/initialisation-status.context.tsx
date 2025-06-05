'use client';

import { useApplicationNavigationContext } from '@/contexts/application-navigation.context';
import { PropsWithChildren } from 'react';
import { usePathname } from 'next/navigation';
import FullPageLoadingComponent from '@/components/full-page-loading.component';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import { useIsInitialisedQuery } from '@/generated/graphql';

/**
 * Context component that checks the initialization status of the operator.
 * Redirects to setup page if the operator is not initialized.
 * Shows error alerts if there are connection issues or invalid responses.
 * 
 * @param props - Component props
 * @param props.children - Child components to render when operator status is valid
 * @returns React component
 */
export function InitialisationStatusContext({children}: PropsWithChildren) {
	const node = process.env.NEXT_PUBLIC_OPERATOR_URL;
	const {data, loading: isLoading, error} = useIsInitialisedQuery();
	const navigation = useApplicationNavigationContext();
	const pathname = usePathname();

	// Show loading component while fetching initialization status
	if (isLoading) return <FullPageLoadingComponent />;

	// Show error alert if there's a connection error
	if (error) return <OperatorErrorAlert
		message={`It seems that the operator located at ${node} is down. (${error.message})`}
	/>

	// Show error alert if the response data is invalid
	if (!data || typeof data.isInitialised !== 'boolean') return <OperatorErrorAlert
		message={`It seems that the server has responded with invalid data. Are you sure to have correctly set the operator url? Current url set to ${node}.`}
	/>

	const initialised = data.isInitialised;

	// Redirect to setup page if operator is not initialized and we're not already on the setup page
	if (!initialised && pathname !== '/setup')
		navigation.navigateToSetup();

	// Render children regardless of initialization status on the operator-status page
	// or when the operator is properly initialized
	return <>{children}</>;
}

/**
 * Props for the OperatorErrorAlert component
 */
type ErrorMessageProps = {
	/** Error message to display */
	message: string;
};

/**
 * Component to display error alerts related to operator issues.
 * 
 * @param props - Component props
 * @param props.message - Error message to display
 * @returns React component
 */
export function OperatorErrorAlert({ message }: ErrorMessageProps) {
	return (
		<Alert severity="error">
			<AlertTitle>Error</AlertTitle>
			{message}
		</Alert>
	);
}
