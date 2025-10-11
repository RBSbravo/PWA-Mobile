import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { theme, darkTheme } from '../theme';

const ThemeContext = createContext(null);

export const AppThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('mito_theme');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('mito_theme', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  const currentTheme = isDarkMode ? darkTheme : theme;

  return (
    <ThemeContext.Provider value={{ 
      isDarkMode, 
      toggleTheme, 
      theme: currentTheme 
    }}>
      <ThemeProvider theme={currentTheme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within an AppThemeProvider');
  }
  return context;
};
