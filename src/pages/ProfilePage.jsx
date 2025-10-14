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
        
        {/* Test Rate Limiting Button - Remove in production */}
        <Button
          fullWidth
          variant="outlined"
          onClick={async () => {
            try {
              // Try to trigger rate limiting by making multiple rapid requests
              for (let i = 0; i < 10; i++) {
                await api.login('test@example.com', 'wrongpassword');
              }
            } catch (error) {
              console.log('Rate limit test error:', error);
              const errorInfo = handlePWAApiError(error);
              if (errorInfo.type === 'rate_limit') {
                setPasswordRateLimitData(error.rateLimitData || { error: error.message });
                setPasswordError(errorInfo.message);
              }
            }
          }}
          sx={{
            mb: 2,
            borderRadius: theme.shape.borderRadius * 2,
            textTransform: 'none',
            fontWeight: 500,
            borderColor: theme.palette.warning.main,
            color: theme.palette.warning.main,
            '&:hover': {
              borderColor: theme.palette.warning.dark,
              backgroundColor: theme.palette.warning.main + '10',
            },
          }}
        >
          Test Rate Limiting
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
      <Dialog open={editProfileOpen} onClose={() => setEditProfileOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
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
        <DialogActions>
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
      <Dialog open={changePasswordOpen} onClose={() => setChangePasswordOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
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
        <DialogActions>
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
      <Dialog open={logoutOpen} onClose={() => setLogoutOpen(false)}>
        <DialogTitle>Logout</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to logout?</Typography>
        </DialogContent>
        <DialogActions>
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
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          backgroundColor: theme.palette.primary.main,
          color: 'white',
          fontWeight: 600
        }}>
          <HelpIcon />
          PWA Mobile App User Guide
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: 'primary.main' }}>
              📱 PWA Mobile App Guide
            </Typography>
            
            <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary', fontSize: '1.1rem' }}>
              Welcome to the PWA Mobile Ticketing and Task Management System! This guide will help you navigate and utilize all the features effectively on your mobile device.
            </Typography>

            {/* Rate Limiting Guide */}
            <Accordion sx={{ mb: 3 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <SpeedIcon sx={{ mr: 2, color: 'warning.main' }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Rate Limiting & Performance
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body1" sx={{ mb: 3 }}>
                  Our system implements rate limiting to ensure fair usage and optimal performance for all users.
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
                      Rate Limit Types
                    </Typography>
                    <Box sx={{ pl: 2 }}>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        • <strong>Login Attempts</strong> - 5 attempts per 15 minutes
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        • <strong>Password Changes</strong> - 3 attempts per hour
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        • <strong>API Requests</strong> - 100 requests per minute
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        • <strong>File Uploads</strong> - 10 uploads per 5 minutes
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        • <strong>Comment Creation</strong> - 20 comments per 10 minutes
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

            {/* Mobile-Specific Features */}
            <Accordion sx={{ mb: 3 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <MobileIcon sx={{ mr: 2, color: 'primary.main' }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Mobile-Specific Features
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body1" sx={{ mb: 3 }}>
                  The PWA mobile app is optimized for mobile devices with touch-friendly interfaces and responsive design.
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                      Touch Interface
                    </Typography>
                    <Box sx={{ pl: 2 }}>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        • <strong>Bottom Navigation</strong> - Easy thumb navigation
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        • <strong>Pull to Refresh</strong> - Pull down to refresh data
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        • <strong>Touch Targets</strong> - Large, easy-to-tap buttons
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        • <strong>Swipe Actions</strong> - Swipe for quick actions
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                      Offline Support
                    </Typography>
                    <Box sx={{ pl: 2 }}>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        • <strong>Offline Mode</strong> - Works without internet
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        • <strong>Auto Sync</strong> - Syncs when connection restored
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        • <strong>Local Storage</strong> - Caches data locally
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        • <strong>Queue Actions</strong> - Queues actions for later sync
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>

            {/* Navigation Guide */}
            <Accordion sx={{ mb: 3 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <PersonIcon sx={{ mr: 2, color: 'primary.main' }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Navigation & Layout
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body1" sx={{ mb: 3 }}>
                  The mobile app uses a bottom navigation bar for easy navigation between main sections.
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                      Bottom Navigation
                    </Typography>
                    <Box sx={{ pl: 2 }}>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        • <strong>Home</strong> - Dashboard and overview
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        • <strong>Tasks</strong> - Task management
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        • <strong>Notifications</strong> - System notifications
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        • <strong>Profile</strong> - User profile and settings
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                      Header Features
                    </Typography>
                    <Box sx={{ pl: 2 }}>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        • <strong>Screen Title</strong> - Current page information
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        • <strong>User Avatar</strong> - Quick profile access
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        • <strong>Theme Toggle</strong> - Switch light/dark mode
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        • <strong>Notification Badge</strong> - Unread count indicator
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>

            {/* Task Management Guide */}
            <Accordion sx={{ mb: 3 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AssignmentIcon sx={{ mr: 2, color: 'primary.main' }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Task Management
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body1" sx={{ mb: 3 }}>
                  Create, manage, and track tasks efficiently with mobile-optimized interfaces.
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                      Creating Tasks
                    </Typography>
                    <Box sx={{ pl: 2 }}>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        1. Tap the <strong>"+"</strong> button
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        2. Fill in task details
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        3. Assign to team members
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        4. Set due date and priority
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        5. Tap <strong>"Create"</strong>
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                      Task Actions
                    </Typography>
                    <Box sx={{ pl: 2 }}>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        • <strong>Tap to View</strong> - See full details
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        • <strong>Status Updates</strong> - Change status easily
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        • <strong>Comments</strong> - Add progress updates
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        • <strong>File Attachments</strong> - Upload supporting files
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
            <Accordion sx={{ mb: 3 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <NotificationsIcon sx={{ mr: 2, color: 'primary.main' }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Notifications
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
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
                        • <strong>Comments</strong> - New comments on tasks
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        • <strong>File Uploads</strong> - New file attachments
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        • <strong>Status Updates</strong> - Task status changes
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                      Notification Actions
                    </Typography>
                    <Box sx={{ pl: 2 }}>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        • <strong>Tap to View</strong> - Open related task
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        • <strong>Mark as Read</strong> - Clear unread status
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        • <strong>Delete</strong> - Remove notification
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        • <strong>Mark All Read</strong> - Clear all notifications
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>

            {/* Tips & Best Practices */}
            <Accordion sx={{ mb: 3 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <StarIcon sx={{ mr: 2, color: 'primary.main' }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Tips & Best Practices
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                      Mobile Optimization
                    </Typography>
                    <Box sx={{ pl: 2 }}>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        • Use landscape mode for better viewing
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        • Enable notifications for important updates
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        • Use dark mode to save battery
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        • Keep the app updated for best performance
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                      Performance Tips
                    </Typography>
                    <Box sx={{ pl: 2 }}>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        • Close unused browser tabs
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        • Use Wi-Fi for large file uploads
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        • Clear browser cache regularly
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        • Restart the app if it becomes slow
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>

            {/* Support Information */}
            <Accordion sx={{ mb: 3 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <HelpIcon sx={{ mr: 2, color: 'primary.main' }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Need Help?
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
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
                        • <strong>App Not Loading</strong> - Check internet connection
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        • <strong>Slow Performance</strong> - Clear browser cache
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        • <strong>Notifications Not Working</strong> - Check browser permissions
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        • <strong>Login Issues</strong> - Verify credentials
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                      Contact Information
                    </Typography>
                    <Box sx={{ pl: 2 }}>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        • <strong>IT Support</strong> - For technical issues
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        • <strong>Department Head</strong> - For workflow questions
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        • <strong>System Admin</strong> - For account issues
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        • <strong>User Guide</strong> - This comprehensive guide
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
                
                <Alert severity="success" sx={{ mt: 3 }}>
                  <Typography variant="body2">
                    <strong>Thank you for using the PWA Mobile Ticketing and Task Management System!</strong> This guide is regularly updated to reflect new features and improvements.
                  </Typography>
                </Alert>
              </AccordionDetails>
            </Accordion>
          </Box>
        </DialogContent>
        <DialogActions>
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