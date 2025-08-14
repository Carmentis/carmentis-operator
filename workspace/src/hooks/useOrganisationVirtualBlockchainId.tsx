import { useGetOrganisationQuery } from '@/generated/graphql';


export default function useOrganisationVirtualBlockchainId({organisationId}: {organisationId: number}) {
	const {data: organisation, loading, error} = useGetOrganisationQuery({
		variables: {
			id: organisationId
		}
	});

	return { virtualBlockchainId: organisation?.organisation?.virtualBlockchainId, loading, error }
}