import { usePathname } from 'next/navigation';
import { useInterfaceContext } from '@/contexts/interface.context';
import { useAuthenticationContext } from '@/contexts/user-authentication.context';
import { useLinkedNodeStatus } from '@/hooks/useLinkedNodeStatus';
import Avatar from 'boring-avatars';
import { Alert, Box, ButtonBase, Skeleton, Stack, Typography, alpha } from '@mui/material';
import { useCustomRouter } from '@/contexts/application-navigation.context';
import StorageIcon from '@mui/icons-material/Storage';
import React from 'react';

interface SidebarItemProps {
	icon: React.ReactNode;
	text: string;
	link?: string;
	onClick?: () => void;
	activeRegex?: RegExp;
	id?: string;
}

export function SidebarItem({ icon, text, link, onClick, activeRegex, id }: SidebarItemProps) {
	const activePath = usePathname();
	const interfaceStore = useInterfaceContext();
	const router = useCustomRouter();

	const isActive = activeRegex && activeRegex.test(activePath);
	const isCollapsed = interfaceStore.sidebarHidden;

	const handleClick = () => {
		if (link) {
			router.push(link);
		} else if (onClick) {
			onClick();
		}
	};

	return (
		<ButtonBase
			id={id}
			onClick={handleClick}
			sx={{
				width: '100%',
				borderRadius: 1.5,
				px: 1.5,
				py: 1,
				justifyContent: isCollapsed ? 'center' : 'flex-start',
				transition: 'all 0.2s',
				color: isActive ? 'primary.main' : 'text.secondary',
				bgcolor: isActive ? (theme) => alpha(theme.palette.primary.main, 0.08) : 'transparent',
				'&:hover': {
					bgcolor: isActive
						? (theme) => alpha(theme.palette.primary.main, 0.12)
						: 'action.hover',
				},
			}}
		>
			<Box display="flex" alignItems="center" gap={1.5}>
				<Box sx={{ display: 'flex', fontSize: 20 }}>{icon}</Box>
				{!isCollapsed && (
					<Typography variant="body2" fontWeight={isActive ? 600 : 400}>
						{text}
					</Typography>
				)}
			</Box>
		</ButtonBase>
	);
}

export function AuthenticatedUserSidebarItem() {
	const authenticatedUserContext = useAuthenticationContext();
	const interfaceContext = useInterfaceContext();

	if (!authenticatedUserContext.isAuthenticated()) {
		return (
			<Box p={2}>
				<Skeleton variant="rectangular" height={56} sx={{ borderRadius: 2 }} />
			</Box>
		);
	}

	const user = authenticatedUserContext.getAuthenticatedUser();
	const isCollapsed = interfaceContext.sidebarHidden;

	return (
		<Box
			sx={{
				p: 1.5,
				bgcolor: 'background.paper',
				borderRadius: 2,
				border: 1,
				borderColor: 'divider',
			}}
		>
			{isCollapsed ? (
				<Box display="flex" justifyContent="center">
					<Avatar
						variant="beam"
						name={user.publicKey}
						size={40}
						colors={['#159A9C', '#9C8714', '#1E293B', '#0F172A', '#0D9488']}
					/>
				</Box>
			) : (
				<Box display="flex" alignItems="center" gap={1.5}>
					<Avatar
						variant="beam"
						name={user.publicKey}
						size={40}
						colors={['#159A9C', '#9C8714', '#1E293B', '#0F172A', '#0D9488']}
					/>
					<Box flex={1} overflow="hidden">
						<Typography variant="body2" fontWeight={600} noWrap>
							{user.firstname} {user.lastname}
						</Typography>
						<Typography variant="caption" color="text.secondary" noWrap>
							{user.email}
						</Typography>
					</Box>
				</Box>
			)}
		</Box>
	);
}

export function NodeStatusCard() {
	const { status: nodeStatus, loading, error } = useLinkedNodeStatus();
	const interfaceContext = useInterfaceContext();
	const isCollapsed = interfaceContext.sidebarHidden;

	if (loading) {
		return (
			<Box px={1}>
				<Skeleton variant="rectangular" height={60} sx={{ borderRadius: 2 }} />
			</Box>
		);
	}

	if (!nodeStatus || error) {
		return (
			<Box px={1}>
				<Alert severity="warning" sx={{ py: 0.5 }}>
					{!isCollapsed && 'Node offline'}
				</Alert>
			</Box>
		);
	}

	if (isCollapsed) {
		return (
			<Box
				sx={{
					mx: 1,
					p: 1,
					bgcolor: 'success.lighter',
					borderRadius: 2,
					display: 'flex',
					justifyContent: 'center',
				}}
			>
				<StorageIcon sx={{ color: 'success.main', fontSize: 20 }} />
			</Box>
		);
	}

	return (
		<Box
			sx={{
				mx: 1,
				p: 1.5,
				bgcolor: 'background.paper',
				borderRadius: 2,
				border: 1,
				borderColor: 'divider',
			}}
		>
			<Stack spacing={0.5}>
				<Box display="flex" alignItems="center" gap={1}>
					<StorageIcon sx={{ fontSize: 16, color: 'success.main' }} />
					<Typography variant="caption" fontWeight={600} noWrap>
						{nodeStatus.result.node_info.moniker}
					</Typography>
				</Box>
				<Typography variant="caption" color="text.secondary" noWrap>
					Chain: {nodeStatus.result.node_info.network}
				</Typography>
			</Stack>
		</Box>
	);
}
