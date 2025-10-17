import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  Badge,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Home as HomeIcon,
  Assignment as TasksIcon,
  Notifications as NotificationsIcon,
  Person as ProfileIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const Layout = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { unreadCount } = useNotification();

  // Detect if running in iOS PWA standalone mode
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detect iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Detect standalone mode
    const standalone = window.matchMedia('(display-mode: standalone)').matches ||
                      window.navigator.standalone === true ||
                      document.referrer.includes('android-app://');
    setIsStandalone(standalone);

    // Listen for display mode changes
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleChange = (e) => setIsStandalone(e.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Navigation items
  const navigationItems = [
    { label: 'Home', icon: <HomeIcon />, path: '/dashboard' },
    { label: 'Tasks', icon: <TasksIcon />, path: '/tasks' },
    { 
      label: 'Notifications', 
      icon: <NotificationsIcon />, 
      path: '/notifications',
      badge: unreadCount > 0 ? unreadCount : null
    },
    { label: 'Profile', icon: <ProfileIcon />, path: '/profile' },
  ];

  // Get current tab index
  const getCurrentTabIndex = () => {
    const currentPath = location.pathname;
    const index = navigationItems.findIndex(item => 
      currentPath === item.path || currentPath.startsWith(item.path + '/')
    );
    return index >= 0 ? index : 0;
  };

  const [currentTab, setCurrentTab] = useState(getCurrentTabIndex());

  // Update current tab when route changes
  useEffect(() => {
    setCurrentTab(getCurrentTabIndex());
  }, [location.pathname]);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
    navigate(navigationItems[newValue].path);
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      minHeight: '-webkit-fill-available',
      // iOS PWA standalone mode specific height handling
      ...(isIOS && isStandalone && {
        height: '100vh',
        height: '-webkit-fill-available',
        overflow: 'hidden',
      }),
      // Ensure no white background shows
      backgroundColor: theme.palette.background.default,
      // Handle iOS safe area properly - only apply if safe area exists
      paddingTop: 'env(safe-area-inset-top, 0px)',
      paddingLeft: 'env(safe-area-inset-left, 0px)',
      paddingRight: 'env(safe-area-inset-right, 0px)',
      // Prevent any gaps - no bottom padding
      margin: 0,
      paddingBottom: 0,
      // Ensure background covers entire viewport
      backgroundAttachment: 'fixed',
    }}>
      {/* Mobile App Bar - REMOVED */}

      {/* Mobile Drawer - REMOVED */}

      {/* Desktop Top Navigation Bar - REMOVED */}

      {/* Main Content - Full Width */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: '100%',
          minHeight: '100vh',
          // iOS PWA standalone mode specific height handling
          ...(isIOS && isStandalone && {
            height: 'calc(100vh - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px) - 80px)',
            height: 'calc(-webkit-fill-available - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px) - 80px)',
            overflow: 'auto',
            '-webkit-overflow-scrolling': 'touch',
          }),
        }}
      >
        {children}
      </Box>

      {/* Bottom Navigation - All Screen Sizes */}
      <Paper
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: theme.zIndex.appBar,
          backgroundColor: theme.palette.surface,
          borderTop: `1px solid ${theme.palette.border}`,
          // Ensure proper height calculation - no padding on the Paper itself
          minHeight: '80px',
        }}
        elevation={8}
      >
          <BottomNavigation
            value={currentTab}
            onChange={handleTabChange}
            showLabels
            sx={{
              backgroundColor: theme.palette.surface,
              // Add safe area padding to the BottomNavigation component instead
              paddingBottom: 'env(safe-area-inset-bottom, 0px)',
              minHeight: '80px',
              // Add safe area height to minHeight only if it exists
              '@supports (padding: max(0px))': {
                minHeight: 'calc(80px + env(safe-area-inset-bottom, 0px))',
              },
              // iOS PWA standalone mode specific styling
              ...(isIOS && isStandalone && {
                paddingBottom: 'env(safe-area-inset-bottom, 0px)',
                minHeight: 'calc(80px + env(safe-area-inset-bottom, 0px))',
              }),
              '& .MuiBottomNavigationAction-root': {
                minWidth: 'auto',
                padding: '8px 0 12px',
                color: theme.palette.text.secondary,
                '&.Mui-selected': {
                  color: theme.palette.primary.main,
                },
              },
              '& .MuiBottomNavigationAction-label': {
                fontSize: '0.75rem',
                marginTop: '4px',
                fontWeight: 500,
                '&.Mui-selected': {
                  fontWeight: 600,
                },
              },
            }}
          >
            {navigationItems.map((item, index) => (
              <BottomNavigationAction
                key={item.label}
                label={item.label}
                icon={
                  item.badge ? (
                    <Badge 
                      badgeContent={item.badge} 
                      color="error"
                      sx={{
                        '& .MuiBadge-badge': {
                          fontSize: '0.7rem',
                          height: '18px',
                          minWidth: '18px',
                        },
                      }}
                    >
                      {item.icon}
                    </Badge>
                  ) : (
                    item.icon
                  )
                }
              />
            ))}
          </BottomNavigation>
        </Paper>

      {/* Bottom padding for bottom navigation with iOS safe area support */}
      <Box sx={{ 
        height: '80px',
        minHeight: '80px',
        // Add safe area height only if it exists
        '@supports (padding: max(0px))': {
          height: 'calc(80px + env(safe-area-inset-bottom, 0px))',
          minHeight: 'calc(80px + env(safe-area-inset-bottom, 0px))',
        },
        // iOS PWA standalone mode specific height handling
        ...(isIOS && isStandalone && {
          height: 'calc(80px + env(safe-area-inset-bottom, 0px))',
          minHeight: 'calc(80px + env(safe-area-inset-bottom, 0px))',
        }),
      }} />
    </Box>
  );
};

export default Layout;
