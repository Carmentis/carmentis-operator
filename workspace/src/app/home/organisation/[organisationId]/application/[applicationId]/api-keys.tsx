import React, { useState } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, IconButton, Paper, Stack, Switch, TextField, Tooltip, Typography } from '@mui/material';
import GenericTableComponent from '@/components/GenericTableComponent';
import { useParams } from 'next/navigation';
import { useBoolean } from 'react-use';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircleIcon } from '@heroicons/react/16/solid';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import useConfirmationModal from '@/components/modals/confirmation-modal';
import useApiKeyStatusFormatter from '@/hooks/useApiKeyStatusFormatter';
import {
	CreatedApiKeyFragment,
	useCreateApiKeyInApplicationMutation,
	useDeleteApiKeyMutation,
	useGetAllApiKeysInApplicationQuery,
	useUpdateKeyMutation,
	ApiKeyDescriptionFragment,
} from '@/generated/graphql';
import { useToast } from '@/app/layout';
import { useApplication } from '@/app/home/organisation/[organisationId]/application/[applicationId]/page';

const formSchema = z.object({
	name: z.string().min(1, "The name is required"),
	activeUntil: z.string().date("The date is required.")
});

type FormData = z.infer<typeof formSchema>;

// Type for the API key edit form
type EditApiKeyFormData = {
	name: string;
	activeUntil: string;
	isActive: boolean;
};

// Edit API key modal component
interface EditApiKeyModalProps {
	open: boolean;
	onClose: () => void;
	apiKey: ApiKeyDescriptionFragment;
	onSave: (data: EditApiKeyFormData) => void;
	isLoading: boolean;
}

function EditApiKeyModal({ open, onClose, apiKey, onSave, isLoading }: EditApiKeyModalProps) {
	const editFormSchema = z.object({
		name: z.string().min(1, "The name is required"),
		activeUntil: z.string().min(1, "The date is required"),
		isActive: z.boolean()
	});

	const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<EditApiKeyFormData>({
		resolver: zodResolver(editFormSchema),
		defaultValues: {
			name: apiKey?.name || '',
			activeUntil: apiKey?.activeUntil ? new Date(apiKey.activeUntil).toISOString().split('T')[0] : '',
			isActive: apiKey?.isActive
		}
	});

	return (
		<Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
			<DialogTitle>Edit API Key</DialogTitle>
			<DialogContent>
				<Box component="form" sx={{ mt: 2 }} display="flex" flexDirection="column" gap={2}>
					<TextField
						label="Name"
						fullWidth
						size="small"
						error={!!errors.name}
						helperText={errors.name?.message}
						{...register('name')}
					/>
					<TextField
						label="Valid until"
						type="date"
						fullWidth
						size="small"
						error={!!errors.activeUntil}
						helperText={errors.activeUntil?.message}
						{...register('activeUntil')}
						InputLabelProps={{ shrink: true }}
					/>
					<FormControlLabel
						control={
							<Switch
								checked={watch('isActive')}
								onChange={(e) => setValue('isActive', e.target.checked)}
								color="primary"
							/>
						}
						label="Active"
					/>
				</Box>
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose}>Cancel</Button>
				<Button 
					variant="contained" 
					onClick={handleSubmit(onSave)}
					disabled={isLoading}
				>
					Save
				</Button>
			</DialogActions>
		</Dialog>
	);
}

