'use client';
import React, { useState } from 'react';
import { UserSummary } from '@/entities/user.entity';
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
import { useCreateUserMutation, useDeleteUserMutation, useGetAllUsersQuery } from '@/generated/graphql';

export default function UserPage() {

	const notify = useToast();
	const [publicKey, setPublicKey] = useState('');
	const [firstname, setFirstname] = useState('');
	const [lastname, setLastname] = useState('');

	const {data, loading} = useGetAllUsersQuery();
	const [callUserCreation] = useCreateUserMutation({
		refetchQueries: ['getAllUsers'],
	});
	const [callUserDeletion] = useDeleteUserMutation({
		refetchQueries: ['getAllUsers'],
	});


	function addUser() {
		callUserCreation({
			variables: {
				publicKey,
				firstname,
				lastname,
				isAdmin: false
			}
		}).catch(e => notify.error(e));
	}



	function removeUser(publicKey: string) {
		callUserDeletion({
			variables: { publicKey }
		}).catch(e => notify.error(e));
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
			{loading || !data ? <Skeleton /> : <TableOfUsers users={data.getAllUsers} onDelete={removeUser}  />}

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
