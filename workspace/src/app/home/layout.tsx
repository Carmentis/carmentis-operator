import type { Metadata } from 'next';
import { PropsWithChildren } from 'react';
import { UserAuthenticationContextProvider } from '@/contexts/user-authentication.context';


export const metadata: Metadata = {
	title: 'Carmentis | Workspace',
};

export default function RootLayout({ children }: PropsWithChildren) {
	return (
		<>
			<UserAuthenticationContextProvider>
				{children}
			</UserAuthenticationContextProvider>
		</>
	);
}
