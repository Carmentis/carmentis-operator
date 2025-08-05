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
      <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#f8f9fa' }}>
        {/* Mobile menu button */}
        {isMobile && (
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ 
              position: 'fixed', 
              top: 10, 
              left: 10, 
              zIndex: 1200,
              bgcolor: 'white',
              boxShadow: 1,
              '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' }
            }}
          >
            <MenuIcon />
          </IconButton>
        )}

        {/* Sidebar */}
        <Drawer
          variant={isMobile ? "temporary" : "permanent"}
          open={isMobile ? mobileOpen : true}
          onClose={isMobile ? handleDrawerToggle : undefined}
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              bgcolor: '#f0f2f5',
              borderRight: 'none',
              boxShadow: '0 0 10px rgba(0,0,0,0.05)',
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
            },
          }}
        >
          <Box sx={{ p: 2, }} className={"h-full"}>
            {sidebar}
          </Box>
        </Drawer>

        {/* Main content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: { sm: `calc(100% - ${drawerWidth}px)` },
            //ml: { sm: `${drawerWidth}px` },
            bgcolor: 'white',
            //borderRadius: '12px',
            //boxShadow: '0 0 20px rgba(0,0,0,0.03)',
            //m: 2,
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
