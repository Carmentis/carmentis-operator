'use client';

import { Box, Checkbox, Pagination, Switch, TextField, Typography } from '@mui/material';
import { useKeyApi, useKeyUpdateApi, useKeyUsagesApi } from '@/components/api.hook';
import GenericTableComponent from '@/components/generic-table.component';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import getApiKeyStatus from '@/hooks/api-key-status.hook';
import { useToast } from '@/app/layout';
import { useBoolean } from 'react-use';

export default function Page() {

	return <Box display={"flex"} flexDirection={"column"} gap={2}>
		<Header/>
		<TableOfKeyUsage/>
	</Box>
}

function Header() {
	const {keyId} = useParams<{keyId: string}>();
	const {data, isLoading, error, mutate} = useKeyApi(parseInt(keyId));
	const updateKeyApi = useKeyUpdateApi();
	const toast = useToast();


	function switchKeyStatus() {
		if (data) {
			updateKeyApi(data.id, data.name, !data.isActive, {
				onError: toast.error,
				onSuccess: () => mutate()
			})
		}
	}

	return <Box display={"flex"} flexDirection={"row"} justifyContent={"space-between"}>
		<Box display={"flex"} flexDirection={"row"} gap={2}>
			<Typography variant={"h5"} fontWeight={"bolder"}>API Key Usage</Typography>
			{data && getApiKeyStatus(data)}
		</Box>
		<Box display={"flex"} justifyContent={"center"} alignItems={"center"}>
			<Typography>Enabled</Typography>
			<Switch hidden={isLoading} value={data && data.isActive} onChange={() => switchKeyStatus()} />
		</Box>
	</Box>
}

function TableOfKeyUsage() {
	const {keyId} = useParams<{keyId: string}>();
	const [state, setState] = useState<{offset: number, limit: number, filterByUnauthorized: boolean}>({
		offset: 0,
		limit: 10,
		filterByUnauthorized: false
	});
	const {data: usage,  error} = useKeyUsagesApi(parseInt(keyId), state.offset, state.limit, state.filterByUnauthorized)

	function unauthorizedOnly(value: boolean) {
		setState({offset: 0, limit: 10, filterByUnauthorized: value});
	}

	return <>
		<GenericTableComponent
			data={usage && usage.results}
			error={error}
			extractor={row => {
				return [
					{head: 'ID', value: row.id },
					{head: 'Execution date', value: new Date(row.usedAt).toLocaleString() },
					{head: 'IP', value: row.ip},
					{head: 'Method', value: row.requestMethod},
					{head: 'URL', value: row.requestUrl},
					{head: 'Response Status', value: row.responseStatus},
				]
			}}
		/>
		{
			usage &&
			<Box display={"flex"} justifyContent={"start"} gap={4}>
				<Pagination
					count={Math.round((usage.count / state.limit) + 1)}
					onChange={(e,page) => setState(s => {
						return {...s, offset: (page-1) * state.limit};
					})}
				/>
				<Box display={"flex"} justifyContent={"center"} alignItems={'center'}>
					<Typography>Unauthorized only</Typography>
					<Checkbox checked={state.filterByUnauthorized} onChange={(e) => unauthorizedOnly(e.target.checked)} />
				</Box>
			</Box>
		}
	</>
}