// Rate limiting utilities for PWA mobile app
export class PWARateLimitHandler {
  constructor() {
    this.rateLimitInfo = null;
    this.retryTimers = new Map();
  }

  // Handle rate limit error from API response
  handleRateLimitError(error) {
    if (error.status === 429 || error.message?.includes('429')) {
      const rateLimitData = {
        error: error.message || 'Too many requests',
        retryAfter: '15 minutes', // Default fallback
        limit: null,
        remaining: null,
        reset: null
      };

      this.rateLimitInfo = rateLimitData;
      
      // Calculate retry time
      const retryTime = this.calculateRetryTime(rateLimitData);
      
      return {
        isRateLimited: true,
        message: rateLimitData.error,
        retryAfter: rateLimitData.retryAfter,
        retryTime: retryTime,
        limit: rateLimitData.limit,
        remaining: rateLimitData.remaining,
        reset: rateLimitData.reset
      };
    }
    
    return { isRateLimited: false };
  }

  // Calculate retry time in milliseconds
  calculateRetryTime(rateLimitData) {
    if (rateLimitData.reset) {
      const resetTime = parseInt(rateLimitData.reset) * 1000;
      const currentTime = Date.now();
      return Math.max(0, resetTime - currentTime);
    }
    
    // Fallback to parsing retryAfter text
    const retryText = rateLimitData.retryAfter.toLowerCase();
    if (retryText.includes('minute')) {
      const minutes = parseInt(retryText.match(/\d+/)?.[0] || '15');
      return minutes * 60 * 1000;
    } else if (retryText.includes('hour')) {
      const hours = parseInt(retryText.match(/\d+/)?.[0] || '1');
      return hours * 60 * 60 * 1000;
    }
    
    return 15 * 60 * 1000; // Default 15 minutes
  }

  // Format retry time for display
  formatRetryTime(retryTime) {
    const minutes = Math.ceil(retryTime / (60 * 1000));
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${minutes}m`;
  }

  // Get user-friendly error message
  getUserFriendlyMessage(rateLimitData) {
    const retryTime = this.calculateRetryTime(rateLimitData);
    const formattedTime = this.formatRetryTime(retryTime);
    
    if (rateLimitData.error.includes('authentication') || rateLimitData.error.includes('login')) {
      return `Too many login attempts. Please try again in ${formattedTime}.`;
    } else if (rateLimitData.error.includes('registration') || rateLimitData.error.includes('register')) {
      return `Too many registration attempts. Please try again in ${formattedTime}.`;
    } else if (rateLimitData.error.includes('password reset')) {
      return `Too many password reset attempts. Please try again in ${formattedTime}.`;
    }
    
    return `Too many requests. Please try again in ${formattedTime}.`;
  }

  // Check if we can retry a request
  canRetry(endpoint) {
    const retryTime = this.retryTimers.get(endpoint);
    if (!retryTime) return true;
    
    return Date.now() >= retryTime;
  }

  // Set retry timer for an endpoint
  setRetryTimer(endpoint, retryTime) {
    this.retryTimers.set(endpoint, Date.now() + retryTime);
  }

  // Clear retry timer
  clearRetryTimer(endpoint) {
    this.retryTimers.delete(endpoint);
  }

  // Get remaining time for retry
  getRemainingRetryTime(endpoint) {
    const retryTime = this.retryTimers.get(endpoint);
    if (!retryTime) return 0;
    
    return Math.max(0, retryTime - Date.now());
  }

  // Reset all rate limit info
  reset() {
    this.rateLimitInfo = null;
    this.retryTimers.clear();
  }
}

// Create singleton instance
export const pwaRateLimitHandler = new PWARateLimitHandler();

// Helper function to handle API errors with rate limiting
export const handlePWAApiError = (error) => {
  const rateLimitResult = pwaRateLimitHandler.handleRateLimitError(error);
  
  if (rateLimitResult.isRateLimited) {
    return {
      type: 'rate_limit',
      message: pwaRateLimitHandler.getUserFriendlyMessage(rateLimitResult),
      retryAfter: rateLimitResult.retryAfter,
      retryTime: rateLimitResult.retryTime,
      limit: rateLimitResult.limit,
      remaining: rateLimitResult.remaining
    };
  }
  
  // Handle other errors
  if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
    return {
      type: 'unauthorized',
      message: 'Invalid credentials. Please check your email and password.'
    };
  }
  
  if (error.message?.includes('400') || error.message?.includes('Bad Request')) {
    return {
      type: 'validation',
      message: 'Invalid input. Please check your data.'
    };
  }
  
  if (error.message?.includes('500') || error.message?.includes('Server Error')) {
    return {
      type: 'server_error',
      message: 'Server error. Please try again later.'
    };
  }
  
  if (error.message?.includes('Network') || error.message?.includes('fetch')) {
    return {
      type: 'network_error',
      message: 'Network error. Please check your connection.'
    };
  }
  
  return {
    type: 'unknown',
    message: error.message || 'An unexpected error occurred.'
  };
};

// Helper function to create retry delay
export const createPWARetryDelay = (attemptNumber) => {
  // Exponential backoff: 1s, 2s, 4s, 8s, 16s
  return Math.min(1000 * Math.pow(2, attemptNumber), 30000);
};

// Helper function to check if error is retryable
export const isPWARetryableError = (error) => {
  const message = error.message?.toLowerCase() || '';
  return message.includes('500') || message.includes('429') || message.includes('network') || message.includes('timeout');
};

export default pwaRateLimitHandler;

