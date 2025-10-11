import { createTheme } from '@mui/material/styles';

// Color palette
const colors = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4caf50',
  warning: '#ff9800',
  error: '#f44336',
  info: '#2196f3',
  background: '#f5f5f5',
  surface: '#ffffff',
  text: '#333333',
  textSecondary: '#666666',
  border: '#e0e0e0',
  accent: '#ff6b6b',
  primaryContainer: '#e3f2fd',
  secondaryContainer: '#f3e5f5',
};

// Typography
const typography = {
  fontFamily: {
    regular: 'Roboto, sans-serif',
    medium: 'Roboto, sans-serif',
    bold: 'Roboto, sans-serif',
  },
  fontSize: {
    xs: '12px',
    sm: '14px',
    md: '16px',
    lg: '18px',
    xl: '20px',
    xxl: '24px',
    xxxl: '32px',
  },
};

// Spacing
const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  xxl: '48px',
};

// Border radius
const borderRadius = {
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  round: '50%',
};

// Shadows
const shadows = {
  sm: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
  md: '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)',
  lg: '0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)',
  xl: '0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22)',
};

// Create Material-UI theme
export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: colors.primary,
      light: '#9bb5ff',
      dark: '#4a5bb7',
      contrastText: '#ffffff',
    },
    secondary: {
      main: colors.secondary,
      light: '#a574c7',
      dark: '#4a2c5a',
      contrastText: '#ffffff',
    },
    success: {
      main: colors.success,
    },
    warning: {
      main: colors.warning,
    },
    error: {
      main: colors.error,
    },
    info: {
      main: colors.info,
    },
    background: {
      default: colors.background,
      paper: colors.surface,
    },
    text: {
      primary: colors.text,
      secondary: colors.textSecondary,
    },
  },
  typography: {
    fontFamily: typography.fontFamily.regular,
    h1: {
      fontFamily: typography.fontFamily.bold,
      fontSize: typography.fontSize.xxxl,
    },
    h2: {
      fontFamily: typography.fontFamily.bold,
      fontSize: typography.fontSize.xxl,
    },
    h3: {
      fontFamily: typography.fontFamily.bold,
      fontSize: typography.fontSize.xl,
    },
    h4: {
      fontFamily: typography.fontFamily.medium,
      fontSize: typography.fontSize.lg,
    },
    h5: {
      fontFamily: typography.fontFamily.medium,
      fontSize: typography.fontSize.md,
    },
    h6: {
      fontFamily: typography.fontFamily.medium,
      fontSize: typography.fontSize.sm,
    },
    body1: {
      fontSize: typography.fontSize.md,
    },
    body2: {
      fontSize: typography.fontSize.sm,
    },
    button: {
      fontFamily: typography.fontFamily.medium,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: borderRadius.md,
  },
  spacing: 8,
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: borderRadius.lg,
          padding: `${spacing.sm} ${spacing.lg}`,
          fontWeight: 500,
        },
        contained: {
          boxShadow: shadows.sm,
          '&:hover': {
            boxShadow: shadows.md,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: borderRadius.lg,
          boxShadow: shadows.sm,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: borderRadius.lg,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: borderRadius.lg,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: borderRadius.xl,
        },
      },
    },
  },
});

// Dark theme
export const darkTheme = createTheme({
  ...theme,
  palette: {
    mode: 'dark',
    primary: {
      main: colors.primary,
      light: '#9bb5ff',
      dark: '#4a5bb7',
      contrastText: '#ffffff',
    },
    secondary: {
      main: colors.secondary,
      light: '#a574c7',
      dark: '#4a2c5a',
      contrastText: '#ffffff',
    },
    success: {
      main: colors.success,
    },
    warning: {
      main: colors.warning,
    },
    error: {
      main: colors.error,
    },
    info: {
      main: colors.info,
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
    text: {
      primary: '#ffffff',
      secondary: '#b3b3b3',
    },
  },
});

// Export theme constants for use in components
export const themeConstants = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
};

export default theme;
