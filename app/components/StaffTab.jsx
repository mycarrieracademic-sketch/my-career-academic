"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

export default function StaffTab() {
  const [staff, setStaff] = useState([]);
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teacherSubjects, setTeacherSubjects] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    full_name: "", role: "teacher", mobile: "", email: "", password: "", salary: "", rate_per_class: "", aadhaar: "", join_date: new Date().toISOString().split("T")[0]
  });

  useEffect(() => { fetchStaff(); fetchCourses(); fetchSubjects(); fetchTeacherSubjects(); }, []);

  async function fetchStaff() {
    const { data } = await supabase.from("staff").select("*").order("created_at", { ascending: false });
    setStaff(data || []);
    setLoading(false);
  }

  async function fetchCourses() {
    const { data } = await supabase.from("courses").select("*").order("name");
    setCourses(data || []);
  }

  async function fetchSubjects() {
    const { data } = await supabase.from("subjects").select("*").order("name");
    setSubjects(data || []);
  }

  async function fetchTeacherSubjects() {
    const { data } = await supabase.from("teacher_subjects").select("*");
    setTeacherSubjects(data || []);
  }

  function toggleSubject(id) {
    setSelectedSubjects(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  async function handleSave() {
    if (!form.full_name.trim()) return alert("Name required!");
    if (form.role === "teacher" && !form.email.trim()) return alert("Login email)!");
    if (form.role === "teacher" && !editing && !form.password.trim()) return alert("Creat New Password)!");

    const payload = {
      full_name: form.full_name.trim(),
      role: form.role,
      mobile: form.mobile.trim(),
      email: form.email.trim(),
      salary: form.role === "teacher" ? 0 : (parseFloat(form.salary) || 0),
      rate_per_class: form.role === "teacher" ? (parseFloat(form.rate_per_class) || 0) : 0,
      aadhaar: form.aadhaar.trim(),
      join_date: form.join_date,
      status: "active"
    };
    if (form.role === "teacher" && form.password.trim()) {
      payload.password = form.password.trim();
    }

    let staffId = editing?.id;
    if (editing) {
      await supabase.from("staff").update(payload).eq("id", editing.id);
    } else {
      const { data } = await supabase.from("staff").insert(payload).select().single();
      staffId = data?.id;
    }

    if (form.role === "teacher" && staffId) {
      await supabase.from("teacher_subjects").delete().eq("staff_id", staffId);
      if (selectedSubjects.length > 0) {
        await supabase.from("teacher_subjects").insert(
          selectedSubjects.map(subject_id => ({ staff_id: staffId, subject_id }))
        );
      }
    }

    resetForm();
    fetchStaff();
    fetchTeacherSubjects();
  }

  async function handleDelete(id) {
    if (!confirm("Delete this staff member?")) return;
    await supabase.from("staff").delete().eq("id", id);
    fetchStaff();
  }

  async function handleStatusToggle(s) {
    const newStatus = s.status === "active" ? "inactive" : "active";
    await supabase.from("staff").update({ status: newStatus }).eq("id", s.id);
    fetchStaff();
  }

  function handleEdit(s) {
    setEditing(s);
    setForm({
      full_name: s.full_name, role: s.role,
      mobile: s.mobile || "", email: s.email || "", password: "",
      salary: s.salary || "", rate_per_class: s.rate_per_class || "", aadhaar: s.aadhaar || "",
      join_date: s.join_date || new Date().toISOString().split("T")[0]
    });
    setSelectedSubjects(teacherSubjects.filter(ts => ts.staff_id === s.id).map(ts => ts.subject_id));
    setShowForm(true);
  }

  function resetForm() {
    setShowForm(false);
    setEditing(null);
    setSelectedSubjects([]);
    setForm({ full_name: "", role: "teacher", mobile: "", email: "", password: "", salary: "", rate_per_class: "", aadhaar: "", join_date: new Date().toISOString().split("T")[0] });
  }

  const roleColor = { teacher: "#4f8ef7", accountant: "#27ae60", cleaner: "#e67e22", cook: "#9b59b6", helper: "#16a085" };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h2 style={{ fontSize: "22px", fontWeight: "700" }}>Staff</h2>
        <button onClick={() => { resetForm(); setShowForm(true); }}
          style={{ padding: "10px 20px", background: "#1a1a2e", color: "white", border: "none", borderRadius: "6px", fontWeight: "600" }}>
          + Add Staff
        </button>
      </div>

      {showForm && (
        <div style={{ background: "white", borderRadius: "12px", padding: "24px", marginBottom: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
          <h3 style={{ marginBottom: "16px", fontWeight: "600" }}>{editing ? "Edit Staff" : "New Staff"}</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>Full Name *</label>
              <input value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })}
                style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "6px" }} />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>Role *</label>
              <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
                style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "6px" }}>
                <option value="teacher">Teacher</option>
                <option value="accountant">Accountant</option>
                <option value="cleaner">Cleaner</option>
                <option value="cook">Cook</option>
                <option value="helper">Helper</option>
              </select>
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>Mobile</label>
              <input value={form.mobile} onChange={e => setForm({ ...form, mobile: e.target.value })}
                style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "6px" }} />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>Email {form.role === "teacher" && "*"}</label>
              <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder={form.role === "teacher" ? "Examp@mycareer.com" : ""}
                style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "6px" }} />
            </div>
            {form.role === "teacher" && (
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>
                  Password {!editing && "*"}
                </label>
                <input type="text" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder={editing ? "Leave blank if you don't want to change it" : "Login password set karo"}
                  style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "6px" }} />
              </div>
            )}
            {form.role === "teacher" ? (
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>Rate per Class (₹)</label>
                <input type="number" value={form.rate_per_class} onChange={e => setForm({ ...form, rate_per_class: e.target.value })}
                  placeholder="e.g. 500"
                  style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "6px" }} />
              </div>
            ) : (
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>Salary (₹)</label>
                <input type="number" value={form.salary} onChange={e => setForm({ ...form, salary: e.target.value })}
                  style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "6px" }} />
              </div>
            )}
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>Aadhaar Card Number</label>
              <input value={form.aadhaar} onChange={e => setForm({ ...form, aadhaar: e.target.value })}
                placeholder="XXXX XXXX XXXX" maxLength={14}
                style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "6px" }} />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>Join Date</label>
              <input type="date" value={form.join_date} onChange={e => setForm({ ...form, join_date: e.target.value })}
                style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "6px" }} />
            </div>
          </div>

          {form.role === "teacher" && (
            <div style={{ marginTop: "18px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "500" }}>Assigned Subjects</label>
              {courses.map(course => {
                const courseSubjects = subjects.filter(s => s.course_id === course.id);
                if (courseSubjects.length === 0) return null;
                return (
                  <div key={course.id} style={{ marginBottom: "12px" }}>
                    <div style={{ fontSize: "13px", fontWeight: "600", color: "#444", marginBottom: "6px" }}>{course.name}</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      {courseSubjects.map(s => (
                        <label key={s.id} style={{
                          display: "flex", alignItems: "center", gap: "6px", padding: "6px 12px",
                          background: selectedSubjects.includes(s.id) ? "#1a1a2e" : "#f8f9fa",
                          color: selectedSubjects.includes(s.id) ? "white" : "#333",
                          border: "1px solid #ddd", borderRadius: "20px", fontSize: "12px", cursor: "pointer"
                        }}>
                          <input type="checkbox" checked={selectedSubjects.includes(s.id)} onChange={() => toggleSubject(s.id)}
                            style={{ display: "none" }} />
                          {s.name} <span style={{ opacity: 0.7 }}>({s.stream})</span>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
            <button onClick={handleSave}
              style={{ padding: "10px 24px", background: "#1a1a2e", color: "white", border: "none", borderRadius: "6px", fontWeight: "600" }}>
              {editing ? "Update" : "Save"}
            </button>
            <button onClick={resetForm}
              style={{ padding: "10px 24px", background: "#f0f0f0", border: "none", borderRadius: "6px" }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? <div>Loading...</div> : (
        <div style={{ background: "white", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", overflow: "hidden" }}>
          {staff.length === 0 ? (
            <div style={{ padding: "32px", textAlign: "center", color: "#666" }}>No staff yet.</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8f9fa", borderBottom: "2px solid #eee" }}>
                  {["#", "Name", "Role", "Mobile", "Email", "Salary", "Status", "Actions"].map(h => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "#444" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {staff.map((s, i) => (
                  <tr key={s.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                    <td style={{ padding: "12px 16px", fontSize: "14px", color: "#888" }}>{i + 1}</td>
                    <td style={{ padding: "12px 16px", fontSize: "14px", fontWeight: "500" }}>{s.full_name}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{
                        padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "600",
                        background: (roleColor[s.role] || "#888") + "20", color: roleColor[s.role] || "#888"
                      }}>{s.role}</span>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: "14px", color: "#555" }}>{s.mobile || "-"}</td>
                    <td style={{ padding: "12px 16px", fontSize: "14px", color: "#555" }}>{s.email || "-"}</td>
                    <td style={{ padding: "12px 16px", fontSize: "14px" }}>
                      {s.role === "teacher" ? `₹${s.rate_per_class || 0}/class` : `₹${s.salary || 0}`}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{
                        padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "600",
                        background: s.status === "active" ? "#e8f8f0" : "#ffeaea",
                        color: s.status === "active" ? "#27ae60" : "#e74c3c"
                      }}>{s.status}</span>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button onClick={() => handleEdit(s)}
                          style={{ padding: "5px 12px", background: "#f0f4ff", color: "#1a1a2e", border: "1px solid #c0d0ff", borderRadius: "6px", fontSize: "12px" }}>
                          Edit
                        </button>
                        <button onClick={() => handleStatusToggle(s)}
                          style={{ padding: "5px 12px", background: "#fffbe6", color: "#b8860b", border: "1px solid #ffe066", borderRadius: "6px", fontSize: "12px" }}>
                          {s.status === "active" ? "Deactivate" : "Activate"}
                        </button>
                        <button onClick={() => handleDelete(s.id)}
                          style={{ padding: "5px 12px", background: "#fff0f0", color: "#c00", border: "1px solid #ffc0c0", borderRadius: "6px", fontSize: "12px" }}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
