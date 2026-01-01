import { openDB } from 'idb';

const DB_NAME = 'usschats-db';
const DB_VERSION = 1;

// Initialize IndexedDB
export const initDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Store for offline messages
      if (!db.objectStoreNames.contains('offlineMessages')) {
        const offlineMessagesStore = db.createObjectStore('offlineMessages', { keyPath: 'id' });
        offlineMessagesStore.createIndex('chatId', 'chatId');
        offlineMessagesStore.createIndex('timestamp', 'timestamp');
      }

      // Store for cached chats
      if (!db.objectStoreNames.contains('cachedChats')) {
        db.createObjectStore('cachedChats', { keyPath: 'id' });
      }

      // Store for cached users
      if (!db.objectStoreNames.contains('cachedUsers')) {
        db.createObjectStore('cachedUsers', { keyPath: 'id' });
      }

      // Store for user preferences
      if (!db.objectStoreNames.contains('userPreferences')) {
        db.createObjectStore('userPreferences', { keyPath: 'key' });
      }
    },
  });
};

// Offline Messages
export const saveOfflineMessage = async (message) => {
  const db = await initDB();
  const offlineMessage = {
    ...message,
    id: `offline_${Date.now()}_${Math.random()}`,
    timestamp: Date.now(),
    synced: false
  };
  await db.add('offlineMessages', offlineMessage);
  return offlineMessage;
};

export const getOfflineMessages = async (chatId = null) => {
  const db = await initDB();
  if (chatId) {
    return db.getAllFromIndex('offlineMessages', 'chatId', chatId);
  }
  return db.getAll('offlineMessages');
};

export const deleteOfflineMessage = async (id) => {
  const db = await initDB();
  await db.delete('offlineMessages', id);
};

export const syncOfflineMessages = async (syncFunction) => {
  const offlineMessages = await getOfflineMessages();
  const syncedMessages = [];

  for (const message of offlineMessages) {
    try {
      await syncFunction(message);
      await deleteOfflineMessage(message.id);
      syncedMessages.push(message);
    } catch (error) {
      console.error('Failed to sync message:', message.id, error);
    }
  }

  return syncedMessages;
};

// Cached Data
export const cacheChat = async (chat) => {
  const db = await initDB();
  await db.put('cachedChats', chat);
};

export const getCachedChat = async (chatId) => {
  const db = await initDB();
  return db.get('cachedChats', chatId);
};

export const getAllCachedChats = async () => {
  const db = await initDB();
  return db.getAll('cachedChats');
};

export const cacheUser = async (user) => {
  const db = await initDB();
  await db.put('cachedUsers', user);
};

export const getCachedUser = async (userId) => {
  const db = await initDB();
  return db.get('cachedUsers', userId);
};

// User Preferences
export const saveUserPreference = async (key, value) => {
  const db = await initDB();
  await db.put('userPreferences', { key, value });
};

export const getUserPreference = async (key) => {
  const db = await initDB();
  const result = await db.get('userPreferences', key);
  return result ? result.value : null;
};

export const getAllUserPreferences = async () => {
  const db = await initDB();
  const preferences = await db.getAll('userPreferences');
  return preferences.reduce((acc, { key, value }) => {
    acc[key] = value;
    return acc;
  }, {});
};

// Clear all cached data (for logout, etc.)
export const clearAllCache = async () => {
  const db = await initDB();
  const tx = db.transaction(['offlineMessages', 'cachedChats', 'cachedUsers', 'userPreferences'], 'readwrite');

  await Promise.all([
    tx.objectStore('offlineMessages').clear(),
    tx.objectStore('cachedChats').clear(),
    tx.objectStore('cachedUsers').clear(),
    tx.objectStore('userPreferences').clear(),
  ]);

  await tx.done;
};