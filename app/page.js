"use client";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";

const TABS = {
  admin: ["Dashboard", "Students", "Admission", "Live Classes", "Attendance", "Fees", "Tests", "Staff"],
  teacher: ["Dashboard", "Live Classes", "Attendance", "Tests"],
  student: ["Dashboard", "Live Classes", "Fees", "Progress"],
  guardian: ["Dashboard", "Live Classes"],
};

// ========== LOGIN ==========
function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState("admin@mycareeracademic.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true); setError("");
    try {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) throw err;
      onLogin();
    } catch (e) { setError(e.message || "Login failed"); }
    setLoading(false);
  };

  return (
    <div className="login-bg">
      <div className="login-card">
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 56, height: 56, background: "var(--primary)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 24, color: "#fff", fontWeight: 700 }}>M</div>
          <h1 style={{ fontSize: 22, fontWeight: 700 }}>My Career Academic</h1>
          <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 6 }}>Coaching Management System</p>
        </div>
        {error && <div className="error-box">{error}</div>}
        <div className="form-group">
          <label className="label">Email</label>
          <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="label">Password</label>
          <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} />
        </div>
        <button className="btn" style={{ width: "100%", padding: 12, marginTop: 8 }} onClick={handleLogin} disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </div>
    </div>
  );
}

// ========== STAT CARD ==========
function StatCard({ title, value, variant, subtitle }) {
  const cls = variant === "danger" ? "badge-danger" : variant === "success" ? "badge-success" : variant === "warning" ? "badge-warning" : "badge-primary";
  const borderColor = variant === "danger" ? "var(--danger)" : variant === "success" ? "var(--success)" : variant === "warning" ? "var(--warning)" : "var(--primary)";
  const bg = variant === "danger" ? "var(--danger-light)" : variant === "success" ? "var(--success-light)" : variant === "warning" ? "var(--warning-light)" : "var(--primary-light)";
  return (
    <div className="card" style={{ borderLeft: `4px solid ${borderColor}`, background: bg }}>
      <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>{title}</div>
      <div style={{ fontSize: 28, fontWeight: 700, marginTop: 6, color: borderColor }}>{value}</div>
      {subtitle && <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>{subtitle}</div>}
    </div>
  );
}

