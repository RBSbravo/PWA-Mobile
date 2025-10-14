import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import socketService from '../services/socket';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
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
      
      // Find the notification to check if it was unread
      const deletedNotification = notifications.find(n => n.id === notificationId);
      const wasUnread = deletedNotification && !deletedNotification.isRead;
      
      // Update local state - remove the notification
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      // Update unread count if the deleted notification was unread
      if (wasUnread) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      console.log('🗑️ PWA NotificationContext deleted notification:', notificationId, 'wasUnread:', wasUnread);
    } catch (error) {
      console.error('Failed to delete notification:', error);
      throw error; // Re-throw to let the UI handle the error
    }
  };

  // Add realtime notification
  const addRealtimeNotification = (notification) => {
    setNotifications(prev => {
      // Only check for exact ID match to prevent deduplication of separate notifications
      const existingNotification = prev.find(n => n.id === notification.id);
      
      if (existingNotification) {
        console.log('🔄 PWA NotificationContext: Realtime notification already exists, skipping:', notification.id);
        return prev; // No change
      }
      
      console.log('➕ PWA NotificationContext: Adding realtime notification:', notification.id, notification.type, notification.message);
      // Add new notification to the beginning
      return [notification, ...prev];
    });
    
    // Update unread count
    if (!notification.isRead) {
      setUnreadCount(prev => prev + 1);
    }
  };

  // Refresh unread count
  const refreshUnreadCount = async (count) => {
    if (count !== undefined) {
      setUnreadCount(count);
    } else if (token && user?.id) {
      try {
        const unreadCountFromAPI = await api.getUnreadNotificationCount(user.id, token);
        setUnreadCount(unreadCountFromAPI);
      } catch (error) {
        console.error('Failed to fetch unread count:', error);
        // Fallback to calculating from local notifications
        const localUnreadCount = notifications.filter(n => !n.isRead).length;
        setUnreadCount(localUnreadCount);
      }
    }
  };

  // Clear old notifications periodically to prevent accumulation
  const clearOldNotifications = () => {
    setNotifications(prev => {
      // Keep only notifications from the last 7 days
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return prev.filter(notification => {
        const notificationDate = new Date(notification.date || notification.createdAt);
        return notificationDate > oneWeekAgo;
      });
    });
  };

  // Cleanup old notifications periodically to prevent accumulation
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      clearOldNotifications();
    }, 300000); // Clean up every 5 minutes

    return () => clearInterval(cleanupInterval);
  }, []);

  // Calculate unread count from notifications
  const calculateUnreadCount = (notificationList) => {
    return notificationList.filter(n => !n.isRead).length;
  };

  // Update unread count whenever notifications change
  useEffect(() => {
    const newUnreadCount = calculateUnreadCount(notifications);
    setUnreadCount(newUnreadCount);
  }, [notifications]);

  // Fetch notifications when token changes
  useEffect(() => {
    if (token) {
      fetchNotifications();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [token]);

  // Setup socket listeners for real-time notifications (like mobile app)
  useEffect(() => {
    if (user?.id && token && !listenerSetupRef.current) {
      listenerSetupRef.current = true;
      
      const handleNotification = (notif) => {
        console.log('🔔 PWA NotificationContext received notification:', notif);
        
        // Handle backend notification format: { type: 'NEW_NOTIFICATION', data: notification }
        const notificationData = notif.data || notif;
        console.log('🔔 PWA NotificationContext processed notification data:', notificationData);
        console.log('🔔 PWA NotificationContext notification ID:', notificationData.id);
        console.log('🔔 PWA NotificationContext notification type:', notificationData.type);
        
        // Debug: Check if this notification is for the current user
        console.log('👤 PWA NotificationContext current user ID:', user?.id);
        console.log('👤 PWA NotificationContext notification user ID:', notificationData.userId);
        console.log('👤 PWA NotificationContext related user ID:', notificationData.relatedUserId);
        
        // Skip notifications that are for the current user's own actions
        if (notificationData.relatedUserId && notificationData.relatedUserId === user?.id) {
          console.log('🚫 PWA NotificationContext: Skipping notification for own action:', notificationData.type);
          return;
        }
        
        // Debug: Check if this is an assigned task notification
        if (notificationData.type === 'task_assigned' || notificationData.message?.includes('assigned')) {
          console.log('🎯 PWA Assigned Task Notification detected:', notificationData);
          console.log('🎯 PWA Notification type:', notificationData.type);
          console.log('🎯 PWA Notification message:', notificationData.message);
          console.log('🎯 PWA Notification title:', notificationData.title);
        }
        
        // Debug: Check if this is a comment notification
        if (notificationData.type === 'comment_added' || notificationData.message?.includes('commented')) {
          console.log('💬 PWA Comment Notification detected:', notificationData);
          console.log('💬 PWA Notification type:', notificationData.type);
          console.log('💬 PWA Notification message:', notificationData.message);
        }
        
        // Debug: Check if this is a file upload notification
        if (notificationData.type === 'file_uploaded' || notificationData.message?.includes('file was uploaded')) {
          console.log('📁 PWA File Upload Notification detected:', notificationData);
          console.log('📁 PWA Notification type:', notificationData.type);
          console.log('📁 PWA Notification message:', notificationData.message);
        }
        
        // Debug: Check if this is a task update notification
        if (notificationData.type === 'task_updated' || notificationData.message?.includes('has been updated')) {
          console.log('🔄 PWA Task Update Notification detected:', notificationData);
          console.log('🔄 PWA Notification type:', notificationData.type);
          console.log('🔄 PWA Notification message:', notificationData.message);
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
          id: notificationData.id || notif.id || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          title: title,
          message: message,
          type: notificationData.type || notif.type || 'system',
          isRead: false,
          date: notificationData.createdAt || notificationData.date || notif.createdAt || notif.date || new Date().toISOString(),
          taskId: notificationData.taskId || notif.taskId,
          ticketId: notificationData.ticketId || notif.ticketId
        };
        
        // Add to notifications list only if it's new
        setNotifications(prev => {
          // Only check for exact ID match to prevent deduplication of separate notifications
          const existingNotification = prev.find(n => n.id === notification.id);
          
          if (existingNotification) {
            console.log('🔄 PWA NotificationContext: Notification already exists, skipping:', notification.id);
            return prev; // No change
          }
          
          console.log('➕ PWA NotificationContext: Adding new notification:', notification.id, notification.type, notification.message);
          console.log('📊 PWA NotificationContext: Total notifications after add:', prev.length + 1);
          // Add new notification to the beginning
          return [notification, ...prev];
        });
        
        // Update unread count
        setUnreadCount(prev => prev + 1);
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
      loading,
      fetchNotifications,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      addRealtimeNotification,
      refreshUnreadCount,
      clearOldNotifications,
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
