// Simple A/B Testing Framework
class ABTesting {
  constructor() {
    this.experiments = {};
    this.userVariants = this.loadUserVariants();
  }

  // Define an experiment with variants
  defineExperiment(experimentName, variants, weights = null) {
    if (this.experiments[experimentName]) {
      console.warn(`Experiment ${experimentName} already exists`);
      return;
    }

    this.experiments[experimentName] = {
      variants,
      weights: weights || variants.map(() => 1 / variants.length)
    };
  }

  // Get variant for current user
  getVariant(experimentName) {
    if (!this.experiments[experimentName]) {
      console.warn(`Experiment ${experimentName} not defined`);
      return null;
    }

    // Check if user already has a variant assigned
    if (this.userVariants[experimentName]) {
      return this.userVariants[experimentName];
    }

    // Assign variant based on user ID hash
    const userId = this.getUserId();
    const variant = this.selectVariant(experimentName, userId);

    this.userVariants[experimentName] = variant;
    this.saveUserVariants();

    return variant;
  }

  // Track experiment conversion/event
  trackEvent(experimentName, eventName, properties = {}) {
    const variant = this.getVariant(experimentName);
    if (!variant) return;

    // Track with analytics
    if (window.analytics) {
      window.analytics.track('experiment_event', {
        experiment: experimentName,
        variant,
        event: eventName,
        ...properties
      });
    }

    // Store locally for demo
    this.storeExperimentEvent(experimentName, variant, eventName, properties);
  }

  // Private methods
  getUserId() {
    // Use user ID from localStorage or generate anonymous ID
    let userId = localStorage.getItem('ab_test_user_id');
    if (!userId) {
      userId = 'anon_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('ab_test_user_id', userId);
    }
    return userId;
  }

  selectVariant(experimentName, userId) {
    const experiment = this.experiments[experimentName];
    const hash = this.simpleHash(userId + experimentName);
    const random = (hash % 1000) / 1000; // 0-1

    let cumulativeWeight = 0;
    for (let i = 0; i < experiment.variants.length; i++) {
      cumulativeWeight += experiment.weights[i];
      if (random <= cumulativeWeight) {
        return experiment.variants[i];
      }
    }

    return experiment.variants[0]; // fallback
  }

  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  loadUserVariants() {
    try {
      return JSON.parse(localStorage.getItem('ab_test_variants') || '{}');
    } catch {
      return {};
    }
  }

  saveUserVariants() {
    localStorage.setItem('ab_test_variants', JSON.stringify(this.userVariants));
  }

  storeExperimentEvent(experimentName, variant, eventName, properties) {
    try {
      const events = JSON.parse(localStorage.getItem('ab_test_events') || '[]');
      events.push({
        experiment: experimentName,
        variant,
        event: eventName,
        properties,
        timestamp: new Date().toISOString()
      });

      // Keep only last 500 events
      if (events.length > 500) {
        events.splice(0, events.length - 500);
      }

      localStorage.setItem('ab_test_events', JSON.stringify(events));
    } catch (error) {
      console.warn('Failed to store A/B test event:', error);
    }
  }

  // Get experiment results (for debugging)
  getResults(experimentName) {
    try {
      const events = JSON.parse(localStorage.getItem('ab_test_events') || '[]');
      const experimentEvents = events.filter(e => e.experiment === experimentName);

      const results = {};
      experimentEvents.forEach(event => {
        if (!results[event.variant]) {
          results[event.variant] = { count: 0, events: {} };
        }
        results[event.variant].count++;
        results[event.variant].events[event.event] = (results[event.variant].events[event.event] || 0) + 1;
      });

      return results;
    } catch {
      return {};
    }
  }

  // Reset experiment for user (for testing)
  resetExperiment(experimentName) {
    delete this.userVariants[experimentName];
    this.saveUserVariants();
  }
}

// Create singleton instance
export const abTesting = new ABTesting();

// Example usage:
// abTesting.defineExperiment('message_input_ui', ['classic', 'modern'], [0.5, 0.5]);
// const variant = abTesting.getVariant('message_input_ui');
// abTesting.trackEvent('message_input_ui', 'message_sent');