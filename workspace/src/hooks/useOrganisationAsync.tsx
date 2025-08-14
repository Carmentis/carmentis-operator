import { useParams } from 'next/navigation';
import { useGetOrganisationQuery } from '@/generated/graphql';
import { useAtom } from 'jotai/index';
import { organisationAtom } from '@/app/home/organisation/atom';
import { useEffect } from 'react';
import { useSetAtom } from 'jotai';

export default function useOrganisationAsync() {
	const params = useParams();
	const organisationId = parseInt(params.organisationId as string);
	const { data, loading, error, refetch } = useGetOrganisationQuery({
		variables: { id: organisationId }
	});
	const setOrganisation = useSetAtom(organisationAtom);
	useEffect(() => {
		setOrganisation(data)
	}, [data]);


	return {organisation: data, loading, error, refetch}
}