import axios from "axios";
import { navigateTo } from "./navigationService";

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_API_URL || "http://localhost:5000",
});


// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const storedData = localStorage.getItem("talkapp-user");
  
  // Guard against "undefined" strings or null values
  if (storedData && storedData !== "undefined") {
    try {
      const user = JSON.parse(storedData);
      if (user?.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
      }
    } catch (e) {
      console.error("Failed to parse user from storage", e);
    }
  }
  return config;
});


// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("talkapp-user");
      navigateTo('/')
    }
    return Promise.reject(err);
  }
);

export default api;
