'use client';

import { AuthenticatedUserSidebarItem, CarmentisLogo, SidebarItem } from '@/components/sidebar/sidebar-components';
import Image from 'next/image'
import { useGetLinkedNodeQuery } from '@/generated/graphql';
import Skeleton from 'react-loading-skeleton';
import { useLinkedNodeStatus } from '@/hooks/useLinkedNodeStatus';
import { Box, Card, Typography } from '@mui/material';
import StorageIcon from '@mui/icons-material/Storage';
import HomeIcon from '@mui/icons-material/Home';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';

export default function HomeSideBar() {
	return <Box display={"flex"} flexDirection={"column"} height={"100%"}>
		<Box flexGrow={1}>
			<AuthenticatedUserSidebarItem/>
			<SidebarItem icon={<HomeIcon/>} text={"Home"} link={"/home"} activeRegex={/\/home$/}/>
			<SidebarItem icon={<PeopleIcon/>} text={"Users"} link={"/home/user"} activeRegex={/\/home\/user$/}/>
			<SidebarItem icon={<SettingsIcon/>} text={"Parameters"} link={"/home/parameters"} activeRegex={/\/home\/parameters$/}/>
		</Box>
		<Box display={"flex"} flexGrow={2}></Box>
		<LinkedNodeSidebarItem/>
	</Box>
}

function LinkedNodeSidebarItem() {
	const {status: nodeStatus, loading, error} = useLinkedNodeStatus();
	if (loading) return <Skeleton/>
	if (!nodeStatus || error) return <>{error?.message}</>
	return <Card sx={{p:2}}>
		<Box display={"flex"} flexDirection={"row"} gap={1}>
			<StorageIcon/>
			<Typography>
				{nodeStatus.getNodeName()}
			</Typography>
		</Box>
		<Typography variant={"body1"} color={"textSecondary"}>
			You are connected to chain <Typography>{nodeStatus.getChainId()}.</Typography>
		</Typography>

	</Card>
}