import { useState } from "react";

function AdminLogin({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    if (!username || !password) {
      setError("Enter username & password");
      return;
    }

    localStorage.setItem(
      "adminAuth",
      JSON.stringify({ username, password })
    );

    onLogin();
  };

  return (
    <div
      style={{
        maxWidth: 400,
        margin: "120px auto",
        padding: 24,
        borderRadius: 12,
        background: "#fff",
        boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
      }}
    >
      <h2 style={{ textAlign: "center" }}>🔐 Admin Login</h2>

      <input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={{ width: "100%", padding: 10, marginBottom: 10 }}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ width: "100%", padding: 10, marginBottom: 10 }}
      />

      {error && <p style={{ color: "red" }}>{error}</p>}

      <button
        onClick={handleLogin}
        style={{
          width: "100%",
          padding: 10,
          borderRadius: 8,
          border: "none",
          background: "#111",
          color: "#fff",
        }}
      >
        Login
      </button>
    </div>
  );
}

export default AdminLogin;
