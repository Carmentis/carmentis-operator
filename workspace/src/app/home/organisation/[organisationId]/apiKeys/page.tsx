'use client';

import { Typography } from '@mui/material';
import { useOrganisation, useOrganisationContext } from '@/contexts/organisation-store.context';
import GenericTableComponent from '@/components/generic-table.component';
import { useCustomRouter } from '@/contexts/application-navigation.context';
import getApiKeyStatus from '@/hooks/api-key-status.hook';
import { ApiKeyDescriptionFragment, useGetApiKeysQuery } from '@/generated/graphql';

export default function Page() {

	return <>
		<Typography variant={"h5"} fontWeight={"bolder"}>API Keys</Typography>
		<TableOfKeys/>
	</>
}

function renderLinkToApplication(application: {id: number, name: string}) {
	const organisation = useOrganisation();
	const router = useCustomRouter();
	return <div onClick={() => router.navigateToApplication(organisation.id, application.id)}>{application.name}</div>;
}

function TableOfKeys() {
	const organisation = useOrganisation();
	const router = useCustomRouter();
	//const {data: keys, isLoading, error} = useApiKeysInOrganisation(organisation.id);
	const {data: keys, loading: isLoading, error} = useGetApiKeysQuery({
		variables: { id: organisation.id }
	})

	function extractDataFromKey(row: ApiKeyDescriptionFragment) {
		const applicationValue = row.application ? renderLinkToApplication(row.application) : '--';
		const status = getApiKeyStatus(row);
		return [
			{ head: 'ID', value: row.id },
			{ head: 'Name', value: row.name },
			{ head: 'Key', value: row.partialKey },
			{ head: 'Status', value: status },
			{ head: 'Created at', value: new Date(row.createdAt).toLocaleString() },
			{ head: 'Application', value:  applicationValue },
		]

	}


	return <GenericTableComponent data={keys?.getAllApiKeysOfOrganisation} extractor={extractDataFromKey} onRowClicked={key => router.push(`apiKeys/${key.id}/usage`)}/>
}