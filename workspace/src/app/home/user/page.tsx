'use client';
import React, { useState, useEffect } from 'react';
import { UserSummary } from '@/entities/user.entity';
import Skeleton from 'react-loading-skeleton';
import { useToast } from '@/app/layout';
import {
	Box,
	Button,
	Chip,
	Container,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Divider,
	IconButton,
	InputAdornment,
	Paper,
	Switch,
	TextField,
	Tooltip,
	Typography,
	useTheme,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SearchIcon from '@mui/icons-material/Search';
import { motion } from 'framer-motion';
import { useModal } from 'react-modal-hook';
import GenericTableComponent from '@/components/GenericTableComponent';
import { useCreateUserMutation, useDeleteUserMutation, useGetAllUsersQuery, useUpdateUserAdminMutation } from '@/generated/graphql';
import { useAuthenticationContext } from '@/contexts/user-authentication.context';
import { useConfirmationModal } from '@/contexts/popup-modal.component';

// Glass effect styles
const glassStyles = {
	background: 'rgba(255, 255, 255, 0.25)',
	backdropFilter: 'blur(10px)',
	border: '1px solid rgba(255, 255, 255, 0.18)',
	boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
	borderRadius: 2,
	transition: 'all 0.3s ease-in-out',
	'&:hover': {
		transform: 'translateY(-5px)',
		boxShadow: '0 15px 30px 0 rgba(31, 38, 135, 0.25)',
	}
};

// Animation variants for Framer Motion
const fadeInUp = {
	hidden: { opacity: 0, y: 20 },
	visible: {
		opacity: 1,
		y: 0,
		transition: {
			duration: 0.5,
			ease: "easeOut"
		}
	}
};

const staggerContainer = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: 0.1
		}
	}
};

