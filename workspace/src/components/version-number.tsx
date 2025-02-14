import { Typography } from '@material-tailwind/react';

function VersionDisplay() {
	return <Typography>Version {process.env.APP_VERSION}</Typography>;
}

export default VersionDisplay;