export default function ApiKeysPage() {
	const notify = useToast();
	const application = useApplication();
	const params = useParams<{ organisationId: string, applicationId: string }>();
	const applicationId = parseInt(params.applicationId);
	const [createKey, {loading: isCreating}] = useCreateApiKeyInApplicationMutation();
	const [deleteKey, {loading: isDeleting}] = useDeleteApiKeyMutation();
	const [updateKey, {loading: isUpdating}] = useUpdateKeyMutation();
	const formatApiKeyStatus = useApiKeyStatusFormatter();
	const {data: apiKeys, loading: isLoading, error, refetch: mutate} = useGetAllApiKeysInApplicationQuery({
		variables: { applicationId }
	})

	// State for edit modal
	const [editModalOpen, setEditModalOpen] = useState(false);
	const [currentApiKey, setCurrentApiKey] = useState<ApiKeyDescriptionFragment | null>(null);

	const [wantToCreateKey, setWantToCreateKey] = useBoolean(false);
	const [createdKey, setCreatedKey] = useState<CreatedApiKeyFragment|undefined>();
	
	// Function to open the edit modal
	const handleEditClick = (apiKey: ApiKeyDescriptionFragment) => {
		setCurrentApiKey(apiKey);
		setEditModalOpen(true);
	};
	
	// Function to handle saving edited API key
	const handleSaveEdit = (data: EditApiKeyFormData) => {
		if (!currentApiKey) return;
		console.log(data.activeUntil)
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

	// confirm the api key deletion
	const [showModal, setState] = useConfirmationModal<number>({
		title: "Confirm Deletion",
        message: "Are you sure you want to delete this API key?",
		yes: "Delete",
		no: "Cancel",
		onYes: (data: number) => {
			if (isDeleting) return
			deleteKey({variables: { keyId: data }})
				.then(result => {
					const {errors} = result;
					if (!errors) {
						notify.info('Api Key deleted');
						mutate()
					} else {
						notify.error(errors)
					}
				});
		}
	});

	function confirmApiKeyDeletion(apiKeyId: number) {
		setState(apiKeyId)
		showModal()
	}

	// create the form state to create the API Key
	const { register, handleSubmit, formState: { errors }, } = useForm<FormData>({
		resolver: zodResolver(formSchema),
	});

	const onSubmit = (data: FormData) => {
		createKey({
			variables: { applicationId, name: data.name, activeUntil: data.activeUntil },
		}).then(result => {
			const {data, errors} = result;
			if (data) {
				setCreatedKey(data.createApiKey);
				setWantToCreateKey(false)
				notify.info("API Key created")
			} else if (errors) {
				notify.error(errors)
			}
		}).catch(notify.error)
	};

	// compute the content for created key
	let createdKeyContent = <></>;
	if (createdKey) {
		createdKeyContent = <Box my={2}>
			<ApiKeyDisplay apiKey={createdKey} />
		</Box>;
	}

	// compute the content for key listing and creation
	let content;
	if (wantToCreateKey) {
		content = <>
			<Box component={"form"} display={"flex"} flexDirection={"column"} onSubmit={handleSubmit(onSubmit)} gap={2}>
				<TextField size={"small"} error={errors.name ? true: false} helperText={errors.name && errors.name.message} {...register('name')} />
				<TextField type={"date"} size={"small"} error={errors.activeUntil ? true: false} helperText={errors.activeUntil && errors.activeUntil.message} {...register('activeUntil')} />

				<Box display={"flex"} gap={2}>
					<Button variant={"outlined"} onClick={() => setWantToCreateKey(false)}>Cancel</Button>
					<Button variant={"contained"} type="submit" disabled={isCreating}>Create</Button>
				</Box>
			</Box>
		</>
	} else {
		content = <GenericTableComponent
			data={apiKeys?.getAllApiKeysOfApplication}
			isLoading={isLoading}
			error={error}
			extractor={row => {
				const status = formatApiKeyStatus(row)

				return [
					{ head: 'ID', value:  row.id },
					{ head: 'Name', value: row.name },
					{ head: 'Key', value: row.partialKey },
					{ head: 'Status', value: status },
					{ head: 'Valid until', value: row.activeUntil },
					{ head: 'Created at', value: row.createdAt },
					{
						head: '',
						value: <>
							<IconButton onClick={() => handleEditClick(row)} sx={{ mr: 1 }}>
								<EditIcon />
							</IconButton>
							<IconButton onClick={() => confirmApiKeyDeletion(row.id)}>
								<DeleteIcon />
							</IconButton>
						</>
					}
				];
			}}
		/>;
	}
	return (
		<Box>
			<Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
				<Box display="flex" justifyContent="start" flexDirection={"column"} alignItems="start" >
					<Typography variant="h6" color={"primary"}>
						API Keys
					</Typography>
					<Typography>Below are listed keys associated with the application <Typography fontWeight={"bold"} component={"span"}>{application.name}</Typography>. </Typography>
				</Box>
				<Button variant="contained" color="primary" onClick={() => setWantToCreateKey(true)}>
					Generate Key
				</Button>
			</Box>
			{createdKeyContent}
			{content}
			
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
		</Box>
	);
}

type Props = {
	apiKey: CreatedApiKeyFragment;
};

function ApiKeyDisplay({ apiKey }: Props) {
	const [copied, setCopied] = useState(false);

	if (!apiKey.key) return null;

	const handleCopy = () => {
		navigator.clipboard.writeText(apiKey.key || "");
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<Paper
			elevation={4}
			sx={{
				//backgroundColor: "#1e293b", // Slate-800 like (dark)
				//color: "white",
				p: 3,
				borderRadius: 2,
				w: "100%",
				mx: "auto",
				mt: 4,
			}}
		>
			<Stack spacing={2}>
				<Typography variant="h6">API Key Generated</Typography>

				<Typography variant="body2" sx={{ opacity: 0.8 }}>
					Here is your new API key. It will no longer be visible after this step. Please copy it and store it in a safe place.
				</Typography>

				<Box
					sx={{
						w: "100%",
						backgroundColor: '#eee',
						//backgroundColor: "#0f172a", // Slate-900 like
						px: 2,
						py: 1.5,
						borderRadius: 1,
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						wordBreak: "break-all",
					}}
				>
					<Typography variant="body1" sx={{ fontFamily: "monospace", fontSize: "0.95rem" }}>
						{apiKey.key}
					</Typography>
					<Tooltip title={copied ? "Copied!" : "Copy"}>
						<IconButton onClick={handleCopy} sx={{ color: "white" }}>
							{copied ? <CheckCircleIcon /> : <></>}
						</IconButton>
					</Tooltip>
				</Box>

				<Box textAlign="right">
					<Button onClick={handleCopy} variant="outlined" color="inherit">
						Copy the key
					</Button>
				</Box>
			</Stack>
		</Paper>
	);
}