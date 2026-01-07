import React from 'react';
import { Box, Stack, Skeleton as MuiSkeleton } from '@mui/material';

export function PageSkeleton() {
	return (
		<Box sx={{ maxWidth: 1400, mx: 'auto', p: 4 }}>
			<Stack spacing={4}>
				<Box>
					<MuiSkeleton variant="text" width={200} height={40} />
					<MuiSkeleton variant="text" width={400} height={24} />
				</Box>
				<MuiSkeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
				<MuiSkeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
			</Stack>
		</Box>
	);
}
