import React, { createContext, useContext, useState } from 'react';
import { Snackbar, Alert } from '@mui/material';

const ErrorContext = createContext(null);

export const ErrorProvider = ({ children }) => {
  const [error, setError] = useState(null);

  const showError = (message) => {
    setError(message);
  };

  const hideError = () => {
    setError(null);
  };

  return (
    <ErrorContext.Provider value={{ 
      error, 
      showError, 
      hideError 
    }}>
      {children}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={hideError}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={hideError} 
          severity="error" 
          sx={{ width: '100%' }}
        >
          {error}
        </Alert>
      </Snackbar>
    </ErrorContext.Provider>
  );
};

export const useError = () => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
};
