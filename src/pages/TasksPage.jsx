import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
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
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import socketService from '../services/socket';
import { format } from 'date-fns';

const TasksPage = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);

  const fetchTasks = useCallback(async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      const data = await api.getTasks(token);
      const tasksList = data.tickets || data.tasks || data;
      setTasks(tasksList);
    } catch (err) {
      setError('Failed to load tasks.');
      console.error('Tasks error:', err);
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

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || task.status?.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const TaskCard = ({ task }) => (
    <Card
      sx={{
        mb: 2,
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 3,
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
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Tasks
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/tasks/new')}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
            },
          }}
        >
          New Task
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Search and Filter */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
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
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FilterIcon />
                  </InputAdornment>
                ),
              }}
            >
              <MenuItem value="all">All Tasks</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="in progress">In Progress</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="overdue">Overdue</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Box>

      {/* Tasks List */}
      {filteredTasks.length > 0 ? (
        <Box>
          {filteredTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </Box>
      ) : (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No tasks found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'Create your first task to get started.'
              }
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Task Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
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
        <MenuItem onClick={handleDeleteTask}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete Task</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default TasksPage;
