"use client";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";

const SUPABASE_URL = "https://sxqddwpszfumcwxtmxsk.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4cWRkd3BzemZ1bWN3eHRteHNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2NzMyMTIsImV4cCI6MjA5MjI0OTIxMn0.N-6xZneRahpcpGZVjdSlsb1_gHsWiBTvYm2LNqStF_Q";

const TABS = {
  admin: ["Dashboard", "Students", "Admission", "Courses", "Live Classes", "Attendance", "Fees", "Tests", "Staff"],
  teacher: ["Dashboard", "Live Classes", "Attendance", "Tests"],
  staff: ["Dashboard", "Students", "Live Classes", "Attendance"],
  student: ["Dashboard", "Live Classes", "Fees", "Progress"],
  guardian: ["Dashboard", "Live Classes"],
};

async function fetchProfileDirect(uid, token) {
  try {
    const res = await fetch(SUPABASE_URL + "/rest/v1/profiles?id=eq." + uid + "&select=*", { headers: { apikey: SUPABASE_KEY, Authorization: "Bearer " + (token || SUPABASE_KEY) } });
    const rows = await res.json();
    if (Array.isArray(rows) && rows.length > 0) return rows[0];
    return null;
  } catch (e) { return null; }
}

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
        <div className="form-group"><label className="label">Email</label><input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} /></div>
        <div className="form-group"><label className="label">Password</label><input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} /></div>
        <button className="btn" style={{ width: "100%", padding: 12, marginTop: 8 }} onClick={handleLogin} disabled={loading}>{loading ? "Logging in..." : "Login"}</button>
      </div>
    </div>
  );
}

// ========== STAT CARD ==========
function StatCard({ title, value, variant }) {
  const borderColor = variant === "danger" ? "var(--danger)" : variant === "success" ? "var(--success)" : variant === "warning" ? "var(--warning)" : "var(--primary)";
  const bg = variant === "danger" ? "var(--danger-light)" : variant === "success" ? "var(--success-light)" : variant === "warning" ? "var(--warning-light)" : "var(--primary-light)";
  return (
    <div className="card" style={{ borderLeft: `4px solid ${borderColor}`, background: bg }}>
      <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>{title}</div>
      <div style={{ fontSize: 28, fontWeight: 700, marginTop: 6, color: borderColor }}>{value}</div>
    </div>
  );
}

