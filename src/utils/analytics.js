// Simple analytics utility - can be replaced with Google Analytics, Mixpanel, etc.
class Analytics {
  constructor() {
    this.events = [];
    this.userId = null;
    this.sessionId = this.generateSessionId();
  }

  generateSessionId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  setUser(userId, properties = {}) {
    this.userId = userId;
    this.track('user_identify', {
      userId,
      ...properties
    });
  }

  track(eventName, properties = {}) {
    const event = {
      event: eventName,
      properties: {
        ...properties,
        timestamp: new Date().toISOString(),
        sessionId: this.sessionId,
        userId: this.userId,
      }
    };

    this.events.push(event);

    // In development, log to console
    if (import.meta.env.DEV) {
      console.log('Analytics Event:', event);
    }

    // Send to analytics service (replace with actual implementation)
    this.sendToAnalytics(event);
  }

  sendToAnalytics(event) {
    // Placeholder - replace with actual analytics service
    // Example: Google Analytics, Mixpanel, etc.

    // For now, just store in localStorage for demo
    try {
      const stored = JSON.parse(localStorage.getItem('analytics_events') || '[]');
      stored.push(event);
      // Keep only last 100 events
      if (stored.length > 100) {
        stored.splice(0, stored.length - 100);
      }
      localStorage.setItem('analytics_events', JSON.stringify(stored));
    } catch (error) {
      console.warn('Failed to store analytics event:', error);
    }
  }

  // Predefined tracking methods
  trackPageView(page) {
    this.track('page_view', { page });
  }

  trackMessageSent(chatId, messageType = 'text', hasMedia = false) {
    this.track('message_sent', {
      chatId,
      messageType,
      hasMedia,
      platform: this.getPlatform()
    });
  }

  trackMessageReceived(chatId, messageType = 'text') {
    this.track('message_received', {
      chatId,
      messageType,
      platform: this.getPlatform()
    });
  }

  trackChatOpened(chatId, chatType = 'direct') {
    this.track('chat_opened', {
      chatId,
      chatType
    });
  }

  trackFeatureUsed(featureName, properties = {}) {
    this.track('feature_used', {
      feature: featureName,
      ...properties
    });
  }

  trackError(error, context = {}) {
    this.track('error_occurred', {
      error: error.message,
      stack: error.stack,
      ...context
    });
  }

  trackPerformance(metric, value, properties = {}) {
    this.track('performance_metric', {
      metric,
      value,
      ...properties
    });
  }

  getPlatform() {
    const ua = navigator.userAgent;
    if (ua.includes('Mobile')) return 'mobile';
    if (ua.includes('Tablet')) return 'tablet';
    return 'desktop';
  }

  // Get stored events (for debugging)
  getEvents() {
    try {
      return JSON.parse(localStorage.getItem('analytics_events') || '[]');
    } catch {
      return [];
    }
  }

  // Clear stored events
  clearEvents() {
    localStorage.removeItem('analytics_events');
    this.events = [];
  }
}

// Create singleton instance
export const analytics = new Analytics();

// React hook for analytics
import { useEffect } from 'react';

export const useAnalytics = () => {
  useEffect(() => {
    // Track page views
    analytics.trackPageView(window.location.pathname);

    // Track performance
    if ('performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0];
      if (navigation) {
        analytics.trackPerformance('page_load_time', navigation.loadEventEnd - navigation.fetchStart);
      }
    }
  }, []);

  return analytics;
};