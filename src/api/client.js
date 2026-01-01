import axios from "axios";

const getBaseURL = () => localStorage.getItem("usschats_api_url") || import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: getBaseURL(),
  withCredentials: false,
});

// Update baseURL dynamically if changed
api.interceptors.request.use((config) => {
  config.baseURL = getBaseURL();
  const token = localStorage.getItem("usschats_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
