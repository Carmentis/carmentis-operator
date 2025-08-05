import { useAsyncFn } from 'react-use';
import { useClaimNodeInOrganisationMutation, useDeleteNodeInOrganisationMutation } from '@/generated/graphql';
import { useOrganisation } from '@/contexts/organisation-store.context';

export function useNodeCardLogic() {
	const [deleteNodeMutation, {loading: deleting, error: deletionError}] = useDeleteNodeInOrganisationMutation();
	const [claimNode, {loading: claiming, error: claimingError}] = useClaimNodeInOrganisationMutation();
	const organisation = useOrganisation();

	function deleteNode(nodeId: number) {
		deleteNodeMutation({
			variables: {
				organisationId: organisation.id,
				nodeId
			}
		})
	}
	return {
		deleting, deleteNode, deletionError,
		claiming, claimNode, claimingError
	}
}