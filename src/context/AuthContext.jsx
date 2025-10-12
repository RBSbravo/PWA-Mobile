import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_CONFIG } from '../config';
import api from '../services/api';
import AuthLoadingOverlay from '../components/AuthLoadingOverlay';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  useEffect(() => {
    const loadUserFromStorage = async () => {
      try {
        const storedUser = localStorage.getItem('mito_user');
        const storedToken = localStorage.getItem('mito_token');
        
        if (storedUser && storedToken) {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
          
          // Validate token with backend
          try {
            await api.getProfile(storedToken);
          } catch (error) {
            // Token is invalid, clear storage
            localStorage.removeItem('mito_user');
            localStorage.removeItem('mito_token');
            setUser(null);
            setToken(null);
          }
        }
      } catch (e) {
        console.error('Failed to load user from storage', e);
      } finally {
        setLoading(false);
      }
    };

    loadUserFromStorage();
  }, []);

  const login = async (email, password) => {
    setLoginLoading(true);
    try {
      const response = await api.login(email, password);
      const { user: userData, token: authToken } = response;
      
      // Add 2-second delay for better UX
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Store user and token
      localStorage.setItem('mito_user', JSON.stringify(userData));
      localStorage.setItem('mito_token', authToken);
      
      setUser(userData);
      setToken(authToken);
      
      return userData;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setLoginLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.register(userData);
      const { user: newUser } = response;
      return newUser;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    setLogoutLoading(true);
    try {
      // Call logout endpoint if we have a token
      if (token) {
        await api.logout(token);
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
      // Continue with local logout even if API call fails
    } finally {
      // Add 2-second delay for better UX
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Clear local storage and state
      localStorage.removeItem('mito_user');
      localStorage.removeItem('mito_token');
      setUser(null);
      setToken(null);
      setLogoutLoading(false);
    }
  };

  const updateProfile = async (updates) => {
    try {
      const updatedUser = await api.getProfile(token);
      const newUserData = { ...user, ...updatedUser };
      
      localStorage.setItem('mito_user', JSON.stringify(newUserData));
      setUser(newUserData);
      
      return newUserData;
    } catch (error) {
      console.error('Profile update failed:', error);
      throw error;
    }
  };

  const forgotPassword = async (email) => {
    try {
      return await api.forgotPassword(email);
    } catch (error) {
      console.error('Forgot password failed:', error);
      throw error;
    }
  };

  const resetPassword = async (resetToken, newPassword) => {
    try {
      return await api.resetPassword(resetToken, newPassword);
    } catch (error) {
      console.error('Reset password failed:', error);
      throw error;
    }
  };

  const verifyResetToken = async (resetToken) => {
    try {
      return await api.verifyResetToken(resetToken);
    } catch (error) {
      console.error('Verify reset token failed:', error);
      throw error;
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      return await api.changePassword(token, currentPassword, newPassword);
    } catch (error) {
      console.error('Change password failed:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token,
      loading,
      logoutLoading,
      loginLoading, 
      login, 
      register,
      logout, 
      updateProfile,
      forgotPassword,
      resetPassword,
      verifyResetToken,
      changePassword,
      isAuthenticated: !!user && !!token 
    }}>
      {children}
      
      {/* Global Auth Loading Overlays */}
      <AuthLoadingOverlay 
        visible={loginLoading} 
        message="Signing you in..." 
      />
      <AuthLoadingOverlay 
        visible={logoutLoading} 
        message="Logging you out..." 
      />
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
