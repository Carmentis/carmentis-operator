'use client';

import { AuthenticatedUserSidebarItem, SidebarItem, NodeStatusCard } from '@/components/sidebar/sidebar-components';
import { Box, Divider, Stack } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuthenticationContext } from '@/contexts/user-authentication.context';

export default function HomeSideBar() {
	const context = useAuthenticationContext();

	return (
		<Stack height="100%" justifyContent="space-between">
			{/* Top Section - User & Navigation */}
			<Stack spacing={2}>
				<AuthenticatedUserSidebarItem />

				<Divider sx={{ mx: 1 }} />

				<Stack spacing={0.5} px={1}>
					<SidebarItem
						icon={<HomeIcon />}
						text="Home"
						link="/home"
						activeRegex={/\/home$/}
					/>
					<SidebarItem
						icon={<PeopleIcon />}
						text="Users"
						link="/home/user"
						activeRegex={/\/home\/user$/}
					/>
					<SidebarItem
						icon={<SettingsIcon />}
						text="Parameters"
						link="/home/parameters"
						activeRegex={/\/home\/parameters$/}
					/>
				</Stack>
			</Stack>

			{/* Bottom Section - Node Status & Logout */}
			<Stack spacing={2}>
				<NodeStatusCard />

				<Box px={1}>
					<SidebarItem
						icon={<LogoutIcon />}
						text="Logout"
						onClick={() => context.disconnect()}
					/>
				</Box>
			</Stack>
		</Stack>
	);
}