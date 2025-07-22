'use client';
import { useState } from 'react';
import { UserSearchResult } from '@/entities/user.entity';
import Skeleton from 'react-loading-skeleton';
import {
	Box,
	Button,
	Container,
	Dialog,
	DialogActions,
	DialogContent,
	Divider,
	InputAdornment,
	Paper,
	TextField,
	Typography,
} from '@mui/material';
import { useToast } from '@/app/layout';
import { useOrganisation } from '@/contexts/organisation-store.context';
import { useModal } from 'react-modal-hook';
import TableOfUsers from '@/app/home/organisation/[organisationId]/user/TableOfUsers';
import {
	useAddExistingUserInOrganisationMutation,
	useGetUsersInOrganisationQuery,
	useRemoveUserInOrganisationMutation,
	UserEntityFragment,
} from '@/generated/graphql';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SearchIcon from '@mui/icons-material/Search';
import PeopleIcon from '@mui/icons-material/People';
import { useConfirmationModal } from '@/contexts/popup-modal.component';
import { InsertExistingUserPanel } from '@/app/home/organisation/[organisationId]/user/InsertExistingUserPanel';

export default function UserPage() {
	// State
	const [searchTerm, setSearchTerm] = useState('');

	// Context and utilities
	const organisation = useOrganisation();
	const notify = useToast();
	const openConfirmation = useConfirmationModal();

	// Queries and mutations
	const organisationId = organisation.id;
	const { data, loading: isLoadingUsers, refetch: refetchUsers } = useGetUsersInOrganisationQuery({
		variables: { id: organisationId },
	});
	const [removeUserFromOrganisation] = useRemoveUserInOrganisationMutation();
	const [insertUserInOrganisation, { loading: isInsertingUser }] = useAddExistingUserInOrganisationMutation();

	// Modals
	const [showAddExistingUserModal, hideAddExistingUserModal] = useModal(() => {
		return (
			<Dialog open={true} maxWidth="sm" fullWidth>
				<DialogContent>
					<InsertExistingUserPanel onClick={handleAddUser} />
				</DialogContent>
				<DialogActions sx={{ px: 3, pb: 3 }}>
					<Button
						onClick={hideAddExistingUserModal}
						variant="outlined"
						color="inherit"
					>
						Cancel
					</Button>
				</DialogActions>
			</Dialog>
		);
	});

	// Business logic functions
	function handleUserSearch(user: UserEntityFragment, searchTerm: string): boolean {
		const searchLower = searchTerm.toLowerCase();
		return searchTerm === '' ||
			user.publicKey.toLowerCase().includes(searchLower) ||
			user.firstname.toLowerCase().includes(searchLower) ||
			user.lastname.toLowerCase().includes(searchLower);
	}

	function handleAddUser(user: UserSearchResult): void {
		if (isInsertingUser) return;

		insertUserInOrganisation({
			variables: { organisationId, userPublicKey: user.publicKey },
		}).then(result => {
			const { data, errors } = result;
			if (data) {
				notify.success(`User ${user.firstname} ${user.lastname} added to organisation`);
				refetchUsers();
				hideAddExistingUserModal();
			} else if (errors) {
				notify.error(errors);
			}
		}).catch(notify.error);
	}

	function handleRemoveUser(userPublicKey: string, userName: string): void {
		openConfirmation(
			'Remove User',
			`Are you sure you want to remove ${userName} from this organisation?`,
			'Remove',
			'Cancel',
			() => {
				removeUserFromOrganisation({
					variables: { organisationId, userPublicKey },
				}).then(result => {
					const { errors } = result;
					if (errors) {
						notify.error(errors);
					} else {
						notify.success('User successfully removed from organisation');
						refetchUsers();
					}
				}).catch(notify.error);
			},
		);
	}

	// Loading state
	if (isLoadingUsers || !data) {
		return (
			<Container maxWidth={false} disableGutters>
				<Box mb={4}>
					<Skeleton height={40} width={300} />
					<Box mt={4}>
						<Skeleton height={60} />
						<Skeleton count={5} height={50} />
					</Box>
				</Box>
			</Container>
		);
	}

	// Derived state
	const users = data.organisation.users;
	const filteredUsers = users.filter(user => handleUserSearch(user, searchTerm));
	const hasNoResults = filteredUsers.length === 0;
	const isSearching = searchTerm.length > 0;

	return (
		<Container maxWidth={false} disableGutters>
			<Box mb={4}>
				<Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
					<Box display="flex" alignItems="center" gap={2}>
						<PeopleIcon color="primary" fontSize="large" />
						<Typography variant="h4" fontWeight="500" color="primary">
							Team Members
						</Typography>
					</Box>
					<Box display="flex" alignItems="center" gap={2}>
						<Paper
							elevation={0}
							sx={{
								display: 'flex',
								alignItems: 'center',
								px: 2,
								py: 0.5,
								borderRadius: 2,
								border: '1px solid #e0e0e0',
							}}
						>
							<InputAdornment position="start">
								<SearchIcon color="action" />
							</InputAdornment>
							<TextField
								variant="standard"
								placeholder="Search members..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								InputProps={{
									disableUnderline: true,
								}}
								sx={{ ml: 1 }}
							/>
						</Paper>
						<Button
							variant="contained"
							onClick={showAddExistingUserModal}
							startIcon={<PersonAddIcon />}
							disabled={isInsertingUser}
							sx={{
								borderRadius: 2,
								textTransform: 'none',
								px: 2,
							}}
						>
							Add Member
						</Button>
					</Box>
				</Box>
				<Divider />
			</Box>
			{hasNoResults ? (
				<Box
					display="flex"
					flexDirection="column"
					alignItems="center"
					justifyContent="center"
					py={8}
					textAlign="center"
				>
					<Typography variant="h6" color="text.secondary" gutterBottom>
						No team members found
					</Typography>
					<Typography variant="body2" color="text.secondary">
						{isSearching ?
							`No results matching "${searchTerm}"` :
							'Add team members to collaborate on this organisation'}
					</Typography>
				</Box>
			) : (
				<Paper elevation={0} sx={{ borderRadius: 2, overflow: 'hidden', border: '1px solid #eaeaea' }}>
					<TableOfUsers
						users={filteredUsers}
						onClick={user => console.log(user)}
						onDelete={(pk, name) => handleRemoveUser(pk, name)}
					/>
				</Paper>
			)}
		</Container>
	);
}