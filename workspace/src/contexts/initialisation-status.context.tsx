'use client';

import { useApplicationNavigationContext } from '@/contexts/application-navigation.context';
import { PropsWithChildren } from 'react';
import { usePathname } from 'next/navigation';
import FullPageLoadingComponent from '@/components/full-page-loading.component';
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
 * Renders a full-page, responsive, modern interface with a light, glass, cyan design.
 * 
 * @param props - Component props
 * @param props.message - Error message to display
 * @returns React component
 */
export function OperatorErrorAlert({ message }: ErrorMessageProps) {
	return (
		<div className="fixed inset-0 w-full h-full flex items-center justify-center p-4">
			<div className="w-full max-w-2xl p-8 rounded-xl bg-white bg-opacity-30 backdrop-blur-md shadow-lg border border-cyan-200">
				<div className="flex flex-col items-center text-center">
					<div className="text-cyan-600 mb-4">
						<svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
					</div>
					<h1 className="text-2xl font-bold text-cyan-800 mb-2">Connection Error</h1>
					<p className="text-cyan-700 mb-6">{message}</p>
					<div className="text-sm text-cyan-600">
						Please check your connection and try again later.
					</div>
				</div>
			</div>
		</div>
	);
}
