import axios from "axios";

let authToken = "";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://pet-care-tomx.onrender.com",
  withCredentials:true,
  timeout: 10000,
});

apiClient.interceptors.request.use((config) => {
  if (authToken) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

export const setAuthToken = (token) => {
  authToken = token || "";
};

export default apiClient;
