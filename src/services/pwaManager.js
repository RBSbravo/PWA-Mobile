import { Workbox } from 'workbox-window';

class PWAManager {
  constructor() {
    this.workbox = null;
    this.isOnline = navigator.onLine;
    this.updateAvailable = false;
    this.updatePrompt = null;
    this.init();
  }

  async init() {
    // Initialize Workbox
    if ('serviceWorker' in navigator) {
      this.workbox = new Workbox('/sw.js');
      
      // Handle service worker updates
      this.workbox.addEventListener('waiting', () => {
        this.updateAvailable = true;
        this.showUpdatePrompt();
      });

      // Handle service worker activation
      this.workbox.addEventListener('controlling', () => {
        window.location.reload();
      });

      // Register service worker
      try {
        await this.workbox.register();
        console.log('Service Worker registered successfully');
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }

    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.handleOnline();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.handleOffline();
    });

    // Initialize PWA features
    this.initInstallPrompt();
    this.initNotificationPermission();
  }

  // Install prompt handling
  initInstallPrompt() {
    let deferredPrompt;

    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      deferredPrompt = e;
      this.showInstallPrompt(deferredPrompt);
    });

    window.addEventListener('appinstalled', () => {
      console.log('PWA was installed');
      deferredPrompt = null;
    });
  }

  showInstallPrompt(deferredPrompt) {
    // You can customize this to show your own install button
    if (confirm('Install MITO Task Manager as an app for better experience?')) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        } else {
          console.log('User dismissed the install prompt');
        }
        deferredPrompt = null;
      });
    }
  }

  // Update prompt handling
  showUpdatePrompt() {
    if (confirm('A new version of MITO is available. Update now?')) {
      this.updateApp();
    }
  }

  async updateApp() {
    if (this.workbox) {
      this.workbox.messageSkipWaiting();
    }
  }

  // Notification permission handling
  async initNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      try {
        await Notification.requestPermission();
      } catch (error) {
        console.error('Failed to request notification permission:', error);
      }
    }
  }

  // Show notification
  showNotification(title, options = {}) {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(title, {
        icon: '/mito_logo.png',
        badge: '/mito_logo.png',
        ...options,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      return notification;
    }
  }

  // Online/Offline handling
  handleOnline() {
    console.log('App is back online');
    // Trigger sync of offline data
    this.syncOfflineData();
  }

  handleOffline() {
    console.log('App is offline');
    // Show offline indicator
    this.showOfflineIndicator();
  }

  showOfflineIndicator() {
    // You can customize this to show your own offline indicator
    if (!document.getElementById('offline-indicator')) {
      const indicator = document.createElement('div');
      indicator.id = 'offline-indicator';
      indicator.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: #f44336;
        color: white;
        text-align: center;
        padding: 8px;
        z-index: 9999;
        font-size: 14px;
      `;
      indicator.textContent = 'You are offline. Some features may not be available.';
      document.body.appendChild(indicator);
    }
  }

  hideOfflineIndicator() {
    const indicator = document.getElementById('offline-indicator');
    if (indicator) {
      indicator.remove();
    }
  }

  // Sync offline data
  async syncOfflineData() {
    try {
      // Import API service dynamically to avoid circular dependencies
      const { default: api } = await import('./api');
      await api.syncOfflineActions();
      this.hideOfflineIndicator();
    } catch (error) {
      console.error('Failed to sync offline data:', error);
    }
  }

  // Cache management
  async clearCache() {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      console.log('All caches cleared');
    }
  }

  async getCacheSize() {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      let totalSize = 0;

      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();
        for (const key of keys) {
          const response = await cache.match(key);
          if (response) {
            const blob = await response.blob();
            totalSize += blob.size;
          }
        }
      }

      return totalSize;
    }
    return 0;
  }

  // Performance monitoring
  getPerformanceMetrics() {
    if ('performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0];
      return {
        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
        firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
      };
    }
    return null;
  }

  // Utility methods
  isPWA() {
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.navigator.standalone === true;
  }

  isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  getDeviceInfo() {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      isPWA: this.isPWA(),
      isMobile: this.isMobile(),
      isOnline: this.isOnline,
    };
  }
}

// Create singleton instance
const pwaManager = new PWAManager();

export default pwaManager;
