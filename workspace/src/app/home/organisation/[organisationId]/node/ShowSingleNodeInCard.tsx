import StorageIcon from '@mui/icons-material/Storage';
import {
	useNodeCardDimensions,
} from '@/app/home/organisation/[organisationId]/node/NodeCardDimensions';
import {
	ShowConnectionFailureNodeStatus
} from '@/app/home/organisation/[organisationId]/node/ShowConnectionFailureNodeStatus';
import { Box, Button, Card, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Divider, MenuItem, TextField, Typography } from '@mui/material';
import { NodeEntity } from '@/generated/graphql';
import ThreeDotsMenu from '@/components/ThreeDotsMenu';
import { TrashIcon } from '@heroicons/react/16/solid';
import { useNodeStatusFromRpcEndpoint } from '@/hooks/useNodeStatusFromRpcEndpoint';
import { useNodeCardLogic } from '@/hooks/useNodeCardLogic';
import { useOrganisation } from '@/contexts/organisation-store.context';
import { ShowLoadingNodeCard } from '@/app/home/organisation/[organisationId]/node/ShowLoadingNodeCard';
import useOrganizationHoldingNode from '@/hooks/useOrganizationHoldingNode';
import { useState } from 'react';
import { useToast } from '@/app/layout';

export function ShowSingleNodeInCard({node}: {node: NodeEntity}) {
	const {deleting, deleteNode, claiming, claimNode, staking, stakeNode} = useNodeCardLogic();
	const {value: nodeStatus, loading, error} = useNodeStatusFromRpcEndpoint(node.rpcEndpoint);
	const {width: cardWidth, height: cardHeight} = useNodeCardDimensions();
	const {organisationHoldingNode} = useOrganizationHoldingNode(node);
	const [stakeDialogOpen, setStakeDialogOpen] = useState(false);
	const [stakeAmount, setStakeAmount] = useState('');
	const notify = useToast();

	const handleStakeClick = () => {
		setStakeDialogOpen(true);
	};

	const handleStakeSubmit = async () => {
		try {
			await stakeNode(node.id, stakeAmount);
			notify.success('Node staked successfully');
			setStakeDialogOpen(false);
			setStakeAmount('');
		} catch (error) {
			notify.error('Failed to stake node');
		}
	};

	if (loading || deleting || claiming || staking) return <ShowLoadingNodeCard/>
	if (!nodeStatus || error) return <ShowConnectionFailureNodeStatus node={node}/>

	const nodeInfos = [
		{ name: 'Node name', value: nodeStatus.result.node_info.moniker },
		{ name: 'Chain', value: nodeStatus.result.node_info.network },
		{ name: 'RPC Address', value: node.rpcEndpoint },
		{ name: 'CometBFT Public key', value: nodeStatus.result.validator_info.pub_key.value},
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
						<MenuItem disabled={claiming || organisationHoldingNode !== undefined} onClick={() => claimNode(node.id)}>Claim</MenuItem>
						<MenuItem disabled={staking || !node.virtualBlockchainId} onClick={handleStakeClick}>Stake</MenuItem>
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
					<Chip label={nodeStatus.result.validator_info.voting_power !== '0' ? 'Validator' : 'Replicator'}/>
					{ node.isClaimable && <Chip label={"Unclaimed"}/> }
					{ organisationHoldingNode && <Chip label={`Hold by ${organisationHoldingNode.getName()}`} /> }
				</Box>
			</Box>

		</Box>

		<Dialog open={stakeDialogOpen} onClose={() => setStakeDialogOpen(false)}>
			<DialogTitle>Stake Node</DialogTitle>
			<DialogContent>
				<Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
					Enter the amount to stake for node: {node.nodeAlias}
				</Typography>
				<TextField
					autoFocus
					margin="dense"
					label="Amount"
					type="text"
					fullWidth
					variant="outlined"
					value={stakeAmount}
					onChange={(e) => setStakeAmount(e.target.value)}
					placeholder="e.g., 100.0"
				/>
			</DialogContent>
			<DialogActions>
				<Button onClick={() => setStakeDialogOpen(false)}>Cancel</Button>
				<Button onClick={handleStakeSubmit} variant="contained" disabled={!stakeAmount}>
					Stake
				</Button>
			</DialogActions>
		</Dialog>

	</Card>;
}