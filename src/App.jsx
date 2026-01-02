import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API, { fetchFeed } from "./api";
import { useAuth } from "./AuthContext";

/* =========================
   UTIL
========================= */
const getRelativeTime = (iso) => {
  if (!iso) return "Just now";
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  const m = Math.floor(diff / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

/* =========================
   SKELETON (BOTTOM HALF)
========================= */
const FeedSkeleton = ({ dark }) => (
  <div
    style={{
      height: "100vh",
      background: dark ? "#000" : "#fff",
      display: "flex",
      flexDirection: "column",
    }}
  >
    <div style={{ height: "55vh" }} />
    <div style={{ padding: 18 }}>
      <div className="sk-line lg" />
      <div className="sk-line" />
      <div className="sk-line" />
      <div className="sk-btn" />
    </div>
  </div>
);

/* =========================
   APP
========================= */
export default function App() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  /* FEED */
  const [news, setNews] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const loadingRef = useRef(false);

  /* UI STATE */
  const [bookmarks, setBookmarks] = useState([]);
  const [lang, setLang] = useState("hi");
  const [dark, setDark] = useState(localStorage.getItem("theme") === "dark");
  const [showProfile, setShowProfile] = useState(false);
  const [showHeart, setShowHeart] = useState(false);

  /* TOUCH */
  const ts = useRef(0);
  const te = useRef(0);
  const lastTap = useRef(0);

  /* =========================
     DATA
  ========================= */
  const loadNews = async () => {
    if (loadingRef.current || !hasMore) return;
    loadingRef.current = true;
    setLoading(true);

    try {
      const res = await fetchFeed(page, lang);
      const data = Array.isArray(res.data?.data) ? res.data.data : [];

      setNews((prev) => {
        const ids = new Set(prev.map((n) => n.id));
        return [...prev, ...data.filter((n) => !ids.has(n.id))];
      });

      if (data.length === 0) setHasMore(false);
      else setPage((p) => p + 1);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  };

  useEffect(() => {
    setNews([]);
    setPage(1);
    setHasMore(true);
    setActiveIndex(0);
    loadNews();
  }, [lang]);

  useEffect(() => {
    if (activeIndex >= news.length - 2) loadNews();
  }, [activeIndex]);

  /* =========================
     BOOKMARKS
  ========================= */
  const loadBookmarks = async () => {
    if (!isAuthenticated) return setBookmarks([]);
    const res = await API.get("/bookmarks");
    setBookmarks(res.data || []);
  };

  useEffect(() => {
    loadBookmarks();
  }, [isAuthenticated]);

  const toggleBookmark = async (item) => {
    if (!isAuthenticated) return setShowProfile(true);
    await API.post(`/bookmarks/${item.id}`);
    loadBookmarks();
  };

  /* =========================
     THEME
  ========================= */
  const toggleTheme = () => {
    const v = !dark;
    setDark(v);
    localStorage.setItem("theme", v ? "dark" : "light");
  };

  /* =========================
     DOUBLE TAP
  ========================= */
  const handleTap = (item) => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      setShowHeart(true);
      toggleBookmark(item);
      setTimeout(() => setShowHeart(false), 600);
    }
    lastTap.current = now;
  };

  return (
    <div
      onTouchStart={(e) => (ts.current = e.touches[0].clientY)}
      onTouchMove={(e) => (te.current = e.touches[0].clientY)}
      onTouchEnd={() => {
        const d = ts.current - te.current;
        if (d > 50 && activeIndex < news.length - 1) setActiveIndex((i) => i + 1);
        if (d < -50 && activeIndex > 0) setActiveIndex((i) => i - 1);
      }}
      style={{ height: "100vh", overflow: "hidden", background: dark ? "#0e0e0e" : "#f4f4f4", color: dark ? "#fff" : "#000" }}
    >
      <style>{`
        .sk-line{height:14px;border-radius:6px;background:linear-gradient(90deg,#eee,#f5f5f5,#eee);margin:12px 0;animation:pulse 1.5s infinite}
        .sk-line.lg{height:22px;width:70%}
        .sk-btn{height:34px;width:40%;border-radius:999px;background:linear-gradient(90deg,#eee,#f5f5f5,#eee);animation:pulse 1.5s infinite}
        @keyframes pulse{0%{background-position:0%}100%{background-position:200%}}
        .heart{position:absolute;inset:0;display:grid;place-items:center;font-size:72px;color:#ff2d55;animation:pop .6s ease}
        @keyframes pop{0%{transform:scale(0);opacity:0}50%{transform:scale(1.2);opacity:1}100%{transform:scale(1);opacity:0}}
        .dots{position:fixed;bottom:20px;left:50%;transform:translateX(-50%);display:flex;gap:6px}
        .dot{width:6px;height:6px;border-radius:50%;background:#999;animation:bounce 1.2s infinite}
        .dot:nth-child(2){animation-delay:.2s}.dot:nth-child(3){animation-delay:.4s}
        @keyframes bounce{0%,80%,100%{opacity:.3}40%{opacity:1}}
      `}</style>

      {/* TOP BAR */}
      <div style={{ position: "fixed", top: 10, left: 10, right: 10, zIndex: 10, display: "flex", justifyContent: "space-between" }}>
        <div onClick={() => setLang(lang === "hi" ? "en" : "hi")} style={{ background: dark ? "#222" : "#fff", padding: "6px 14px", borderRadius: 999, cursor: "pointer", fontWeight: 600 }}>
          {lang === "hi" ? "हिंदी" : "English"}
        </div>
        <div
          onClick={() => setShowProfile(true)}
          style={{
            width: 42,
            height: 42,
            borderRadius: "50%",
            background: dark
              ? "linear-gradient(135deg,#333,#111)"
              : "linear-gradient(135deg,#e0e7ff,#c7d2fe)",
            display: "grid",
            placeItems: "center",
            cursor: "pointer",
            boxShadow: "0 6px 16px rgba(0,0,0,.25)",
            fontSize: 20,
            fontWeight: 700,
            color: dark ? "#fff" : "#1e1b4b",
          }}
        >
          {isAuthenticated ? user.name?.[0]?.toUpperCase() || "U" : "?"}
        </div>
      </div>

      {/* FEED */}
      <div style={{ height: "100%", transform: `translateY(-${activeIndex * 100}vh)`, transition: "transform .35s cubic-bezier(.4,0,.2,1)" }}>
        {loading && news.length === 0 && <FeedSkeleton dark={dark} />}

        {news.map((item) => {
          const bookmarked = bookmarks.some((b) => b.id === item.id);
          return (
            <div key={item.id} onClick={() => handleTap(item)} style={{ height: "100vh", background: dark ? "#000" : "#fff", display: "flex", flexDirection: "column", position: "relative" }}>
              {showHeart && <div className="heart">❤️</div>}
              {item.image_url && <img loading="lazy" src={`${import.meta.env.VITE_API_BASE}${item.image_url}`} style={{ height: "55vh", width: "100%", objectFit: "cover" }} />}
              <div style={{ padding: 18 }}>
                <h2>{lang === "hi" ? item.title_hi : item.title_en}</h2>
                <p style={{ lineHeight: 1.6, opacity: 0.9 }}>{lang === "hi" ? item.summary_hi : item.summary_en}</p>
                <small style={{ opacity: 0.6 }}>{getRelativeTime(item.created_at)}</small>
                <button onClick={() => toggleBookmark(item)} style={{ marginTop: 14, padding: "8px 16px", borderRadius: 999, border: "none", cursor: "pointer", background: bookmarked ? "#ffcc00" : dark ? "#222" : "#eee" }}>
                  {bookmarked ? "★ Bookmarked" : "☆ Bookmark"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {loading && news.length > 0 && (
        <div className="dots">
          <div className="dot" />
          <div className="dot" />
          <div className="dot" />
        </div>
      )}

      {/* PROFILE MODAL */}
      {showProfile && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.6)", display: "grid", placeItems: "center" }}>
          <div
            style={{
              background: dark ? "#0f172a" : "#fff",
              padding: 24,
              borderRadius: 18,
              width: 340,
              color: dark ? "#fff" : "#000",
              boxShadow: "0 20px 50px rgba(0,0,0,.35)",
              animation: "pop .35s ease",
            }}
          >
            {!isAuthenticated ? (
              <>
                <h3 style={{ marginBottom: 8 }}>Login required</h3>
                <p style={{ opacity: 0.7, fontSize: 14, marginBottom: 16 }}>
                  Login to bookmark news and personalize your feed
                </p>
                <button onClick={() => navigate("/login")}>Login</button>
                <button onClick={() => navigate("/signup")}>Signup</button>
              </>
            ) : (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                      display: "grid",
                      placeItems: "center",
                      fontSize: 24,
                      fontWeight: 700,
                      color: "#fff",
                    }}
                  >
                    {user.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <h3 style={{ margin: 0 }}>{user.name}</h3>
                    <p style={{ margin: 0, fontSize: 13, opacity: 0.7 }}>
                      Active user
                    </p>
                  </div>
                </div>
                <p>Bookmarks: {bookmarks.length}</p>
                <button
                  onClick={toggleTheme}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: 10,
                    border: "none",
                    cursor: "pointer",
                    fontWeight: 600,
                    marginBottom: 10,
                    background: dark
                      ? "linear-gradient(135deg,#334155,#1e293b)"
                      : "linear-gradient(135deg,#e0e7ff,#c7d2fe)",
                  }}
                >{dark ? "Light Mode" : "Dark Mode"}</button>
                <button
                  onClick={() => {
                    logout();
                    setBookmarks([]);
                    setShowProfile(false);
                  }}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: 10,
                    border: "none",
                    cursor: "pointer",
                    fontWeight: 600,
                    background: "linear-gradient(135deg,#ef4444,#dc2626)",
                    color: "#fff",
                  }}
                >Logout</button>
              </>
            )}
            <button onClick={() => setShowProfile(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
