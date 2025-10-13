import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
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
  const listenerSetupRef = useRef(false);

  // Fetch notifications from API
  const fetchNotifications = async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      const data = await api.getNotifications(token);
      const notificationsList = data.notifications || data;
      
      // Filter out notifications without proper content (like mobile app)
      const validNotifications = notificationsList.filter(notification => {
        const hasContent = notification.title || notification.message;
        return hasContent;
      }).map(notification => {
        // Ensure all notifications have both title and message for consistency
        return {
          ...notification,
          title: notification.title || notification.message || 'New notification',
          message: notification.message || notification.title || 'You have a new notification'
        };
      });
      
      setNotifications(validNotifications);
      
      // Calculate unread count
      const unread = validNotifications.filter(n => !n.isRead).length;
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

  // Add realtime notification (like mobile app - only for real-time notifications)
  const addRealtimeNotification = (notification) => {
    setRealtimeNotifications(prev => [notification, ...prev]);
    
    // Only add to main notifications list if it's truly new (not from API fetch)
    setNotifications(prev => {
      // Check if notification already exists
      const existingNotification = prev.find(n => 
        n.id === notification.id || 
        (n.title === notification.title && n.message === notification.message && 
         Math.abs(new Date(n.date) - new Date(notification.date || notification.createdAt || new Date())) < 1000)
      );
      
      if (existingNotification) {
        return prev; // No change
      }
      
      return [notification, ...prev];
    });
    
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

  // Setup socket listeners for real-time notifications (like mobile app)
  useEffect(() => {
    console.log('🔌 PWA NotificationContext setting up socket listeners for user:', user?.id, 'token:', !!token, 'listenerSetupRef:', listenerSetupRef.current);
    
    if (user?.id && token && !listenerSetupRef.current) {
      listenerSetupRef.current = true;
      console.log('🔌 PWA NotificationContext setting up socket listener');
      
      const handleNotification = (notif) => {
        console.log('🔔 PWA NotificationContext received notification:', notif);
        console.log('🔔 PWA NotificationContext notification type:', notif.type);
        console.log('🔔 PWA NotificationContext notification data:', notif.data);
        
        // Handle backend notification format: { type: 'NEW_NOTIFICATION', data: notification }
        const notificationData = notif.data || notif;
        console.log('🔔 PWA NotificationContext processed notification data:', notificationData);
        console.log('🔔 PWA NotificationContext notificationData type:', notificationData.type);
        console.log('🔔 PWA NotificationContext notificationData message:', notificationData.message);
        console.log('🔔 PWA NotificationContext notificationData id:', notificationData.id);
        
        // Debug: Check if this is an assigned task notification
        if (notificationData.type === 'task_assigned' || notificationData.message?.includes('assigned')) {
          console.log('🎯 PWA Assigned Task Notification detected:', notificationData);
          console.log('🎯 PWA Notification type:', notificationData.type);
          console.log('🎯 PWA Notification message:', notificationData.message);
          console.log('🎯 PWA Notification title:', notificationData.title);
          console.log('🎯 PWA Notification id:', notificationData.id);
        }
        
        // Ensure the notification has proper structure without duplication (like mobile app)
        // Check both direct properties and data properties
        let title = notif.title || notif.data?.title || notificationData.title || '';
        let message = notif.message || notif.data?.message || notificationData.message || '';
        
        // If we have both title and message, use them as is
        // If we only have one of them, use it for both to avoid duplication
        if (title && message && title !== message) {
          // Both exist and are different, use them as is
        } else if (title && !message) {
          // Only title exists, use it for both
          message = title;
        } else if (!title && message) {
          // Only message exists, use it for both
          title = message;
        } else {
          // Neither exists, use fallback
          title = 'New notification';
          message = 'You have a new notification';
        }
        
        const notification = {
          id: notificationData.id || notif.id || Date.now(),
          title: title,
          message: message,
          type: notificationData.type || notif.type || 'system',
          isRead: false,
          date: notificationData.createdAt || notificationData.date || notif.createdAt || notif.date || new Date().toISOString(),
          taskId: notificationData.taskId || notif.taskId,
          ticketId: notificationData.ticketId || notif.ticketId
        };
        
        // Add to real-time notifications (like mobile app)
        setRealtimeNotifications(prev => [notification, ...prev]);
        
        console.log('🔔 PWA NotificationContext adding to realtime notifications:', notification);
        
        // Add to main notifications list only if it's new
        setNotifications(prev => {
          const existingNotification = prev.find(n => 
            n.id === notification.id || 
            (n.title === notification.title && n.message === notification.message)
          );
          
          if (existingNotification) {
            console.log('🔔 PWA NotificationContext notification already exists, skipping:', existingNotification);
            return prev; // No change
          }
          
          console.log('🔔 PWA NotificationContext adding to main notifications list:', notification);
          return [notification, ...prev];
        });
        
        // Update unread count
        setUnreadCount(prev => {
          console.log('🔔 PWA NotificationContext updating unread count from', prev, 'to', prev + 1);
          return prev + 1;
        });
      };
      
      // Listen for notification events
      socketService.on('notification', handleNotification);

      return () => {
        socketService.off('notification', handleNotification);
        listenerSetupRef.current = false;
      };
    }
  }, [user, token]); // Dependencies like mobile app

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
