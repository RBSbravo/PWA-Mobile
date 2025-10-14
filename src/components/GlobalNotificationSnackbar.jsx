import React, { useState, useEffect } from 'react';
import { Snackbar, Alert, IconButton, Box } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useNotification } from '../context/NotificationContext';
import { useThemeContext } from '../context/ThemeContext';

const GlobalNotificationSnackbar = () => {
  const { notifications } = useNotification();
  const { theme } = useThemeContext();
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [shownNotificationIds, setShownNotificationIds] = useState(new Set());

  useEffect(() => {
    if (notifications && notifications.length > 0) {
      // Only show snackbar for unread notifications that haven't been shown yet
      const unreadNotifications = notifications.filter(notif => 
        !notif.isRead && !shownNotificationIds.has(notif.id)
      );
      
      if (unreadNotifications.length > 0) {
        const latest = unreadNotifications[0];
        setMessage(latest.message || latest.title || 'You have a new notification');
        setVisible(true);
        
        // Mark this notification as shown
        setShownNotificationIds(prev => new Set([...prev, latest.id]));
      }
    }
  }, [notifications]); // Remove shownNotificationIds from dependencies to prevent infinite loop

  // Clean up shown notification IDs periodically to prevent memory leaks
  useEffect(() => {
    const cleanup = setInterval(() => {
      setShownNotificationIds(prev => {
        const currentNotificationIds = new Set(notifications.map(n => n.id));
        return new Set([...prev].filter(id => currentNotificationIds.has(id)));
      });
    }, 60000); // Clean up every minute

    return () => clearInterval(cleanup);
  }, [notifications]);

  const handleClose = () => {
    setVisible(false);
  };

  return (
    <Snackbar
      open={visible}
      autoHideDuration={4000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      sx={{ mt: 8 }}
    >
      <Alert
        severity="info"
        action={
          <IconButton
            size="small"
            aria-label="close"
            color="inherit"
            onClick={handleClose}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        }
        sx={{
          backgroundColor: theme.palette.primary.main,
          color: 'white',
          '& .MuiAlert-icon': {
            color: 'white',
          },
          '& .MuiAlert-action': {
            color: 'white',
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ flex: 1 }}>
            {message}
          </Box>
        </Box>
      </Alert>
    </Snackbar>
  );
};

export default GlobalNotificationSnackbar;
