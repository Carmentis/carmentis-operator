'use client';

import { useOrganisation } from '@/contexts/organisation-store.context';
import { useGetAllNodesQuery } from '@/generated/graphql';
import { Fragment } from 'react';
import { Card } from '@mui/material';
import Skeleton from 'react-loading-skeleton';
import { NodeAdditionForm } from '@/app/home/organisation/[organisationId]/node/NodeAdditionForm';
import { ShowNodes } from '@/app/home/organisation/[organisationId]/node/ShowNodes';

export default function Page() {
	const organisation = useOrganisation();
	const {data: nodes, loading, error} = useGetAllNodesQuery({
		variables: {
			organisationId: organisation.id,
		}
	})

	if (loading) return <LoadingNodes/>
	if (!nodes || error) return <>An error occurred</>
	return <>
		<NodeAdditionForm/>
		<ShowNodes nodes={nodes.organisation.nodes}/>
	</>
}

function LoadingNodes() {
	const nodesNumber = 10;
	const out = [];
	for (let i = 0; i < nodesNumber; i++) {
		const nodeContent = <Card>
			<Skeleton/>
		</Card>
		out.push(nodeContent)
	}
	return <>{out}</>

}