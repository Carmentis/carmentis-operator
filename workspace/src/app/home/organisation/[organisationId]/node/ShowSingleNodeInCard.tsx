import StorageIcon from '@mui/icons-material/Storage';
import { useAsync } from 'react-use';
import { BlockchainFacade } from '@cmts-dev/carmentis-sdk/client';
import Skeleton from 'react-loading-skeleton';
import { useState } from 'react';
import {
	useNodeCardDimensions,
} from '@/app/home/organisation/[organisationId]/node/NodeCardDimensions';
import {
	ShowConnectionFailureNodeStatus
} from '@/app/home/organisation/[organisationId]/node/ShowConnectionFailureNodeStatus';
import { Box, Card, Chip, MenuItem, TextField, Typography } from '@mui/material';
import { NodeEntity } from '@/generated/graphql';
import ThreeDotsMenu from '@/components/ThreeDotsMenu';
import { TrashIcon } from '@heroicons/react/16/solid';

export function ShowSingleNodeInCard({node}: {node: NodeEntity}) {
	const {value: nodeStatus, loading, error} = useAsync(async () => {
		const blockchain = BlockchainFacade.createFromNodeUrl(node.rpcEndpoint);
		return await blockchain.getNodeStatus();
	}, [node.rpcEndpoint]);

	const {width: cardWidth, height: cardHeight} = useNodeCardDimensions();

	if (loading) return <Skeleton width={cardWidth} height={cardHeight}/>
	if (!nodeStatus || error) return <ShowConnectionFailureNodeStatus node={node}/>

	const nodeInfos = [
		{ name: 'Node name', value: nodeStatus.getNodeName() },
		{ name: 'Chain', value: nodeStatus.getChainId() },
		{ name: 'RPC Address', value: node.rpcEndpoint },
		{ name: 'Public key', value: nodeStatus.getCometBFTNodePublicKey()},
	]

	return <Card key={node.id} node={node} sx={{width: cardWidth, height: cardHeight}}>
		<Box className={"full-width full-height p-4"}>
			<Box display={"flex"} justifyContent={"space-between"}>
				<Box display={"flex"} flexDirection={"row"} alignContent={"center"} alignItems={'center'} gap={1}>
					<StorageIcon/>
					<Typography variant="h6" color="textPrimary" component="div">
						{node.nodeAlias}
					</Typography>
				</Box>
				<Box>
					<ThreeDotsMenu>
						<MenuItem>Claim</MenuItem>
						<MenuItem> <TrashIcon/> Delete Node</MenuItem>
					</ThreeDotsMenu>
				</Box>
			</Box>




			<Box display={"flex"} flexDirection={"column"} gap={1}>
				<Box>
					<Typography>Status:</Typography>
					<Chip label={nodeStatus.isValidator() ? 'Validator' : 'Replicator'}/>
				</Box>
				{
					nodeInfos.map(info => <Box>
						<Typography>{info.name}:</Typography>
						<TextField value={info.value} disabled={true} fullWidth={true}/>
					</Box>)
				}
			</Box>

		</Box>

	</Card>;
}