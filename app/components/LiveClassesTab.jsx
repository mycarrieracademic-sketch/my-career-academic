"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

export default function LiveClassesTab({ role, staffId }) {
  const [classes, setClasses] = useState([]);
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split("T")[0]);
  const [form, setForm] = useState({
    course_id: "", subject_id: "", teacher_id: "",
    title: "", class_date: new Date().toISOString().split("T")[0],
    start_time: "", end_time: "", status: "scheduled"
  });

  const [completingClassId, setCompletingClassId] = useState(null);
  const [subjectStudents, setSubjectStudents] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [savingAttendance, setSavingAttendance] = useState(false);

  useEffect(() => { fetchStatic(); }, []);
  useEffect(() => { fetchClasses(); }, [filterDate]);

  async function fetchStatic() {
    const [co, sub, st] = await Promise.all([
      supabase.from("courses").select("*").order("name"),
      supabase.from("subjects").select("*").order("name"),
      supabase.from("staff").select("*").eq("role", "teacher").eq("status", "active")
    ]);
    setCourses(co.data || []);
    setSubjects(sub.data || []);
    setStaff(st.data || []);
  }

  async function autoGenerateFromTimetable(dateStr) {
    if (!dateStr) return;
    const dateObj = new Date(dateStr + "T00:00:00");
    const dayName = dateObj.toLocaleDateString("en-US", { weekday: "long" });

    const { data: slots } = await supabase.from("timetable")
      .select("*, subjects(name), courses(name)")
      .eq("day_of_week", dayName);
    if (!slots || slots.length === 0) return;

    const { data: existing } = await supabase.from("live_classes")
      .select("course_id, subject_id, teacher_id")
      .eq("class_date", dateStr);
    const existingSet = new Set((existing || []).map(e => `${e.course_id}_${e.subject_id}_${e.teacher_id}`));

    const toInsert = slots
      .filter(s => !existingSet.has(`${s.course_id}_${s.subject_id}_${s.teacher_id}`))
      .map(s => ({
        course_id: s.course_id,
        subject_id: s.subject_id,
        teacher_id: s.teacher_id,
        title: `${s.subjects?.name || "Class"} - ${s.courses?.name || ""}`,
        class_date: dateStr,
        start_time: s.start_time,
        end_time: s.end_time,
        status: "scheduled"
      }));

    if (toInsert.length > 0) {
      await supabase.from("live_classes").insert(toInsert);
    }
  }

  async function fetchClasses() {
    setLoading(true);
    if (filterDate) {
      await autoGenerateFromTimetable(filterDate);
    }
    let query = supabase.from("live_classes").select("*, courses(name), subjects(name), staff(full_name)")
      .order("class_date", { ascending: false }).order("start_time");
    if (filterDate) query = query.eq("class_date", filterDate);
    const { data } = await query;
    let result = data || [];
    if (role === "teacher" && staffId) {
      result = result.filter(c => c.teacher_id === staffId);
    }
    setClasses(result);
    setLoading(false);
  }

  async function handleSave() {
    if (!form.title.trim()) return alert("Title required!");
    if (!form.course_id) return alert("Select a course!");
    await supabase.from("live_classes").insert({
      course_id: form.course_id,
      subject_id: form.subject_id || null,
      teacher_id: form.teacher_id || null,
      title: form.title.trim(),
      class_date: form.class_date,
      start_time: form.start_time || null,
      end_time: form.end_time || null,
      status: form.status
    });
    setShowForm(false);
    setForm({
      course_id: "", subject_id: "", teacher_id: "",
      title: "", class_date: new Date().toISOString().split("T")[0],
      start_time: "", end_time: "", status: "scheduled"
    });
    fetchClasses();
  }

  async function handleStatusChange(id, status) {
    await supabase.from("live_classes").update({ status }).eq("id", id);
    fetchClasses();
  }

  async function handleDelete(id) {
    if (!confirm("Delete this class?")) return;
    await supabase.from("live_classes").delete().eq("id", id);
    fetchClasses();
  }

  async function openCompletePanel(cls) {
    setCompletingClassId(cls.id);
    let studs = [];
    if (cls.subject_id) {
      const { data } = await supabase.from("student_subjects")
        .select("student_id, students(id, full_name, status)")
        .eq("subject_id", cls.subject_id);
      studs = (data || []).map(r => r.students).filter(s => s && s.status === "active");
    } else {
      const { data } = await supabase.from("students").select("*").eq("course_id", cls.course_id).eq("status", "active");
      studs = data || [];
    }
    setSubjectStudents(studs);
    const map = {};
    studs.forEach(s => { map[s.id] = "present"; });
    setAttendanceMap(map);
  }

  function closeCompletePanel() {
    setCompletingClassId(null);
    setSubjectStudents([]);
    setAttendanceMap({});
  }

  async function saveCompleteClass(cls) {
    setSavingAttendance(true);

    await supabase.from("attendance").delete().eq("live_class_id", cls.id);
    const records = subjectStudents.map(s => ({
      student_id: s.id,
      live_class_id: cls.id,
      status: attendanceMap[s.id] || "present"
    }));
    if (records.length > 0) {
      await supabase.from("attendance").insert(records);
    }

    if (cls.teacher_id) {
      const { data: existingPay } = await supabase.from("teacher_class_payments")
        .select("id").eq("live_class_id", cls.id).maybeSingle();
      if (!existingPay) {
        const teacher = staff.find(s => s.id === cls.teacher_id);
        const rate = teacher?.rate_per_class || 0;
        await supabase.from("teacher_class_payments").insert({
          teacher_id: cls.teacher_id,
          live_class_id: cls.id,
          subject_id: cls.subject_id || null,
          amount: rate,
          payment_date: new Date().toISOString().split("T")[0],
          status: "pending"
        });
      }
    }

    await supabase.from("live_classes").update({ status: "completed" }).eq("id", cls.id);
    setSavingAttendance(false);
    closeCompletePanel();
    fetchClasses();
  }

  const filteredSubjects = form.course_id ? subjects.filter(s => s.course_id === form.course_id) : subjects;

  const statusColor = {
    scheduled: "#3498db", ongoing: "#27ae60",
    completed: "#888", cancelled: "#e74c3c"
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2 style={{ fontSize: "22px", fontWeight: "700" }}>Live Classes</h2>
        {role !== "teacher" && (
          <button onClick={() => setShowForm(true)}
            style={{ padding: "10px 20px", background: "#1a1a2e", color: "white", border: "none", borderRadius: "6px", fontWeight: "600" }}>
            + Add Class
          </button>
        )}
      </div>

      <div style={{ marginBottom: "20px", display: "flex", gap: "12px", alignItems: "center" }}>
        <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)}
          style={{ padding: "10px 12px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "14px" }} />
        <button onClick={() => setFilterDate("")}
          style={{ padding: "10px 16px", background: "#f0f0f0", border: "none", borderRadius: "6px", fontSize: "14px" }}>
          All Dates
        </button>
      </div>

      {showForm && role !== "teacher" && (
        <div style={{ background: "white", borderRadius: "12px", padding: "24px", marginBottom: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
          <h3 style={{ marginBottom: "16px", fontWeight: "600" }}>New Live Class</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>Title *</label>
              <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="Class title"
                style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "6px" }} />
            </div>
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
              <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>Date</label>
              <input type="date" value={form.class_date} onChange={e => setForm({ ...form, class_date: e.target.value })}
                style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "6px" }} />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>Start Time</label>
              <input type="time" value={form.start_time} onChange={e => setForm({ ...form, start_time: e.target.value })}
                style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "6px" }} />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>End Time</label>
              <input type="time" value={form.end_time} onChange={e => setForm({ ...form, end_time: e.target.value })}
                style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "6px" }} />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>Status</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "6px" }}>
                <option value="scheduled">Scheduled</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
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
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {classes.length === 0 && (
            <div style={{ background: "white", borderRadius: "12px", padding: "32px", textAlign: "center", color: "#666" }}>
              No classes found.
            </div>
          )}
          {classes.map(cls => (
            <div key={cls.id} style={{ background: "white", borderRadius: "12px", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontWeight: "700", fontSize: "16px", marginBottom: "6px" }}>{cls.title}</div>
                  <div style={{ fontSize: "14px", color: "#555", display: "flex", gap: "16px", flexWrap: "wrap" }}>
                    <span>📚 {cls.courses?.name}</span>
                    {cls.subjects?.name && <span>📖 {cls.subjects.name}</span>}
                    {cls.staff?.full_name && <span>👤 {cls.staff.full_name}</span>}
                    <span>📅 {cls.class_date}</span>
                    {cls.start_time && <span>⏰ {cls.start_time?.slice(0,5)} - {cls.end_time?.slice(0,5)}</span>}
                  </div>
                </div>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <span style={{
                    padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "600",
                    background: (statusColor[cls.status] || "#888") + "20",
                    color: statusColor[cls.status] || "#888"
                  }}>{cls.status}</span>
                </div>
              </div>

              {completingClassId !== cls.id && (
                <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                  {cls.status === "scheduled" && (
                    <button onClick={() => handleStatusChange(cls.id, "ongoing")}
                      style={{ padding: "6px 14px", background: "#e8f8f0", color: "#27ae60", border: "1px solid #b0f0c0", borderRadius: "6px", fontSize: "13px" }}>
                      Start Class
                    </button>
                  )}
                  {cls.status === "ongoing" && (
                    <button onClick={() => openCompletePanel(cls)}
                      style={{ padding: "6px 14px", background: "#f0f4ff", color: "#3498db", border: "1px solid #c0d0ff", borderRadius: "6px", fontSize: "13px" }}>
                      Complete Class
                    </button>
                  )}
                  {cls.status !== "cancelled" && cls.status !== "completed" && role !== "teacher" && (
                    <button onClick={() => handleStatusChange(cls.id, "cancelled")}
                      style={{ padding: "6px 14px", background: "#fff0f0", color: "#c00", border: "1px solid #ffc0c0", borderRadius: "6px", fontSize: "13px" }}>
                      Cancel
                    </button>
                  )}
                  {role !== "teacher" && (
                    <button onClick={() => handleDelete(cls.id)}
                      style={{ padding: "6px 14px", background: "#f5f5f5", color: "#666", border: "1px solid #ddd", borderRadius: "6px", fontSize: "13px" }}>
                      Delete
                    </button>
                  )}
                </div>
              )}

              {completingClassId === cls.id && (
                <div style={{ marginTop: "16px", borderTop: "1px solid #eee", paddingTop: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <div style={{ fontWeight: "600", fontSize: "14px" }}>Mark Attendance & Complete Class</div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button onClick={() => {
                        const all = {};
                        subjectStudents.forEach(s => all[s.id] = "present");
                        setAttendanceMap(all);
                      }} style={{ padding: "5px 12px", background: "#e8f8f0", color: "#27ae60", border: "1px solid #b0f0c0", borderRadius: "6px", fontSize: "12px" }}>
                        All Present
                      </button>
                      <button onClick={() => {
                        const all = {};
                        subjectStudents.forEach(s => all[s.id] = "absent");
                        setAttendanceMap(all);
                      }} style={{ padding: "5px 12px", background: "#fff0f0", color: "#c00", border: "1px solid #ffc0c0", borderRadius: "6px", fontSize: "12px" }}>
                        All Absent
                      </button>
                    </div>
                  </div>

                  {subjectStudents.length === 0 ? (
                    <div style={{ padding: "16px", textAlign: "center", color: "#888", fontSize: "13px" }}>
                      No students enrolled in this Subject.
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "16px" }}>
                      {subjectStudents.map(s => (
                        <div key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "#f8f9fa", borderRadius: "8px" }}>
                          <div style={{ fontWeight: "500", fontSize: "14px" }}>{s.full_name}</div>
                          <div style={{ display: "flex", gap: "8px" }}>
                            {["present", "absent", "excused"].map(status => (
                              <button key={status} onClick={() => setAttendanceMap({ ...attendanceMap, [s.id]: status })}
                                style={{
                                  padding: "5px 12px", borderRadius: "6px", fontSize: "12px", fontWeight: "600",
                                  border: "none", cursor: "pointer",
                                  background: attendanceMap[s.id] === status
                                    ? status === "present" ? "#27ae60" : status === "absent" ? "#e74c3c" : "#e67e22"
                                    : "#e0e0e0",
                                  color: attendanceMap[s.id] === status ? "white" : "#666"
                                }}>
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div style={{ display: "flex", gap: "10px" }}>
                    <button onClick={() => saveCompleteClass(cls)} disabled={savingAttendance}
                      style={{ padding: "10px 22px", background: savingAttendance ? "#999" : "#1a1a2e", color: "white", border: "none", borderRadius: "6px", fontWeight: "600", fontSize: "14px" }}>
                      {savingAttendance ? "Saving..." : "Save & Complete Class"}
                    </button>
                    <button onClick={closeCompletePanel}
                      style={{ padding: "10px 22px", background: "#f0f0f0", border: "none", borderRadius: "6px", fontSize: "14px" }}>
                      Cancel
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
