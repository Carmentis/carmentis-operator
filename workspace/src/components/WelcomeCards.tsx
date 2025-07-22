import { Box } from '@mui/material';
import { motion } from 'framer-motion';
import { WelcomeCard, WelcomeCardsProps } from '@/components/WelcomeCard';

export default function WelcomeCards(
	input: WelcomeCardsProps,
) {
	return (
		<Box
			id="welcome"
			component={motion.div}
			initial="hidden"
			animate="visible"
			variants={{
				hidden: { opacity: 0 },
				visible: {
					opacity: 1,
					transition: {
						staggerChildren: 0.1,
					},
				},
			}}
			sx={{
				display: 'grid',
				gridTemplateColumns: {
					xs: '1fr',
					sm: 'repeat(2, 1fr)',
					md: 'repeat(3, 1fr)',
				},
				gap: 3,
				width: '100%',
			}}
			className={input.className}
		>
			{input.items.map((card, index) => (
				<Box
					key={index}
					component={motion.div}
					variants={{
						hidden: { opacity: 0, y: 20 },
						visible: {
							opacity: 1,
							y: 0,
							transition: { duration: 0.5 },
						},
					}}
				>
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