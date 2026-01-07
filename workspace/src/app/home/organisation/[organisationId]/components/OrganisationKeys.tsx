import React from 'react';
import { Box, Button, Card, Stack, Typography } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useOrganisation } from '@/contexts/organisation-store.context';
import { useToast } from '@/app/layout';

interface KeyDisplayProps {
	label: string;
	value: string;
	onCopy: () => void;
}

function KeyDisplay({ label, value, onCopy }: KeyDisplayProps) {
	return (
		<Box>
			<Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
				<Typography variant="body2" color="text.secondary" fontWeight={500}>
					{label}
				</Typography>
				<Button
					size="small"
					variant="text"
					startIcon={<ContentCopyIcon fontSize="small" />}
					onClick={onCopy}
					sx={{ minWidth: 'auto' }}
				>
					Copy
				</Button>
			</Box>
			<Box
				sx={{
					p: 1.5,
					bgcolor: 'action.hover',
					borderRadius: 1,
					border: 1,
					borderColor: 'divider',
					overflowX: 'auto',
					'&::-webkit-scrollbar': {
						height: 6,
					},
					'&::-webkit-scrollbar-thumb': {
						backgroundColor: 'action.selected',
						borderRadius: 3,
					},
				}}
			>
				<Typography
					variant="body2"
					fontFamily="monospace"
					sx={{
						whiteSpace: 'nowrap',
						fontSize: '0.875rem',
					}}
				>
					{value}
				</Typography>
			</Box>
		</Box>
	);
}

export function OrganisationKeys() {
	const organisation = useOrganisation();
	const notify = useToast();

	const copyToClipboard = (text: string, label: string) => {
		navigator.clipboard
			.writeText(text)
			.then(() => notify.success(`${label} copied to clipboard`))
			.catch(() => notify.error('Failed to copy to clipboard'));
	};

	const keys = [
		{
			label: 'Public Key',
			value: organisation.publicSignatureKey,
			copyLabel: 'Public key',
		},
		{
			label: 'Private Key',
			value: organisation.privateSignatureKey,
			copyLabel: 'Private key',
		},
		{
			label: 'Wallet Seed',
			value: organisation.walletSeed,
			copyLabel: 'Wallet seed',
		},
	];

	return (
		<Card sx={{ p: 3 }}>
			<Stack spacing={3}>
				<Typography variant="h6" fontWeight={500}>
					Organisation Keys
				</Typography>

				<Stack spacing={2.5}>
					{keys.map((key) => (
						<KeyDisplay
							key={key.label}
							label={key.label}
							value={key.value}
							onCopy={() => copyToClipboard(key.value, key.copyLabel)}
						/>
					))}
				</Stack>
			</Stack>
		</Card>
	);
}
