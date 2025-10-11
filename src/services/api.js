import { API_CONFIG } from '../config';

// Helper function to handle API responses
const handleApiResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || `HTTP ${response.status}`);
  }
  return response.json();
};

// Helper function to get auth headers
const getAuthHeaders = (token) => ({
  'Content-Type': 'application/json',
  ...(token && { 'Authorization': `Bearer ${token}` })
});

// Offline storage for pending actions
const OFFLINE_STORAGE_KEY = 'mito_offline_actions';

// Helper function to store offline actions
const storeOfflineAction = async (action) => {
  try {
    const existingActions = await getOfflineActions();
    const newAction = {
      ...action,
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
      retryCount: 0
    };
    existingActions.push(newAction);
    localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(existingActions));
    return newAction;
  } catch (error) {
    console.error('Failed to store offline action:', error);
  }
};

// Helper function to get offline actions
const getOfflineActions = async () => {
  try {
    const actions = localStorage.getItem(OFFLINE_STORAGE_KEY);
    return actions ? JSON.parse(actions) : [];
  } catch (error) {
    console.error('Failed to get offline actions:', error);
    return [];
  }
};

// Helper function to remove offline action
const removeOfflineAction = async (actionId) => {
  try {
    const actions = await getOfflineActions();
    const filteredActions = actions.filter(action => action.id !== actionId);
    localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(filteredActions));
  } catch (error) {
    console.error('Failed to remove offline action:', error);
  }
};

// Helper function to check if device is online
const isOnline = () => navigator.onLine;

// Helper function to make API requests with timeout, retry, and offline support
const makeApiRequest = async (url, options, retryCount = 0) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      throw new Error(API_CONFIG.ERROR_MESSAGES.TIMEOUT_ERROR);
    }
    
    // If offline and it's a POST/PUT/DELETE request, store for later sync
    if (!isOnline() && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(options.method)) {
      const offlineAction = {
        url,
        options: {
          ...options,
          body: options.body
        },
        method: options.method
      };
      await storeOfflineAction(offlineAction);
      throw new Error('Action queued for offline sync');
    }
    
    if (retryCount < API_CONFIG.RETRY_ATTEMPTS) {
      await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))); // Exponential backoff
      return makeApiRequest(url, options, retryCount + 1);
    }
    
    throw new Error(API_CONFIG.ERROR_MESSAGES.NETWORK_ERROR);
  }
};

