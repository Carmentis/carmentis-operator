'use client';

import 'bootstrap-icons/font/bootstrap-icons.min.css';
import './globals.css';
import 'react-loading-skeleton/dist/skeleton.css';
import { toast, ToastContainer as ToastifyContainer } from 'react-toastify';
import { createContext, useContext, useEffect, useState } from 'react';
import { CurrentUserDetailsResponse, useFetchCurrentUserDetails } from '@/components/api.hook';

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
export type CurrentUser = CurrentUserDetailsResponse;

export const CurrentUserContext = createContext<CurrentUser | undefined>(undefined);
export const useCurrentUser = () => useContext(CurrentUserContext);

/**
 * RootLayout component that provides the layout structure of the application,
 * including context for the current user and centralized toast notifications.
 *
 * @param {Object} props - The props object.
 * @param {React.ReactNode} props.children - The child components or elements to be rendered inside the layout.
 * @return {JSX.Element} The React component representing the root layout.
 */
export default function RootLayout({
									   children,
								   }: { children: React.ReactNode }) {
	const [currentUser, setCurrentUser] = useState<CurrentUser | undefined>(undefined);

	const currentUserDetails = useFetchCurrentUserDetails();
	useEffect(() => {
		setCurrentUser(currentUserDetails.data);
	}, [currentUserDetails.data]);

	return (
		<CurrentUserContext.Provider value={currentUser}>
			<html lang="en">
			<body>
			{/* Centralized ToastContainer with extracted configurations */}
			<ToastifyContainer {...toastConfig} />
			{children}
			</body>
			</html>
		</CurrentUserContext.Provider>
	);
}