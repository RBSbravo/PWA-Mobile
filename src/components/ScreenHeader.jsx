import React from 'react';
import {
  Box,
  Typography,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';

const ScreenHeader = ({
  title,
  subtitle,
  leftIcon,
  rightAction,
  style,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        px: isMobile ? 2.5 : 3,
        pt: 2.25,
        pb: 1.5,
        backgroundColor: theme.palette.background.default,
        borderBottom: `1px solid ${theme.palette.divider}`,
        boxShadow: theme.shadows[1],
        zIndex: 10,
        ...style,
      }}
    >
      {/* Left Icon */}
      <Box
        sx={{
          width: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
        }}
      >
        {leftIcon}
      </Box>

      {/* Center Content */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          px: 1,
        }}
      >
        <Typography
          variant={isMobile ? 'h5' : 'h4'}
          component="h1"
          sx={{
            fontWeight: 'bold',
            fontSize: isMobile ? 22 : 24,
            color: theme.palette.primary.main,
            mb: subtitle ? 0.5 : 0,
            lineHeight: 1.2,
          }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography
            variant="body2"
            sx={{
              fontSize: 14,
              color: theme.palette.text.secondary,
              mt: 0,
              lineHeight: 1.2,
            }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>

      {/* Right Action */}
      <Box
        sx={{
          width: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
        }}
      >
        {rightAction}
      </Box>
    </Box>
  );
};

export default ScreenHeader;
