import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { WifiOff as WifiOffIcon } from '@mui/icons-material';

const OfflinePage = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        p: 2,
      }}
    >
      <Card
        sx={{
          maxWidth: 400,
          width: '100%',
          borderRadius: 3,
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        }}
      >
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          <WifiOffIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
            You're Offline
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            It looks like you're not connected to the internet. Some features may not be available.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Don't worry - your data is safe and will sync when you're back online.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default OfflinePage;
