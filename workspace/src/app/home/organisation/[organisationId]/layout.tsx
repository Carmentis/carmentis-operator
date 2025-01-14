'use client';

import Sidebar from '@/app/home/organisation/[organisationId]/sidebar';
import Navbar from '@/app/home/organisation/[organisationId]/navbar';
import { PropsWithChildren, useEffect } from 'react';

import { fetchOrganisation } from '@/components/api.hook';
import { notFound, useParams } from 'next/navigation';
import { Spinner } from '@material-tailwind/react';
import { OrganisationStoreContextProvider, useOrganisationStoreContext } from '@/contexts/organisation-store.context';
import { OrganisationMutationContextProvider } from '@/contexts/organisation-mutation.context';
import NavbarSidebarLayout from '@/components/navbar-sidebar-layout.component';


function HomeOrganisationPage(
	{
		children,
	}: Readonly<{ children: React.ReactNode; }>,
) {

	return <NavbarSidebarLayout
		sidebar={<Sidebar />}
		navbar={<Navbar />}
	>
		{children}
	</NavbarSidebarLayout>;
}


function OrganisationDataAccess({ children }: PropsWithChildren) {
	// search the organisation by id and redirect to not found if do not exist
	const params = useParams();
	const organisationId = params.organisationId;
	const { data, isLoading, error, mutate } = fetchOrganisation(parseInt(organisationId));
	const organisationStoreContext = useOrganisationStoreContext();

	// synchronise the organisation state
	useEffect(() => {
		organisationStoreContext.setOrganisation(data);
	}, [data]);

	// display the loading page when checking if the organisation exists
	if (!data || isLoading || !organisationStoreContext.organisation) {
		return <div className="flex items-center justify-center w-screen h-screen">
			<Spinner width={100} height={100} />
		</div>;
	}


	// if not found, redirect to the not found page
	if (error) {
		notFound();
	}

	// create the organisation reader context and organisation mutation context
	return <OrganisationMutationContextProvider mutate={mutate}>
		{children}
	</OrganisationMutationContextProvider>;
}

export default function RootLayout({ children }: PropsWithChildren) {

	return <>
		<OrganisationStoreContextProvider>
			<OrganisationDataAccess>
				<HomeOrganisationPage>
					{children}
				</HomeOrganisationPage>
			</OrganisationDataAccess>
		</OrganisationStoreContextProvider>
	</>;
}
