"use client";
import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setError(error.message);
    } else {
      alert("Login successful! Dashboard coming soon...");
    }
    setLoading(false);
  };

  return (
    <div style={{
      display: "flex", justifyContent: "center",
      alignItems: "center", minHeight: "100vh",
      background: "#f0f2f5"
    }}>
      <div style={{
        background: "white", padding: "40px",
        borderRadius: "12px", width: "360px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)"
      }}>
        <h1 style={{ textAlign: "center", marginBottom: "8px", color: "#1a1a2e" }}>
          My Career Academic
        </h1>
        <p style={{ textAlign: "center", color: "#666", marginBottom: "32px", fontSize: "14px" }}>
          MY LIFELINE FOUNDATION
        </p>

        {error && (
          <div style={{
            background: "#fff0f0", color: "#c00",
            padding: "10px", borderRadius: "6px",
            marginBottom: "16px", fontSize: "14px"
          }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="admin@mycareeracademic.com"
            style={{
              width: "100%", padding: "10px 12px",
              border: "1px solid #ddd", borderRadius: "6px",
              fontSize: "14px"
            }}
          />
        </div>

        <div style={{ marginBottom: "24px" }}>
          <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            style={{
              width: "100%", padding: "10px 12px",
              border: "1px solid #ddd", borderRadius: "6px",
              fontSize: "14px"
            }}
          />
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: "100%", padding: "12px",
            background: loading ? "#999" : "#1a1a2e",
            color: "white", border: "none",
            borderRadius: "6px", fontSize: "16px",
            fontWeight: "600"
          }}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </div>
    </div>
  );
}
