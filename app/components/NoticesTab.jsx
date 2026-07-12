"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

export default function NoticesTab({ userId, role }) {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", target_role: "all" });

  useEffect(() => { fetchNotices(); }, []);

  async function fetchNotices() {
    const { data } = await supabase.from("notices").select("*").order("created_at", { ascending: false });
    setNotices(data || []);
    setLoading(false);
  }

  async function handleSave() {
    if (!form.title.trim()) return alert("Title required!");
    setSaving(true);
    await supabase.from("notices").insert({
      title: form.title.trim(),
      content: form.content.trim(),
      target_role: form.target_role,
      created_by: userId
    });
    setShowForm(false);
    setForm({ title: "", content: "", target_role: "all" });
    setSaving(false);
    fetchNotices();
  }

  async function handleDelete(id) {
    if (!confirm("Delete this notice?")) return;
    await supabase.from("notices").delete().eq("id", id);
    fetchNotices();
  }

  const roleColor = {
    all: "#3498db", admin: "#1a1a2e", teacher: "#27ae60",
    student: "#e67e22", guardian: "#9b59b6"
  };

  const visibleNotices = role === "admin"
    ? notices
    : notices.filter(n => n.target_role === "all" || n.target_role === role);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h2 style={{ fontSize: "22px", fontWeight: "700" }}>Notices</h2>
        {role === "admin" && (
          <button onClick={() => setShowForm(true)}
            style={{ padding: "10px 20px", background: "#1a1a2e", color: "white", border: "none", borderRadius: "6px", fontWeight: "600" }}>
            + Post Notice
          </button>
        )}
      </div>

      {showForm && role === "admin" && (
        <div style={{ background: "white", borderRadius: "12px", padding: "24px", marginBottom: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
          <h3 style={{ marginBottom: "16px", fontWeight: "600" }}>New Notice</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>Title *</label>
              <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="Notice title"
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "14px" }} />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>Content</label>
              <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })}
                placeholder="Notice details..."
                rows={4}
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "14px", resize: "vertical" }} />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>Target Audience</label>
              <select value={form.target_role} onChange={e => setForm({ ...form, target_role: e.target.value })}
                style={{ padding: "10px 12px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "14px" }}>
                <option value="all">Everyone</option>
                <option value="student">Students Only</option>
                <option value="teacher">Teachers Only</option>
                <option value="guardian">Guardians Only</option>
                <option value="admin">Admin Only</option>
              </select>
            </div>
          </div>
          <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
            <button onClick={handleSave} disabled={saving}
              style={{ padding: "10px 24px", background: saving ? "#999" : "#1a1a2e", color: "white", border: "none", borderRadius: "6px", fontWeight: "600" }}>
              {saving ? "Posting..." : "Post Notice"}
            </button>
            <button onClick={() => setShowForm(false)}
              style={{ padding: "10px 24px", background: "#f0f0f0", border: "none", borderRadius: "6px" }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? <div>Loading...</div> : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {visibleNotices.length === 0 && (
            <div style={{ background: "white", borderRadius: "12px", padding: "32px", textAlign: "center", color: "#666" }}>
              No notices yet.
            </div>
          )}
          {visibleNotices.map(notice => (
            <div key={notice.id} style={{ background: "white", borderRadius: "12px", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                    <span style={{ fontWeight: "700", fontSize: "16px" }}>{notice.title}</span>
                    <span style={{
                      padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "600",
                      background: (roleColor[notice.target_role] || "#888") + "20",
                      color: roleColor[notice.target_role] || "#888"
                    }}>
                      {notice.target_role === "all" ? "Everyone" : notice.target_role}
                    </span>
                  </div>
                  {notice.content && (
                    <p style={{ fontSize: "14px", color: "#555", lineHeight: "1.6", marginBottom: "8px" }}>
                      {notice.content}
                    </p>
                  )}
                  <div style={{ fontSize: "12px", color: "#aaa" }}>
                    {new Date(notice.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </div>
                </div>
                {role === "admin" && (
                  <button onClick={() => handleDelete(notice.id)}
                    style={{ marginLeft: "16px", padding: "6px 14px", background: "#fff0f0", color: "#c00", border: "1px solid #ffc0c0", borderRadius: "6px", fontSize: "13px" }}>
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
