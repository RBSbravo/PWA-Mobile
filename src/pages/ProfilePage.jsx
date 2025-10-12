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
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useThemeContext } from '../context/ThemeContext';
import PWARateLimitAlert from '../components/RateLimitAlert';
import api from '../services/api';
import { handlePWAApiError, pwaRateLimitHandler } from '../utils/rateLimitHandler';
import ScreenHeader from '../components/ScreenHeader';

const ProfilePage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, token, logout, updateProfile, logoutLoading } = useAuth();
  const { isDarkMode, toggleTheme } = useThemeContext();
  
  const [loading, setLoading] = useState(false);
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
    }
    if (passwordForm.new.length < 8) {
      return 'Password must be at least 8 characters long.';
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
      </Box>
    </>
  );
};

export default ProfilePage;