"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

export default function TimetableTab() {
  const [timetable, setTimetable] = useState([]);
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filterCourse, setFilterCourse] = useState("");
  const [form, setForm] = useState({
    course_id: "", subject_id: "", teacher_id: "",
    day_of_week: "Monday", start_time: "", end_time: ""
  });

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    const [t, c, sub, st] = await Promise.all([
      supabase.from("timetable").select("*, courses(name), subjects(name), staff(full_name)").order("day_of_week"),
      supabase.from("courses").select("*").order("name"),
      supabase.from("subjects").select("*").order("name"),
      supabase.from("staff").select("*").eq("role", "teacher").eq("status", "active")
    ]);
    setTimetable(t.data || []);
    setCourses(c.data || []);
    setSubjects(sub.data || []);
    setStaff(st.data || []);
    setLoading(false);
  }

  async function handleSave() {
    if (!form.course_id) return alert("Select a course!");
    if (!form.day_of_week) return alert("Select a day!");
    if (!form.start_time || !form.end_time) return alert("Enter start and end time!");
    await supabase.from("timetable").insert({
      course_id: form.course_id,
      subject_id: form.subject_id || null,
      teacher_id: form.teacher_id || null,
      day_of_week: form.day_of_week,
      start_time: form.start_time,
      end_time: form.end_time
    });
    setShowForm(false);
    setForm({ course_id: "", subject_id: "", teacher_id: "", day_of_week: "Monday", start_time: "", end_time: "" });
    fetchAll();
  }

  async function handleDelete(id) {
    if (!confirm("Delete this slot?")) return;
    await supabase.from("timetable").delete().eq("id", id);
    fetchAll();
  }

  const filteredSubjects = form.course_id ? subjects.filter(s => s.course_id === form.course_id) : subjects;
  const filtered = filterCourse ? timetable.filter(t => t.course_id === filterCourse) : timetable;

  // Group by day
  const grouped = DAYS.reduce((acc, day) => {
    acc[day] = filtered.filter(t => t.day_of_week === day);
    return acc;
  }, {});

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2 style={{ fontSize: "22px", fontWeight: "700" }}>Timetable</h2>
        <button onClick={() => setShowForm(true)}
          style={{ padding: "10px 20px", background: "#1a1a2e", color: "white", border: "none", borderRadius: "6px", fontWeight: "600" }}>
          + Add Slot
        </button>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <select value={filterCourse} onChange={e => setFilterCourse(e.target.value)}
          style={{ padding: "10px 12px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "14px" }}>
          <option value="">All Courses</option>
          {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {showForm && (
        <div style={{ background: "white", borderRadius: "12px", padding: "24px", marginBottom: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
          <h3 style={{ marginBottom: "16px", fontWeight: "600" }}>New Timetable Slot</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>Course *</label>
              <select value={form.course_id} onChange={e => setForm({ ...form, course_id: e.target.value, subject_id: "" })}
                style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "6px" }}>
                <option value="">-- Select Course --</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>Subject</label>
              <select value={form.subject_id} onChange={e => setForm({ ...form, subject_id: e.target.value })}
                style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "6px" }}>
                <option value="">-- Select Subject --</option>
                {filteredSubjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>Teacher</label>
              <select value={form.teacher_id} onChange={e => setForm({ ...form, teacher_id: e.target.value })}
                style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "6px" }}>
                <option value="">-- Select Teacher --</option>
                {staff.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>Day *</label>
              <select value={form.day_of_week} onChange={e => setForm({ ...form, day_of_week: e.target.value })}
                style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "6px" }}>
                {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>Start Time *</label>
              <input type="time" value={form.start_time} onChange={e => setForm({ ...form, start_time: e.target.value })}
                style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "6px" }} />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>End Time *</label>
              <input type="time" value={form.end_time} onChange={e => setForm({ ...form, end_time: e.target.value })}
                style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "6px" }} />
            </div>
          </div>
          <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
            <button onClick={handleSave}
              style={{ padding: "10px 24px", background: "#1a1a2e", color: "white", border: "none", borderRadius: "6px", fontWeight: "600" }}>
              Save
            </button>
            <button onClick={() => setShowForm(false)}
              style={{ padding: "10px 24px", background: "#f0f0f0", border: "none", borderRadius: "6px" }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? <div>Loading...</div> : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {DAYS.map(day => grouped[day].length > 0 && (
            <div key={day} style={{ background: "white", borderRadius: "12px", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
              <div style={{ background: "#1a1a2e", color: "white", padding: "10px 16px", fontWeight: "600", fontSize: "14px" }}>
                {day}
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f8f9fa" }}>
                    {["Time", "Course", "Subject", "Teacher", ""].map(h => (
                      <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "#444" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {grouped[day].map(slot => (
                    <tr key={slot.id} style={{ borderTop: "1px solid #f0f0f0" }}>
                      <td style={{ padding: "10px 16px", fontSize: "14px", fontWeight: "500" }}>
                        {slot.start_time?.slice(0,5)} - {slot.end_time?.slice(0,5)}
                      </td>
                      <td style={{ padding: "10px 16px", fontSize: "14px" }}>{slot.courses?.name || "-"}</td>
                      <td style={{ padding: "10px 16px", fontSize: "14px" }}>{slot.subjects?.name || "-"}</td>
                      <td style={{ padding: "10px 16px", fontSize: "14px" }}>{slot.staff?.full_name || "-"}</td>
                      <td style={{ padding: "10px 16px" }}>
                        <button onClick={() => handleDelete(slot.id)}
                          style={{ padding: "5px 12px", background: "#fff0f0", color: "#c00", border: "1px solid #ffc0c0", borderRadius: "6px", fontSize: "12px" }}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{ background: "white", borderRadius: "12px", padding: "32px", textAlign: "center", color: "#666" }}>
              No timetable slots yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
