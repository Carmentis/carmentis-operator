import StorageIcon from '@mui/icons-material/Storage';
import {
	useNodeCardDimensions,
} from '@/app/home/organisation/[organisationId]/node/NodeCardDimensions';
import {
	ShowConnectionFailureNodeStatus
} from '@/app/home/organisation/[organisationId]/node/ShowConnectionFailureNodeStatus';
import { Box, Button, Card, Chip, Divider, TextField, Typography } from '@mui/material';
import { NodeEntity } from '@/generated/graphql';
import ThreeDotsMenu from '@/components/ThreeDotsMenu';
import { PencilIcon, TrashIcon } from '@heroicons/react/16/solid';
import { useNodeStatusFromRpcEndpoint } from '@/hooks/useNodeStatusFromRpcEndpoint';
import { useNodeCardLogic } from '@/hooks/useNodeCardLogic';
import { useOrganisation } from '@/contexts/organisation-store.context';
import { ShowLoadingNodeCard } from '@/app/home/organisation/[organisationId]/node/ShowLoadingNodeCard';
import useOrganizationHoldingNode from '@/hooks/useOrganizationHoldingNode';
import { useToast } from '@/app/layout';
import { useAsync } from 'react-use';
import useStakeLockForNode from '@/hooks/useStakeLockForNode';
import { NodeStakeStatus } from '@/app/home/organisation/[organisationId]/node/NodeStakeStatus';
import useNodeStatus from '@/hooks/useNodeStatus';

export function ShowSingleNodeInCard({node}: {node: NodeEntity}) {
	const {value: nodeStatus, loading, error} = useNodeStatus(node);
	const {deleting, deleteNode, claiming, claimNode, staking, stakeNode, cancelling, cancelStake} = useNodeCardLogic();
	const {value: stakeLock, loading: stakeLockLoading, error: stakeLockError} = useStakeLockForNode(node);
	const {organisationHoldingNode, error: organisationHoldingNodeError} = useOrganizationHoldingNode(node);
	const notify = useToast();
	const {value: orgNameHoldingName} = useAsync(async () => {
		if (organisationHoldingNode) {
			const desc= await organisationHoldingNode.getDescription();
			return desc.name;
		} else {
			return ''
		}
	}, [organisationHoldingNode]);



	if (organisationHoldingNodeError) console.error(organisationHoldingNodeError);

	const handleStakeSubmit = async (amount: string) => {
		try {
			const response = await stakeNode(node.id, amount);
			if (response.errors) {
				console.error(response.errors);
				notify.error(response.errors);
			} else {
				notify.success('Node staked successfully');
			}
		} catch (error) {
			console.error(error);
			notify.error('Failed to stake node');
		}
	};

	const handleCancelStake = async (amount: string) => {
		try {
			const response = await cancelStake(node.id, amount);
			if (response.errors) {
				console.error(response.errors);
				notify.error(response.errors);
			} else {
				notify.success('Stake cancelled successfully');
			}
		} catch (error) {
			console.error(error);
			notify.error('Failed to cancel stake');
		}
	};

	if (loading || deleting || claiming || staking) return <ShowLoadingNodeCard/>
	if (!nodeStatus || error) {
		console.error(error);
		return <ShowConnectionFailureNodeStatus node={node}/>
	}

	const rpcNodeStatus = nodeStatus.nodeStatus;
	const nodeInfos = [
		{ name: 'Node name', value: rpcNodeStatus.result.node_info.moniker },
		{ name: 'Chain', value: rpcNodeStatus.result.node_info.network },
		{ name: 'RPC Address', value: node.rpcEndpoint },
		{ name: 'CometBFT Public key', value: rpcNodeStatus.result.validator_info.pub_key.value},
	]

	return <Card key={node.id} node={node} sx={{width: '100%'}}>
		<Box className={"full-width p-4"}>
			{/* Header with title and claim and delete buttons */}
			<Box display={"flex"} justifyContent={"space-between"} alignItems={"center"} mb={2}>
				<Box display={"flex"} flexDirection={"row"} alignContent={"center"} alignItems={'center'} gap={1}>
					<StorageIcon/>
					<Typography variant="h6" color="textPrimary" component="div">
						{node.nodeAlias}
					</Typography>
				</Box>
				{
					!nodeStatus.isClaimed && <Button
						variant="outlined"
						size="small"
						disabled={claiming}
						onClick={() => claimNode(node.id)}
						startIcon={<PencilIcon width={16} height={16} />}
					>
						Claim Node
					</Button>
				}
				<Button
					variant="outlined"
					color="error"
					size="small"
					disabled={deleting}
					onClick={() => deleteNode(node.id)}
					startIcon={<TrashIcon width={16} height={16} />}
				>
					Delete Node
				</Button>
			</Box>

			{/* Node information in 2x2 grid */}
			<Box display={"grid"} gridTemplateColumns={"1fr 1fr"} gap={2} mb={2}>
				{
					nodeInfos.map((info, index) => <Box key={index}>
						<Typography variant="caption" color="textSecondary">{info.name}</Typography>
						<TextField value={info.value} disabled={true} fullWidth={true} size="small"/>
					</Box>)
				}
			</Box>

			{/* Chips */}
			<Box display={"flex"} flexWrap={"wrap"} gap={1} mb={2}>
				<Chip label={rpcNodeStatus.result.validator_info.voting_power !== '0' ? 'Validator' : 'Replicator'}/>
				{ node.isClaimable && <Chip label={"Unclaimed"}/> }
				{ organisationHoldingNode && <Chip label={`Hold by ${orgNameHoldingName}`} /> }
			</Box>

			<Divider sx={{ my: 2 }} />

			{/* Stake status */}
			<NodeStakeStatus
				nodeStatus={nodeStatus}
				loading={stakeLockLoading}
				error={stakeLockError}
				onCancelStake={handleCancelStake}
				cancelling={cancelling}
				onStake={(amount) => handleStakeSubmit(amount)}
				staking={staking}
			/>
		</Box>

	</Card>;
}