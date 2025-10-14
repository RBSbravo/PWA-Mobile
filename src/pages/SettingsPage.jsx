import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Switch,
  FormControlLabel,
  Divider,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Tab,
  Tabs,
  IconButton,
  Avatar,
  InputAdornment,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Security as SecurityIcon,
  Save as SaveIcon,
  Edit as EditIcon,
  Close as CloseIcon,
  Person as PersonIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Lock as LockIcon,
  Help as HelpIcon,
  Dashboard as DashboardIcon,
  Assignment as AssignmentIcon,
  ConfirmationNumber as ConfirmationNumberIcon,
  Analytics as AnalyticsIcon,
  People as PeopleIcon,
  Assessment as AssessmentIcon,
  ViewKanban as ViewKanbanIcon,
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Add as AddIcon,
  Edit as EditIcon2,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  FileUpload as FileUploadIcon,
  Comment as CommentIcon,
  Forward as ForwardIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Speed as SpeedIcon,
  EmojiEvents as TrophyIcon,
  ExpandMore as ExpandMoreIcon,
  PhoneAndroid as MobileIcon,
  Computer as DesktopIcon,
  Tablet as TabletIcon,
  AccessTime as TimeIcon,
  Speed as SpeedIcon2,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useThemeContext } from '../context/ThemeContext';
