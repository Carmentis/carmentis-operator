import { alpha, Box, Grid, Typography, useTheme } from '@mui/material';
import React from 'react';
import CheckIcon from '@mui/icons-material/Check';
import PendingIcon from '@mui/icons-material/Pending';
import { motion } from 'framer-motion';


export function CheckComponent(input: { condition: boolean, title: string, onChecked: string, onNotChecked: string }) {
	const {condition, title, onChecked, onNotChecked} = input;
	const theme = useTheme();

	return (
		<Grid item xs={12} md={4}>
			<motion.div
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3 }}
			>
				<Box
					sx={{
						display: 'flex',
						alignItems: 'center',
						gap: 2,
						p: 2,
						width: "100%",
						borderRadius: 2,
						bgcolor: condition
							? alpha(theme.palette.success.main, 0.1)
							: alpha(theme.palette.warning.main, 0.1),
						border: '1px solid',
						borderColor: condition
							? alpha(theme.palette.success.main, 0.2)
							: alpha(theme.palette.warning.main, 0.2),
					}}
				>
					<Box
						sx={{
							bgcolor: condition
								? alpha(theme.palette.success.main, 0.2)
								: alpha(theme.palette.warning.main, 0.2),
							borderRadius: '50%',
							width: 48,
							height: 48,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center'
						}}
					>
						{condition ? (
							<CheckIcon sx={{ color: 'success.main' }} />
						) : (
							<PendingIcon sx={{ color: 'warning.main' }} />
						)}
					</Box>
					<Box>
						<Typography variant="subtitle1" fontWeight="600" color={condition ? 'success.main' : 'warning.main'}>
							{title}
						</Typography>
						<Typography variant="body2" color="text.secondary">
							{condition ? onChecked : onNotChecked}
						</Typography>
					</Box>
				</Box>
			</motion.div>
		</Grid>
	);
}