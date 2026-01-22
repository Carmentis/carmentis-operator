import { CMTSToken, NodeStakingLock, ProviderFactory, RPCNodeStatusResponseType } from '@cmts-dev/carmentis-sdk/client';
import useOrganizationBreakdown from '@/hooks/useOrganizationBreakdown';
import useSWR from 'swr';
import { NodeEntity } from '@/generated/graphql';
import { useAsync } from 'react-use';
import { any } from 'zod';

export type NodeStatusResult = {
	nodeStatus: RPCNodeStatusResponseType,
	isClaimed: false,
} | {
	nodeStatus: RPCNodeStatusResponseType,
	isClaimed: true,
	stake?: {
		lockedAmount: string,
		plannedSlashingAmount: string,
		isSlashed: boolean,
		plannedUnlockAmount: string,
		unlockDate: string
	}
}
export default function useNodeStatus(node: NodeEntity) {

	const {value: breakdown} = useOrganizationBreakdown();
	return useAsync(async (): Promise<NodeStatusResult> => {
		// we fetch the status of the node
		const provider = ProviderFactory.createInMemoryProviderWithExternalProvider(node.rpcEndpoint);
		const nodeStatus = await provider.getNodeStatus(node.rpcEndpoint);
		const result = nodeStatus.result;
		const cometPublicKey = result.validator_info.pub_key.value;

		// we identity if the node is claimed or not
		let validatorNodeId: Uint8Array;
		try {
			validatorNodeId = await provider.getValidatorNodeIdByCometbftPublicKey(cometPublicKey);
		} catch (e) {
			console.error("Error obtained when loading validator node id:", e);
			return { nodeStatus, isClaimed: false }
		}

		// the node is already claimed, so we attempt to fetch the staking lock if any
		const res = breakdown?.getNodeStakingLock(validatorNodeId);
		if (res === undefined) {
			return {
				nodeStatus,
				isClaimed: true,
				stake: undefined
			}
		}

		const parameters = res.parameters;
		const lockedAmount = CMTSToken.createAtomic(res.lockedAmountInAtomics).toString()
		const plannedSlashingAmount = CMTSToken.createAtomic(parameters.plannedSlashingAmountInAtomics).toString();
		const isSlashed = parameters.slashed;
		const plannedUnlockAmount = CMTSToken.createAtomic(parameters.plannedUnlockAmountInAtomics).toString();
		const plannedUnlockTimestamp = parameters.plannedUnlockTimestamp;
		const unlockDate = plannedUnlockTimestamp !== 0
			? new Date(plannedUnlockTimestamp * 1000).toLocaleString()
			: 'N/A';

		console.log(res)
		return {
			nodeStatus,
			isClaimed: true,
			stake: {
				lockedAmount,
				plannedSlashingAmount,
				isSlashed,
				plannedUnlockAmount,
				unlockDate
			}
		}
	}, [breakdown])
}