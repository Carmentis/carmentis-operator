import { ProviderFactory, CometBFTPublicKey } from '@cmts-dev/carmentis-sdk/client';
import { useAsync } from 'react-use';
import useNodeEndpoint from '@/hooks/useNodeEndpoint';
import { NodeEntity } from '@/generated/graphql';

export default function useOrganizationHoldingNode(node: NodeEntity) {
	const {loading, error, value} = useAsync(async () => {
		const provider = ProviderFactory.createFromNodeUrl(node.rpcEndpoint);
		const nodeStatus = await provider.getNodeStatus();
		const cometPublicKey = CometBFTPublicKey.createFromEd25519PublicKey(nodeStatus.getCometBFTNodePublicKey());
		const validatorNodeId = await provider.getValidatorNodeByCometBFTPublicKey(cometPublicKey);
		const validatorNode = await provider.loadValidatorNode(validatorNodeId);
		const organizationId = validatorNode.getOrganizationId();
		return await provider.loadOrganization(organizationId);
	});

	return {loading: loading, error: error, organisationHoldingNode: value}
}