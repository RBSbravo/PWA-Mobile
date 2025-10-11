import { createTheme } from '@mui/material/styles';

// Mobile app color scheme
const colors = {
  primary: '#2E7D32', // A deeper green for primary actions
  primaryContainer: '#C8E6C9', // A light green for containers or highlights
  secondary: '#4CAF50', // A brighter green for secondary elements
  accent: '#FFC107', // A warm accent color
  background: '#F5F5F5', // A very light grey for the main background
  surface: '#FFFFFF', // White for card backgrounds, etc.
  text: '#212121', // Primary text color
  textSecondary: '#757575', // Lighter text for subtitles, etc.
  placeholder: '#BDBDBD',
  error: '#D32F2F',
  success: '#388E3C',
  warning: '#FBC02D',
  border: '#E0E0E0',
  info: '#2196f3',
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
    divider: colors.border,
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

// Dark theme colors
const darkColors = {
  primary: '#66BB6A', // A lighter green for dark mode primary actions
  primaryContainer: '#2E7D32', // Darker green for containers in dark mode
  secondary: '#81C784',
  accent: '#FFCA28',
  background: '#121212', // Standard dark background
  surface: '#1E1E1E', // Slightly lighter surface for cards
  text: '#E0E0E0', // Light grey text
  textSecondary: '#BDBDBD', // Dimmer text
  placeholder: '#757575',
  error: '#EF5350',
  success: '#66BB6A',
  warning: '#FFA000', // Darker yellow for better contrast with light text
  border: '#424242',
  info: '#42A5F5',
};

// Dark theme
export const darkTheme = createTheme({
  ...theme,
  palette: {
    mode: 'dark',
    primary: {
      main: darkColors.primary,
      light: darkColors.primaryContainer,
      dark: '#2E7D32',
      contrastText: '#ffffff',
    },
    secondary: {
      main: darkColors.secondary,
      light: '#A5D6A7',
      dark: '#4CAF50',
      contrastText: '#ffffff',
    },
    success: {
      main: darkColors.success,
    },
    warning: {
      main: darkColors.warning,
    },
    error: {
      main: darkColors.error,
    },
    info: {
      main: darkColors.info,
    },
    background: {
      default: darkColors.background,
      paper: darkColors.surface,
    },
    text: {
      primary: darkColors.text,
      secondary: darkColors.textSecondary,
    },
    divider: darkColors.border,
  },
  components: {
    ...theme.components,
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: borderRadius.lg,
          boxShadow: shadows.sm,
          border: `1px solid ${darkColors.border}`,
        },
      },
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
