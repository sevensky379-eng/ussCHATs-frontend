import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';
import { Replay } from '@sentry/replay';

// Initialize Sentry
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN || 'https://your-sentry-dsn@sentry.io/project-id',
  integrations: [
    new BrowserTracing({
      // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
      tracePropagationTargets: [
        'localhost',
        /^https:\/\/yourdomain\.com\/api/,
        /^https:\/\/.*\.yourdomain\.com\/api/
      ],
    }),
    new Replay({
      // Capture replays for 10% of all sessions
      sessionSampleRate: 0.1,
      // Capture replays for all sessions with an error
      errorSampleRate: 1.0,
    }),
  ],
  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0, // Capture 10% of transactions in production
  // Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Environment
  environment: import.meta.env.MODE || 'development',

  // Release tracking
  release: import.meta.env.VITE_APP_VERSION || '1.0.0',

  // Error filtering
  beforeSend(event, hint) {
    // Filter out network errors that are expected (like offline)
    if (event.exception) {
      const error = hint.originalException;
      if (error && error.message && error.message.includes('NetworkError')) {
        // Check if user is offline
        if (!navigator.onLine) {
          return null; // Don't send offline network errors
        }
      }
    }
    return event;
  },

  // User context
  beforeSend: (event) => {
    // Add user context if available
    const token = localStorage.getItem('usschats_token');
    if (token) {
      event.user = {
        id: 'authenticated', // Don't send actual user ID for privacy
      };
    }
    return event;
  },
});

// Performance monitoring for key operations
export const startTransaction = (name, op) => {
  return Sentry.startTransaction({
    name,
    op,
  });
};

export const captureException = (error, context) => {
  Sentry.captureException(error, {
    tags: context,
  });
};

export const captureMessage = (message, level = 'info', context) => {
  Sentry.captureMessage(message, level, {
    tags: context,
  });
};

export const setUser = (user) => {
  Sentry.setUser({
    id: user.id,
    username: user.name,
    email: user.email,
  });
};

export const setTag = (key, value) => {
  Sentry.setTag(key, value);
};

export const addBreadcrumb = (message, category, level = 'info') => {
  Sentry.addBreadcrumb({
    message,
    category,
    level,
  });
};