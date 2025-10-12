import { io } from 'socket.io-client';
import { SOCKET_CONFIG } from '../config';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  connect(token, userId) {
    if (this.socket && this.isConnected) {
      return;
    }

    try {
      this.socket = io(SOCKET_CONFIG.URL, {
        ...SOCKET_CONFIG.OPTIONS,
        auth: {
          token: token
        }
      });

      this.setupEventListeners(userId);
    } catch (error) {
      console.error('Socket connection failed:', error);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.listeners.clear();
    }
  }

  setupEventListeners(userId) {
    if (!this.socket) {
      return;
    }

    this.socket.on('connect', () => {
      this.isConnected = true;
      this.reconnectAttempts = 0;
      
      // Join user-specific room like mobile app
      if (userId) {
        this.socket.emit('join', userId);
      }
      
      this.emit('connection', { status: 'connected' });
    });

    this.socket.on('disconnect', (reason) => {
      this.isConnected = false;
      this.emit('connection', { status: 'disconnected', reason });
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
        this.emit('connection', { status: 'failed', error });
      }
    });

    // Task-related events
    this.socket.on('taskCreated', (task) => {
      this.emit('taskCreated', task);
    });

    this.socket.on('taskUpdated', (task) => {
      this.emit('taskUpdated', task);
    });

    this.socket.on('taskDeleted', (data) => {
      this.emit('taskDeleted', data);
    });

    this.socket.on('taskStatusChanged', (data) => {
      this.emit('taskStatusChanged', data);
    });

    // Additional task events from mobile app
    this.socket.on('task_update', (task) => {
      this.emit('taskUpdated', task);
    });

    this.socket.on('task_status_change', (data) => {
      this.emit('taskStatusChanged', data);
    });

    this.socket.on('task_assignment_change', (data) => {
      this.emit('taskAssignmentChanged', data);
    });

    this.socket.on('task_deleted', (data) => {
      this.emit('taskDeleted', data);
    });

    // Comment-related events
    this.socket.on('commentAdded', (comment) => {
      this.emit('commentAdded', comment);
    });

    this.socket.on('commentDeleted', (data) => {
      this.emit('commentDeleted', data);
    });

    // Additional comment events from mobile app
    this.socket.on('new_comment', (comment) => {
      this.emit('commentAdded', comment);
    });

    this.socket.on('comment_update', (comment) => {
      this.emit('commentUpdated', comment);
    });

    this.socket.on('comment_deleted', (data) => {
      this.emit('commentDeleted', data);
    });

    // Notification events
    this.socket.on('notification', (notification) => {
      console.log('🔔 PWA SocketService received notification:', notification);
      this.emit('notification', notification);
    });

    // Additional notification events from mobile app
    this.socket.on('notification_removed', (data) => {
      this.emit('notificationRemoved', data);
    });

    // Performance metrics
    this.socket.on('performanceUpdate', (performance) => {
      this.emit('performanceUpdate', performance);
    });

    // User activity
    this.socket.on('userActivity', (activity) => {
      this.emit('userActivity', activity);
    });
  }

  // Emit event to all listeners
  emit(event, data) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  // Add event listener
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  // Remove event listener
  off(event, callback) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(callback);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  // Join room for specific updates
  joinRoom(room) {
    if (this.socket && this.isConnected) {
      this.socket.emit('joinRoom', room);
    }
  }

  // Leave room
  leaveRoom(room) {
    if (this.socket && this.isConnected) {
      this.socket.emit('leaveRoom', room);
    }
  }

  // Send custom event
  emitEvent(event, data) {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data);
    }
  }

  // Get connection status
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts
    };
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;
