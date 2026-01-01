import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { requestNotificationPermission, listenForMessages } from "./api/notifications";
import './utils/sentry'; // Initialize Sentry
import './utils/analytics'; // Initialize Analytics

// Error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("React Error Boundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "20px", textAlign: "center" }}>
          <h1>Something went wrong</h1>
          <p>{this.state.error?.message || "An unexpected error occurred"}</p>
          <button onClick={() => window.location.reload()}>Reload Page</button>
          <details style={{ marginTop: "20px", textAlign: "left" }}>
            <summary>Error Details</summary>
            <pre style={{ background: "#f5f5f5", padding: "10px", overflow: "auto" }}>
              {this.state.error?.stack}
            </pre>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ErrorBoundary>
    <App />
    </ErrorBoundary>
  </React.StrictMode>
);

// Initialize mobile push notifications (non-blocking)
requestNotificationPermission().then(token => {
  if (token) {
    // TODO: Send token to backend for association with user
    console.log("FCM token:", token);
  }
}).catch(err => {
  console.warn("Failed to request notification permission:", err);
});

listenForMessages(payload => {
  // Optionally show notification or update UI
  console.log("Push message received:", payload);
});

// Register service worker for offline support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then((registration) => {
        console.log('Service Worker registered successfully:', registration.scope);

        // Request background sync permission if available
        if ('sync' in registration) {
          // Background sync is available
        }
      })
      .catch((error) => {
        console.error('Service Worker registration failed:', error);
      });
  });
}
