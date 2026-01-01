import api from "./client";

export const getUserChats = (userId) => api.get(`/api/chats/${userId}`);
export const createDirectChat = (payload) => api.post("/api/chats", payload);
export const createGroupChat = (payload) => api.post("/api/chats/group", payload);
