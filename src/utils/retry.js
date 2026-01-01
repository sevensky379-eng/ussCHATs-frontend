/**
 * Retry utility for handling failed API calls with exponential backoff
 */

export const retry = async (fn, options = {}) => {
  const {
    maxAttempts = 3,
    delay = 1000,
    backoff = 2,
    retryCondition = () => true,
    onRetry = () => {}
  } = options;

  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Check if we should retry
      if (attempt === maxAttempts || !retryCondition(error)) {
        throw error;
      }

      // Call retry callback
      onRetry(error, attempt);

      // Wait before retrying
      const waitTime = delay * Math.pow(backoff, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  throw lastError;
};

/**
 * Retry hook for React components
 */
import { useState, useCallback } from 'react';

export const useRetry = (fn, options = {}) => {
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [lastError, setLastError] = useState(null);

  const executeWithRetry = useCallback(async (...args) => {
    setIsRetrying(true);
    setRetryCount(0);
    setLastError(null);

    try {
      const result = await retry(
        () => fn(...args),
        {
          ...options,
          onRetry: (error, attempt) => {
            setRetryCount(attempt);
            setLastError(error);
            options.onRetry?.(error, attempt);
          }
        }
      );

      setIsRetrying(false);
      return result;
    } catch (error) {
      setIsRetrying(false);
      setLastError(error);
      throw error;
    }
  }, [fn, options]);

  return {
    executeWithRetry,
    isRetrying,
    retryCount,
    lastError
  };
};

/**
 * Network-aware retry condition
 */
export const isRetryableError = (error) => {
  // Retry on network errors, timeouts, and 5xx server errors
  if (!error) return false;

  // Network errors
  if (error.name === 'NetworkError' || error.message?.includes('fetch')) {
    return true;
  }

  // HTTP status codes
  if (error.status) {
    return error.status >= 500 || error.status === 429 || error.status === 408;
  }

  return false;
};

/**
 * Pre-configured retry for API calls
 */
export const retryApiCall = async (apiCall, options = {}) => {
  return retry(apiCall, {
    maxAttempts: 3,
    delay: 1000,
    backoff: 2,
    retryCondition: isRetryableError,
    ...options
  });
};