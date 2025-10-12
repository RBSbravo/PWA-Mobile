import React from 'react';
import {
  Box,
  CircularProgress,
  Typography,
  Backdrop,
  useTheme,
  useMediaQuery,
  LinearProgress,
} from '@mui/material';

const FullScreenLoader = ({ 
  visible, 
  message = 'Loading...', 
  progress = null,
  showProgress = false,
  variant = 'circular' // 'circular' or 'linear'
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  if (!visible) return null;

  return (
    <Backdrop
      open={visible}
      sx={{
        zIndex: theme.zIndex.modal + 1,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
          backgroundColor: theme.palette.surface,
          borderRadius: theme.shape.borderRadius * 2,
          boxShadow: theme.shadows[8],
          minWidth: isMobile ? 200 : 250,
          maxWidth: isMobile ? '90%' : 300,
        }}
      >
        {variant === 'circular' ? (
          <CircularProgress
            size={isMobile ? 40 : 50}
            sx={{
              color: theme.palette.primary.main,
              mb: 2,
            }}
          />
        ) : (
          <Box sx={{ width: '100%', mb: 2 }}>
            <LinearProgress
              variant={progress !== null ? 'determinate' : 'indeterminate'}
              value={progress}
              sx={{
                height: 6,
                borderRadius: 3,
                backgroundColor: theme.palette.action.hover,
                '& .MuiLinearProgress-bar': {
                  borderRadius: 3,
                  backgroundColor: theme.palette.primary.main,
                },
              }}
            />
            {showProgress && progress !== null && (
              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  textAlign: 'center',
                  mt: 1,
                  fontSize: 12,
                  color: theme.palette.text.secondary,
                }}
              >
                {Math.round(progress)}%
              </Typography>
            )}
          </Box>
        )}

        <Typography
          variant="body1"
          sx={{
            fontSize: isMobile ? 14 : 16,
            fontWeight: 500,
            color: theme.palette.text.primary,
            textAlign: 'center',
            lineHeight: 1.4,
          }}
        >
          {message}
        </Typography>
      </Box>
    </Backdrop>
  );
};

export default FullScreenLoader;
