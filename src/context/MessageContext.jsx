import React, { createContext, useState, useCallback, useContext } from 'react';
import { Snackbar, Alert } from '@mui/material';

const MessageContext = createContext(null);

export const MessageProvider = ({ children }) => {
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('info'); // 'success', 'error', 'warning', 'info'
  const [open, setOpen] = useState(false);

  const showMessage = useCallback((text, type = 'info') => {
    setMessage(text);
    setMessageType(type);
    setOpen(true);
  }, []);

  const showSuccess = useCallback((text) => {
    showMessage(text, 'success');
  }, [showMessage]);

  const showError = useCallback((text) => {
    showMessage(text, 'error');
  }, [showMessage]);

  const showWarning = useCallback((text) => {
    showMessage(text, 'warning');
  }, [showMessage]);

  const showInfo = useCallback((text) => {
    showMessage(text, 'info');
  }, [showMessage]);

  const hideMessage = useCallback(() => {
    setOpen(false);
  }, []);

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    hideMessage();
  };

  return (
    <MessageContext.Provider value={{ 
      showMessage, 
      showSuccess, 
      showError, 
      showWarning, 
      showInfo, 
      hideMessage 
    }}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={6000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleClose} 
          severity={messageType}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {message}
        </Alert>
      </Snackbar>
    </MessageContext.Provider>
  );
};

export const useMessage = () => {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error('useMessage must be used within a MessageProvider');
  }
  return context;
};
