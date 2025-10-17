import React, { useState } from 'react';
import {
  Box,
  Typography,
  LinearProgress,
  Chip,
  Collapse,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import passwordValidator from '../utils/passwordValidator';

const PasswordStrengthIndicator = ({ password, showSuggestions = true, defaultExpanded = false }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  
  const validation = passwordValidator.validate(password || '');
  const strength = validation.strength;
  const errors = validation.errors;
  const suggestions = passwordValidator.getSuggestions(errors);

  const getStrengthColor = () => {
    if (strength < 30) return theme.palette.error.main;
    if (strength < 50) return theme.palette.warning.main;
    if (strength < 70) return theme.palette.info.main;
    if (strength < 90) return theme.palette.primary.main;
    return theme.palette.success.main;
  };

  const getStrengthDescription = () => {
    if (strength < 30) return 'Very Weak';
    if (strength < 50) return 'Weak';
    if (strength < 70) return 'Fair';
    if (strength < 90) return 'Good';
    return 'Strong';
  };

  const getRequirements = () => [
    {
      label: 'At least 8 characters',
      met: password && password.length >= 8
    },
    {
      label: 'Contains uppercase letter',
      met: password && /[A-Z]/.test(password)
    },
    {
      label: 'Contains lowercase letter',
      met: password && /[a-z]/.test(password)
    },
    {
      label: 'Contains number',
      met: password && /\d/.test(password)
    },
    {
      label: 'Contains special character',
      met: password && /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/.test(password)
    }
  ];

  if (!password) {
    return (
      <Box sx={{ mt: 1, p: 1 }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
          Enter a password to see strength indicator
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 1 }}>
      {/* Header with strength indicator */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
            Password Strength:
          </Typography>
          <Chip
            label={getStrengthDescription()}
            size="small"
            sx={{
              backgroundColor: getStrengthColor(),
              color: theme.palette.getContrastText(getStrengthColor()),
              fontSize: '10px',
              height: 20,
              fontWeight: 600,
            }}
          />
        </Box>
        <IconButton
          size="small"
          onClick={() => setIsExpanded(!isExpanded)}
          sx={{ ml: 1 }}
        >
          {isExpanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
        </IconButton>
      </Box>

      {/* Progress bar */}
      <Box sx={{ mb: 1 }}>
        <LinearProgress
          variant="determinate"
          value={strength}
          sx={{
            height: 6,
            borderRadius: 3,
            backgroundColor: theme.palette.grey[300],
            '& .MuiLinearProgress-bar': {
              backgroundColor: getStrengthColor(),
              borderRadius: 3,
            },
          }}
        />
        <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'right', display: 'block', mt: 0.5 }}>
          {strength}% strength
        </Typography>
      </Box>

      {/* Collapsible detailed content */}
      <Collapse in={isExpanded}>
        <Box sx={{ mt: 2 }}>
          {/* Requirements Checklist */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, fontSize: '12px', fontWeight: 600 }}>
              Requirements:
            </Typography>
            <List dense sx={{ py: 0 }}>
              {getRequirements().map((req, index) => (
                <ListItem key={index} sx={{ py: 0.25, px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 24 }}>
                    {req.met ? (
                      <CheckCircleIcon 
                        sx={{ 
                          fontSize: 16, 
                          color: theme.palette.success.main 
                        }} 
                      />
                    ) : (
                      <CancelIcon 
                        sx={{ 
                          fontSize: 16, 
                          color: theme.palette.error.main 
                        }} 
                      />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography
                        variant="caption"
                        sx={{
                          color: req.met ? theme.palette.success.main : theme.palette.error.main,
                          fontSize: '11px',
                        }}
                      >
                        {req.label}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Box>

          {/* Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, fontSize: '12px', fontWeight: 600 }}>
                Suggestions:
              </Typography>
              <List dense sx={{ py: 0 }}>
                {suggestions.map((suggestion, index) => (
                  <ListItem key={index} sx={{ py: 0.25, px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 24 }}>
                      <InfoIcon 
                        sx={{ 
                          fontSize: 16, 
                          color: theme.palette.warning.main 
                        }} 
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography
                          variant="caption"
                          sx={{
                            color: theme.palette.warning.main,
                            fontSize: '11px',
                          }}
                        >
                          {suggestion}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </Box>
      </Collapse>
    </Box>
  );
};

export default PasswordStrengthIndicator;
