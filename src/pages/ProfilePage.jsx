import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';

const ProfilePage = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
        Profile
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="body1">
            Profile page - Coming soon!
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ProfilePage;
