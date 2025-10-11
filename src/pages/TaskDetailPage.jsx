import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';

const TaskDetailPage = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
        Task Details
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="body1">
            Task detail page - Coming soon!
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default TaskDetailPage;
