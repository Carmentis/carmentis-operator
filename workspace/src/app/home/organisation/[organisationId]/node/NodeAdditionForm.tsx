import { useState } from 'react';
import { Box, Button, TextField } from '@mui/material';
import { useImportNodeInOrganisationMutation } from '@/generated/graphql';
import { useOrganisation } from '@/contexts/organisation-store.context';

export function NodeAdditionForm() {
	const organisation = useOrganisation();
	const [nodeAlias, setNodeAlias] = useState<string>('');
	const [nodeRpcEndpoint, setNodeRpcEndpoint] = useState<string>('');
	const [importNodeQuery, {loading}] = useImportNodeInOrganisationMutation();

	function addNode() {
		importNodeQuery({
			variables: {
				organisationId: organisation.id,
				nodeAlias,
				nodeRpcEndpoint
			}
		}).then(console.log)
	}

	return <Box display={'flex'} flexDirection={'row'} gap={2}>
		<TextField value={nodeAlias} placeholder="Alias" onChange={event => setNodeAlias(event.target.value)} />
		<TextField value={nodeRpcEndpoint} placeholder="Rpc Endpoint" onChange={event => setNodeRpcEndpoint(event.target.value)} sx={{width: 300}}/>
		<Button variant="contained" color="primary" onClick={addNode} disabled={loading}>Add</Button>
	</Box>;

}