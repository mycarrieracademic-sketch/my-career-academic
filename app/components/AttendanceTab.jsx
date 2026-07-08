"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

export default function AttendanceTab() {
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [selectedClass, setSelectedClass] = useState(null);
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState("mark"); // mark | report

  useEffect(() => { fetchClasses(); }, [filterDate]);

  async function fetchClasses() {
    setLoading(true);
    const { data } = await supabase.from("live_classes")
      .select("*, courses(name), subjects(name), staff(full_name)")
      .eq("class_date", filterDate)
      .order("start_time");
    setClasses(data || []);
    setLoading(false);
  }

  async function selectClass(cls) {
    setSelectedClass(cls);
    let studs = [];
    if (cls.subject_id) {
      const { data } = await supabase.from("student_subjects")
        .select("student_id, students(*)")
        .eq("subject_id", cls.subject_id);
      studs = (data || []).map(r => r.students).filter(s => s && s.status === "active")
        .sort((a, b) => a.full_name.localeCompare(b.full_name));
    } else {
      const { data } = await supabase.from("students")
        .select("*").eq("course_id", cls.course_id).eq("status", "active").order("full_name");
      studs = data || [];
    }
    setStudents(studs);

    // Fetch existing attendance
    const { data: att } = await supabase.from("attendance")
      .select("*").eq("live_class_id", cls.id);

    const attMap = {};
    (att || []).forEach(a => { attMap[a.student_id] = a.status; });
    // Default all to present
    (studs || []).forEach(s => { if (!attMap[s.id]) attMap[s.id] = "present"; });
    setAttendance(attMap);
  }

  async function handleSave() {
    if (!selectedClass) return;
    setSaving(true);

    // Delete existing attendance for this class
    await supabase.from("attendance").delete().eq("live_class_id", selectedClass.id);

    // Insert new
    const records = students.map(s => ({
      student_id: s.id,
      live_class_id: selectedClass.id,
      status: attendance[s.id] || "present"
    }));

    if (records.length > 0) {
      await supabase.from("attendance").insert(records);
    }

    setSaving(false);
    alert("Attendance saved!");
  }

  const presentCount = Object.values(attendance).filter(v => v === "present").length;
  const absentCount = Object.values(attendance).filter(v => v === "absent").length;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2 style={{ fontSize: "22px", fontWeight: "700" }}>Attendance</h2>
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={() => setViewMode("mark")}
            style={{ padding: "8px 16px", background: viewMode === "mark" ? "#1a1a2e" : "#f0f0f0", color: viewMode === "mark" ? "white" : "#333", border: "none", borderRadius: "6px", fontSize: "14px" }}>
            Mark Attendance
          </button>
          <button onClick={() => setViewMode("report")}
            style={{ padding: "8px 16px", background: viewMode === "report" ? "#1a1a2e" : "#f0f0f0", color: viewMode === "report" ? "white" : "#333", border: "none", borderRadius: "6px", fontSize: "14px" }}>
            Report
          </button>
        </div>
      </div>

      {viewMode === "mark" && (
        <div style={{ display: "grid", gridTemplateColumns: selectedClass ? "320px 1fr" : "1fr", gap: "20px" }}>
          {/* Class List */}
          <div>
            <div style={{ marginBottom: "12px" }}>
              <input type="date" value={filterDate} onChange={e => { setFilterDate(e.target.value); setSelectedClass(null); }}
                style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "14px" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {loading ? <div>Loading...</div> : classes.length === 0 ? (
                <div style={{ background: "white", borderRadius: "10px", padding: "20px", textAlign: "center", color: "#666", fontSize: "14px" }}>
                  No classes on this date.
                </div>
              ) : classes.map(cls => (
                <div key={cls.id} onClick={() => selectClass(cls)}
                  style={{
                    background: "white", borderRadius: "10px", padding: "16px",
                    cursor: "pointer", border: selectedClass?.id === cls.id ? "2px solid #1a1a2e" : "2px solid transparent",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
                  }}>
                  <div style={{ fontWeight: "600", fontSize: "14px", marginBottom: "4px" }}>{cls.title}</div>
                  <div style={{ fontSize: "13px", color: "#666" }}>{cls.courses?.name}</div>
                  {cls.start_time && <div style={{ fontSize: "12px", color: "#888", marginTop: "4px" }}>⏰ {cls.start_time?.slice(0,5)}</div>}
                </div>
              ))}
            </div>
          </div>

          {/* Attendance Marking */}
          {selectedClass && (
            <div>
              <div style={{ background: "white", borderRadius: "12px", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <div>
                    <div style={{ fontWeight: "700", fontSize: "16px" }}>{selectedClass.title}</div>
                    <div style={{ fontSize: "13px", color: "#666", marginTop: "2px" }}>{selectedClass.courses?.name}</div>
                  </div>
                  <div style={{ display: "flex", gap: "12px", fontSize: "14px" }}>
                    <span style={{ color: "#27ae60", fontWeight: "600" }}>✓ {presentCount} Present</span>
                    <span style={{ color: "#e74c3c", fontWeight: "600" }}>✗ {absentCount} Absent</span>
                  </div>
                </div>

                {/* Quick actions */}
                <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
                  <button onClick={() => {
                    const all = {};
                    students.forEach(s => all[s.id] = "present");
                    setAttendance(all);
                  }} style={{ padding: "6px 14px", background: "#e8f8f0", color: "#27ae60", border: "1px solid #b0f0c0", borderRadius: "6px", fontSize: "13px" }}>
                    All Present
                  </button>
                  <button onClick={() => {
                    const all = {};
                    students.forEach(s => all[s.id] = "absent");
                    setAttendance(all);
                  }} style={{ padding: "6px 14px", background: "#fff0f0", color: "#c00", border: "1px solid #ffc0c0", borderRadius: "6px", fontSize: "13px" }}>
                    All Absent
                  </button>
                </div>

                {students.length === 0 ? (
                  <div style={{ padding: "20px", textAlign: "center", color: "#666" }}>No active students in this course.</div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {students.map(s => (
                      <div key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "#f8f9fa", borderRadius: "8px" }}>
                        <div style={{ fontWeight: "500", fontSize: "14px" }}>{s.full_name}</div>
                        <div style={{ display: "flex", gap: "8px" }}>
                          {["present", "absent", "late"].map(status => (
                            <button key={status} onClick={() => setAttendance({ ...attendance, [s.id]: status })}
                              style={{
                                padding: "5px 12px", borderRadius: "6px", fontSize: "12px", fontWeight: "600",
                                border: "none", cursor: "pointer",
                                background: attendance[s.id] === status
                                  ? status === "present" ? "#27ae60" : status === "absent" ? "#e74c3c" : "#e67e22"
                                  : "#e0e0e0",
                                color: attendance[s.id] === status ? "white" : "#666"
                              }}>
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <button onClick={handleSave} disabled={saving}
                  style={{ marginTop: "16px", padding: "12px 32px", background: saving ? "#999" : "#1a1a2e", color: "white", border: "none", borderRadius: "6px", fontWeight: "600", fontSize: "15px" }}>
                  {saving ? "Saving..." : "Save Attendance"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {viewMode === "report" && (
        <AttendanceReport />
      )}
    </div>
  );
}

function AttendanceReport() {
  const [students, setStudents] = useState([]);
  const [report, setReport] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.from("students").select("*, courses(name)").eq("status", "active").order("full_name")
      .then(({ data }) => setStudents(data || []));
  }, []);

  async function fetchReport(studentId) {
    setLoading(true);
    const { data } = await supabase.from("attendance")
      .select("*, live_classes(title, class_date, start_time)")
      .eq("student_id", studentId)
      .order("marked_at", { ascending: false });
    setReport(data || []);
    setLoading(false);
  }

  const present = report.filter(r => r.status === "present").length;
  const total = report.length;
  const pct = total > 0 ? Math.round((present / total) * 100) : 0;

  return (
    <div>
      <div style={{ marginBottom: "16px" }}>
        <select value={selectedStudent} onChange={e => { setSelectedStudent(e.target.value); if (e.target.value) fetchReport(e.target.value); }}
          style={{ padding: "10px 12px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "14px", minWidth: "260px" }}>
          <option value="">-- Select Student --</option>
          {students.map(s => <option key={s.id} value={s.id}>{s.full_name} ({s.courses?.name})</option>)}
        </select>
      </div>

      {selectedStudent && !loading && (
        <div>
          <div style={{ display: "flex", gap: "16px", marginBottom: "16px" }}>
            {[
              { label: "Total Classes", value: total, color: "#3498db" },
              { label: "Present", value: present, color: "#27ae60" },
              { label: "Absent", value: total - present, color: "#e74c3c" },
              { label: "Attendance %", value: pct + "%", color: pct >= 75 ? "#27ae60" : "#e74c3c" },
            ].map(card => (
              <div key={card.label} style={{ background: "white", borderRadius: "10px", padding: "16px 20px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", minWidth: "120px" }}>
                <div style={{ fontSize: "24px", fontWeight: "700", color: card.color }}>{card.value}</div>
                <div style={{ fontSize: "13px", color: "#666", marginTop: "4px" }}>{card.label}</div>
              </div>
            ))}
          </div>

          <div style={{ background: "white", borderRadius: "12px", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8f9fa" }}>
                  {["Date", "Class", "Status"].map(h => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "#444" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {report.map(r => (
                  <tr key={r.id} style={{ borderTop: "1px solid #f0f0f0" }}>
                    <td style={{ padding: "10px 16px", fontSize: "14px" }}>{r.live_classes?.class_date}</td>
                    <td style={{ padding: "10px 16px", fontSize: "14px" }}>{r.live_classes?.title}</td>
                    <td style={{ padding: "10px 16px" }}>
                      <span style={{
                        padding: "3px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "600",
                        background: r.status === "present" ? "#e8f8f0" : r.status === "absent" ? "#ffeaea" : "#fff3e0",
                        color: r.status === "present" ? "#27ae60" : r.status === "absent" ? "#e74c3c" : "#e67e22"
                      }}>{r.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
