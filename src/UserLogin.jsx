import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "./api";              // ✅ SAME API INSTANCE
import { useAuth } from "./AuthContext";

function UserLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    setLoading(true);

    try {
      // ✅ NO localhost, NO axios direct
      const res = await API.post("/auth/login", {
        email,
        password,
      });

      // ✅ SAME CONTRACT AS BACKEND
      login(res.data.token, res.data.user);
      navigate("/");
    } catch (err) {
      console.error("Login error:", err);

      // ✅ SAFE + FASTAPI FRIENDLY ERROR HANDLING
      if (Array.isArray(err.response?.data?.detail)) {
        setError(err.response.data.detail[0]?.msg || "Invalid input");
      } else if (typeof err.response?.data?.detail === "string") {
        setError(err.response.data.detail);
      } else {
        setError("Invalid email or password");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} style={boxStyle}>
      <h2>🔐 Login</h2>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={inputStyle}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={inputStyle}
      />

      {error && <p style={{ color: "red" }}>{error}</p>}

      <button type="submit" style={btnStyle} disabled={loading}>
        {loading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}

/* =========================
   STYLES
========================= */
const boxStyle = {
  maxWidth: 400,
  margin: "120px auto",
  padding: 24,
  borderRadius: 12,
  background: "#fff",
  boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
};

const inputStyle = {
  width: "100%",
  padding: 10,
  marginBottom: 10,
  borderRadius: 6,
  border: "1px solid #ccc",
};

const btnStyle = {
  width: "100%",
  padding: 10,
  borderRadius: 8,
  border: "none",
  background: "#111",
  color: "#fff",
  cursor: "pointer",
};

export default UserLogin;
