import { useEffect, useState } from "react";
import API, {
  fetchAdminOverview,
  fetchAdminNewsAnalytics
} from "./adminApi";
import axios from "axios";
import AdminLogin from "./AdminLogin";

/* =========================
   REUSABLE STYLES
========================= */
const btn = (bg) => ({
  padding: "8px 14px",
  borderRadius: 8,
  border: "none",
  background: bg,
  color: "#fff",
  cursor: "pointer",
  transition: "all .2s ease",
});

const Stat = ({ label, value }) => (
  <div style={{
    background: "#fff",
    padding: 20,
    borderRadius: 14,
    boxShadow: "0 8px 20px rgba(0,0,0,.08)"
  }}>
    <div style={{ fontSize: 13, color: "#666" }}>{label}</div>
    <div style={{ fontSize: 28, fontWeight: 700 }}>{value}</div>
  </div>
);

function Admin() {
  /* AUTH */
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem("adminAuth"));

  /* LANGUAGE TOGGLE */
  const [lang, setLang] = useState("hi"); // hi | en

  /* ANALYTICS */
  const [overview, setOverview] = useState(null);
  const [newsAnalytics, setNewsAnalytics] = useState([]);

  /* NEWS */
  const [news, setNews] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");

  /* UPLOAD */
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadText, setUploadText] = useState("");
  const [uploading, setUploading] = useState(false);

  /* EDIT */
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editSummary, setEditSummary] = useState("");

  /* FETCH NEWS */
  const fetchNews = async () => {
    const params = {};
    if (statusFilter !== "all") params.status = statusFilter;
    const res = await API.get("/admin/news", { params });
    setNews(res.data || []);
  };

  useEffect(() => {
    if (!loggedIn) return;
    fetchNews();
    fetchAdminOverview().then(r => setOverview(r.data));
    fetchAdminNewsAnalytics().then(r => setNewsAnalytics(r.data));
  }, [loggedIn, statusFilter]);

  /* AI UPLOAD */
  const submitContent = async () => {
    if (!uploadFile && !uploadText.trim()) return alert("Upload or paste text");

    setUploading(true);
    try {
      const fd = new FormData();
      if (uploadFile) fd.append("file", uploadFile);
      else fd.append("file", new Blob([uploadText]), "content.txt");

      await axios.post("http://127.0.0.1:8000/upload/", fd);
      setUploadFile(null);
      setUploadText("");
      fetchNews();
    } finally {
      setUploading(false);
    }
  };

  /* ACTIONS */
  const uploadImage = async (id, file) => {
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    await API.post(`/admin/upload-image/${id}`, fd);
    fetchNews();
  };

  const approveNews = async (id) => {
    await API.post(`/admin/approve/${id}`);
    fetchNews();
  };

  const rejectNews = async (id) => {
    await API.post(`/admin/reject/${id}`);
    fetchNews();
  };

  const startEdit = (n) => {
    setEditingId(n.id);
    setEditTitle(lang === "hi" ? n.title_hi || "" : n.title_en || "");
    setEditSummary(lang === "hi" ? n.summary_hi || "" : n.summary_en || "");
  };

  const saveEdit = async (id) => {
    await API.put(`/admin/edit/${id}`, {
      title_hi: lang === "hi" ? editTitle : undefined,
      title_en: lang === "en" ? editTitle : undefined,
      summary_hi: lang === "hi" ? editSummary : undefined,
      summary_en: lang === "en" ? editSummary : undefined,
    });
    setEditingId(null);
    fetchNews();
  };

  const logout = () => {
    localStorage.removeItem("adminAuth");
    window.location.reload();
  };

  if (!loggedIn) return <AdminLogin onLogin={() => setLoggedIn(true)} />;

  return (
    <div style={{ background: "#f2f4f8", minHeight: "100vh" }}>
      {/* HEADER */}
      <div style={{
        background: "linear-gradient(90deg,#0f172a,#1e293b)",
        color: "#fff",
        padding: "18px 28px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <h2>🛠 Admin Dashboard</h2>

        <div style={{ display: "flex", gap: 12 }}>
          {/* LANG TOGGLE */}
          <button
            onClick={() => setLang(l => l === "hi" ? "en" : "hi")}
            style={btn("#2563eb")}
          >
            {lang === "hi" ? "Hindi" : "English"}
          </button>

          <button onClick={logout} style={btn("#dc2626")}>Logout</button>
        </div>
      </div>

      <div style={{ maxWidth: 1300, margin: "auto", padding: 28 }}>
        {/* ANALYTICS */}
        {overview && (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
            gap: 20,
            marginBottom: 30
          }}>
            <Stat label="📰 Total News" value={overview.total_news} />
            <Stat label="✅ Published" value={overview.published} />
            <Stat label="❌ Rejected" value={overview.rejected} />
            <Stat label="⭐ Bookmarks" value={overview.bookmarks} />
          </div>
        )}

        {/* UPLOAD */}
        <div style={{
          background: "#fff",
          padding: 24,
          borderRadius: 16,
          boxShadow: "0 8px 20px rgba(0,0,0,.08)",
          marginBottom: 30
        }}>
          <h3>🤖 AI News Upload</h3>
          <input type="file" onChange={e => setUploadFile(e.target.files?.[0])} />
          <textarea
            rows={4}
            value={uploadText}
            placeholder="Paste raw news text here..."
            onChange={e => setUploadText(e.target.value)}
            style={{ width: "100%", marginTop: 12 }}
          />
          <button
            onClick={submitContent}
            disabled={uploading}
            style={{ ...btn("#16a34a"), marginTop: 12 }}
          >
            {uploading ? "Processing..." : "Submit"}
          </button>
        </div>

        {/* FILTER */}
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          style={{ padding: 10, borderRadius: 8 }}
        >
          <option value="all">All</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="rejected">Rejected</option>
        </select>

        {/* NEWS GRID */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(380px,1fr))",
          gap: 24,
          marginTop: 20
        }}>
          {news.map(n => {
            const a = newsAnalytics.find(x => x.id === n.id);
            const title = lang === "hi" ? n.title_hi : n.title_en;
            const summary = lang === "hi" ? n.summary_hi : n.summary_en;

            return (
              <div key={n.id} style={{
                background: "#fff",
                padding: 18,
                borderRadius: 16,
                boxShadow: "0 8px 20px rgba(0,0,0,.08)"
              }}>
                {n.image_url && (
                  <img
                    src={`https://al-shorts-backend.onrender.com${n.image_url}?t=${Date.now()}`}
                    style={{
                      width: "100%",
                      height: 200,
                      objectFit: "cover",
                      borderRadius: 12,
                      marginBottom: 10
                    }}
                  />
                )}

                {editingId === n.id ? (
                  <>
                    <input value={editTitle} onChange={e => setEditTitle(e.target.value)} />
                    <textarea rows={4} value={editSummary} onChange={e => setEditSummary(e.target.value)} />
                    <div style={{ display: "flex", gap: 8 }}>
                      <button style={btn("#16a34a")} onClick={() => saveEdit(n.id)}>Save</button>
                      <button style={btn("#6b7280")} onClick={() => setEditingId(null)}>Cancel</button>
                    </div>
                  </>
                ) : (
                  <>
                    <h4>{title}</h4>
                    <p>{summary}</p>

                    {n.image_prompt && (
                      <div style={{
                        background: "#f1f5f9",
                        padding: 10,
                        borderRadius: 8,
                        fontSize: 13
                      }}>
                        🖼 <b>Image Prompt:</b> {n.image_prompt}
                      </div>
                    )}
                  </>
                )}

                <small>Status: <b>{n.status}</b></small><br />
                <small>⭐ Bookmarks: {a?.bookmarks || 0}</small>

                <input type="file" onChange={e => uploadImage(n.id, e.target.files?.[0])} />

                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <button style={btn("#22c55e")} onClick={() => approveNews(n.id)}>Approve</button>
                  <button style={btn("#ef4444")} onClick={() => rejectNews(n.id)}>Reject</button>
                  <button style={btn("#3b82f6")} onClick={() => startEdit(n)}>Edit</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Admin;
