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
      sx={{ 
        mt: 2,
        zIndex: theme.zIndex.snackbar + 1
      }}
    >
      <Alert
        severity="warning"
        icon={<WarningIcon />}
        sx={{
          width: '100%',
          maxWidth: '420px',
          borderRadius: 3,
          border: `2px solid ${theme.palette.warning.main}`,
          backgroundColor: theme.palette.mode === 'dark' 
            ? 'rgba(255, 152, 0, 0.15)' 
            : 'rgba(255, 152, 0, 0.08)',
          boxShadow: theme.shadows[8],
          '& .MuiAlert-message': {
            width: '100%',
            padding: 0
          }
        }}
        action={
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mt: 0.5 }}>
            {timeRemaining <= 0 && (
              <Button
                size="small"
                variant="contained"
                startIcon={<RefreshIcon />}
                onClick={handleRetry}
                sx={{ 
                  minWidth: 'auto',
                  textTransform: 'none',
                  fontSize: '0.75rem',
                  backgroundColor: theme.palette.warning.main,
                  '&:hover': {
                    backgroundColor: theme.palette.warning.dark,
                  }
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
                mt: 0.5,
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
        <Box sx={{ width: '100%' }}>
          <AlertTitle sx={{ 
            fontWeight: 700, 
            fontSize: '1rem',
            color: theme.palette.warning.dark,
            mb: 1
          }}>
            Rate Limit Exceeded
          </AlertTitle>
          
          <Typography variant="body2" sx={{ 
            mb: 2, 
            fontSize: '0.875rem',
            lineHeight: 1.4,
            color: theme.palette.text.primary
          }}>
            {pwaRateLimitHandler.getUserFriendlyMessage(rateLimitData)}
          </Typography>

          {timeRemaining > 0 && (
            <Box sx={{ 
              mt: 2, 
              p: 2, 
              backgroundColor: theme.palette.mode === 'dark' 
                ? 'rgba(255, 152, 0, 0.1)' 
                : 'rgba(255, 152, 0, 0.05)',
              borderRadius: 2,
              border: `1px solid ${theme.palette.warning.light}`
            }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                mb: 1.5 
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TimeIcon fontSize="small" color="warning" />
                  <Typography variant="body2" sx={{ 
                    fontWeight: 600,
                    color: theme.palette.warning.dark
                  }}>
                    Retry available in:
                  </Typography>
                </Box>
                <Typography variant="h6" sx={{ 
                  fontWeight: 700,
                  color: theme.palette.warning.main,
                  fontSize: '1.1rem'
                }}>
                  {formatTime(timeRemaining)}
                </Typography>
              </Box>
              
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: theme.palette.mode === 'dark' 
                    ? 'rgba(255, 255, 255, 0.1)' 
                    : 'rgba(0, 0, 0, 0.1)',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: theme.palette.warning.main,
                    borderRadius: 3,
                  }
                }}
              />
              
              <Typography variant="caption" sx={{ 
                display: 'block', 
                mt: 1, 
                textAlign: 'center',
                color: theme.palette.text.secondary
              }}>
                {Math.round(progress)}% remaining
              </Typography>
            </Box>
          )}

          {timeRemaining <= 0 && (
            <Box sx={{ 
              mt: 2, 
              p: 2, 
              backgroundColor: theme.palette.success.light + '20',
              borderRadius: 2,
              border: `1px solid ${theme.palette.success.light}`
            }}>
              <Typography variant="body2" sx={{ 
                color: theme.palette.success.main,
                fontWeight: 600,
                textAlign: 'center'
              }}>
                ✓ You can now retry your request
              </Typography>
            </Box>
          )}

          {rateLimitData.limit && (
            <Box sx={{ 
              mt: 2, 
              p: 1.5, 
              backgroundColor: theme.palette.mode === 'dark' 
                ? 'rgba(0, 0, 0, 0.1)' 
                : 'rgba(0, 0, 0, 0.05)',
              borderRadius: 1.5,
              border: `1px solid ${theme.palette.divider}`
            }}>
              <Typography variant="caption" sx={{ 
                display: 'block', 
                textAlign: 'center',
                color: theme.palette.text.secondary,
                fontSize: '0.75rem'
              }}>
                Limit: {rateLimitData.limit} requests per {rateLimitData.retryAfter}
              </Typography>
            </Box>
          )}
        </Box>
      </Alert>
    </Snackbar>
  );
};

export default PWARateLimitAlert;

