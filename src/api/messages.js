// ...existing code...
import api from "./client";

/**
 * Normalize Axios errors into an Error with message + details.
 * The original error is attached as `err.original`.
 */
function formatApiError(err) {
  try {
    const respData = err?.response?.data;
    const status = err?.response?.status;
    const msg = respData?.message || respData?.error || err.message || "Unknown API error";
    const e = new Error(`${msg}${status ? ` (status ${status})` : ""}`);
    e.details = respData || null;
    e.status = status || null;
    e.original = err;
    console.error("API Error:", e.message, e.details || err);
    return e;
  } catch (ex) {
    console.error("Failed to format API error:", ex, err);
    const e = new Error("API Error");
    e.original = err;
    return e;
  }
}

export const getMessages = async (chatId) => {
  try {
    const res = await api.get(`/api/messages/${chatId}`);
    return res.data;
  } catch (err) {
    throw formatApiError(err);
  }
};

export const sendMessage = async ({ chatId, senderId, content, file, selfDestructTime, replyTo }) => {
  try {
    const form = new FormData();
    form.append("chatId", chatId);
    form.append("senderId", senderId);
    if (content) form.append("content", content);
    if (file) form.append("media", file);
    if (selfDestructTime) form.append("selfDestructTime", selfDestructTime);
    if (replyTo) form.append("replyTo", replyTo);
    // let the browser/axios set Content-Type including multipart boundary
    const res = await api.post("/api/messages", form);
    return res.data;
  } catch (err) {
    throw formatApiError(err);
  }
};

export const markRead = async (payload) => {
  try {
    const res = await api.post("/api/messages/read", payload);
    return res.data;
  } catch (err) {
    throw formatApiError(err);
  }
};

export const markDelivered = async (payload) => {
  try {
    const res = await api.post("/api/messages/delivered", payload);
    return res.data;
  } catch (err) {
    throw formatApiError(err);
  }
};
// ...existing code...ur