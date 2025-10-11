// API Configuration
const API_CONFIG = {
  // Backend API URL - Uses environment variables or defaults to Railway URL
  BACKEND_API_URL: import.meta.env.VITE_API_URL || 
    (import.meta.env.PROD 
      ? 'https://ticketing-and-task-management-system-production.up.railway.app/api' 
      : 'http://localhost:5000/api'),
  
  // API Endpoints
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      LOGOUT: '/auth/logout',
      PROFILE: '/auth/profile',
      FORGOT_PASSWORD: '/auth/forgot-password',
      RESET_PASSWORD: '/auth/reset-password',
      VERIFY_RESET_TOKEN: '/auth/verify-reset-token',
      CHANGE_PASSWORD: '/auth/change-password',
    },
    TASKS: {
      LIST: '/tasks',
      CREATE: '/tasks',
      UPDATE: '/tasks',
      DELETE: '/tasks',
      DETAIL: '/tasks',
    },
    NOTIFICATIONS: {
      LIST: '/notifications',
      MARK_READ: '/notifications',
      MARK_ALL_READ: '/notifications/read-all',
      DELETE: '/notifications',
    },
    COMMENTS: {
      LIST: '/comments',
      CREATE: '/comments',
      DELETE: '/comments',
    },
    FILES: {
      UPLOAD: '/files',
      DELETE: '/files',
    },
    DEPARTMENTS: {
      LIST: '/departments',
    },
  },
  
  // Request Configuration
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  
  // Error Messages
  ERROR_MESSAGES: {
    NETWORK_ERROR: 'Network error. Please check your connection.',
    TIMEOUT_ERROR: 'Request timeout. Please try again.',
    SERVER_ERROR: 'Server error. Please try again later.',
    UNAUTHORIZED: 'Unauthorized. Please login again.',
    FORBIDDEN: 'Access denied.',
    NOT_FOUND: 'Resource not found.',
    VALIDATION_ERROR: 'Please check your input.',
  },
};

// Socket Configuration
const SOCKET_CONFIG = {
  URL: import.meta.env.VITE_SOCKET_URL || 
    (import.meta.env.PROD 
      ? 'https://ticketing-and-task-management-system-production.up.railway.app' 
      : 'http://localhost:5000'),
  OPTIONS: {
    transports: ['websocket', 'polling'],
    timeout: 20000,
    forceNew: true,
  },
};

// PWA Configuration
const PWA_CONFIG = {
  CACHE_NAME: 'mito-pwa-cache-v1',
  OFFLINE_PAGE: '/offline',
  CACHE_STRATEGIES: {
    STATIC: 'cacheFirst',
    API: 'networkFirst',
    IMAGES: 'cacheFirst',
  },
};

// App Configuration
const APP_CONFIG = {
  NAME: 'MITO Task Manager',
  VERSION: '1.0.0',
  DESCRIPTION: 'MITO Task Management System - Progressive Web App',
  SUPPORTED_FILE_TYPES: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  REFRESH_INTERVAL: 30000, // 30 seconds
};

export { API_CONFIG, SOCKET_CONFIG, PWA_CONFIG, APP_CONFIG };
export default API_CONFIG;
