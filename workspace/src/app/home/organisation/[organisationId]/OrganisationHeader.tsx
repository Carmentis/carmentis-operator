import { useOrganisation } from '@/contexts/organisation-store.context';
import { Box, Tab, Tabs, Typography } from '@mui/material';
import Avatar from 'boring-avatars';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import GridViewIcon from '@mui/icons-material/GridView';
import HubIcon from '@mui/icons-material/Hub';
import KeyIcon from '@mui/icons-material/Key';
import PaidIcon from '@mui/icons-material/Paid';
import { useState } from 'react';

export function OrganisationHeader() {
	const organisation = useOrganisation();
	const [value, setValue] = useState(0);
	const handleChange = (event: React.SyntheticEvent, newValue: number) => {
		setValue(newValue);
	};

	return <Box mb={2}>
		<Box display="flex" flexDirection="row" gap={2}>
			<Avatar name={organisation.publicSignatureKey} square={true} width={30}/>
			<Typography variant={"h4"}>{organisation.name}</Typography>
		</Box>
		<Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
			<Tabs value={value} onChange={handleChange}>
				<Tab label="Home"  icon={<HomeIcon/>} iconPosition={'start'}/>
				<Tab label="Members" icon={<PersonIcon/>} iconPosition={'start'}  />
				<Tab label="Applications"   icon={<GridViewIcon/>} iconPosition={'start'}/>
				<Tab label="Nodes"  icon={<HubIcon/>} iconPosition={'start'}/>
				<Tab label="API Keys"  icon={<KeyIcon/>} iconPosition={'start'}/>
				<Tab label="Transactions"  icon={<PaidIcon/>} iconPosition={'start'}/>
			</Tabs>
		</Box>
	</Box>;
}