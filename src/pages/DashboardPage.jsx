import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Chip,
  Avatar,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  Error as ErrorIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import api from '../services/api';
import socketService from '../services/socket';

const DashboardPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, token } = useAuth();
  const { notifications, addRealtimeNotification } = useNotification();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({
    pendingTasks: 0,
    overdueTasks: 0,
    totalTasks: 0,
    completedTasks: 0,
  });

  const fetchDashboardData = useCallback(async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      const [tasksData, notificationsData] = await Promise.all([
        api.getTasks(token),
        api.getNotifications(token)
      ]);
      
      const tasksList = tasksData.tickets || tasksData.tasks || tasksData;
      setTasks(tasksList);
      
      // Calculate stats
      const pendingTasks = tasksList.filter(t => t.status && t.status.toLowerCase() === 'pending').length;
      const overdueTasks = tasksList.filter(t => {
        if (!t.dueDate && !t.due_date) return false;
        const due = new Date(t.dueDate || t.due_date);
        return t.status && t.status.toLowerCase() !== 'completed' && due < new Date();
      }).length;
      const completedTasks = tasksList.filter(t => t.status && t.status.toLowerCase() === 'completed').length;
      
      setStats({
        pendingTasks,
        overdueTasks,
        totalTasks: tasksList.length,
        completedTasks,
      });
      
    } catch (err) {
      setError('Failed to load dashboard data.');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Real-time updates
  useEffect(() => {
    const handleTaskUpdate = (updatedTask) => {
      setTasks(prev => prev.map(task => 
        task.id === updatedTask.id ? updatedTask : task
      ));
      fetchDashboardData(); // Refresh stats
    };

    const handleTaskStatusChange = (data) => {
      setTasks(prev => prev.map(task => 
        task.id === data.taskId ? { ...task, status: data.status } : task
      ));
      fetchDashboardData(); // Refresh stats
    };

    const handleTaskDeleted = (data) => {
      setTasks(prev => prev.filter(task => task.id !== data.taskId));
      fetchDashboardData(); // Refresh stats
    };

    const handleNotification = (notification) => {
      addRealtimeNotification(notification);
    };

    // Set up socket listeners
    socketService.on('taskUpdated', handleTaskUpdate);
    socketService.on('taskStatusChanged', handleTaskStatusChange);
    socketService.on('taskDeleted', handleTaskDeleted);
    socketService.on('notification', handleNotification);

    return () => {
      socketService.off('taskUpdated', handleTaskUpdate);
      socketService.off('taskStatusChanged', handleTaskStatusChange);
      socketService.off('taskDeleted', handleTaskDeleted);
      socketService.off('notification', handleNotification);
    };
  }, [addRealtimeNotification, fetchDashboardData]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const StatCard = ({ icon, label, value, color = 'primary' }) => (
    <Card
      sx={{
        height: '100%',
        background: `linear-gradient(135deg, ${theme.palette[color].main}20 0%, ${theme.palette[color].main}10 100%)`,
        border: `1px solid ${theme.palette[color].main}30`,
      }}
    >
      <CardContent sx={{ textAlign: 'center', p: 3 }}>
        <Avatar
          sx={{
            bgcolor: theme.palette[color].main,
            width: 60,
            height: 60,
            mx: 'auto',
            mb: 2,
          }}
        >
          {icon}
        </Avatar>
        <Typography variant="h4" component="div" fontWeight="bold" color={theme.palette[color].main}>
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {label}
        </Typography>
      </CardContent>
    </Card>
  );

  const RecentActivityCard = () => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom fontWeight="bold">
          Recent Activity
        </Typography>
        {notifications.length > 0 ? (
          <Box>
            {notifications.slice(0, 3).map((notification, index) => (
              <Box
                key={notification.id || index}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  p: 2,
                  mb: 1,
                  borderRadius: 2,
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                }}
              >
                <NotificationsIcon
                  color="primary"
                  sx={{ mr: 2, fontSize: 24 }}
                />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" fontWeight="medium">
                    {notification.message || notification.title || 'You have a new notification.'}
                  </Typography>
                  {notification.timestamp && (
                    <Typography variant="caption" color="text.secondary">
                      {new Date(notification.timestamp).toLocaleString()}
                    </Typography>
                  )}
                </Box>
                {!notification.isRead && (
                  <Chip
                    label="New"
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                )}
              </Box>
            ))}
          </Box>
        ) : (
          <Box
            sx={{
              textAlign: 'center',
              py: 4,
              color: 'text.secondary',
            }}
          >
            <NotificationsIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
            <Typography variant="body2">
              No recent activity
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );

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
    <Box>
      {/* Welcome Header */}
      <Box mb={4}>
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
          Welcome back, {user?.firstname || 'User'}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's a look at your day.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Stats Grid */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<AssignmentIcon />}
            label="Open Tasks"
            value={stats.pendingTasks}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<ErrorIcon />}
            label="Overdue"
            value={stats.overdueTasks}
            color="error"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<AssignmentIcon />}
            label="Completed"
            value={stats.completedTasks}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<AssignmentIcon />}
            label="Total Tasks"
            value={stats.totalTasks}
            color="info"
          />
        </Grid>
      </Grid>

      {/* Recent Activity */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <RecentActivityCard />
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  • View all tasks
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Check notifications
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Update profile
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
