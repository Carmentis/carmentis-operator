import { UserSummary } from '@/entities/user.entity';
import GenericTableComponent from '@/components/GenericTableComponent';
import React from 'react';
import { Chip, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

export default function TableOfUsers({ users, onClick, onDelete }: { users: UserSummary[], onClick: (user: UserSummary) => void, onDelete: (pk: string) => void }) {
	return GenericTableComponent({
		data: users,
		onRowClicked: (user) => onClick(user),
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