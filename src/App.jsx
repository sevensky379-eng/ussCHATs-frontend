// Import necessary components and hooks
import AuthProvider from "./context/AuthContext";
import useAuth from "./hooks/useAuth";
import ChatLayout from "./pages/ChatLayout";
import "./index.css";
import { useSessionTimeout } from "./hooks/useSessionTimeout";
import { logout, logoutEverywhere } from "./api/auth";
import { SettingsProvider } from "./context/SettingsContext";
import SettingsModal from "./components/SettingsModal";
import AnimatedLogo from "./components/AnimatedLogo";
import InstallPrompt from "./components/InstallPrompt";
import { useState, lazy, Suspense, useEffect } from "react";
import { FaCog } from "react-icons/fa";
import { requestFCMToken, onMessageListener } from "./firebase";
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './utils/queryClient';

// Lazy load auth pages for better performance
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));

// Authentication gate component
function Gate() {
  const { user } = useAuth();
  const [mode, setMode] = useState("login");

  // Show login/register forms if not authenticated
  if (!user) {
    return (
      <Suspense fallback={<div>Loading...</div>}>
        {mode === "login" ? (
          <>
            <Login onLoggedIn={() => {}} />
            <p style={{ textAlign: "center" }}>
              No account?{" "}
              <button className="link" onClick={() => setMode("register")}>Register</button>
            </p>
          </>
        ) : (
          <>
            <Register onRegistered={() => setMode("login")} />
            <p style={{ textAlign: "center" }}>
              Have an account?{" "}
              <button className="link" onClick={() => setMode("login")}>Login</button>
            </p>
          </>
        )}
      </Suspense>
    );
  }

  // Show main chat interface if authenticated
  return <ChatLayout />;
}

// Inner component that has access to AuthContext
function AppContent() {
  const { user } = useAuth();
  const [showSettings, setShowSettings] = useState(false);

  // Handle session timeout by logging out
  const handleSessionTimeout = () => {
    try {
      // Optional: call logout-everywhere to invalidate all sessions
      // await logoutEverywhere();
    } catch (err) {
      console.warn("Failed to logout everywhere:", err);
    }
    // Then redirect to login
    logout();
  };

  // Auto-logout after 30 minutes of inactivity
  useSessionTimeout(30, handleSessionTimeout);

  // Request notification permission on app load
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // FCM setup
  useEffect(() => {
    const setupFCM = async () => {
      if (user) {
        const token = await requestFCMToken();
        if (token) {
          // Register token with backend
          try {
            await fetch(`${import.meta.env.VITE_API_URL}/api/users/fcm-token`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: user._id || user.id, token })
            });
          } catch (error) {
            console.error('FCM token registration failed:', error);
          }
        }
      }
    };
    setupFCM();

    // Listen for FCM messages
    onMessageListener().then((payload) => {
      console.log('FCM message received:', payload);
      // Handle foreground messages
      if (payload.notification) {
        new Notification(payload.notification.title, {
          body: payload.notification.body,
          icon: payload.notification.icon || '/favicon.ico'
        });
      }
    }).catch((err) => console.error('FCM listener error:', err));
  }, [user]);

  return (
      <SettingsProvider>
        <div className="app">
        {/* Header with settings button - only show when authenticated */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 16 }}>
            <AnimatedLogo />
          {user && (
            <button
              onClick={() => setShowSettings(true)}
              title="Settings (Ctrl+,)"
              style={{
                background: "none",
                border: "none",
                fontSize: 24,
                cursor: "pointer"
              }}
            >
              <FaCog />
            </button>
          )}
          </div>

          {/* App content */}
          <Gate />

          {/* PWA Install Prompt */}
          <InstallPrompt />

        {/* Settings Modal - only show when authenticated */}
        {user && showSettings && (
            <SettingsModal onClose={() => setShowSettings(false)} />
          )}
        </div>
      </SettingsProvider>
  );
}

// Main App component
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </QueryClientProvider>
  );
}

// Export the main App component
export default App;
