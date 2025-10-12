import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import socketService from '../services/socket';
import { format } from 'date-fns';
import ScreenHeader from '../components/ScreenHeader';
import TaskItem from '../components/TaskItem';
import TaskFilterChips from '../components/TaskFilterChips';
import FullScreenLoader from '../components/FullScreenLoader';
import SkeletonLoader from '../components/SkeletonLoader';
import PullToRefresh from '../components/PullToRefresh';

const TasksPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { token, user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);

  const fetchTasks = useCallback(async (isRefresh = false) => {
    if (!token) return;
    
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    try {
      const data = await api.getTasks(token);
      const tasksList = data.tickets || data.tasks || data;
      setTasks(tasksList);
      setError('');
    } catch (err) {
      setError('Failed to load tasks.');
      console.error('Tasks error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  // Real-time updates
  useEffect(() => {
    const handleTaskUpdate = (updatedTask) => {
      setTasks(prev => prev.map(task => 
        task.id === updatedTask.id ? updatedTask : task
      ));
    };

    const handleTaskStatusChange = (data) => {
      setTasks(prev => prev.map(task => 
        task.id === data.taskId ? { ...task, status: data.status } : task
      ));
    };

    const handleTaskDeleted = (data) => {
      setTasks(prev => prev.filter(task => task.id !== data.taskId));
    };

    socketService.on('taskUpdated', handleTaskUpdate);
    socketService.on('taskStatusChanged', handleTaskStatusChange);
    socketService.on('taskDeleted', handleTaskDeleted);

    return () => {
      socketService.off('taskUpdated', handleTaskUpdate);
      socketService.off('taskStatusChanged', handleTaskStatusChange);
      socketService.off('taskDeleted', handleTaskDeleted);
    };
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleMenuOpen = (event, task) => {
    setAnchorEl(event.currentTarget);
    setSelectedTask(task);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTask(null);
  };

  const handleViewTask = () => {
    if (selectedTask) {
      navigate(`/tasks/${selectedTask.id}`);
    }
    handleMenuClose();
  };

  const handleEditTask = () => {
    if (selectedTask) {
      navigate(`/tasks/${selectedTask.id}?edit=true`);
    }
    handleMenuClose();
  };

  const handleDeleteTask = async () => {
    if (selectedTask) {
      try {
        await api.deleteTask(token, selectedTask.id);
        setTasks(prev => prev.filter(task => task.id !== selectedTask.id));
      } catch (error) {
        console.error('Failed to delete task:', error);
      }
    }
    handleMenuClose();
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'in progress':
        return 'info';
      case 'overdue':
        return 'error';
      default:
        return 'default';
    }
  };

  const handleRefresh = useCallback(async () => {
    await fetchTasks(true);
  }, [fetchTasks]);

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'All' || task.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const TaskCard = ({ task }) => (
    <Card
      sx={{
        mb: 2,
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        backgroundColor: theme.palette.surface,
        border: theme.palette.mode === 'dark' ? `1px solid ${theme.palette.border}` : 'none',
        borderRadius: theme.shape.borderRadius * 2,
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows[4],
        },
      }}
      onClick={() => navigate(`/tasks/${task.id}`)}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h6" component="h3" fontWeight="medium">
            {task.title || 'Untitled Task'}
          </Typography>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleMenuOpen(e, task);
            }}
          >
            <MoreVertIcon />
          </IconButton>
        </Box>

        {task.description && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {task.description.length > 100 
              ? `${task.description.substring(0, 100)}...` 
              : task.description
            }
          </Typography>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Chip
            label={task.status || 'Unknown'}
            color={getStatusColor(task.status)}
            size="small"
            variant="outlined"
            sx={{ borderRadius: theme.shape.borderRadius }}
          />
          
          {task.dueDate && (
            <Typography variant="caption" color="text.secondary">
              Due: {format(new Date(task.dueDate), 'MMM dd, yyyy')}
            </Typography>
          )}
        </Box>

        {task.assignedTo && (
          <Box sx={{ mt: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Assigned to: {task.assignedTo}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box sx={{ 
        backgroundColor: theme.palette.background.default, 
        minHeight: '100vh',
        width: '100%',
      }}>
        <ScreenHeader
          title="Tasks"
          leftIcon={<AssignmentIcon sx={{ fontSize: 28, color: theme.palette.primary.main }} />}
        />
        <SkeletonLoader type="task" count={5} />
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
        title="Tasks"
        leftIcon={<AssignmentIcon sx={{ fontSize: 28, color: theme.palette.primary.main }} />}
      />

      {/* Pull to Refresh Container */}
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

      {/* Search */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search tasks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: theme.shape.borderRadius * 2,
              backgroundColor: theme.palette.surface,
            },
          }}
        />
      </Box>

      {/* Filter Chips */}
      <Box sx={{ mb: 3 }}>
        <TaskFilterChips
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          priorityFilter={priorityFilter}
          setPriorityFilter={setPriorityFilter}
        />
      </Box>

      {/* Tasks List */}
      <Box sx={{ mb: 4 }}>
        {filteredTasks.length > 0 ? (
          <Grid container spacing={{ xs: 2, sm: 3 }}>
            {filteredTasks.map((task) => (
              <Grid item xs={12} sm={6} lg={4} key={task.id}>
                <TaskItem task={task} onPress={(task) => navigate(`/tasks/${task.id}`)} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Card sx={{ 
            p: 4, 
            textAlign: 'center',
            backgroundColor: theme.palette.surface,
            border: theme.palette.mode === 'dark' ? `1px solid ${theme.palette.border}` : 'none',
          }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No tasks found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchTerm || statusFilter !== 'All' || priorityFilter !== 'All'
                ? 'Try adjusting your search or filter criteria.'
                : 'No tasks available.'
              }
            </Typography>
          </Card>
        )}
      </Box>
      </PullToRefresh>

      {/* Floating Action Button - REMOVED */}

      {/* Create Task Dialog - REMOVED */}

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleViewTask}>
          <ListItemIcon>
            <ViewIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleEditTask}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit Task</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDeleteTask} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete Task</ListItemText>
        </MenuItem>
      </Menu>

      {/* Loading Overlay */}
      <FullScreenLoader visible={loading} message="Loading tasks..." />
    </Box>
  );
};

export default TasksPage;