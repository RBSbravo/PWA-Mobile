import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  InputAdornment,
  Alert,
  useTheme,
  useMediaQuery,
  Avatar,
  CircularProgress,
} from '@mui/material';
import {
  Email as EmailIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
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

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { forgotPassword } = useAuth();
  
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [rateLimitData, setRateLimitData] = useState(null);

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    
    // Check if we can retry (not rate limited)
    if (!pwaRateLimitHandler.canRetry('forgotPassword')) {
      const remainingTime = pwaRateLimitHandler.getRemainingRetryTime('forgotPassword');
      setError(`Please wait ${Math.ceil(remainingTime / 1000)} seconds before trying again.`);
      return;
    }
    
    if (!email) {
      setError('Please enter your email address.');
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    setError("");
    setRateLimitData(null);
    
    try {
      await forgotPassword(email);
      setSuccessMessage('Password reset email sent! Please check your inbox and follow the instructions.');
      setSuccess(true);
      pwaRateLimitHandler.clearRetryTimer('forgotPassword');
    } catch (error) {
      const errorInfo = handlePWAApiError(error);
      
      if (errorInfo.type === 'rate_limit') {
        setRateLimitData(error.rateLimitData || { error: error.message });
        pwaRateLimitHandler.setRetryTimer('forgotPassword', errorInfo.retryTime);
        setError(errorInfo.message);
      } else {
        setError(errorInfo.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  if (success) {
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
                Check Your Email
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: theme.palette.text.secondary,
                  fontSize: 14,
                  textAlign: 'center',
                }}
              >
                We've sent password reset instructions to:
              </Typography>
              <Typography
                sx={{
                  color: theme.palette.primary.main,
                  fontWeight: 600,
                  mt: 1,
                  fontSize: 14,
                }}
              >
                {email}
              </Typography>
            </Box>

            {/* Content */}
            <Box sx={{ px: 2.25, pb: 2.5 }}>
              <Typography
                sx={{
                  color: theme.palette.text.secondary,
                  fontSize: 13,
                  textAlign: 'center',
                  mb: 2.5,
                }}
              >
                {successMessage}
              </Typography>
              <Typography
                sx={{
                  color: theme.palette.text.secondary,
                  fontSize: 12,
                  textAlign: 'center',
                  mb: 2.5,
                  fontStyle: 'italic',
                }}
              >
                Note: The reset link will open in your web browser. You can complete the password reset there.
              </Typography>
              
              <Button
                variant="contained"
                fullWidth
                onClick={handleBackToLogin}
                sx={{
                  borderRadius: 3,
                  height: 40,
                  fontSize: 15,
                  fontWeight: 500,
                  textTransform: 'none',
                }}
              >
                Back to Login
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  }

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
              Forgot Password
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: theme.palette.text.secondary,
                fontSize: 14,
                textAlign: 'center',
              }}
            >
              Enter your email address and we'll send you instructions to reset your password.
            </Typography>
            <Typography
              sx={{
                color: theme.palette.text.secondary,
                fontSize: 12,
                textAlign: 'center',
                mt: 1,
                fontStyle: 'italic',
              }}
            >
              The reset link will open in your web browser for security.
            </Typography>
          </Box>

          {/* Form */}
          <Box sx={{ px: 2.25, pb: 2.5 }}>
            <Box component="form" onSubmit={handleForgotPassword} sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                disabled={loading}
                required
              />

              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
                sx={{
                  borderRadius: 3,
                  mt: 1.25,
                  height: 40,
                  fontSize: 15,
                  fontWeight: 500,
                  textTransform: 'none',
                }}
              >
                {loading ? 'Sending...' : 'Send Reset Email'}
              </Button>

              <Button
                variant="text"
                component={Link}
                to="/login"
                sx={{
                  alignSelf: 'center',
                  mt: 1,
                  textTransform: 'none',
                  fontSize: 14,
                  color: theme.palette.primary.main,
                  height: 'auto',
                  minHeight: 32,
                }}
              >
                Back to Login
              </Button>
            </Box>
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
        endpoint="forgotPassword"
        onRetry={() => {
          setRateLimitData(null);
          setError('');
        }}
      />
    </Box>
  );
};

export default ForgotPasswordPage;