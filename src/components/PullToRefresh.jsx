import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, useTheme, useMediaQuery } from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';

const PullToRefresh = ({ onRefresh, children, threshold = 80 }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [startY, setStartY] = useState(0);
  const [isAtTop, setIsAtTop] = useState(false);
  const containerRef = useRef(null);

  const handleTouchStart = (e) => {
    if (!isMobile) return;
    
    // Check if we're at the top of the page
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    setIsAtTop(scrollTop === 0);
    setStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e) => {
    if (!isMobile || !isAtTop || isRefreshing) return;

    const currentY = e.touches[0].clientY;
    const distance = currentY - startY;

    if (distance > 0) {
      e.preventDefault();
      setPullDistance(Math.min(distance, threshold * 1.5));
      setIsPulling(distance > threshold);
    }
  };

  const handleTouchEnd = async () => {
    if (!isMobile || !isAtTop || isRefreshing) return;

    if (isPulling && onRefresh) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } catch (error) {
        console.error('Refresh failed:', error);
      } finally {
        setIsRefreshing(false);
      }
    }

    // Reset states
    setPullDistance(0);
    setIsPulling(false);
    setStartY(0);
  };

  useEffect(() => {
    if (!isMobile) return;

    // Attach event listeners to document for global touch handling
    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isAtTop, isRefreshing, isPulling, startY]);

  const refreshIndicatorHeight = Math.min(pullDistance * 0.5, threshold * 0.5);
  const refreshOpacity = Math.min(pullDistance / threshold, 1);

  return (
    <Box
      ref={containerRef}
      sx={{
        position: 'relative',
        height: '100%',
        // Remove overflow: 'auto' to prevent creating a separate scrolling context
        // overflow: 'auto',
        // WebkitOverflowScrolling: 'touch',
      }}
    >
      {/* Pull to Refresh Indicator */}
      {isMobile && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: refreshIndicatorHeight,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.palette.background.default,
            zIndex: theme.zIndex.appBar,
            transform: `translateY(-${refreshIndicatorHeight}px)`,
            transition: isRefreshing ? 'none' : 'transform 0.3s ease-out',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              opacity: refreshOpacity,
              transform: isPulling ? 'scale(1.1)' : 'scale(1)',
              transition: 'all 0.2s ease-out',
            }}
          >
            <RefreshIcon
              sx={{
                fontSize: 24,
                color: theme.palette.primary.main,
                animation: isRefreshing ? 'spin 1s linear infinite' : 'none',
                transform: isPulling ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.3s ease-out',
              }}
            />
            <Typography
              variant="caption"
              sx={{
                mt: 0.5,
                fontSize: 12,
                fontWeight: 500,
                color: theme.palette.text.secondary,
              }}
            >
              {isRefreshing ? 'Refreshing...' : isPulling ? 'Release to refresh' : 'Pull to refresh'}
            </Typography>
          </Box>
        </Box>
      )}

      {/* Main Content */}
      <Box
        sx={{
          transform: `translateY(${refreshIndicatorHeight}px)`,
          transition: isRefreshing ? 'none' : 'transform 0.3s ease-out',
        }}
      >
        {children}
      </Box>

      {/* CSS Animation Keyframes */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </Box>
  );
};

export default PullToRefresh;
