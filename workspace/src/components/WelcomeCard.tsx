import { alpha, Box, Paper, Typography, useTheme } from '@mui/material';
import { ReactNode } from 'react';
import { motion } from 'framer-motion';

export type WelcomeCardsProps = {
	items: {icon: string, title: string, value: string | ReactNode}[],
	className?: string
}

/**
 * The WelcomeCard function creates a styled card component displaying a title, value, and icon.
 * It uses a modern glass-effect design with animations for a more reactive interface.
 *
 * @param {string} input.icon - The icon to be displayed on the welcome card.
 * @param {string} input.title - The title to be displayed on the welcome card.
 * @param {string|ReactNode} input.value - The value or content of the welcome card.
 * @returns {JSX.Element} A styled card component displaying a title, value, and icon.
 */
export function WelcomeCard(
	input: {
		icon: string,
		title: string,
		value: string|ReactNode,
	},
) {
	const theme = useTheme();

	return (
		<motion.div
			whileHover={{ 
				y: -8,
				transition: { duration: 0.3, ease: "easeOut" }
			}}
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
		>
			<Paper 
				elevation={0} 
				sx={{ 
					height: '100%',
					borderRadius: 2,
					background: 'rgba(255, 255, 255, 0.25)',
					backdropFilter: 'blur(10px)',
					border: '1px solid rgba(255, 255, 255, 0.18)',
					boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
					overflow: 'hidden',
					position: 'relative',
					'&::before': {
						content: '""',
						position: 'absolute',
						top: 0,
						left: 0,
						right: 0,
						height: '100%',
						zIndex: 0
					}
				}}
			>
				<Box 
					sx={{ 
						p: 2, 
						background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${alpha(theme.palette.primary.main, 0.8)})`,
						color: 'white',
						display: 'flex',
						alignItems: 'center',
						gap: 1,
						position: 'relative',
						zIndex: 1,
						boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
					}}
				>
					<i className={`bi ${input.icon} text-white font-bold text-lg`}></i>
					<Typography variant="subtitle1" fontWeight="600">
						{input.title}
					</Typography>
				</Box>
				<Box 
					sx={{ 
						p: 3, 
						textAlign: 'center',
						position: 'relative',
						zIndex: 1,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						minHeight: '100px'
					}}
				>
					<Typography variant="h5" fontWeight="bold" color="primary">
						{input.value}
					</Typography>
				</Box>
			</Paper>
		</motion.div>
	);
}

