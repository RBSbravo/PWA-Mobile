import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';

// Context Providers
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import { ErrorProvider } from './context/ErrorContext';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import DashboardPage from './pages/DashboardPage';
import TasksPage from './pages/TasksPage';
import TaskDetailPage from './pages/TaskDetailPage';
import NotificationsPage from './pages/NotificationsPage';
import ProfilePage from './pages/ProfilePage';
import FileViewerPage from './pages/FileViewerPage';
import OfflinePage from './pages/OfflinePage';

// Components
import Layout from './components/Layout';
import GlobalNotificationSnackbar from './components/GlobalNotificationSnackbar';
import ErrorBoundary from './components/ErrorBoundary';

// Services
import socketService from './services/socket';
import api from './services/api';

// App Content Component
const AppContent = () => {
  const { isAuthenticated, loading, token, user } = useAuth();

  // Initialize socket connection when user is authenticated
  useEffect(() => {
    if (isAuthenticated && token) {
      socketService.connect(token);
      
      // Join user-specific room
      if (user?.id) {
        socketService.joinRoom(`user_${user.id}`);
      }
    } else {
      socketService.disconnect();
    }

    return () => {
      socketService.disconnect();
    };
  }, [isAuthenticated, token, user]);

  // Sync offline actions when coming back online
  useEffect(() => {
    const handleOnline = async () => {
      if (isAuthenticated && token) {
        try {
          await api.syncOfflineActions(token);
        } catch (error) {
          console.error('Failed to sync offline actions:', error);
        }
      }
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [isAuthenticated, token]);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        sx={{
          backgroundColor: theme.palette.background.default,
        }}
      >
        <Box textAlign="center" color="text.primary">
          <CircularProgress color="primary" size={60} />
          <Box mt={2} fontSize="18px" fontWeight={500}>
            MITO Task Manager
          </Box>
          <Box mt={1} fontSize="14px" opacity={0.8}>
            Loading your workspace...
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} 
        />
        <Route 
          path="/register" 
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterPage />} 
        />
        <Route 
          path="/forgot-password" 
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <ForgotPasswordPage />} 
        />
        <Route 
          path="/reset-password/:token" 
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <ResetPasswordPage />} 
        />
        <Route path="/offline" element={<OfflinePage />} />

        {/* Protected Routes */}
        <Route
          path="/*"
          element={
            isAuthenticated ? (
              <Layout>
                <Routes>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/tasks" element={<TasksPage />} />
                  <Route path="/tasks/:id" element={<TaskDetailPage />} />
                  <Route path="/notifications" element={<NotificationsPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/file-viewer/:fileId" element={<FileViewerPage />} />
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
      
      <GlobalNotificationSnackbar />
    </Router>
  );
};

// Main App Component
const App = () => {
  return (
    <ErrorBoundary>
      <AppThemeProvider>
        <ErrorProvider>
          <AuthProvider>
            <NotificationProvider>
              <AppContent />
            </NotificationProvider>
          </AuthProvider>
        </ErrorProvider>
      </AppThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
