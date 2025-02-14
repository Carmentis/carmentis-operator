import OrganisationsList from '@/app/admin/organisation/organisation-list';


export default function RootLayout({
									   children,
								   }: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<div className={"flex flex-row h-full space-x-4"}>
			<div className="w-3/12 min-w-72">
				<OrganisationsList></OrganisationsList>
			</div>
			<div className="w-9/12">
				{children}
			</div>
		</div>
	);
}


