import React from 'react';
import {
	Box,
	Card,
	Chip,
	IconButton,
	Paper,
	Skeleton,
	Switch,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Tooltip,
	Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuthenticationContext } from '@/contexts/user-authentication.context';
import { useDeleteUserMutation, useUpdateUserAdminMutation } from '@/generated/graphql';
import { useConfirmationModal } from '@/contexts/popup-modal.component';
import { useToast } from '@/app/layout';

interface User {
	publicKey: string;
	firstname: string;
	lastname: string;
	isAdmin: boolean;
}

interface UserTableProps {
	users: User[];
	loading: boolean;
}

export function UserTable({ users, loading }: UserTableProps) {
	const auth = useAuthenticationContext();
	const currentUser = auth.getAuthenticatedUser();
	const isCurrentUserAdmin = currentUser.isAdmin;
	const notify = useToast();
	const openConfirmation = useConfirmationModal();

	const [deleteUser] = useDeleteUserMutation({
		refetchQueries: ['getAllUsers'],
	});

	const [updateUserAdmin] = useUpdateUserAdminMutation({
		refetchQueries: ['getAllUsers'],
	});

	const handleDelete = (publicKey: string, name: string) => {
		openConfirmation(
			'Delete User',
			`Are you sure you want to delete ${name}?`,
			'Delete',
			'Cancel',
			async () => {
				try {
					await deleteUser({ variables: { publicKey } });
					notify.success('User deleted successfully');
				} catch (error) {
					notify.error(error);
				}
			}
		);
	};

	const handleToggleAdmin = async (publicKey: string, isAdmin: boolean, name: string) => {
		try {
			await updateUserAdmin({ variables: { publicKey, isAdmin } });
			notify.success(`${name} is ${isAdmin ? 'now' : 'no longer'} an admin`);
		} catch (error) {
			notify.error(error);
		}
	};

	if (loading) {
		return (
			<Card>
				<Box p={3}>
					<Skeleton variant="rectangular" height={400} />
				</Box>
			</Card>
		);
	}

	if (users.length === 0) {
		return (
			<Card>
				<Box p={8} textAlign="center">
					<Typography variant="h6" color="text.secondary" gutterBottom>
						No users found
					</Typography>
					<Typography variant="body2" color="text.secondary">
						Create your first user to get started
					</Typography>
				</Box>
			</Card>
		);
	}

	return (
		<Card>
			<TableContainer>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell>Name</TableCell>
							<TableCell>Public Key</TableCell>
							<TableCell>Role</TableCell>
							<TableCell align="right">Actions</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{users.map((user) => {
							const fullName = `${user.firstname} ${user.lastname}`;
							const isCurrentUserRow = user.publicKey === currentUser.publicKey;

							return (
								<TableRow key={user.publicKey} hover>
									<TableCell>
										<Typography variant="body2" fontWeight={500}>
											{fullName}
										</Typography>
									</TableCell>
									<TableCell>
										<Typography
											variant="body2"
											fontFamily="monospace"
											sx={{
												maxWidth: 300,
												overflow: 'hidden',
												textOverflow: 'ellipsis',
												whiteSpace: 'nowrap',
												bgcolor: 'action.hover',
												px: 1,
												py: 0.5,
												borderRadius: 1,
												fontSize: '0.85rem',
											}}
										>
											{user.publicKey}
										</Typography>
									</TableCell>
									<TableCell>
										<Box display="flex" alignItems="center" gap={1}>
											{user.isAdmin && (
												<Chip label="Admin" size="small" color="primary" />
											)}
											{isCurrentUserAdmin && (
												<Tooltip
													title={
														isCurrentUserRow
															? "You can't change your own role"
															: user.isAdmin
															? 'Remove admin privileges'
															: 'Make admin'
													}
												>
													<span>
														<Switch
															size="small"
															checked={user.isAdmin}
															onChange={(e) =>
																handleToggleAdmin(
																	user.publicKey,
																	e.target.checked,
																	fullName
																)
															}
															disabled={isCurrentUserRow}
														/>
													</span>
												</Tooltip>
											)}
										</Box>
									</TableCell>
									<TableCell align="right">
										<Tooltip
											title={
												isCurrentUserRow
													? "You can't delete yourself"
													: 'Delete user'
											}
										>
											<span>
												<IconButton
													size="small"
													color="error"
													onClick={() => handleDelete(user.publicKey, fullName)}
													disabled={isCurrentUserRow}
												>
													<DeleteIcon fontSize="small" />
												</IconButton>
											</span>
										</Tooltip>
									</TableCell>
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
			</TableContainer>
		</Card>
	);
}
