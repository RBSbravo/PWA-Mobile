import React from 'react';
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Alert,
  useTheme,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Assignment as AssignmentIcon,
  ConfirmationNumber as ConfirmationNumberIcon,
  FileUpload as FileUploadIcon,
  Comment as CommentIcon,
  Settings as SettingsIcon,
  Star as StarIcon,
  Help as HelpIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Person as PersonIcon,
  Notifications as NotificationsIcon,
  Speed as SpeedIcon,
  PhoneAndroid as MobileIcon,
} from '@mui/icons-material';

const UserGuide = () => {
  const theme = useTheme();
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: 'primary.main' }}>
        📱 Mobile App Guide
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary', fontSize: '1.1rem' }}>
        Welcome to the Mobile Task Management Application! This comprehensive guide will help you navigate and utilize all features effectively on your mobile device.
      </Typography>

      {/* Getting Started */}
      <Accordion sx={{ 
        mb: 3,
        backgroundColor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        '&:before': {
          display: 'none',
        },
        '&.Mui-expanded': {
          margin: '0 0 24px 0',
        },
      }}>
        <AccordionSummary 
          expandIcon={<ExpandMoreIcon />}
          sx={{
            backgroundColor: theme.palette.background.default,
            color: theme.palette.text.primary,
            '&:hover': {
              backgroundColor: theme.palette.action.hover,
            },
            '&.Mui-expanded': {
              backgroundColor: theme.palette.action.selected,
            },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <StarIcon sx={{ mr: 2, color: 'inherit' }} />
            <Typography variant="h6" sx={{ fontWeight: 600, color: 'inherit' }}>
              Getting Started
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails sx={{
          backgroundColor: theme.palette.background.paper,
          borderTop: `1px solid ${theme.palette.divider}`,
        }}>
          <Typography variant="body1" sx={{ mb: 3 }}>
            The Mobile Task Management Application is designed for efficient task management on mobile devices. Here's how to get started:
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                First Steps
              </Typography>
              <Box sx={{ pl: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  1. <strong>Login</strong> - Use your email and password to access the system
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  2. <strong>Explore Dashboard</strong> - View your task overview and recent activity
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  3. <strong>Check Tasks</strong> - Navigate to the Tasks tab to see all your tasks
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  4. <strong>Notifications</strong> - View notifications for updates
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                Key Features
              </Typography>
              <Box sx={{ pl: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>Real-time Updates</strong> - Live task status changes
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>File Attachments</strong> - Upload and view files
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>Comments System</strong> - Collaborate on tasks
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>Mobile Optimized</strong> - Touch-friendly interface
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Rate Limiting Guide */}
      <Accordion sx={{ 
        mb: 3,
        backgroundColor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        '&:before': {
          display: 'none',
        },
        '&.Mui-expanded': {
          margin: '0 0 24px 0',
        },
      }}>
        <AccordionSummary 
          expandIcon={<ExpandMoreIcon />}
          sx={{
            backgroundColor: theme.palette.background.default,
            color: theme.palette.text.primary,
            '&:hover': {
              backgroundColor: theme.palette.action.hover,
            },
            '&.Mui-expanded': {
              backgroundColor: theme.palette.action.selected,
            },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <SpeedIcon sx={{ mr: 2, color: 'warning.main' }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Rate Limiting & Security
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails sx={{
          backgroundColor: theme.palette.background.paper,
          borderTop: `1px solid ${theme.palette.divider}`,
        }}>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Our system implements rate limiting to ensure security and optimal performance for all users.
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                Rate Limit Features
              </Typography>
              <Box sx={{ pl: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>Smart Detection</strong> - Automatically detects rate limit violations
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>Visual Timer</strong> - Shows countdown timer for retry availability
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>Progress Bar</strong> - Visual progress indicator for wait time
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>Auto Retry</strong> - Automatically enables retry when timer expires
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>User-Friendly Messages</strong> - Clear explanations of rate limits
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                Actual Rate Limits
              </Typography>
              <Box sx={{ pl: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>Login Attempts</strong> - 5 attempts per 15 minutes
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>Password Reset</strong> - 3 attempts per hour
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>Change Password</strong> - 3 attempts per 15 minutes
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>File Uploads</strong> - 10 uploads per 5 minutes
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>Registration</strong> - 5 attempts per 15 minutes
                </Typography>
              </Box>
            </Grid>
          </Grid>
          
          <Alert severity="info" sx={{ mt: 3 }}>
            <Typography variant="body2">
              <strong>Tip:</strong> If you encounter rate limiting, wait for the timer to complete before retrying. The system will automatically enable the retry button when the cooldown period ends.
            </Typography>
          </Alert>
        </AccordionDetails>
      </Accordion>

      {/* PWA Features */}
      <Accordion sx={{ 
        mb: 3,
        backgroundColor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        '&:before': {
          display: 'none',
        },
        '&.Mui-expanded': {
          margin: '0 0 24px 0',
        },
      }}>
        <AccordionSummary 
          expandIcon={<ExpandMoreIcon />}
          sx={{
            backgroundColor: theme.palette.background.default,
            color: theme.palette.text.primary,
            '&:hover': {
              backgroundColor: theme.palette.action.hover,
            },
            '&.Mui-expanded': {
              backgroundColor: theme.palette.action.selected,
            },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <MobileIcon sx={{ mr: 2, color: 'primary.main' }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
             Mobile App Features
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails sx={{
          backgroundColor: theme.palette.background.paper,
          borderTop: `1px solid ${theme.palette.divider}`,
        }}>
          <Typography variant="body1" sx={{ mb: 3 }}>
            This Progressive Web App (PWA) is optimized for mobile devices with touch-friendly interfaces and responsive design.
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                Touch Interface
              </Typography>
              <Box sx={{ pl: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>Bottom Navigation</strong> - 4-tab navigation (Home, Tasks, Notifications, Profile)
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>Touch Targets</strong> - Large, easy-to-tap buttons and cards
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>Responsive Design</strong> - Adapts to different screen sizes
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>Mobile-First</strong> - Designed primarily for mobile use
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                PWA Benefits
              </Typography>
              <Box sx={{ pl: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>Installable</strong> - Can be installed on home screen
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>Fast Loading</strong> - Cached resources for quick access
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>Push Notifications</strong> - Real-time updates
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Navigation Guide */}
      <Accordion sx={{ 
        mb: 3,
        backgroundColor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        '&:before': {
          display: 'none',
        },
        '&.Mui-expanded': {
          margin: '0 0 24px 0',
        },
      }}>
        <AccordionSummary 
          expandIcon={<ExpandMoreIcon />}
          sx={{
            backgroundColor: theme.palette.background.default,
            color: theme.palette.text.primary,
            '&:hover': {
              backgroundColor: theme.palette.action.hover,
            },
            '&.Mui-expanded': {
              backgroundColor: theme.palette.action.selected,
            },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <PersonIcon sx={{ mr: 2, color: 'primary.main' }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Navigation & Layout
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails sx={{
          backgroundColor: theme.palette.background.paper,
          borderTop: `1px solid ${theme.palette.divider}`,
        }}>
          <Typography variant="body1" sx={{ mb: 3 }}>
            The PWA mobile app uses a simple bottom navigation bar for easy navigation between main sections.
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                Bottom Navigation Tabs
              </Typography>
              <Box sx={{ pl: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>Home</strong> - Dashboard with task overview and recent activity
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>Tasks</strong> - View and manage all your tasks
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>Notifications</strong> - Real-time system notifications (with badge count)
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>Profile</strong> - User profile, settings, and this user guide
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                Page Features
              </Typography>
              <Box sx={{ pl: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>Screen Headers</strong> - Page titles and navigation
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>Loading States</strong> - Skeleton loaders for better UX
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>Error Handling</strong> - Clear error messages and retry options
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>Responsive Layout</strong> - Adapts to mobile and tablet screens
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Task Management Guide */}
      <Accordion sx={{ 
        mb: 3,
        backgroundColor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        '&:before': {
          display: 'none',
        },
        '&.Mui-expanded': {
          margin: '0 0 24px 0',
        },
      }}>
        <AccordionSummary 
          expandIcon={<ExpandMoreIcon />}
          sx={{
            backgroundColor: theme.palette.background.default,
            color: theme.palette.text.primary,
            '&:hover': {
              backgroundColor: theme.palette.action.hover,
            },
            '&.Mui-expanded': {
              backgroundColor: theme.palette.action.selected,
            },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <AssignmentIcon sx={{ mr: 2, color: 'primary.main' }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Task Management
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails sx={{
          backgroundColor: theme.palette.background.paper,
          borderTop: `1px solid ${theme.palette.divider}`,
        }}>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Manage your tasks efficiently with the mobile-optimized task management system.
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                Task Operations
              </Typography>
              <Box sx={{ pl: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>View Tasks</strong> - See all assigned tasks in the Tasks tab
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>Task Details</strong> - Tap any task to view full details
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>Status Updates</strong> - Change task status (Pending, In Progress, Completed)
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>Comments</strong> - Add progress updates and notes
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>File Attachments</strong> - Upload and view supporting files
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                Real-time Features
              </Typography>
              <Box sx={{ pl: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>Live Updates</strong> - Task changes appear instantly
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>Notifications</strong> - Get notified of task assignments and updates
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>Comment Notifications</strong> - Real-time comment updates
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>File Upload Alerts</strong> - Notifications for new attachments
                </Typography>
              </Box>
            </Grid>
          </Grid>
          
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, mt: 3, color: 'primary.main' }}>
            Task Statuses
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', p: 2, bgcolor: 'warning.light', borderRadius: 2 }}>
                <ScheduleIcon sx={{ mr: 1, color: 'warning.main' }} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Pending
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', p: 2, bgcolor: 'info.light', borderRadius: 2 }}>
                <AssignmentIcon sx={{ mr: 1, color: 'info.main' }} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  In Progress
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', p: 2, bgcolor: 'success.light', borderRadius: 2 }}>
                <CheckCircleIcon sx={{ mr: 1, color: 'success.main' }} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Completed
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Notifications Guide */}
      <Accordion sx={{ 
        mb: 3,
        backgroundColor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        '&:before': {
          display: 'none',
        },
        '&.Mui-expanded': {
          margin: '0 0 24px 0',
        },
      }}>
        <AccordionSummary 
          expandIcon={<ExpandMoreIcon />}
          sx={{
            backgroundColor: theme.palette.background.default,
            color: theme.palette.text.primary,
            '&:hover': {
              backgroundColor: theme.palette.action.hover,
            },
            '&.Mui-expanded': {
              backgroundColor: theme.palette.action.selected,
            },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <NotificationsIcon sx={{ mr: 2, color: 'primary.main' }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Notifications System
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails sx={{
          backgroundColor: theme.palette.background.paper,
          borderTop: `1px solid ${theme.palette.divider}`,
        }}>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Stay updated with real-time notifications for tasks, comments, and system updates.
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                Notification Types
              </Typography>
              <Box sx={{ pl: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>Task Assignments</strong> - New task assignments
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>Task Updates</strong> - Status changes and modifications
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>Comments</strong> - New comments on your tasks
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>File Uploads</strong> - New file attachments
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                Notification Features
              </Typography>
              <Box sx={{ pl: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>Badge Counter</strong> - Unread count on Notifications tab
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>Real-time Updates</strong> - Instant notification delivery
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>Mark as Read</strong> - Clear individual notifications
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>Mark All Read</strong> - Clear all notifications at once
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>Delete Notifications</strong> - Remove unwanted notifications
                </Typography>
              </Box>
            </Grid>
          </Grid>
          
          <Alert severity="info" sx={{ mt: 3 }}>
            <Typography variant="body2">
              <strong>Note:</strong> You won't receive notifications for your own actions (e.g., commenting on your own tasks). Only other users' actions will trigger notifications.
            </Typography>
          </Alert>
        </AccordionDetails>
      </Accordion>

      {/* Tips & Best Practices */}
      <Accordion sx={{ 
        mb: 3,
        backgroundColor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        '&:before': {
          display: 'none',
        },
        '&.Mui-expanded': {
          margin: '0 0 24px 0',
        },
      }}>
        <AccordionSummary 
          expandIcon={<ExpandMoreIcon />}
          sx={{
            backgroundColor: theme.palette.background.default,
            color: theme.palette.text.primary,
            '&:hover': {
              backgroundColor: theme.palette.action.hover,
            },
            '&.Mui-expanded': {
              backgroundColor: theme.palette.action.selected,
            },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <StarIcon sx={{ mr: 2, color: 'primary.main' }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Tips & Best Practices
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails sx={{
          backgroundColor: theme.palette.background.paper,
          borderTop: `1px solid ${theme.palette.divider}`,
        }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                Mobile Usage Tips
              </Typography>
              <Box sx={{ pl: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>Install PWA</strong> - Add to home screen for app-like experience
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>Check Notifications Tab</strong> - Regularly check for updates
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                Task Management Tips
              </Typography>
              <Box sx={{ pl: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>Update Status Regularly</strong> - Keep task status current
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>Add Comments</strong> - Provide progress updates
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>Attach Files</strong> - Upload supporting documents
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Support Information */}
      <Accordion sx={{ 
        mb: 3,
        backgroundColor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        '&:before': {
          display: 'none',
        },
        '&.Mui-expanded': {
          margin: '0 0 24px 0',
        },
      }}>
        <AccordionSummary 
          expandIcon={<ExpandMoreIcon />}
          sx={{
            backgroundColor: theme.palette.background.default,
            color: theme.palette.text.primary,
            '&:hover': {
              backgroundColor: theme.palette.action.hover,
            },
            '&.Mui-expanded': {
              backgroundColor: theme.palette.action.selected,
            },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <HelpIcon sx={{ mr: 2, color: 'primary.main' }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Support & Troubleshooting
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails sx={{
          backgroundColor: theme.palette.background.paper,
          borderTop: `1px solid ${theme.palette.divider}`,
        }}>
          <Typography variant="body1" sx={{ mb: 3 }}>
            If you need additional assistance or have questions not covered in this guide, please contact your system administrator or IT support team.
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                Common Issues
              </Typography>
              <Box sx={{ pl: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>App Not Loading</strong> - Check internet connection and refresh page
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>Login Problems</strong> - Verify credentials and check rate limits
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>Notifications Not Working</strong> - Check browser notification permissions
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>Slow Performance</strong> - Clear browser cache and restart
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>File Upload Issues</strong> - Check file size and format requirements
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                Getting Help
              </Typography>
              <Box sx={{ pl: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>IT Support</strong> - For technical issues and account problems
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>Department Head</strong> - For workflow and task-related questions
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>System Admin</strong> - For system-wide issues and permissions
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>User Guide</strong> - This comprehensive guide for self-help
                </Typography>
              </Box>
            </Grid>
          </Grid>
          
          <Alert severity="success" sx={{ mt: 3 }}>
            <Typography variant="body2">
              <strong>Thank you for using the PWA Mobile Task Management Application!</strong> This guide is regularly updated to reflect new features and improvements.
            </Typography>
          </Alert>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default UserGuide;
