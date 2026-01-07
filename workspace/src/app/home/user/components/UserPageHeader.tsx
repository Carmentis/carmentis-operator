import React, { useState } from 'react';
import { Box, Button, InputAdornment, Stack, TextField, Typography } from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SearchIcon from '@mui/icons-material/Search';
import { CreateUserDialog } from './CreateUserDialog';

interface UserPageHeaderProps {
	searchTerm: string;
	onSearchChange: (value: string) => void;
}

export function UserPageHeader({ searchTerm, onSearchChange }: UserPageHeaderProps) {
	const [dialogOpen, setDialogOpen] = useState(false);

	return (
		<>
			<Stack spacing={3}>
				<Box>
					<Typography variant="h4" fontWeight={600} gutterBottom>
						Users
					</Typography>
					<Typography variant="body1" color="text.secondary">
						Manage workspace users and their permissions
					</Typography>
				</Box>

				<Box display="flex" justifyContent="space-between" alignItems="center">
					<TextField
						placeholder="Search users..."
						size="small"
						value={searchTerm}
						onChange={(e) => onSearchChange(e.target.value)}
						sx={{ width: 300 }}
						InputProps={{
							startAdornment: (
								<InputAdornment position="start">
									<SearchIcon fontSize="small" />
								</InputAdornment>
							),
						}}
					/>
					<Button
						variant="contained"
						startIcon={<PersonAddIcon />}
						onClick={() => setDialogOpen(true)}
					>
						New User
					</Button>
				</Box>
			</Stack>

			<CreateUserDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
		</>
	);
}
