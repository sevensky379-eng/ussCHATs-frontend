// Firebase service worker for background messaging
importScripts('https://www.gstatic.com/firebasejs/9.22.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.1/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyAoWlyCZe9Vt-eE1Yf4OoOHeWiLj2B6G5M",
  authDomain: "usschats-1be5b.firebaseapp.com",
  projectId: "usschats-1be5b",
  storageBucket: "usschats-1be5b.firebasestorage.app",
  messagingSenderId: "715217889286",
  appId: "1:715217889286:web:8beaa25298bc954c79bb87",
  measurementId: "G-S6FYD36Z1L"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  const title = payload.notification?.title || 'ussCHATs';
  const options = {
    body: payload.notification?.body,
    icon: payload.notification?.icon || '/favicon.png',
    data: payload.data || {}
  };
  self.registration.showNotification(title, options);
});
