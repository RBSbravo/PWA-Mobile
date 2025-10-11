import { openDB } from 'idb';

const DB_NAME = 'mito-pwa-db';
const DB_VERSION = 1;
const STORES = {
  TASKS: 'tasks',
  NOTIFICATIONS: 'notifications',
  USER_DATA: 'userData',
  OFFLINE_ACTIONS: 'offlineActions',
};

class PWADatabase {
  constructor() {
    this.db = null;
  }

  async init() {
    try {
      this.db = await openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
          // Tasks store
          if (!db.objectStoreNames.contains(STORES.TASKS)) {
            const tasksStore = db.createObjectStore(STORES.TASKS, { keyPath: 'id' });
            tasksStore.createIndex('status', 'status', { unique: false });
            tasksStore.createIndex('assignedTo', 'assignedTo', { unique: false });
            tasksStore.createIndex('dueDate', 'dueDate', { unique: false });
          }

          // Notifications store
          if (!db.objectStoreNames.contains(STORES.NOTIFICATIONS)) {
            const notificationsStore = db.createObjectStore(STORES.NOTIFICATIONS, { keyPath: 'id' });
            notificationsStore.createIndex('isRead', 'isRead', { unique: false });
            notificationsStore.createIndex('timestamp', 'timestamp', { unique: false });
          }

          // User data store
          if (!db.objectStoreNames.contains(STORES.USER_DATA)) {
            db.createObjectStore(STORES.USER_DATA, { keyPath: 'key' });
          }

          // Offline actions store
          if (!db.objectStoreNames.contains(STORES.OFFLINE_ACTIONS)) {
            const offlineStore = db.createObjectStore(STORES.OFFLINE_ACTIONS, { keyPath: 'id' });
            offlineStore.createIndex('timestamp', 'timestamp', { unique: false });
            offlineStore.createIndex('retryCount', 'retryCount', { unique: false });
          }
        },
      });
      console.log('PWA Database initialized successfully');
    } catch (error) {
      console.error('Failed to initialize PWA Database:', error);
    }
  }

  // Tasks methods
  async saveTasks(tasks) {
    if (!this.db) return;
    const tx = this.db.transaction(STORES.TASKS, 'readwrite');
    const store = tx.objectStore(STORES.TASKS);
    
    for (const task of tasks) {
      await store.put({ ...task, lastUpdated: Date.now() });
    }
    await tx.done;
  }

  async getTasks() {
    if (!this.db) return [];
    const tx = this.db.transaction(STORES.TASKS, 'readonly');
    const store = tx.objectStore(STORES.TASKS);
    return await store.getAll();
  }

  async getTask(id) {
    if (!this.db) return null;
    const tx = this.db.transaction(STORES.TASKS, 'readonly');
    const store = tx.objectStore(STORES.TASKS);
    return await store.get(id);
  }

  async saveTask(task) {
    if (!this.db) return;
    const tx = this.db.transaction(STORES.TASKS, 'readwrite');
    const store = tx.objectStore(STORES.TASKS);
    await store.put({ ...task, lastUpdated: Date.now() });
    await tx.done;
  }

  async deleteTask(id) {
    if (!this.db) return;
    const tx = this.db.transaction(STORES.TASKS, 'readwrite');
    const store = tx.objectStore(STORES.TASKS);
    await store.delete(id);
    await tx.done;
  }

  // Notifications methods
  async saveNotifications(notifications) {
    if (!this.db) return;
    const tx = this.db.transaction(STORES.NOTIFICATIONS, 'readwrite');
    const store = tx.objectStore(STORES.NOTIFICATIONS);
    
    for (const notification of notifications) {
      await store.put({ ...notification, lastUpdated: Date.now() });
    }
    await tx.done;
  }

  async getNotifications() {
    if (!this.db) return [];
    const tx = this.db.transaction(STORES.NOTIFICATIONS, 'readonly');
    const store = tx.objectStore(STORES.NOTIFICATIONS);
    return await store.getAll();
  }

  async saveNotification(notification) {
    if (!this.db) return;
    const tx = this.db.transaction(STORES.NOTIFICATIONS, 'readwrite');
    const store = tx.objectStore(STORES.NOTIFICATIONS);
    await store.put({ ...notification, lastUpdated: Date.now() });
    await tx.done;
  }

  async markNotificationAsRead(id) {
    if (!this.db) return;
    const tx = this.db.transaction(STORES.NOTIFICATIONS, 'readwrite');
    const store = tx.objectStore(STORES.NOTIFICATIONS);
    const notification = await store.get(id);
    if (notification) {
      notification.isRead = true;
      notification.lastUpdated = Date.now();
      await store.put(notification);
    }
    await tx.done;
  }

  // User data methods
  async saveUserData(key, data) {
    if (!this.db) return;
    const tx = this.db.transaction(STORES.USER_DATA, 'readwrite');
    const store = tx.objectStore(STORES.USER_DATA);
    await store.put({ key, data, lastUpdated: Date.now() });
    await tx.done;
  }

  async getUserData(key) {
    if (!this.db) return null;
    const tx = this.db.transaction(STORES.USER_DATA, 'readonly');
    const store = tx.objectStore(STORES.USER_DATA);
    const result = await store.get(key);
    return result ? result.data : null;
  }

  // Offline actions methods
  async saveOfflineAction(action) {
    if (!this.db) return;
    const tx = this.db.transaction(STORES.OFFLINE_ACTIONS, 'readwrite');
    const store = tx.objectStore(STORES.OFFLINE_ACTIONS);
    const actionWithId = {
      ...action,
      id: action.id || Date.now() + Math.random(),
      timestamp: Date.now(),
      retryCount: 0,
    };
    await store.put(actionWithId);
    await tx.done;
    return actionWithId;
  }

  async getOfflineActions() {
    if (!this.db) return [];
    const tx = this.db.transaction(STORES.OFFLINE_ACTIONS, 'readonly');
    const store = tx.objectStore(STORES.OFFLINE_ACTIONS);
    return await store.getAll();
  }

  async deleteOfflineAction(id) {
    if (!this.db) return;
    const tx = this.db.transaction(STORES.OFFLINE_ACTIONS, 'readwrite');
    const store = tx.objectStore(STORES.OFFLINE_ACTIONS);
    await store.delete(id);
    await tx.done;
  }

  async incrementRetryCount(id) {
    if (!this.db) return;
    const tx = this.db.transaction(STORES.OFFLINE_ACTIONS, 'readwrite');
    const store = tx.objectStore(STORES.OFFLINE_ACTIONS);
    const action = await store.get(id);
    if (action) {
      action.retryCount = (action.retryCount || 0) + 1;
      await store.put(action);
    }
    await tx.done;
  }

  // Cleanup methods
  async clearOldData(maxAge = 7 * 24 * 60 * 60 * 1000) { // 7 days default
    if (!this.db) return;
    const cutoffTime = Date.now() - maxAge;

    // Clear old tasks
    const tasksTx = this.db.transaction(STORES.TASKS, 'readwrite');
    const tasksStore = tasksTx.objectStore(STORES.TASKS);
    const allTasks = await tasksStore.getAll();
    for (const task of allTasks) {
      if (task.lastUpdated < cutoffTime) {
        await tasksStore.delete(task.id);
      }
    }
    await tasksTx.done;

    // Clear old notifications
    const notificationsTx = this.db.transaction(STORES.NOTIFICATIONS, 'readwrite');
    const notificationsStore = notificationsTx.objectStore(STORES.NOTIFICATIONS);
    const allNotifications = await notificationsStore.getAll();
    for (const notification of allNotifications) {
      if (notification.lastUpdated < cutoffTime) {
        await notificationsStore.delete(notification.id);
      }
    }
    await notificationsTx.done;
  }

  async clearAllData() {
    if (!this.db) return;
    
    const stores = Object.values(STORES);
    for (const storeName of stores) {
      const tx = this.db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      await store.clear();
      await tx.done;
    }
  }
}

// Create singleton instance
const pwaDatabase = new PWADatabase();

export default pwaDatabase;
