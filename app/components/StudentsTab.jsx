"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

export default function StudentsTab() {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCourse, setFilterCourse] = useState("");
  const [filterStatus, setFilterStatus] = useState("active");
  const [selected, setSelected] = useState(null);

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    const [s, c] = await Promise.all([
      supabase.from("students").select("*, courses(name)").order("created_at", { ascending: false }),
      supabase.from("courses").select("*").order("name")
    ]);
    setStudents(s.data || []);
    setCourses(c.data || []);
    setLoading(false);
  }

  async function handleStatusChange(id, status) {
    if (!confirm(`Change student status to "${status}"?`)) return;
    await supabase.from("students").update({ status }).eq("id", id);
    fetchAll();
    setSelected(null);
  }

  const filtered = students.filter(s => {
    const matchSearch = s.full_name.toLowerCase().includes(search.toLowerCase()) ||
      (s.mobile && s.mobile.includes(search));
    const matchCourse = filterCourse ? s.course_id === filterCourse : true;
    const matchStatus = filterStatus ? s.status === filterStatus : true;
    return matchSearch && matchCourse && matchStatus;
  });

  const statusColor = { active: "#27ae60", dropped: "#e74c3c", passed: "#3498db" };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2 style={{ fontSize: "22px", fontWeight: "700" }}>Students</h2>
        <div style={{ fontSize: "14px", color: "#666" }}>Total: {filtered.length}</div>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search name or mobile..."
          style={{ padding: "10px 12px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "14px", width: "220px" }}
        />
        <select value={filterCourse} onChange={e => setFilterCourse(e.target.value)}
          style={{ padding: "10px 12px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "14px" }}>
          <option value="">All Courses</option>
          {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          style={{ padding: "10px 12px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "14px" }}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="dropped">Dropped</option>
          <option value="passed">Passed</option>
        </select>
      </div>

      {/* Table */}
      {loading ? <div>Loading...</div> : (
        <div style={{ background: "white", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", overflow: "hidden" }}>
          {filtered.length === 0 ? (
            <div style={{ padding: "32px", textAlign: "center", color: "#666" }}>No students found.</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8f9fa", borderBottom: "2px solid #eee" }}>
                  {["#", "Name", "Course", "Mobile", "Admission Date", "Status", "Action"].map(h => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "#444" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, i) => (
                  <tr key={s.id} style={{ borderBottom: "1px solid #f0f0f0" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#fafafa"}
                    onMouseLeave={e => e.currentTarget.style.background = "white"}>
                    <td style={{ padding: "12px 16px", fontSize: "14px", color: "#888" }}>{i + 1}</td>
                    <td style={{ padding: "12px 16px", fontSize: "14px", fontWeight: "500" }}>{s.full_name}</td>
                    <td style={{ padding: "12px 16px", fontSize: "14px", color: "#555" }}>{s.courses?.name || "-"}</td>
                    <td style={{ padding: "12px 16px", fontSize: "14px", color: "#555" }}>{s.mobile || "-"}</td>
                    <td style={{ padding: "12px 16px", fontSize: "14px", color: "#555" }}>{s.admission_date || "-"}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{
                        padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "600",
                        background: statusColor[s.status] + "20", color: statusColor[s.status]
                      }}>{s.status}</span>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <button onClick={() => setSelected(s)}
                        style={{ padding: "6px 14px", background: "#f0f4ff", color: "#1a1a2e", border: "1px solid #c0d0ff", borderRadius: "6px", fontSize: "13px" }}>
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Student Detail Modal */}
      {selected && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
          display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000
        }}>
          <div style={{ background: "white", borderRadius: "12px", padding: "32px", width: "480px", maxWidth: "90vw" }}>
            <h3 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "20px" }}>{selected.full_name}</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "14px" }}>
              {[
                ["Course", selected.courses?.name],
                ["Mobile", selected.mobile],
                ["Guardian Mobile", selected.guardian_mobile],
                ["Admission Date", selected.admission_date],
                ["Address", selected.address],
                ["Status", selected.status],
              ].map(([label, value]) => (
                <div key={label}>
                  <div style={{ color: "#888", fontSize: "12px", marginBottom: "2px" }}>{label}</div>
                  <div style={{ fontWeight: "500" }}>{value || "-"}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "24px", flexWrap: "wrap" }}>
              {selected.status !== "dropped" && (
                <button onClick={() => handleStatusChange(selected.id, "dropped")}
                  style={{ padding: "8px 16px", background: "#fff0f0", color: "#c00", border: "1px solid #ffc0c0", borderRadius: "6px", fontSize: "13px" }}>
                  Drop Student
                </button>
              )}
              {selected.status !== "active" && (
                <button onClick={() => handleStatusChange(selected.id, "active")}
                  style={{ padding: "8px 16px", background: "#f0fff4", color: "#27ae60", border: "1px solid #b0f0c0", borderRadius: "6px", fontSize: "13px" }}>
                  Set Active
                </button>
              )}
              {selected.status !== "passed" && (
                <button onClick={() => handleStatusChange(selected.id, "passed")}
                  style={{ padding: "8px 16px", background: "#f0f4ff", color: "#3498db", border: "1px solid #c0d0ff", borderRadius: "6px", fontSize: "13px" }}>
                  Mark Passed
                </button>
              )}
              <button onClick={() => setSelected(null)}
                style={{ padding: "8px 16px", background: "#f0f0f0", border: "none", borderRadius: "6px", fontSize: "13px", marginLeft: "auto" }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
