'use client';

import Sidebar from '@/app/home/organisation/[organisationId]/sidebar';
import Navbar from '@/app/home/organisation/[organisationId]/navbar';
import { PropsWithChildren, useEffect } from 'react';

import { useFetchOrganisation } from '@/components/api.hook';
import { useParams } from 'next/navigation';
import { OrganisationStoreContextProvider } from '@/contexts/organisation-store.context';
import { OrganisationMutationContextProvider } from '@/contexts/organisation-mutation.context';
import NavbarSidebarLayout from '@/components/navbar-sidebar-layout.component';
import NotFoundPage from '@/app/home/organisation/[organisationId]/not-found';
import FullPageLoadingComponent from '@/components/full-page-loading.component';
import { useApplicationNavigationContext } from '@/contexts/application-navigation.context';
import { useToast } from '@/app/layout';
import { useAtom, useSetAtom } from 'jotai';
import { organisationAtom } from '@/app/home/organisation/atom';


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
	const organisationId = parseInt(params.organisationId as string);
	const { data, isLoading, error, mutate } = useFetchOrganisation(organisationId);
	const [organisation, setOrganisation] = useAtom(organisationAtom);
	const navigation = useApplicationNavigationContext();
	const notify = useToast();

	// synchronise the organisation state
	useEffect(() => {
		setOrganisation(data);
	}, [data]);

	// if not loading but data not available, redirect to the list of organisation
	if (!data && !isLoading || error) {
		notify.info("Cannot load organisation")
		navigation.navigateToHome();
		return <NotFoundPage/>
	}

	// display the loading page when checking if the organisation exists
	if (!data || isLoading || !organisation) {
		return <FullPageLoadingComponent label={'Loading organisation'} />
	}


	// if not found, redirect to the not found page
	if (error !== undefined) {
		return <NotFoundPage/>
	}

	// create the organisation reader context and organisation mutation context
	return <OrganisationMutationContextProvider mutate={mutate}>
		{children}
	</OrganisationMutationContextProvider>;
}

export default function RootLayout({ children }: PropsWithChildren) {
	return <>
		<OrganisationDataAccess>
			<HomeOrganisationPage>
				{children}
			</HomeOrganisationPage>
		</OrganisationDataAccess>
	</>;
}
