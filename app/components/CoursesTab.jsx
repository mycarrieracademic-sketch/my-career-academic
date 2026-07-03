"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

export default function CoursesTab() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", description: "", duration_months: "" });
  const [subjects, setSubjects] = useState([]);
  const [expandedCourse, setExpandedCourse] = useState(null);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [newSubjectStream, setNewSubjectStream] = useState("Science");

  const STREAMS = ["Science", "Arts", "Commerce"];

  useEffect(() => { fetchCourses(); fetchSubjects(); }, []);

  async function fetchSubjects() {
    const { data } = await supabase.from("subjects").select("*").order("name");
    setSubjects(data || []);
  }

  async function handleAddSubject(courseId) {
    if (!newSubjectName.trim()) return alert("Subject name required!");
    await supabase.from("subjects").insert({ course_id: courseId, name: newSubjectName.trim(), stream: newSubjectStream });
    setNewSubjectName("");
    fetchSubjects();
  }

  async function handleDeleteSubject(id) {
    if (!confirm("Delete this subject? Isse attached attendance/timetable data ho sakta hai check kar lo.")) return;
    await supabase.from("subjects").delete().eq("id", id);
    fetchSubjects();
  }

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
    };
    if (editing) {
      await supabase.from("courses").update(payload).eq("id", editing.id);
    } else {
      await supabase.from("courses").insert(payload);
    }
    setShowForm(false);
    setEditing(null);
    setForm({ name: "", description: "", duration_months: "" });
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
    });
    setShowForm(true);
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h2 style={{ fontSize: "22px", fontWeight: "700" }}>Courses</h2>
        <button
          onClick={() => { setShowForm(true); setEditing(null); setForm({ name: "", description: "", duration_months: "" }); }}
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
              </div>
              <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
                <button onClick={() => handleEdit(course)}
                  style={{ padding: "6px 16px", background: "#f0f4ff", color: "#1a1a2e", border: "1px solid #c0d0ff", borderRadius: "6px", fontSize: "13px" }}>
                  Edit
                </button>
                <button onClick={() => handleDelete(course.id)}
                  style={{ padding: "6px 16px", background: "#fff0f0", color: "#c00", border: "1px solid #ffc0c0", borderRadius: "6px", fontSize: "13px" }}>
                  Delete
                </button>
                <button onClick={() => setExpandedCourse(expandedCourse === course.id ? null : course.id)}
                  style={{ padding: "6px 16px", background: "#f0fff4", color: "#27ae60", border: "1px solid #b0e0c0", borderRadius: "6px", fontSize: "13px" }}>
                  {expandedCourse === course.id ? "Hide Subjects" : "Manage Subjects"}
                </button>
              </div>

              {expandedCourse === course.id && (
                <div style={{ borderTop: "1px solid #eee", paddingTop: "12px" }}>
                  <div style={{ fontSize: "13px", fontWeight: "600", marginBottom: "8px", color: "#444" }}>Subjects</div>
                  {STREAMS.map(stream => {
                    const streamSubjects = subjects.filter(s => s.course_id === course.id && s.stream === stream);
                    return (
                      <div key={stream} style={{ marginBottom: "10px" }}>
                        <div style={{ fontSize: "12px", fontWeight: "600", color: "#888", marginBottom: "6px" }}>{stream}</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          {streamSubjects.length === 0 && (
                            <div style={{ fontSize: "12px", color: "#bbb" }}>Koi subject nahi hai.</div>
                          )}
                          {streamSubjects.map(s => (
                            <div key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8f9fa", padding: "6px 10px", borderRadius: "6px" }}>
                              <span style={{ fontSize: "13px" }}>{s.name}</span>
                              <button onClick={() => handleDeleteSubject(s.id)}
                                style={{ padding: "2px 8px", background: "#fff0f0", color: "#c00", border: "1px solid #ffc0c0", borderRadius: "4px", fontSize: "11px" }}>
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                  <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                    <select value={newSubjectStream} onChange={e => setNewSubjectStream(e.target.value)}
                      style={{ padding: "8px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "13px" }}>
                      {STREAMS.map(st => <option key={st} value={st}>{st}</option>)}
                    </select>
                    <input value={newSubjectName} onChange={e => setNewSubjectName(e.target.value)}
                      placeholder="e.g. Physics" onKeyDown={e => e.key === "Enter" && handleAddSubject(course.id)}
                      style={{ flex: 1, padding: "8px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "13px" }} />
                    <button onClick={() => handleAddSubject(course.id)}
                      style={{ padding: "8px 14px", background: "#1a1a2e", color: "white", border: "none", borderRadius: "6px", fontSize: "13px" }}>
                      + Add
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
