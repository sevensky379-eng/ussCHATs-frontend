import api from "./client";
import { requestNotificationPermission } from "./notifications";

// Client-side auth helpers

export const register = (payload) =>
  api.post("/api/users/register", payload).then(async (res) => {
    try {
      const user = res.data?.user || res.data;
      const userId = user?._id || user?.id || res.data?.userId || res.data?.id;
      if (userId) await requestNotificationPermission(userId);
    } catch (err) {
      console.warn("FCM registration after register failed:", err);
    }
    return res;
  });

export const login = (payload) =>
  api.post("/api/users/login", payload).then(async (res) => {
    try {
      const user = res.data?.user || res.data;
      const userId = user?._id || user?.id || res.data?.userId || res.data?.id;
      if (userId) await requestNotificationPermission(userId);
    } catch (err) {
      console.warn("FCM registration after login failed:", err);
    }
    return res;
  });

export const me = () => api.get("/api/users/me"); // optional if you add it server-
// ...existing code...
// ...existing code...

export const logoutEverywhere = async () => {
  try {
    const token = localStorage.getItem("usschats_token");
    if (!token) throw new Error("No token found");

    const res = await api.post(
      "/api/users/logout-everywhere",
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  } catch (err) {
    console.error("Logout everywhere failed:", err);
    throw err;
  }
};

export const logout = () => {
  localStorage.removeItem("usschats_token");
  localStorage.removeItem("usschats_user");
  window.location.href = "/login";
};

// ...existing code...