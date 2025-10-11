import React from 'react';
import { Box, Typography, Card, CardContent, Button, TextField } from '@mui/material';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  
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
        <CardContent sx={{ p: 4 }}>
          <Box textAlign="center" mb={4}>
            <Typography variant="h4" component="h1" fontWeight="bold" color="primary" gutterBottom>
              Reset Password
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Enter your new password
            </Typography>
          </Box>
          
          <Box component="form">
            <TextField
              fullWidth
              label="New Password"
              type="password"
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Confirm New Password"
              type="password"
              margin="normal"
              required
            />
            
            <Button
              fullWidth
              variant="contained"
              size="large"
              sx={{
                mt: 3,
                mb: 2,
                py: 1.5,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              }}
            >
              Reset Password
            </Button>
            
            <Box textAlign="center">
              <Typography variant="body2" color="text.secondary">
                Remember your password?{' '}
                <Button
                  component={RouterLink}
                  to="/login"
                  color="primary"
                  sx={{ textDecoration: 'none' }}
                >
                  Sign in
                </Button>
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ResetPasswordPage;
