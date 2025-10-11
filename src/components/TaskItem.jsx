import React from 'react';
import {
  Card,
  CardContent,
  Chip,
  Typography,
  Box,
  Avatar,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  Category as CategoryIcon,
} from '@mui/icons-material';

// Task utility functions
const getStatusColor = (status, theme) => {
  switch ((status || '').toLowerCase()) {
    case 'in progress':
    case 'in_progress':
      return theme.palette.primary.main;
    case 'completed':
      return theme.palette.success.main;
    case 'pending':
      return theme.palette.warning.main;
    case 'declined':
      return theme.palette.error.main;
    default:
      return theme.palette.text.secondary;
  }
};

const getPriorityColor = (priority, theme) => {
  switch ((priority || '').toLowerCase()) {
    case 'high':
      return theme.palette.error.main;
    case 'medium':
      return theme.palette.warning.main;
    case 'low':
      return theme.palette.success.main;
    default:
      return theme.palette.text.secondary;
  }
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const TaskItem = React.memo(({ item, onPress }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const isOverdue = item.dueDate && new Date(item.dueDate) < new Date();
  const isDueSoon = item.dueDate && (new Date(item.dueDate) - new Date()) < (3 * 24 * 60 * 60 * 1000);

  return (
    <Card
      sx={{
        backgroundColor: theme.palette.surface,
        borderLeft: `5px solid ${getStatusColor(item.status, theme)}`,
        mb: 2,
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        border: theme.palette.mode === 'dark' ? `1px solid ${theme.palette.border}` : 'none',
        borderRadius: theme.shape.borderRadius * 2,
        boxShadow: theme.shadows[2],
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows[4],
        },
      }}
      onClick={() => onPress(item)}
    >
      <CardContent sx={{ pb: 1.5 }}>
        {/* Header with assignee and title */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
          {/* Assignee avatar/initials if available */}
          {item.assignee && (
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: theme.palette.primary.main + '33',
                color: theme.palette.primary.main,
                fontSize: 16,
                fontWeight: 'bold',
                mr: 1.25,
              }}
            >
              {item.assignee.name 
                ? item.assignee.name.split(' ').map(n => n[0]).join('').toUpperCase()
                : '?'
              }
            </Avatar>
          )}
          <Typography
            variant="body1"
            sx={{
              color: theme.palette.text.primary,
              flex: 1,
              fontSize: 16,
              fontWeight: 600,
              mr: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {item.title}
          </Typography>
        </Box>

        {/* Status and Priority Chips */}
        <Box sx={{ display: 'flex', alignItems: 'center', my: 0.75, gap: 1 }}>
          <Chip
            label={(item.status || '').replace('_', ' ')}
            size="small"
            sx={{
              backgroundColor: getStatusColor(item.status, theme),
              color: '#fff',
              fontWeight: 'bold',
              fontSize: 11,
              height: 24,
              '& .MuiChip-label': {
                px: 1,
              },
            }}
          />
          <Chip
            label={item.priority || 'Normal'}
            size="small"
            sx={{
              backgroundColor: getPriorityColor(item.priority, theme),
              color: '#fff',
              fontWeight: 'bold',
              fontSize: 11,
              height: 24,
              '& .MuiChip-label': {
                px: 1,
              },
            }}
          />
        </Box>

        {/* Description */}
        <Typography
          variant="body2"
          sx={{
            fontSize: 14,
            color: theme.palette.text.secondary,
            mb: 0.75,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            lineHeight: 1.4,
          }}
        >
          {item.description}
        </Typography>

        {/* Due date and category */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.75 }}>
          <ScheduleIcon 
            sx={{ 
              fontSize: 16, 
              color: theme.palette.text.secondary, 
              mr: 0.25 
            }} 
          />
          <Typography
            variant="caption"
            sx={{
              color: isOverdue 
                ? theme.palette.error.main 
                : isDueSoon 
                ? theme.palette.warning.main 
                : theme.palette.text.secondary,
              fontWeight: isOverdue ? 'bold' : 'normal',
              mr: 1.5,
            }}
          >
            Due: {formatDate(item.dueDate)}
          </Typography>
          
          {item.category && (
            <>
              <CategoryIcon 
                sx={{ 
                  fontSize: 16, 
                  color: theme.palette.text.secondary, 
                  mr: 0.25 
                }} 
              />
              <Typography 
                variant="caption" 
                sx={{ 
                  fontSize: 12, 
                  color: theme.palette.text.secondary,
                  ml: 0.5 
                }}
              >
                {item.category}
              </Typography>
            </>
          )}
        </Box>
      </CardContent>
    </Card>
  );
});

TaskItem.displayName = 'TaskItem';

export default TaskItem;
