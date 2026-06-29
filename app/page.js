"use client";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import CoursesTab from "./components/CoursesTab";
import AdmissionTab from "./components/AdmissionTab";
import StudentsTab from "./components/StudentsTab";

export default function App() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else { setProfile(null); setLoading(false); }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(userId) {
    const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
    setProfile(data);
    setLoading(false);
  }

  async function handleLogin() {
    setAuthLoading(true);
    setAuthError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setAuthError(error.message);
    setAuthLoading(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setActiveTab("Dashboard");
  }

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
      <div style={{ fontSize: "18px", color: "#666" }}>Loading...</div>
    </div>
  );

  if (!session) return (
    <div style={{
      display: "flex", justifyContent: "center",
      alignItems: "center", minHeight: "100vh", background: "#f0f2f5"
    }}>
      <div style={{
        background: "white", padding: "40px", borderRadius: "12px",
        width: "360px", boxShadow: "0 4px 20px rgba(0,0,0,0.1)"
      }}>
        <h1 style={{ textAlign: "center", marginBottom: "8px", color: "#1a1a2e" }}>
          My Career Academic
        </h1>
        <p style={{ textAlign: "center", color: "#666", marginBottom: "32px", fontSize: "14px" }}>
          MY LIFELINE FOUNDATION
        </p>

        {authError && (
          <div style={{
            background: "#fff0f0", color: "#c00", padding: "10px",
            borderRadius: "6px", marginBottom: "16px", fontSize: "14px"
          }}>
            {authError}
          </div>
        )}

        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>Email</label>
          <input
            type="email" value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="admin@mycareeracademic.com"
            style={{ width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "14px" }}
          />
        </div>

        <div style={{ marginBottom: "24px" }}>
          <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>Password</label>
          <input
            type="password" value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            onKeyDown={e => e.key === "Enter" && handleLogin()}
            style={{ width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "14px" }}
          />
        </div>

        <button
          onClick={handleLogin} disabled={authLoading}
          style={{
            width: "100%", padding: "12px",
            background: authLoading ? "#999" : "#1a1a2e",
            color: "white", border: "none", borderRadius: "6px",
            fontSize: "16px", fontWeight: "600"
          }}
        >
          {authLoading ? "Logging in..." : "Login"}
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex" }}>
      <Sidebar
        role={profile?.role || "admin"}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
      />
      <div style={{ marginLeft: "220px", flex: 1, padding: "32px", minHeight: "100vh" }}>
        {activeTab === "Dashboard" && (
          <Dashboard role={profile?.role} userId={session.user.id} />
        )}
        {activeTab === "Courses" && <CoursesTab />}
        {activeTab === "Admission" && <AdmissionTab />}
        {activeTab === "Students" && <StudentsTab />}
        {activeTab !== "Dashboard" && activeTab !== "Courses" && activeTab !== "Admission" && activeTab !== "Students" && (
          <div style={{
            background: "white", borderRadius: "12px",
            padding: "32px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
          }}>
            <h2 style={{ fontSize: "22px", fontWeight: "700", marginBottom: "16px" }}>
              {activeTab}
            </h2>
            <p style={{ color: "#666" }}>Coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
}
