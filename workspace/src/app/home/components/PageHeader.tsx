import React from 'react';
import { Box, Typography } from '@mui/material';
import Image from 'next/image';

export function PageHeader() {
	return (
		<Box>
			<Box display="flex" alignItems="center" gap={2} mb={2}>
				<Image src="/carmentis.svg" alt="Carmentis" width={32} height={32} />
				<Typography variant="h4" fontWeight={600}>
					Workspace
				</Typography>
			</Box>
			<Typography variant="body1" color="text.secondary">
				Manage your organisations, applications, and nodes
			</Typography>
		</Box>
	);
}
