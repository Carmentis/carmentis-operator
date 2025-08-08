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
import { Box, Card, Chip, Divider, MenuItem, TextField, Typography } from '@mui/material';
import { NodeEntity } from '@/generated/graphql';
import ThreeDotsMenu from '@/components/ThreeDotsMenu';
import { TrashIcon } from '@heroicons/react/16/solid';
import { useNodeStatusFromRpcEndpoint } from '@/hooks/useNodeStatusFromRpcEndpoint';
import { useNodeCardLogic } from '@/hooks/useNodeCardLogic';
import { useOrganisation } from '@/contexts/organisation-store.context';
import { ShowLoadingNodeCard } from '@/app/home/organisation/[organisationId]/node/ShowLoadingNodeCard';

export function ShowSingleNodeInCard({node}: {node: NodeEntity}) {
	const {deleting, deleteNode, claiming, claimNode} = useNodeCardLogic();
	const {value: nodeStatus, loading, error} = useNodeStatusFromRpcEndpoint(node.rpcEndpoint);
	const {width: cardWidth, height: cardHeight} = useNodeCardDimensions();

	if (loading || deleting || claiming) return <ShowLoadingNodeCard/>
	if (!nodeStatus || error) return <ShowConnectionFailureNodeStatus node={node}/>

	const nodeInfos = [
		{ name: 'Node name', value: nodeStatus.getNodeName() },
		{ name: 'Chain', value: nodeStatus.getChainId() },
		{ name: 'RPC Address', value: node.rpcEndpoint },
		{ name: 'CometBFT Public key', value: nodeStatus.getCometBFTNodePublicKey()},
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
						<MenuItem disabled={claiming} onClick={() => claimNode(node.id)}>Claim</MenuItem>
						<MenuItem disabled={deleting} onClick={() => deleteNode(node.id)}>
							<TrashIcon/> Delete Node
						</MenuItem>
					</ThreeDotsMenu>
				</Box>
			</Box>




			<Box display={"flex"} flexDirection={"column"} gap={1}>
				{
					nodeInfos.map((info, index) => <Box key={index}>
						<Typography>{info.name}:</Typography>
						<TextField value={info.value} disabled={true} fullWidth={true}/>
					</Box>)
				}
				<Divider sx={{my: 1}} />
				<Box display={"flex"} flexWrap={"wrap"} gap={1}>
					<Chip label={nodeStatus.isValidator() ? 'Validator' : 'Replicator'}/>
					{ node.isClaimable && <Chip label={"Unclaimed"}/> }
				</Box>
			</Box>

		</Box>

	</Card>;
}