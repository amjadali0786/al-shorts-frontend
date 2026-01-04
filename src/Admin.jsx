import { useEffect, useState } from "react";
import API, {
  fetchAdminOverview,
  fetchAdminNewsAnalytics,
} from "./adminApi";
import AdminLogin from "./AdminLogin";

function Admin() {
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem("adminAuth"));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [news, setNews] = useState([]);
  const [overview, setOverview] = useState(null);
  const [newsAnalytics, setNewsAnalytics] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");

  /* =========================
     FETCH ALL ADMIN DATA
  ========================= */
  const loadAdminData = async () => {
    setLoading(true);
    setError("");

    try {
      const params = {};
      if (statusFilter !== "all") params.status = statusFilter;

      const [newsRes, overviewRes, analyticsRes] = await Promise.all([
        API.get("/admin/news", { params }),
        fetchAdminOverview(),
        fetchAdminNewsAnalytics(),
      ]);

      setNews(Array.isArray(newsRes.data) ? newsRes.data : []);
      setOverview(overviewRes.data || null);
      setNewsAnalytics(Array.isArray(analyticsRes.data) ? analyticsRes.data : []);
    } catch (e) {
      console.error("Admin load failed", e);
      setError("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (loggedIn) loadAdminData();
  }, [loggedIn, statusFilter]);

  if (!loggedIn) return <AdminLogin onLogin={() => setLoggedIn(true)} />;

  if (loading)
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <h3>Loading admin panel...</h3>
      </div>
    );

  if (error)
    return (
      <div style={{ padding: 40, color: "red" }}>
        {error}
      </div>
    );

  return (
    <div style={{ padding: 30 }}>
      <h2>🛠 Admin Dashboard</h2>

      {overview && (
        <div style={{ display: "flex", gap: 20, marginBottom: 20 }}>
          <div>Total: {overview.total_news}</div>
          <div>Published: {overview.published}</div>
          <div>Rejected: {overview.rejected}</div>
          <div>Bookmarks: {overview.bookmarks}</div>
        </div>
      )}

      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
      >
        <option value="all">All</option>
        <option value="draft">Draft</option>
        <option value="published">Published</option>
        <option value="rejected">Rejected</option>
      </select>

      <div style={{ marginTop: 20 }}>
        {news.length === 0 && <p>No news found</p>}

        {news.map((n) => {
          const a = newsAnalytics.find((x) => x.id === n.id);
          return (
            <div
              key={n.id}
              style={{
                border: "1px solid #ddd",
                padding: 15,
                marginBottom: 15,
                borderRadius: 8,
              }}
            >
              <h4>{n.title_hi || n.title_en}</h4>
              <p>{n.summary_hi || n.summary_en}</p>
              <small>Status: {n.status}</small><br />
              <small>Bookmarks: {a?.bookmarks || 0}</small>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Admin;
