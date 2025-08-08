'use client';

import {
	Box, Breadcrumbs,
	Card,
	Checkbox,
	Container,
	Divider,
	FormControlLabel,
	Grid,
	IconButton,
	Pagination,
	Paper,
	Stack,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	TextField,
	Tooltip,
	Typography,
	Switch,
} from '@mui/material';
import GenericTableComponent from '@/components/GenericTableComponent';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import useApiKeyStatusFormatter from '@/hooks/useApiKeyStatusFormatter';
import { useToast } from '@/app/layout';
import {
	ApiKeyUsageFragment,
	useGetApiKeyQuery,
	useGetApiKeyUsageQuery,
	useUpdateKeyMutation,
} from '@/generated/graphql';
import Skeleton from 'react-loading-skeleton';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import { useCustomRouter } from '@/contexts/application-navigation.context';
import { useOrganisation } from '@/contexts/organisation-store.context';
import EditApiKeyModal, { EditApiKeyFormData } from '@/components/modals/EditApiKeyModal';
import KeyIcon from '@mui/icons-material/Key';

export default function Page() {
	return (
		<Container maxWidth={false} disableGutters>
			<Box display="flex" flexDirection="column" gap={4}>
				<Header />

			</Box>
		</Container>
	);
}

function Header() {
	const organisation = useOrganisation();
	const notify = useToast();
	const { keyId } = useParams<{ keyId: string }>();
	const { data, loading: isLoading, refetch: mutate } = useGetApiKeyQuery({
		variables: { id: parseInt(keyId) },
	});
	const [updateKey, { loading: isUpdating }] = useUpdateKeyMutation();
	const toast = useToast();
	const apiKeyFormatter = useApiKeyStatusFormatter();
	
	// State for edit modal
	const [editModalOpen, setEditModalOpen] = useState(false);
	
	// Function to open the edit modal
	const handleEditClick = () => {
		setEditModalOpen(true);
	};
	
	// Function to handle saving edited API key
	const handleSaveEdit = (formData: EditApiKeyFormData) => {
		if (!data?.getApiKey) return;
		
		updateKey({
			variables: {
				id: parseInt(keyId),
				name: formData.name,
				isActive: formData.isActive,
				activeUntil: formData.activeUntil
			}
		})
		.then(result => {
			const { errors } = result;
			if (!errors) {
				notify.info('API Key updated');
				setEditModalOpen(false);
				mutate();
			} else {
				notify.error(errors);
			}
		})
		.catch(notify.error);
	};

	if (isLoading) {
		return (
			<Box mb={4}>
				<Skeleton height={40} width={300} />
				<Box mt={2}>
					<Skeleton height={24} width={200} />
				</Box>
				<Box mt={4}>
					<Skeleton height={100} />
				</Box>
			</Box>
		);
	}

	if (!data || !data.getApiKey) {
		return (
			<Box
				display="flex"
				flexDirection="column"
				alignItems="center"
				justifyContent="center"
				py={8}
				textAlign="center"
			>
				<Typography variant="h6" color="error" gutterBottom>
					API Key not found
				</Typography>
				<Typography variant="body2" color="text.secondary">
					The requested API key could not be found
				</Typography>
			</Box>
		);
	}

	const keyInfos = [
		{ head: 'Created at', value: new Date(data.getApiKey.createdAt).toLocaleString() },
		{ head: 'Key name', value: data.getApiKey.name },
		{ head: 'Last digits', value: data.getApiKey.partialKey },
		{ head: 'Active until', value: new Date(data.getApiKey.activeUntil).toLocaleString() },
		{ head: 'Status', value: data.getApiKey.isActive ? 'Active' : 'Inactive' },
	]
	
	return (
		<Box>
			<Box display="flex" justifyContent="space-between" alignItems="center">
				<Box display={"flex"} flexDirection={"column"} alignItems={"start"}>
					<Breadcrumbs>
						<Typography>{organisation.name}</Typography>
						<Typography>API Keys</Typography>
					</Breadcrumbs>
					<Box display={"flex"} gap={1}>
						<KeyIcon/>
						<Typography variant={"h6"}>{data.getApiKey.name}</Typography>
					</Box>
				</Box>
			</Box>

			<Grid container spacing={2} sx={{ mt: 2 }}>
				<Grid size={4}>
					<Card>
						<Box display="flex" flexDirection="column" gap={2}>
							<Box display={"flex"} justifyContent={"space-between"} alignItems={"center"}>
								<Typography variant={"h6"}>API Key Details</Typography>
								<IconButton onClick={handleEditClick} color="primary">
									<EditIcon />
								</IconButton>
							</Box>
							<Box display={"flex"} justifyContent={"space-between"} alignItems={"center"}>
								<Typography variant={"body2"} color="text.secondary">Status</Typography>
								{apiKeyFormatter(data.getApiKey)}
							</Box>
							{keyInfos.map((v, i) => (
								<Box key={i} display="flex" flexDirection="column" gap={0.5}>
									<Typography variant="body2" color="text.secondary">{v.head}</Typography>
									<Typography variant="body1">{v.value}</Typography>
								</Box>
							))}
						</Box>
					</Card>
				</Grid>
				<Grid size={8}>
					<TableOfKeyUsage />
				</Grid>
			</Grid>
			
			{/* Edit API Key Modal */}
			<EditApiKeyModal
				open={editModalOpen}
				onClose={() => setEditModalOpen(false)}
				apiKey={data.getApiKey}
				onSave={handleSaveEdit}
				isLoading={isUpdating}
			/>
		</Box>
	);
}