// ========== DASHBOARD ==========
function DashboardTab({ profile, onNavigate }) {
  const [stats, setStats] = useState({ students: 0, courses: 0, staff: 0, live: 0, pendingFees: 0 });
  const [recent, setRecent] = useState([]);
  const [todayClasses, setTodayClasses] = useState([]);

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
      const { data: cls } = await supabase.from("live_classes").select("*, subjects(name), staff!inner(profiles!inner(full_name))").eq("class_date", today).order("start_time");
      setTodayClasses(cls || []);
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
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 20 }}>
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Today&apos;s schedule</h3>
          {todayClasses.length === 0 ? <p style={{ color: "var(--muted)", fontSize: 13 }}>No classes today.</p> : todayClasses.map(cl => (
            <div key={cl.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
              <div>
                <span style={{ fontWeight: 600, fontSize: 13.5 }}>{cl.subjects?.name}</span>
                <span style={{ fontSize: 12, color: "var(--muted)", marginLeft: 8 }}>{cl.start_time?.slice(0, 5)} - {cl.end_time?.slice(0, 5)}</span>
              </div>
              <span className={`badge ${cl.status === "live" ? "badge-danger" : cl.status === "completed" ? "badge-success" : "badge-primary"}`}>{cl.status === "live" ? "LIVE" : cl.status}</span>
            </div>
          ))}
        </div>
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Recent admissions</h3>
          {recent.length === 0 ? <p style={{ color: "var(--muted)", fontSize: 13 }}>No students yet.</p> : recent.map(st => (
            <div key={st.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid var(--border)", cursor: "pointer" }} onClick={() => onNavigate("StudentDetail", st)}>
              <span style={{ fontWeight: 500, fontSize: 13.5 }}>{st.profiles?.full_name}</span>
              <span className="badge badge-primary">{st.admission_number}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ========== STUDENT DETAIL PAGE ==========
function StudentDetailTab({ student, onBack }) {
  const [profile, setProfile] = useState(null);
  const [course, setCourse] = useState(null);
  const [fee, setFee] = useState(null);
  const [payments, setPayments] = useState([]);
  const [attendance, setAttendance] = useState({ total: 0, present: 0, pct: 0 });
  const [testResults, setTestResults] = useState([]);
  const [progress, setProgress] = useState({ total: 0, done: 0 });
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    if (!student) return;
    (async () => {
      const { data: p } = await supabase.from("profiles").select("*").eq("id", student.profile_id).single();
      setProfile(p);
      setEditForm({ full_name: p?.full_name || "", phone: p?.phone || "", gender: student.gender || "", address: student.address || "", date_of_birth: student.date_of_birth || "" });

      const { data: c } = await supabase.from("courses").select("*").eq("id", student.course_id).single();
      setCourse(c);

      const { data: fData } = await supabase.rpc("get_fee_summary", { p_student_id: student.id });
      setFee(fData?.[0] || null);

      const { data: payData } = await supabase.from("fee_payments").select("*").eq("student_id", student.id).order("payment_date", { ascending: false });
      setPayments(payData || []);

      const { data: attData } = await supabase.from("attendance").select("*, live_classes!inner(class_date)").eq("student_id", student.id);
      const total = attData?.length || 0;
      const present = attData?.filter(a => a.status === "present" || a.status === "late").length || 0;
      setAttendance({ total, present, pct: total > 0 ? Math.round((present / total) * 100) : 0 });

      const { data: trData } = await supabase.from("test_results").select("*, tests!inner(name, total_marks, test_date, subjects(name))").eq("student_id", student.id).order("tests(test_date)", { ascending: false });
      setTestResults(trData || []);

      const { data: subjects } = await supabase.from("subjects").select("id").eq("course_id", student.course_id);
      const subIds = subjects?.map(s => s.id) || [];
      if (subIds.length > 0) {
        const { data: chapters } = await supabase.from("chapters").select("id").in("subject_id", subIds);
        const { data: prog } = await supabase.from("chapter_progress").select("id").eq("student_id", student.id).eq("is_completed", true);
        setProgress({ total: chapters?.length || 0, done: prog?.length || 0 });
      }
    })();
  }, [student]);

  const saveEdit = async () => {
    await supabase.from("profiles").update({ full_name: editForm.full_name, phone: editForm.phone }).eq("id", student.profile_id);
    await supabase.from("students").update({ gender: editForm.gender || null, address: editForm.address || null, date_of_birth: editForm.date_of_birth || null }).eq("id", student.id);
    setProfile({ ...profile, full_name: editForm.full_name, phone: editForm.phone });
    setEditing(false);
  };

  if (!student) return null;
  const pctColor = attendance.pct >= 75 ? "var(--success)" : attendance.pct >= 50 ? "var(--warning)" : "var(--danger)";

  return (
    <div>
      <button className="btn-outline" onClick={onBack} style={{ marginBottom: 16, fontSize: 13 }}>← Back to Students</button>

      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 700, color: "var(--primary)" }}>
              {(profile?.full_name || "S")[0].toUpperCase()}
            </div>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>{profile?.full_name || "Student"}</h2>
              <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 2 }}>{student.admission_number} | {course?.name || ""}</p>
              <p style={{ fontSize: 13, color: "var(--muted)" }}>{profile?.phone || "No phone"} | {profile?.email || ""}</p>
            </div>
          </div>
          <button className="btn-outline" style={{ fontSize: 12 }} onClick={() => setEditing(!editing)}>{editing ? "Cancel" : "Edit"}</button>
        </div>

        {editing && (
          <div style={{ marginTop: 16, padding: 16, background: "var(--primary-light)", borderRadius: 8 }}>
            <div className="grid-3">
              <div><label className="label">Name</label><input className="input" value={editForm.full_name} onChange={e => setEditForm({ ...editForm, full_name: e.target.value })} /></div>
              <div><label className="label">Phone</label><input className="input" value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} /></div>
              <div><label className="label">Gender</label><select className="select" value={editForm.gender} onChange={e => setEditForm({ ...editForm, gender: e.target.value })}><option value="">Select</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></select></div>
            </div>
            <div className="grid-2" style={{ marginTop: 12 }}>
              <div><label className="label">DOB</label><input className="input" type="date" value={editForm.date_of_birth} onChange={e => setEditForm({ ...editForm, date_of_birth: e.target.value })} /></div>
              <div><label className="label">Address</label><input className="input" value={editForm.address} onChange={e => setEditForm({ ...editForm, address: e.target.value })} /></div>
            </div>
            <button className="btn btn-success" style={{ marginTop: 12, fontSize: 13 }} onClick={saveEdit}>Save changes</button>
          </div>
        )}
      </div>

      <div className="grid-4" style={{ marginBottom: 16 }}>
        <StatCard title="Attendance" value={`${attendance.pct}%`} variant={attendance.pct >= 75 ? "success" : attendance.pct >= 50 ? "warning" : "danger"} />
        <StatCard title="Fee paid" value={`₹${fee?.total_paid || 0}`} variant="success" />
        <StatCard title="Fee pending" value={`₹${fee?.pending || 0}`} variant={fee?.pending > 0 ? "danger" : "success"} />
        <StatCard title="Syllabus done" value={progress.total > 0 ? `${Math.round((progress.done / progress.total) * 100)}%` : "0%"} variant="primary" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Test results</h3>
          {testResults.length === 0 ? <p style={{ color: "var(--muted)", fontSize: 13 }}>No test results yet.</p> : (
            <table><thead><tr><th>Test</th><th>Subject</th><th>Marks</th><th>Date</th></tr></thead>
            <tbody>{testResults.map(tr => (
              <tr key={tr.id}>
                <td style={{ fontWeight: 500 }}>{tr.tests?.name}</td>
                <td><span className="badge badge-primary">{tr.tests?.subjects?.name}</span></td>
                <td style={{ fontWeight: 700, color: tr.marks_obtained >= tr.tests?.total_marks * 0.4 ? "var(--success)" : "var(--danger)" }}>{tr.marks_obtained}/{tr.tests?.total_marks}</td>
                <td style={{ fontSize: 12, color: "var(--muted)" }}>{tr.tests?.test_date ? new Date(tr.tests.test_date).toLocaleDateString("en-IN") : ""}</td>
              </tr>
            ))}</tbody></table>
          )}
        </div>
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Payment history</h3>
          {payments.length === 0 ? <p style={{ color: "var(--muted)", fontSize: 13 }}>No payments yet.</p> : (
            <table><thead><tr><th>Date</th><th>Amount</th><th>Mode</th></tr></thead>
            <tbody>{payments.map(p => (
              <tr key={p.id}>
                <td>{new Date(p.payment_date).toLocaleDateString("en-IN")}</td>
                <td style={{ fontWeight: 700, color: "var(--success)" }}>₹{p.amount}</td>
                <td><span className="badge badge-primary">{p.payment_mode}</span></td>
              </tr>
            ))}</tbody></table>
          )}
        </div>
      </div>
    </div>
  );
}

