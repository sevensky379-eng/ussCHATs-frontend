import { useState, useEffect } from 'react';
import { saveOfflineMessage, getOfflineMessages, syncOfflineMessages, cacheChat, getCachedChat, getAllCachedChats, cacheUser, getCachedUser, saveUserPreference, getUserPreference } from '../utils/offlineStorage';

export const useOffline = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineMessages, setOfflineMessages] = useState([]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Sync offline messages when coming back online
      syncOfflineMessagesWhenOnline();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load offline messages on mount
    loadOfflineMessages();

    // Listen for service worker messages
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
      }
    };
  }, []);

  const loadOfflineMessages = async () => {
    try {
      const messages = await getOfflineMessages();
      setOfflineMessages(messages);
    } catch (error) {
      console.error('Failed to load offline messages:', error);
    }
  };

  const handleServiceWorkerMessage = (event) => {
    if (event.data && event.data.type === 'SYNC_OFFLINE_MESSAGES') {
      syncOfflineMessagesWhenOnline();
    }
  };

  const syncOfflineMessagesWhenOnline = async () => {
    if (!isOnline) return;

    try {
      // Import the API function dynamically to avoid circular imports
      const { sendMessage } = await import('../api/messages');

      const syncedMessages = await syncOfflineMessages(async (message) => {
        // Remove offline-specific fields and send
        const { id, timestamp, synced, ...messageData } = message;
        await sendMessage(messageData);
      });

      if (syncedMessages.length > 0) {
        console.log(`Synced ${syncedMessages.length} offline messages`);
        loadOfflineMessages(); // Refresh the list
      }
    } catch (error) {
      console.error('Failed to sync offline messages:', error);
    }
  };

  const saveMessageOffline = async (messageData) => {
    try {
      const offlineMessage = await saveOfflineMessage(messageData);
      setOfflineMessages(prev => [...prev, offlineMessage]);
      return offlineMessage;
    } catch (error) {
      console.error('Failed to save message offline:', error);
      throw error;
    }
  };

  const getCachedChatData = async (chatId) => {
    try {
      return await getCachedChat(chatId);
    } catch (error) {
      console.error('Failed to get cached chat:', error);
      return null;
    }
  };

  const cacheChatData = async (chat) => {
    try {
      await cacheChat(chat);
    } catch (error) {
      console.error('Failed to cache chat:', error);
    }
  };

  const getAllCachedChatData = async () => {
    try {
      return await getAllCachedChats();
    } catch (error) {
      console.error('Failed to get cached chats:', error);
      return [];
    }
  };

  const getCachedUserData = async (userId) => {
    try {
      return await getCachedUser(userId);
    } catch (error) {
      console.error('Failed to get cached user:', error);
      return null;
    }
  };

  const cacheUserData = async (user) => {
    try {
      await cacheUser(user);
    } catch (error) {
      console.error('Failed to cache user:', error);
    }
  };

  const setUserPreference = async (key, value) => {
    try {
      await saveUserPreference(key, value);
    } catch (error) {
      console.error('Failed to save user preference:', error);
    }
  };

  const getUserPreferenceData = async (key) => {
    try {
      return await getUserPreference(key);
    } catch (error) {
      console.error('Failed to get user preference:', error);
      return null;
    }
  };

  return {
    isOnline,
    offlineMessages,
    saveMessageOffline,
    getCachedChatData,
    cacheChatData,
    getAllCachedChatData,
    getCachedUserData,
    cacheUserData,
    setUserPreference,
    getUserPreferenceData,
    syncOfflineMessages: syncOfflineMessagesWhenOnline
  };
};