// ========== DASHBOARD ==========
function DashboardTab({ profile }) {
  const [stats, setStats] = useState({ students: 0, courses: 0, staff: 0, live: 0 });
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    (async () => {
      const today = new Date().toISOString().split("T")[0];
      const [a, b, c, d] = await Promise.all([
        supabase.from("students").select("id", { count: "exact" }).eq("status", "active"),
        supabase.from("courses").select("id", { count: "exact" }).eq("is_active", true),
        supabase.from("staff").select("id", { count: "exact" }),
        supabase.from("live_classes").select("id", { count: "exact" }).eq("class_date", today).eq("status", "live"),
      ]);
      setStats({ students: a.count || 0, courses: b.count || 0, staff: c.count || 0, live: d.count || 0 });
      const { data } = await supabase.from("students").select("*, profiles!inner(full_name, phone)").eq("status", "active").order("created_at", { ascending: false }).limit(5);
      setRecent(data || []);
    })();
  }, []);

  return (
    <div>
      <h1 className="page-title">Dashboard</h1>
      <p className="page-sub">Welcome back, {profile?.full_name || "Admin"}</p>
      <div className="grid-4">
        <StatCard title="Total students" value={stats.students} variant="primary" />
        <StatCard title="Live classes now" value={stats.live} variant="danger" />
        <StatCard title="Courses" value={stats.courses} variant="success" />
        <StatCard title="Staff members" value={stats.staff} variant="warning" />
      </div>
      <div className="card" style={{ marginTop: 24 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Recent students</h3>
        {recent.length === 0 ? <p className="empty-state">No students yet. Add from Admission tab.</p> : (
          <table><thead><tr><th>Name</th><th>Admission no.</th><th>Phone</th><th>Status</th></tr></thead>
          <tbody>{recent.map(st => (
            <tr key={st.id}><td style={{ fontWeight: 600 }}>{st.profiles?.full_name}</td><td>{st.admission_number}</td><td>{st.profiles?.phone || "-"}</td><td><span className="badge badge-success">{st.status}</span></td></tr>
          ))}</tbody></table>
        )}
      </div>
    </div>
  );
}

// ========== STUDENTS ==========
function StudentsTab() {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    let q = supabase.from("students").select("*, profiles!inner(full_name, phone, email), courses(name)").eq("status", "active").order("created_at", { ascending: false });
    if (filter !== "all") q = q.eq("course_id", filter);
    const { data } = await q;
    setStudents(data || []); setLoading(false);
  }, [filter]);

  useEffect(() => { load(); supabase.from("courses").select("*").eq("is_active", true).then(({ data }) => setCourses(data || [])); }, [load]);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div><h1 className="page-title">Students</h1><p style={{ fontSize: 13, color: "var(--muted)" }}>{students.length} active students</p></div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className={`tag ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>All</button>
          {courses.map(c => <button key={c.id} className={`tag ${filter === c.id ? "active" : ""}`} onClick={() => setFilter(c.id)}>{c.name}</button>)}
        </div>
      </div>
      <div className="card">
        {loading ? <p style={{ color: "var(--muted)" }}>Loading...</p> :
        students.length === 0 ? <p className="empty-state">No students found. Add from Admission tab.</p> : (
          <table><thead><tr><th>Name</th><th>Adm. no.</th><th>Course</th><th>Phone</th><th>Date</th></tr></thead>
          <tbody>{students.map(st => (
            <tr key={st.id}><td style={{ fontWeight: 600 }}>{st.profiles?.full_name}</td><td><span className="badge badge-primary">{st.admission_number}</span></td><td>{st.courses?.name}</td><td>{st.profiles?.phone || "-"}</td><td>{new Date(st.admission_date).toLocaleDateString("en-IN")}</td></tr>
          ))}</tbody></table>
        )}
      </div>
    </div>
  );
}

// ========== ADMISSION ==========
function AdmissionTab() {
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({ fullName: "", phone: "", email: "", courseId: "", gender: "", address: "", dob: "" });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  useEffect(() => { supabase.from("courses").select("*").eq("is_active", true).then(({ data }) => { setCourses(data || []); if (data?.length) setForm(f => ({ ...f, courseId: data[0].id })); }); }, []);

  const submit = async () => {
    if (!form.fullName || !form.email || !form.courseId) { setMsg({ type: "error", text: "Name, email and course required" }); return; }
    setLoading(true); setMsg({ type: "", text: "" });
    try {
      const tempPass = "Welcome@" + Date.now().toString().slice(-6);
      const { data: authData, error: authErr } = await supabase.auth.signUp({ email: form.email, password: tempPass, options: { data: { full_name: form.fullName, role: "student" } } });
      if (authErr) throw authErr;
      const userId = authData.user?.id;
      if (!userId) throw new Error("User creation failed");
      await new Promise(r => setTimeout(r, 1000));
      await supabase.from("profiles").update({ phone: form.phone, full_name: form.fullName }).eq("id", userId);
      const { data: admData } = await supabase.rpc("generate_admission_number");
      const admNo = admData || "MCA-" + new Date().getFullYear() + "-" + String(Date.now()).slice(-4);
      const { error: stErr } = await supabase.from("students").insert({ profile_id: userId, course_id: form.courseId, admission_number: admNo, gender: form.gender || null, address: form.address || null, date_of_birth: form.dob || null });
      if (stErr) throw stErr;
      const course = courses.find(c => c.id === form.courseId);
      if (course) {
        const { data: stData } = await supabase.from("students").select("id").eq("profile_id", userId).single();
        if (stData) await supabase.from("fee_structures").insert({ student_id: stData.id, total_amount: course.total_fee });
      }
      setMsg({ type: "success", text: `Student admitted! Admission No: ${admNo} | Temp Password: ${tempPass}` });
      setForm({ fullName: "", phone: "", email: "", courseId: courses[0]?.id || "", gender: "", address: "", dob: "" });
    } catch (e) { setMsg({ type: "error", text: e.message }); }
    setLoading(false);
  };

  return (
    <div>
      <h1 className="page-title">New Admission</h1>
      <p className="page-sub">Add a new student to the institute</p>
      <div className="card" style={{ maxWidth: 600 }}>
        {msg.text && <div className={msg.type === "success" ? "success-box" : "error-box"}>{msg.text}</div>}
        <div className="grid-2">
          <div className="form-group"><label className="label">Full name *</label><input className="input" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} placeholder="Student name" /></div>
          <div className="form-group"><label className="label">Phone</label><input className="input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="Mobile number" /></div>
        </div>
        <div className="grid-2">
          <div className="form-group"><label className="label">Email *</label><input className="input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="student@email.com" /></div>
          <div className="form-group"><label className="label">Course *</label><select className="select" value={form.courseId} onChange={e => setForm({ ...form, courseId: e.target.value })}>{courses.map(c => <option key={c.id} value={c.id}>{c.name} - Rs.{c.total_fee}</option>)}</select></div>
        </div>
        <div className="grid-3">
          <div className="form-group"><label className="label">Gender</label><select className="select" value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}><option value="">Select</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></select></div>
          <div className="form-group"><label className="label">Date of birth</label><input className="input" type="date" value={form.dob} onChange={e => setForm({ ...form, dob: e.target.value })} /></div>
          <div className="form-group"><label className="label">Address</label><input className="input" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="City, State" /></div>
        </div>
        <button className="btn" style={{ marginTop: 8 }} onClick={submit} disabled={loading}>{loading ? "Admitting..." : "Admit Student"}</button>
      </div>
    </div>
  );
}

// ========== LIVE CLASSES ==========
function LiveClassesTab({ profile }) {
  const [classes, setClasses] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selCourse, setSelCourse] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ subjectId: "", teacherId: "", startTime: "", endTime: "", topic: "" });
  const [subjects, setSubjects] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const isStaff = ["admin", "staff", "teacher"].includes(profile?.role);
  const today = new Date().toISOString().split("T")[0];

  const load = useCallback(async () => {
    let q = supabase.from("live_classes").select("*, subjects(name), staff!inner(id, profiles!inner(full_name))").eq("class_date", today);
    if (selCourse) q = q.eq("course_id", selCourse);
    const { data } = await q.order("start_time");
    setClasses(data || []);
  }, [selCourse, today]);

  useEffect(() => { supabase.from("courses").select("*").eq("is_active", true).then(({ data }) => { setCourses(data || []); if (data?.length) setSelCourse(data[0].id); }); }, []);
  useEffect(() => { if (selCourse) load(); }, [selCourse, load]);
  useEffect(() => {
    if (selCourse) {
      supabase.from("subjects").select("*").eq("course_id", selCourse).then(({ data }) => setSubjects(data || []));
      supabase.from("staff").select("*, profiles!inner(full_name)").then(({ data }) => setStaffList(data || []));
    }
  }, [selCourse]);

  const updateStatus = async (id, status) => { await supabase.from("live_classes").update({ status }).eq("id", id); load(); };

  const addClass = async () => {
    if (!form.subjectId || !form.teacherId || !form.startTime || !form.endTime) return;
    await supabase.from("live_classes").insert({ course_id: selCourse, subject_id: form.subjectId, teacher_id: form.teacherId, class_date: today, start_time: form.startTime, end_time: form.endTime, topic: form.topic || null, status: "scheduled" });
    setShowForm(false); setForm({ subjectId: "", teacherId: "", startTime: "", endTime: "", topic: "" }); load();
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div><h1 className="page-title">Today&apos;s classes</h1><p style={{ fontSize: 13, color: "var(--muted)" }}>{today}</p></div>
        <div style={{ display: "flex", gap: 8 }}>
          {courses.map(c => <button key={c.id} className={`tag ${selCourse === c.id ? "active" : ""}`} onClick={() => setSelCourse(c.id)}>{c.name}</button>)}
          {isStaff && <button className="btn btn-accent" onClick={() => setShowForm(!showForm)}>+ Add class</button>}
        </div>
      </div>
      {showForm && (
        <div className="card" style={{ marginBottom: 20, borderColor: "var(--accent)" }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Add today&apos;s class</h3>
          <div className="grid-3">
            <div><label className="label">Subject</label><select className="select" value={form.subjectId} onChange={e => setForm({ ...form, subjectId: e.target.value })}><option value="">Select</option>{subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
            <div><label className="label">Teacher</label><select className="select" value={form.teacherId} onChange={e => setForm({ ...form, teacherId: e.target.value })}><option value="">Select</option>{staffList.map(s => <option key={s.id} value={s.id}>{s.profiles?.full_name}</option>)}</select></div>
            <div><label className="label">Topic</label><input className="input" value={form.topic} onChange={e => setForm({ ...form, topic: e.target.value })} placeholder="Today's topic" /></div>
          </div>
          <div className="grid-3" style={{ marginTop: 12 }}>
            <div><label className="label">Start time</label><input className="input" type="time" value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} /></div>
            <div><label className="label">End time</label><input className="input" type="time" value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })} /></div>
            <div style={{ display: "flex", alignItems: "flex-end" }}><button className="btn btn-success" onClick={addClass}>Save class</button></div>
          </div>
        </div>
      )}
      {classes.length === 0 ? <div className="card empty-state">No classes scheduled for today.{isStaff ? ' Click "+ Add class" to create one.' : ""}</div> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {classes.map(cl => (
            <div key={cl.id} className={`card class-card ${cl.status === "live" ? "live" : ""}`}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                  <span style={{ fontWeight: 700, fontSize: 15 }}>{cl.subjects?.name}</span>
                  <span className={`badge ${cl.status === "live" ? "badge-danger" : cl.status === "completed" ? "badge-success" : "badge-primary"}`}>{cl.status === "live" ? "LIVE NOW" : cl.status}</span>
                </div>
                <div style={{ fontSize: 13, color: "var(--muted)" }}>{cl.start_time?.slice(0, 5)} - {cl.end_time?.slice(0, 5)} | Teacher: {cl.staff?.profiles?.full_name} {cl.topic ? `| ${cl.topic}` : ""}</div>
              </div>
              {isStaff && (
                <div style={{ display: "flex", gap: 8 }}>
                  {cl.status === "scheduled" && <button className="btn btn-danger" onClick={() => updateStatus(cl.id, "live")}>Go Live</button>}
                  {cl.status === "live" && <button className="btn btn-success" onClick={() => updateStatus(cl.id, "completed")}>Complete</button>}
                  {cl.status === "scheduled" && <button className="btn-outline" onClick={() => updateStatus(cl.id, "cancelled")}>Cancel</button>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ========== ATTENDANCE ==========
function AttendanceTab() {
  const [classes, setClasses] = useState([]);
  const [selClass, setSelClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [att, setAtt] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => { supabase.from("live_classes").select("*, subjects(name)").eq("class_date", today).in("status", ["live", "completed"]).then(({ data }) => setClasses(data || [])); }, [today]);

  useEffect(() => {
    if (!selClass) return;
    (async () => {
      const { data: stData } = await supabase.from("students").select("*, profiles!inner(full_name)").eq("course_id", selClass.course_id).eq("status", "active");
      setStudents(stData || []);
      const { data: attData } = await supabase.from("attendance").select("*").eq("live_class_id", selClass.id);
      const map = {}; (attData || []).forEach(a => { map[a.student_id] = a.status; });
      const def = {}; (stData || []).forEach(st => { def[st.id] = map[st.id] || "present"; });
      setAtt(def); setSaved(false);
    })();
  }, [selClass]);

  const save = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    const records = Object.entries(att).map(([sid, status]) => ({ student_id: sid, live_class_id: selClass.id, status, marked_by: user?.id }));
    await supabase.from("attendance").upsert(records, { onConflict: "student_id,live_class_id" });
    setSaving(false); setSaved(true);
  };

  return (
    <div>
      <h1 className="page-title">Mark attendance</h1>
      <p className="page-sub">Select a class to mark attendance</p>
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        {classes.length === 0 && <p style={{ color: "var(--muted)", fontSize: 13 }}>No live/completed classes today.</p>}
        {classes.map(cl => <button key={cl.id} className={`tag ${selClass?.id === cl.id ? "active" : ""}`} onClick={() => setSelClass(cl)}>{cl.subjects?.name} ({cl.start_time?.slice(0, 5)})</button>)}
      </div>
      {selClass && (
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700 }}>{selClass.subjects?.name} - {selClass.start_time?.slice(0, 5)}</h3>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {saved && <span style={{ color: "var(--success)", fontSize: 13, fontWeight: 600 }}>Saved!</span>}
              <button className="btn btn-success" onClick={save} disabled={saving}>{saving ? "Saving..." : "Save attendance"}</button>
            </div>
          </div>
          {students.length === 0 ? <p style={{ color: "var(--muted)" }}>No students enrolled.</p> : (
            <table><thead><tr><th>Student</th><th>Status</th></tr></thead>
            <tbody>{students.map(st => (
              <tr key={st.id}><td style={{ fontWeight: 600 }}>{st.profiles?.full_name}</td>
              <td><div style={{ display: "flex", gap: 6 }}>
                {["present", "absent", "late", "excused"].map(status => (
                  <button key={status} className={`att-btn ${att[st.id] === status ? status : ""}`} onClick={() => setAtt({ ...att, [st.id]: status })}>{status}</button>
                ))}
              </div></td></tr>
            ))}</tbody></table>
          )}
        </div>
      )}
    </div>
  );
}

// ========== FEES ==========
function FeesTab({ profile }) {
  const [students, setStudents] = useState([]);
  const [selSt, setSelSt] = useState(null);
  const [fee, setFee] = useState(null);
  const [payments, setPayments] = useState([]);
  const [showPay, setShowPay] = useState(false);
  const [payForm, setPayForm] = useState({ amount: "", mode: "cash", notes: "" });
  const [saving, setSaving] = useState(false);
  const isAdmin = profile?.role === "admin";

  useEffect(() => { supabase.from("students").select("*, profiles!inner(full_name)").eq("status", "active").order("created_at", { ascending: false }).then(({ data }) => setStudents(data || [])); }, []);

  const loadFee = async (student) => {
    setSelSt(student); setShowPay(false);
    const { data: fData } = await supabase.rpc("get_fee_summary", { p_student_id: student.id });
    setFee(fData?.[0] || null);
    const { data: pData } = await supabase.from("fee_payments").select("*").eq("student_id", student.id).order("payment_date", { ascending: false });
    setPayments(pData || []);
  };

  const pay = async () => {
    if (!payForm.amount || Number(payForm.amount) <= 0) return;
    setSaving(true);
    const { data: fs } = await supabase.from("fee_structures").select("id").eq("student_id", selSt.id).single();
    if (fs) await supabase.from("fee_payments").insert({ fee_structure_id: fs.id, student_id: selSt.id, amount: Number(payForm.amount), payment_mode: payForm.mode, receipt_number: "RCP-" + Date.now(), installment_number: payments.length + 1, notes: payForm.notes || null });
    setPayForm({ amount: "", mode: "cash", notes: "" }); setShowPay(false); setSaving(false); loadFee(selSt);
  };

  return (
    <div>
      <h1 className="page-title">Fee management</h1>
      <p className="page-sub">Track and manage student fees</p>
      <div style={{ display: "flex", gap: 20 }}>
        <div style={{ width: 260, flexShrink: 0 }}>
          <div className="card" style={{ maxHeight: 500, overflowY: "auto" }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: "var(--muted)" }}>Select student</h3>
            {students.map(st => <div key={st.id} className={`student-item ${selSt?.id === st.id ? "active" : ""}`} onClick={() => loadFee(st)}>{st.profiles?.full_name}</div>)}
            {students.length === 0 && <p style={{ color: "var(--muted)", fontSize: 13 }}>No students.</p>}
          </div>
        </div>
        <div style={{ flex: 1 }}>
          {!selSt ? <div className="card empty-state">Select a student to view fees</div> : (
            <div>
              {fee && (
                <div className="grid-3" style={{ marginBottom: 20 }}>
                  <StatCard title="Total fee" value={`₹${fee.total_fee || 0}`} variant="primary" />
                  <StatCard title="Total paid" value={`₹${fee.total_paid || 0}`} variant="success" />
                  <StatCard title="Pending" value={`₹${fee.pending || 0}`} variant={fee.pending > 0 ? "danger" : "success"} />
                </div>
              )}
              <div className="card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700 }}>Payment history</h3>
                  {isAdmin && <button className="btn btn-success" onClick={() => setShowPay(!showPay)}>+ Record payment</button>}
                </div>
                {showPay && (
                  <div style={{ background: "var(--success-light)", padding: 16, borderRadius: 8, marginBottom: 16 }}>
                    <div className="grid-3">
                      <div><label className="label">Amount (₹)</label><input className="input" type="number" value={payForm.amount} onChange={e => setPayForm({ ...payForm, amount: e.target.value })} placeholder="5000" /></div>
                      <div><label className="label">Mode</label><select className="select" value={payForm.mode} onChange={e => setPayForm({ ...payForm, mode: e.target.value })}><option value="cash">Cash</option><option value="upi">UPI</option><option value="bank_transfer">Bank Transfer</option><option value="cheque">Cheque</option><option value="online">Online</option></select></div>
                      <div><label className="label">Notes</label><input className="input" value={payForm.notes} onChange={e => setPayForm({ ...payForm, notes: e.target.value })} placeholder="Optional" /></div>
                    </div>
                    <button className="btn btn-success" style={{ marginTop: 12 }} onClick={pay} disabled={saving}>{saving ? "Saving..." : "Save payment"}</button>
                  </div>
                )}
                {payments.length === 0 ? <p style={{ color: "var(--muted)", fontSize: 13 }}>No payments yet.</p> : (
                  <table><thead><tr><th>Date</th><th>Amount</th><th>Mode</th><th>Receipt</th><th>Notes</th></tr></thead>
                  <tbody>{payments.map(p => (
                    <tr key={p.id}><td>{new Date(p.payment_date).toLocaleDateString("en-IN")}</td><td style={{ fontWeight: 700, color: "var(--success)" }}>₹{p.amount}</td><td><span className="badge badge-primary">{p.payment_mode}</span></td><td style={{ fontSize: 12, color: "var(--muted)" }}>{p.receipt_number}</td><td>{p.notes || "-"}</td></tr>
                  ))}</tbody></table>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ========== TESTS ==========
function TestsTab() {
  const [tests, setTests] = useState([]);
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", courseId: "", subjectId: "", totalMarks: "", testDate: "" });

  useEffect(() => {
    supabase.from("tests").select("*, courses(name), subjects(name)").order("test_date", { ascending: false }).then(({ data }) => setTests(data || []));
    supabase.from("courses").select("*").eq("is_active", true).then(({ data }) => setCourses(data || []));
  }, []);

  useEffect(() => { if (form.courseId) supabase.from("subjects").select("*").eq("course_id", form.courseId).then(({ data }) => setSubjects(data || [])); }, [form.courseId]);

  const add = async () => {
    if (!form.name || !form.courseId || !form.subjectId || !form.totalMarks || !form.testDate) return;
    await supabase.from("tests").insert({ name: form.name, course_id: form.courseId, subject_id: form.subjectId, total_marks: Number(form.totalMarks), test_date: form.testDate });
    setShowForm(false); setForm({ name: "", courseId: "", subjectId: "", totalMarks: "", testDate: "" });
    const { data } = await supabase.from("tests").select("*, courses(name), subjects(name)").order("test_date", { ascending: false });
    setTests(data || []);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div><h1 className="page-title">Tests & results</h1><p style={{ fontSize: 13, color: "var(--muted)" }}>{tests.length} tests</p></div>
        <button className="btn btn-accent" onClick={() => setShowForm(!showForm)}>+ Create test</button>
      </div>
      {showForm && (
        <div className="card" style={{ marginBottom: 20, borderColor: "var(--accent)" }}>
          <div className="grid-3">
            <div><label className="label">Test name</label><input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Unit Test 1" /></div>
            <div><label className="label">Course</label><select className="select" value={form.courseId} onChange={e => setForm({ ...form, courseId: e.target.value, subjectId: "" })}><option value="">Select</option>{courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
            <div><label className="label">Subject</label><select className="select" value={form.subjectId} onChange={e => setForm({ ...form, subjectId: e.target.value })}><option value="">Select</option>{subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
          </div>
          <div className="grid-3" style={{ marginTop: 12 }}>
            <div><label className="label">Total marks</label><input className="input" type="number" value={form.totalMarks} onChange={e => setForm({ ...form, totalMarks: e.target.value })} placeholder="100" /></div>
            <div><label className="label">Test date</label><input className="input" type="date" value={form.testDate} onChange={e => setForm({ ...form, testDate: e.target.value })} /></div>
            <div style={{ display: "flex", alignItems: "flex-end" }}><button className="btn btn-success" onClick={add}>Save test</button></div>
          </div>
        </div>
      )}
      <div className="card">
        {tests.length === 0 ? <p className="empty-state">No tests created yet.</p> : (
          <table><thead><tr><th>Test name</th><th>Course</th><th>Subject</th><th>Total marks</th><th>Date</th></tr></thead>
          <tbody>{tests.map(t => (
            <tr key={t.id}><td style={{ fontWeight: 600 }}>{t.name}</td><td>{t.courses?.name}</td><td><span className="badge badge-primary">{t.subjects?.name}</span></td><td>{t.total_marks}</td><td>{new Date(t.test_date).toLocaleDateString("en-IN")}</td></tr>
          ))}</tbody></table>
        )}
      </div>
    </div>
  );
}

// ========== STAFF ==========
function StaffTab() {
  const [staffList, setStaffList] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", designation: "", specialization: "", salary: "" });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => { supabase.from("staff").select("*, profiles!inner(full_name, phone, email)").then(({ data }) => setStaffList(data || [])); }, []);

  const add = async () => {
    if (!form.fullName || !form.email) return;
    setLoading(true);
    try {
      const tempPass = "Staff@" + Date.now().toString().slice(-6);
      const { data: authData, error: authErr } = await supabase.auth.signUp({ email: form.email, password: tempPass, options: { data: { full_name: form.fullName, role: "teacher" } } });
      if (authErr) throw authErr;
      await new Promise(r => setTimeout(r, 1000));
      const userId = authData.user?.id;
      await supabase.from("profiles").update({ phone: form.phone, role: "teacher" }).eq("id", userId);
      await supabase.from("staff").insert({ profile_id: userId, designation: form.designation || null, subject_specialization: form.specialization || null, salary: form.salary ? Number(form.salary) : null });
      setMsg(`Staff added! Temp password: ${tempPass}`);
      setShowForm(false); setForm({ fullName: "", email: "", phone: "", designation: "", specialization: "", salary: "" });
      const { data } = await supabase.from("staff").select("*, profiles!inner(full_name, phone, email)");
      setStaffList(data || []);
    } catch (e) { setMsg(e.message); }
    setLoading(false);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div><h1 className="page-title">Staff management</h1><p style={{ fontSize: 13, color: "var(--muted)" }}>{staffList.length} staff members</p></div>
        <button className="btn btn-accent" onClick={() => setShowForm(!showForm)}>+ Add staff</button>
      </div>
      {msg && <div className="success-box">{msg}</div>}
      {showForm && (
        <div className="card" style={{ marginBottom: 20, borderColor: "var(--accent)" }}>
          <div className="grid-3">
            <div><label className="label">Full name *</label><input className="input" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} /></div>
            <div><label className="label">Email *</label><input className="input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
            <div><label className="label">Phone</label><input className="input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
          </div>
          <div className="grid-3" style={{ marginTop: 12 }}>
            <div><label className="label">Designation</label><input className="input" value={form.designation} onChange={e => setForm({ ...form, designation: e.target.value })} placeholder="Senior Teacher" /></div>
            <div><label className="label">Subject</label><input className="input" value={form.specialization} onChange={e => setForm({ ...form, specialization: e.target.value })} placeholder="Physics" /></div>
            <div><label className="label">Salary</label><input className="input" type="number" value={form.salary} onChange={e => setForm({ ...form, salary: e.target.value })} placeholder="25000" /></div>
          </div>
          <button className="btn btn-success" style={{ marginTop: 14 }} onClick={add} disabled={loading}>{loading ? "Adding..." : "Save staff"}</button>
        </div>
      )}
      <div className="card">
        {staffList.length === 0 ? <p className="empty-state">No staff added yet.</p> : (
          <table><thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Designation</th><th>Subject</th></tr></thead>
          <tbody>{staffList.map(st => (
            <tr key={st.id}><td style={{ fontWeight: 600 }}>{st.profiles?.full_name}</td><td>{st.profiles?.email}</td><td>{st.profiles?.phone || "-"}</td><td>{st.designation || "-"}</td><td><span className="badge badge-primary">{st.subject_specialization || "-"}</span></td></tr>
          ))}</tbody></table>
        )}
      </div>
    </div>
  );
}

// ========== PROGRESS ==========
function ProgressTab() {
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [selSub, setSelSub] = useState("");

  useEffect(() => { supabase.from("subjects").select("*, courses(name)").then(({ data }) => setSubjects(data || [])); }, []);
  useEffect(() => { if (selSub) supabase.from("chapters").select("*").eq("subject_id", selSub).order("sort_order").then(({ data }) => setChapters(data || [])); }, [selSub]);

  return (
    <div>
      <h1 className="page-title">Study progress</h1>
      <p className="page-sub">Track chapter completion by subject</p>
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {subjects.map(s => <button key={s.id} className={`tag ${selSub === s.id ? "active" : ""}`} onClick={() => setSelSub(s.id)}>{s.name} ({s.courses?.name})</button>)}
      </div>
      {selSub && (
        <div className="card">
          {chapters.length === 0 ? <p style={{ color: "var(--muted)" }}>No chapters found.</p> : (
            <table><thead><tr><th>#</th><th>Chapter name</th><th>Status</th></tr></thead>
            <tbody>{chapters.map((ch, i) => (
              <tr key={ch.id}><td>{i + 1}</td><td style={{ fontWeight: 500 }}>{ch.name}</td><td><span className="badge badge-muted">Pending</span></td></tr>
            ))}</tbody></table>
          )}
        </div>
      )}
    </div>
  );
}

// ========== MAIN APP ==========
export default function Home() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      if (s) loadProfile(s.user.id);
      setChecking(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      if (s) loadProfile(s.user.id);
    });
    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = async (uid) => {
    const { data } = await supabase.from("profiles").select("*").eq("id", uid).single();
    setProfile(data);
  };

  const login = async () => {
    const { data: { session: s } } = await supabase.auth.getSession();
    setSession(s);
    if (s) loadProfile(s.user.id);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setSession(null); setProfile(null); setActiveTab("Dashboard");
  };

  if (checking) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif" }}>Loading...</div>;
  if (!session) return <LoginScreen onLogin={login} />;

  const role = profile?.role || "student";
  const tabs = TABS[role] || TABS.student;
  const icons = { Dashboard: "◫", Students: "☺", Admission: "✚", "Live Classes": "▶", Attendance: "✔", Fees: "₹", Tests: "✎", Staff: "★", Progress: "★" };

  const renderTab = () => {
    switch (activeTab) {
      case "Dashboard": return <DashboardTab profile={profile} />;
      case "Students": return <StudentsTab />;
      case "Admission": return <AdmissionTab />;
      case "Live Classes": return <LiveClassesTab profile={profile} />;
      case "Attendance": return <AttendanceTab />;
      case "Fees": return <FeesTab profile={profile} />;
      case "Tests": return <TestsTab />;
      case "Staff": return <StaffTab />;
      case "Progress": return <ProgressTab />;
      default: return <DashboardTab profile={profile} />;
    }
  };

  return (
    <div>
      <div className="sidebar">
        <div className="sidebar-header">
          <h1 style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.3px" }}>My Career Academic</h1>
          <div style={{ fontSize: 11, opacity: 0.6, marginTop: 4 }}>Coaching Management</div>
        </div>
        <div style={{ padding: "12px 0", flex: 1 }}>
          {tabs.map(tab => (
            <div key={tab} className={`nav-item ${activeTab === tab ? "active" : ""}`} onClick={() => setActiveTab(tab)}>
              <span style={{ fontSize: 14 }}>{icons[tab]}</span> {tab}
            </div>
          ))}
        </div>
        <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,0.12)" }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{profile?.full_name}</div>
          <div style={{ fontSize: 11, opacity: 0.6, marginTop: 2 }}>{role.toUpperCase()}</div>
          <div onClick={logout} style={{ fontSize: 12, opacity: 0.7, cursor: "pointer", marginTop: 10 }}>Logout</div>
        </div>
      </div>
      <div className="main">{renderTab()}</div>
    </div>
  );
}
