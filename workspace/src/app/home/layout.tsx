import type { Metadata } from 'next';
import Sidebar from '@/components/sidebar';
import Navbar from '@/components/navbar';


export const metadata: Metadata = {
	title: 'Carmentis | Workspace',
};

export default function RootLayout({
									   children,
								   }: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<>
			{children}
		</>
	);
}
