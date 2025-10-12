import React, { useState, useEffect } from 'react';
import {
  Alert,
  AlertTitle,
  Box,
  Typography,
  LinearProgress,
  Button,
  Collapse,
  IconButton,
  useTheme,
  Snackbar
} from '@mui/material';
import {
  Close as CloseIcon,
  AccessTime as TimeIcon,
  Refresh as RefreshIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { pwaRateLimitHandler } from '../utils/rateLimitHandler';

const PWARateLimitAlert = ({ 
  isOpen, 
  onClose, 
  rateLimitData, 
  endpoint,
  onRetry 
}) => {
  const theme = useTheme();
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!isOpen || !rateLimitData) return;

    const retryTime = pwaRateLimitHandler.calculateRetryTime(rateLimitData);
    const totalTime = retryTime;
    let remainingTime = retryTime;

    const timer = setInterval(() => {
      remainingTime -= 1000;
      setTimeRemaining(remainingTime);
      
      const progressPercent = Math.max(0, (remainingTime / totalTime) * 100);
      setProgress(progressPercent);

      if (remainingTime <= 0) {
        clearInterval(timer);
        setTimeRemaining(0);
        setProgress(0);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, rateLimitData]);

  const formatTime = (milliseconds) => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  };

  const handleRetry = () => {
    if (timeRemaining <= 0) {
      pwaRateLimitHandler.clearRetryTimer(endpoint);
      onRetry?.();
      onClose?.();
    }
  };

  if (!isOpen || !rateLimitData) return null;

  return (
    <Snackbar
      open={isOpen}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      sx={{ mt: 8 }}
    >
      <Alert
        severity="warning"
        icon={<WarningIcon />}
        sx={{
          width: '100%',
          maxWidth: '400px',
          borderRadius: 2,
          border: `1px solid ${theme.palette.warning.main}`,
          backgroundColor: theme.palette.mode === 'dark' 
            ? 'rgba(255, 152, 0, 0.1)' 
            : 'rgba(255, 152, 0, 0.05)',
        }}
        action={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {timeRemaining <= 0 && (
              <Button
                size="small"
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={handleRetry}
                sx={{ 
                  minWidth: 'auto',
                  textTransform: 'none',
                  fontSize: '0.75rem'
                }}
              >
                Retry
              </Button>
            )}
            <IconButton
              size="small"
              onClick={onClose}
              sx={{ 
                color: theme.palette.warning.main,
                '&:hover': {
                  backgroundColor: 'rgba(255, 152, 0, 0.1)'
                }
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        }
      >
        <AlertTitle sx={{ fontWeight: 600 }}>
          Rate Limit Exceeded
        </AlertTitle>
        
        <Typography variant="body2" sx={{ mb: 1 }}>
          {pwaRateLimitHandler.getUserFriendlyMessage(rateLimitData)}
        </Typography>

        {timeRemaining > 0 && (
          <Box sx={{ mt: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <TimeIcon fontSize="small" color="warning" />
              <Typography variant="caption" color="text.secondary">
                Retry available in: {formatTime(timeRemaining)}
              </Typography>
            </Box>
            
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 4,
                borderRadius: 2,
                backgroundColor: theme.palette.mode === 'dark' 
                  ? 'rgba(255, 255, 255, 0.1)' 
                  : 'rgba(0, 0, 0, 0.1)',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: theme.palette.warning.main,
                }
              }}
            />
          </Box>
        )}

        {timeRemaining <= 0 && (
          <Box sx={{ mt: 1 }}>
            <Typography variant="caption" color="success.main">
              ✓ You can now retry your request
            </Typography>
          </Box>
        )}

        {rateLimitData.limit && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            Limit: {rateLimitData.limit} requests per {rateLimitData.retryAfter}
          </Typography>
        )}
      </Alert>
    </Snackbar>
  );
};

export default PWARateLimitAlert;