export default function UserPage() {
	const notify = useToast();
	const [publicKey, setPublicKey] = useState('');
	const [firstname, setFirstname] = useState('');
	const [lastname, setLastname] = useState('');
	const [searchTerm, setSearchTerm] = useState('');
	const [filteredUsers, setFilteredUsers] = useState<UserSummary[]>([]);
	const [formErrors, setFormErrors] = useState({
		publicKey: '',
		firstname: '',
		lastname: ''
	});

	const { data, loading } = useGetAllUsersQuery();

	// Filter users based on search term
	useEffect(() => {
		if (data?.getAllUsers) {
			if (!searchTerm) {
				setFilteredUsers(data.getAllUsers);
			} else {
				const lowercasedSearch = searchTerm.toLowerCase();
				const filtered = data.getAllUsers.filter(user =>
					user.publicKey.toLowerCase().includes(lowercasedSearch) ||
					user.firstname.toLowerCase().includes(lowercasedSearch) ||
					user.lastname.toLowerCase().includes(lowercasedSearch)
				);
				setFilteredUsers(filtered);
			}
		}
	}, [data, searchTerm]);
	const [callUserCreation, { loading: isCreating }] = useCreateUserMutation({
		refetchQueries: ['getAllUsers'],
	});
	const [callUserDeletion, { loading: isDeleting }] = useDeleteUserMutation({
		refetchQueries: ['getAllUsers'],
	});

	const [updateUserAdmin, { loading: isUpdatingAdmin }] = useUpdateUserAdminMutation({
		refetchQueries: ['getAllUsers'],
	});

	const openConfirmation = useConfirmationModal();

	function validateForm() {
		const errors = {
			publicKey: '',
			firstname: '',
			lastname: ''
		};

		if (!publicKey.trim()) {
			errors.publicKey = 'Public key is required';
		}

		if (!firstname.trim()) {
			errors.firstname = 'First name is required';
		}

		if (!lastname.trim()) {
			errors.lastname = 'Last name is required';
		}

		setFormErrors(errors);
		return !Object.values(errors).some(error => error !== '');
	}

	function resetForm() {
		setPublicKey('');
		setFirstname('');
		setLastname('');
		setFormErrors({
			publicKey: '',
			firstname: '',
			lastname: ''
		});
	}

	function addUser() {
		if (!validateForm()) return;

		callUserCreation({
			variables: {
				publicKey,
				firstname,
				lastname,
				isAdmin: false
			}
		})
			.then(() => {
				notify.success(`User ${firstname} ${lastname} created successfully`);
				resetForm();
			})
			.catch(e => notify.error(e));
	}

	function confirmRemoveUser(publicKey: string, name: string) {
		openConfirmation(
			"Delete User",
			`Are you sure you want to delete user ${name}?`,
			"Delete",
			"Cancel",
			() => removeUser(publicKey)
		);
	}

	function removeUser(publicKey: string) {
		callUserDeletion({
			variables: { publicKey }
		})
			.then(() => {
				notify.success("User deleted successfully");
			})
			.catch(e => notify.error(e));
	}

	function toggleUserAdmin(publicKey: string, isAdmin: boolean, name: string) {
		updateUserAdmin({
			variables: { publicKey, isAdmin }
		})
			.then(() => {
				notify.success(`${name} is ${isAdmin ? 'now' : 'no longer'} an admin`);
			})
			.catch(e => notify.error(e));
	}

	const [showModal, hideModal] = useModal(() => (
		<Dialog open={true} maxWidth="sm" fullWidth>
			<DialogTitle>
				<Box display="flex" alignItems="center" gap={1}>
					<PersonAddIcon color="primary" />
					<Typography variant="h6">Create New User</Typography>
				</Box>
			</DialogTitle>
			<DialogContent sx={{ pt: 2 }}>
				<Box display="flex" flexDirection="column" gap={3} mt={1}>
					<TextField
						label="Public Key"
						size="small"
						fullWidth
						autoFocus
						value={publicKey}
						onChange={(e) => setPublicKey(e.target.value)}
						error={!!formErrors.publicKey}
						helperText={formErrors.publicKey}
						required
					/>
					<TextField
						label="First Name"
						size="small"
						fullWidth
						value={firstname}
						onChange={(e) => setFirstname(e.target.value)}
						error={!!formErrors.firstname}
						helperText={formErrors.firstname}
						required
					/>
					<TextField
						label="Last Name"
						size="small"
						fullWidth
						value={lastname}
						onChange={(e) => setLastname(e.target.value)}
						error={!!formErrors.lastname}
						helperText={formErrors.lastname}
						required
					/>
				</Box>
			</DialogContent>
			<DialogActions sx={{ px: 3, pb: 3 }}>
				<Button
					onClick={() => hideModal()}
					variant="outlined"
					color="inherit"
				>
					Cancel
				</Button>
				<Button
					onClick={() => {
						if (validateForm()) {
							addUser();
							hideModal();
						}
					}}
					variant="contained"
					disabled={isCreating}
					startIcon={<PersonAddIcon />}
				>
					Create User
				</Button>
			</DialogActions>
		</Dialog>
	), [publicKey, firstname, lastname, formErrors, isCreating]);

	return (
		<Container
			maxWidth={false}
			disableGutters
			sx={{
				minHeight: '100vh',
				padding: 3,
				borderRadius: 2
			}}
		>
			<motion.div
				initial="hidden"
				animate="visible"
				variants={fadeInUp}
			>
				<Paper
					elevation={0}
					sx={{
						...glassStyles,
						p: 3,
						mb: 4
					}}
				>
					<Box display="flex" justifyContent="space-between" alignItems="center">
						<Typography variant="h4" fontWeight="600" color="primary">
							Users
						</Typography>
						<Box display="flex" gap={2}>
							<TextField
								placeholder="Search users..."
								size="small"
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								InputProps={{
									startAdornment: (
										<InputAdornment position="start">
											<SearchIcon color="action" />
										</InputAdornment>
									),
									sx: {
										borderRadius: 2,
									}
								}}
							/>
							<Button
								variant="contained"
								onClick={showModal}
								startIcon={<PersonAddIcon />}
								sx={{
									borderRadius: 2,
									textTransform: 'none',
									px: 2
								}}
							>
								New User
							</Button>
						</Box>
					</Box>
				</Paper>
			</motion.div>

			{loading || !data ? (
				<motion.div
					initial="hidden"
					animate="visible"
					variants={fadeInUp}
				>
					<Paper
						elevation={0}
						sx={{
							...glassStyles,
							p: 3
						}}
					>
						<Box mt={2}>
							<Skeleton height={60} />
							<Skeleton count={5} height={50} />
						</Box>
					</Paper>
				</motion.div>
			) : (
				filteredUsers.length === 0 ? (
					<motion.div
						initial="hidden"
						animate="visible"
						variants={fadeInUp}
					>
						<Paper
							elevation={0}
							sx={{
								...glassStyles,
								p: 5
							}}
						>
							<Box
								display="flex"
								flexDirection="column"
								alignItems="center"
								justifyContent="center"
								py={4}
								textAlign="center"
							>
								<Typography variant="h6" color="text.secondary" gutterBottom>
									{searchTerm ? "No users match your search" : "No users found"}
								</Typography>
								<Typography variant="body2" color="text.secondary">
									{searchTerm ? "Try a different search term" : "Create your first user to get started"}
								</Typography>
							</Box>
						</Paper>
					</motion.div>
				) : (
					<motion.div
						initial="hidden"
						animate="visible"
						variants={fadeInUp}
					>
						<Paper
							elevation={0}
							sx={{
								...glassStyles,
								overflow: 'hidden'
							}}
						>
							<TableOfUsers
								users={filteredUsers}
								onDelete={confirmRemoveUser}
								onToggleAdmin={toggleUserAdmin}
							/>
						</Paper>
					</motion.div>
				)
			)}
		</Container>
	);
}

