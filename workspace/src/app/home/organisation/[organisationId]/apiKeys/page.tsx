'use client';

import { Box, Button, Container, Divider, IconButton, Paper, Typography } from '@mui/material';
import { useOrganisation } from '@/contexts/organisation-store.context';
import GenericTableComponent from '@/components/GenericTableComponent';
import { useCustomRouter } from '@/contexts/application-navigation.context';
import useApiKeyStatusFormatter from '@/hooks/useApiKeyStatusFormatter';
import { ApiKeyDescriptionFragment, useGetApiKeysQuery, useUpdateKeyMutation, useDeleteApiKeyMutation } from '@/generated/graphql';
import Skeleton from 'react-loading-skeleton';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useState } from 'react';
import EditApiKeyModal, { EditApiKeyFormData } from '@/components/modals/EditApiKeyModal';
import useConfirmationModal from '@/components/modals/confirmation-modal';
import { useToast } from '@/app/layout';

export default function Page() {
	return (
		<Container maxWidth={false} disableGutters>
			<TableOfKeys />
		</Container>
	);
}

function TableOfKeys() {
	const organisation = useOrganisation();
	const router = useCustomRouter();
	const notify = useToast();
	const [updateKey, { loading: isUpdating }] = useUpdateKeyMutation();
	const [deleteKey, { loading: isDeleting }] = useDeleteApiKeyMutation();
	const { data: keys, loading: isLoading, error, refetch: mutate } = useGetApiKeysQuery({
		variables: { id: organisation.id }
	});
	const formatApiKeyStatus = useApiKeyStatusFormatter();
	
	// State for edit modal
	const [editModalOpen, setEditModalOpen] = useState(false);
	const [currentApiKey, setCurrentApiKey] = useState<ApiKeyDescriptionFragment | null>(null);
	
	// Function to open the edit modal
	const handleEditClick = (apiKey: ApiKeyDescriptionFragment, e: React.MouseEvent) => {
		e.stopPropagation(); // Prevent row click
		setCurrentApiKey(apiKey);
		setEditModalOpen(true);
	};
	
	// Function to handle saving edited API key
	const handleSaveEdit = (data: EditApiKeyFormData) => {
		if (!currentApiKey) return;
		
		updateKey({
			variables: {
				id: currentApiKey.id,
				name: data.name,
				isActive: data.isActive,
				activeUntil: data.activeUntil
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
	
	// Confirmation modal for API key deletion
	const [showModal, setState] = useConfirmationModal<number>({
		title: "Confirm Deletion",
		message: "Are you sure you want to delete this API key?",
		yes: "Delete",
		no: "Cancel",
		onYes: (data: number) => {
			if (isDeleting) return;
			deleteKey({ variables: { keyId: data } })
				.then(result => {
					const { errors } = result;
					if (!errors) {
						notify.info('API Key deleted');
						mutate();
					} else {
						notify.error(errors);
					}
				})
				.catch(notify.error);
		}
	});
	
	// Function to confirm API key deletion
	const confirmApiKeyDeletion = (apiKeyId: number, e: React.MouseEvent) => {
		e.stopPropagation(); // Prevent row click
		setState(apiKeyId);
		showModal();
	};

	if (isLoading) {
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
					Error loading API keys
				</Typography>
				<Typography variant="body2" color="text.secondary">
					{error.message || "An unexpected error occurred"}
				</Typography>
			</Box>
		);
	}

	if (!keys || keys.getAllApiKeysOfOrganisation.length === 0) {
		return (
			<Box
				display="flex"
				flexDirection="column"
				alignItems="center"
				justifyContent="center"
				py={8}
				textAlign="center"
			>
				<Typography variant="h6" color="text.secondary" gutterBottom>
					No API keys found
				</Typography>
				<Typography variant="body2" color="text.secondary">
					Create your first API key to get started
				</Typography>
			</Box>
		);
	}

	function renderLinkToApplication(application: {id: number, name: string}) {
		return (
			<Typography
				variant="body2"
				sx={{
					cursor: 'pointer',
					color: 'primary.main',
					'&:hover': { textDecoration: 'underline' }
				}}
				onClick={(e) => {
					e.stopPropagation(); // Prevent row click
					router.navigateToApplication(organisation.id, application.id);
				}}
			>
				{application.name}
			</Typography>
		);
	}

	function extractDataFromKey(row: ApiKeyDescriptionFragment) {
		const applicationValue = row.application ? renderLinkToApplication(row.application) : '--';
		const status = formatApiKeyStatus(row);
		return [
			{ head: 'ID', value: <Typography variant="body2">{row.id}</Typography> },
			{ head: 'Name', value: <Typography variant="body2" fontWeight="500">{row.name}</Typography> },
			{ head: 'Key', value: <Typography variant="body2" fontFamily="monospace">{row.partialKey}</Typography> },
			{ head: 'Status', value: status },
			{ head: 'Created at', value: <Typography variant="body2">{new Date(row.createdAt).toLocaleString()}</Typography> },
			{ head: 'Application', value: applicationValue },
			{
				head: '',
				value: (
					<Box>
						<IconButton onClick={(e) => handleEditClick(row, e)} sx={{ mr: 1 }}>
							<EditIcon />
						</IconButton>
						<IconButton onClick={(e) => confirmApiKeyDeletion(row.id, e)}>
							<DeleteIcon />
						</IconButton>
					</Box>
				)
			}
		];
	}

	return (
		<Paper elevation={0} sx={{ borderRadius: 2, overflow: 'hidden', border: '1px solid #eaeaea' }}>
			<GenericTableComponent
				data={keys.getAllApiKeysOfOrganisation}
				extractor={extractDataFromKey}
				onRowClicked={key => router.push(`apiKeys/${key.id}/usage`)}
			/>
			
			{/* Edit API Key Modal */}
			{currentApiKey && (
				<EditApiKeyModal
					open={editModalOpen}
					onClose={() => setEditModalOpen(false)}
					apiKey={currentApiKey}
					onSave={handleSaveEdit}
					isLoading={isUpdating}
				/>
			)}
		</Paper>
	);
}
