import { useState, useEffect } from 'react';
import socketService from '../services/socket';

export const useRealtimeUpdates = () => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const handleConnection = (data) => {
      setIsConnected(data.status === 'connected');
    };

    socketService.on('connection', handleConnection);

    return () => {
      socketService.off('connection', handleConnection);
    };
  }, []);

  const setupTaskUpdates = (onTaskUpdate, onTaskStatusChange, onTaskCreated, onTaskDeleted) => {
    if (onTaskUpdate) {
      socketService.on('taskUpdated', onTaskUpdate);
    }
    if (onTaskStatusChange) {
      socketService.on('taskStatusChanged', onTaskStatusChange);
    }
    if (onTaskCreated) {
      socketService.on('taskCreated', onTaskCreated);
    }
    if (onTaskDeleted) {
      socketService.on('taskDeleted', onTaskDeleted);
    }
  };

  const setupCommentUpdates = (onCommentAdded, onCommentDeleted) => {
    if (onCommentAdded) {
      socketService.on('commentAdded', onCommentAdded);
    }
    if (onCommentDeleted) {
      socketService.on('commentDeleted', onCommentDeleted);
    }
  };

  const setupNotificationUpdates = (onNotification) => {
    if (onNotification) {
      socketService.on('notification', onNotification);
    }
  };

  const setupPerformanceUpdates = (onPerformanceUpdate) => {
    if (onPerformanceUpdate) {
      socketService.on('performanceUpdate', onPerformanceUpdate);
    }
  };

  const cleanupListeners = () => {
    socketService.off('taskUpdated');
    socketService.off('taskStatusChanged');
    socketService.off('taskCreated');
    socketService.off('taskDeleted');
    socketService.off('commentAdded');
    socketService.off('commentDeleted');
    socketService.off('notification');
    socketService.off('performanceUpdate');
  };

  return {
    isConnected,
    setupTaskUpdates,
    setupCommentUpdates,
    setupNotificationUpdates,
    setupPerformanceUpdates,
    cleanupListeners,
  };
};