function TableOfUsers({ users, onDelete, onToggleAdmin }: {
	users: UserSummary[],
	onDelete: (pk: string, name: string) => void,
	onToggleAdmin?: (pk: string, isAdmin: boolean, name: string) => void
}) {
	const auth = useAuthenticationContext();
	const currentUser = auth.getAuthenticatedUser();
	const isCurrentUserAdmin = currentUser.isAdmin;

	return GenericTableComponent({
		data: users,
		wrapTable: (table) => (
			<Box sx={{ p: 2 }}>
				{table}
			</Box>
		),
		extractor(row: UserSummary, index: number): { head: string; value: React.ReactNode }[] {
			return [
				{ head: "Public Key", value: (
						<Box sx={{ display: 'flex', alignItems: 'center' }}>
							<Typography
								variant="body2"
								sx={{
									maxWidth: '300px',
									overflow: 'hidden',
									textOverflow: 'ellipsis',
									whiteSpace: 'nowrap',
									fontFamily: 'monospace',
									bgcolor: 'rgba(0, 0, 0, 0.03)',
									px: 1,
									py: 0.5,
									borderRadius: 1,
									fontSize: '0.85rem'
								}}
							>
								{row.publicKey}
							</Typography>
						</Box>
					)},
				{ head: "Name", value: (
						<Typography
							variant="body2"
							fontWeight="500"
							sx={{
								display: 'inline-block',
								px: 1,
								py: 0.5,
								borderRadius: 1,
								transition: 'all 0.2s',
								'&:hover': {
									bgcolor: 'rgba(0, 0, 0, 0.03)',
								}
							}}
						>
							{`${row.firstname} ${row.lastname}`}
						</Typography>
					)},
				{ head: "Role", value: (
						<Box display="flex" alignItems="center" gap={1}>
							{row.isAdmin && (
								<Chip
									label="Admin"
									size="small"
									color="primary"
									sx={{
										borderRadius: 1,
										background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
										fontWeight: 'bold',
										boxShadow: '0 2px 10px rgba(33, 150, 243, 0.3)'
									}}
								/>
							)}
							{isCurrentUserAdmin && onToggleAdmin && (
								<Tooltip title={row.isAdmin ? "Remove admin privileges" : "Make admin"}>
									<Switch
										size="small"
										checked={row.isAdmin}
										onChange={(e) => {
											e.stopPropagation();
											onToggleAdmin(row.publicKey, e.target.checked, `${row.firstname} ${row.lastname}`);
										}}
										disabled={row.publicKey === currentUser.publicKey} // Can't change own admin status
									/>
								</Tooltip>
							)}
						</Box>
					)},
				{
					head: '',
					value: (
						<Tooltip title="Delete user">
							<IconButton
								onClick={(e) => {
									e.stopPropagation();
									onDelete(row.publicKey, `${row.firstname} ${row.lastname}`);
								}}
								size="small"
								color="error"
								disabled={row.publicKey === currentUser.publicKey} // Can't delete yourself
								sx={{
									borderRadius: 1,
									transition: 'all 0.2s',
									'&:hover': {
										backgroundColor: 'rgba(211, 47, 47, 0.1)',
										transform: 'scale(1.1)'
									}
								}}
							>
								<DeleteIcon fontSize="small" />
							</IconButton>
						</Tooltip>
					)
				}
			];
		},
	});
}
