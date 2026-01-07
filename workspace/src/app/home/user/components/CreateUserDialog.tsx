import React, { useState, useEffect } from 'react';
import {
	Box,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Stack,
	TextField,
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { useCreateUserMutation } from '@/generated/graphql';
import { useToast } from '@/app/layout';

interface CreateUserDialogProps {
	open: boolean;
	onClose: () => void;
}

export function CreateUserDialog({ open, onClose }: CreateUserDialogProps) {
	const [formData, setFormData] = useState({
		publicKey: '',
		firstname: '',
		lastname: '',
	});
	const [errors, setErrors] = useState({
		publicKey: '',
		firstname: '',
		lastname: '',
	});

	const [createUser, { loading }] = useCreateUserMutation({
		refetchQueries: ['getAllUsers'],
	});
	const notify = useToast();

	useEffect(() => {
		if (!open) {
			setFormData({ publicKey: '', firstname: '', lastname: '' });
			setErrors({ publicKey: '', firstname: '', lastname: '' });
		}
	}, [open]);

	const validateForm = () => {
		const newErrors = {
			publicKey: formData.publicKey.trim() ? '' : 'Public key is required',
			firstname: formData.firstname.trim() ? '' : 'First name is required',
			lastname: formData.lastname.trim() ? '' : 'Last name is required',
		};

		setErrors(newErrors);
		return !Object.values(newErrors).some((error) => error !== '');
	};

	const handleCreate = async () => {
		if (!validateForm()) return;

		try {
			await createUser({
				variables: {
					publicKey: formData.publicKey.trim(),
					firstname: formData.firstname.trim(),
					lastname: formData.lastname.trim(),
					isAdmin: false,
				},
			});

			notify.success(`User ${formData.firstname} ${formData.lastname} created successfully`);
			onClose();
		} catch (error) {
			notify.error(error);
		}
	};

	const handleFieldChange = (field: keyof typeof formData) => (
		e: React.ChangeEvent<HTMLInputElement>
	) => {
		setFormData((prev) => ({ ...prev, [field]: e.target.value }));
		if (errors[field]) {
			setErrors((prev) => ({ ...prev, [field]: '' }));
		}
	};

	return (
		<Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
			<DialogTitle>Create New User</DialogTitle>
			<DialogContent>
				<Stack spacing={2} sx={{ mt: 2 }}>
					<TextField
						label="Public Key"
						value={formData.publicKey}
						onChange={handleFieldChange('publicKey')}
						error={!!errors.publicKey}
						helperText={errors.publicKey}
						fullWidth
						size="small"
						autoFocus
						required
					/>
					<TextField
						label="First Name"
						value={formData.firstname}
						onChange={handleFieldChange('firstname')}
						error={!!errors.firstname}
						helperText={errors.firstname}
						fullWidth
						size="small"
						required
					/>
					<TextField
						label="Last Name"
						value={formData.lastname}
						onChange={handleFieldChange('lastname')}
						error={!!errors.lastname}
						helperText={errors.lastname}
						fullWidth
						size="small"
						required
					/>
				</Stack>
			</DialogContent>
			<DialogActions sx={{ px: 3, pb: 3 }}>
				<Button onClick={onClose} variant="outlined">
					Cancel
				</Button>
				<Button
					onClick={handleCreate}
					variant="contained"
					disabled={loading}
					startIcon={<PersonAddIcon />}
				>
					Create User
				</Button>
			</DialogActions>
		</Dialog>
	);
}
