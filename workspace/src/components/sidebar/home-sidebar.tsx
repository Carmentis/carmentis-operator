'use client';

import { AuthenticatedUserSidebarItem, CarmentisLogo, SidebarItem } from '@/components/sidebar/sidebar-components';
import Skeleton from 'react-loading-skeleton';
import { useLinkedNodeStatus } from '@/hooks/useLinkedNodeStatus';
import { Alert, Box, Card, Typography } from '@mui/material';
import StorageIcon from '@mui/icons-material/Storage';
import HomeIcon from '@mui/icons-material/Home';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuthenticationContext } from '@/contexts/user-authentication.context';

export default function HomeSideBar() {

	const context = useAuthenticationContext()

	return <Box display={"flex"} flexDirection={"column"} height={"100%"}>
		<Box flexGrow={1}>
			<AuthenticatedUserSidebarItem/>
			<SidebarItem icon={<HomeIcon/>} text={"Home"} link={"/home"} activeRegex={/\/home$/}/>
			<SidebarItem icon={<PeopleIcon/>} text={"Users"} link={"/home/user"} activeRegex={/\/home\/user$/}/>
			<SidebarItem icon={<SettingsIcon/>} text={"Parameters"} link={"/home/parameters"} activeRegex={/\/home\/parameters$/}/>
			<SidebarItem icon={<LogoutIcon/>} text={"Logout"} onClick={() => context.disconnect()} />
		</Box>
		<Box display={"flex"} flexGrow={2}></Box>
		<LinkedNodeSidebarItem/>
	</Box>
}



function LinkedNodeSidebarItem() {
	const {status: nodeStatus, loading, error} = useLinkedNodeStatus();

	// show a loading status
	if (loading) return <Skeleton/>

	// compute the message to show
	let content = <></>
	if (!nodeStatus || error) {
		content = <Alert severity={"warning"} >
			Node offline
		</Alert>
	} else {
		content = <Card sx={{p:2}}>
			<Box display={"flex"} flexDirection={"row"} gap={1}>
				<StorageIcon/>
				<Typography>
					{nodeStatus.result.node_info.moniker}
				</Typography>
			</Box>
			<Typography variant={"body1"} color={"textSecondary"}>
				You are connected to chain <Typography>{nodeStatus.result.node_info.network}.</Typography>
			</Typography>
		</Card>
	}

	return <>
		{content}
	</>
}