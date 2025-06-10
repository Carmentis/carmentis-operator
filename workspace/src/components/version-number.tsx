import { Typography } from '@mui/material';

function VersionDisplay() {
	return <Typography>Version {process.env.APP_VERSION}</Typography>;
}

export default VersionDisplay;
