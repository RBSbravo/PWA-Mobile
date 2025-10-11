import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst, NetworkFirst } from 'workbox-strategies';
import { BackgroundSyncPlugin } from 'workbox-background-sync';
import { BroadcastUpdatePlugin } from 'workbox-broadcast-update';

// Precache and route static assets
precacheAndRoute(self.__WB_MANIFEST);

// Clean up outdated caches
cleanupOutdatedCaches();

// Cache strategies for different types of content
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images',
    plugins: [
      new BroadcastUpdatePlugin({
        channelName: 'image-updates',
      }),
    ],
  })
);

registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'api-cache',
    networkTimeoutSeconds: 3,
    plugins: [
      new BackgroundSyncPlugin('api-queue', {
        maxRetentionTime: 24 * 60, // Retry for up to 24 hours
      }),
      new BroadcastUpdatePlugin({
        channelName: 'api-updates',
      }),
    ],
  })
);

registerRoute(
  ({ request }) => request.destination === 'script' || request.destination === 'style',
  new StaleWhileRevalidate({
    cacheName: 'static-resources',
  })
);

registerRoute(
  ({ request }) => request.destination === 'document',
  new NetworkFirst({
    cacheName: 'pages',
    networkTimeoutSeconds: 3,
  })
);

// Handle offline fallback
registerRoute(
  ({ request }) => request.mode === 'navigate',
  new NetworkFirst({
    cacheName: 'pages',
    networkTimeoutSeconds: 3,
    plugins: [
      {
        cacheKeyWillBeUsed: async ({ request }) => {
          return request.url;
        },
      },
    ],
  })
);

// Background sync for offline actions
const bgSyncPlugin = new BackgroundSyncPlugin('mito-offline-actions', {
  maxRetentionTime: 24 * 60, // Retry for up to 24 hours
});

// Handle push notifications
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body || 'You have a new notification',
      icon: '/mito_logo.png',
      badge: '/mito_logo.png',
      tag: data.tag || 'mito-notification',
      data: data.data || {},
      actions: data.actions || [],
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'MITO Task Manager', options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/notifications')
    );
  } else {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Handle background sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'mito-offline-actions') {
    event.waitUntil(syncOfflineActions());
  }
});

// Sync offline actions
async function syncOfflineActions() {
  try {
    // Get offline actions from IndexedDB
    const db = await openDB('mito-pwa-db', 1);
    const tx = db.transaction('offlineActions', 'readwrite');
    const store = tx.objectStore('offlineActions');
    const actions = await store.getAll();

    for (const action of actions) {
      try {
        const response = await fetch(action.url, action.options);
        if (response.ok) {
          await store.delete(action.id);
        } else {
          // Increment retry count
          action.retryCount = (action.retryCount || 0) + 1;
          if (action.retryCount < 3) {
            await store.put(action);
          } else {
            await store.delete(action.id);
          }
        }
      } catch (error) {
        console.error('Failed to sync action:', action, error);
        action.retryCount = (action.retryCount || 0) + 1;
        if (action.retryCount < 3) {
          await store.put(action);
        } else {
          await store.delete(action.id);
        }
      }
    }

    await tx.done;
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Handle install event
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  self.skipWaiting();
});

// Handle activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(self.clients.claim());
});

// Handle fetch events for custom caching
self.addEventListener('fetch', (event) => {
  // Handle API requests with offline support
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Clone the response before caching
          const responseClone = response.clone();
          
          // Cache successful responses
          if (response.status === 200) {
            caches.open('api-cache').then(cache => {
              cache.put(event.request, responseClone);
            });
          }
          
          return response;
        })
        .catch(() => {
          // Return cached version if network fails
          return caches.match(event.request);
        })
    );
  }
});

// Message handling for communication with main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_CACHE_SIZE') {
    getCacheSize().then(size => {
      event.ports[0].postMessage({ type: 'CACHE_SIZE', size });
    });
  }
});

// Get cache size
async function getCacheSize() {
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

// Open IndexedDB helper
function openDB(name, version) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(name, version);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('offlineActions')) {
        const store = db.createObjectStore('offlineActions', { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
        store.createIndex('retryCount', 'retryCount', { unique: false });
      }
    };
  });
}
