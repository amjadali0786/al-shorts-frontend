import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/* =========================
   🔐 JWT AUTO ATTACH
========================= */
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* =========================
   📰 FEED API
========================= */
export const fetchFeed = (page = 1, language = "hi") => {
  return API.get("/feed", {
    params: {
      page,
      limit: 5,
      language,
    },
  });
};

/* =========================
   ⭐ BOOKMARK APIs
========================= */
export const toggleBookmarkAPI = (newsId) => {
  return API.post(`/bookmarks/${newsId}`);
};

export const fetchBookmarks = () => {
  return API.get("/bookmarks");
};

export default API;
