import StorageIcon from '@mui/icons-material/Storage';
import {
	useNodeCardDimensions,
} from '@/app/home/organisation/[organisationId]/node/NodeCardDimensions';
import { Box, Card, Chip, MenuItem, TextField, Typography } from '@mui/material';
import { NodeEntity } from '@/generated/graphql';
import ThreeDotsMenu from '@/components/ThreeDotsMenu';
import { TrashIcon } from '@heroicons/react/16/solid';
import { useNodeCardLogic } from '@/hooks/useNodeCardLogic';
import { ShowLoadingNodeCard } from '@/app/home/organisation/[organisationId]/node/ShowLoadingNodeCard';

export function ShowConnectionFailureNodeStatus({node}: {node: NodeEntity}) {
	const {deleting, deleteNode} = useNodeCardLogic();
	const {width: cardWidth, height: cardHeight} = useNodeCardDimensions();
	if (deleting) return <ShowLoadingNodeCard/>

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
						<MenuItem disabled={deleting} onClick={() => deleteNode(node.id)}> <TrashIcon/> Delete Node</MenuItem>
					</ThreeDotsMenu>
				</Box>
			</Box>

			<Typography variant={"body1"}>
				It seems we are unable to obtain the status of the node at endpoint <Typography>{node.rpcEndpoint}.</Typography>
			</Typography>
		</Box>

	</Card>;
}