import StorageIcon from '@mui/icons-material/Storage';
import {
	useNodeCardDimensions,
} from '@/app/home/organisation/[organisationId]/node/NodeCardDimensions';
import { Box, Card, Chip, TextField, Typography } from '@mui/material';
import { NodeEntity } from '@/generated/graphql';

export function ShowConnectionFailureNodeStatus({node}: {node: NodeEntity}) {
	const {width: cardWidth, height: cardHeight} = useNodeCardDimensions();
	return <Card key={node.id} node={node} sx={{width: cardWidth, height: cardHeight}}>
		<Box className={"full-width full-height p-4"}>
			<Box display={"flex"} flexDirection={"row"} alignContent={"start"} alignItems={'center'} gap={1} width={"full"}>
				<StorageIcon/>
				<Typography variant="h6" color="textPrimary" component="div">
					{node.nodeAlias}
				</Typography>
			</Box>

			<Typography variant={"body1"}>
				It seems we are unable to obtain the status of the node at endpoint <Typography>{node.rpcEndpoint}.</Typography>
			</Typography>
		</Box>

	</Card>;
}