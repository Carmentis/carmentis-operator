import { NodeEntity } from '@/generated/graphql';
import { Box } from '@mui/material';

import { ShowSingleNodeInCard } from '@/app/home/organisation/[organisationId]/node/ShowSingleNodeInCard';

export function ShowNodes({ nodes }: { nodes: NodeEntity[] }) {
	const nodesDisplay = [];
	for (const node of nodes) {
		const out = <ShowSingleNodeInCard node={node}/>
		nodesDisplay.push(out);
	}
	return <Box display={"flex"} flexWrap={"wrap"} gap={2} mt={2}>{nodesDisplay}</Box>;
}

