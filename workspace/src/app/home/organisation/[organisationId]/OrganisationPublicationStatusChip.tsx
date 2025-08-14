import { Chip, useTheme, alpha } from "@mui/material";
import PublishIcon from '@mui/icons-material/Publish';
import useOrganisationPublicationStatus from '@/hooks/useOrganisationPublicationStatus';
import { useOrganisation } from '@/contexts/organisation-store.context';

export default function OrganisationPublicationStatusChip() {
	const { virtualBlockchainId } = useOrganisation();
	const {published, loading} = useOrganisationPublicationStatus({ virtualBlockchainId });
	if (loading || typeof published !== 'boolean') return <ChipRenderer label={"Loading..."}/>
	return  <ChipRenderer label={published ? "Published" : "Not published"}/>
}

function ChipRenderer({label}: {label: string}) {
	const theme = useTheme();
	return <Chip
		label={label}
		color="primary"
		size="small"
		icon={<PublishIcon />}
		sx={{
			borderRadius: '16px',
			background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${alpha(theme.palette.primary.main, 0.8)})`,
			color: 'white',
			fontWeight: 500,
			boxShadow: '0 2px 10px rgba(21, 154, 156, 0.2)',
			'& .MuiChip-label': {
				px: 1.5
			},
			'& .MuiChip-icon': {
				color: 'white'
			}
		}}
	/>
}