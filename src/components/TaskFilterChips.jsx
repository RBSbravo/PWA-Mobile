import React from 'react';
import {
  Box,
  Chip,
  useTheme,
  useMediaQuery,
} from '@mui/material';

const TaskFilterChips = ({
  statusFilter,
  setStatusFilter,
  priorityFilter,
  setPriorityFilter,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const statusOptions = ['All', 'Pending', 'In Progress', 'Completed'];
  const priorityOptions = ['All', 'High', 'Medium', 'Low'];

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        mt: 1,
        mb: 2,
      }}
    >
      {/* Status Filter Chips */}
      <Box
        sx={{
          display: 'flex',
          gap: 1,
          overflowX: 'auto',
          pb: 0.5,
          '&::-webkit-scrollbar': {
            display: 'none',
          },
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
        }}
      >
        {statusOptions.map((status) => (
          <Chip
            key={status}
            label={status}
            onClick={() => setStatusFilter(status)}
            variant={statusFilter === status ? 'filled' : 'outlined'}
            color={statusFilter === status ? 'primary' : 'default'}
            size="small"
            sx={{
              minWidth: 'auto',
              borderRadius: theme.shape.borderRadius * 3,
              fontWeight: statusFilter === status ? 600 : 500,
              fontSize: isMobile ? 11 : 12,
              height: 28,
              '& .MuiChip-label': {
                px: 1.2,
              },
              '&:hover': {
                backgroundColor: statusFilter === status 
                  ? theme.palette.primary.dark 
                  : theme.palette.action.hover,
              },
            }}
          />
        ))}
      </Box>

      {/* Priority Filter Chips */}
      <Box
        sx={{
          display: 'flex',
          gap: 1,
          overflowX: 'auto',
          pb: 0.5,
          '&::-webkit-scrollbar': {
            display: 'none',
          },
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
        }}
      >
        {priorityOptions.map((priority) => (
          <Chip
            key={priority}
            label={priority}
            onClick={() => setPriorityFilter(priority)}
            variant={priorityFilter === priority ? 'filled' : 'outlined'}
            color={priorityFilter === priority ? 'secondary' : 'default'}
            size="small"
            sx={{
              minWidth: 'auto',
              borderRadius: theme.shape.borderRadius * 3,
              fontWeight: priorityFilter === priority ? 600 : 500,
              fontSize: isMobile ? 11 : 12,
              height: 28,
              '& .MuiChip-label': {
                px: 1.2,
              },
              '&:hover': {
                backgroundColor: priorityFilter === priority 
                  ? theme.palette.secondary.dark 
                  : theme.palette.action.hover,
              },
            }}
          />
        ))}
      </Box>
    </Box>
  );
};

export default TaskFilterChips;
