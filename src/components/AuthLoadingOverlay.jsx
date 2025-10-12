import React from 'react';
import {
  Box,
  CircularProgress,
  Typography,
  Backdrop,
  useTheme,
  useMediaQuery,
} from '@mui/material';

const AuthLoadingOverlay = ({ 
  visible, 
  message = 'Processing...',
  showProgress = false,
  progress = null 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  if (!visible) return null;

  return (
    <Backdrop
      open={visible}
      sx={{
        zIndex: theme.zIndex.modal + 2,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
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
          p: 4,
          backgroundColor: theme.palette.surface,
          borderRadius: theme.shape.borderRadius * 3,
          boxShadow: theme.shadows[12],
          minWidth: isMobile ? 250 : 300,
          maxWidth: isMobile ? '90%' : 350,
          textAlign: 'center',
        }}
      >
        <CircularProgress
          size={isMobile ? 50 : 60}
          sx={{
            color: theme.palette.primary.main,
            mb: 3,
          }}
        />
        
        <Typography
          variant="h6"
          sx={{
            fontSize: isMobile ? 16 : 18,
            fontWeight: 600,
            color: theme.palette.text.primary,
            mb: 1,
            lineHeight: 1.4,
          }}
        >
          {message}
        </Typography>
        
        {showProgress && progress !== null && (
          <Typography
            variant="body2"
            sx={{
              fontSize: 14,
              color: theme.palette.text.secondary,
              opacity: 0.8,
            }}
          >
            {Math.round(progress)}% complete
          </Typography>
        )}
        
        <Typography
          variant="body2"
          sx={{
            fontSize: 12,
            color: theme.palette.text.secondary,
            opacity: 0.7,
            mt: 1,
            fontStyle: 'italic',
          }}
        >
          Please wait...
        </Typography>
      </Box>
    </Backdrop>
  );
};

export default AuthLoadingOverlay;
