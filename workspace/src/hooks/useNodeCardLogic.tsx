import { useAsyncFn } from 'react-use';
import { useClaimNodeInOrganisationMutation, useDeleteNodeInOrganisationMutation, useStakeNodeInOrganisationMutation, useCancelStakeNodeInOrganisationMutation } from '@/generated/graphql';
import { useOrganisation } from '@/contexts/organisation-store.context';

export function useNodeCardLogic() {
	const [deleteNodeMutation, {loading: deleting, error: deletionError}] = useDeleteNodeInOrganisationMutation();
	const [claimNodeQuery, {loading: claiming, error: claimingError}] = useClaimNodeInOrganisationMutation();
	const [stakeNodeMutation, {loading: staking, error: stakingError}] = useStakeNodeInOrganisationMutation();
	const [cancelStakeNodeMutation, {loading: cancelling, error: cancellingError}] = useCancelStakeNodeInOrganisationMutation();
	const organisation = useOrganisation();


	function deleteNode(nodeId: number) {
		deleteNodeMutation({
			variables: {
				organisationId: organisation.id,
				nodeId
			}
		})
	}

	function claimNode(nodeId: number) {
		claimNodeQuery({
			variables: {
				organisationId: organisation.id,
				nodeId
			}
		})
	}

	function stakeNode(nodeId: number, amount: string) {
		return stakeNodeMutation({
			variables: {
				organisationId: organisation.id,
				nodeId,
				amount
			}
		})
	}

	function cancelStake(nodeId: number, amount: string) {
		return cancelStakeNodeMutation({
			variables: {
				organisationId: organisation.id,
				nodeId,
				amount
			}
		})
	}

	return {
		deleting, deleteNode, deletionError,
		claiming, claimNode, claimingError,
		staking, stakeNode, stakingError,
		cancelling, cancelStake, cancellingError
	}
}