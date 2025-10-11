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
  categoryFilter,
  setCategoryFilter,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const statusOptions = ['All', 'Pending', 'In Progress', 'Completed', 'Declined'];
  const priorityOptions = ['All', 'High', 'Medium', 'Low'];
  const categoryOptions = ['All', 'Development', 'Design', 'Testing', 'Documentation'];

  return (
    <Box
      sx={{
        mt: 2,
        mb: 2.5,
        overflow: 'hidden',
      }}
    >
      {/* Status Filter Chips */}
      <Box
        sx={{
          display: 'flex',
          gap: 1,
          overflowX: 'auto',
          pb: 1,
          '&::-webkit-scrollbar': {
            height: 4,
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: theme.palette.divider,
            borderRadius: 2,
          },
        }}
      >
        {statusOptions.map((status) => (
          <Chip
            key={status}
            label={status}
            onClick={() => setStatusFilter(status)}
            variant={statusFilter === status ? 'filled' : 'outlined'}
            color={statusFilter === status ? 'primary' : 'default'}
            sx={{
              minWidth: 'auto',
              borderRadius: theme.shape.borderRadius * 2,
              fontWeight: statusFilter === status ? 600 : 500,
              fontSize: isMobile ? 12 : 14,
              height: 32,
              '& .MuiChip-label': {
                px: 1.5,
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
          pb: 1,
          mt: 1,
          '&::-webkit-scrollbar': {
            height: 4,
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: theme.palette.divider,
            borderRadius: 2,
          },
        }}
      >
        {priorityOptions.map((priority) => (
          <Chip
            key={priority}
            label={priority}
            onClick={() => setPriorityFilter(priority)}
            variant={priorityFilter === priority ? 'filled' : 'outlined'}
            color={priorityFilter === priority ? 'primary' : 'default'}
            sx={{
              minWidth: 'auto',
              borderRadius: theme.shape.borderRadius * 2,
              fontWeight: priorityFilter === priority ? 600 : 500,
              fontSize: isMobile ? 12 : 14,
              height: 32,
              '& .MuiChip-label': {
                px: 1.5,
              },
            }}
          />
        ))}
      </Box>

      {/* Category Filter Chips */}
      <Box
        sx={{
          display: 'flex',
          gap: 1,
          overflowX: 'auto',
          pb: 1,
          mt: 1,
          '&::-webkit-scrollbar': {
            height: 4,
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: theme.palette.divider,
            borderRadius: 2,
          },
        }}
      >
        {categoryOptions.map((category) => (
          <Chip
            key={category}
            label={category}
            onClick={() => setCategoryFilter(category)}
            variant={categoryFilter === category ? 'filled' : 'outlined'}
            color={categoryFilter === category ? 'primary' : 'default'}
            sx={{
              minWidth: 'auto',
              borderRadius: theme.shape.borderRadius * 2,
              fontWeight: categoryFilter === category ? 600 : 500,
              fontSize: isMobile ? 12 : 14,
              height: 32,
              '& .MuiChip-label': {
                px: 1.5,
              },
            }}
          />
        ))}
      </Box>
    </Box>
  );
};

export default TaskFilterChips;
