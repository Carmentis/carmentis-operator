'use client';

import { Typography } from '@mui/material';
import { ApiKey, useApiKeysInOrganisation } from '@/components/api.hook';
import { useOrganisationContext } from '@/contexts/organisation-store.context';
import GenericTableComponent from '@/components/generic-table.component';
import { useCustomRouter } from '@/contexts/application-navigation.context';
import { Application } from '@/entities/application.entity';
import getApiKeyStatus from '@/hooks/api-key-status.hook';

export default function Page() {

	return <>
		<Typography variant={"h5"} fontWeight={"bolder"}>API Keys</Typography>
		<TableOfKeys/>
	</>
}

function renderLinkToApplication(application: Application) {
	const organisation = useOrganisationContext();
	const router = useCustomRouter();
	return <div onClick={() => router.navigateToApplication(organisation.id, application.id)}>{application.name}</div>;
}

function extractDataFromKey(row: ApiKey) {

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
function TableOfKeys() {
	const organisation = useOrganisationContext();
	const router = useCustomRouter();
	const {data: keys, isLoading, error} = useApiKeysInOrganisation(organisation.id);


	return <GenericTableComponent data={keys} extractor={extractDataFromKey} onRowClicked={key => router.push(`apiKeys/${key.id}/usage`)}/>
}