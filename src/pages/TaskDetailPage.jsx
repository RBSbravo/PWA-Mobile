import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Avatar,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  useTheme,
  useMediaQuery,
  Menu,
  MenuItem,
  ListItemIcon,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  MoreVert as MoreVertIcon,
  Assignment as AssignmentIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  Comment as CommentIcon,
  AttachFile as AttachFileIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import api from '../services/api';
import socketService from '../services/socket';
import { format } from 'date-fns';
import ScreenHeader from '../components/ScreenHeader';
import FileAttachment from '../components/FileAttachment';

const TaskDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, token } = useAuth();
  const { addRealtimeNotification } = useNotification();

  const [task, setTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    status: '',
    priority: '',
  });
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [deleteFileId, setDeleteFileId] = useState(null);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);

  const fetchTaskDetails = useCallback(async () => {
    if (!token || !id) return;
    
    try {
      setLoading(true);
      const [taskData, commentsData] = await Promise.all([
        api.getTask(id, token),
        api.getTaskComments(token, id)
      ]);
      
      setTask(taskData);
      setComments(commentsData || []);
      
      // Set attachments if available
      if (taskData.attachments) {
        setAttachedFiles(taskData.attachments);
      }
      
      // Initialize edit form
      setEditForm({
        title: taskData.title || '',
        description: taskData.description || '',
        status: taskData.status || 'pending',
        priority: taskData.priority || 'medium',
      });
    } catch (err) {
      setError('Failed to load task details');
      console.error('Task detail error:', err);
    } finally {
      setLoading(false);
    }
  }, [id, token]);

  // Real-time updates
  useEffect(() => {
    const handleTaskUpdate = (updatedTask) => {
      if (updatedTask.id === parseInt(id)) {
        setTask(prev => ({ ...prev, ...updatedTask }));
        setEditForm(prev => ({
          ...prev,
          title: updatedTask.title || prev.title,
          description: updatedTask.description || prev.description,
          status: updatedTask.status || prev.status,
          priority: updatedTask.priority || prev.priority,
        }));
      }
    };

    const handleNewComment = (comment) => {
      if (comment.taskId === parseInt(id)) {
        setComments(prev => [comment, ...prev]);
      }
    };

    const handleCommentDeleted = (data) => {
      if (data.taskId === parseInt(id)) {
        setComments(prev => prev.filter(c => c.id !== data.commentId));
      }
    };

    // Set up socket listeners
    socketService.on('taskUpdated', handleTaskUpdate);
    socketService.on('commentAdded', handleNewComment);
    socketService.on('commentDeleted', handleCommentDeleted);

    return () => {
      socketService.off('taskUpdated', handleTaskUpdate);
      socketService.off('commentAdded', handleNewComment);
      socketService.off('commentDeleted', handleCommentDeleted);
    };
  }, [id]);

  useEffect(() => {
    fetchTaskDetails();
  }, [fetchTaskDetails]);

  const handleEdit = () => {
    setEditMode(true);
    setMenuAnchor(null);
  };

  const handleSave = async () => {
    try {
      await api.updateTask(token, id, editForm);
      setTask(prev => ({ ...prev, ...editForm }));
      setEditMode(false);
      addRealtimeNotification({
        title: 'Task Updated',
        message: `Task "${editForm.title}" has been updated`,
        type: 'task_updated',
        taskId: parseInt(id),
      });
    } catch (err) {
      setError('Failed to update task');
      console.error('Update error:', err);
    }
  };

  const handleCancel = () => {
    setEditForm({
      title: task.title || '',
      description: task.description || '',
      status: task.status || 'pending',
      priority: task.priority || 'medium',
    });
    setEditMode(false);
  };

  const handleDelete = async () => {
    try {
      await api.deleteTask(token, id);
      navigate('/tasks');
      addRealtimeNotification({
        title: 'Task Deleted',
        message: `Task "${task.title}" has been deleted`,
        type: 'task_deleted',
        taskId: parseInt(id),
      });
    } catch (err) {
      setError('Failed to delete task');
      console.error('Delete error:', err);
    }
    setMenuAnchor(null);
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    
    try {
      setSubmittingComment(true);
      const comment = await api.addTaskComment(token, id, newComment);
      setComments(prev => [comment, ...prev]);
      setNewComment('');
      
      addRealtimeNotification({
        title: 'New Comment',
        message: `New comment added to task "${task.title}"`,
        type: 'comment_added',
        taskId: parseInt(id),
      });
    } catch (err) {
      setError('Failed to add comment');
      console.error('Comment error:', err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleFileUpload = async (file) => {
    try {
      setUploadingFile(true);
      await api.uploadTaskAttachment(id, file, token);
      
      // Refresh task details to get updated attachments
      await fetchTaskDetails();
      
      addRealtimeNotification({
        title: 'File Uploaded',
        message: `File "${file.name}" uploaded to task "${task.title}"`,
        type: 'file_uploaded',
        taskId: parseInt(id),
      });
    } catch (err) {
      setError('Failed to upload file');
      console.error('File upload error:', err);
    } finally {
      setUploadingFile(false);
    }
  };

  const handleFileDelete = async () => {
    if (!deleteFileId) return;
    
    try {
      await api.deleteTaskAttachment(deleteFileId, token);
      
      // Refresh task details to get updated attachments
      await fetchTaskDetails();
      
      addRealtimeNotification({
        title: 'File Deleted',
        message: `File deleted from task "${task.title}"`,
        type: 'file_deleted',
        taskId: parseInt(id),
      });
    } catch (err) {
      setError('Failed to delete file');
      console.error('File delete error:', err);
    } finally {
      setDeleteDialogVisible(false);
      setDeleteFileId(null);
    }
  };

  const handleFileClick = (file) => {
    // Open file in new tab or download
    const fileUrl = file.url || `${process.env.REACT_APP_BACKEND_API_URL || 'https://backend-ticketing-system.up.railway.app'}/api/files/${file.id}/download`;
    window.open(fileUrl, '_blank');
  };

  const getStatusColor = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'in progress':
      case 'in_progress':
        return theme.palette.primary.main;
      case 'completed':
        return theme.palette.success.main;
      case 'pending':
        return theme.palette.warning.main;
      case 'declined':
        return theme.palette.error.main;
      default:
        return theme.palette.text.secondary;
    }
  };

  const getPriorityColor = (priority) => {
    switch ((priority || '').toLowerCase()) {
      case 'high':
        return theme.palette.error.main;
      case 'medium':
        return theme.palette.warning.main;
      case 'low':
        return theme.palette.success.main;
      default:
        return theme.palette.text.secondary;
    }
  };

  const canEdit = user && task && (
    user.id === task.assignedToId ||
    user.id === task.assigned_to_id ||
    (task.assignedUser && user.id === task.assignedUser.id)
  );

  if (loading) {
    return (
      <Box sx={{ 
        backgroundColor: theme.palette.background.default, 
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ 
        backgroundColor: theme.palette.background.default, 
        minHeight: '100vh',
        width: '100%',
      }}>
        <ScreenHeader
          title="Task Details"
          leftIcon={<ArrowBackIcon sx={{ fontSize: 28, color: theme.palette.primary.main }} />}
          onLeftIconPress={() => navigate('/tasks')}
        />
        <Box sx={{ p: 3 }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      </Box>
    );
  }

  if (!task) {
    return (
      <Box sx={{ 
        backgroundColor: theme.palette.background.default, 
        minHeight: '100vh',
        width: '100%',
      }}>
        <ScreenHeader
          title="Task Details"
          leftIcon={<ArrowBackIcon sx={{ fontSize: 28, color: theme.palette.primary.main }} />}
          onLeftIconPress={() => navigate('/tasks')}
        />
        <Box sx={{ p: 3 }}>
          <Alert severity="info">Task not found</Alert>
        </Box>
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
        title="Task Details"
        leftIcon={<ArrowBackIcon sx={{ fontSize: 28, color: theme.palette.primary.main }} />}
        onLeftIconPress={() => navigate('/tasks')}
        rightIcon={canEdit ? (
          <IconButton onClick={(e) => setMenuAnchor(e.currentTarget)}>
            <MoreVertIcon />
          </IconButton>
        ) : null}
      />

      {/* Content */}
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

        {/* Task Details Card */}
        <Card sx={{ 
          mb: 3,
          backgroundColor: theme.palette.surface,
          border: theme.palette.mode === 'dark' ? `1px solid ${theme.palette.border}` : 'none',
        }}>
          <CardContent>
            {/* Title */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <AssignmentIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
              {editMode ? (
                <TextField
                  fullWidth
                  value={editForm.title}
                  onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                  variant="outlined"
                  size="small"
                />
              ) : (
                <Typography variant="h5" fontWeight="bold" sx={{ flex: 1 }}>
                  {task.title}
                </Typography>
              )}
            </Box>

            {/* Status and Priority */}
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Chip
                label={editMode ? (
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value }))}
                    style={{ border: 'none', background: 'transparent' }}
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="declined">Declined</option>
                  </select>
                ) : (task.status || 'Unknown')}
                sx={{
                  backgroundColor: getStatusColor(editMode ? editForm.status : task.status),
                  color: '#fff',
                  fontWeight: 'bold',
                }}
              />
              <Chip
                label={editMode ? (
                  <select
                    value={editForm.priority}
                    onChange={(e) => setEditForm(prev => ({ ...prev, priority: e.target.value }))}
                    style={{ border: 'none', background: 'transparent' }}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                ) : (task.priority || 'Normal')}
                sx={{
                  backgroundColor: getPriorityColor(editMode ? editForm.priority : task.priority),
                  color: '#fff',
                  fontWeight: 'bold',
                }}
              />
            </Box>

            {/* Description */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                Description
              </Typography>
              {editMode ? (
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  value={editForm.description}
                  onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  variant="outlined"
                />
              ) : (
                <Typography variant="body2" color="text.secondary">
                  {task.description || 'No description provided'}
                </Typography>
              )}
            </Box>

            {/* Due Date */}
            {task.dueDate && (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ScheduleIcon sx={{ mr: 1, color: theme.palette.text.secondary }} />
                <Typography variant="body2" color="text.secondary">
                  Due: {format(new Date(task.dueDate), 'MMM dd, yyyy')}
                </Typography>
              </Box>
            )}

            {/* Assignee */}
            {task.assignee && (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PersonIcon sx={{ mr: 1, color: theme.palette.text.secondary }} />
                <Typography variant="body2" color="text.secondary">
                  Assigned to: {task.assignee.name || task.assignee}
                </Typography>
              </Box>
            )}

            {/* Edit Actions */}
            {editMode && (
              <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSave}
                  size="small"
                >
                  Save
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<CancelIcon />}
                  onClick={handleCancel}
                  size="small"
                >
                  Cancel
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Comments Section */}
        <Card sx={{ 
          backgroundColor: theme.palette.surface,
          border: theme.palette.mode === 'dark' ? `1px solid ${theme.palette.border}` : 'none',
        }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Comments ({comments.length})
            </Typography>

            {/* Add Comment */}
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                variant="outlined"
                sx={{ mb: 1 }}
              />
              <Button
                variant="contained"
                onClick={handleAddComment}
                disabled={!newComment.trim() || submittingComment}
                startIcon={submittingComment ? <CircularProgress size={16} /> : <CommentIcon />}
              >
                {submittingComment ? 'Adding...' : 'Add Comment'}
              </Button>
            </Box>

            <Divider sx={{ mb: 2 }} />

            {/* Comments List */}
            {comments.length > 0 ? (
              <List>
                {comments.map((comment, index) => (
                  <ListItem key={comment.id || index} sx={{ px: 0 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                        {comment.user?.name ? comment.user.name.charAt(0).toUpperCase() : 'U'}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {comment.user?.name || 'Unknown User'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {format(new Date(comment.createdAt || comment.date), 'MMM dd, yyyy HH:mm')}
                          </Typography>
                        </Box>
                      }
                      secondary={comment.content || comment.message}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                No comments yet. Be the first to comment!
              </Typography>
            )}
          </CardContent>
        </Card>

        {/* File Attachments Section */}
        <Card sx={{ 
          backgroundColor: theme.palette.surface,
          border: theme.palette.mode === 'dark' ? `1px solid ${theme.palette.border}` : 'none',
        }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Attachments ({attachedFiles.length})
            </Typography>

            {/* File List */}
            {attachedFiles.length > 0 ? (
              <List sx={{ mb: 2 }}>
                {attachedFiles.map((file, index) => {
                  const uploadedByCurrentUser = file.uploaded_by === user?.id || file.uploader?.id === user?.id;
                  return (
                    <ListItem
                      key={file.id || index}
                      sx={{
                        borderBottom: index < attachedFiles.length - 1 ? `1px solid ${theme.palette.divider}` : 'none',
                        '&:last-child': { borderBottom: 'none' },
                      }}
                    >
                      <Box sx={{ mr: 1, color: theme.palette.text.secondary }}>
                        <AttachFileIcon />
                      </Box>
                      <ListItemText
                        primary={
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 500,
                              cursor: 'pointer',
                              color: theme.palette.primary.main,
                              '&:hover': { textDecoration: 'underline' },
                            }}
                            onClick={() => handleFileClick(file)}
                          >
                            {file.file_name || file.name}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="caption" color="text.secondary">
                            {file.created_at && format(new Date(file.created_at), 'MMM dd, yyyy HH:mm')}
                          </Typography>
                        }
                      />
                      {uploadedByCurrentUser && (
                        <IconButton
                          edge="end"
                          onClick={() => {
                            setDeleteFileId(file.id);
                            setDeleteDialogVisible(true);
                          }}
                          sx={{ color: theme.palette.error.main }}
                          size="small"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}
                    </ListItem>
                  );
                })}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: 'center', py: 2 }}>
                No attachments yet.
              </Typography>
            )}

            {/* File Upload */}
            <FileAttachment
              onUpload={handleFileUpload}
              files={attachedFiles}
              onRemove={(index) => {
                const file = attachedFiles[index];
                if (file?.id) {
                  setDeleteFileId(file.id);
                  setDeleteDialogVisible(true);
                }
              }}
            />
          </CardContent>
        </Card>
      </Box>

      {/* Action Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
      >
        <MenuItem onClick={handleEdit}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit Task</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete Task</ListItemText>
        </MenuItem>
      </Menu>

      {/* File Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogVisible}
        onClose={() => setDeleteDialogVisible(false)}
      >
        <DialogTitle>Delete File</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this file? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogVisible(false)}>
            Cancel
          </Button>
          <Button onClick={handleFileDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TaskDetailPage;