const api = {
  // --- Auth ---
  login: async (email, password) => {
    try {
      const response = await fetch(`${API_CONFIG.BACKEND_API_URL}${API_CONFIG.ENDPOINTS.AUTH.LOGIN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });
      
      const data = await handleApiResponse(response);
      return data; // Returns { user, token }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  register: async (userData) => {
    try {
      const response = await fetch(`${API_CONFIG.BACKEND_API_URL}${API_CONFIG.ENDPOINTS.AUTH.REGISTER}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      });
      
      const data = await handleApiResponse(response);
      return data; // Returns { user, token }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  logout: async (token) => {
    try {
      const response = await fetch(`${API_CONFIG.BACKEND_API_URL}${API_CONFIG.ENDPOINTS.AUTH.LOGOUT}`, {
        method: 'POST',
        headers: getAuthHeaders(token)
      });
      
      await handleApiResponse(response);
      return { message: 'Logged out successfully' };
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },

  getProfile: async (token) => {
    try {
      const response = await fetch(`${API_CONFIG.BACKEND_API_URL}${API_CONFIG.ENDPOINTS.AUTH.PROFILE}`, {
        method: 'GET',
        headers: getAuthHeaders(token)
      });
      
      const data = await handleApiResponse(response);
      return data; // Returns user profile
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  },

  updateProfile: async (token, userId, profileData) => {
    try {
      const response = await fetch(`${API_CONFIG.BACKEND_API_URL}/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });
      
      const data = await handleApiResponse(response);
      return data;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  },

  forgotPassword: async (email) => {
    try {
      const response = await fetch(`${API_CONFIG.BACKEND_API_URL}${API_CONFIG.ENDPOINTS.AUTH.FORGOT_PASSWORD}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      });
      
      const data = await handleApiResponse(response);
      return data;
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  },

  resetPassword: async (token, password) => {
    try {
      const response = await fetch(`${API_CONFIG.BACKEND_API_URL}${API_CONFIG.ENDPOINTS.AUTH.RESET_PASSWORD}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password })
      });
      
      const data = await handleApiResponse(response);
      return data;
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  },

  verifyResetToken: async (token) => {
    try {
      const response = await fetch(`${API_CONFIG.BACKEND_API_URL}${API_CONFIG.ENDPOINTS.AUTH.VERIFY_RESET_TOKEN}/${token}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const data = await handleApiResponse(response);
      return data;
    } catch (error) {
      console.error('Verify reset token error:', error);
      throw error;
    }
  },

  changePassword: async (token, currentPassword, newPassword) => {
    try {
      const response = await fetch(`${API_CONFIG.BACKEND_API_URL}${API_CONFIG.ENDPOINTS.AUTH.CHANGE_PASSWORD}`, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await handleApiResponse(response);
      return data;
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  },

  // --- Departments ---
  getDepartments: async () => {
    try {
      const url = `${API_CONFIG.BACKEND_API_URL}${API_CONFIG.ENDPOINTS.DEPARTMENTS.LIST}`;
      console.log('🔗 Fetching departments from:', url);
      console.log('🌐 Current origin:', window.location.origin);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        credentials: 'include'
      });
      
      console.log('📡 Departments response status:', response.status);
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
      
      const data = await handleApiResponse(response);
      console.log('✅ Departments loaded successfully:', data);
      return data;
    } catch (error) {
      console.error('❌ Get departments error:', error);
      throw error;
    }
  },

  // --- Tasks ---
  getTasks: async (token, assignedTo) => {
    let url = `${API_CONFIG.BACKEND_API_URL}${API_CONFIG.ENDPOINTS.TASKS.LIST}`;
    if (assignedTo) {
      const param = encodeURIComponent(assignedTo);
      url += `?assignedTo=${param}`;
    }
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(token)
    });
    return handleApiResponse(response);
  },

  getTask: async (taskId, token) => {
    const response = await fetch(`${API_CONFIG.BACKEND_API_URL}${API_CONFIG.ENDPOINTS.TASKS.DETAIL}/${taskId}`, {
      method: 'GET',
      headers: getAuthHeaders(token)
    });
    return handleApiResponse(response);
  },

  createTask: async (token, taskData) => {
    const response = await fetch(`${API_CONFIG.BACKEND_API_URL}${API_CONFIG.ENDPOINTS.TASKS.CREATE}`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(taskData)
    });
    return handleApiResponse(response);
  },

  updateTask: async (token, taskId, updates) => {
    const response = await fetch(`${API_CONFIG.BACKEND_API_URL}${API_CONFIG.ENDPOINTS.TASKS.UPDATE}/${taskId}`, {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify(updates)
    });
    return handleApiResponse(response);
  },

  deleteTask: async (token, taskId) => {
    const response = await fetch(`${API_CONFIG.BACKEND_API_URL}${API_CONFIG.ENDPOINTS.TASKS.DELETE}/${taskId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(token)
    });
    return handleApiResponse(response);
  },

  // --- Comments ---
  getTaskComments: async (token, taskId) => {
    const response = await fetch(`${API_CONFIG.BACKEND_API_URL}${API_CONFIG.ENDPOINTS.COMMENTS.LIST}/task/${taskId}`, {
      method: 'GET',
      headers: getAuthHeaders(token)
    });
    return handleApiResponse(response);
  },

  addTaskComment: async (token, taskId, content) => {
    const response = await fetch(`${API_CONFIG.BACKEND_API_URL}${API_CONFIG.ENDPOINTS.COMMENTS.CREATE}`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify({ content, taskId })
    });
    return handleApiResponse(response);
  },

  deleteTaskComment: async (token, commentId) => {
    const response = await fetch(`${API_CONFIG.BACKEND_API_URL}${API_CONFIG.ENDPOINTS.COMMENTS.DELETE}/${commentId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(token)
    });
    return handleApiResponse(response);
  },

  // --- Notifications ---
  getNotifications: async (token) => {
    const response = await fetch(`${API_CONFIG.BACKEND_API_URL}${API_CONFIG.ENDPOINTS.NOTIFICATIONS.LIST}`, {
      method: 'GET',
      headers: getAuthHeaders(token)
    });
    return handleApiResponse(response);
  },

  getUnreadNotificationCount: async (userId) => {
    try {
      const response = await fetch(`${API_CONFIG.BACKEND_API_URL}/notifications/unread-count/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      const data = await handleApiResponse(response);
      return data.count || 0;
    } catch (error) {
      console.error('Get unread count error:', error);
      return 0;
    }
  },

  markNotificationAsRead: async (notificationId, token) => {
    const response = await fetch(`${API_CONFIG.BACKEND_API_URL}${API_CONFIG.ENDPOINTS.NOTIFICATIONS.MARK_READ}/${notificationId}/read`, {
      method: 'PUT',
      headers: getAuthHeaders(token)
    });
    return handleApiResponse(response);
  },

  markAllNotificationsAsRead: async (token) => {
    const response = await fetch(`${API_CONFIG.BACKEND_API_URL}${API_CONFIG.ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ}`, {
      method: 'PUT',
      headers: getAuthHeaders(token)
    });
    return handleApiResponse(response);
  },

  deleteNotification: async (notificationId, token) => {
    const response = await fetch(`${API_CONFIG.BACKEND_API_URL}${API_CONFIG.ENDPOINTS.NOTIFICATIONS.DELETE}/${notificationId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return handleApiResponse(response);
  },

  // --- File Attachments ---
  uploadTaskAttachment: async (taskId, file, token) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_CONFIG.BACKEND_API_URL}${API_CONFIG.ENDPOINTS.FILES.UPLOAD}/task/${taskId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload file');
    }
    return response.json();
  },

  deleteTaskAttachment: async (fileId, token) => {
    const response = await fetch(`${API_CONFIG.BACKEND_API_URL}${API_CONFIG.ENDPOINTS.FILES.DELETE}/${fileId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return handleApiResponse(response);
  },

  // --- Offline Sync ---
  syncOfflineActions: async (token) => {
    try {
      const offlineActions = await getOfflineActions();
      const syncedActions = [];
      
      for (const action of offlineActions) {
        try {
          const response = await makeApiRequest(action.url, {
            ...action.options,
            headers: {
              ...action.options.headers,
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            await removeOfflineAction(action.id);
            syncedActions.push(action);
          }
        } catch (error) {
          console.error('Failed to sync action:', action, error);
          // Increment retry count
          action.retryCount = (action.retryCount || 0) + 1;
          if (action.retryCount > 3) {
            await removeOfflineAction(action.id);
          }
        }
      }
      
      return syncedActions;
    } catch (error) {
      console.error('Offline sync failed:', error);
      throw error;
    }
  },

  getOfflineActions: getOfflineActions,
  isOnline: isOnline,
};

export default api;
