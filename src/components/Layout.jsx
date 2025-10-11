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
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Typography,
  AppBar,
  Toolbar,
} from '@mui/material';
import {
  Home as HomeIcon,
  Assignment as TasksIcon,
  Notifications as NotificationsIcon,
  Person as ProfileIcon,
  Menu as MenuIcon,
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
  const [mobileOpen, setMobileOpen] = useState(false);

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

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawerContent = (
    <Box sx={{ width: 250, pt: 2 }}>
      <Box sx={{ px: 2, pb: 2 }}>
        <Typography variant="h6" color="primary" fontWeight="bold">
          MITO Task Manager
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Welcome, {user?.firstname || 'User'}!
        </Typography>
      </Box>
      <List>
        {navigationItems.map((item, index) => (
          <ListItem
            key={item.label}
            button
            onClick={() => {
              navigate(item.path);
              setMobileOpen(false);
            }}
            selected={currentTab === index}
            sx={{
              '&.Mui-selected': {
                backgroundColor: theme.palette.primary.main + '20',
                '& .MuiListItemIcon-root': {
                  color: theme.palette.primary.main,
                },
                '& .MuiListItemText-primary': {
                  color: theme.palette.primary.main,
                  fontWeight: 500,
                },
              },
            }}
          >
            <ListItemIcon>
              {item.badge ? (
                <Badge badgeContent={item.badge} color="error">
                  {item.icon}
                </Badge>
              ) : (
                item.icon
              )}
            </ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
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
        }}
        elevation={8}
      >
          <BottomNavigation
            value={currentTab}
            onChange={handleTabChange}
            showLabels
            sx={{
              backgroundColor: theme.palette.surface,
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

      {/* Bottom padding for bottom navigation */}
      <Box sx={{ height: '80px' }} />
    </Box>
  );
};

export default Layout;
