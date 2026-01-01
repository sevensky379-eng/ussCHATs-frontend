import { QueryClient } from '@tanstack/react-query';

// Create a client with optimized settings
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
      onError: (error) => {
        console.error('Mutation error:', error);
      },
    },
  },
});

// Query keys for consistent caching
export const queryKeys = {
  chats: ['chats'],
  chat: (id) => ['chats', id],
  messages: (chatId) => ['messages', chatId],
  user: (id) => ['users', id],
  currentUser: ['currentUser'],
  notifications: ['notifications'],
  ai: ['ai'],
};

// Cache utilities
export const invalidateQueries = (keys) => {
  queryClient.invalidateQueries({ queryKey: keys });
};

export const prefetchQuery = (key, queryFn) => {
  queryClient.prefetchQuery({
    queryKey: key,
    queryFn,
    staleTime: 2 * 60 * 1000, // 2 minutes for prefetched data
  });
};

export const setQueryData = (key, data) => {
  queryClient.setQueryData(key, data);
};

export const getQueryData = (key) => {
  return queryClient.getQueryData(key);
};