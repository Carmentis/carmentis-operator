'use client';
import React, { useState } from 'react';
import { UserSummary } from '@/entities/user.entity';
import { useAdminListOfUsersApi, useUserCreation, useUserDeletion } from '@/components/api.hook';
import Skeleton from 'react-loading-skeleton';
import { useToast } from '@/app/layout';
import {
	Box,
	Button,
	Chip,
	DialogActions,
	DialogContent,
	DialogTitle,
	IconButton,
	TextField,
	Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useModal } from 'react-modal-hook';
import { Dialog } from '@material-tailwind/react';
import GenericTableComponent from '@/components/generic-table.component';

export default function UserPage() {

	const { data, isLoading, mutate } = useAdminListOfUsersApi();
	const callUserInsertion = useUserCreation();
	const callUserDeletion = useUserDeletion();
	const notify = useToast();
	const [publicKey, setPublicKey] = useState('');
	const [firstname, setFirstname] = useState('');
	const [lastname, setLastname] = useState('');

	function addUser() {
		callUserInsertion(publicKey, firstname, lastname, false, {
			onSuccess: () => {
				notify.success('User created');
				mutate();
			},
			onError: (error) => notify.error(error),
		});
	}



	function removeUser(publicKey: string) {
		callUserDeletion(publicKey, {
			onSuccess: () => {
				notify.success('User deleted');
				mutate();
			},
			onError: (error) => notify.error(error),
		});
	}


	const [showModal, hideModal] = useModal(() => (
		<Dialog open={true}>
			<DialogTitle>Create user</DialogTitle>
			<DialogContent sx={{display: "flex", flexDirection: "column", gap: 2}}>
				<TextField size={"small"} fullWidth autoFocus placeholder={"Public Key"} value={publicKey} onChange={(e) => setPublicKey(e.target.value)} />
				<TextField size={"small"} fullWidth autoFocus placeholder={"Firstname"} value={firstname} onChange={(e) => setFirstname(e.target.value)} />
				<TextField size={"small"} fullWidth autoFocus placeholder={"Lastname"} value={lastname} onChange={(e) => setLastname(e.target.value)} />
			</DialogContent>
			<DialogActions>
				<Button onClick={() => hideModal()}>Cancel</Button>
				<Button onClick={() => { addUser(); hideModal(); }} variant={"contained"}>Create</Button>
			</DialogActions>
		</Dialog>
	), [publicKey, firstname, lastname]);


	return (
		<div className="space-y-4">
			<Box display={"flex"} flexDirection={"row"} justifyContent={"space-between"}>
				<Typography variant={"h5"} fontWeight={"bolder"}>Users</Typography>
				<Button variant={"contained"} onClick={showModal}>create user</Button>
			</Box>
			{isLoading || !data ? <Skeleton /> : <TableOfUsers users={data} onDelete={removeUser}  />}

		</div>
	);

}


function TableOfUsers({ users, onDelete }: { users: UserSummary[], onDelete: (pk: string) => void }) {
	return GenericTableComponent({
		data: users,
		extractor(row: UserSummary, index: number): { head: string; value: React.ReactNode }[] {
			return [
				{ head: "Public Key", value: row.publicKey },
				{ head: "Name", value: `${row.firstname} ${row.lastname}` },
				{ head: "Role", value: row.isAdmin && <Chip label={"Admin"}></Chip> },
				{
					head: '',
					value: <IconButton onClick={() => onDelete(row.publicKey)}>
							<DeleteIcon/>
						</IconButton>
				}
			];
		},
	})
}
