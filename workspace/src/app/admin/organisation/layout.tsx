import OrganisationSidebar from '@/app/admin/organisation/sidebar';


export default function RootLayout({
									   children,
								   }: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<div className={"flex flex-row h-full"}>
			<OrganisationSidebar></OrganisationSidebar>
			<div className={"ml-60 w-full"}>

				{children}
			</div>
		</div>
	);
}


