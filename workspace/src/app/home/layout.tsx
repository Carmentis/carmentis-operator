import type { Metadata } from 'next';


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