function TableOfKeyUsage() {
	const { keyId } = useParams<{ keyId: string }>();
	const [state, setState] = useState<{ offset: number, limit: number, filterByUnauthorized: boolean }>({
		offset: 0,
		limit: 10,
		filterByUnauthorized: false
	});

	const { data, loading, error } = useGetApiKeyUsageQuery({
		variables: {
			id: parseInt(keyId),
			offset: state.offset,
			limit: state.limit,
			filterByUnauthorised: state.filterByUnauthorized
		},
	});

	function unauthorizedOnly(value: boolean) {
		setState({ offset: 0, limit: 10, filterByUnauthorized: value });
	}

	if (loading) {
		return (
			<Box mt={4}>
				<Skeleton height={60} />
				<Skeleton count={5} height={50} />
			</Box>
		);
	}

	if (error) {
		return (
			<Box
				display="flex"
				flexDirection="column"
				alignItems="center"
				justifyContent="center"
				py={8}
				textAlign="center"
			>
				<Typography variant="h6" color="error" gutterBottom>
					Error loading API key usage
				</Typography>
				<Typography variant="body2" color="text.secondary">
					{error.message || "An unexpected error occurred"}
				</Typography>
			</Box>
		);
	}

	if (!data || !data.getApiKey.usages || data.getApiKey.usages.length === 0) {
		return (
			<Card>
				<Typography variant="h6" color="text.secondary" gutterBottom>
					No usage data found
				</Typography>
				<Typography variant="body2" color="text.secondary">
					This API key has not been used yet
				</Typography>
			</Card>
		);
	}

	return (
		<Box display="flex" flexDirection="column" gap={2}>
			<Card>
				<GenericTableComponent
					data={data.getApiKey.usages}
					error={error}
					extractor={(row: ApiKeyUsageFragment) => {
						return [
							{ head: 'ID', value: <Typography variant="body2">{row.id}</Typography> },
							{ head: 'Execution date', value: <Typography variant="body2">{new Date(row.usedAt).toLocaleString()}</Typography> },
							{ head: 'IP', value: <Typography variant="body2">{row.ip}</Typography> },
							{ head: 'Method', value: <Typography variant="body2" fontWeight="500">{row.requestMethod}</Typography> },
							{ head: 'URL', value: <Typography variant="body2" sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.requestUrl}</Typography> },
							{
								head: 'Response Status',
								value: <Typography
									variant="body2"
									sx={{
										fontWeight: 500,
										color: row.responseStatus >= 400 ? 'error.main' : (row.responseStatus >= 300 ? 'warning.main' : 'success.main')
									}}
								>
									{row.responseStatus}
								</Typography>
							},
						];
					}}
				/>
			</Card>

			<Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
				<Pagination
					count={Math.max(1, Math.round((data.getApiKey.countUsages / state.limit) + 0.5))}
					page={Math.floor(state.offset / state.limit) + 1}
					onChange={(e, page) => setState(s => {
						return { ...s, offset: (page - 1) * state.limit };
					})}
					color="primary"
					size="medium"
					showFirstButton
					showLastButton
				/>
				<FormControlLabel
					control={
						<Checkbox
							checked={state.filterByUnauthorized}
							onChange={(e) => unauthorizedOnly(e.target.checked)}
							color="primary"
						/>
					}
					label="Show unauthorized requests only"
				/>
			</Box>
		</Box>
	);
}