// ========== STUDENTS LIST (enhanced with click to detail) ==========
function StudentsTab({ onNavigate }) {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    let q = supabase.from("students").select("*, profiles!inner(full_name, phone, email), courses(name)").eq("status", "active").order("created_at", { ascending: false });
    if (filter !== "all") q = q.eq("course_id", filter);
    const { data } = await q;
    setStudents(data || []); setLoading(false);
  }, [filter]);

  useEffect(() => { load(); supabase.from("courses").select("*").eq("is_active", true).then(({ data }) => setCourses(data || [])); }, [load]);

  const filtered = students.filter(st => {
    if (!search) return true;
    const s = search.toLowerCase();
    return st.profiles?.full_name?.toLowerCase().includes(s) || st.admission_number?.toLowerCase().includes(s) || st.profiles?.phone?.includes(s);
  });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div><h1 className="page-title">Students</h1><p style={{ fontSize: 13, color: "var(--muted)" }}>{filtered.length} students</p></div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input className="input" style={{ width: 200 }} placeholder="Search name, phone..." value={search} onChange={e => setSearch(e.target.value)} />
          <button className={`tag ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>All</button>
          {courses.map(c => <button key={c.id} className={`tag ${filter === c.id ? "active" : ""}`} onClick={() => setFilter(c.id)}>{c.name}</button>)}
        </div>
      </div>
      <div className="card">
        {loading ? <p style={{ color: "var(--muted)" }}>Loading...</p> :
        filtered.length === 0 ? <p className="empty-state">No students found.</p> : (
          <table><thead><tr><th>Name</th><th>Adm. no.</th><th>Course</th><th>Phone</th><th>Date</th><th></th></tr></thead>
          <tbody>{filtered.map(st => (
            <tr key={st.id} style={{ cursor: "pointer" }} onClick={() => onNavigate("StudentDetail", st)}>
              <td style={{ fontWeight: 600 }}>{st.profiles?.full_name}</td>
              <td><span className="badge badge-primary">{st.admission_number}</span></td>
              <td>{st.courses?.name}</td>
              <td>{st.profiles?.phone || "-"}</td>
              <td>{new Date(st.admission_date).toLocaleDateString("en-IN")}</td>
              <td style={{ color: "var(--primary)", fontWeight: 600, fontSize: 13 }}>View →</td>
            </tr>
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
      await new Promise(r => setTimeout(r, 1500));
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
      <h1 className="page-title">New Admission</h1><p className="page-sub">Add a new student</p>
      <div className="card" style={{ maxWidth: 600 }}>
        {msg.text && <div className={msg.type === "success" ? "success-box" : "error-box"}>{msg.text}</div>}
        <div className="grid-2">
          <div className="form-group"><label className="label">Full name *</label><input className="input" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} placeholder="Student name" /></div>
          <div className="form-group"><label className="label">Phone</label><input className="input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="Mobile number" /></div>
        </div>
        <div className="grid-2">
          <div className="form-group"><label className="label">Email *</label><input className="input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="student@email.com" /></div>
          <div className="form-group"><label className="label">Course *</label><select className="select" value={form.courseId} onChange={e => setForm({ ...form, courseId: e.target.value })}>{courses.map(c => <option key={c.id} value={c.id}>{c.name} - ₹{c.total_fee}</option>)}</select></div>
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

// ========== COURSE MANAGEMENT (NEW) ==========
function CoursesTab() {
  const [courses, setCourses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", duration: "", fee: "" });
  const [editId, setEditId] = useState(null);
  const [subjects, setSubjects] = useState({});
  const [newSubject, setNewSubject] = useState({});
  const [chapters, setChapters] = useState({});
  const [newChapter, setNewChapter] = useState({});
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadCourses = async () => {
    const { data } = await supabase.from("courses").select("*").order("created_at", { ascending: false });
    setCourses(data || []);
  };

  useEffect(() => { loadCourses(); }, []);

  const loadSubjects = async (courseId) => {
    const { data } = await supabase.from("subjects").select("*").eq("course_id", courseId).order("created_at");
    setSubjects(prev => ({ ...prev, [courseId]: data || [] }));
    for (const sub of (data || [])) {
      const { data: ch } = await supabase.from("chapters").select("*").eq("subject_id", sub.id).order("sort_order");
      setChapters(prev => ({ ...prev, [sub.id]: ch || [] }));
    }
  };

  const toggleExpand = (id) => {
    if (expanded === id) { setExpanded(null); return; }
    setExpanded(id);
    loadSubjects(id);
  };

  const saveCourse = async () => {
    if (!form.name || !form.fee) return;
    setLoading(true);
    if (editId) {
      await supabase.from("courses").update({ name: form.name, description: form.description || null, duration_months: form.duration ? Number(form.duration) : null, total_fee: Number(form.fee) }).eq("id", editId);
    } else {
      await supabase.from("courses").insert({ name: form.name, description: form.description || null, duration_months: form.duration ? Number(form.duration) : null, total_fee: Number(form.fee) });
    }
    setForm({ name: "", description: "", duration: "", fee: "" }); setEditId(null); setShowForm(false); setLoading(false);
    loadCourses();
  };

  const editCourse = (c) => {
    setForm({ name: c.name, description: c.description || "", duration: c.duration_months?.toString() || "", fee: c.total_fee?.toString() || "" });
    setEditId(c.id); setShowForm(true);
  };

  const toggleCourse = async (c) => {
    await supabase.from("courses").update({ is_active: !c.is_active }).eq("id", c.id);
    loadCourses();
  };

  const addSubject = async (courseId) => {
    const name = newSubject[courseId];
    if (!name) return;
    await supabase.from("subjects").insert({ name, course_id: courseId });
    setNewSubject(prev => ({ ...prev, [courseId]: "" }));
    loadSubjects(courseId);
  };

  const deleteSubject = async (subId, courseId) => {
    await supabase.from("subjects").delete().eq("id", subId);
    loadSubjects(courseId);
  };

  const addChapter = async (subId, courseId) => {
    const name = newChapter[subId];
    if (!name) return;
    const existing = chapters[subId] || [];
    await supabase.from("chapters").insert({ name, subject_id: subId, sort_order: existing.length + 1 });
    setNewChapter(prev => ({ ...prev, [subId]: "" }));
    loadSubjects(courseId);
  };

  const deleteChapter = async (chId, courseId) => {
    await supabase.from("chapters").delete().eq("id", chId);
    loadSubjects(courseId);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div><h1 className="page-title">Course management</h1><p className="page-sub" style={{ marginBottom: 0 }}>{courses.length} courses</p></div>
        <button className="btn btn-accent" onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ name: "", description: "", duration: "", fee: "" }); }}>+ Add course</button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: 20, borderColor: "var(--accent)" }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>{editId ? "Edit course" : "New course"}</h3>
          <div className="grid-2">
            <div><label className="label">Course name *</label><input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="JEE 2027 Batch" /></div>
            <div><label className="label">Total fee (₹) *</label><input className="input" type="number" value={form.fee} onChange={e => setForm({ ...form, fee: e.target.value })} placeholder="50000" /></div>
          </div>
          <div className="grid-2" style={{ marginTop: 12 }}>
            <div><label className="label">Duration (months)</label><input className="input" type="number" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} placeholder="12" /></div>
            <div><label className="label">Description</label><input className="input" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Complete preparation course" /></div>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
            <button className="btn btn-success" onClick={saveCourse} disabled={loading}>{loading ? "Saving..." : editId ? "Update" : "Create course"}</button>
            <button className="btn-outline" onClick={() => { setShowForm(false); setEditId(null); }}>Cancel</button>
          </div>
        </div>
      )}

      {courses.map(c => (
        <div key={c.id} className="card" style={{ marginBottom: 12, opacity: c.is_active ? 1 : 0.6 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ cursor: "pointer", flex: 1 }} onClick={() => toggleExpand(c.id)}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontWeight: 700, fontSize: 15 }}>{c.name}</span>
                <span className={`badge ${c.is_active ? "badge-success" : "badge-muted"}`}>{c.is_active ? "Active" : "Inactive"}</span>
              </div>
              <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>Fee: ₹{c.total_fee} | Duration: {c.duration_months || "-"} months {c.description ? `| ${c.description}` : ""}</div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button className="btn-outline" style={{ fontSize: 12, padding: "6px 12px" }} onClick={() => editCourse(c)}>Edit</button>
              <button className="btn-outline" style={{ fontSize: 12, padding: "6px 12px" }} onClick={() => toggleCourse(c)}>{c.is_active ? "Disable" : "Enable"}</button>
              <button className="btn-outline" style={{ fontSize: 12, padding: "6px 12px" }} onClick={() => toggleExpand(c.id)}>{expanded === c.id ? "▲" : "▼"}</button>
            </div>
          </div>

          {expanded === c.id && (
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: "var(--muted)", marginBottom: 12 }}>Subjects & Chapters</h4>
              {(subjects[c.id] || []).map(sub => (
                <div key={sub.id} style={{ marginBottom: 16, padding: 12, background: "var(--bg)", borderRadius: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{sub.name}</span>
                    <button style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer", fontSize: 12, fontWeight: 600 }} onClick={() => deleteSubject(sub.id, c.id)}>Delete</button>
                  </div>
                  {(chapters[sub.id] || []).map((ch, i) => (
                    <div key={ch.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0 4px 16px", fontSize: 13 }}>
                      <span>{i + 1}. {ch.name}</span>
                      <button style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer", fontSize: 11 }} onClick={() => deleteChapter(ch.id, c.id)}>x</button>
                    </div>
                  ))}
                  <div style={{ display: "flex", gap: 8, marginTop: 8, paddingLeft: 16 }}>
                    <input className="input" style={{ flex: 1, padding: "6px 10px", fontSize: 12 }} placeholder="New chapter name" value={newChapter[sub.id] || ""} onChange={e => setNewChapter(prev => ({ ...prev, [sub.id]: e.target.value }))} onKeyDown={e => e.key === "Enter" && addChapter(sub.id, c.id)} />
                    <button className="btn" style={{ fontSize: 11, padding: "6px 12px" }} onClick={() => addChapter(sub.id, c.id)}>+ Chapter</button>
                  </div>
                </div>
              ))}
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <input className="input" style={{ flex: 1, padding: "8px 10px", fontSize: 13 }} placeholder="New subject name (e.g. Physics)" value={newSubject[c.id] || ""} onChange={e => setNewSubject(prev => ({ ...prev, [c.id]: e.target.value }))} onKeyDown={e => e.key === "Enter" && addSubject(c.id)} />
                <button className="btn btn-accent" style={{ fontSize: 12, padding: "8px 16px" }} onClick={() => addSubject(c.id)}>+ Subject</button>
              </div>
            </div>
          )}
        </div>
      ))}
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
  useEffect(() => { if (selCourse) { supabase.from("subjects").select("*").eq("course_id", selCourse).then(({ data }) => setSubjects(data || [])); supabase.from("staff").select("*, profiles!inner(full_name)").then(({ data }) => setStaffList(data || [])); } }, [selCourse]);
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
          <div className="grid-3">
            <div><label className="label">Subject</label><select className="select" value={form.subjectId} onChange={e => setForm({ ...form, subjectId: e.target.value })}><option value="">Select</option>{subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
            <div><label className="label">Teacher</label><select className="select" value={form.teacherId} onChange={e => setForm({ ...form, teacherId: e.target.value })}><option value="">Select</option>{staffList.map(s => <option key={s.id} value={s.id}>{s.profiles?.full_name}</option>)}</select></div>
            <div><label className="label">Topic</label><input className="input" value={form.topic} onChange={e => setForm({ ...form, topic: e.target.value })} /></div>
          </div>
          <div className="grid-3" style={{ marginTop: 12 }}>
            <div><label className="label">Start</label><input className="input" type="time" value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} /></div>
            <div><label className="label">End</label><input className="input" type="time" value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })} /></div>
            <div style={{ display: "flex", alignItems: "flex-end" }}><button className="btn btn-success" onClick={addClass}>Save</button></div>
          </div>
        </div>
      )}
      {classes.length === 0 ? <div className="card empty-state">No classes scheduled for today.</div> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>{classes.map(cl => (
          <div key={cl.id} className={`card class-card ${cl.status === "live" ? "live" : ""}`}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}><span style={{ fontWeight: 700, fontSize: 15 }}>{cl.subjects?.name}</span><span className={`badge ${cl.status === "live" ? "badge-danger" : cl.status === "completed" ? "badge-success" : "badge-primary"}`}>{cl.status === "live" ? "LIVE NOW" : cl.status}</span></div>
              <div style={{ fontSize: 13, color: "var(--muted)" }}>{cl.start_time?.slice(0, 5)} - {cl.end_time?.slice(0, 5)} | {cl.staff?.profiles?.full_name} {cl.topic ? `| ${cl.topic}` : ""}</div>
            </div>
            {isStaff && <div style={{ display: "flex", gap: 8 }}>
              {cl.status === "scheduled" && <button className="btn btn-danger" onClick={() => updateStatus(cl.id, "live")}>Go Live</button>}
              {cl.status === "live" && <button className="btn btn-success" onClick={() => updateStatus(cl.id, "completed")}>Complete</button>}
              {cl.status === "scheduled" && <button className="btn-outline" onClick={() => updateStatus(cl.id, "cancelled")}>Cancel</button>}
            </div>}
          </div>
        ))}</div>
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
      <h1 className="page-title">Mark attendance</h1><p className="page-sub">Select a class</p>
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        {classes.length === 0 && <p style={{ color: "var(--muted)", fontSize: 13 }}>No live/completed classes today.</p>}
        {classes.map(cl => <button key={cl.id} className={`tag ${selClass?.id === cl.id ? "active" : ""}`} onClick={() => setSelClass(cl)}>{cl.subjects?.name} ({cl.start_time?.slice(0, 5)})</button>)}
      </div>
      {selClass && (
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700 }}>{selClass.subjects?.name}</h3>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {saved && <span style={{ color: "var(--success)", fontSize: 13, fontWeight: 600 }}>Saved!</span>}
              <button className="btn btn-success" onClick={save} disabled={saving}>{saving ? "Saving..." : "Save"}</button>
            </div>
          </div>
          {students.length === 0 ? <p style={{ color: "var(--muted)" }}>No students.</p> : (
            <table><thead><tr><th>Student</th><th>Status</th></tr></thead>
            <tbody>{students.map(st => (
              <tr key={st.id}><td style={{ fontWeight: 600 }}>{st.profiles?.full_name}</td>
              <td><div style={{ display: "flex", gap: 6 }}>{["present", "absent", "late", "excused"].map(status => (
                <button key={status} className={`att-btn ${att[st.id] === status ? status : ""}`} onClick={() => setAtt({ ...att, [st.id]: status })}>{status}</button>
              ))}</div></td></tr>
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
      <h1 className="page-title">Fee management</h1><p className="page-sub">Track student fees</p>
      <div style={{ display: "flex", gap: 20 }}>
        <div style={{ width: 260, flexShrink: 0 }}>
          <div className="card" style={{ maxHeight: 500, overflowY: "auto" }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: "var(--muted)" }}>Select student</h3>
            {students.map(st => <div key={st.id} className={`student-item ${selSt?.id === st.id ? "active" : ""}`} onClick={() => loadFee(st)}>{st.profiles?.full_name}</div>)}
          </div>
        </div>
        <div style={{ flex: 1 }}>
          {!selSt ? <div className="card empty-state">Select a student</div> : (
            <div>
              {fee && <div className="grid-3" style={{ marginBottom: 20 }}>
                <StatCard title="Total fee" value={`₹${fee.total_fee || 0}`} variant="primary" />
                <StatCard title="Paid" value={`₹${fee.total_paid || 0}`} variant="success" />
                <StatCard title="Pending" value={`₹${fee.pending || 0}`} variant={fee.pending > 0 ? "danger" : "success"} />
              </div>}
              <div className="card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700 }}>Payments</h3>
                  {isAdmin && <button className="btn btn-success" onClick={() => setShowPay(!showPay)}>+ Record payment</button>}
                </div>
                {showPay && (
                  <div style={{ background: "var(--success-light)", padding: 16, borderRadius: 8, marginBottom: 16 }}>
                    <div className="grid-3">
                      <div><label className="label">Amount</label><input className="input" type="number" value={payForm.amount} onChange={e => setPayForm({ ...payForm, amount: e.target.value })} /></div>
                      <div><label className="label">Mode</label><select className="select" value={payForm.mode} onChange={e => setPayForm({ ...payForm, mode: e.target.value })}><option value="cash">Cash</option><option value="upi">UPI</option><option value="bank_transfer">Bank</option><option value="cheque">Cheque</option><option value="online">Online</option></select></div>
                      <div><label className="label">Notes</label><input className="input" value={payForm.notes} onChange={e => setPayForm({ ...payForm, notes: e.target.value })} /></div>
                    </div>
                    <button className="btn btn-success" style={{ marginTop: 12 }} onClick={pay} disabled={saving}>{saving ? "Saving..." : "Save"}</button>
                  </div>
                )}
                {payments.length === 0 ? <p style={{ color: "var(--muted)", fontSize: 13 }}>No payments.</p> : (
                  <table><thead><tr><th>Date</th><th>Amount</th><th>Mode</th><th>Receipt</th></tr></thead>
                  <tbody>{payments.map(p => (
                    <tr key={p.id}><td>{new Date(p.payment_date).toLocaleDateString("en-IN")}</td><td style={{ fontWeight: 700, color: "var(--success)" }}>₹{p.amount}</td><td><span className="badge badge-primary">{p.payment_mode}</span></td><td style={{ fontSize: 12, color: "var(--muted)" }}>{p.receipt_number}</td></tr>
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

// ========== TESTS + MARKS ENTRY (ENHANCED) ==========
function TestsTab() {
  const [tests, setTests] = useState([]);
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", courseId: "", subjectId: "", totalMarks: "", testDate: "" });
  const [marksTest, setMarksTest] = useState(null);
  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState({});
  const [savingMarks, setSavingMarks] = useState(false);
  const [marksSaved, setMarksSaved] = useState(false);

  const loadTests = async () => {
    const { data } = await supabase.from("tests").select("*, courses(name), subjects(name)").order("test_date", { ascending: false });
    setTests(data || []);
  };

  useEffect(() => { loadTests(); supabase.from("courses").select("*").eq("is_active", true).then(({ data }) => setCourses(data || [])); }, []);
  useEffect(() => { if (form.courseId) supabase.from("subjects").select("*").eq("course_id", form.courseId).then(({ data }) => setSubjects(data || [])); }, [form.courseId]);

  const add = async () => {
    if (!form.name || !form.courseId || !form.subjectId || !form.totalMarks || !form.testDate) return;
    await supabase.from("tests").insert({ name: form.name, course_id: form.courseId, subject_id: form.subjectId, total_marks: Number(form.totalMarks), test_date: form.testDate });
    setShowForm(false); setForm({ name: "", courseId: "", subjectId: "", totalMarks: "", testDate: "" }); loadTests();
  };

  const openMarksEntry = async (test) => {
    setMarksTest(test); setMarksSaved(false);
    const { data: stData } = await supabase.from("students").select("*, profiles!inner(full_name)").eq("course_id", test.course_id).eq("status", "active").order("profiles(full_name)");
    setStudents(stData || []);
    const { data: existing } = await supabase.from("test_results").select("*").eq("test_id", test.id);
    const map = {}; (existing || []).forEach(r => { map[r.student_id] = r.marks_obtained?.toString() || ""; });
    (stData || []).forEach(st => { if (!(st.id in map)) map[st.id] = ""; });
    setMarks(map);
  };

  const saveMarks = async () => {
    setSavingMarks(true);
    const records = Object.entries(marks).filter(([, v]) => v !== "").map(([sid, val]) => ({ test_id: marksTest.id, student_id: sid, marks_obtained: Number(val) }));
    if (records.length > 0) await supabase.from("test_results").upsert(records, { onConflict: "test_id,student_id" });
    setSavingMarks(false); setMarksSaved(true);
  };

  const deleteTest = async (id) => {
    if (!confirm("Delete this test and all results?")) return;
    await supabase.from("test_results").delete().eq("test_id", id);
    await supabase.from("tests").delete().eq("id", id);
    loadTests(); if (marksTest?.id === id) setMarksTest(null);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div><h1 className="page-title">Tests & marks</h1><p style={{ fontSize: 13, color: "var(--muted)" }}>{tests.length} tests</p></div>
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
            <div><label className="label">Total marks</label><input className="input" type="number" value={form.totalMarks} onChange={e => setForm({ ...form, totalMarks: e.target.value })} /></div>
            <div><label className="label">Date</label><input className="input" type="date" value={form.testDate} onChange={e => setForm({ ...form, testDate: e.target.value })} /></div>
            <div style={{ display: "flex", alignItems: "flex-end" }}><button className="btn btn-success" onClick={add}>Save</button></div>
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 20 }}>
        <div style={{ width: 340, flexShrink: 0 }}>
          <div className="card">
            <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: "var(--muted)" }}>All tests</h3>
            {tests.length === 0 ? <p className="empty-state">No tests yet.</p> : tests.map(t => (
              <div key={t.id} style={{ padding: "10px 0", borderBottom: "1px solid var(--border)", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div onClick={() => openMarksEntry(t)}>
                  <div style={{ fontWeight: 600, fontSize: 13.5 }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>{t.courses?.name} | {t.subjects?.name} | {t.total_marks} marks</div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button className="btn" style={{ fontSize: 11, padding: "4px 10px" }} onClick={() => openMarksEntry(t)}>Marks</button>
                  <button style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer", fontSize: 11, fontWeight: 600 }} onClick={() => deleteTest(t.id)}>Del</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ flex: 1 }}>
          {!marksTest ? <div className="card empty-state">Select a test to enter marks</div> : (
            <div className="card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 700 }}>{marksTest.name}</h3>
                  <p style={{ fontSize: 12, color: "var(--muted)" }}>Total: {marksTest.total_marks} marks | {marksTest.subjects?.name}</p>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  {marksSaved && <span style={{ color: "var(--success)", fontSize: 13, fontWeight: 600 }}>Saved!</span>}
                  <button className="btn btn-success" onClick={saveMarks} disabled={savingMarks}>{savingMarks ? "Saving..." : "Save marks"}</button>
                </div>
              </div>
              {students.length === 0 ? <p style={{ color: "var(--muted)", fontSize: 13 }}>No students in this course.</p> : (
                <table><thead><tr><th>Student</th><th style={{ width: 120 }}>Marks (/{marksTest.total_marks})</th><th style={{ width: 80 }}>%</th></tr></thead>
                <tbody>{students.map(st => {
                  const val = marks[st.id] || "";
                  const pct = val ? Math.round((Number(val) / marksTest.total_marks) * 100) : null;
                  return (
                    <tr key={st.id}>
                      <td style={{ fontWeight: 600 }}>{st.profiles?.full_name}</td>
                      <td><input className="input" type="number" min="0" max={marksTest.total_marks} style={{ width: 100, padding: "6px 10px", fontSize: 13 }} value={val} onChange={e => setMarks({ ...marks, [st.id]: e.target.value })} /></td>
                      <td>{pct !== null ? <span className={`badge ${pct >= 40 ? "badge-success" : "badge-danger"}`}>{pct}%</span> : "-"}</td>
                    </tr>
                  );
                })}</tbody></table>
              )}
            </div>
          )}
        </div>
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
      await new Promise(r => setTimeout(r, 1500));
      const userId = authData.user?.id;
      await supabase.from("profiles").update({ phone: form.phone, role: "teacher" }).eq("id", userId);
      await supabase.from("staff").insert({ profile_id: userId, designation: form.designation || null, subject_specialization: form.specialization || null, salary: form.salary ? Number(form.salary) : null });
      setMsg(`Staff added! Password: ${tempPass}`);
      setShowForm(false); setForm({ fullName: "", email: "", phone: "", designation: "", specialization: "", salary: "" });
      const { data } = await supabase.from("staff").select("*, profiles!inner(full_name, phone, email)");
      setStaffList(data || []);
    } catch (e) { setMsg(e.message); }
    setLoading(false);
  };
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div><h1 className="page-title">Staff</h1><p style={{ fontSize: 13, color: "var(--muted)" }}>{staffList.length} members</p></div>
        <button className="btn btn-accent" onClick={() => setShowForm(!showForm)}>+ Add staff</button>
      </div>
      {msg && <div className="success-box">{msg}</div>}
      {showForm && (
        <div className="card" style={{ marginBottom: 20, borderColor: "var(--accent)" }}>
          <div className="grid-3">
            <div><label className="label">Name *</label><input className="input" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} /></div>
            <div><label className="label">Email *</label><input className="input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
            <div><label className="label">Phone</label><input className="input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
          </div>
          <div className="grid-3" style={{ marginTop: 12 }}>
            <div><label className="label">Designation</label><input className="input" value={form.designation} onChange={e => setForm({ ...form, designation: e.target.value })} /></div>
            <div><label className="label">Subject</label><input className="input" value={form.specialization} onChange={e => setForm({ ...form, specialization: e.target.value })} /></div>
            <div><label className="label">Salary</label><input className="input" type="number" value={form.salary} onChange={e => setForm({ ...form, salary: e.target.value })} /></div>
          </div>
          <button className="btn btn-success" style={{ marginTop: 14 }} onClick={add} disabled={loading}>{loading ? "Adding..." : "Save"}</button>
        </div>
      )}
      <div className="card">
        {staffList.length === 0 ? <p className="empty-state">No staff yet.</p> : (
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
      <h1 className="page-title">Study progress</h1><p className="page-sub">Track by subject</p>
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>{subjects.map(s => <button key={s.id} className={`tag ${selSub === s.id ? "active" : ""}`} onClick={() => setSelSub(s.id)}>{s.name} ({s.courses?.name})</button>)}</div>
      {selSub && (
        <div className="card">
          {chapters.length === 0 ? <p style={{ color: "var(--muted)" }}>No chapters.</p> : (
            <table><thead><tr><th>#</th><th>Chapter</th><th>Status</th></tr></thead>
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
  const [detailStudent, setDetailStudent] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s); if (s) loadProfile(s.user.id, s.access_token); setChecking(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s); if (s) loadProfile(s.user.id, s.access_token);
    });
    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = async (uid, token) => { const data = await fetchProfileDirect(uid, token); setProfile(data); };
  const login = async () => { const { data: { session: s } } = await supabase.auth.getSession(); setSession(s); if (s) loadProfile(s.user.id, s.access_token); };
  const logout = async () => { await supabase.auth.signOut(); setSession(null); setProfile(null); setActiveTab("Dashboard"); };

  const navigate = (tab, data) => {
    if (tab === "StudentDetail") { setDetailStudent(data); setActiveTab("StudentDetail"); }
    else { setActiveTab(tab); setDetailStudent(null); }
  };

  if (checking) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif" }}>Loading...</div>;
  if (!session) return <LoginScreen onLogin={login} />;

  const role = profile?.role || "student";
  const tabs = TABS[role] || TABS.student;
  const icons = { Dashboard: "◫", Students: "☺", Admission: "✚", Courses: "📖", "Live Classes": "▶", Attendance: "✔", Fees: "₹", Tests: "✎", Staff: "★", Progress: "★" };

  const renderTab = () => {
    if (activeTab === "StudentDetail") return <StudentDetailTab student={detailStudent} onBack={() => { setActiveTab("Students"); setDetailStudent(null); }} />;
    switch (activeTab) {
      case "Dashboard": return <DashboardTab profile={profile} onNavigate={navigate} />;
      case "Students": return <StudentsTab onNavigate={navigate} />;
      case "Admission": return <AdmissionTab />;
      case "Courses": return <CoursesTab />;
      case "Live Classes": return <LiveClassesTab profile={profile} />;
      case "Attendance": return <AttendanceTab />;
      case "Fees": return <FeesTab profile={profile} />;
      case "Tests": return <TestsTab />;
      case "Staff": return <StaffTab />;
      case "Progress": return <ProgressTab />;
      default: return <DashboardTab profile={profile} onNavigate={navigate} />;
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
            <div key={tab} className={`nav-item ${activeTab === tab ? "active" : ""}`} onClick={() => navigate(tab)}>
              <span style={{ fontSize: 14 }}>{icons[tab]}</span> {tab}
            </div>
          ))}
        </div>
        <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,0.12)" }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{profile?.full_name || "User"}</div>
          <div style={{ fontSize: 11, opacity: 0.6, marginTop: 2 }}>{role.toUpperCase()}</div>
          <div onClick={logout} style={{ fontSize: 12, opacity: 0.7, cursor: "pointer", marginTop: 10 }}>Logout</div>
        </div>
      </div>
      <div className="main">{renderTab()}</div>
    </div>
  );
}
