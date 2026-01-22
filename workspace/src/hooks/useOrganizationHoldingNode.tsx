'use client';

import { ProviderFactory, Hash } from '@cmts-dev/carmentis-sdk/client';
import { useAsync } from 'react-use';
import { NodeEntity } from '@/generated/graphql';

export default function useOrganizationHoldingNode(node: NodeEntity) {
	const {loading, error, value} = useAsync(async () => {
		const provider = ProviderFactory.createInMemoryProviderWithExternalProvider(node.rpcEndpoint);
		const nodeStatus = await provider.getNodeStatus(node.rpcEndpoint);
		const result = nodeStatus.result;
		const cometPublicKey = result.validator_info.pub_key.value;
		const validatorNodeId = await provider.getValidatorNodeIdByCometbftPublicKey(cometPublicKey);
		console.log(`Validator node id for node ${node.nodeAlias}:`, Hash.from(validatorNodeId).encode());
		const validatorNode = await provider.loadValidatorNodeVirtualBlockchain(Hash.from(validatorNodeId));
		const organizationId = await validatorNode.getOrganizationId();
		return await provider.loadOrganizationVirtualBlockchain(organizationId);
	});

	return {loading: loading, error: error, organisationHoldingNode: value}
}