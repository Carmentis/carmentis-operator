import { Box, Card, CardContent, Paper, Typography, useTheme } from '@mui/material';
import { ReactNode } from 'react';

export type WelcomeCardsProps = {
	items: {icon: string, title: string, value: string | ReactNode}[],
	className?: string
}

/**
 * The WelcomeCard function creates a styled card component displaying a title, value, and icon.
 *
 * @param {string} input.icon - The icon to be displayed on the welcome card.
 * @param {string} input.title - The title to be displayed on the welcome card.
 * @param {string|ReactNode} input.value - The value or content of the welcome card.
 * @returns {JSX.Element} A styled card component displaying a title, value, and icon.
 */
function WelcomeCard(
	input: {
		icon: string,
		title: string,
		value: string|ReactNode,
	},
) {
	const theme = useTheme();

	return (
		<Paper 
			elevation={0} 
			sx={{ 
				height: '100%',
				borderRadius: 2,
				border: '1px solid #eaeaea',
				overflow: 'hidden',
				transition: 'all 0.2s ease-in-out',
				'&:hover': {
					transform: 'translateY(-4px)',
					boxShadow: '0 6px 20px rgba(0, 0, 0, 0.05)',
				}
			}}
		>
			<Box 
				sx={{ 
					p: 2, 
					bgcolor: theme.palette.primary.main,
					color: 'white',
					display: 'flex',
					alignItems: 'center',
					gap: 1
				}}
			>
				<i className={`bi ${input.icon} text-white font-bold text-lg`}></i>
				<Typography variant="subtitle1" fontWeight="500">
					{input.title}
				</Typography>
			</Box>
			<Box sx={{ p: 3, textAlign: 'center' }}>
				<Typography variant="h5" fontWeight="bold">
					{input.value}
				</Typography>
			</Box>
		</Paper>
	);
}

export default function WelcomeCards(
	input: WelcomeCardsProps
) {
	return (
		<Box 
			id="welcome" 
			sx={{ 
				display: 'grid',
				gridTemplateColumns: {
					xs: '1fr',
					sm: 'repeat(2, 1fr)',
					md: 'repeat(3, 1fr)'
				},
				gap: 3,
				width: '100%'
			}}
			className={input.className}
		>
			{input.items.map((card, index) => (
				<Box key={index}>
					<WelcomeCard 
						icon={card.icon} 
						title={card.title} 
						value={card.value} 
					/>
				</Box>
			))}
		</Box>
	);
}
