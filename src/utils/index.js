import { format, parseISO, isValid, differenceInDays, differenceInHours, differenceInMinutes } from 'date-fns';

// Date utilities
export const formatDate = (date, formatString = 'MMM dd, yyyy') => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return isValid(dateObj) ? format(dateObj, formatString) : '';
  } catch (error) {
    console.error('Date formatting error:', error);
    return '';
  }
};

export const formatDateTime = (date) => {
  return formatDate(date, 'MMM dd, yyyy HH:mm');
};

export const getRelativeTime = (date) => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return '';

    const now = new Date();
    const daysDiff = differenceInDays(now, dateObj);
    const hoursDiff = differenceInHours(now, dateObj);
    const minutesDiff = differenceInMinutes(now, dateObj);

    if (daysDiff > 0) {
      return `${daysDiff} day${daysDiff > 1 ? 's' : ''} ago`;
    } else if (hoursDiff > 0) {
      return `${hoursDiff} hour${hoursDiff > 1 ? 's' : ''} ago`;
    } else if (minutesDiff > 0) {
      return `${minutesDiff} minute${minutesDiff > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  } catch (error) {
    console.error('Relative time error:', error);
    return '';
  }
};

export const isOverdue = (dueDate) => {
  if (!dueDate) return false;
  
  try {
    const due = typeof dueDate === 'string' ? parseISO(dueDate) : dueDate;
    return isValid(due) && due < new Date();
  } catch (error) {
    console.error('Overdue check error:', error);
    return false;
  }
};

// String utilities
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};

export const capitalizeFirst = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Task utilities
export const getTaskStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'completed':
      return 'success';
    case 'pending':
      return 'warning';
    case 'in progress':
      return 'info';
    case 'overdue':
      return 'error';
    default:
      return 'default';
  }
};

export const getTaskPriorityColor = (priority) => {
  switch (priority?.toLowerCase()) {
    case 'high':
      return 'error';
    case 'medium':
      return 'warning';
    case 'low':
      return 'success';
    default:
      return 'default';
  }
};

// Validation utilities
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return {
    isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers,
    errors: {
      minLength: password.length < minLength,
      noUpperCase: !hasUpperCase,
      noLowerCase: !hasLowerCase,
      noNumbers: !hasNumbers,
      noSpecialChar: !hasSpecialChar,
    }
  };
};

// Local storage utilities
export const setLocalStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Failed to set localStorage:', error);
  }
};

export const getLocalStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Failed to get localStorage:', error);
    return defaultValue;
  }
};

export const removeLocalStorage = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Failed to remove localStorage:', error);
  }
};

// Debounce utility
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle utility
export const throttle = (func, limit) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Error handling utilities
export const handleApiError = (error) => {
  console.error('API Error:', error);
  
  if (error.response) {
    // Server responded with error status
    return error.response.data?.message || 'Server error occurred';
  } else if (error.request) {
    // Request was made but no response received
    return 'Network error. Please check your connection.';
  } else {
    // Something else happened
    return error.message || 'An unexpected error occurred';
  }
};

// File utilities
export const getFileExtension = (filename) => {
  return filename?.split('.').pop()?.toLowerCase() || '';
};

export const isImageFile = (filename) => {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
  return imageExtensions.includes(getFileExtension(filename));
};

export const isDocumentFile = (filename) => {
  const documentExtensions = ['pdf', 'doc', 'docx', 'txt', 'rtf'];
  return documentExtensions.includes(getFileExtension(filename));
};

// Color utilities
export const hexToRgba = (hex, alpha = 1) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const generateRandomColor = () => {
  const colors = [
    '#667eea', '#764ba2', '#f093fb', '#f5576c',
    '#4facfe', '#00f2fe', '#43e97b', '#38f9d7',
    '#fa709a', '#fee140', '#a8edea', '#fed6e3'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};
