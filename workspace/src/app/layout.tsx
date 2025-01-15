'use client';

import 'bootstrap-icons/font/bootstrap-icons.min.css';
import './globals.css';
import 'react-loading-skeleton/dist/skeleton.css';
import { toast, ToastContainer as ToastifyContainer, ToastContainerProps } from 'react-toastify';
import { PropsWithChildren } from 'react';
import { ApplicationNavigationContextProvider } from '@/contexts/application-navigation.context';
import { ApplicationInterfaceContextProvider } from '@/contexts/interface.context';
import { MaterialTailwindThemeContextProvider } from '@/contexts/material-taildwind-theme.context';

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
					<html lang="en">
					<body>
					{/* Centralized ToastContainer with extracted configurations */}
					<ToastifyContainer {...toastConfig} />
					{children}
					</body>
					</html>
				</MaterialTailwindThemeContextProvider>
			</ApplicationInterfaceContextProvider>
		</ApplicationNavigationContextProvider>
	)
		;
}