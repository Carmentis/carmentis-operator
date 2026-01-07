'use client';

import { PropsWithChildren, ReactNode, useState } from 'react';
import { UserAuthenticationContextProvider } from '@/contexts/user-authentication.context';
import { usePathname } from 'next/navigation';
import HomeSideBar from '@/components/sidebar/home-sidebar';
import { Box, Drawer, IconButton, useMediaQuery, useTheme } from '@mui/material';
import { useInterfaceContext } from '@/contexts/interface.context';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';

export default function RootLayout({ children }: PropsWithChildren) {
  const sidebar = <HomeSideBar/>;

  const interfaceStore = useInterfaceContext();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const drawerWidth = interfaceStore.sidebarHidden ? 64 : 240;

  const handleDrawerToggle = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      interfaceStore.toggleSidebar();
    }
  };

  return (
    <UserAuthenticationContextProvider>
      <Box sx={{ display: 'flex', height: '100vh', bgcolor: 'grey.50' }}>
        {/* Mobile menu button */}
        {isMobile && (
          <IconButton
            aria-label="Toggle navigation menu"
            onClick={handleDrawerToggle}
            sx={{
              position: 'fixed',
              top: 16,
              left: 16,
              zIndex: 1300,
              bgcolor: 'background.paper',
              boxShadow: 2,
              '&:hover': {
                bgcolor: 'background.paper',
                boxShadow: 3,
              },
            }}
          >
            <MenuIcon />
          </IconButton>
        )}

        {/* Toggle button for desktop */}
        {!isMobile && (
          <IconButton
            onClick={handleDrawerToggle}
            sx={{
              position: 'fixed',
              top: 16,
              left: drawerWidth - 20,
              zIndex: 1300,
              bgcolor: 'background.paper',
              border: 1,
              borderColor: 'divider',
              width: 32,
              height: 32,
              transition: theme.transitions.create('left', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
              '&:hover': {
                bgcolor: 'action.hover',
              },
            }}
          >
            <ChevronLeftIcon
              sx={{
                transform: interfaceStore.sidebarHidden ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.2s',
              }}
            />
          </IconButton>
        )}

        {/* Sidebar */}
        <Drawer
          variant={isMobile ? 'temporary' : 'permanent'}
          open={isMobile ? mobileOpen : true}
          onClose={isMobile ? handleDrawerToggle : undefined}
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              bgcolor: 'background.default',
              borderRight: 1,
              borderColor: 'divider',
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
            },
          }}
        >
          <Box sx={{ p: 2, height: '100%' }}>{sidebar}</Box>
        </Drawer>

        {/* Main content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 2, sm: 3 },
            width: { sm: `calc(100% - ${drawerWidth}px)` },
            bgcolor: 'background.default',
            overflow: 'auto',
            transition: theme.transitions.create(['margin', 'width'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          }}
        >
          {children}
        </Box>
      </Box>
    </UserAuthenticationContextProvider>
  );
}
