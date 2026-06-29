"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

export default function AdmissionTab() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    full_name: "", mobile: "", guardian_mobile: "",
    address: "", course_id: "", admission_date: new Date().toISOString().split("T")[0]
  });

  useEffect(() => { fetchCourses(); }, []);

  async function fetchCourses() {
    const { data } = await supabase.from("courses").select("*").order("name");
    setCourses(data || []);
  }

  async function handleSubmit() {
    if (!form.full_name.trim()) return alert("Student name required!");
    if (!form.course_id) return alert("Please select a course!");
    setLoading(true);

    // Insert student
    const { data: student, error } = await supabase.from("students").insert({
      full_name: form.full_name.trim(),
      mobile: form.mobile.trim(),
      guardian_mobile: form.guardian_mobile.trim(),
      address: form.address.trim(),
      course_id: form.course_id,
      admission_date: form.admission_date,
      status: "active"
    }).select().single();

    if (error) { alert("Error: " + error.message); setLoading(false); return; }

    // Create academic term
    await supabase.from("academic_terms").insert({
      student_id: student.id,
      course_id: form.course_id,
      start_date: form.admission_date,
      is_current: true
    });

    setSuccess(`✅ ${form.full_name} admitted successfully!`);
    setForm({
      full_name: "", mobile: "", guardian_mobile: "",
      address: "", course_id: "", admission_date: new Date().toISOString().split("T")[0]
    });
    setLoading(false);
    setTimeout(() => setSuccess(""), 4000);
  }

  return (
    <div>
      <h2 style={{ fontSize: "22px", fontWeight: "700", marginBottom: "24px" }}>New Admission</h2>

      {success && (
        <div style={{ background: "#f0fff4", color: "#27ae60", padding: "12px 16px", borderRadius: "8px", marginBottom: "20px", fontWeight: "500" }}>
          {success}
        </div>
      )}

      <div style={{ background: "white", borderRadius: "12px", padding: "28px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>

          <div>
            <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>Student Full Name *</label>
            <input value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })}
              placeholder="Enter full name"
              style={{ width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "14px" }} />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>Course *</label>
            <select value={form.course_id} onChange={e => setForm({ ...form, course_id: e.target.value })}
              style={{ width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "14px" }}>
              <option value="">-- Select Course --</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.name} — ₹{c.monthly_fee}/month</option>)}
            </select>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>Student Mobile</label>
            <input value={form.mobile} onChange={e => setForm({ ...form, mobile: e.target.value })}
              placeholder="10 digit mobile number"
              style={{ width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "14px" }} />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>Guardian Mobile</label>
            <input value={form.guardian_mobile} onChange={e => setForm({ ...form, guardian_mobile: e.target.value })}
              placeholder="Parent/Guardian mobile"
              style={{ width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "14px" }} />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>Admission Date</label>
            <input type="date" value={form.admission_date} onChange={e => setForm({ ...form, admission_date: e.target.value })}
              style={{ width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "14px" }} />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>Address</label>
            <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })}
              placeholder="Student address"
              style={{ width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "14px" }} />
          </div>

        </div>

        <button onClick={handleSubmit} disabled={loading}
          style={{
            marginTop: "24px", padding: "12px 32px",
            background: loading ? "#999" : "#1a1a2e",
            color: "white", border: "none", borderRadius: "6px",
            fontSize: "16px", fontWeight: "600"
          }}>
          {loading ? "Saving..." : "Admit Student"}
        </button>
      </div>
    </div>
  );
}
