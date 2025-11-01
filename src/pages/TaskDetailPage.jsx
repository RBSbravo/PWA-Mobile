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
  FormControl,
  InputLabel,
  Select,
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
import { useMessage } from '../context/MessageContext';
import api from '../services/api';
import socketService from '../services/socket';
import { format } from 'date-fns';
import { API_CONFIG } from '../config';
import ScreenHeader from '../components/ScreenHeader';
import FileAttachment from '../components/FileAttachment';
import FileViewer from '../components/FileViewer';
import SkeletonLoader from '../components/SkeletonLoader';

const TaskDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, token } = useAuth();
  const { notifications, unreadCount, realtimeNotifications, loading: notificationsLoading, fetchNotifications, markAsRead, markAllAsRead, deleteNotification, refreshUnreadCount, clearRealtimeNotifications } = useNotification();
  const { showSuccess, showError, showWarning, showInfo } = useMessage();

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
    remarks: '',
  });
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [deleteFileId, setDeleteFileId] = useState(null);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileViewerOpen, setFileViewerOpen] = useState(false);
  const [deleteCommentId, setDeleteCommentId] = useState(null);
  const [deleteCommentDialogVisible, setDeleteCommentDialogVisible] = useState(false);

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
      
      // Fetch attachments separately like mobile app
      let attachments = taskData.attachments;
      if (!attachments) {
        try {
          const response = await fetch(`${API_CONFIG.BACKEND_API_URL}/files/task/${id}`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` },
          });
          if (response.ok) {
            attachments = await response.json();
          } else {
            attachments = [];
          }
        } catch (err) {
          console.error('Failed to fetch attachments:', err);
          attachments = [];
        }
      }
      setAttachedFiles(attachments || []);
      
      // Initialize edit form
      setEditForm({
        title: taskData.title || '',
        description: taskData.description || '',
        status: taskData.status || 'pending',
        priority: taskData.priority || 'medium',
      });
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to load task details';
      setError(errorMessage);
      showError(`Unable to load task: ${errorMessage}`);
      console.error('Task detail error:', err);
    } finally {
      setLoading(false);
    }
  }, [id, token, showError]);

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
    setEditForm({
      title: task.title || '',
      description: task.description || '',
      status: task.status || 'pending',
      priority: task.priority || 'medium',
      remarks: '',
    });
    setEditDialogOpen(true);
    setMenuAnchor(null);
  };

  const handleSave = async () => {
    if (!editForm.remarks.trim()) {
      showWarning('Remarks are required when updating a task.');
      return;
    }
    
    try {
      await api.updateTask(token, id, {
        status: editForm.status,
      });
      
      // Add remarks as a comment
      await api.addTaskComment(token, id, `📝 **Task Updated**\n\n${editForm.remarks}`);
      
      setEditDialogOpen(false);
      await fetchTaskDetails();
      
      // Refresh comments
      const fetchedComments = await api.getTaskComments(token, id);
      setComments(fetchedComments);
      
      showSuccess('Task updated successfully!');
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to update task';
      setError(errorMessage);
      showError(`Failed to update task: ${errorMessage}`);
      console.error('Update error:', err);
    }
  };

  const handleCancel = () => {
    setEditDialogOpen(false);
    setEditForm({
      title: '',
      description: '',
      status: '',
      priority: '',
      remarks: '',
    });
  };

  const handleDelete = async () => {
    try {
      await api.deleteTask(token, id);
      showSuccess('Task deleted successfully!');
      navigate('/tasks');
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to delete task';
      setError(errorMessage);
      showError(`Failed to delete task: ${errorMessage}`);
      console.error('Delete error:', err);
    }
    setMenuAnchor(null);
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      showWarning('Please enter a comment before submitting.');
      return;
    }
    
    try {
      setSubmittingComment(true);
      const comment = await api.addTaskComment(token, id, newComment);
      setComments(prev => [comment, ...prev]);
      setNewComment('');
      showSuccess('Comment added successfully!');
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to add comment';
      setError(errorMessage);
      showError(`Failed to add comment: ${errorMessage}`);
      console.error('Comment error:', err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    setDeleteCommentId(commentId);
    setDeleteCommentDialogVisible(true);
  };

  const confirmDeleteComment = async () => {
    try {
      await api.deleteTaskComment(token, deleteCommentId);
      setComments(prev => prev.filter(comment => comment.id !== deleteCommentId));
      showSuccess('Comment deleted successfully!');
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to delete comment';
      setError(errorMessage);
      showError(`Failed to delete comment: ${errorMessage}`);
      console.error('Delete comment error:', err);
    } finally {
      setDeleteCommentDialogVisible(false);
      setDeleteCommentId(null);
    }
  };

  const handleFileClick = (file) => {
    setSelectedFile(file);
    setFileViewerOpen(true);
  };

  const handleCloseFileViewer = () => {
    setFileViewerOpen(false);
    setSelectedFile(null);
  };

  const handleFileUpload = async (file) => {
    try {
      setUploadingFile(true);
      await api.uploadTaskAttachment(id, file, token);
      
      // Refresh task details to get updated attachments
      await fetchTaskDetails();
      // Don't show success message - the backend will send a notification
      // showSuccess('File uploaded successfully!');
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to upload file';
      setError(errorMessage);
      showError(`Failed to upload file: ${errorMessage}`);
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
      showSuccess('File deleted successfully!');
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to delete file';
      setError(errorMessage);
      showError(`Failed to delete file: ${errorMessage}`);
      console.error('File delete error:', err);
    } finally {
      setDeleteDialogVisible(false);
      setDeleteFileId(null);
    }
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
      case 'cancelled':
        return theme.palette.error.main;
      default:
        return theme.palette.text.secondary;
    }
  };

  const getPriorityColor = (priority) => {
    switch ((priority || '').toLowerCase()) {
      case 'urgent':
        return theme.palette.error.main;
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
      <>
        <ScreenHeader
          title="Task Details"
          leftIcon={<ArrowBackIcon sx={{ fontSize: 28, color: theme.palette.primary.main }} />}
          onLeftIconPress={() => navigate('/tasks')}
        />
        <Box sx={{ 
          backgroundColor: theme.palette.background.default, 
          minHeight: '100vh',
          width: '100%',
          pt: '80px', // Add top padding for fixed header
        }}>
          <SkeletonLoader type="task-detail" />
        </Box>
      </>
    );
  }

  if (error) {
    return (
      <>
        <ScreenHeader
          title="Task Details"
          leftIcon={<ArrowBackIcon sx={{ fontSize: 28, color: theme.palette.primary.main }} />}
          onLeftIconPress={() => navigate('/tasks')}
        />
        <Box sx={{ 
          backgroundColor: theme.palette.background.default, 
          minHeight: '100vh',
          width: '100%',
        }}>
          <Box sx={{ p: 3 }}>
            <Alert severity="error">{error}</Alert>
          </Box>
        </Box>
      </>
    );
  }

  if (!task) {
    return (
      <>
        <ScreenHeader
          title="Task Details"
          leftIcon={<ArrowBackIcon sx={{ fontSize: 28, color: theme.palette.primary.main }} />}
          onLeftIconPress={() => navigate('/tasks')}
        />
        <Box sx={{ 
          backgroundColor: theme.palette.background.default, 
          minHeight: '100vh',
          width: '100%',
        }}>
          <Box sx={{ p: 3 }}>
            <Alert severity="info">Task not found</Alert>
          </Box>
        </Box>
      </>
    );
  }

  return (
    <>
      {/* Header */}
      <ScreenHeader
        title="Task Details"
        leftIcon={<ArrowBackIcon sx={{ fontSize: 28, color: theme.palette.primary.main }} />}
        onLeftIconPress={() => navigate('/tasks')}
        rightAction={canEdit ? (
          <IconButton onClick={(e) => setMenuAnchor(e.currentTarget)}>
            <MoreVertIcon />
          </IconButton>
        ) : null}
      />

      {/* Content */}
      <Box sx={{ 
        backgroundColor: theme.palette.background.default, 
        minHeight: '100vh',
        width: '100%',
        pt: '80px', // Add top padding for fixed header
      }}>
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

        {/* Task Details Card */}
        <Card sx={{ 
          mb: 3,
          backgroundColor: theme.palette.surface,
          border: theme.palette.mode === 'dark' ? `1px solid ${theme.palette.border}` : 'none',
        }}>
          <CardContent>
            {/* Title */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                <AssignmentIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                <Typography variant="h5" fontWeight="bold" sx={{ flex: 1 }}>
                  {task.title}
                </Typography>
              </Box>
              {canEdit && (
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={handleEdit}
                  size="small"
                  sx={{ ml: 2 }}
                >
                  Edit
                </Button>
              )}
            </Box>

            {/* Status and Priority */}
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Chip
                label={(task.status || 'Unknown').replace('_', ' ')}
                sx={{
                  backgroundColor: getStatusColor(task.status),
                  color: theme.palette.getContrastText(getStatusColor(task.status)),
                  fontWeight: 'bold',
                }}
              />
              <Chip
                label={task.priority || 'Normal'}
                sx={{
                  backgroundColor: getPriorityColor(task.priority),
                  color: theme.palette.getContrastText(getPriorityColor(task.priority)),
                  fontWeight: 'bold',
                }}
              />
            </Box>

            {/* Description */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                Description
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {task.description || 'No description provided'}
              </Typography>
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

            {/* Additional Task Details */}
            <Box sx={{ mb: 2 }}>
              {task.assignee && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <PersonIcon sx={{ mr: 1, color: theme.palette.text.secondary }} />
                  <Typography variant="body2" color="text.secondary">
                    <strong>Assigned to:</strong> {task.assignee.name || task.assignee}
                  </Typography>
                </Box>
              )}
              {task.relatedTicket && (
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <AssignmentIcon sx={{ mr: 1, color: theme.palette.text.secondary }} />
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                      Related Ticket Details:
                    </Typography>
                  </Box>
                  <Box sx={{ ml: 3, pl: 2, borderLeft: `2px solid ${theme.palette.primary.main}`, backgroundColor: theme.palette.background.paper, borderRadius: 1, p: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {task.relatedTicket.title} (#{task.relatedTicket.id})
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {task.relatedTicket.description || 'No description available'}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                      <Chip
                        label={(task.relatedTicket.status || 'Unknown').replace('_', ' ')}
                        size="small"
                        sx={{
                          backgroundColor: getStatusColor(task.relatedTicket.status),
                          color: theme.palette.getContrastText(getStatusColor(task.relatedTicket.status)),
                          fontWeight: 'bold',
                        }}
                      />
                      <Chip
                        label={task.relatedTicket.priority || 'Normal'}
                        size="small"
                        sx={{
                          backgroundColor: getPriorityColor(task.relatedTicket.priority),
                          color: theme.palette.getContrastText(getPriorityColor(task.relatedTicket.priority)),
                          fontWeight: 'bold',
                        }}
                      />
                    </Box>
                    {task.relatedTicket.desired_action && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                        <strong>Desired Action:</strong> {task.relatedTicket.desired_action}
                      </Typography>
                    )}
                    {task.relatedTicket.due_date && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                        <strong>Due Date:</strong> {format(new Date(task.relatedTicket.due_date), 'MMM dd, yyyy')}
                      </Typography>
                    )}
                    {task.relatedTicket.created_at && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                        <strong>Created:</strong> {format(new Date(task.relatedTicket.created_at), 'MMM dd, yyyy')}
                      </Typography>
                    )}
                    {task.relatedTicket.attachments && task.relatedTicket.attachments.length > 0 && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        <strong>Attachments:</strong> {task.relatedTicket.attachments.length} file(s)
                      </Typography>
                    )}
                  </Box>
                </Box>
              )}
              {task.project && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <AssignmentIcon sx={{ mr: 1, color: theme.palette.text.secondary }} />
                  <Typography variant="body2" color="text.secondary">
                    <strong>Project:</strong> {task.project}
                  </Typography>
                </Box>
              )}
              {task.estimatedHours && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <ScheduleIcon sx={{ mr: 1, color: theme.palette.text.secondary }} />
                  <Typography variant="body2" color="text.secondary">
                    <strong>Estimated Hours:</strong> {task.estimatedHours}
                  </Typography>
                </Box>
              )}
            </Box>

          </CardContent>
        </Card>

        {/* Comments Section */}
        <Card sx={{ 
          mb: 3,
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
              <Box>
                {comments.map((comment, index) => {
                  const isTaskUpdate = comment.content && comment.content.startsWith('📝 **Task Updated**');
                  return (
                    <Box
                      key={comment.id || index}
                      sx={{
                        p: 2,
                        mb: 1,
                        borderRadius: 1,
                        backgroundColor: isTaskUpdate ? theme.palette.primary.main + '10' : 'transparent',
                        borderLeft: isTaskUpdate ? `4px solid ${theme.palette.primary.main}` : 'none',
                        borderLeftWidth: isTaskUpdate ? 4 : 0,
                        pl: isTaskUpdate ? 2.5 : 0,
                      }}
                    >
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          mb: 1,
                          fontWeight: isTaskUpdate ? 'bold' : 'normal',
                          whiteSpace: 'pre-wrap',
                        }}
                      >
                        {comment.content || comment.message}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="caption" color="text.secondary">
                          {comment.commentUser?.firstname || comment.user?.firstname || 'Unknown'} {comment.commentUser?.lastname || comment.user?.lastname || ''} - {format(new Date(comment.createdAt || comment.date), 'MMM dd, yyyy HH:mm')}
                        </Typography>
                        {/* Show delete button only for the commenter and never for system-generated updates */}
                        {!isTaskUpdate && (comment.commentUser?.id === user?.id || comment.user?.id === user?.id) && (
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteComment(comment.id)}
                            sx={{ 
                              color: theme.palette.error.main,
                              ml: 1,
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Box>
                      {index < comments.length - 1 && (
                        <Divider sx={{ mt: 1.5, opacity: 0.3 }} />
                      )}
                    </Box>
                  );
                })}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                No comments yet. Be the first to comment!
              </Typography>
            )}
          </CardContent>
        </Card>

        {/* File Attachments Section */}
        <Card sx={{ 
          mb: 3,
          backgroundColor: theme.palette.surface,
          border: theme.palette.mode === 'dark' ? `1px solid ${theme.palette.border}` : 'none',
        }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Attachments ({attachedFiles.length})
            </Typography>

            {/* File List */}
            {attachedFiles.length > 0 ? (
              <Box sx={{ mb: 2 }}>
                {attachedFiles.map((file, index) => {
                  const uploadedByCurrentUser = file.uploaded_by === user?.id || file.uploader?.id === user?.id;
                  return (
                    <Box
                      key={file.id || index}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        p: 2,
                        mb: 1,
                        borderRadius: 1,
                        border: `1px solid ${theme.palette.divider}`,
                        backgroundColor: theme.palette.background.paper,
                        '&:hover': {
                          backgroundColor: theme.palette.action.hover,
                        },
                      }}
                    >
                      <AttachFileIcon 
                        sx={{ 
                          mr: 2, 
                          color: theme.palette.primary.main,
                          fontSize: 20,
                        }} 
                      />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 500,
                            cursor: 'pointer',
                            color: theme.palette.primary.main,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            '&:hover': {
                              textDecoration: 'underline',
                            },
                          }}
                          onClick={() => handleFileClick(file)}
                        >
                          {file.file_name || file.name}
                        </Typography>
                        {file.created_at && (
                          <Typography variant="caption" color="text.secondary">
                            {format(new Date(file.created_at), 'MMM dd, yyyy HH:mm')}
                          </Typography>
                        )}
                      </Box>
                      {uploadedByCurrentUser && (
                        <IconButton
                          onClick={() => {
                            setDeleteFileId(file.id);
                            setDeleteDialogVisible(true);
                          }}
                          sx={{ 
                            color: theme.palette.error.main,
                            ml: 1,
                          }}
                          size="small"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                  );
                })}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: 'center', py: 2 }}>
                No attachments yet.
              </Typography>
            )}

            {/* File Upload */}
            <FileAttachment
              onUpload={handleFileUpload}
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

      {/* Edit Task Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={handleCancel}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: theme.palette.background.paper,
          }
        }}
      >
        <DialogTitle sx={{
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
          fontWeight: 600
        }}>
          Update Task
        </DialogTitle>
        <DialogContent sx={{
          backgroundColor: theme.palette.background.paper
        }}>
          {/* Read-only fields */}
          <TextField
            label="Title"
            value={editForm.title}
            fullWidth
            margin="normal"
            variant="outlined"
            disabled
            sx={{
              '& .MuiInputBase-input': {
                color: theme.palette.text.secondary,
              },
            }}
          />
          <TextField
            label="Description"
            value={editForm.description}
            fullWidth
            multiline
            rows={4}
            margin="normal"
            variant="outlined"
            disabled
            sx={{
              '& .MuiInputBase-input': {
                color: theme.palette.text.secondary,
              },
            }}
          />
          <TextField
            label="Priority"
            value={editForm.priority}
            fullWidth
            margin="normal"
            variant="outlined"
            disabled
            sx={{
              '& .MuiInputBase-input': {
                color: theme.palette.text.secondary,
              },
            }}
          />
          
          {/* Editable Status Field */}
          <FormControl fullWidth margin="normal">
            <InputLabel>Status</InputLabel>
            <Select
              value={editForm.status}
              onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value }))}
              label="Status"
              sx={{
                backgroundColor: theme.palette.background.paper,
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: theme.palette.divider,
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: theme.palette.primary.main,
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: theme.palette.primary.main,
                },
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    backgroundColor: theme.palette.background.paper,
                    border: `1px solid ${theme.palette.divider}`,
                    boxShadow: theme.shadows[8],
                    '& .MuiMenuItem-root': {
                      backgroundColor: theme.palette.background.paper,
                      color: theme.palette.text.primary,
                      '&:hover': {
                        backgroundColor: theme.palette.action.hover,
                      },
                      '&.Mui-selected': {
                        backgroundColor: theme.palette.primary.main,
                        color: theme.palette.primary.contrastText,
                        '&:hover': {
                          backgroundColor: theme.palette.primary.dark,
                        },
                      },
                    },
                  },
                },
              }}
            >
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="in_progress">In Progress</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="declined">Declined</MenuItem>
            </Select>
          </FormControl>
          
          {/* Remarks Field */}
          <TextField
            label="Remarks *"
            value={editForm.remarks}
            onChange={(e) => setEditForm(prev => ({ ...prev, remarks: e.target.value }))}
            fullWidth
            multiline
            rows={3}
            margin="normal"
            variant="outlined"
            placeholder="Please provide remarks for this update..."
            required
          />
        </DialogContent>
        <DialogActions sx={{
          backgroundColor: theme.palette.background.paper,
          borderTop: `1px solid ${theme.palette.divider}`,
        }}>
          <Button onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} variant="contained">
            Update Task
          </Button>
        </DialogActions>
      </Dialog>

      {/* File Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogVisible}
        onClose={() => setDeleteDialogVisible(false)}
        PaperProps={{
          sx: {
            backgroundColor: theme.palette.background.paper,
          }
        }}
      >
        <DialogTitle sx={{
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
          fontWeight: 600
        }}>
          Delete File
        </DialogTitle>
        <DialogContent sx={{
          backgroundColor: theme.palette.background.paper
        }}>
          <Typography>
            Are you sure you want to delete this file? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{
          backgroundColor: theme.palette.background.paper,
          borderTop: `1px solid ${theme.palette.divider}`,
        }}>
          <Button onClick={() => setDeleteDialogVisible(false)}>
            Cancel
          </Button>
          <Button onClick={handleFileDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Comment Delete Confirmation Dialog */}
      <Dialog
        open={deleteCommentDialogVisible}
        onClose={() => setDeleteCommentDialogVisible(false)}
        PaperProps={{
          sx: {
            backgroundColor: theme.palette.background.paper,
          }
        }}
      >
        <DialogTitle sx={{
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
          fontWeight: 600
        }}>
          Delete Comment
        </DialogTitle>
        <DialogContent sx={{
          backgroundColor: theme.palette.background.paper
        }}>
          <Typography>
            Are you sure you want to delete this comment? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{
          backgroundColor: theme.palette.background.paper,
          borderTop: `1px solid ${theme.palette.divider}`,
        }}>
          <Button onClick={() => setDeleteCommentDialogVisible(false)}>
            Cancel
          </Button>
          <Button onClick={confirmDeleteComment} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* File Viewer */}
      <FileViewer
        open={fileViewerOpen}
        onClose={handleCloseFileViewer}
        file={selectedFile}
        token={token}
      />
      </Box>
    </>
  );
};

export default TaskDetailPage;
