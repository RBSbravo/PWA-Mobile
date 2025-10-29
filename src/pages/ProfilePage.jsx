import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  CircularProgress,
  Alert,
  IconButton,
  InputAdornment,
  useTheme,
  useMediaQuery,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Grid,
} from '@mui/material';
import {
  Email as EmailIcon,
  Business as BusinessIcon,
  Edit as EditIcon,
  Logout as LogoutIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Person as PersonIcon,
  Help as HelpIcon,
  ExpandMore as ExpandMoreIcon,
  PhoneAndroid as MobileIcon,
  Speed as SpeedIcon,
  Assignment as AssignmentIcon,
  Notifications as NotificationsIcon,
  Star as StarIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useThemeContext } from '../context/ThemeContext';
import PWARateLimitAlert from '../components/RateLimitAlert';
import PasswordStrengthIndicator from '../components/PasswordStrengthIndicator';
import passwordValidator from '../utils/passwordValidator';
import api from '../services/api';
import { handlePWAApiError, pwaRateLimitHandler } from '../utils/rateLimitHandler';
import ScreenHeader from '../components/ScreenHeader';
import SkeletonLoader from '../components/SkeletonLoader';

const ProfilePage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, token, logout, updateProfile, logoutLoading } = useAuth();
  const { isDarkMode, toggleTheme } = useThemeContext();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Edit Profile Dialog
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [editForm, setEditForm] = useState({ firstname: '', lastname: '', email: '' });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');
  
  // Change Password Dialog
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
  const [passwordRateLimitData, setPasswordRateLimitData] = useState(null);
  
  // Logout Dialog
  const [logoutOpen, setLogoutOpen] = useState(false);
  
  // User Guide Dialog
  const [userGuideOpen, setUserGuideOpen] = useState(false);

  // Simulate loading user data
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000); // 1 second loading simulation

    return () => clearTimeout(timer);
  }, []);

  const handleEditProfile = () => {
    setEditForm({
      firstname: user?.firstname || user?.firstName || '',
      lastname: user?.lastname || user?.lastName || '',
      email: user?.email || ''
    });
    setEditError('');
    setEditSuccess('');
    setEditProfileOpen(true);
  };

  const validateEditForm = () => {
    if (!editForm.firstname?.trim()) {
      return 'First name is required.';
    }
    if (!editForm.lastname?.trim()) {
      return 'Last name is required.';
    }
    if (!editForm.email?.trim()) {
      return 'Email is required.';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editForm.email)) {
      return 'Please enter a valid email address.';
    }
    return null;
  };

  const handleUpdateProfile = async () => {
    setEditError('');
    setEditSuccess('');
    
    const validationError = validateEditForm();
    if (validationError) {
      setEditError(validationError);
      return;
    }

    setEditLoading(true);
    try {
      await api.updateProfile(token, user.id, {
        firstname: editForm.firstname.trim(),
        lastname: editForm.lastname.trim(),
        email: editForm.email.trim()
      });
      
      await updateProfile({
        ...user,
        firstname: editForm.firstname.trim(),
        lastName: editForm.lastname.trim(),
        email: editForm.email.trim()
      });
      
      setEditSuccess('Profile updated successfully!');
      setTimeout(() => {
        setEditProfileOpen(false);
        setEditSuccess('');
      }, 2000);
    } catch (err) {
      setEditError(err?.response?.data?.message || err?.message || 'Failed to update profile.');
    } finally {
      setEditLoading(false);
    }
  };

  const validatePasswordForm = () => {
    if (!passwordForm.current) {
      return 'Current password is required.';
    }
    if (!passwordForm.new) {
      return 'New password is required.';
    } else {
      const passwordValidation = passwordValidator.validate(passwordForm.new);
      if (!passwordValidation.isValid) {
        return passwordValidation.errors[0]; // Show first error
      }
    }
    if (!passwordForm.confirm) {
      return 'Please confirm your new password.';
    }
    if (passwordForm.new !== passwordForm.confirm) {
      return 'New passwords do not match.';
    }
    if (passwordForm.current === passwordForm.new) {
      return 'New password must be different from current password.';
    }
    return null;
  };

  const handleChangePassword = async () => {
    // Check if we can retry (not rate limited)
    if (!pwaRateLimitHandler.canRetry('changePassword')) {
      const remainingTime = pwaRateLimitHandler.getRemainingRetryTime('changePassword');
      setPasswordError(`Please wait ${Math.ceil(remainingTime / 1000)} seconds before trying again.`);
      return;
    }
    
    setPasswordError('');
    setPasswordSuccess('');
    setPasswordRateLimitData(null);
    
    const validationError = validatePasswordForm();
    if (validationError) {
      setPasswordError(validationError);
      return;
    }

    setPasswordLoading(true);
    try {
      await api.changePassword(token, passwordForm.current, passwordForm.new);
      setPasswordSuccess('Password changed successfully! You will be logged out for security.');
      pwaRateLimitHandler.clearRetryTimer('changePassword');
      setPasswordForm({ current: '', new: '', confirm: '' });
      setShowPasswords({ current: false, new: false, confirm: false });
      
      setTimeout(() => {
        setPasswordSuccess('');
        setChangePasswordOpen(false);
        logout();
      }, 2000);
    } catch (err) {
      const errorInfo = handlePWAApiError(err);
      
      if (errorInfo.type === 'rate_limit') {
        setPasswordRateLimitData(err.rateLimitData || { error: err.message });
        pwaRateLimitHandler.setRetryTimer('changePassword', errorInfo.retryTime);
        setPasswordError(errorInfo.message);
      } else {
        setPasswordError(errorInfo.message);
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleLogout = async () => {
    setLogoutOpen(false);
    logout();
  };

  if (loading) {
    return (
      <>
        <ScreenHeader
          title="Profile"
          subtitle="Loading..."
          leftIcon={
            <Avatar
              sx={{
                width: 40,
                height: 40,
                bgcolor: theme.palette.primary.main,
                fontSize: 20,
                fontWeight: 'bold',
              }}
            >
              U
            </Avatar>
          }
        />
        <Box sx={{ 
          backgroundColor: theme.palette.background.default, 
          minHeight: '100vh',
          width: '100%',
          pt: '80px', // Add top padding for fixed header
        }}>
          <SkeletonLoader type="profile" />
        </Box>
      </>
    );
  }

  return (
    <>
      {/* Header */}
      <ScreenHeader
        title={`${user?.firstname || user?.firstName || ''} ${user?.lastname || user?.lastName || ''}`}
        subtitle={user?.email || ''}
        leftIcon={
          <Avatar
            sx={{
              width: 40,
              height: 40,
              bgcolor: theme.palette.primary.main,
              fontSize: 20,
              fontWeight: 'bold',
            }}
          >
            {(user?.firstname || user?.firstName) ? (user?.firstname || user?.firstName).charAt(0).toUpperCase() : 'U'}
          </Avatar>
        }
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

        {/* Profile Information */}
      <Box sx={{ mb: 4 }}>
        <Card sx={{ 
          backgroundColor: theme.palette.surface,
          border: theme.palette.mode === 'dark' ? `1px solid ${theme.palette.border}` : 'none',
          borderRadius: theme.shape.borderRadius * 2,
        }}>
          <CardContent>
            <List>
              <ListItem>
                <ListItemIcon>
                  <EmailIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Email" 
                  secondary={user?.email || 'Not set'}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <BusinessIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Department" 
                  secondary={user?.department || user?.departmentId || 'Not set'}
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </Box>

      {/* Action Buttons */}
      <Box sx={{ mb: 4 }}>
        <Button
          fullWidth
          variant="contained"
          startIcon={<EditIcon />}
          onClick={handleEditProfile}
          sx={{
            mb: 2,
            borderRadius: theme.shape.borderRadius * 2,
            textTransform: 'none',
            fontWeight: 500,
          }}
        >
          Edit Profile
        </Button>
        
        <Button
          fullWidth
          variant="outlined"
          startIcon={<LockIcon />}
          onClick={() => setChangePasswordOpen(true)}
          sx={{
            mb: 2,
            borderRadius: theme.shape.borderRadius * 2,
            textTransform: 'none',
            fontWeight: 500,
            borderColor: theme.palette.primary.main,
            color: theme.palette.primary.main,
            '&:hover': {
              borderColor: theme.palette.primary.dark,
              backgroundColor: theme.palette.primary.main + '10',
            },
          }}
        >
          Change Password
        </Button>
        
        <Button
          fullWidth
          variant="outlined"
          startIcon={<HelpIcon />}
          onClick={() => setUserGuideOpen(true)}
          sx={{
            mb: 2,
            borderRadius: theme.shape.borderRadius * 2,
            textTransform: 'none',
            fontWeight: 500,
            borderColor: theme.palette.info.main,
            color: theme.palette.info.main,
            '&:hover': {
              borderColor: theme.palette.info.dark,
              backgroundColor: theme.palette.info.main + '10',
            },
          }}
        >
          User Guide
        </Button>
        
        <Button
          fullWidth
          variant="outlined"
          startIcon={<LogoutIcon />}
          onClick={() => setLogoutOpen(true)}
          disabled={logoutLoading}
          sx={{
            mb: 2,
            borderRadius: theme.shape.borderRadius * 2,
            textTransform: 'none',
            fontWeight: 500,
            borderColor: theme.palette.error.main,
            color: theme.palette.error.main,
            '&:hover': {
              borderColor: theme.palette.error.dark,
              backgroundColor: theme.palette.error.main + '10',
            },
          }}
        >
          {logoutLoading ? 'Logging out...' : 'Logout'}
        </Button>
      </Box>

      {/* Theme Toggle */}
      <Box sx={{ mb: 4 }}>
        <Card sx={{ 
          backgroundColor: theme.palette.surface,
          border: theme.palette.mode === 'dark' ? `1px solid ${theme.palette.border}` : 'none',
          borderRadius: theme.shape.borderRadius * 2,
        }}>
          <CardContent>
            <FormControlLabel
              control={
                <Switch
                  checked={isDarkMode}
                  onChange={toggleTheme}
                  color="primary"
                />
              }
              label="Dark Mode"
              sx={{
                '& .MuiFormControlLabel-label': {
                  fontWeight: 500,
                },
              }}
            />
          </CardContent>
        </Card>
      </Box>
      </Box>

      {/* Edit Profile Dialog */}
      <Dialog 
        open={editProfileOpen} 
        onClose={() => setEditProfileOpen(false)} 
        maxWidth="sm" 
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
          Edit Profile
        </DialogTitle>
        <DialogContent sx={{
          backgroundColor: theme.palette.background.paper
        }}>
          <TextField
            fullWidth
            label="First Name"
            value={editForm.firstname}
            onChange={(e) => setEditForm(prev => ({ ...prev, firstname: e.target.value }))}
            margin="normal"
            disabled={editLoading}
            sx={{ borderRadius: theme.shape.borderRadius * 2 }}
          />
          <TextField
            fullWidth
            label="Last Name"
            value={editForm.lastname}
            onChange={(e) => setEditForm(prev => ({ ...prev, lastname: e.target.value }))}
            margin="normal"
            disabled={editLoading}
            sx={{ borderRadius: theme.shape.borderRadius * 2 }}
          />
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={editForm.email}
            onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
            margin="normal"
            disabled={editLoading}
            sx={{ borderRadius: theme.shape.borderRadius * 2 }}
          />
          {editError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {editError}
            </Alert>
          )}
          {editSuccess && (
            <Alert severity="success" sx={{ mt: 2 }}>
              {editSuccess}
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{
          backgroundColor: theme.palette.background.paper,
          borderTop: `1px solid ${theme.palette.divider}`,
        }}>
          <Button onClick={() => setEditProfileOpen(false)} disabled={editLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleUpdateProfile} 
            variant="contained"
            disabled={editLoading}
            startIcon={editLoading ? <CircularProgress size={20} /> : null}
          >
            {editLoading ? 'Updating...' : 'Update Profile'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog 
        open={changePasswordOpen} 
        onClose={() => setChangePasswordOpen(false)} 
        maxWidth="sm" 
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
          Change Password
        </DialogTitle>
        <DialogContent sx={{
          backgroundColor: theme.palette.background.paper
        }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Enter your current password and choose a new password. You will be logged out after the change for security.
          </Typography>
          
          <TextField
            fullWidth
            label="Current Password"
            type={showPasswords.current ? 'text' : 'password'}
            value={passwordForm.current}
            onChange={(e) => setPasswordForm(prev => ({ ...prev, current: e.target.value }))}
            margin="normal"
            disabled={passwordLoading}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                    edge="end"
                  >
                    {showPasswords.current ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          
          <TextField
            fullWidth
            label="New Password"
            type={showPasswords.new ? 'text' : 'password'}
            value={passwordForm.new}
            onChange={(e) => setPasswordForm(prev => ({ ...prev, new: e.target.value }))}
            margin="normal"
            disabled={passwordLoading}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                    edge="end"
                  >
                    {showPasswords.new ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          
          <PasswordStrengthIndicator password={passwordForm.new} />
          
          <TextField
            fullWidth
            label="Confirm New Password"
            type={showPasswords.confirm ? 'text' : 'password'}
            value={passwordForm.confirm}
            onChange={(e) => setPasswordForm(prev => ({ ...prev, confirm: e.target.value }))}
            margin="normal"
            disabled={passwordLoading}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                    edge="end"
                  >
                    {showPasswords.confirm ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          
          {passwordError && !passwordRateLimitData && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {passwordError}
            </Alert>
          )}
          {passwordSuccess && (
            <Alert severity="success" sx={{ mt: 2 }}>
              {passwordSuccess}
            </Alert>
          )}

          <PWARateLimitAlert
            isOpen={!!passwordRateLimitData}
            onClose={() => setPasswordRateLimitData(null)}
            rateLimitData={passwordRateLimitData}
            endpoint="changePassword"
            onRetry={() => {
              setPasswordRateLimitData(null);
              setPasswordError('');
            }}
          />
        </DialogContent>
        <DialogActions sx={{
          backgroundColor: theme.palette.background.paper,
          borderTop: `1px solid ${theme.palette.divider}`,
        }}>
          <Button onClick={() => setChangePasswordOpen(false)} disabled={passwordLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleChangePassword} 
            variant="contained"
            disabled={passwordLoading}
            startIcon={passwordLoading ? <CircularProgress size={20} /> : null}
          >
            {passwordLoading ? 'Changing...' : 'Change Password'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Logout Dialog */}
      <Dialog 
        open={logoutOpen} 
        onClose={() => setLogoutOpen(false)}
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
          Logout
        </DialogTitle>
        <DialogContent sx={{
          backgroundColor: theme.palette.background.paper
        }}>
          <Typography>Are you sure you want to logout?</Typography>
        </DialogContent>
        <DialogActions sx={{
          backgroundColor: theme.palette.background.paper,
          borderTop: `1px solid ${theme.palette.divider}`,
        }}>
          <Button onClick={() => setLogoutOpen(false)} disabled={logoutLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleLogout} 
            variant="contained" 
            color="error"
            disabled={logoutLoading}
            startIcon={logoutLoading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {logoutLoading ? 'Logging out...' : 'Logout'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* User Guide Dialog */}
      <Dialog 
        open={userGuideOpen} 
        onClose={() => setUserGuideOpen(false)} 
        maxWidth="md" 
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            backgroundColor: theme.palette.background.paper,
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
          fontWeight: 600
        }}>
          <HelpIcon />
          PWA Mobile App User Guide
        </DialogTitle>
        <DialogContent sx={{ 
          p: 0,
          backgroundColor: theme.palette.background.paper
        }}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: 'primary.main' }}>
              📱 Mobile App Guide
            </Typography>
            
            <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary', fontSize: '1.1rem' }}>
              Welcome to the  Mobile Task Management Application! This comprehensive guide will help you navigate and utilize all features effectively on your mobile device.
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
                  The  Mobile Task Management Application is designed for efficient task management on mobile devices. Here's how to get started:
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
        </DialogContent>
        <DialogActions sx={{
          backgroundColor: theme.palette.background.paper,
          borderTop: `1px solid ${theme.palette.divider}`,
        }}>
          <Button onClick={() => setUserGuideOpen(false)} variant="contained">
            Close Guide
          </Button>
        </DialogActions>
      </Dialog>
      </Box>
    </>
  );
};

export default ProfilePage;