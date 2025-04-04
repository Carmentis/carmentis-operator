import React, { useState } from 'react';
import {
	Box,
	Button,
	Chip, DialogActions, DialogContent,
	DialogTitle,
	IconButton,
	Paper,
	Stack,
	TextField,
	Tooltip,
	Typography,
} from '@mui/material';
import { ApiKey, useApiKeysInApplication, useKeyCreationApi, useKeyDeletionApi } from '@/components/api.hook';
import GenericTableComponent from '@/components/generic-table.component';
import { useParams } from 'next/navigation';
import { useAsyncFn, useBoolean } from 'react-use';
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircleIcon } from '@heroicons/react/16/solid';
import DeleteIcon from '@mui/icons-material/Delete';
import { useModal } from 'react-modal-hook';
import { Dialog } from '@material-tailwind/react';
import useConfirmationModal from '@/components/modals/confirmation-modal';
import getApiKeyStatus from '@/hooks/api-key-status.hook';


// Schéma Zod avec un seul champ
const formSchema = z.object({
	name: z.string().min(1, "The name is required"),
	activeUntil: z.string().date("The date is required.")
});

type FormData = z.infer<typeof formSchema>;

export default function ApiKeysPage() {
	const callKeyCreation = useKeyCreationApi()
	const callKeyDeletion = useKeyDeletionApi();
	const {organisationId, applicationId} = useParams<{ organisationId: number, applicationId: number }>();
	const {data: apiKeys, isLoading, error, mutate} = useApiKeysInApplication(organisationId, applicationId);
	const [wantToCreateKey, setWantToCreateKey] = useBoolean(false);
	const [createdKey, setCreatedKey] = useState<ApiKey|undefined>();
	const [keyCreationState, createKey] = useAsyncFn(async (data: FormData) => {
		callKeyCreation(applicationId, data.name, data.activeUntil, {
			onSuccessData: (key: ApiKey) => {
				setCreatedKey(key);
				setWantToCreateKey(false)
			}
		})
	})

	// confirm the api key deletion
	const [showModal, setState] = useConfirmationModal<number>({
		title: "Confirm Deletion",
        message: "Are you sure you want to delete this API key?",
        onYes: (data:number) => callKeyDeletion(applicationId, data, {
			onSuccess: () => mutate()
		}),
		yes: "Delete",
		no: "Cancel",
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
		createKey(data);
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
					<Button variant={"contained"} type="submit" disabled={keyCreationState.loading}>Create</Button>
				</Box>
			</Box>
		</>
	} else {
		content = <GenericTableComponent
			data={apiKeys}
			isLoading={isLoading}
			error={error}
			extractor={row => {
				const status = getApiKeyStatus(row)

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
				<Typography variant="h5" fontWeight="bold">
					API Keys
				</Typography>
				<Button variant="contained" color="primary" onClick={() => setWantToCreateKey(true)}>
					Generate Key
				</Button>
			</Box>
			{createdKeyContent}
			{content}
		</Box>
	);
}

type Props = {
	apiKey: ApiKey;
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

/*

			<TableContainer component={Paper}>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell><strong>Name</strong></TableCell>
							<TableCell><strong>API Key</strong></TableCell>
							<TableCell><strong>Created</strong></TableCell>
							<TableCell align="right"><strong>Actions</strong></TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{apiKeys.map((row, index) => (
							<TableRow key={index}>
								<TableCell>{row.name}</TableCell>
								<TableCell>{`${row.key} ••••`}</TableCell>
								<TableCell>{row.created}</TableCell>
								<TableCell align="right">
									<IconButton size="small" aria-label="edit">
										<EditIcon />
									</IconButton>
									<IconButton size="small" aria-label="delete">
										<DeleteIcon />
									</IconButton>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>
 */
