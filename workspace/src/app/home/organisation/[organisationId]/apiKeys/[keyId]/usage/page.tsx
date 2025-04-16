'use client';

import { Box, Checkbox, Pagination, Switch, Table, TableCell, TableRow, Typography } from '@mui/material';
import GenericTableComponent from '@/components/generic-table.component';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import getApiKeyStatus from '@/hooks/api-key-status.hook';
import { useToast } from '@/app/layout';
import {
	ApiKeyUsageFragment,
	useGetApiKeyQuery, useGetApiKeyUsageQuery,
	useUpdateKeyMutation,
} from '@/generated/graphql';

export default function Page() {
	return <Box display={"flex"} flexDirection={"column"} gap={2}>
		<Header/>
		<TableOfKeyUsage/>
	</Box>
}

function Header() {
	const notify = useToast();
	const {keyId} = useParams<{keyId: string}>();
	const {data, loading: isLoading, refetch: mutate} = useGetApiKeyQuery({
		variables: { id: parseInt(keyId) },
	})
	const [updateKey] = useUpdateKeyMutation()
	const toast = useToast();

	function switchKeyStatus() {
		const key = data?.getApiKey;
		updateKey({
			variables: {
				id: parseInt(keyId),
				name: key?.name,
				isActive: !key.isActive
			}
		})
			.then(result => {
				const {errors} = result;
				if (errors) {
					notify.error(errors)
				} else {
					notify.success("Key updated")
					mutate()
				}
			})
			.catch(toast.error);
	}

	return <>
		<Box display={"flex"} flexDirection={"column"}>
			<Box display={"flex"} flexDirection={"row"} justifyContent={"space-between"}>
				<Box display={"flex"} flexDirection={"row"} gap={2}>
					<Typography variant={"h5"} fontWeight={"bolder"}>
						API Key Usage
					</Typography>
					{data && getApiKeyStatus(data.getApiKey)}
				</Box>
				<Box display={"flex"} justifyContent={"center"} alignItems={"center"}>
					<Typography>Enabled</Typography>
					<Switch checked={data?.getApiKey.isActive} onChange={() => switchKeyStatus()} />
				</Box>
			</Box>
			<Typography variant={"h6"}>Key &#34;{data?.getApiKey.name}&#34;</Typography>
		</Box>


		{
			data && data.getApiKey &&
			<Box>
				<Table>
					{
						[
							{ head: 'Created at', value: new Date(data.getApiKey.createdAt).toLocaleString() },
							{ head: 'Key name', value: data.getApiKey.name },
							{ head: 'Last digits', value: data.getApiKey.partialKey },
							{ head: 'Active until', value: new Date(data.getApiKey.activeUntil).toLocaleString() },
						].map((v,i) =>
							<TableRow key={i}>
								<TableCell>{v.head}</TableCell>
								<TableCell>{v.value}</TableCell>
							</TableRow>
						)
					}
				</Table>
			</Box>
		}
	</>
}

function TableOfKeyUsage() {
	const {keyId} = useParams<{keyId: string}>();
	const [state, setState] = useState<{offset: number, limit: number, filterByUnauthorized: boolean}>({
		offset: 0,
		limit: 10,
		filterByUnauthorized: false
	});
	const {data, error} = useGetApiKeyUsageQuery({
		variables: {
			id: parseInt(keyId),
			offset: state.offset,
			limit: state.limit,
			filterByUnauthorised: state.filterByUnauthorized
		},
	});

	function unauthorizedOnly(value: boolean) {
		setState({offset: 0, limit: 10, filterByUnauthorized: value});
	}


	return <>
		<GenericTableComponent
			data={data && data.getApiKey.usages}
			error={error}
			extractor={(row: ApiKeyUsageFragment) => {
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
			data &&
			<Box display={"flex"} justifyContent={"start"} gap={4}>
				<Pagination
					count={Math.round((data.getApiKey.countUsages / state.limit) + 1)}
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