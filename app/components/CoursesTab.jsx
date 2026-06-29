"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

export default function CoursesTab() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", description: "", duration_months: "", monthly_fee: "" });

  useEffect(() => { fetchCourses(); }, []);

  async function fetchCourses() {
    const { data } = await supabase.from("courses").select("*").order("created_at", { ascending: false });
    setCourses(data || []);
    setLoading(false);
  }

  async function handleSave() {
    if (!form.name.trim()) return alert("Course name required!");
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      duration_months: parseInt(form.duration_months) || null,
      monthly_fee: parseFloat(form.monthly_fee) || 0,
    };
    if (editing) {
      await supabase.from("courses").update(payload).eq("id", editing.id);
    } else {
      await supabase.from("courses").insert(payload);
    }
    setShowForm(false);
    setEditing(null);
    setForm({ name: "", description: "", duration_months: "", monthly_fee: "" });
    fetchCourses();
  }

  async function handleDelete(id) {
    if (!confirm("Delete this course?")) return;
    await supabase.from("courses").delete().eq("id", id);
    fetchCourses();
  }

  function handleEdit(course) {
    setEditing(course);
    setForm({
      name: course.name,
      description: course.description || "",
      duration_months: course.duration_months || "",
      monthly_fee: course.monthly_fee || "",
    });
    setShowForm(true);
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h2 style={{ fontSize: "22px", fontWeight: "700" }}>Courses</h2>
        <button
          onClick={() => { setShowForm(true); setEditing(null); setForm({ name: "", description: "", duration_months: "", monthly_fee: "" }); }}
          style={{ padding: "10px 20px", background: "#1a1a2e", color: "white", border: "none", borderRadius: "6px", fontWeight: "600" }}
        >
          + Add Course
        </button>
      </div>

      {showForm && (
        <div style={{ background: "white", borderRadius: "12px", padding: "24px", marginBottom: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
          <h3 style={{ marginBottom: "16px", fontWeight: "600" }}>{editing ? "Edit Course" : "New Course"}</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>Course Name *</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "6px" }} />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>Monthly Fee (₹)</label>
              <input type="number" value={form.monthly_fee} onChange={e => setForm({ ...form, monthly_fee: e.target.value })}
                style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "6px" }} />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>Duration (Months)</label>
              <input type="number" value={form.duration_months} onChange={e => setForm({ ...form, duration_months: e.target.value })}
                style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "6px" }} />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>Description</label>
              <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "6px" }} />
            </div>
          </div>
          <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
            <button onClick={handleSave}
              style={{ padding: "10px 24px", background: "#1a1a2e", color: "white", border: "none", borderRadius: "6px", fontWeight: "600" }}>
              {editing ? "Update" : "Save"}
            </button>
            <button onClick={() => { setShowForm(false); setEditing(null); }}
              style={{ padding: "10px 24px", background: "#f0f0f0", border: "none", borderRadius: "6px" }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? <div>Loading...</div> : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
          {courses.length === 0 && <div style={{ color: "#666" }}>No courses yet. Add one!</div>}
          {courses.map(course => (
            <div key={course.id} style={{ background: "white", borderRadius: "12px", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
              <div style={{ fontWeight: "700", fontSize: "16px", marginBottom: "8px" }}>{course.name}</div>
              {course.description && <div style={{ color: "#666", fontSize: "14px", marginBottom: "12px" }}>{course.description}</div>}
              <div style={{ display: "flex", gap: "16px", fontSize: "14px", color: "#444", marginBottom: "16px" }}>
                {course.duration_months && <span>⏱ {course.duration_months} months</span>}
                <span>₹{course.monthly_fee}/month</span>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={() => handleEdit(course)}
                  style={{ padding: "6px 16px", background: "#f0f4ff", color: "#1a1a2e", border: "1px solid #c0d0ff", borderRadius: "6px", fontSize: "13px" }}>
                  Edit
                </button>
                <button onClick={() => handleDelete(course.id)}
                  style={{ padding: "6px 16px", background: "#fff0f0", color: "#c00", border: "1px solid #ffc0c0", borderRadius: "6px", fontSize: "13px" }}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
