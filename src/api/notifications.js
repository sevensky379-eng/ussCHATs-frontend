// ...existing code...
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { initializeApp, getApps, getApp } from "firebase/app";



const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ""
};

// Validate minimal config
const hasConfig = firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId;

let app = null;
let messaging = null;

if (!hasConfig) {
  console.warn("Firebase config missing. Set VITE_FIREBASE_* values in .env to enable FCM.");
} else {
  try {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    // getMessaging will throw if run in non-browser contexts; guard it
    if (typeof window !== "undefined") {
      messaging = getMessaging(app);
    } else {
      messaging = null;
    }
  } catch (err) {
    console.error("Failed to initialize Firebase app/messaging:", err);
    app = null;
    messaging = null;
  }
}

/**
 * Request permission, register service worker token and send token to backend.
 * Returns the FCM token string or null.
 */
export async function requestNotificationPermission(userId) {
  if (!messaging) {
    console.warn("FCM not initialized; cannot request permission.");
    return null;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("Notification permission not granted.");
      return null;
    }

    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
    if (!vapidKey) {
      console.warn("VAPID key missing. Set VITE_FIREBASE_VAPID_KEY in .env. Aborting getToken.");
      return null;
    }

    const token = await getToken(messaging, { vapidKey });

    if (!token) {
      console.warn("FCM getToken returned no token.");
      return null;
    }

    const backendUrl = import.meta.env.VITE_API_URL;
    if (backendUrl && userId) {
      try {
        await fetch(`${backendUrl.replace(/\/$/, "")}/api/users/fcm-token`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, userId })
        });
      } catch (err) {
        console.warn("Failed to send FCM token to backend:", err);
      }
    } else {
      console.warn("VITE_API_URL or userId missing; token not sent to backend.");
    }

    return token;
  } catch (err) {
    console.error("FCM registration error:", err);
    return null;
  }
}

/**
 * Listen for foreground messages. Returns an unsubscribe function.
 */
export function listenForMessages(callback) {
  if (!messaging || typeof onMessage !== "function") {
    console.warn("FCM messaging not available; listenForMessages is a no-op.");
    return () => {};
  }

  try {
    const unsubscribe = onMessage(messaging, (payload) => {
      try {
        callback(payload);
      } catch (cbErr) {
        console.error("Error in message callback:", cbErr);
      }
    });
    return typeof unsubscribe === "function" ? unsubscribe : () => {};
  } catch (err) {
    console.error("Failed to attach onMessage listener:", err);
    return () => {};
  }
}
// ...existing code...