import PWARateLimitAlert from '../components/RateLimitAlert';
import PasswordStrengthIndicator from '../components/PasswordStrengthIndicator';
import passwordValidator from '../utils/passwordValidator';
import api from '../services/api';
import { handlePWAApiError, pwaRateLimitHandler } from '../utils/rateLimitHandler';
import ScreenHeader from '../components/ScreenHeader';

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ 
          py: 2, 
          px: 1,
          minHeight: '400px',
          width: '100%'
        }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const SettingsPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, token, updateProfile } = useAuth();
  const { isDarkMode, toggleTheme } = useThemeContext();
  
  const [currentTab, setCurrentTab] = useState(0);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [isEditingAccount, setIsEditingAccount] = useState(false);
  const [accountForm, setAccountForm] = useState({
    firstname: user?.firstname || user?.firstName || '',
    lastname: user?.lastname || user?.lastName || '',
    email: user?.email || ''
  });
  const [isSavingAccount, setIsSavingAccount] = useState(false);
  const [accountError, setAccountError] = useState('');

  // Change password state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordRateLimitData, setPasswordRateLimitData] = useState(null);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleAccountFieldChange = (field, value) => {
    setAccountForm(prev => ({ ...prev, [field]: value }));
    if (accountError) setAccountError('');
  };

  const handleAccountEditToggle = () => {
    setIsEditingAccount(true);
  };

  const handleAccountCancel = () => {
    setAccountForm({
      firstname: user?.firstname || user?.firstName || '',
      lastname: user?.lastname || user?.lastName || '',
      email: user?.email || ''
    });
    setIsEditingAccount(false);
    setAccountError('');
  };

  const handleAccountSave = async () => {
    setIsSavingAccount(true);
    setAccountError('');
    try {
      const payload = {
        firstname: (accountForm.firstname || '').trim(),
        lastname: (accountForm.lastname || '').trim(),
        email: (accountForm.email || '').trim()
      };
      await api.updateProfile(token, user.id, payload);
      const updatedUser = { ...user, ...payload };
      await updateProfile(updatedUser);
      setIsEditingAccount(false);
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 3000);
    } catch (e) {
      setAccountError(e.response?.data?.error || 'Failed to update profile');
    } finally {
      setIsSavingAccount(false);
    }
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear errors when user starts typing
    if (passwordErrors[field]) {
      setPasswordErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
    
    // Clear success message when user starts typing
    if (passwordSuccess) {
      setPasswordSuccess(false);
    }
    
    // Clear general error when user starts typing
    if (passwordError) {
      setPasswordError('');
    }
  };

  const validatePasswords = () => {
    const errors = {};
    
    if (!passwordData.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }
    
    if (!passwordData.newPassword) {
      errors.newPassword = 'New password is required';
    } else {
      const passwordValidation = passwordValidator.validate(passwordData.newPassword);
      if (!passwordValidation.isValid) {
        errors.newPassword = passwordValidation.errors[0];
      }
    }
    
    if (!passwordData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your new password';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    if (passwordData.currentPassword === passwordData.newPassword) {
      errors.newPassword = 'New password must be different from current password';
    }
    
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChangePassword = async () => {
    // Check if we can retry (not rate limited)
    if (!pwaRateLimitHandler.canRetry('changePassword')) {
      const remainingTime = pwaRateLimitHandler.getRemainingRetryTime('changePassword');
      setPasswordError(`Please wait ${Math.ceil(remainingTime / 1000)} seconds before trying again.`);
      return;
    }
    
    if (!validatePasswords()) {
      return;
    }
    
    setIsChangingPassword(true);
    setPasswordError('');
    setPasswordRateLimitData(null);
    
    try {
      await api.changePassword(token, passwordData.currentPassword, passwordData.newPassword);
      
      setPasswordSuccess(true);
      pwaRateLimitHandler.clearRetryTimer('changePassword');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setShowPasswords({
        current: false,
        new: false,
        confirm: false,
      });
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setPasswordSuccess(false);
      }, 3000);
      
    } catch (error) {
      const errorInfo = handlePWAApiError(error);
      
      if (errorInfo.type === 'rate_limit') {
        setPasswordRateLimitData(error.rateLimitData || { error: error.message });
        pwaRateLimitHandler.setRetryTimer('changePassword', errorInfo.retryTime);
        setPasswordError(errorInfo.message);
      } else {
        // Map backend errors to user-friendly messages
        let errorMessage = errorInfo.message;
        
        if (errorMessage.toLowerCase().includes('incorrect')) {
          errorMessage = 'Your current password is incorrect.';
        } else if (errorMessage.toLowerCase().includes('at least 6 characters')) {
          errorMessage = 'New password must be at least 6 characters.';
        } else if (errorMessage.toLowerCase().includes('not found')) {
          errorMessage = 'User not found. Please re-login.';
        } else if (errorMessage.toLowerCase().includes('required')) {
          errorMessage = 'Please fill in all password fields.';
        } else if (errorMessage.toLowerCase().includes('server error')) {
          errorMessage = 'A server error occurred. Please try again later.';
        } else if (errorMessage.toLowerCase().includes('same as current')) {
          errorMessage = 'New password must be different from the current password.';
        }
        
        setPasswordError(errorMessage);
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  return (
    <>
      {/* Header */}
      <ScreenHeader
        title="Settings"
        subtitle="Customize your application preferences"
        leftIcon={<SettingsIcon />}
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
          {showSaveSuccess && (
            <Alert severity="success" sx={{ mb: 3 }}>
              Settings saved successfully!
            </Alert>
          )}

          <Card sx={{ minHeight: '500px' }}>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ px: 3, pt: 2 }}>
                <Tabs
                  value={currentTab}
                  onChange={handleTabChange}
                  variant="scrollable"
                  scrollButtons="auto"
                  sx={{
                    borderBottom: 1, 
                    borderColor: 'divider',
                    '& .MuiTab-root': {
                      textTransform: 'uppercase',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      letterSpacing: '0.5px',
                      minHeight: 48,
                      '&.Mui-selected': {
                        color: 'primary.main',
                      }
                    },
                    '& .MuiTabs-indicator': {
                      backgroundColor: 'primary.main',
                      height: 3,
                    }
                  }}
                >
                  <Tab icon={<PersonIcon />} label="Account" />
                  <Tab icon={<SecurityIcon />} label="Security" />
                  <Tab icon={<HelpIcon />} label="User Guide" />
                </Tabs>
              </Box>

              {/* Account Settings */}
              <TabPanel value={currentTab} index={0}>
                <Box sx={{ px: { xs: 2, md: 4 }, py: { xs: 2, md: 3 } }}>
                  <Grid container spacing={4}>
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                        <Avatar
                          sx={{
                            width: 80, 
                            height: 80, 
                            bgcolor: 'primary.main',
                            fontSize: '2rem',
                            mr: 3,
                            fontWeight: 'bold'
                          }}
                        >
                          {user?.firstname?.[0]?.toUpperCase()}{user?.lastname?.[0]?.toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                            {user?.firstname} {user?.lastname}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                            {user?.role}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {user?.email}
                          </Typography>
                        </Box>
                      </Box>
                      <Divider sx={{ my: 4 }} />
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          Account Information
                        </Typography>
                        {!isEditingAccount ? (
                          <Button variant="outlined" onClick={handleAccountEditToggle} startIcon={<EditIcon />}>Edit</Button>
                        ) : (
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button onClick={handleAccountCancel} startIcon={<CloseIcon />}>Cancel</Button>
                            <Button variant="contained" onClick={handleAccountSave} disabled={isSavingAccount} startIcon={<SaveIcon />}>
                              {isSavingAccount ? 'Saving...' : 'Save'}
                            </Button>
                          </Box>
                        )}
                      </Box>
                      {accountError && (
                        <Alert severity="error" sx={{ mb: 2 }}>{accountError}</Alert>
                      )}
                      <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="First Name"
                            value={isEditingAccount ? accountForm.firstname : (user?.firstname || '')}
                            onChange={(e) => handleAccountFieldChange('firstname', e.target.value)}
                            disabled={!isEditingAccount}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Last Name"
                            value={isEditingAccount ? accountForm.lastname : (user?.lastname || '')}
                            onChange={(e) => handleAccountFieldChange('lastname', e.target.value)}
                            disabled={!isEditingAccount}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Email"
                            value={isEditingAccount ? accountForm.email : (user?.email || '')}
                            onChange={(e) => handleAccountFieldChange('email', e.target.value)}
                            disabled={!isEditingAccount}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Role"
                            value={user?.role || ''}
                            disabled
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Department"
                            value={user?.department?.name || user?.department || 'N/A'}
                            disabled
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                          />
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </Box>
              </TabPanel>

              {/* Security Settings */}
              <TabPanel value={currentTab} index={1}>
                <Box sx={{ px: { xs: 2, md: 4 }, py: { xs: 2, md: 3 } }}>
                  <Grid container spacing={4}>
                    <Grid item xs={12}>
                      <Typography variant="h6" gutterBottom>
                        Change Password
                      </Typography>
                      
                      {passwordSuccess && (
                        <Alert severity="success" sx={{ mb: 2 }}>
                          Password changed successfully!
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
                      
                      {passwordError && !passwordRateLimitData && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                          {passwordError}
                        </Alert>
                      )}
                      
                      <TextField
                        fullWidth
                        type={showPasswords.current ? 'text' : 'password'}
                        label="Current Password"
                        variant="outlined"
                        value={passwordData.currentPassword}
                        onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                        error={!!passwordErrors.currentPassword}
                        helperText={passwordErrors.currentPassword}
                        sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LockIcon color="action" />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => togglePasswordVisibility('current')}
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
                        type={showPasswords.new ? 'text' : 'password'}
                        label="New Password"
                        variant="outlined"
                        value={passwordData.newPassword}
                        onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                        error={!!passwordErrors.newPassword}
                        helperText={passwordErrors.newPassword}
                        sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LockIcon color="action" />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => togglePasswordVisibility('new')}
                                edge="end"
                              >
                                {showPasswords.new ? <VisibilityOffIcon /> : <VisibilityIcon />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                      
                      <PasswordStrengthIndicator password={passwordData.newPassword} />
                      
                      <TextField
                        fullWidth
                        type={showPasswords.confirm ? 'text' : 'password'}
                        label="Confirm New Password"
                        variant="outlined"
                        value={passwordData.confirmPassword}
                        onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                        error={!!passwordErrors.confirmPassword}
                        helperText={passwordErrors.confirmPassword}
                        sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LockIcon color="action" />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => togglePasswordVisibility('confirm')}
                                edge="end"
                              >
                                {showPasswords.confirm ? <VisibilityOffIcon /> : <VisibilityIcon />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                      
                      <Button 
                        variant="contained" 
                        color="primary"
                        onClick={handleChangePassword}
                        disabled={isChangingPassword}
                        startIcon={isChangingPassword ? <CircularProgress size={20} /> : <SecurityIcon />}
                      >
                        {isChangingPassword ? 'Changing Password...' : 'Update Password'}
                      </Button>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                        After changing your password, you will be automatically logged out for security purposes.
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </TabPanel>

              {/* User Guide */}
              <TabPanel value={currentTab} index={2}>
                <Box sx={{ px: { xs: 2, md: 4 }, py: { xs: 2, md: 3 } }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: 'primary.main' }}>
                    📚 PWA Mobile App User Guide
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
                              • <strong>Swipe Navigation</strong> - Swipe between screens
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                              • <strong>Pull to Refresh</strong> - Pull down to refresh data
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                              • <strong>Touch Targets</strong> - Large, easy-to-tap buttons
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                              • <strong>Gesture Support</strong> - Native mobile gestures
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
                        <MenuIcon sx={{ mr: 2, color: 'primary.main' }} />
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          Navigation & Layout
                        </Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography variant="body1" sx={{ mb: 3 }}>
                        The mobile app uses a bottom navigation bar and collapsible sidebar for easy navigation.
                      </Typography>
                      
                      <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                            Bottom Navigation
                          </Typography>
                          <Box sx={{ pl: 2 }}>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                              • <strong>Dashboard</strong> - Overview and metrics
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
                              • <strong>Menu Button</strong> - Access sidebar menu
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                              • <strong>Theme Toggle</strong> - Switch light/dark mode
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                              • <strong>Notification Badge</strong> - Unread count indicator
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                              • <strong>User Avatar</strong> - Quick profile access
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
                              • <strong>Long Press</strong> - Quick actions menu
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                              • <strong>Swipe Actions</strong> - Quick edit/delete
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                              • <strong>Status Updates</strong> - Change status easily
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
                              • <strong>Swipe to Delete</strong> - Remove notification
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                              • <strong>Mark as Read</strong> - Clear unread status
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
              </TabPanel>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </>
  );
};

export default SettingsPage;
