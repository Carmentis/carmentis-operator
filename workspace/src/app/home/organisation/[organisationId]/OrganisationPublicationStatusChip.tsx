import { Chip, useTheme, alpha } from "@mui/material";
import PublishIcon from '@mui/icons-material/Publish';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import useOrganisationPublicationStatus from '@/hooks/useOrganisationPublicationStatus';
import { useOrganisation } from '@/contexts/organisation-store.context';

export default function OrganisationPublicationStatusChip() {
	const { virtualBlockchainId, lastPublicationCheckTime } = useOrganisation();
	const {published, pending, loading} = useOrganisationPublicationStatus({ virtualBlockchainId, lastPublicationCheckTime });
	if (loading || typeof published !== 'boolean') return <ChipRenderer label={"Loading..."} icon={<PublishIcon />}/>
	if (pending) return <ChipRenderer label={"Pending verification"} icon={<HourglassEmptyIcon />}/>
	return  <ChipRenderer label={published ? "Published" : "Not published"} icon={<PublishIcon />}/>
}

function ChipRenderer({label, icon}: {label: string, icon: React.ReactElement}) {
	const theme = useTheme();
	return <Chip
		label={label}
		color="primary"
		size="small"
		icon={icon}
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