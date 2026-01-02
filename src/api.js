import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

/* =========================
   🔐 JWT AUTO ATTACH
   (SINGLE SOURCE OF TRUTH)
========================= */
API.interceptors.request.use(
  (config) => {
    // ✅ SAME KEY AS AuthContext
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
   (GUEST + LOGGED-IN BOTH)
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

export default API;
// ⭐ BOOKMARK API
export const toggleBookmarkAPI = (newsId) => {
  return API.post(`/bookmarks/${newsId}`);
};

export const fetchBookmarks = () => {
  return API.get("/bookmarks");
};
