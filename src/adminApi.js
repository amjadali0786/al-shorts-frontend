import axios from "axios";

const ADMIN_API = axios.create({
  baseURL: "https://al-shorts-backend.onrender.com",
  headers: {
    "Content-Type": "application/json",
  },
});

// admin auth token
ADMIN_API.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminAuth");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const fetchAdminOverview = () =>
  ADMIN_API.get("/admin/analytics/overview");

export const fetchAdminNewsAnalytics = () =>
  ADMIN_API.get("/admin/analytics/news");

export default ADMIN_API;
