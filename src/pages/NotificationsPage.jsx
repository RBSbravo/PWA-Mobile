import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  Divider,
  Badge,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Assignment as AssignmentIcon,
  Comment as CommentIcon,
  AttachFile as AttachFileIcon,
  Info as InfoIcon,
  Done as DoneIcon,
  Delete as DeleteIcon,
  DoneAll as DoneAllIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import api from '../services/api';
import socketService from '../services/socket';
import ScreenHeader from '../components/ScreenHeader';

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'read', label: 'Read' }
];

const getNotificationIcon = (type, color) => {
  switch (type) {
    case 'task_assigned':
    case 'task_updated':
      return <AssignmentIcon sx={{ color }} />;
    case 'comment_added':
      return <CommentIcon sx={{ color }} />;
    case 'file_uploaded':
      return <AttachFileIcon sx={{ color }} />;
    case 'system':
      return <InfoIcon sx={{ color }} />;
    default:
      return <NotificationsIcon sx={{ color }} />;
  }
};

const getTimeAgo = (timestamp) => {
  if (!timestamp) return '';
  const now = new Date();
  const time = new Date(timestamp);
  const diffInSeconds = Math.floor((now - time) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
};

const NotificationsPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, token } = useAuth();
  const { notifications, fetchNotifications, refreshUnreadCount, loading: notificationsLoading } = useNotification();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('all');

  // Use the context's fetchNotifications instead of local implementation

  // Real-time updates
  useEffect(() => {
    const handleNotificationRemoved = (data) => {
      // Handle notification removal
      // Refresh the notifications list when one is removed
      fetchNotifications();
    };

    // Only listen to notificationRemoved, let NotificationContext handle new notifications
    socketService.on('notificationRemoved', handleNotificationRemoved);

    return () => {
      socketService.off('notificationRemoved', handleNotificationRemoved);
    };
  }, [token]); // Only depend on token, not fetchNotifications

  useEffect(() => {
    const loadNotifications = async () => {
      setLoading(true);
      try {
        await fetchNotifications();
      } catch (error) {
        setError('Failed to load notifications');
        console.error('Load notifications error:', error);
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, [token]); // Only depend on token, not fetchNotifications

  const handleMarkAsRead = async (id) => {
    try {
      await api.markNotificationAsRead(id, token);
      // Refresh notifications to get updated state
      await fetchNotifications();
    } catch (error) {
      setError('Failed to update notification.');
      console.error('Mark as read error:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.markAllNotificationsAsRead(token);
      // Refresh notifications to get updated state
      await fetchNotifications();
    } catch (error) {
      setError('Failed to update notifications.');
      console.error('Mark all as read error:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.deleteNotification(id, token);
      // Refresh notifications to get updated state
      await fetchNotifications();
    } catch (error) {
      setError('Failed to delete notification.');
      console.error('Delete notification error:', error);
    }
  };

  const handleNotificationPress = async (item) => {
    try {
      if (!item.isRead) {
        await api.markNotificationAsRead(item.id, token);
        // Refresh notifications to get updated state
        await fetchNotifications();
      }
      
      // Navigate based on notification type
      if (item.taskId || item.task_id) {
        navigate(`/tasks/${item.taskId || item.task_id}`);
      } else if (item.ticketId || item.ticket_id) {
        navigate(`/tasks/${item.ticketId || item.ticket_id}`);
      }
    } catch (error) {
      setError('Failed to update notification.');
      console.error('Notification press error:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const readCount = notifications.filter(n => n.isRead).length;
  const totalCount = notifications.length;

  const filteredNotifications = notifications.filter(n => {
    if (tab === 'all') return true;
    if (tab === 'unread') return !n.isRead;
    if (tab === 'read') return n.isRead;
    return true;
  });

  const NotificationItem = ({ item }) => {
    const isRead = item.isRead;
    
    // Handle empty or missing notification data
    let notificationTitle = item.title || '';
    let notificationMessage = item.message || '';
    
    if (notificationTitle && notificationMessage) {
      // Both exist, use them as is
    } else if (notificationTitle && !notificationMessage) {
      // Only title exists, use it for both
      notificationMessage = notificationTitle;
    } else if (!notificationTitle && notificationMessage) {
      // Only message exists, use it for both
      notificationTitle = notificationMessage;
    } else {
      // Neither exists, use fallback
      notificationTitle = 'New notification';
      notificationMessage = 'You have a new notification';
    }

    const notificationTime = getTimeAgo(item.date || item.createdAt);

    return (
      <Card
        sx={{
          mb: 1,
          cursor: 'pointer',
          backgroundColor: isRead ? theme.palette.surface : theme.palette.primaryContainer,
          border: theme.palette.mode === 'dark' ? `1px solid ${theme.palette.border}` : 'none',
          borderRadius: theme.shape.borderRadius * 2,
          '&:hover': {
            boxShadow: theme.shadows[2],
          },
        }}
        onClick={() => handleNotificationPress(item)}
      >
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
            <Box sx={{ mt: 0.5 }}>
              {getNotificationIcon(item.type, isRead ? theme.palette.text.secondary : theme.palette.primary.main)}
            </Box>
            
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="body1"
                fontWeight={isRead ? 'normal' : 'bold'}
                sx={{ mb: 0.5 }}
              >
                {notificationTitle}
              </Typography>
              
              {notificationTitle !== notificationMessage && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  {notificationMessage}
                </Typography>
              )}
              
              <Typography variant="caption" color="text.secondary">
                {notificationTime}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              {!isRead && (
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMarkAsRead(item.id);
                  }}
                  sx={{ color: theme.palette.primary.main }}
                >
                  <DoneIcon fontSize="small" />
                </IconButton>
              )}
              
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(item.id);
                }}
                sx={{ color: theme.palette.error.main }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      backgroundColor: theme.palette.background.default, 
      minHeight: '100vh',
      width: '100%',
    }}>
      {/* Header */}
      <ScreenHeader
        title="Notifications"
        leftIcon={<NotificationsIcon sx={{ fontSize: 28, color: theme.palette.primary.main }} />}
        rightAction={
          <Button
            variant="text"
            startIcon={<DoneAllIcon />}
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0}
            sx={{
              textTransform: 'none',
              fontWeight: 500,
              color: theme.palette.primary.main,
            }}
          >
            {isMobile ? '' : 'Mark All Read'}
          </Button>
        }
      />

      {/* Content Container */}
      <Box sx={{ 
        width: '100%',
        px: { xs: 2, sm: 3, md: 4, lg: 6 },
        py: { xs: 2, sm: 3 },
      }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Tabs */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
          {TABS.map(t => {
            let count = 0;
            if (t.key === 'all') count = totalCount;
            else if (t.key === 'unread') count = unreadCount;
            else if (t.key === 'read') count = readCount;
            
            return (
              <Chip
                key={t.key}
                label={`${t.label} ${count > 0 ? `(${count})` : ''}`}
                onClick={() => setTab(t.key)}
                variant={tab === t.key ? 'filled' : 'outlined'}
                color={tab === t.key ? 'primary' : 'default'}
                sx={{
                  borderRadius: theme.shape.borderRadius * 2,
                  fontWeight: tab === t.key ? 600 : 500,
                }}
              />
            );
          })}
        </Box>
      </Box>

      {/* Notifications List */}
      <Box sx={{ mb: 4 }}>
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification) => (
            <NotificationItem key={notification.id} item={notification} />
          ))
        ) : (
          <Card sx={{ 
            p: 4, 
            textAlign: 'center',
            backgroundColor: theme.palette.surface,
            border: theme.palette.mode === 'dark' ? `1px solid ${theme.palette.border}` : 'none',
          }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No notifications found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {tab === 'unread' 
                ? 'You have no unread notifications.'
                : tab === 'read'
                ? 'You have no read notifications.'
                : 'You have no notifications yet.'
              }
            </Typography>
          </Card>
        )}
      </Box>
      </Box>
    </Box>
  );
};

export default NotificationsPage;