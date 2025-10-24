import React, { useState, useEffect } from 'react';
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
  FormHelperText,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import PWARateLimitAlert from '../components/RateLimitAlert';
import PasswordStrengthIndicator from '../components/PasswordStrengthIndicator';
import passwordValidator from '../utils/passwordValidator';
import api from '../services/api';
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

const RegisterPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { register } = useAuth();
  
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    confirmPassword: '',
    departmentId: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rateLimitData, setRateLimitData] = useState(null);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const data = await api.getDepartments();
        setDepartments(data);
        setError('');
      } catch (error) {
        setError('Failed to load departments: ' + (error.message || error.toString()));
      }
    };
    fetchDepartments();
  }, []);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstname.trim()) {
      newErrors.firstname = 'First name is required';
    } else if (formData.firstname.length < 1 || formData.firstname.length > 50) {
      newErrors.firstname = 'First name must be between 1 and 50 characters';
    }

    if (!formData.lastname.trim()) {
      newErrors.lastname = 'Last name is required';
    } else if (formData.lastname.length < 1 || formData.lastname.length > 50) {
      newErrors.lastname = 'Last name must be between 1 and 50 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else {
      const passwordValidation = passwordValidator.validate(formData.password);
      if (!passwordValidation.isValid) {
        newErrors.password = passwordValidation.errors[0]; // Show first error
      }
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.departmentId) {
      newErrors.departmentId = 'Department is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    // Check if we can retry (not rate limited)
    if (!pwaRateLimitHandler.canRetry('register')) {
      const remainingTime = pwaRateLimitHandler.getRemainingRetryTime('register');
      setError(`Please wait ${Math.ceil(remainingTime / 1000)} seconds before trying again.`);
      return;
    }
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError('');
    setRateLimitData(null);
    
    try {
      const registrationData = {
        firstname: formData.firstname.trim(),
        lastname: formData.lastname.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        role: 'employee',
        departmentId: formData.departmentId
      };
      
      await register(registrationData);
      
      setFormData({ firstname: '', lastname: '', email: '', password: '', confirmPassword: '', departmentId: '' });
      setError('');
      setErrors({});
      setSuccess(true);
      pwaRateLimitHandler.clearRetryTimer('register');
      
      setTimeout(() => {
        setSuccess(false);
        setLoading(false);
        navigate('/login');
      }, 1500);
      
    } catch (error) {
      const errorInfo = handlePWAApiError(error);
      
      if (errorInfo.type === 'rate_limit') {
        setRateLimitData(error.rateLimitData || { error: error.message });
        pwaRateLimitHandler.setRetryTimer('register', errorInfo.retryTime);
        setError(errorInfo.message);
      } else {
        setError(errorInfo.message);
      }
      setLoading(false);
    }
  };



  if (loading && success) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          backgroundColor: theme.palette.background.default,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress size={60} />
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
          maxWidth: { xs: '100%', sm: 500, md: 600 },
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
              Create Account
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: theme.palette.text.secondary,
                fontSize: 14,
              }}
            >
              Get started with your new account
            </Typography>
          </Box>

          {/* Form */}
          <Box sx={{ px: 2.25, pb: 1 }}>
            <Box component="form" onSubmit={handleRegister} sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <TextField
                fullWidth
                label="First Name"
                value={formData.firstname}
                onChange={(e) => handleInputChange('firstname', e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
                error={!!errors.firstname}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    backgroundColor: theme.palette.background.default,
                    fontSize: 15,
                    height: 40,
                  },
                }}
                required
              />
              {errors.firstname && <FormHelperText error>{errors.firstname}</FormHelperText>}

              <TextField
                fullWidth
                label="Last Name"
                value={formData.lastname}
                onChange={(e) => handleInputChange('lastname', e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
                error={!!errors.lastname}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    backgroundColor: theme.palette.background.default,
                    fontSize: 15,
                    height: 40,
                  },
                }}
                required
              />
              {errors.lastname && <FormHelperText error>{errors.lastname}</FormHelperText>}

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
                error={!!errors.email}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    backgroundColor: theme.palette.background.default,
                    fontSize: 15,
                    height: 40,
                  },
                }}
                autoComplete="email"
                required
              />
              {errors.email && <FormHelperText error>{errors.email}</FormHelperText>}

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
                error={!!errors.password}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    backgroundColor: theme.palette.background.default,
                    fontSize: 15,
                    height: 40,
                  },
                }}
                autoComplete="new-password"
                required
              />
              {errors.password && <FormHelperText error>{errors.password}</FormHelperText>}
              <PasswordStrengthIndicator password={formData.password} />

              <TextField
                fullWidth
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="primary" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                        size="small"
                      >
                        {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                error={!!errors.confirmPassword}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    backgroundColor: theme.palette.background.default,
                    fontSize: 15,
                    height: 40,
                  },
                }}
                autoComplete="new-password"
                required
              />
              {errors.confirmPassword && <FormHelperText error>{errors.confirmPassword}</FormHelperText>}

              <Select
                fullWidth
                value={formData.departmentId}
                onChange={(e) => handleInputChange('departmentId', e.target.value)}
                displayEmpty
                error={!!errors.departmentId}
                startAdornment={
                  <InputAdornment position="start">
                    <BusinessIcon color="primary" />
                  </InputAdornment>
                }
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    backgroundColor: theme.palette.background.default,
                    fontSize: 15,
                    height: 40,
                  },
                  '& .MuiSelect-select': {
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  },
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      bgcolor: theme.palette.mode === 'dark' 
                        ? theme.palette.background.paper 
                        : '#fff',
                      backgroundImage: 'none',
                      boxShadow: theme.shadows[4],
                      borderRadius: 2,
                      mt: 0.5,
                      '& .MuiMenuItem-root': {
                        fontSize: 15,
                        py: 1,
                        px: 2,
                        '&:hover': {
                          bgcolor: theme.palette.mode === 'dark'
                            ? 'rgba(255, 255, 255, 0.08)'
                            : 'rgba(0, 0, 0, 0.04)',
                        },
                        '&.Mui-selected': {
                          bgcolor: theme.palette.mode === 'dark'
                            ? 'rgba(255, 255, 255, 0.15)'
                            : 'rgba(0, 0, 0, 0.08)',
                          '&:hover': {
                            bgcolor: theme.palette.mode === 'dark'
                              ? 'rgba(255, 255, 255, 0.2)'
                              : 'rgba(0, 0, 0, 0.12)',
                          },
                        },
                      },
                    },
                  },
                }}
                required
              >
                <MenuItem value="" disabled>
                  <Typography color="text.secondary">Select Department</Typography>
                </MenuItem>
                {departments.map((department) => (
                  <MenuItem key={department.id} value={department.id}>
                    {department.name}
                  </MenuItem>
                ))}
              </Select>
              {errors.departmentId && <FormHelperText error>{errors.departmentId}</FormHelperText>}
            </Box>

            <Divider sx={{ my: 2 }} />

            <Button
              variant="contained"
              fullWidth
              onClick={handleRegister}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
              sx={{
                borderRadius: 3,
                mt: 0.75,
                height: 40,
                fontSize: 15,
                fontWeight: 500,
                textTransform: 'none',
                mb: 1,
              }}
            >
              {loading ? 'Creating Account...' : 'Register'}
            </Button>

            <Button
              variant="text"
              component={Link}
              to="/login"
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
              Already have an account? Login
            </Button>
          </Box>
        </CardContent>
      </Card>



      {/* Success/Error Alert */}
      {(error || success) && !rateLimitData && (
        <Alert
          severity={success ? 'success' : 'error'}
          sx={{
            position: 'fixed',
            top: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            maxWidth: 400,
            width: '90%',
            zIndex: theme.zIndex.snackbar,
          }}
          onClose={() => { setError(''); setSuccess(false); }}
        >
          {success ? 'Registration successful! Redirecting to login...' : error}
        </Alert>
      )}

      {/* Rate Limit Alert */}
      <PWARateLimitAlert
        isOpen={!!rateLimitData}
        onClose={() => setRateLimitData(null)}
        rateLimitData={rateLimitData}
        endpoint="register"
        onRetry={() => {
          setRateLimitData(null);
          setError('');
        }}
      />
    </Box>
  );
};

export default RegisterPage;