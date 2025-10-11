import { useState, useEffect } from 'react';
import pwaManager from '../services/pwaManager';

export const usePWA = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isPWA, setIsPWA] = useState(pwaManager.isPWA());
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const showNotification = (title, options) => {
    return pwaManager.showNotification(title, options);
  };

  const clearCache = async () => {
    await pwaManager.clearCache();
  };

  const getCacheSize = async () => {
    return await pwaManager.getCacheSize();
  };

  const getPerformanceMetrics = () => {
    return pwaManager.getPerformanceMetrics();
  };

  const getDeviceInfo = () => {
    return pwaManager.getDeviceInfo();
  };

  return {
    isOnline,
    isPWA,
    updateAvailable,
    showNotification,
    clearCache,
    getCacheSize,
    getPerformanceMetrics,
    getDeviceInfo,
  };
};
