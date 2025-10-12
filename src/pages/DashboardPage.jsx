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
  Divider,
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
import ScreenHeader from '../components/ScreenHeader';
import SkeletonLoader from '../components/SkeletonLoader';
import PullToRefresh from '../components/PullToRefresh';

const DashboardPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, token } = useAuth();
  const { notifications } = useNotification();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({
    pendingTasks: 0,
    overdueTasks: 0,
    totalTasks: 0,
    completedTasks: 0,
  });

  const fetchDashboardData = useCallback(async (isRefresh = false) => {
    if (!token) return;
    
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    try {
      const [tasksData, notificationsData] = await Promise.all([
        api.getTasks(token),
        api.getNotifications(token)
      ]);
      
      const tasksList = Array.isArray(tasksData) ? tasksData : (tasksData.tickets || tasksData.tasks || []);
      setTasks(tasksList);
      
      // Calculate stats with safety checks
      const pendingTasks = tasksList.filter(t => t && t.status && t.status.toLowerCase() === 'pending').length;
      const overdueTasks = tasksList.filter(t => {
        if (!t || (!t.dueDate && !t.due_date)) return false;
        const due = new Date(t.dueDate || t.due_date);
        return t.status && t.status.toLowerCase() !== 'completed' && due < new Date();
      }).length;
      const completedTasks = tasksList.filter(t => t && t.status && t.status.toLowerCase() === 'completed').length;
      
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
      setRefreshing(false);
    }
  }, [token]);

  // Real-time updates
  useEffect(() => {
    const handleTaskUpdate = (updatedTask) => {
      if (!updatedTask || !updatedTask.id) return;
      setTasks(prev => prev.map(task => 
        task.id === updatedTask.id ? updatedTask : task
      ));
      fetchDashboardData(); // Refresh stats
    };

    const handleTaskStatusChange = (data) => {
      if (!data || !data.taskId) return;
      setTasks(prev => prev.map(task => 
        task.id === data.taskId ? { ...task, status: data.status } : task
      ));
      fetchDashboardData(); // Refresh stats
    };

    const handleTaskDeleted = (data) => {
      if (!data || !data.taskId) return;
      setTasks(prev => prev.filter(task => task.id !== data.taskId));
      fetchDashboardData(); // Refresh stats
    };

    // Set up socket listeners
    socketService.on('taskUpdated', handleTaskUpdate);
    socketService.on('taskStatusChanged', handleTaskStatusChange);
    socketService.on('taskDeleted', handleTaskDeleted);

    return () => {
      socketService.off('taskUpdated', handleTaskUpdate);
      socketService.off('taskStatusChanged', handleTaskStatusChange);
      socketService.off('taskDeleted', handleTaskDeleted);
    };
  }, [fetchDashboardData]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const StatCard = ({ icon, label, value, color = 'primary' }) => (
    <Card
      sx={{
        height: '100%',
        backgroundColor: theme.palette.surface,
        border: theme.palette.mode === 'dark' ? `1px solid ${theme.palette.border}` : 'none',
        borderRadius: theme.shape.borderRadius * 2,
        boxShadow: theme.shadows[2],
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
            {notifications.slice(0, 1).map((notification, index) => {
              if (!notification) return null;
              return (
                <Box
                  key={notification.id || index}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    p: 2,
                    mb: 1,
                    borderRadius: 2,
                    backgroundColor: theme.palette.background.paper,
                    border: theme.palette.mode === 'dark' ? `1px solid ${theme.palette.border}` : 'none',
                  }}
                >
                  <NotificationsIcon
                    color="primary"
                    sx={{ mr: 2, fontSize: 28 }}
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
                </Box>
              );
            })}
          </Box>
        ) : (
          <Box
            sx={{
              textAlign: 'center',
              py: 4,
              color: 'text.secondary',
            }}
          >
            <Typography variant="body2">
              No recent activity.
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  const handleRefresh = useCallback(async () => {
    await fetchDashboardData(true);
  }, [fetchDashboardData]);

  if (loading) {
    return (
      <>
        <ScreenHeader
          title={`Welcome, ${user?.firstname || user?.firstName || 'User'}!`}
          subtitle="Here's a look at your day."
          leftIcon={
            <Avatar
              sx={{
                bgcolor: theme.palette.primary.main,
                width: 40,
                height: 40,
                fontSize: 20,
                fontWeight: 'bold',
              }}
            >
              {(user?.firstname || user?.firstName) ? (user?.firstname || user?.firstName).charAt(0).toUpperCase() : 'U'}
            </Avatar>
          }
        />
        <Box sx={{ 
          backgroundColor: theme.palette.background.default, 
          minHeight: '100vh',
          width: '100%',
        }}>
          <SkeletonLoader type="dashboard" />
        </Box>
      </>
    );
  }

  return (
    <>
      {/* Header */}
      <ScreenHeader
        title={`Welcome, ${user?.firstname || 'User'}!`}
        subtitle="Here's a look at your day."
        leftIcon={
          <Avatar
            sx={{
              bgcolor: theme.palette.primary.main,
              width: 40,
              height: 40,
              fontSize: 20,
              fontWeight: 'bold',
            }}
          >
            {user?.firstname ? user.firstname.charAt(0).toUpperCase() : 'U'}
          </Avatar>
        }
      />

      {/* Pull to Refresh Container */}
      <Box sx={{ 
        backgroundColor: theme.palette.background.default, 
        minHeight: '100vh',
        width: '100%',
        pt: '80px', // Add top padding for fixed header
      }}>
        <PullToRefresh onRefresh={handleRefresh}>
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

        {/* Stats Container */}
        <Box sx={{ 
          backgroundColor: theme.palette.primary.main + '10',
          borderRadius: theme.shape.borderRadius * 2,
          p: { xs: 2, sm: 3, md: 4 },
          mb: 4,
          boxShadow: theme.shadows[1],
        }}>
          <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
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
        </Box>

        <Divider sx={{ mb: 4 }} />

        {/* Recent Activity */}
        <Box sx={{ mb: 4 }}>
          <RecentActivityCard />
        </Box>
        </Box>
        </PullToRefresh>
      </Box>
    </>
  );
};

export default DashboardPage;
