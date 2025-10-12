import React from 'react';
import { Box, Skeleton, useTheme, useMediaQuery } from '@mui/material';

const SkeletonLoader = ({ type = 'task', count = 3 }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const TaskSkeleton = () => (
    <Box
      sx={{
        mb: 2,
        p: 2,
        backgroundColor: theme.palette.surface,
        borderRadius: theme.shape.borderRadius * 2,
        border: theme.palette.mode === 'dark' ? `1px solid ${theme.palette.border}` : 'none',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Skeleton variant="circular" width={32} height={32} sx={{ mr: 1.5 }} />
        <Skeleton variant="text" width="60%" height={24} />
        <Box sx={{ flexGrow: 1 }} />
        <Skeleton variant="circular" width={24} height={24} />
      </Box>
      
      <Box sx={{ mb: 1.5 }}>
        <Skeleton variant="text" width="100%" height={20} />
        <Skeleton variant="text" width="80%" height={20} />
      </Box>
      
      <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
        <Skeleton variant="rounded" width={80} height={24} />
        <Skeleton variant="rounded" width={60} height={24} />
      </Box>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Skeleton variant="text" width={100} height={16} />
        <Skeleton variant="text" width={80} height={16} />
      </Box>
    </Box>
  );

  const DashboardSkeleton = () => (
    <Box sx={{ p: isMobile ? 2 : 4 }}>
      {/* Header Skeleton */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
        <Box>
          <Skeleton variant="text" width={200} height={28} />
          <Skeleton variant="text" width={150} height={16} />
        </Box>
      </Box>

      {/* Stats Cards Skeleton */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        {[1, 2, 3].map((i) => (
          <Box
            key={i}
            sx={{
              flex: 1,
              minWidth: isMobile ? '100%' : '200px',
              p: 2,
              backgroundColor: theme.palette.surface,
              borderRadius: theme.shape.borderRadius * 2,
              border: theme.palette.mode === 'dark' ? `1px solid ${theme.palette.border}` : 'none',
            }}
          >
            <Skeleton variant="text" width="60%" height={20} />
            <Skeleton variant="text" width="40%" height={32} sx={{ mt: 1 }} />
          </Box>
        ))}
      </Box>

      {/* Recent Activity Skeleton */}
      <Box
        sx={{
          p: 2,
          backgroundColor: theme.palette.surface,
          borderRadius: theme.shape.borderRadius * 2,
          border: theme.palette.mode === 'dark' ? `1px solid ${theme.palette.border}` : 'none',
        }}
      >
        <Skeleton variant="text" width="40%" height={24} sx={{ mb: 2 }} />
        {[1, 2, 3].map((i) => (
          <Box key={i} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Skeleton variant="circular" width={24} height={24} sx={{ mr: 1.5 }} />
            <Skeleton variant="text" width="70%" height={16} />
          </Box>
        ))}
      </Box>
    </Box>
  );

  const ProfileSkeleton = () => (
    <Box sx={{ p: isMobile ? 2 : 4 }}>
      {/* Header Skeleton */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
        <Box sx={{ flexGrow: 1 }}>
          <Skeleton variant="text" width="60%" height={28} />
          <Skeleton variant="text" width="40%" height={16} sx={{ mt: 0.5 }} />
        </Box>
      </Box>

      {/* Profile Information Card Skeleton */}
      <Box
        sx={{
          mb: 3,
          p: 2,
          backgroundColor: theme.palette.surface,
          borderRadius: theme.shape.borderRadius * 2,
          border: theme.palette.mode === 'dark' ? `1px solid ${theme.palette.border}` : 'none',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Skeleton variant="circular" width={24} height={24} sx={{ mr: 2 }} />
          <Box sx={{ flexGrow: 1 }}>
            <Skeleton variant="text" width="30%" height={18} />
            <Skeleton variant="text" width="60%" height={14} sx={{ mt: 0.5 }} />
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Skeleton variant="circular" width={24} height={24} sx={{ mr: 2 }} />
          <Box sx={{ flexGrow: 1 }}>
            <Skeleton variant="text" width="40%" height={18} />
            <Skeleton variant="text" width="50%" height={14} sx={{ mt: 0.5 }} />
          </Box>
        </Box>
      </Box>

      {/* Action Buttons Skeleton */}
      <Box sx={{ mb: 3 }}>
        <Skeleton variant="rounded" width="100%" height={48} sx={{ mb: 2 }} />
        <Skeleton variant="rounded" width="100%" height={48} sx={{ mb: 2 }} />
        <Skeleton variant="rounded" width="100%" height={48} />
      </Box>

      {/* Theme Settings Card Skeleton */}
      <Box
        sx={{
          p: 2,
          backgroundColor: theme.palette.surface,
          borderRadius: theme.shape.borderRadius * 2,
          border: theme.palette.mode === 'dark' ? `1px solid ${theme.palette.border}` : 'none',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Skeleton variant="text" width="30%" height={20} />
          <Skeleton variant="rounded" width={48} height={24} />
        </Box>
      </Box>
    </Box>
  );

  const TaskDetailSkeleton = () => (
    <Box sx={{ p: isMobile ? 2 : 4 }}>
      {/* Header Skeleton */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
        <Box sx={{ flexGrow: 1 }}>
          <Skeleton variant="text" width="60%" height={28} />
        </Box>
        <Skeleton variant="rounded" width={60} height={36} />
      </Box>

      {/* Task Details Card Skeleton */}
      <Box
        sx={{
          mb: 3,
          p: 2,
          backgroundColor: theme.palette.surface,
          borderRadius: theme.shape.borderRadius * 2,
          border: theme.palette.mode === 'dark' ? `1px solid ${theme.palette.border}` : 'none',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Skeleton variant="circular" width={24} height={24} sx={{ mr: 1 }} />
          <Skeleton variant="text" width="70%" height={24} />
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Skeleton variant="rounded" width={80} height={24} />
          <Skeleton variant="rounded" width={60} height={24} />
        </Box>
        
        <Box sx={{ mb: 2 }}>
          <Skeleton variant="text" width="30%" height={18} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="100%" height={16} />
          <Skeleton variant="text" width="80%" height={16} />
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Skeleton variant="circular" width={16} height={16} sx={{ mr: 1 }} />
          <Skeleton variant="text" width="40%" height={14} />
        </Box>
      </Box>

      {/* Comments Section Skeleton */}
      <Box
        sx={{
          mb: 3,
          p: 2,
          backgroundColor: theme.palette.surface,
          borderRadius: theme.shape.borderRadius * 2,
          border: theme.palette.mode === 'dark' ? `1px solid ${theme.palette.border}` : 'none',
        }}
      >
        <Skeleton variant="text" width="40%" height={20} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" width="100%" height={80} sx={{ mb: 2 }} />
        <Skeleton variant="rounded" width={120} height={36} />
      </Box>

      {/* File Attachments Section Skeleton */}
      <Box
        sx={{
          p: 2,
          backgroundColor: theme.palette.surface,
          borderRadius: theme.shape.borderRadius * 2,
          border: theme.palette.mode === 'dark' ? `1px solid ${theme.palette.border}` : 'none',
        }}
      >
        <Skeleton variant="text" width="50%" height={20} sx={{ mb: 2 }} />
        <Skeleton variant="rounded" width="100%" height={48} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="80%" height={12} />
      </Box>
    </Box>
  );

  const NotificationSkeleton = () => (
    <Box sx={{ p: isMobile ? 2 : 4 }}>
      {/* Header Skeleton */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
        <Box sx={{ flexGrow: 1 }}>
          <Skeleton variant="text" width="40%" height={28} />
        </Box>
        <Skeleton variant="rounded" width={100} height={36} />
      </Box>

      {/* Notification Items Skeleton */}
      {[1, 2, 3, 4, 5].map((i) => (
        <Box
          key={i}
          sx={{
            mb: 2,
            p: 2,
            backgroundColor: theme.palette.surface,
            borderRadius: theme.shape.borderRadius * 2,
            border: theme.palette.mode === 'dark' ? `1px solid ${theme.palette.border}` : 'none',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
            <Skeleton variant="circular" width={24} height={24} sx={{ mr: 1.5, mt: 0.5 }} />
            <Box sx={{ flexGrow: 1 }}>
              <Skeleton variant="text" width="80%" height={18} />
              <Skeleton variant="text" width="60%" height={16} sx={{ mt: 0.5 }} />
            </Box>
            <Skeleton variant="text" width={60} height={14} />
          </Box>
        </Box>
      ))}
    </Box>
  );

  const renderSkeleton = () => {
    switch (type) {
      case 'dashboard':
        return <DashboardSkeleton />;
      case 'notification':
        return <NotificationSkeleton />;
      case 'task-detail':
        return <TaskDetailSkeleton />;
      case 'profile':
        return <ProfileSkeleton />;
      case 'task':
      default:
        return (
          <Box sx={{ p: isMobile ? 2 : 4 }}>
            {Array.from({ length: count }).map((_, index) => (
              <TaskSkeleton key={index} />
            ))}
          </Box>
        );
    }
  };

  return renderSkeleton();
};

export default SkeletonLoader;
