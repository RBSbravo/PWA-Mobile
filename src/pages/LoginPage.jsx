import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  IconButton,
  InputAdornment,
  Alert,
  useTheme,
  useMediaQuery,
  Divider,
  Avatar,
  CircularProgress,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Help as HelpIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import PWARateLimitAlert from '../components/RateLimitAlert';
import UserGuide from '../components/UserGuide';
import { handlePWAApiError, pwaRateLimitHandler } from '../utils/rateLimitHandler';

const Logo = () => {
  return (
    <Box
      sx={{
        width: 96,
        height: 96,
        borderRadius: '50%',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        mb: 3,
        alignSelf: 'center',
        backgroundColor: 'primary.main',
        p: 1,
      }}
    >
      <Avatar
        src="/mito_logo.png"
        alt="MITO Logo"
        sx={{
          width: 80,
          height: 80,
          borderRadius: '50%',
        }}
      />
    </Box>
  );
};

const LoginPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { login, loginLoading } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [rateLimitData, setRateLimitData] = useState(null);
  const [userGuideOpen, setUserGuideOpen] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(''); // Clear error when user starts typing
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setError('Please enter both email and password.');
      return;
    }
    
    // Check if we can retry (not rate limited)
    if (!pwaRateLimitHandler.canRetry('login')) {
      const remainingTime = pwaRateLimitHandler.getRemainingRetryTime('login');
      setError(`Please wait ${Math.ceil(remainingTime / 1000)} seconds before trying again.`);
      return;
    }
    
    try {
      await login(formData.email, formData.password, formData.rememberMe);
      pwaRateLimitHandler.clearRetryTimer('login');
      navigate('/dashboard');
    } catch (error) {
      const errorInfo = handlePWAApiError(error);
      
      if (errorInfo.type === 'rate_limit') {
        setRateLimitData(error.rateLimitData || { error: error.message });
        pwaRateLimitHandler.setRetryTimer('login', errorInfo.retryTime);
        setError(errorInfo.message);
      } else {
        setError(errorInfo.message);
      }
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: theme.palette.background.default,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: { xs: 2, sm: 3, md: 4 },
      }}
    >
      <Card
        sx={{
          width: '100%',
          maxWidth: { xs: '100%', sm: 450, md: 500 },
          borderRadius: theme.shape.borderRadius * 2.5,
          boxShadow: theme.shadows[4],
          backgroundColor: theme.palette.surface,
          border: theme.palette.mode === 'dark' ? `1px solid ${theme.palette.border}` : 'none',
        }}
      >
        <CardContent sx={{ p: 0 }}>
          {/* Logo and Header */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              mb: 2.25,
              px: 2.25,
              pt: 2.5,
              position: 'relative',
            }}
          >
            {/* User Guide Button - Top Right */}
            <IconButton
              onClick={() => setUserGuideOpen(true)}
              sx={{
                position: 'absolute',
                top: 16,
                right: 16,
                backgroundColor: theme.palette.mode === 'dark' 
                  ? 'rgba(255,255,255,0.1)' 
                  : 'rgba(0,0,0,0.04)',
                '&:hover': {
                  backgroundColor: theme.palette.mode === 'dark' 
                    ? 'rgba(255,255,255,0.2)' 
                    : 'rgba(0,0,0,0.08)',
                },
                zIndex: 1,
                width: 40,
                height: 40,
              }}
              size="small"
              title="User Guide"
            >
              <HelpIcon sx={{ color: 'primary.main', fontSize: 20 }} />
            </IconButton>

            <Logo />
            <Typography
              variant="h4"
              component="h1"
              sx={{
                color: theme.palette.primary.main,
                fontWeight: 'bold',
                fontSize: 24,
                mb: 0.5,
              }}
            >
              Welcome Back
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: theme.palette.text.secondary,
                fontSize: 14,
              }}
            >
              Sign in to continue
            </Typography>
          </Box>

          {/* Form */}
          <Box sx={{ px: 2.25, pb: 1 }}>
            <Box component="form" onSubmit={handleLogin} sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    backgroundColor: theme.palette.background.default,
                    fontSize: 15,
                    height: 40,
                  },
                }}
                placeholder="Enter your email"
                autoComplete="email"
                required
              />

              <TextField
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="primary" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        size="small"
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    backgroundColor: theme.palette.background.default,
                    fontSize: 15,
                    height: 40,
                  },
                }}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: -1, mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Checkbox
                    checked={formData.rememberMe}
                    onChange={(e) => handleInputChange('rememberMe', e.target.checked)}
                    color="primary"
                    size="small"
                  />
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                    Remember me
                  </Typography>
                </Box>
                <Button
                  variant="text"
                  component={Link}
                  to="/forgot-password"
                  sx={{
                    textTransform: 'none',
                    fontSize: 13,
                    color: theme.palette.primary.main,
                  }}
                >
                  Forgot Password?
                </Button>
              </Box>

              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loginLoading}
                startIcon={loginLoading ? <CircularProgress size={20} color="inherit" /> : null}
                sx={{
                  borderRadius: 3,
                  mt: 1.25,
                  height: 40,
                  fontSize: 15,
                  fontWeight: 500,
                  textTransform: 'none',
                }}
              >
                {loginLoading ? 'Signing in...' : 'Login'}
              </Button>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Button
              variant="text"
              component={Link}
              to="/register"
              fullWidth
              sx={{
                textTransform: 'none',
                fontSize: 14,
                color: theme.palette.primary.main,
                mb: 1.5,
                height: 'auto',
                minHeight: 32,
              }}
            >
              Don't have an account? Register
            </Button>
          </Box>
        </CardContent>
      </Card>


      {/* Error Alert */}
      {error && !rateLimitData && (
        <Alert
          severity="error"
          sx={{
            position: 'fixed',
            top: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            maxWidth: 400,
            width: '90%',
            zIndex: theme.zIndex.snackbar,
          }}
          onClose={() => setError('')}
        >
          {error}
        </Alert>
      )}

      {/* Rate Limit Alert */}
      <PWARateLimitAlert
        isOpen={!!rateLimitData}
        onClose={() => setRateLimitData(null)}
        rateLimitData={rateLimitData}
        endpoint="login"
        onRetry={() => {
          setRateLimitData(null);
          setError('');
        }}
      />

      {/* User Guide Modal */}
      <Dialog
        open={userGuideOpen}
        onClose={() => setUserGuideOpen(false)}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            maxHeight: '90vh',
            borderRadius: isMobile ? 0 : 2,
            backgroundColor: theme.palette.background.paper,
            m: isMobile ? 0 : 2,
          }
        }}
      >
        <DialogTitle sx={{ 
          pb: 1, 
          fontWeight: 600,
          color: theme.palette.text.primary,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: { xs: 2, sm: 3 },
          py: { xs: 2, sm: 2.5 }
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <HelpIcon sx={{ mr: 1, color: 'primary.main', fontSize: 20 }} />
            <Typography variant="h6" sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
              User Guide
            </Typography>
          </Box>
          <IconButton
            onClick={() => setUserGuideOpen(false)}
            size="small"
            sx={{ color: theme.palette.text.secondary }}
          >
            <CloseIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0, overflow: 'auto' }}>
          <UserGuide />
        </DialogContent>
        {!isMobile && (
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button 
              onClick={() => setUserGuideOpen(false)}
              variant="contained"
              sx={{ textTransform: 'none' }}
            >
              Close
            </Button>
          </DialogActions>
        )}
      </Dialog>
    </Box>
  );
};

export default LoginPage;