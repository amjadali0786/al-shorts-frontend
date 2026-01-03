import axios from "axios";

const API = axios.create({
  baseURL: "https://al-shorts-backend.onrender.com",
});

API.interceptors.request.use((config) => {
  const auth = JSON.parse(localStorage.getItem("adminAuth") || "{}");

  if (auth.username && auth.password) {
    config.auth = {
      username: auth.username,
      password: auth.password,
    };
  }

  return config;
});

export default API;
export const fetchAdminOverview = () =>
  API.get("/admin/analytics/overview");

export const fetchAdminNewsAnalytics = () =>
  API.get("/admin/analytics/news");
