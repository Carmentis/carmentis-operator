import { BlockchainFacade, CometBFTPublicKey } from '@cmts-dev/carmentis-sdk/client';
import { useAsync } from 'react-use';
import useNodeEndpoint from '@/hooks/useNodeEndpoint';
import { NodeEntity } from '@/generated/graphql';

export default function useOrganizationHoldingNode(node: NodeEntity) {
	const {loading, error, value} = useAsync(async () => {
		const blockchain = BlockchainFacade.createFromNodeUrl(node.rpcEndpoint);
		const nodeStatus = await blockchain.getNodeStatus();
		const cometPublicKey = CometBFTPublicKey.createFromEd25519PublicKey(nodeStatus.getCometBFTNodePublicKey());
		const validatorNodeId = await blockchain.getValidatorNodeByCometBFTPublicKey(cometPublicKey);
		const validatorNode = await blockchain.loadValidatorNode(validatorNodeId);
		const organizationId = validatorNode.getOrganizationId();
		return await blockchain.loadOrganization(organizationId);
	});

	return {loading: loading, error: error, organisationHoldingNode: value}
}