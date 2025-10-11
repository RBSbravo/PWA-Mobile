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
  Switch,
  FormControlLabel,
  Alert,
  useTheme,
  useMediaQuery,
  Divider,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  FormHelperText,
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useThemeContext } from '../context/ThemeContext';
import api from '../services/api';

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

const PasswordStrengthIndicator = ({ password }) => {
  const theme = useTheme();
  
  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: '', color: 'transparent' };
    
    let strength = 0;
    if (password.length >= 6) strength += 1;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    if (strength <= 2) return { strength, label: 'Weak', color: theme.palette.error.main };
    if (strength <= 4) return { strength, label: 'Medium', color: theme.palette.warning.main };
    return { strength, label: 'Strong', color: theme.palette.success.main };
  };

  const { strength, label, color } = getPasswordStrength(password);

  return (
    <Box sx={{ mt: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box sx={{ flex: 1, height: 4, backgroundColor: theme.palette.divider, borderRadius: 2 }}>
          <Box
            sx={{
              width: `${(strength / 6) * 100}%`,
              height: '100%',
              backgroundColor: color,
              borderRadius: 2,
              transition: 'all 0.3s ease',
            }}
          />
        </Box>
        <Typography variant="caption" sx={{ color, fontWeight: 500 }}>
          {label}
        </Typography>
      </Box>
    </Box>
  );
};

const RegisterPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { register } = useAuth();
  const { isDarkMode, toggleTheme } = useThemeContext();
  
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
  const [departmentModalOpen, setDepartmentModalOpen] = useState(false);
  const [departmentSearch, setDepartmentSearch] = useState('');
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

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
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
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
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
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
      
      setTimeout(() => {
        setSuccess(false);
        setLoading(false);
        navigate('/login');
      }, 1500);
      
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      setLoading(false);
    }
  };

  const getSelectedDepartmentName = () => {
    const dept = departments.find(d => d.id === formData.departmentId);
    return dept ? dept.name : 'Select Department';
  };

  const filteredDepartments = departments.filter(d => 
    d.name.toLowerCase().includes(departmentSearch.toLowerCase())
  );

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
        p: 2,
      }}
    >
      <Card
        sx={{
          width: '100%',
          maxWidth: 400,
          borderRadius: 5,
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

              <TextField
                fullWidth
                label="Department"
                value={getSelectedDepartmentName()}
                onClick={() => setDepartmentModalOpen(true)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BusinessIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
                error={!!errors.departmentId}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    backgroundColor: theme.palette.background.default,
                    fontSize: 15,
                    height: 40,
                    cursor: 'pointer',
                  },
                }}
                readOnly
                required
              />
              {errors.departmentId && <FormHelperText error>{errors.departmentId}</FormHelperText>}
            </Box>

            <Divider sx={{ my: 2 }} />

            <Button
              variant="contained"
              fullWidth
              onClick={handleRegister}
              disabled={loading}
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

      {/* Department Selection Modal */}
      <Dialog
        open={departmentModalOpen}
        onClose={() => setDepartmentModalOpen(false)}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>Select Department</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            placeholder="Search department..."
            value={departmentSearch}
            onChange={(e) => setDepartmentSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />
          <List sx={{ maxHeight: 300, overflow: 'auto' }}>
            {filteredDepartments.map((department) => (
              <ListItem
                key={department.id}
                button
                onClick={() => {
                  handleInputChange('departmentId', department.id);
                  setDepartmentModalOpen(false);
                  setDepartmentSearch('');
                }}
                sx={{
                  backgroundColor: formData.departmentId === department.id 
                    ? theme.palette.primary.main + '22' 
                    : 'transparent',
                }}
              >
                <ListItemText
                  primary={department.name}
                  sx={{
                    fontWeight: formData.departmentId === department.id ? 'bold' : 'normal',
                  }}
                />
              </ListItem>
            ))}
            {filteredDepartments.length === 0 && (
              <ListItem>
                <ListItemText primary="No departments found." />
              </ListItem>
            )}
          </List>
        </DialogContent>
      </Dialog>

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

      {/* Success/Error Alert */}
      {(error || success) && (
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
    </Box>
  );
};

export default RegisterPage;