import React, { useEffect } from 'react';
import { useTheme } from '@mui/material/styles';

const ThemeCSSVariables = () => {
  const theme = useTheme();

  useEffect(() => {
    // Set CSS custom properties for theme colors
    const root = document.documentElement;
    
    // Background colors
    root.style.setProperty('--background-color', theme.palette.background.default);
    root.style.setProperty('--paper-color', theme.palette.background.paper);
    
    // Text colors
    root.style.setProperty('--text-primary', theme.palette.text.primary);
    root.style.setProperty('--text-secondary', theme.palette.text.secondary);
    
    // Primary colors
    root.style.setProperty('--primary-color', theme.palette.primary.main);
    root.style.setProperty('--primary-light', theme.palette.primary.light);
    root.style.setProperty('--primary-dark', theme.palette.primary.dark);
    
    // Secondary colors
    root.style.setProperty('--secondary-color', theme.palette.secondary.main);
    
    // Status colors
    root.style.setProperty('--error-color', theme.palette.error.main);
    root.style.setProperty('--warning-color', theme.palette.warning.main);
    root.style.setProperty('--success-color', theme.palette.success.main);
    root.style.setProperty('--info-color', theme.palette.info.main);
    
    // Border colors
    root.style.setProperty('--border-color', theme.palette.divider);
    
    // Shadow colors
    root.style.setProperty('--shadow-color', theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.1)');
    
  }, [theme]);

  return null; // This component doesn't render anything
};

export default ThemeCSSVariables;
