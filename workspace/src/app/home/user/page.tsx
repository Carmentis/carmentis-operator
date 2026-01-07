'use client';
import React, { useState, useEffect } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { useGetAllUsersQuery } from '@/generated/graphql';
import { UserTable } from './components/UserTable';
import { UserPageHeader } from './components/UserPageHeader';

export default function UserPage() {
	const [searchTerm, setSearchTerm] = useState('');
	const { data, loading } = useGetAllUsersQuery();

	const filteredUsers = React.useMemo(() => {
		if (!data?.getAllUsers) return [];
		if (!searchTerm) return data.getAllUsers;

		const lowercased = searchTerm.toLowerCase();
		return data.getAllUsers.filter(
			(user) =>
				user.publicKey.toLowerCase().includes(lowercased) ||
				user.firstname.toLowerCase().includes(lowercased) ||
				user.lastname.toLowerCase().includes(lowercased)
		);
	}, [data, searchTerm]);

	return (
		<Box sx={{ maxWidth: 1400, mx: 'auto', p: 4 }}>
			<Stack spacing={3}>
				<UserPageHeader
					searchTerm={searchTerm}
					onSearchChange={setSearchTerm}
				/>
				<UserTable users={filteredUsers} loading={loading} />
			</Stack>
		</Box>
	);
}
