import React from 'react';
import {
  Box,
  CircularProgress,
  Typography,
  Backdrop,
  useTheme,
  useMediaQuery,
} from '@mui/material';

const FullScreenLoader = ({ visible, message = 'Loading...' }) => {
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
        }}
      >
        <CircularProgress
          size={isMobile ? 40 : 50}
          sx={{
            color: theme.palette.primary.main,
            mb: 2,
          }}
        />
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
