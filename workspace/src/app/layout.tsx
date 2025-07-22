'use client';

import 'bootstrap-icons/font/bootstrap-icons.min.css';
import './globals.css';
import 'react-loading-skeleton/dist/skeleton.css';
import { toast, ToastContainer as ToastifyContainer, ToastContainerProps } from 'react-toastify';
import { PropsWithChildren } from 'react';
import { ApplicationNavigationContextProvider } from '@/contexts/application-navigation.context';
import { ApplicationInterfaceContextProvider } from '@/contexts/interface.context';
import { MuiThemeContextProvider } from '@/contexts/mui-theme.context';
import { InitialisationStatusContext } from '@/contexts/initialisation-status.context';
import { ModalProvider as ReactModalHookProvider } from 'react-modal-hook';
import { ModalProvider } from '@/contexts/popup-modal.component';
import { ApolloError, ApolloProvider } from '@apollo/client';
import { apolloClient } from '@/app/apollo-client';
import { GraphQLFormattedError } from 'graphql/error';
import {PublicEnvScript} from "next-runtime-env";


// Constants for reusability and manage ToastContainer configuration
const toastConfig: ToastContainerProps = {
	position: 'bottom-center',
	autoClose: 5000,
	hideProgressBar: false,
	closeOnClick: true,
	pauseOnHover: true,
	draggable: true,
};

// toast hooks into a single utility for consistent usage
type handledErrorTypes = string | string[] | readonly GraphQLFormattedError[] | ApolloError;
export const useToast = () => {

	function handleError(message: handledErrorTypes) {
		console.log(message);
		if (typeof message == 'string') toast.error(message);
		else if (Array.isArray(message) && message.every(item => typeof item === 'string')) {
			message.forEach(item => toast.error(item));
		} else if ('message' in message && typeof message.message === 'string') {
			toast.error(message.message);
		} else {
			toast.error('An error occurred.');
		}
	}

	return {
		success: (message: string) => toast.success(message),
		error: (message: handledErrorTypes) => handleError(message),
		info: (message: string) => toast.info(message),
		warning: (message: string) => toast.warn(message),
		notify: (message: string) => toast(message),
	};
};

// CurrentUser type definition


/**
 * RootLayout component that provides the layout structure of the application,
 * including context for the current user and centralized toast notifications.
 *
 * @param {Object} props - The props object.
 * @param {React.ReactNode} props.children - The child components or elements to be rendered inside the layout.
 * @return {JSX.Element} The React component representing the root layout.
 */
export default function RootLayout({ children }: PropsWithChildren) {

	return (
		<html lang="en">
		<body>
			<PublicEnvScript/>
			<ApolloProvider client={apolloClient}>
				<ApplicationNavigationContextProvider>
					<InitialisationStatusContext>
						<ApplicationInterfaceContextProvider>
							<MuiThemeContextProvider>
								<ModalProvider>
									<ReactModalHookProvider>
										{children}
									</ReactModalHookProvider>
								</ModalProvider>
								{/* Centralized ToastContainer with extracted configurations */}
								<ToastifyContainer {...toastConfig} />
							</MuiThemeContextProvider>
						</ApplicationInterfaceContextProvider>
					</InitialisationStatusContext>
				</ApplicationNavigationContextProvider>
			</ApolloProvider>
		</body>
		</html>
	)
		;
}
