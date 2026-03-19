import axios from "axios";

let authToken = "";

const apiClient = axios.create({
  baseURL: "https://pet-care-r5mi.onrender.com/api",
  // withCredentials:true,
  // timeout: 10000,
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
