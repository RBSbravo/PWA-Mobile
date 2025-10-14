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
  Switch,
  FormControlLabel,
  Alert,
  useTheme,
  useMediaQuery,
  Divider,
  Avatar,
  CircularProgress,
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useThemeContext } from '../context/ThemeContext';
import PWARateLimitAlert from '../components/RateLimitAlert';
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
  const { isDarkMode, toggleTheme } = useThemeContext();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [rateLimitData, setRateLimitData] = useState(null);

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
      await login(formData.email, formData.password);
      pwaRateLimitHandler.clearRetryTimer('login');
      navigate('/dashboard');
    } catch (error) {
      console.log('🔍 Login error details:', {
        error: error,
        message: error.message,
        status: error.response?.status,
        rateLimitData: error.rateLimitData,
        headers: error.response?.headers
      });
      
      const errorInfo = handlePWAApiError(error);
      console.log('🔍 Error info:', errorInfo);
      
      if (errorInfo.type === 'rate_limit') {
        console.log('🚨 Rate limit detected!', errorInfo);
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
            }}
          >
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

              <Button
                variant="text"
                component={Link}
                to="/forgot-password"
                sx={{
                  alignSelf: 'flex-end',
                  mt: -1,
                  mb: 1,
                  textTransform: 'none',
                  fontSize: 13,
                  color: theme.palette.primary.main,
                }}
              >
                Forgot Password?
              </Button>

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

      {/* Theme Toggle */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <Typography variant="body2" sx={{ color: theme.palette.text.primary, fontSize: 14 }}>
          {isDarkMode ? 'Light Mode' : 'Dark Mode'}
        </Typography>
        <Switch
          checked={isDarkMode}
          onChange={toggleTheme}
          color="primary"
        />
      </Box>

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
    </Box>
  );
};

export default LoginPage;