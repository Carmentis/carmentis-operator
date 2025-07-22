'use client';

import { PropsWithChildren, useEffect } from 'react';

import { useParams } from 'next/navigation';
import { OrganisationMutationContextProvider } from '@/contexts/organisation-mutation.context';
import NotFoundPage from '@/app/home/organisation/[organisationId]/not-found';
import { useApplicationNavigationContext } from '@/contexts/application-navigation.context';
import { useToast } from '@/app/layout';
import { useAtom } from 'jotai';
import { organisationAtom } from '@/app/home/organisation/atom';
import { useGetOrganisationQuery } from '@/generated/graphql';
import FullSpaceSpinner from '@/components/FullSpaceSpinner';



function OrganisationDataAccess({ children }: PropsWithChildren) {
	// search the organisation by id and redirect to not found if do not exist
	const params = useParams();
	const organisationId = parseInt(params.organisationId as string);
	const { data, loading, error, refetch } = useGetOrganisationQuery({
		variables: { id: organisationId }
	});
	const [organisation, setOrganisation] = useAtom(organisationAtom);
	const navigation = useApplicationNavigationContext();
	const notify = useToast();

	// synchronise the organisation state
	useEffect(() => {
		if (data && data.organisation) {
			setOrganisation(data);
		}
	}, [data]);

	// if not loading but data not available, redirect to the list of organisation
	if (!data && !loading || error) {
		console.error(error)
		notify.info(`Cannot load organisation: ${error?.message ?? ''}`);
		navigation.navigateToHome();
		return <NotFoundPage/>
	}

	// display the loading page when checking if the organisation exists
	if (!data || !data.organisation || loading || !organisation) {
		return <FullSpaceSpinner label={'Loading organisation'} />
	}


	// if not found, redirect to the not found page
	if (error !== undefined) {
		return <NotFoundPage/>
	}

	// create the organisation reader context and organisation mutation context
	return <OrganisationMutationContextProvider mutate={() => refetch()}>
		{children}
	</OrganisationMutationContextProvider>;
}

export default function RootLayout({ children }: PropsWithChildren) {
	return <>
		<OrganisationDataAccess>
			{children}
		</OrganisationDataAccess>
	</>;
}
