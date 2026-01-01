// src/utils/session.js
// Session management and encrypted local storage
import CryptoJS from "crypto-js";

const SESSION_KEY = "ussCHATs_session";
const STORAGE_KEY = "ussCHATs_secure";
const SECRET = "change_this_secret"; // Use env var in production

export function saveSession(session) {
  const encrypted = CryptoJS.AES.encrypt(JSON.stringify(session), SECRET).toString();
  localStorage.setItem(SESSION_KEY, encrypted);
}

export function getSession() {
  const encrypted = localStorage.getItem(SESSION_KEY);
  if (!encrypted) return null;
  try {
    const bytes = CryptoJS.AES.decrypt(encrypted, SECRET);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  } catch {
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export function saveSecure(key, value) {
  const encrypted = CryptoJS.AES.encrypt(JSON.stringify(value), SECRET).toString();
  localStorage.setItem(`${STORAGE_KEY}_${key}`, encrypted);
}

export function getSecure(key) {
  const encrypted = localStorage.getItem(`${STORAGE_KEY}_${key}`);
  if (!encrypted) return null;
  try {
    const bytes = CryptoJS.AES.decrypt(encrypted, SECRET);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  } catch {
    return null;
  }
}

export function clearSecure(key) {
  localStorage.removeItem(`${STORAGE_KEY}_${key}`);
}
