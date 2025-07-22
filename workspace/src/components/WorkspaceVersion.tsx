import { Typography } from '@mui/material';

function WorkspaceVersion() {
	return <Typography>Version {process.env.APP_VERSION}</Typography>;
}

export default WorkspaceVersion;
