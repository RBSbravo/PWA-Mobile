import React from 'react';
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Alert,
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
} from '@mui/icons-material';

const UserGuide = () => {
  return (
    <Box sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 3 } }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: 'primary.main', fontSize: { xs: '1.5rem', sm: '1.75rem' } }}>
        📚 User Guide
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary', fontSize: { xs: '0.9rem', sm: '1rem' } }}>
        Welcome to the Ticketing and Task Management System! This guide will help you navigate and utilize all the features effectively on your mobile device.
      </Typography>

      {/* Navigation Overview */}
      <Accordion sx={{ mb: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <MenuIcon sx={{ mr: 2, color: 'primary.main', fontSize: 20 }} />
            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: { xs: '0.95rem', sm: '1rem' } }}>
              Navigation & Layout
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main', fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                Mobile Navigation
              </Typography>
              <Box sx={{ pl: 1 }}>
                <Typography variant="body2" sx={{ mb: 1, fontSize: { xs: '0.8rem', sm: '0.85rem' } }}>
                  • <strong>Dashboard</strong> - Overview of your tasks and tickets
                </Typography>
                <Typography variant="body2" sx={{ mb: 1, fontSize: { xs: '0.8rem', sm: '0.85rem' } }}>
                  • <strong>Tasks</strong> - Create, manage, and track your tasks
                </Typography>
                <Typography variant="body2" sx={{ mb: 1, fontSize: { xs: '0.8rem', sm: '0.85rem' } }}>
                  • <strong>Notifications</strong> - View system notifications
                </Typography>
                <Typography variant="body2" sx={{ mb: 1, fontSize: { xs: '0.8rem', sm: '0.85rem' } }}>
                  • <strong>Profile</strong> - Account settings and user info
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Dashboard Guide */}
      <Accordion sx={{ mb: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <DashboardIcon sx={{ mr: 2, color: 'primary.main', fontSize: 20 }} />
            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: { xs: '0.95rem', sm: '1rem' } }}>
              Dashboard Overview
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body1" sx={{ mb: 2, fontSize: { xs: '0.85rem', sm: '0.9rem' } }}>
            The dashboard provides a comprehensive overview of your work status and performance metrics.
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main', fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                Key Metrics
              </Typography>
              <Box sx={{ pl: 1 }}>
                <Typography variant="body2" sx={{ mb: 1, fontSize: { xs: '0.8rem', sm: '0.85rem' } }}>
                  • <strong>Total Tasks</strong> - All your assigned tasks
                </Typography>
                <Typography variant="body2" sx={{ mb: 1, fontSize: { xs: '0.8rem', sm: '0.85rem' } }}>
                  • <strong>Completed Tasks</strong> - Finished tasks
                </Typography>
                <Typography variant="body2" sx={{ mb: 1, fontSize: { xs: '0.8rem', sm: '0.85rem' } }}>
                  • <strong>Pending Tasks</strong> - Tasks awaiting completion
                </Typography>
                <Typography variant="body2" sx={{ mb: 1, fontSize: { xs: '0.8rem', sm: '0.85rem' } }}>
                  • <strong>Overdue Tasks</strong> - Tasks past due date
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Tasks Management */}
      <Accordion sx={{ mb: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <AssignmentIcon sx={{ mr: 2, color: 'primary.main', fontSize: 20 }} />
            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: { xs: '0.95rem', sm: '1rem' } }}>
              Tasks Management
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body1" sx={{ mb: 2, fontSize: { xs: '0.85rem', sm: '0.9rem' } }}>
            Create, assign, and track tasks efficiently with our mobile-optimized task management system.
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main', fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                Creating Tasks
              </Typography>
              <Box sx={{ pl: 1 }}>
                <Typography variant="body2" sx={{ mb: 1, fontSize: { xs: '0.8rem', sm: '0.85rem' } }}>
                  1. Tap the <strong>"New Task"</strong> button
                </Typography>
                <Typography variant="body2" sx={{ mb: 1, fontSize: { xs: '0.8rem', sm: '0.85rem' } }}>
                  2. Fill in task details (title, description, priority)
                </Typography>
                <Typography variant="body2" sx={{ mb: 1, fontSize: { xs: '0.8rem', sm: '0.85rem' } }}>
                  3. Set due date and status
                </Typography>
                <Typography variant="body2" sx={{ mb: 1, fontSize: { xs: '0.8rem', sm: '0.85rem' } }}>
                  4. Upload relevant files (optional)
                </Typography>
                <Typography variant="body2" sx={{ mb: 1, fontSize: { xs: '0.8rem', sm: '0.85rem' } }}>
                  5. Tap <strong>"Create Task"</strong>
                </Typography>
              </Box>
            </Grid>
          </Grid>
          
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, mt: 2, color: 'primary.main', fontSize: { xs: '0.9rem', sm: '1rem' } }}>
            Task Statuses
          </Typography>
          <Grid container spacing={1}>
            <Grid item xs={12} sm={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', p: 1.5, bgcolor: 'warning.light', borderRadius: 2 }}>
                <ScheduleIcon sx={{ mr: 1, color: 'warning.main', fontSize: 16 }} />
                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: { xs: '0.75rem', sm: '0.8rem' } }}>
                  Pending
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', p: 1.5, bgcolor: 'info.light', borderRadius: 2 }}>
                <AssignmentIcon sx={{ mr: 1, color: 'info.main', fontSize: 16 }} />
                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: { xs: '0.75rem', sm: '0.8rem' } }}>
                  In Progress
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', p: 1.5, bgcolor: 'success.light', borderRadius: 2 }}>
                <CheckCircleIcon sx={{ mr: 1, color: 'success.main', fontSize: 16 }} />
                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: { xs: '0.75rem', sm: '0.8rem' } }}>
                  Completed
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* File Management */}
      <Accordion sx={{ mb: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <FileUploadIcon sx={{ mr: 2, color: 'primary.main', fontSize: 20 }} />
            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: { xs: '0.95rem', sm: '1rem' } }}>
              File Management
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body1" sx={{ mb: 2, fontSize: { xs: '0.85rem', sm: '0.9rem' } }}>
            Upload, manage, and organize files for tasks efficiently on your mobile device.
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main', fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                Supported File Types
              </Typography>
              <Box sx={{ pl: 1 }}>
                <Typography variant="body2" sx={{ mb: 1, fontSize: { xs: '0.8rem', sm: '0.85rem' } }}>
                  • <strong>PDF Documents</strong> - PDF files only
                </Typography>
                <Typography variant="body2" sx={{ mb: 1, fontSize: { xs: '0.8rem', sm: '0.85rem' } }}>
                  • <strong>Images</strong> - JPG, PNG, GIF, WEBP, BMP
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main', fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                Mobile File Operations
              </Typography>
              <Box sx={{ pl: 1 }}>
                <Typography variant="body2" sx={{ mb: 1, fontSize: { xs: '0.8rem', sm: '0.85rem' } }}>
                  • <strong>Upload</strong> - Tap to select files from your device
                </Typography>
                <Typography variant="body2" sx={{ mb: 1, fontSize: { xs: '0.8rem', sm: '0.85rem' } }}>
                  • <strong>Download</strong> - Tap download icon to save files
                </Typography>
                <Typography variant="body2" sx={{ mb: 1, fontSize: { xs: '0.8rem', sm: '0.85rem' } }}>
                  • <strong>Preview</strong> - Tap to view files in browser
                </Typography>
                <Typography variant="body2" sx={{ mb: 1, fontSize: { xs: '0.8rem', sm: '0.85rem' } }}>
                  • <strong>Size Limit</strong> - Max 10MB per file
                </Typography>
              </Box>
            </Grid>
          </Grid>
          
          <Alert severity="info" sx={{ mt: 2, fontSize: { xs: '0.75rem', sm: '0.8rem' } }}>
            <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.8rem' } }}>
              <strong>Important:</strong> Only PDF and image files are accepted. When uploading or deleting files, you must provide remarks explaining the changes.
            </Typography>
          </Alert>
        </AccordionDetails>
      </Accordion>

      {/* Comments & Communication */}
      <Accordion sx={{ mb: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CommentIcon sx={{ mr: 2, color: 'primary.main', fontSize: 20 }} />
            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: { xs: '0.95rem', sm: '1rem' } }}>
              Comments & Communication
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body1" sx={{ mb: 2, fontSize: { xs: '0.85rem', sm: '0.9rem' } }}>
            Keep track of progress and communicate effectively with your team through comments and updates.
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main', fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                Adding Comments
              </Typography>
              <Box sx={{ pl: 1 }}>
                <Typography variant="body2" sx={{ mb: 1, fontSize: { xs: '0.8rem', sm: '0.85rem' } }}>
                  1. Open task details
                </Typography>
                <Typography variant="body2" sx={{ mb: 1, fontSize: { xs: '0.8rem', sm: '0.85rem' } }}>
                  2. Scroll to comments section
                </Typography>
                <Typography variant="body2" sx={{ mb: 1, fontSize: { xs: '0.8rem', sm: '0.85rem' } }}>
                  3. Type your comment
                </Typography>
                <Typography variant="body2" sx={{ mb: 1, fontSize: { xs: '0.8rem', sm: '0.85rem' } }}>
                  4. Tap <strong>"Add Comment"</strong>
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Mobile Tips */}
      <Accordion sx={{ mb: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <SettingsIcon sx={{ mr: 2, color: 'primary.main', fontSize: 20 }} />
            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: { xs: '0.95rem', sm: '1rem' } }}>
              Mobile Tips
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body1" sx={{ mb: 2, fontSize: { xs: '0.85rem', sm: '0.9rem' } }}>
            Optimize your mobile experience with these helpful tips.
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main', fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                Mobile Best Practices
              </Typography>
              <Box sx={{ pl: 1 }}>
                <Typography variant="body2" sx={{ mb: 1, fontSize: { xs: '0.8rem', sm: '0.85rem' } }}>
                  • Use landscape mode for better viewing of tables
                </Typography>
                <Typography variant="body2" sx={{ mb: 1, fontSize: { xs: '0.8rem', sm: '0.85rem' } }}>
                  • Tap and hold for additional options
                </Typography>
                <Typography variant="body2" sx={{ mb: 1, fontSize: { xs: '0.8rem', sm: '0.85rem' } }}>
                  • Swipe to navigate between sections
                </Typography>
                <Typography variant="body2" sx={{ mb: 1, fontSize: { xs: '0.8rem', sm: '0.85rem' } }}>
                  • Use the back button to return to previous screens
                </Typography>
                <Typography variant="body2" sx={{ mb: 1, fontSize: { xs: '0.8rem', sm: '0.85rem' } }}>
                  • Enable notifications for important updates
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Support Information */}
      <Accordion sx={{ mb: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <HelpIcon sx={{ mr: 2, color: 'primary.main', fontSize: 20 }} />
            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: { xs: '0.95rem', sm: '1rem' } }}>
              Need Help?
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body1" sx={{ mb: 2, fontSize: { xs: '0.85rem', sm: '0.9rem' } }}>
            If you need additional assistance, please contact your system administrator or IT support team.
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main', fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                Common Mobile Issues
              </Typography>
              <Box sx={{ pl: 1 }}>
                <Typography variant="body2" sx={{ mb: 1, fontSize: { xs: '0.8rem', sm: '0.85rem' } }}>
                  • <strong>Login Problems</strong> - Check credentials or reset password
                </Typography>
                <Typography variant="body2" sx={{ mb: 1, fontSize: { xs: '0.8rem', sm: '0.85rem' } }}>
                  • <strong>File Upload Issues</strong> - Check file size and format
                </Typography>
                <Typography variant="body2" sx={{ mb: 1, fontSize: { xs: '0.8rem', sm: '0.85rem' } }}>
                  • <strong>Performance Issues</strong> - Clear browser cache
                </Typography>
                <Typography variant="body2" sx={{ mb: 1, fontSize: { xs: '0.8rem', sm: '0.85rem' } }}>
                  • <strong>Display Problems</strong> - Try refreshing the page
                </Typography>
              </Box>
            </Grid>
          </Grid>
          
          <Alert severity="success" sx={{ mt: 2, fontSize: { xs: '0.75rem', sm: '0.8rem' } }}>
            <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.8rem' } }}>
              <strong>Thank you for using the Ticketing and Task Management System!</strong> This guide is optimized for mobile devices.
            </Typography>
          </Alert>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default UserGuide;
