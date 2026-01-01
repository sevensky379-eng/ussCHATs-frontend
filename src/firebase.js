// Firebase configuration and initialization
import { initializeApp, getApps, getApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// Firebase config from .env
const firebaseConfig = {
  apiKey: "AIzaSyAoWlyCZe9Vt-eE1Yf4OoOHeWiLj2B6G5M",
  authDomain: "usschats-1be5b.firebaseapp.com",
  projectId: "usschats-1be5b",
  storageBucket: "usschats-1be5b.firebasestorage.app",
  messagingSenderId: "715217889286",
  appId: "1:715217889286:web:8beaa25298bc954c79bb87",
  measurementId: "G-S6FYD36Z1L"
};

// Initialize Firebase only if it hasn't been initialized already
let app;
try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
} catch (error) {
  console.error("Firebase initialization error:", error);
  // If there's an error, try to get the existing app
  app = getApp();
}

// Initialize Firebase Cloud Messaging
let messaging;
try {
  if (typeof window !== "undefined") {
    messaging = getMessaging(app);
  }
} catch (error) {
  console.error("Firebase Messaging initialization error:", error);
  messaging = null;
}

// Request permission and get token
export const requestFCMToken = async () => {
  if (!messaging) {
    console.warn('FCM messaging not initialized');
    return null;
  }
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: 'BK6upI9a-zvgL-KueRnd4ZmDnwv2vt1fRTEneEAQZVx1PgZTVnnAigC_vQy8vrVuQ2_4OjM_KUSho7Yy6tlqMYE'
      });
      return token;
    }
  } catch (error) {
    console.error('FCM token error:', error);
  }
  return null;
};

// Handle incoming messages
export const onMessageListener = () => {
  if (!messaging) {
    console.warn('FCM messaging not initialized');
    return Promise.reject(new Error('FCM messaging not initialized'));
  }
  return new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });
};

export { messaging };