import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import socketService from '../services/socket';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [realtimeNotifications, setRealtimeNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const { token, user } = useAuth();

  // Fetch notifications from API
  const fetchNotifications = async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      const data = await api.getNotifications(token);
      const notificationsList = data.notifications || data;
      setNotifications(notificationsList);
      
      // Calculate unread count
      const unread = notificationsList.filter(n => !n.isRead).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    if (!token) return;
    
    try {
      await api.markNotificationAsRead(notificationId, token);
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, isRead: true } : n
        )
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!token) return;
    
    try {
      await api.markAllNotificationsAsRead(token);
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => ({ ...n, isRead: true }))
      );
      
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId) => {
    if (!token) return;
    
    try {
      await api.deleteNotification(notificationId, token);
      
      // Update local state
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      // Update unread count if the deleted notification was unread
      const deletedNotification = notifications.find(n => n.id === notificationId);
      if (deletedNotification && !deletedNotification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  // Add realtime notification
  const addRealtimeNotification = (notification) => {
    setRealtimeNotifications(prev => [notification, ...prev]);
    
    // Add to main notifications list
    setNotifications(prev => [notification, ...prev]);
    
    // Update unread count
    if (!notification.isRead) {
      setUnreadCount(prev => prev + 1);
    }
  };

  // Refresh unread count
  const refreshUnreadCount = (count) => {
    setUnreadCount(count);
  };

  // Clear realtime notifications
  const clearRealtimeNotifications = () => {
    setRealtimeNotifications([]);
  };

  // Cleanup real-time notifications periodically to prevent accumulation
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      setRealtimeNotifications(prev => {
        // Keep only notifications from the last 24 hours
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return prev.filter(notification => {
          const notificationDate = new Date(notification.date);
          return notificationDate > oneDayAgo;
        });
      });
    }, 60000); // Clean up every minute

    return () => clearInterval(cleanupInterval);
  }, []);

  // Fetch notifications when token changes
  useEffect(() => {
    if (token) {
      fetchNotifications();
    } else {
      setNotifications([]);
      setUnreadCount(0);
      setRealtimeNotifications([]);
    }
  }, [token]);

  // Setup socket listeners for real-time notifications
  useEffect(() => {
    let notificationTimeout;
    
    const handleRealtimeNotification = (notification) => {
      // Debounce rapid notifications
      if (notificationTimeout) {
        clearTimeout(notificationTimeout);
      }
      
      notificationTimeout = setTimeout(() => {
        // Use functional updates to avoid stale closure issues
        setNotifications(prevNotifications => {
          // Check if notification already exists to prevent duplicates
          const existingNotification = prevNotifications.find(n => 
            n.id === notification.id || 
            (n.title === notification.title && n.message === notification.message && 
             Math.abs(new Date(n.date) - new Date(notification.date || notification.createdAt || new Date())) < 1000)
          );
          
          if (existingNotification) {
            return prevNotifications; // No change
          }
          
          // Ensure notification has proper structure with unique ID
          const formattedNotification = {
            id: notification.id || `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            title: notification.title || notification.message || 'New notification',
            message: notification.message || notification.title || 'You have a new notification',
            type: notification.type || 'system',
            isRead: false,
            date: notification.date || notification.createdAt || new Date().toISOString(),
            taskId: notification.taskId,
            ticketId: notification.ticketId,
            userId: notification.userId,
          };
          
          // Add to main notifications list
          const newNotifications = [formattedNotification, ...prevNotifications];
          
          // Update unread count
          if (!formattedNotification.isRead) {
            setUnreadCount(prev => prev + 1);
          }
          
          return newNotifications;
        });
        
        // Add to real-time notifications
        setRealtimeNotifications(prev => {
          const existingNotification = prev.find(n => 
            n.id === notification.id || 
            (n.title === notification.title && n.message === notification.message &&
             Math.abs(new Date(n.date) - new Date(notification.date || notification.createdAt || new Date())) < 1000)
          );
          
          if (existingNotification) {
            return prev; // No change
          }
          
          const formattedNotification = {
            id: notification.id || `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            title: notification.title || notification.message || 'New notification',
            message: notification.message || notification.title || 'You have a new notification',
            type: notification.type || 'system',
            isRead: false,
            date: notification.date || notification.createdAt || new Date().toISOString(),
            taskId: notification.taskId,
            ticketId: notification.ticketId,
            userId: notification.userId,
          };
          
          return [formattedNotification, ...prev];
        });
      }, 100); // 100ms debounce
    };

    // Listen for notification events
    socketService.on('notification', handleRealtimeNotification);

    return () => {
      if (notificationTimeout) {
        clearTimeout(notificationTimeout);
      }
      socketService.off('notification', handleRealtimeNotification);
    };
  }, []); // Empty dependency array - socket listener should only be set up once

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      realtimeNotifications,
      loading,
      fetchNotifications,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      addRealtimeNotification,
      refreshUnreadCount,
      clearRealtimeNotifications,
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
