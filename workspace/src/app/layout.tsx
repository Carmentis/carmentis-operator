'use client';

import 'bootstrap-icons/font/bootstrap-icons.min.css';
import './globals.css';
import 'react-loading-skeleton/dist/skeleton.css';
import { toast, ToastContainer as ToastifyContainer } from 'react-toastify';
import { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react';
import { AuthenticatedUserDetailsResponse, useFetchCurrentUserDetails } from '@/components/api.hook';
import { Spinner } from '@material-tailwind/react';
import { ThemeProvider } from '@material-tailwind/react';
import { ApplicationNavigationContextProvider } from '@/contexts/application-navigation.context';
import { ApplicationInterfaceContextProvider } from '@/contexts/interface.context';
import { MaterialTailwindThemeContextProvider } from '@/contexts/material-taildwind-theme.context';
import { UserAuthenticationContextProvider } from '@/contexts/user-authentication.context';

// Constants for reusability and manage ToastContainer configuration
const toastConfig = {
	position: 'bottom-center',
	autoClose: 5000,
	hideProgressBar: false,
	closeOnClick: true,
	pauseOnHover: true,
	draggable: true,
	progress: undefined,
};

// toast hooks into a single utility for consistent usage
export const useToast = () => {
	return {
		success: (message: string) => toast.success(message),
		error: (message: string) => toast.error(message),
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
		<ApplicationNavigationContextProvider>
			<ApplicationInterfaceContextProvider>
				<MaterialTailwindThemeContextProvider>
					<UserAuthenticationContextProvider>
						<html lang="en">
						<body>
						{/* Centralized ToastContainer with extracted configurations */}
						<ToastifyContainer {...toastConfig} />
						{children}
						</body>
						</html>
					</UserAuthenticationContextProvider>
				</MaterialTailwindThemeContextProvider>
			</ApplicationInterfaceContextProvider>
		</ApplicationNavigationContextProvider>
	)
		;
}