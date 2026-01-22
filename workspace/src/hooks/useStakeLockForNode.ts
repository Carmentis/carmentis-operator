import useOrganizationBreakdown from '@/hooks/useOrganizationBreakdown';
import { NodeEntity } from '@/generated/graphql';
import { useAsync } from 'react-use';
import { CMTSToken, Hash, NodeStakingLock, ProviderFactory } from '@cmts-dev/carmentis-sdk/client';
import useSWR from 'swr';

export default function useStakeLockForNode(node: NodeEntity) {
	const {value: breakdown} = useOrganizationBreakdown();
	const {data, isLoading, error} = useSWR<NodeStakingLock | undefined>(
		["stake", node.nodeAlias],
		async () => {
			const provider = ProviderFactory.createInMemoryProviderWithExternalProvider(node.rpcEndpoint);
			const nodeStatus = await provider.getNodeStatus(node.rpcEndpoint);
			const result = nodeStatus.result;
			const cometPublicKey = result.validator_info.pub_key.value;
			const validatorNodeId = await provider.getValidatorNodeIdByCometbftPublicKey(cometPublicKey);
			const res = breakdown?.getNodeStakingLock(validatorNodeId);
			console.log("Node staking lock for node", node.nodeAlias, res);
			return res;
		}
	)
	return {value: data, loading: isLoading, error}
}