"use client";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";

const SUPABASE_URL = "https://sxqddwpszfumcwxtmxsk.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4cWRkd3BzemZ1bWN3eHRteHNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2NzMyMTIsImV4cCI6MjA5MjI0OTIxMn0.N-6xZneRahpcpGZVjdSlsb1_gHsWiBTvYm2LNqStF_Q";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const MCA_LOGO = "data:image/png;base64,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";


const TABS = {
  admin: ["Dashboard", "Students", "Admission", "Courses", "Timetable", "Live Classes", "Attendance", "Fees", "Tests", "Hostel", "Accounts", "Guardians", "Staff", "Notices"],
  teacher: ["Dashboard", "Timetable", "Live Classes", "Attendance", "Tests", "Notices"],
  staff: ["Dashboard", "Students", "Live Classes", "Attendance", "Hostel", "Notices"],
  student: ["Dashboard", "Timetable", "Live Classes", "Fees", "Progress", "Notices"],
  guardian: ["Dashboard", "Live Classes", "Notices"],
};

function numberToWords(n) {
  if (n === 0) return "zero";
  const ones = ["","one","two","three","four","five","six","seven","eight","nine","ten","eleven","twelve","thirteen","fourteen","fifteen","sixteen","seventeen","eighteen","nineteen"];
  const tens = ["","","twenty","thirty","forty","fifty","sixty","seventy","eighty","ninety"];
  if (n < 20) return ones[n];
  if (n < 100) return tens[Math.floor(n/10)] + (n%10 ? " " + ones[n%10] : "");
  if (n < 1000) return ones[Math.floor(n/100)] + " hundred" + (n%100 ? " " + numberToWords(n%100) : "");
  if (n < 100000) return numberToWords(Math.floor(n/1000)) + " thousand" + (n%1000 ? " " + numberToWords(n%1000) : "");
  if (n < 10000000) return numberToWords(Math.floor(n/100000)) + " lakh" + (n%100000 ? " " + numberToWords(n%100000) : "");
  return numberToWords(Math.floor(n/10000000)) + " crore" + (n%10000000 ? " " + numberToWords(n%10000000) : "");
}

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
    try { const { error: err } = await supabase.auth.signInWithPassword({ email, password }); if (err) throw err; onLogin(); } catch (e) { setError(e.message || "Login failed"); }
    setLoading(false);
  };
  return (
    <div className="login-bg"><div className="login-card">
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ width: 56, height: 56, background: "var(--primary)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 24, color: "#fff", fontWeight: 700 }}>M</div>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>My Career Academic</h1>
        <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 6 }}>Coaching Management System</p>
      </div>
      {error && <div className="error-box">{error}</div>}
      <div className="form-group"><label className="label">Email</label><input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} /></div>
      <div className="form-group"><label className="label">Password</label><input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} /></div>
      <button className="btn" style={{ width: "100%", padding: 12, marginTop: 8 }} onClick={handleLogin} disabled={loading}>{loading ? "Logging in..." : "Login"}</button>
    </div></div>
  );
}

function StatCard({ title, value, variant }) {
  const bc = variant === "danger" ? "var(--danger)" : variant === "success" ? "var(--success)" : variant === "warning" ? "var(--warning)" : "var(--primary)";
  const bg = variant === "danger" ? "var(--danger-light)" : variant === "success" ? "var(--success-light)" : variant === "warning" ? "var(--warning-light)" : "var(--primary-light)";
  return (<div className="card" style={{ borderLeft: `4px solid ${bc}`, background: bg }}><div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>{title}</div><div style={{ fontSize: 28, fontWeight: 700, marginTop: 6, color: bc }}>{value}</div></div>);
}

// ========== DASHBOARD ==========
function DashboardTab({ profile, onNavigate, notifications }) {
  const [stats, setStats] = useState({ students: 0, courses: 0, staff: 0, live: 0 });
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
  const unread = (notifications || []).filter(n => !n.is_read).length;
  return (
    <div>
      <h1 className="page-title">Dashboard</h1>
      <p className="page-sub">Welcome back, {profile?.full_name || "Admin"}</p>
      <div className="grid-4">
        <StatCard title="Total students" value={stats.students} variant="primary" />
        <StatCard title="Live now" value={stats.live} variant="danger" />
        <StatCard title="Courses" value={stats.courses} variant="success" />
        <StatCard title="Unread notices" value={unread} variant="warning" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 20 }}>
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Today&apos;s schedule</h3>
          {todayClasses.length === 0 ? <p style={{ color: "var(--muted)", fontSize: 13 }}>No classes today.</p> : todayClasses.map(cl => (
            <div key={cl.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
              <div><span style={{ fontWeight: 600, fontSize: 13.5 }}>{cl.subjects?.name}</span><span style={{ fontSize: 12, color: "var(--muted)", marginLeft: 8 }}>{cl.start_time?.slice(0, 5)}-{cl.end_time?.slice(0, 5)}</span></div>
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

// ========== STUDENT DETAIL ==========
function StudentDetailTab({ student, onBack }) {
  const [profile, setProfile] = useState(null);
  const [course, setCourse] = useState(null);
  const [fee, setFee] = useState(null);
  const [payments, setPayments] = useState([]);
  const [attendance, setAttendance] = useState({ total: 0, present: 0, pct: 0 });
  const [testResults, setTestResults] = useState([]);
  const [progress, setProgress] = useState({ total: 0, done: 0 });
  const [guardians, setGuardians] = useState([]);
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
      const { data: attData } = await supabase.from("attendance").select("*").eq("student_id", student.id);
      const total = attData?.length || 0;
      const present = attData?.filter(a => a.status === "present" || a.status === "late").length || 0;
      setAttendance({ total, present, pct: total > 0 ? Math.round((present / total) * 100) : 0 });
      const { data: trData } = await supabase.from("test_results").select("*, tests!inner(name, total_marks, test_date, subjects(name))").eq("student_id", student.id);
      setTestResults(trData || []);
      const { data: subjects } = await supabase.from("subjects").select("id").eq("course_id", student.course_id);
      const subIds = subjects?.map(s => s.id) || [];
      if (subIds.length > 0) {
        const { data: chapters } = await supabase.from("chapters").select("id").in("subject_id", subIds);
        const { data: prog } = await supabase.from("chapter_progress").select("id").eq("student_id", student.id).eq("is_completed", true);
        setProgress({ total: chapters?.length || 0, done: prog?.length || 0 });
      }
      const { data: sgData } = await supabase.from("student_guardians").select("*, guardians!inner(*, profiles!inner(full_name, phone, email))").eq("student_id", student.id);
      setGuardians(sgData || []);
    })();
  }, [student]);
  const saveEdit = async () => {
    await supabase.from("profiles").update({ full_name: editForm.full_name, phone: editForm.phone }).eq("id", student.profile_id);
    await supabase.from("students").update({ gender: editForm.gender || null, address: editForm.address || null, date_of_birth: editForm.date_of_birth || null }).eq("id", student.id);
    setProfile({ ...profile, full_name: editForm.full_name, phone: editForm.phone }); setEditing(false);
  };
  if (!student) return null;
  return (
    <div>
      <button className="btn-outline" onClick={onBack} style={{ marginBottom: 16, fontSize: 13 }}>← Back to Students</button>
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 700, color: "var(--primary)" }}>{(profile?.full_name || "S")[0].toUpperCase()}</div>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>{profile?.full_name || "Student"}</h2>
              <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 2 }}>{student.admission_number} | {course?.name || ""}</p>
              <p style={{ fontSize: 13, color: "var(--muted)" }}>{profile?.phone || "No phone"} | {profile?.email || ""}</p>
              {student.father_name && <p style={{ fontSize: 13, color: "var(--muted)" }}>Father: {student.father_name} {student.mother_name ? `| Mother: ${student.mother_name}` : ""}</p>}
              {(student.category || student.blood_group || student.previous_marks) && <p style={{ fontSize: 12, color: "var(--muted)" }}>{student.category ? `${student.category}` : ""} {student.blood_group ? `| ${student.blood_group}` : ""} {student.previous_marks ? `| 10th: ${student.previous_marks}` : ""}</p>}
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
            <button className="btn btn-success" style={{ marginTop: 12, fontSize: 13 }} onClick={saveEdit}>Save</button>
          </div>
        )}
      </div>
      <div className="grid-4" style={{ marginBottom: 16 }}>
        <StatCard title="Attendance" value={`${attendance.pct}%`} variant={attendance.pct >= 75 ? "success" : "danger"} />
        <StatCard title="Fee paid" value={`₹${fee?.total_paid || 0}`} variant="success" />
        <StatCard title="Pending" value={`₹${fee?.pending || 0}`} variant={fee?.pending > 0 ? "danger" : "success"} />
        <StatCard title="Syllabus" value={progress.total > 0 ? `${Math.round((progress.done / progress.total) * 100)}%` : "0%"} variant="primary" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Test results</h3>
          {testResults.length === 0 ? <p style={{ color: "var(--muted)", fontSize: 13 }}>No results.</p> : (
            <table><thead><tr><th>Test</th><th>Subject</th><th>Marks</th></tr></thead><tbody>{testResults.map(tr => (
              <tr key={tr.id}><td style={{ fontWeight: 500 }}>{tr.tests?.name}</td><td><span className="badge badge-primary">{tr.tests?.subjects?.name}</span></td><td style={{ fontWeight: 700, color: tr.marks_obtained >= tr.tests?.total_marks * 0.4 ? "var(--success)" : "var(--danger)" }}>{tr.marks_obtained}/{tr.tests?.total_marks}</td></tr>
            ))}</tbody></table>
          )}
        </div>
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Guardians</h3>
          {guardians.length === 0 ? <p style={{ color: "var(--muted)", fontSize: 13 }}>No guardians linked.</p> : guardians.map(sg => (
            <div key={sg.id} style={{ padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
              <div style={{ fontWeight: 600, fontSize: 13.5 }}>{sg.guardians?.profiles?.full_name} {sg.is_primary && <span className="badge badge-success" style={{ marginLeft: 6 }}>Primary</span>}</div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>{sg.guardians?.relation || ""} | {sg.guardians?.profiles?.phone || ""}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ========== STUDENTS ==========
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
    const { data } = await q; setStudents(data || []); setLoading(false);
  }, [filter]);
  useEffect(() => { load(); supabase.from("courses").select("*").eq("is_active", true).then(({ data }) => setCourses(data || [])); }, [load]);
  const filtered = students.filter(st => { if (!search) return true; const s = search.toLowerCase(); return st.profiles?.full_name?.toLowerCase().includes(s) || st.admission_number?.toLowerCase().includes(s) || st.profiles?.phone?.includes(s); });
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div><h1 className="page-title">Students</h1><p style={{ fontSize: 13, color: "var(--muted)" }}>{filtered.length} students</p></div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input className="input" style={{ width: 200 }} placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
          <button className={`tag ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>All</button>
          {courses.map(c => <button key={c.id} className={`tag ${filter === c.id ? "active" : ""}`} onClick={() => setFilter(c.id)}>{c.name}</button>)}
        </div>
      </div>
      <div className="card">
        {loading ? <p style={{ color: "var(--muted)" }}>Loading...</p> : filtered.length === 0 ? <p className="empty-state">No students found.</p> : (
          <table><thead><tr><th>Name</th><th>Adm. no.</th><th>Course</th><th>Phone</th><th>Date</th><th></th></tr></thead>
          <tbody>{filtered.map(st => (
            <tr key={st.id} style={{ cursor: "pointer" }} onClick={() => onNavigate("StudentDetail", st)}><td style={{ fontWeight: 600 }}>{st.profiles?.full_name}</td><td><span className="badge badge-primary">{st.admission_number}</span></td><td>{st.courses?.name}</td><td>{st.profiles?.phone || "-"}</td><td>{new Date(st.admission_date).toLocaleDateString("en-IN")}</td><td style={{ color: "var(--primary)", fontWeight: 600, fontSize: 13 }}>View →</td></tr>
          ))}</tbody></table>
        )}
      </div>
    </div>
  );
}

// ========== ADMISSION (COMPLETE FORM) ==========
function PhotoUpload({ label, value, onChange }) {
  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => onChange(ev.target.result);
    reader.readAsDataURL(file);
  };
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ width: 90, height: 110, border: "2px dashed var(--border)", borderRadius: 8, overflow: "hidden", margin: "0 auto 6px", display: "flex", alignItems: "center", justifyContent: "center", background: value ? "none" : "var(--bg)", cursor: "pointer", position: "relative" }} onClick={() => document.getElementById("photo-" + label)?.click()}>
        {value ? <img src={value} alt={label} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: 24, color: "var(--muted)" }}>+</span>}
      </div>
      <input id={"photo-" + label} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />
      <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600 }}>{label}</div>
    </div>
  );
}

function AdmissionTab() {
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({ fullName: "", phone: "", email: "", courseId: "", gender: "", address: "", dob: "", fatherName: "", motherName: "", aadhar: "", category: "", religion: "", previousSchool: "", previousMarks: "", emergencyContact: "", bloodGroup: "" });
  const [photos, setPhotos] = useState({ student: "", father: "", mother: "" });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [step, setStep] = useState(1);
  const [admittedData, setAdmittedData] = useState(null);
  useEffect(() => { supabase.from("courses").select("*").eq("is_active", true).order("name").then(({ data }) => { setCourses(data || []); if (data?.length) setForm(f => ({ ...f, courseId: data[0].id })); }); }, []);

  const sciCourses = courses.filter(c => c.name?.toLowerCase().includes("science"));
  const comCourses = courses.filter(c => c.name?.toLowerCase().includes("commerce"));
  const artCourses = courses.filter(c => c.name?.toLowerCase().includes("art"));
  const groupedCourses = [
    { label: "Science", items: sciCourses, color: "var(--primary)" },
    { label: "Commerce", items: comCourses, color: "var(--warning)" },
    { label: "Arts/Humanities", items: artCourses, color: "var(--success)" },
  ];

  const submit = async () => {
    if (!form.fullName || !form.phone || !form.courseId) { setMsg({ type: "error", text: "Name, phone and class/stream required!" }); return; }
    setLoading(true); setMsg({ type: "", text: "" });
    try {
      const email = form.email || (form.phone + "@student.mca.local");
      const tempPass = "Welcome@" + Date.now().toString().slice(-6);
      const { data: authData, error: authErr } = await supabase.auth.signUp({ email, password: tempPass, options: { data: { full_name: form.fullName, role: "student" } } });
      if (authErr) throw authErr;
      const userId = authData.user?.id; if (!userId) throw new Error("User creation failed");
      await new Promise(r => setTimeout(r, 1500));
      await supabase.from("profiles").update({ phone: form.phone, full_name: form.fullName }).eq("id", userId);
      const { data: admData } = await supabase.rpc("generate_admission_number");
      const admNo = admData || "MCA-" + new Date().getFullYear() + "-" + String(Date.now()).slice(-4);
      const { error: stErr } = await supabase.from("students").insert({
        profile_id: userId, course_id: form.courseId, admission_number: admNo,
        gender: form.gender || null, address: form.address || null, date_of_birth: form.dob || null,
        father_name: form.fatherName || null, mother_name: form.motherName || null,
        aadhar_number: form.aadhar || null, category: form.category || null,
        religion: form.religion || null, previous_school: form.previousSchool || null,
        previous_marks: form.previousMarks || null, emergency_contact: form.emergencyContact || null,
        blood_group: form.bloodGroup || null,
        student_photo: photos.student || null, father_photo: photos.father || null, mother_photo: photos.mother || null,
      });
      if (stErr) throw stErr;
      const course = courses.find(c => c.id === form.courseId);
      if (course) { const { data: stData } = await supabase.from("students").select("id").eq("profile_id", userId).single(); if (stData) { await supabase.from("fee_structures").insert({ student_id: stData.id, total_amount: course.total_fee }); await supabase.from("income_records").insert({ category: "admission_fee", amount: 0, description: "Admission - " + admNo, student_id: stData.id, income_date: new Date().toISOString().split("T")[0] }); } }
      setAdmittedData({ admNo, tempPass, form: { ...form }, course, photos: { ...photos }, date: new Date().toLocaleDateString("en-IN") });
      setMsg({ type: "success", text: `✅ Admitted! No: ${admNo} | Pass: ${tempPass}` });
      setForm({ fullName: "", phone: "", email: "", courseId: courses[0]?.id || "", gender: "", address: "", dob: "", fatherName: "", motherName: "", aadhar: "", category: "", religion: "", previousSchool: "", previousMarks: "", emergencyContact: "", bloodGroup: "" });
      setPhotos({ student: "", father: "", mother: "" }); setStep(1);
    } catch (e) { setMsg({ type: "error", text: e.message }); }
    setLoading(false);
  };

  const printAdmission = () => {
    if (!admittedData) return;
    const d = admittedData;
    const w = window.open("", "_blank");
    w.document.write(`<html><head><title>Admission Form - ${d.admNo}</title><style>body{font-family:Arial,sans-serif;padding:20px;color:#1a1a2e}table{width:100%;border-collapse:collapse;margin:10px 0}td,th{border:1px solid #ccc;padding:8px;font-size:13px;text-align:left}.header{text-align:center;border-bottom:3px solid #1a2a6c;padding-bottom:15px;margin-bottom:20px}.logo{font-size:24px;font-weight:bold;color:#1a2a6c}.sub{font-size:12px;color:#666}.photo{width:90px;height:110px;border:1px solid #ccc;object-fit:cover}.section{background:#f0f4f8;padding:8px 12px;font-weight:bold;font-size:14px;color:#1a2a6c;border:1px solid #ccc}@media print{body{padding:10px}}</style></head><body>
    <div class="header"><img src="' + MCA_LOGO + '" style="height:45px;margin-bottom:4px" /><div style="font-size:22px;font-weight:bold;color:#1a5c2e">MY CAREER ACADEMIC</div><div style="font-size:12px;font-weight:bold">A Division of:- MY LIFELINE FOUNDATION</div><div style="font-size:11px;color:#555">Kendrapara Town, Maruti Chhak, Khairabad, Kendrapara, 754211</div><div style="margin-top:8px;font-size:14px;font-weight:bold;text-decoration:underline">ADMISSION FORM</div></div>
    <table><tr><td colspan="3" class="section">ADMISSION DETAILS</td><td rowspan="5" style="text-align:center;width:100px">${d.photos.student ? `<img src="${d.photos.student}" class="photo"/>` : '<div class="photo" style="display:flex;align-items:center;justify-content:center;background:#f5f5f5">Photo</div>'}<br><small>Student</small></td></tr>
    <tr><td><b>Admission No</b></td><td>${d.admNo}</td><td><b>Date</b></td></tr>
    <tr><td><b>Class/Stream</b></td><td>${d.course?.name || ""}</td><td>${d.date}</td></tr>
    <tr><td><b>Total Fee</b></td><td colspan="2">₹${d.course?.total_fee?.toLocaleString() || "0"}</td></tr></table>
    <table><tr><td colspan="4" class="section">PERSONAL INFORMATION</td></tr>
    <tr><td><b>Full Name</b></td><td colspan="3">${d.form.fullName}</td></tr>
    <tr><td><b>Mobile</b></td><td>${d.form.phone}</td><td><b>Email</b></td><td>${d.form.email || "-"}</td></tr>
    <tr><td><b>Gender</b></td><td>${d.form.gender || "-"}</td><td><b>DOB</b></td><td>${d.form.dob || "-"}</td></tr>
    <tr><td><b>Blood Group</b></td><td>${d.form.bloodGroup || "-"}</td><td><b>Aadhar</b></td><td>${d.form.aadhar || "-"}</td></tr>
    <tr><td><b>Address</b></td><td colspan="3">${d.form.address || "-"}</td></tr></table>
    <table><tr><td colspan="2" class="section">FAMILY DETAILS</td><td style="text-align:center;width:100px">${d.photos.father ? `<img src="${d.photos.father}" class="photo" style="width:70px;height:85px"/>` : ""}<br><small>Father</small></td><td style="text-align:center;width:100px">${d.photos.mother ? `<img src="${d.photos.mother}" class="photo" style="width:70px;height:85px"/>` : ""}<br><small>Mother</small></td></tr>
    <tr><td><b>Father's Name</b></td><td>${d.form.fatherName || "-"}</td><td colspan="2"><b>Mother's Name:</b> ${d.form.motherName || "-"}</td></tr>
    <tr><td><b>Category</b></td><td>${d.form.category || "-"}</td><td><b>Religion</b></td><td>${d.form.religion || "-"}</td></tr>
    <tr><td><b>Emergency</b></td><td colspan="3">${d.form.emergencyContact || "-"}</td></tr></table>
    <table><tr><td colspan="4" class="section">PREVIOUS EDUCATION</td></tr>
    <tr><td><b>Previous School</b></td><td>${d.form.previousSchool || "-"}</td><td><b>10th Marks</b></td><td>${d.form.previousMarks || "-"}</td></tr></table>
    <table><tr><td colspan="4" class="section">FEE STRUCTURE</td></tr>
    <tr><td><b>Course Fee</b></td><td>₹${d.course?.total_fee?.toLocaleString() || "0"}</td><td><b>Duration</b></td><td>${d.course?.duration_months || 12} months</td></tr></table>
    <div style="margin-top:40px;display:flex;justify-content:space-between"><div style="text-align:center;border-top:1px solid #333;padding-top:5px;width:150px">Student Signature</div><div style="text-align:center;border-top:1px solid #333;padding-top:5px;width:150px">Parent Signature</div><div style="text-align:center;border-top:1px solid #333;padding-top:5px;width:150px">Admin Signature</div></div>
    <div style="text-align:center;margin-top:30px;font-size:11px;color:#999">This is a computer generated admission form. | My Career Academic</div>
    </body></html>`);
    w.document.close(); w.print();
  };

  const selectedCourse = courses.find(c => c.id === form.courseId);

  return (
    <div><h1 className="page-title">New Admission</h1><p className="page-sub">11th / 12th Class — Arts, Commerce, Science</p>
      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        {[1, 2, 3].map(s => (<div key={s} onClick={() => setStep(s)} style={{ flex: 1, padding: "10px 16px", borderRadius: 8, cursor: "pointer", textAlign: "center", fontSize: 13, fontWeight: 600, background: step === s ? "var(--primary)" : "var(--primary-light)", color: step === s ? "#fff" : "var(--primary)" }}>
          {s === 1 ? "1. Personal Info" : s === 2 ? "2. Class & Stream" : "3. Family & Previous"}</div>))}
      </div>

      <div className="card" style={{ maxWidth: 700 }}>
        {msg.text && <div className={msg.type === "success" ? "success-box" : "error-box"} style={{ whiteSpace: "pre-line" }}>{msg.text}{msg.type === "success" && admittedData && <button className="btn" style={{ marginTop: 8, display: "block" }} onClick={printAdmission}>🖨 Print Admission Form</button>}</div>}

        {step === 1 && (<div>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Personal Information & Photos</h3>
          <div style={{ display: "flex", gap: 16, marginBottom: 20, justifyContent: "center", padding: 16, background: "var(--bg)", borderRadius: 8 }}>
            <PhotoUpload label="Student Photo" value={photos.student} onChange={v => setPhotos({ ...photos, student: v })} />
            <PhotoUpload label="Father Photo" value={photos.father} onChange={v => setPhotos({ ...photos, father: v })} />
            <PhotoUpload label="Mother Photo" value={photos.mother} onChange={v => setPhotos({ ...photos, mother: v })} />
          </div>
          <div className="grid-2">
            <div className="form-group"><label className="label">Full Name *</label><input className="input" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} placeholder="Student full name" /></div>
            <div className="form-group"><label className="label">Mobile Number *</label><input className="input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="9876543210" /></div>
          </div>
          <div className="grid-3">
            <div className="form-group"><label className="label">Gender</label><select className="select" value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}><option value="">Select</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></select></div>
            <div className="form-group"><label className="label">Date of Birth</label><input className="input" type="date" value={form.dob} onChange={e => setForm({ ...form, dob: e.target.value })} /></div>
            <div className="form-group"><label className="label">Blood Group</label><select className="select" value={form.bloodGroup} onChange={e => setForm({ ...form, bloodGroup: e.target.value })}><option value="">Select</option>{["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(bg => <option key={bg} value={bg}>{bg}</option>)}</select></div>
          </div>
          <div className="grid-2">
            <div className="form-group"><label className="label">Email (optional)</label><input className="input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="student@email.com" /></div>
            <div className="form-group"><label className="label">Aadhar Number</label><input className="input" value={form.aadhar} onChange={e => setForm({ ...form, aadhar: e.target.value })} placeholder="1234 5678 9012" /></div>
          </div>
          <div className="form-group"><label className="label">Address</label><input className="input" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Village/Town, District, State" /></div>
          <button className="btn" style={{ marginTop: 8 }} onClick={() => { if (!form.fullName || !form.phone) { setMsg({ type: "error", text: "Name and phone required!" }); return; } setMsg({ type: "", text: "" }); setStep(2); }}>Next → Class & Stream</button>
        </div>)}

        {step === 2 && (<div>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Select Class & Stream</h3>
          {groupedCourses.map(group => group.items.length > 0 && (
            <div key={group.label} style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: group.color, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>{group.label} Stream</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {group.items.map(c => (
                  <div key={c.id} onClick={() => setForm({ ...form, courseId: c.id })} style={{ padding: "12px 20px", borderRadius: 8, cursor: "pointer", border: form.courseId === c.id ? `2px solid ${group.color}` : "1px solid var(--border)", background: form.courseId === c.id ? (group.color === "var(--primary)" ? "var(--primary-light)" : group.color === "var(--warning)" ? "var(--warning-light)" : "var(--success-light)") : "white", fontWeight: form.courseId === c.id ? 700 : 400, fontSize: 14, transition: "all 0.15s" }}>
                    {c.name} <span style={{ fontSize: 12, color: "var(--muted)" }}>₹{c.total_fee?.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {selectedCourse && <div style={{ marginTop: 12, padding: 12, background: "var(--primary-light)", borderRadius: 8, fontSize: 13 }}>Selected: <strong>{selectedCourse.name}</strong> — Fee: ₹{selectedCourse.total_fee?.toLocaleString()} {selectedCourse.description ? `(${selectedCourse.description})` : ""}</div>}
          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            <button className="btn-outline" onClick={() => setStep(1)}>← Back</button>
            <button className="btn" onClick={() => setStep(3)}>Next → Family Details</button>
          </div>
        </div>)}

        {step === 3 && (<div>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Family & Previous School</h3>
          <div className="grid-2">
            <div className="form-group"><label className="label">Father&apos;s Name</label><input className="input" value={form.fatherName} onChange={e => setForm({ ...form, fatherName: e.target.value })} placeholder="Father's full name" /></div>
            <div className="form-group"><label className="label">Mother&apos;s Name</label><input className="input" value={form.motherName} onChange={e => setForm({ ...form, motherName: e.target.value })} placeholder="Mother's full name" /></div>
          </div>
          <div className="grid-3">
            <div className="form-group"><label className="label">Category</label><select className="select" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}><option value="">Select</option><option value="General">General</option><option value="OBC">OBC</option><option value="SC">SC</option><option value="ST">ST</option><option value="EWS">EWS</option></select></div>
            <div className="form-group"><label className="label">Religion</label><select className="select" value={form.religion} onChange={e => setForm({ ...form, religion: e.target.value })}><option value="">Select</option><option value="Hindu">Hindu</option><option value="Muslim">Muslim</option><option value="Christian">Christian</option><option value="Sikh">Sikh</option><option value="Buddhist">Buddhist</option><option value="Jain">Jain</option><option value="Other">Other</option></select></div>
            <div className="form-group"><label className="label">Emergency Contact</label><input className="input" value={form.emergencyContact} onChange={e => setForm({ ...form, emergencyContact: e.target.value })} placeholder="Phone number" /></div>
          </div>
          <div className="grid-2">
            <div className="form-group"><label className="label">Previous School/College</label><input className="input" value={form.previousSchool} onChange={e => setForm({ ...form, previousSchool: e.target.value })} placeholder="Last attended school" /></div>
            <div className="form-group"><label className="label">10th Marks / Percentage</label><input className="input" value={form.previousMarks} onChange={e => setForm({ ...form, previousMarks: e.target.value })} placeholder="85% or 425/500" /></div>
          </div>

          <div style={{ marginTop: 16, padding: 16, background: "var(--bg)", borderRadius: 8, fontSize: 13 }}>
            <strong>Summary:</strong> {form.fullName} | {form.phone} | {selectedCourse?.name || "Not selected"} | Fee: ₹{selectedCourse?.total_fee?.toLocaleString() || "0"} {form.fatherName ? `| Father: ${form.fatherName}` : ""} {form.previousMarks ? `| 10th: ${form.previousMarks}` : ""}
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            <button className="btn-outline" onClick={() => setStep(2)}>← Back</button>
            <button className="btn btn-success" style={{ flex: 1, padding: 14, fontSize: 15 }} onClick={submit} disabled={loading}>{loading ? "Admitting Student..." : "✓ Complete Admission"}</button>
          </div>
        </div>)}
      </div>
    </div>
  );
}

// ========== COURSES ==========
function CoursesTab() {
  const [courses, setCourses] = useState([]); const [showForm, setShowForm] = useState(false); const [form, setForm] = useState({ name: "", description: "", duration: "", fee: "" }); const [editId, setEditId] = useState(null);
  const [subjects, setSubjects] = useState({}); const [newSubject, setNewSubject] = useState({}); const [chapters, setChapters] = useState({}); const [newChapter, setNewChapter] = useState({}); const [expanded, setExpanded] = useState(null);
  const loadCourses = async () => { const { data } = await supabase.from("courses").select("*").order("created_at", { ascending: false }); setCourses(data || []); };
  useEffect(() => { loadCourses(); }, []);
  const loadSubjects = async (cid) => { const { data } = await supabase.from("subjects").select("*").eq("course_id", cid).order("created_at"); setSubjects(p => ({ ...p, [cid]: data || [] })); for (const s of (data || [])) { const { data: ch } = await supabase.from("chapters").select("*").eq("subject_id", s.id).order("sort_order"); setChapters(p => ({ ...p, [s.id]: ch || [] })); } };
  const toggleExpand = (id) => { if (expanded === id) { setExpanded(null); return; } setExpanded(id); loadSubjects(id); };
  const saveCourse = async () => { if (!form.name || !form.fee) return; if (editId) { await supabase.from("courses").update({ name: form.name, description: form.description || null, duration_months: form.duration ? Number(form.duration) : null, total_fee: Number(form.fee) }).eq("id", editId); } else { await supabase.from("courses").insert({ name: form.name, description: form.description || null, duration_months: form.duration ? Number(form.duration) : null, total_fee: Number(form.fee) }); } setForm({ name: "", description: "", duration: "", fee: "" }); setEditId(null); setShowForm(false); loadCourses(); };
  const editCourse = (c) => { setForm({ name: c.name, description: c.description || "", duration: c.duration_months?.toString() || "", fee: c.total_fee?.toString() || "" }); setEditId(c.id); setShowForm(true); };
  const toggleCourse = async (c) => { await supabase.from("courses").update({ is_active: !c.is_active }).eq("id", c.id); loadCourses(); };
  const addSubject = async (cid) => { if (!newSubject[cid]) return; await supabase.from("subjects").insert({ name: newSubject[cid], course_id: cid }); setNewSubject(p => ({ ...p, [cid]: "" })); loadSubjects(cid); };
  const deleteSubject = async (sid, cid) => { await supabase.from("subjects").delete().eq("id", sid); loadSubjects(cid); };
  const addChapter = async (sid, cid) => { if (!newChapter[sid]) return; const ex = chapters[sid] || []; await supabase.from("chapters").insert({ name: newChapter[sid], subject_id: sid, sort_order: ex.length + 1 }); setNewChapter(p => ({ ...p, [sid]: "" })); loadSubjects(cid); };
  const deleteChapter = async (chid, cid) => { await supabase.from("chapters").delete().eq("id", chid); loadSubjects(cid); };
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}><div><h1 className="page-title">Courses</h1><p className="page-sub" style={{ marginBottom: 0 }}>{courses.length} courses</p></div><button className="btn btn-accent" onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ name: "", description: "", duration: "", fee: "" }); }}>+ Add course</button></div>
      {showForm && (<div className="card" style={{ marginBottom: 20, borderColor: "var(--accent)" }}><div className="grid-2"><div><label className="label">Name *</label><input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div><div><label className="label">Fee (₹) *</label><input className="input" type="number" value={form.fee} onChange={e => setForm({ ...form, fee: e.target.value })} /></div></div><div className="grid-2" style={{ marginTop: 12 }}><div><label className="label">Duration (months)</label><input className="input" type="number" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} /></div><div><label className="label">Description</label><input className="input" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div></div><div style={{ display: "flex", gap: 8, marginTop: 14 }}><button className="btn btn-success" onClick={saveCourse}>{editId ? "Update" : "Create"}</button><button className="btn-outline" onClick={() => setShowForm(false)}>Cancel</button></div></div>)}
      {courses.map(c => (<div key={c.id} className="card" style={{ marginBottom: 12, opacity: c.is_active ? 1 : 0.6 }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><div style={{ cursor: "pointer", flex: 1 }} onClick={() => toggleExpand(c.id)}><div style={{ display: "flex", alignItems: "center", gap: 10 }}><span style={{ fontWeight: 700, fontSize: 15 }}>{c.name}</span><span className={`badge ${c.is_active ? "badge-success" : "badge-muted"}`}>{c.is_active ? "Active" : "Inactive"}</span></div><div style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>₹{c.total_fee} | {c.duration_months || "-"} months</div></div><div style={{ display: "flex", gap: 6 }}><button className="btn-outline" style={{ fontSize: 12, padding: "6px 12px" }} onClick={() => editCourse(c)}>Edit</button><button className="btn-outline" style={{ fontSize: 12, padding: "6px 12px" }} onClick={() => toggleCourse(c)}>{c.is_active ? "Disable" : "Enable"}</button><button className="btn-outline" style={{ fontSize: 12, padding: "6px 12px" }} onClick={() => toggleExpand(c.id)}>{expanded === c.id ? "▲" : "▼"}</button></div></div>
        {expanded === c.id && (<div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border)" }}><h4 style={{ fontSize: 13, fontWeight: 700, color: "var(--muted)", marginBottom: 12 }}>Subjects & Chapters</h4>{(subjects[c.id] || []).map(sub => (<div key={sub.id} style={{ marginBottom: 16, padding: 12, background: "var(--bg)", borderRadius: 8 }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}><span style={{ fontWeight: 600 }}>{sub.name}</span><button style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer", fontSize: 12 }} onClick={() => deleteSubject(sub.id, c.id)}>Delete</button></div>{(chapters[sub.id] || []).map((ch, i) => (<div key={ch.id} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0 4px 16px", fontSize: 13 }}><span>{i + 1}. {ch.name}</span><button style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer", fontSize: 11 }} onClick={() => deleteChapter(ch.id, c.id)}>x</button></div>))}<div style={{ display: "flex", gap: 8, marginTop: 8, paddingLeft: 16 }}><input className="input" style={{ flex: 1, padding: "6px 10px", fontSize: 12 }} placeholder="New chapter" value={newChapter[sub.id] || ""} onChange={e => setNewChapter(p => ({ ...p, [sub.id]: e.target.value }))} onKeyDown={e => e.key === "Enter" && addChapter(sub.id, c.id)} /><button className="btn" style={{ fontSize: 11, padding: "6px 12px" }} onClick={() => addChapter(sub.id, c.id)}>+</button></div></div>))}<div style={{ display: "flex", gap: 8, marginTop: 8 }}><input className="input" style={{ flex: 1, padding: "8px 10px", fontSize: 13 }} placeholder="New subject" value={newSubject[c.id] || ""} onChange={e => setNewSubject(p => ({ ...p, [c.id]: e.target.value }))} onKeyDown={e => e.key === "Enter" && addSubject(c.id)} /><button className="btn btn-accent" style={{ fontSize: 12, padding: "8px 16px" }} onClick={() => addSubject(c.id)}>+ Subject</button></div></div>)}
      </div>))}
    </div>
  );
}

// ========== TIMETABLE (NEW) ==========
function TimetableTab({ profile }) {
  const [courses, setCourses] = useState([]); const [selCourse, setSelCourse] = useState(""); const [subjects, setSubjects] = useState([]); const [staffList, setStaffList] = useState([]);
  const [schedules, setSchedules] = useState([]); const [showForm, setShowForm] = useState(false); const [selDay, setSelDay] = useState(new Date().getDay());
  const [form, setForm] = useState({ subjectId: "", teacherId: "", startTime: "", endTime: "", room: "", dayOfWeek: "" });
  const isAdmin = profile?.role === "admin";
  const load = useCallback(async () => { if (!selCourse) return; const { data } = await supabase.from("class_schedules").select("*, subjects(name), staff!inner(profiles!inner(full_name))").eq("course_id", selCourse).order("start_time"); setSchedules(data || []); }, [selCourse]);
  useEffect(() => { supabase.from("courses").select("*").eq("is_active", true).then(({ data }) => { setCourses(data || []); if (data?.length) setSelCourse(data[0].id); }); }, []);
  useEffect(() => { load(); }, [selCourse, load]);
  useEffect(() => { if (selCourse) { supabase.from("subjects").select("*").eq("course_id", selCourse).then(({ data }) => setSubjects(data || [])); supabase.from("staff").select("*, profiles!inner(full_name)").then(({ data }) => setStaffList(data || [])); } }, [selCourse]);
  const addSchedule = async () => {
    if (!form.subjectId || !form.teacherId || !form.startTime || !form.endTime || form.dayOfWeek === "") return;
    await supabase.from("class_schedules").insert({ course_id: selCourse, subject_id: form.subjectId, teacher_id: form.teacherId, day_of_week: Number(form.dayOfWeek), start_time: form.startTime, end_time: form.endTime, room: form.room || null });
    setForm({ subjectId: "", teacherId: "", startTime: "", endTime: "", room: "", dayOfWeek: "" }); setShowForm(false); load();
  };
  const deleteSchedule = async (id) => { await supabase.from("class_schedules").delete().eq("id", id); load(); };
  const generateToday = async () => {
    const today = new Date().toISOString().split("T")[0];
    const dow = new Date().getDay();
    const todaySchedules = schedules.filter(s => s.day_of_week === dow);
    if (todaySchedules.length === 0) { alert("No classes scheduled for today (" + DAYS[dow] + ")"); return; }
    const { data: existing } = await supabase.from("live_classes").select("id").eq("class_date", today).eq("course_id", selCourse);
    if (existing && existing.length > 0) { alert("Today's classes already generated!"); return; }
    for (const s of todaySchedules) {
      await supabase.from("live_classes").insert({ schedule_id: s.id, course_id: selCourse, subject_id: s.subject_id, teacher_id: s.teacher_id, class_date: today, start_time: s.start_time, end_time: s.end_time, room: s.room, status: "scheduled" });
    }
    alert(`${todaySchedules.length} classes generated for today!`);
  };
  const daySchedules = schedules.filter(s => s.day_of_week === selDay);
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div><h1 className="page-title">Weekly timetable</h1><p className="page-sub" style={{ marginBottom: 0 }}>Manage recurring schedule</p></div>
        <div style={{ display: "flex", gap: 8 }}>
          {courses.map(c => <button key={c.id} className={`tag ${selCourse === c.id ? "active" : ""}`} onClick={() => setSelCourse(c.id)}>{c.name}</button>)}
        </div>
      </div>
      <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
        {DAYS.map((d, i) => <button key={i} className={`tag ${selDay === i ? "active" : ""}`} onClick={() => setSelDay(i)}>{DAYS_SHORT[i]}</button>)}
        {isAdmin && <button className="btn btn-accent" style={{ marginLeft: "auto" }} onClick={() => { setShowForm(!showForm); setForm({ ...form, dayOfWeek: selDay.toString() }); }}>+ Add slot</button>}
        {isAdmin && <button className="btn" onClick={generateToday}>Generate today</button>}
      </div>
      {showForm && (
        <div className="card" style={{ marginBottom: 16, borderColor: "var(--accent)" }}>
          <div className="grid-3">
            <div><label className="label">Day</label><select className="select" value={form.dayOfWeek} onChange={e => setForm({ ...form, dayOfWeek: e.target.value })}><option value="">Select</option>{DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}</select></div>
            <div><label className="label">Subject</label><select className="select" value={form.subjectId} onChange={e => setForm({ ...form, subjectId: e.target.value })}><option value="">Select</option>{subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
            <div><label className="label">Teacher</label><select className="select" value={form.teacherId} onChange={e => setForm({ ...form, teacherId: e.target.value })}><option value="">Select</option>{staffList.map(s => <option key={s.id} value={s.id}>{s.profiles?.full_name}</option>)}</select></div>
          </div>
          <div className="grid-3" style={{ marginTop: 12 }}>
            <div><label className="label">Start</label><input className="input" type="time" value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} /></div>
            <div><label className="label">End</label><input className="input" type="time" value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })} /></div>
            <div><label className="label">Room</label><input className="input" value={form.room} onChange={e => setForm({ ...form, room: e.target.value })} placeholder="Room 1" /></div>
          </div>
          <button className="btn btn-success" style={{ marginTop: 12 }} onClick={addSchedule}>Save slot</button>
        </div>
      )}
      <div className="card">
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>{DAYS[selDay]} schedule</h3>
        {daySchedules.length === 0 ? <p className="empty-state">No classes on {DAYS[selDay]}.</p> : (
          <table><thead><tr><th>Time</th><th>Subject</th><th>Teacher</th><th>Room</th>{isAdmin && <th></th>}</tr></thead>
          <tbody>{daySchedules.map(s => (
            <tr key={s.id}><td style={{ fontWeight: 600 }}>{s.start_time?.slice(0, 5)} - {s.end_time?.slice(0, 5)}</td><td><span className="badge badge-primary">{s.subjects?.name}</span></td><td>{s.staff?.profiles?.full_name}</td><td>{s.room || "-"}</td>{isAdmin && <td><button style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer", fontSize: 12, fontWeight: 600 }} onClick={() => deleteSchedule(s.id)}>Delete</button></td>}</tr>
          ))}</tbody></table>
        )}
      </div>
    </div>
  );
}

// ========== LIVE CLASSES ==========
function LiveClassesTab({ profile }) {
  const [classes, setClasses] = useState([]); const [courses, setCourses] = useState([]); const [selCourse, setSelCourse] = useState("");
  const [showForm, setShowForm] = useState(false); const [form, setForm] = useState({ subjectId: "", teacherId: "", startTime: "", endTime: "", topic: "" });
  const [subjects, setSubjects] = useState([]); const [staffList, setStaffList] = useState([]);
  const isStaff = ["admin", "staff", "teacher"].includes(profile?.role); const today = new Date().toISOString().split("T")[0];
  const load = useCallback(async () => { let q = supabase.from("live_classes").select("*, subjects(name), staff!inner(id, profiles!inner(full_name))").eq("class_date", today); if (selCourse) q = q.eq("course_id", selCourse); const { data } = await q.order("start_time"); setClasses(data || []); }, [selCourse, today]);
  useEffect(() => { supabase.from("courses").select("*").eq("is_active", true).then(({ data }) => { setCourses(data || []); if (data?.length) setSelCourse(data[0].id); }); }, []);
  useEffect(() => { if (selCourse) load(); }, [selCourse, load]);
  useEffect(() => { if (selCourse) { supabase.from("subjects").select("*").eq("course_id", selCourse).then(({ data }) => setSubjects(data || [])); supabase.from("staff").select("*, profiles!inner(full_name)").then(({ data }) => setStaffList(data || [])); } }, [selCourse]);
  const updateStatus = async (id, st) => { await supabase.from("live_classes").update({ status: st }).eq("id", id); load(); };
  const addClass = async () => { if (!form.subjectId || !form.teacherId || !form.startTime || !form.endTime) return; await supabase.from("live_classes").insert({ course_id: selCourse, subject_id: form.subjectId, teacher_id: form.teacherId, class_date: today, start_time: form.startTime, end_time: form.endTime, topic: form.topic || null, status: "scheduled" }); setShowForm(false); setForm({ subjectId: "", teacherId: "", startTime: "", endTime: "", topic: "" }); load(); };
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}><div><h1 className="page-title">Today&apos;s classes</h1><p style={{ fontSize: 13, color: "var(--muted)" }}>{today}</p></div><div style={{ display: "flex", gap: 8 }}>{courses.map(c => <button key={c.id} className={`tag ${selCourse === c.id ? "active" : ""}`} onClick={() => setSelCourse(c.id)}>{c.name}</button>)}{isStaff && <button className="btn btn-accent" onClick={() => setShowForm(!showForm)}>+ Add</button>}</div></div>
      {showForm && (<div className="card" style={{ marginBottom: 20, borderColor: "var(--accent)" }}><div className="grid-3"><div><label className="label">Subject</label><select className="select" value={form.subjectId} onChange={e => setForm({ ...form, subjectId: e.target.value })}><option value="">Select</option>{subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div><div><label className="label">Teacher</label><select className="select" value={form.teacherId} onChange={e => setForm({ ...form, teacherId: e.target.value })}><option value="">Select</option>{staffList.map(s => <option key={s.id} value={s.id}>{s.profiles?.full_name}</option>)}</select></div><div><label className="label">Topic</label><input className="input" value={form.topic} onChange={e => setForm({ ...form, topic: e.target.value })} /></div></div><div className="grid-3" style={{ marginTop: 12 }}><div><label className="label">Start</label><input className="input" type="time" value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} /></div><div><label className="label">End</label><input className="input" type="time" value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })} /></div><div style={{ display: "flex", alignItems: "flex-end" }}><button className="btn btn-success" onClick={addClass}>Save</button></div></div></div>)}
      {classes.length === 0 ? <div className="card empty-state">No classes today.</div> : (<div style={{ display: "flex", flexDirection: "column", gap: 12 }}>{classes.map(cl => (<div key={cl.id} className={`card class-card ${cl.status === "live" ? "live" : ""}`}><div style={{ flex: 1 }}><div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}><span style={{ fontWeight: 700, fontSize: 15 }}>{cl.subjects?.name}</span><span className={`badge ${cl.status === "live" ? "badge-danger" : cl.status === "completed" ? "badge-success" : "badge-primary"}`}>{cl.status === "live" ? "LIVE" : cl.status}</span></div><div style={{ fontSize: 13, color: "var(--muted)" }}>{cl.start_time?.slice(0, 5)}-{cl.end_time?.slice(0, 5)} | {cl.staff?.profiles?.full_name} {cl.topic ? `| ${cl.topic}` : ""}</div></div>{isStaff && <div style={{ display: "flex", gap: 8 }}>{cl.status === "scheduled" && <button className="btn btn-danger" onClick={() => updateStatus(cl.id, "live")}>Go Live</button>}{cl.status === "live" && <button className="btn btn-success" onClick={() => updateStatus(cl.id, "completed")}>Complete</button>}{cl.status === "scheduled" && <button className="btn-outline" onClick={() => updateStatus(cl.id, "cancelled")}>Cancel</button>}</div>}</div>))}</div>)}
    </div>
  );
}

// ========== ATTENDANCE ==========
function AttendanceTab() {
  const [classes, setClasses] = useState([]); const [selClass, setSelClass] = useState(null); const [students, setStudents] = useState([]); const [att, setAtt] = useState({}); const [saving, setSaving] = useState(false); const [saved, setSaved] = useState(false);
  const today = new Date().toISOString().split("T")[0];
  useEffect(() => { supabase.from("live_classes").select("*, subjects(name)").eq("class_date", today).in("status", ["live", "completed"]).then(({ data }) => setClasses(data || [])); }, [today]);
  useEffect(() => { if (!selClass) return; (async () => { const { data: stData } = await supabase.from("students").select("*, profiles!inner(full_name)").eq("course_id", selClass.course_id).eq("status", "active"); setStudents(stData || []); const { data: attData } = await supabase.from("attendance").select("*").eq("live_class_id", selClass.id); const map = {}; (attData || []).forEach(a => { map[a.student_id] = a.status; }); const def = {}; (stData || []).forEach(st => { def[st.id] = map[st.id] || "present"; }); setAtt(def); setSaved(false); })(); }, [selClass]);
  const save = async () => { setSaving(true); const { data: { user } } = await supabase.auth.getUser(); const records = Object.entries(att).map(([sid, status]) => ({ student_id: sid, live_class_id: selClass.id, status, marked_by: user?.id })); await supabase.from("attendance").upsert(records, { onConflict: "student_id,live_class_id" }); setSaving(false); setSaved(true); };
  return (
    <div><h1 className="page-title">Attendance</h1><p className="page-sub">Select a class</p>
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>{classes.length === 0 && <p style={{ color: "var(--muted)", fontSize: 13 }}>No classes today.</p>}{classes.map(cl => <button key={cl.id} className={`tag ${selClass?.id === cl.id ? "active" : ""}`} onClick={() => setSelClass(cl)}>{cl.subjects?.name} ({cl.start_time?.slice(0, 5)})</button>)}</div>
      {selClass && (<div className="card"><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}><h3 style={{ fontSize: 15, fontWeight: 700 }}>{selClass.subjects?.name}</h3><div style={{ display: "flex", gap: 8, alignItems: "center" }}>{saved && <span style={{ color: "var(--success)", fontSize: 13, fontWeight: 600 }}>Saved!</span>}<button className="btn btn-success" onClick={save} disabled={saving}>{saving ? "Saving..." : "Save"}</button></div></div>{students.length === 0 ? <p style={{ color: "var(--muted)" }}>No students.</p> : (<table><thead><tr><th>Student</th><th>Status</th></tr></thead><tbody>{students.map(st => (<tr key={st.id}><td style={{ fontWeight: 600 }}>{st.profiles?.full_name}</td><td><div style={{ display: "flex", gap: 6 }}>{["present", "absent", "late", "excused"].map(status => (<button key={status} className={`att-btn ${att[st.id] === status ? status : ""}`} onClick={() => setAtt({ ...att, [st.id]: status })}>{status}</button>))}</div></td></tr>))}</tbody></table>)}</div>)}
    </div>
  );
}

// ========== FEES ==========
function FeesTab({ profile }) {
  const [students, setStudents] = useState([]); const [selSt, setSelSt] = useState(null); const [fee, setFee] = useState(null); const [payments, setPayments] = useState([]);
  const [showPay, setShowPay] = useState(false); const [payForm, setPayForm] = useState({ amount: "", mode: "cash", notes: "" }); const [saving, setSaving] = useState(false);
  const isAdmin = profile?.role === "admin";
  useEffect(() => { supabase.from("students").select("*, profiles!inner(full_name)").eq("status", "active").order("created_at", { ascending: false }).then(({ data }) => setStudents(data || [])); }, []);
  const loadFee = async (student) => { setSelSt(student); setShowPay(false); const { data: fData } = await supabase.rpc("get_fee_summary", { p_student_id: student.id }); setFee(fData?.[0] || null); const { data: pData } = await supabase.from("fee_payments").select("*").eq("student_id", student.id).order("payment_date", { ascending: false }); setPayments(pData || []); };
  const pay = async () => { if (!payForm.amount || Number(payForm.amount) <= 0) return; setSaving(true); const { data: fs } = await supabase.from("fee_structures").select("id").eq("student_id", selSt.id).single(); if (fs) await supabase.from("fee_payments").insert({ fee_structure_id: fs.id, student_id: selSt.id, amount: Number(payForm.amount), payment_mode: payForm.mode, receipt_number: "RCP-" + Date.now(), installment_number: payments.length + 1, notes: payForm.notes || null }); setPayForm({ amount: "", mode: "cash", notes: "" }); setShowPay(false); setSaving(false); loadFee(selSt); };
  return (
    <div><h1 className="page-title">Fees</h1><p className="page-sub">Track fees</p>
      <div style={{ display: "flex", gap: 20 }}><div style={{ width: 260, flexShrink: 0 }}><div className="card" style={{ maxHeight: 500, overflowY: "auto" }}><h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: "var(--muted)" }}>Students</h3>{students.map(st => <div key={st.id} className={`student-item ${selSt?.id === st.id ? "active" : ""}`} onClick={() => loadFee(st)}>{st.profiles?.full_name}</div>)}</div></div>
        <div style={{ flex: 1 }}>{!selSt ? <div className="card empty-state">Select a student</div> : (<div>{fee && <div className="grid-3" style={{ marginBottom: 20 }}><StatCard title="Total" value={`₹${fee.total_fee || 0}`} variant="primary" /><StatCard title="Paid" value={`₹${fee.total_paid || 0}`} variant="success" /><StatCard title="Pending" value={`₹${fee.pending || 0}`} variant={fee.pending > 0 ? "danger" : "success"} /></div>}
          <div className="card"><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}><h3 style={{ fontSize: 15, fontWeight: 700 }}>Payments</h3>{isAdmin && <button className="btn btn-success" onClick={() => setShowPay(!showPay)}>+ Record</button>}</div>
            {showPay && (<div style={{ background: "var(--success-light)", padding: 16, borderRadius: 8, marginBottom: 16 }}><div className="grid-3"><div><label className="label">Amount</label><input className="input" type="number" value={payForm.amount} onChange={e => setPayForm({ ...payForm, amount: e.target.value })} /></div><div><label className="label">Mode</label><select className="select" value={payForm.mode} onChange={e => setPayForm({ ...payForm, mode: e.target.value })}><option value="cash">Cash</option><option value="upi">UPI</option><option value="bank_transfer">Bank</option><option value="cheque">Cheque</option><option value="online">Online</option></select></div><div><label className="label">Notes</label><input className="input" value={payForm.notes} onChange={e => setPayForm({ ...payForm, notes: e.target.value })} /></div></div><button className="btn btn-success" style={{ marginTop: 12 }} onClick={pay} disabled={saving}>{saving ? "..." : "Save"}</button></div>)}
            {payments.length === 0 ? <p style={{ color: "var(--muted)", fontSize: 13 }}>No payments.</p> : (<table><thead><tr><th>Date</th><th>Amount</th><th>Mode</th><th>Receipt</th></tr></thead><tbody>{payments.map(p => (<tr key={p.id}><td>{new Date(p.payment_date).toLocaleDateString("en-IN")}</td><td style={{ fontWeight: 700, color: "var(--success)" }}>₹{p.amount}</td><td><span className="badge badge-primary">{p.payment_mode}</span></td><td style={{ fontSize: 12, color: "var(--muted)" }}>{p.receipt_number}</td></tr>))}</tbody></table>)}</div></div>)}</div></div>
    </div>
  );
}

// ========== TESTS + MARKS ==========
function TestsTab() {
  const [tests, setTests] = useState([]); const [courses, setCourses] = useState([]); const [subjects, setSubjects] = useState([]); const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", courseId: "", subjectId: "", totalMarks: "", testDate: "" });
  const [marksTest, setMarksTest] = useState(null); const [students, setStudents] = useState([]); const [marks, setMarks] = useState({}); const [savingMarks, setSavingMarks] = useState(false); const [marksSaved, setMarksSaved] = useState(false);
  const loadTests = async () => { const { data } = await supabase.from("tests").select("*, courses(name), subjects(name)").order("test_date", { ascending: false }); setTests(data || []); };
  useEffect(() => { loadTests(); supabase.from("courses").select("*").eq("is_active", true).then(({ data }) => setCourses(data || [])); }, []);
  useEffect(() => { if (form.courseId) supabase.from("subjects").select("*").eq("course_id", form.courseId).then(({ data }) => setSubjects(data || [])); }, [form.courseId]);
  const add = async () => { if (!form.name || !form.courseId || !form.subjectId || !form.totalMarks || !form.testDate) return; await supabase.from("tests").insert({ name: form.name, course_id: form.courseId, subject_id: form.subjectId, total_marks: Number(form.totalMarks), test_date: form.testDate }); setShowForm(false); setForm({ name: "", courseId: "", subjectId: "", totalMarks: "", testDate: "" }); loadTests(); };
  const openMarks = async (test) => { setMarksTest(test); setMarksSaved(false); const { data: stData } = await supabase.from("students").select("*, profiles!inner(full_name)").eq("course_id", test.course_id).eq("status", "active"); setStudents(stData || []); const { data: ex } = await supabase.from("test_results").select("*").eq("test_id", test.id); const map = {}; (ex || []).forEach(r => { map[r.student_id] = r.marks_obtained?.toString() || ""; }); (stData || []).forEach(st => { if (!(st.id in map)) map[st.id] = ""; }); setMarks(map); };
  const saveMarks = async () => { setSavingMarks(true); const records = Object.entries(marks).filter(([, v]) => v !== "").map(([sid, val]) => ({ test_id: marksTest.id, student_id: sid, marks_obtained: Number(val) })); if (records.length > 0) await supabase.from("test_results").upsert(records, { onConflict: "test_id,student_id" }); setSavingMarks(false); setMarksSaved(true); };
  const deleteTest = async (id) => { await supabase.from("test_results").delete().eq("test_id", id); await supabase.from("tests").delete().eq("id", id); loadTests(); if (marksTest?.id === id) setMarksTest(null); };
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}><div><h1 className="page-title">Tests & marks</h1><p style={{ fontSize: 13, color: "var(--muted)" }}>{tests.length} tests</p></div><button className="btn btn-accent" onClick={() => setShowForm(!showForm)}>+ Create test</button></div>
      {showForm && (<div className="card" style={{ marginBottom: 20, borderColor: "var(--accent)" }}><div className="grid-3"><div><label className="label">Name</label><input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div><div><label className="label">Course</label><select className="select" value={form.courseId} onChange={e => setForm({ ...form, courseId: e.target.value, subjectId: "" })}><option value="">Select</option>{courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div><div><label className="label">Subject</label><select className="select" value={form.subjectId} onChange={e => setForm({ ...form, subjectId: e.target.value })}><option value="">Select</option>{subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div></div><div className="grid-3" style={{ marginTop: 12 }}><div><label className="label">Total marks</label><input className="input" type="number" value={form.totalMarks} onChange={e => setForm({ ...form, totalMarks: e.target.value })} /></div><div><label className="label">Date</label><input className="input" type="date" value={form.testDate} onChange={e => setForm({ ...form, testDate: e.target.value })} /></div><div style={{ display: "flex", alignItems: "flex-end" }}><button className="btn btn-success" onClick={add}>Save</button></div></div></div>)}
      <div style={{ display: "flex", gap: 20 }}>
        <div style={{ width: 340, flexShrink: 0 }}><div className="card">{tests.length === 0 ? <p className="empty-state">No tests.</p> : tests.map(t => (<div key={t.id} style={{ padding: "10px 0", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}><div style={{ cursor: "pointer" }} onClick={() => openMarks(t)}><div style={{ fontWeight: 600, fontSize: 13.5 }}>{t.name}</div><div style={{ fontSize: 12, color: "var(--muted)" }}>{t.courses?.name} | {t.subjects?.name} | {t.total_marks}m</div></div><div style={{ display: "flex", gap: 6 }}><button className="btn" style={{ fontSize: 11, padding: "4px 10px" }} onClick={() => openMarks(t)}>Marks</button><button style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer", fontSize: 11 }} onClick={() => deleteTest(t.id)}>Del</button></div></div>))}</div></div>
        <div style={{ flex: 1 }}>{!marksTest ? <div className="card empty-state">Select a test</div> : (<div className="card"><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}><div><h3 style={{ fontSize: 15, fontWeight: 700 }}>{marksTest.name}</h3><p style={{ fontSize: 12, color: "var(--muted)" }}>Total: {marksTest.total_marks} | {marksTest.subjects?.name}</p></div><div style={{ display: "flex", gap: 8, alignItems: "center" }}>{marksSaved && <span style={{ color: "var(--success)", fontSize: 13, fontWeight: 600 }}>Saved!</span>}<button className="btn btn-success" onClick={saveMarks} disabled={savingMarks}>{savingMarks ? "..." : "Save marks"}</button></div></div>{students.length === 0 ? <p style={{ color: "var(--muted)" }}>No students.</p> : (<table><thead><tr><th>Student</th><th style={{ width: 120 }}>Marks</th><th style={{ width: 80 }}>%</th></tr></thead><tbody>{students.map(st => { const val = marks[st.id] || ""; const pct = val ? Math.round((Number(val) / marksTest.total_marks) * 100) : null; return (<tr key={st.id}><td style={{ fontWeight: 600 }}>{st.profiles?.full_name}</td><td><input className="input" type="number" min="0" max={marksTest.total_marks} style={{ width: 100, padding: "6px 10px", fontSize: 13 }} value={val} onChange={e => setMarks({ ...marks, [st.id]: e.target.value })} /></td><td>{pct !== null ? <span className={`badge ${pct >= 40 ? "badge-success" : "badge-danger"}`}>{pct}%</span> : "-"}</td></tr>); })}</tbody></table>)}</div>)}</div>
      </div>
    </div>
  );
}

// ========== ACCOUNTS / FINANCE (MyGate Style) ==========
function AccountsTab() {
  const [view, setView] = useState("overview");
  const [incomes, setIncomes] = useState([]); const [expenses, setExpenses] = useState([]); const [salaries, setSalaries] = useState([]);
  const [showIncForm, setShowIncForm] = useState(false); const [showExpForm, setShowExpForm] = useState(false); const [showSalForm, setShowSalForm] = useState(false);
  const [incForm, setIncForm] = useState({ category: "tuition_fee", amount: "", description: "", paymentMode: "cash", incomeDate: new Date().toISOString().split("T")[0] });
  const [expForm, setExpForm] = useState({ category: "salary", amount: "", description: "", paidTo: "", paymentMode: "cash", expenseDate: new Date().toISOString().split("T")[0] });
  const [salForm, setSalForm] = useState({ staffId: "", amount: "", month: "", deductions: "0", bonus: "0", paymentMode: "bank_transfer" });
  const [staffList, setStaffList] = useState([]); const [dateFilter, setDateFilter] = useState("all");
  const [msg, setMsg] = useState("");

  const loadData = async () => {
    const { data: inc } = await supabase.from("income_records").select("*").order("income_date", { ascending: false }).limit(100);
    setIncomes(inc || []);
    const { data: exp } = await supabase.from("expense_records").select("*").order("expense_date", { ascending: false }).limit(100);
    setExpenses(exp || []);
    const { data: sal } = await supabase.from("salary_records").select("*, staff!inner(profiles!inner(full_name))").order("payment_date", { ascending: false }).limit(50);
    setSalaries(sal || []);
  };
  useEffect(() => { loadData(); supabase.from("staff").select("*, profiles!inner(full_name)").then(({ data }) => setStaffList(data || [])); }, []);

  const totalIncome = incomes.reduce((a, i) => a + Number(i.amount || 0), 0);
  const totalExpense = expenses.reduce((a, e) => a + Number(e.amount || 0), 0);
  const totalSalary = salaries.reduce((a, s) => a + Number(s.net_amount || s.amount || 0), 0);
  const profit = totalIncome - totalExpense - totalSalary;

  const addIncome = async () => {
    if (!incForm.amount) return;
    await supabase.from("income_records").insert({ category: incForm.category, amount: Number(incForm.amount), description: incForm.description || null, payment_mode: incForm.paymentMode, income_date: incForm.incomeDate, receipt_number: "INC-" + Date.now() });
    setIncForm({ category: "tuition_fee", amount: "", description: "", paymentMode: "cash", incomeDate: new Date().toISOString().split("T")[0] }); setShowIncForm(false); loadData(); setMsg("Income recorded!");
  };

  const addExpense = async () => {
    if (!expForm.amount) return;
    await supabase.from("expense_records").insert({ category: expForm.category, amount: Number(expForm.amount), description: expForm.description || null, paid_to: expForm.paidTo || null, payment_mode: expForm.paymentMode, expense_date: expForm.expenseDate, bill_number: "EXP-" + Date.now() });
    setExpForm({ category: "salary", amount: "", description: "", paidTo: "", paymentMode: "cash", expenseDate: new Date().toISOString().split("T")[0] }); setShowExpForm(false); loadData(); setMsg("Expense recorded!");
  };

  const addSalary = async () => {
    if (!salForm.staffId || !salForm.amount || !salForm.month) return;
    const net = Number(salForm.amount) - Number(salForm.deductions || 0) + Number(salForm.bonus || 0);
    await supabase.from("salary_records").insert({ staff_id: salForm.staffId, amount: Number(salForm.amount), month: salForm.month, deductions: Number(salForm.deductions || 0), bonus: Number(salForm.bonus || 0), net_amount: net, payment_mode: salForm.paymentMode });
    await supabase.from("expense_records").insert({ category: "salary", amount: net, description: "Salary - " + salForm.month, paid_to: staffList.find(s => s.id === salForm.staffId)?.profiles?.full_name || "", payment_mode: salForm.paymentMode, expense_date: new Date().toISOString().split("T")[0] });
    setSalForm({ staffId: "", amount: "", month: "", deductions: "0", bonus: "0", paymentMode: "bank_transfer" }); setShowSalForm(false); loadData(); setMsg("Salary paid!");
  };

  const incCats = { tuition_fee: "Tuition Fee", hostel_fee: "Hostel Fee", admission_fee: "Admission Fee", exam_fee: "Exam Fee", late_fee: "Late Fee", donation: "Donation", other_income: "Other" };
  const expCats = { salary: "Salary", electricity: "Electricity", water: "Water", rent: "Rent", maintenance: "Maintenance", stationery: "Stationery", internet: "Internet", furniture: "Furniture", transport: "Transport", food: "Food/Canteen", events: "Events", marketing: "Marketing", taxes: "Taxes", insurance: "Insurance", other_expense: "Other" };

  const receiptCSS = `body{font-family:Arial,sans-serif;padding:20px;max-width:550px;margin:0 auto;color:#000}table{width:100%;border-collapse:collapse}td,th{padding:6px 10px;font-size:13px;border:1px solid #333;text-align:left}.header{text-align:center;padding-bottom:12px;border-bottom:3px solid #1a5c2e;margin-bottom:12px}.logo-img{height:45px;margin-bottom:4px}.inst-name{font-size:22px;font-weight:bold;color:#1a5c2e}.division{font-size:13px;font-weight:bold}.addr{font-size:11px;color:#555}.title{text-align:center;font-size:16px;font-weight:bold;text-decoration:underline;margin:10px 0}.row{display:flex;justify-content:space-between;font-size:13px;margin:4px 0}.dotted{border-bottom:1px dotted #333;flex:1;margin:0 5px}.footer{text-align:right;margin-top:30px;font-weight:bold;font-size:14px}.gen{text-align:center;font-size:9px;color:#999;margin-top:15px;border-top:1px solid #eee;padding-top:5px}@media print{body{padding:10px}}`;

  const mcaHeader = `<div class="header"><img src="${MCA_LOGO}" class="logo-img" /><div class="inst-name">MY CAREER ACADEMIC</div><div class="division">A Division of:- <b>MY LIFELINE FOUNDATION</b></div><div class="addr">Kendrapara Town, Maruti Chhak, Khairabad, Kendrapara, 754211</div><div class="addr">Ph: 06727796700 | info.mylifelinefoundation@gmail.com</div></div>`;

  const printReceipt = (type, record) => {
    const isInc = type === "income";
    const cats = isInc ? incCats : expCats;
    const catName = cats[record.category] || record.category;
    const receiptNo = record.receipt_number || record.bill_number || "N/A";
    const date = new Date(record.income_date || record.expense_date).toLocaleDateString("en-IN");
    const amt = Number(record.amount).toLocaleString();

    const w = window.open("", "_blank");
    w.document.write(`<html><head><title>Money Receipt - ${receiptNo}</title><style>${receiptCSS}</style></head><body>
    ${mcaHeader}
    <div class="title">MONEY RECEIPT</div>
    <div class="row"><span>Sl. No.: <b>${receiptNo}</b></span><span>Date: <b>${date}</b></span></div>
    <div class="row" style="margin-top:8px"><span>Received from / Paid to: <b>${record.paid_to || record.description || catName}</b></span></div>
    <div class="row"><span>Payment Mode: <b>${(record.payment_mode || "cash").toUpperCase()}</b></span></div>
    <div class="row" style="margin-top:5px"><span>of Rs. <b style="font-size:16px">₹${amt}/-</b> (Rupees <b>${numberToWords(Number(record.amount))} only</b>)</span></div>
    <table style="margin-top:15px">
    <tr><th style="width:60%">PARTICULARS</th><th>AMOUNT</th></tr>
    <tr><td>1. ${catName}</td><td style="text-align:right;font-weight:bold">₹${amt}/-</td></tr>
    ${isInc ? `<tr><td>2. Registration fee</td><td></td></tr><tr><td>3. Admission fee</td><td></td></tr><tr><td>4. Course fee</td><td></td></tr><tr><td>5. Hostel fee</td><td></td></tr><tr><td>6. Library fee</td><td></td></tr><tr><td>7. Other</td><td></td></tr>` : `<tr><td>2. ${record.description || "-"}</td><td></td></tr>`}
    <tr style="background:#f5f5f5"><td style="text-align:right;font-weight:bold">G. Total</td><td style="text-align:right;font-weight:bold;font-size:15px">₹${amt}/-</td></tr>
    </table>
    <div class="footer">ACCOUNTANT</div>
    <div class="gen">This is a computer generated receipt | My Career Academic</div>
    </body></html>`);
    w.document.close(); w.print();
  };

  const printSalarySlip = (record) => {
    const w = window.open("", "_blank");
    w.document.write(`<html><head><title>Salary Slip</title><style>${receiptCSS}</style></head><body>
    ${mcaHeader}
    <div class="title">SALARY SLIP</div>
    <div class="row"><span>Employee: <b>${record.staff?.profiles?.full_name || "N/A"}</b></span><span>Month: <b>${record.month}</b></span></div>
    <div class="row"><span>Payment Date: <b>${new Date(record.payment_date).toLocaleDateString("en-IN")}</b></span><span>Mode: <b>${(record.payment_mode || "bank").toUpperCase()}</b></span></div>
    <table style="margin-top:15px">
    <tr><th style="width:60%">PARTICULARS</th><th>AMOUNT</th></tr>
    <tr><td>Base Salary</td><td style="text-align:right">₹${Number(record.amount).toLocaleString()}/-</td></tr>
    <tr><td>Deductions</td><td style="text-align:right;color:#c4342d">-₹${Number(record.deductions || 0).toLocaleString()}/-</td></tr>
    <tr><td>Bonus / Incentive</td><td style="text-align:right;color:#1a8a5c">+₹${Number(record.bonus || 0).toLocaleString()}/-</td></tr>
    <tr style="background:#f0f4f0"><td style="text-align:right;font-weight:bold">Net Pay</td><td style="text-align:right;font-weight:bold;font-size:16px">₹${Number(record.net_amount || record.amount).toLocaleString()}/-</td></tr>
    </table>
    <div style="margin-top:40px;display:flex;justify-content:space-between"><div style="text-align:center;border-top:1px solid #333;padding-top:5px;width:150px;font-size:12px">Employee Signature</div><div style="text-align:center;border-top:1px solid #333;padding-top:5px;width:150px;font-size:12px">ACCOUNTANT</div></div>
    <div class="gen">This is a computer generated salary slip | My Career Academic</div>
    </body></html>`);
    w.document.close(); w.print();
  };

  const printMonthlyReport = () => {
    const now = new Date();
    const monthName = now.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
    const mIncomes = incomes.filter(i => { const d = new Date(i.income_date); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); });
    const mExpenses = expenses.filter(e => { const d = new Date(e.expense_date); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); });
    const mSalaries = salaries.filter(s => { const d = new Date(s.payment_date); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); });
    const mTotalInc = mIncomes.reduce((a, i) => a + Number(i.amount), 0);
    const mTotalExp = mExpenses.reduce((a, e) => a + Number(e.amount), 0);
    const mTotalSal = mSalaries.reduce((a, s) => a + Number(s.net_amount || s.amount), 0);
    const mProfit = mTotalInc - mTotalExp - mTotalSal;

    const incByCategory = {}; mIncomes.forEach(i => { incByCategory[i.category] = (incByCategory[i.category] || 0) + Number(i.amount); });
    const expByCategory = {}; mExpenses.forEach(e => { expByCategory[e.category] = (expByCategory[e.category] || 0) + Number(e.amount); });

    const w = window.open("", "_blank");
    w.document.write(`<html><head><title>Monthly Report - ${monthName}</title><style>body{font-family:Arial,sans-serif;padding:30px;color:#000;max-width:700px;margin:0 auto}table{width:100%;border-collapse:collapse;margin:10px 0}td,th{padding:8px 10px;font-size:12px;border:1px solid #ddd;text-align:left}.header{text-align:center;border-bottom:3px solid #1a5c2e;padding-bottom:12px;margin-bottom:20px}.section{background:#f0f4f0;padding:8px 12px;font-weight:bold;font-size:13px;color:#1a5c2e}.summary{display:flex;gap:10px;margin:15px 0}.sbox{flex:1;padding:12px;border-radius:8px;text-align:center;border:1px solid #ddd}.green{background:#e6f5ee;color:#1a8a5c}.red{background:#fceaea;color:#c4342d}.blue{background:#e8f0f8;color:#1a2a6c}@media print{body{padding:10px}}</style></head><body>
    <div class="header"><img src="${MCA_LOGO}" style="height:45px;margin-bottom:4px" /><div style="font-size:22px;font-weight:bold;color:#1a5c2e">MY CAREER ACADEMIC</div><div style="font-size:12px;font-weight:bold">A Division of:- MY LIFELINE FOUNDATION</div><div style="font-size:11px;color:#555">Kendrapara Town, Maruti Chhak, Khairabad, Kendrapara, 754211</div><div style="font-size:15px;font-weight:bold;margin-top:8px;text-decoration:underline">MONTHLY FINANCIAL REPORT</div><div style="font-size:13px;color:#666">${monthName}</div></div>
    <div class="summary"><div class="sbox green"><div style="font-size:11px">TOTAL INCOME</div><div style="font-size:20px;font-weight:bold">₹${mTotalInc.toLocaleString()}</div></div><div class="sbox red"><div style="font-size:11px">TOTAL EXPENSE</div><div style="font-size:20px;font-weight:bold">₹${(mTotalExp + mTotalSal).toLocaleString()}</div></div><div class="sbox ${mProfit >= 0 ? "green" : "red"}"><div style="font-size:11px">${mProfit >= 0 ? "PROFIT" : "LOSS"}</div><div style="font-size:20px;font-weight:bold">₹${Math.abs(mProfit).toLocaleString()}</div></div></div>
    <table><tr><td colspan="3" class="section">INCOME BREAKDOWN</td></tr><tr><th>Category</th><th>Transactions</th><th>Amount</th></tr>
    ${Object.entries(incByCategory).map(([k, v]) => `<tr><td>${incCats[k] || k}</td><td>${mIncomes.filter(i => i.category === k).length}</td><td style="font-weight:bold;color:#1a8a5c">₹${v.toLocaleString()}</td></tr>`).join("")}
    <tr style="background:#f5f5f5"><td><b>Total</b></td><td><b>${mIncomes.length}</b></td><td><b style="color:#1a8a5c">₹${mTotalInc.toLocaleString()}</b></td></tr></table>
    <table><tr><td colspan="3" class="section">EXPENSE BREAKDOWN</td></tr><tr><th>Category</th><th>Transactions</th><th>Amount</th></tr>
    ${Object.entries(expByCategory).map(([k, v]) => `<tr><td>${expCats[k] || k}</td><td>${mExpenses.filter(e => e.category === k).length}</td><td style="font-weight:bold;color:#c4342d">₹${v.toLocaleString()}</td></tr>`).join("")}
    <tr style="background:#f5f5f5"><td><b>Total</b></td><td><b>${mExpenses.length}</b></td><td><b style="color:#c4342d">₹${mTotalExp.toLocaleString()}</b></td></tr></table>
    ${mSalaries.length > 0 ? `<table><tr><td colspan="4" class="section">SALARIES PAID</td></tr><tr><th>Employee</th><th>Month</th><th>Net Amount</th><th>Mode</th></tr>${mSalaries.map(s => `<tr><td>${s.staff?.profiles?.full_name || ""}</td><td>${s.month}</td><td>₹${Number(s.net_amount || s.amount).toLocaleString()}</td><td>${s.payment_mode}</td></tr>`).join("")}<tr style="background:#f5f5f5"><td colspan="2"><b>Total Salaries</b></td><td colspan="2"><b>₹${mTotalSal.toLocaleString()}</b></td></tr></table>` : ""}
    <div style="text-align:center;font-size:10px;color:#999;margin-top:20px;border-top:1px solid #eee;padding-top:10px">Generated on ${new Date().toLocaleDateString("en-IN")} | My Career Academic</div>
    </body></html>`);
    w.document.close(); w.print();
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div><h1 className="page-title">Accounts & Finance</h1><p className="page-sub" style={{ marginBottom: 0 }}>Complete income, expense & salary tracking</p></div>
        <div style={{ display: "flex", gap: 8 }}>{["overview", "income", "expenses", "salary"].map(v => <button key={v} className={`tag ${view === v ? "active" : ""}`} onClick={() => setView(v)}>{v.charAt(0).toUpperCase() + v.slice(1)}</button>)}</div>
      </div>
      {msg && <div className="success-box">{msg}</div>}

      {view === "overview" && (<div>
        <div className="grid-4" style={{ marginBottom: 20 }}>
          <StatCard title="Total income" value={`₹${totalIncome.toLocaleString()}`} variant="success" />
          <StatCard title="Total expenses" value={`₹${totalExpense.toLocaleString()}`} variant="danger" />
          <StatCard title="Salaries paid" value={`₹${totalSalary.toLocaleString()}`} variant="warning" />
          <StatCard title={profit >= 0 ? "Profit" : "Loss"} value={`₹${Math.abs(profit).toLocaleString()}`} variant={profit >= 0 ? "success" : "danger"} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}><h3 style={{ fontSize: 17, fontWeight: 700 }}>Income / Expense / Salary</h3><button className="btn" onClick={printMonthlyReport}>📊 Monthly Report</button></div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div className="card"><h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, color: "var(--success)" }}>Recent Income</h3>
            {incomes.slice(0, 8).map(i => (<div key={i.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid var(--border)", fontSize: 13 }}><div><span className="badge badge-success">{incCats[i.category] || i.category}</span> <span style={{ color: "var(--muted)", marginLeft: 4 }}>{i.description || ""}</span></div><div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontWeight: 700, color: "var(--success)" }}>+₹{Number(i.amount).toLocaleString()}</span><button style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "var(--primary)" }} onClick={() => printReceipt("income", i)}>🖨</button></div></div>))}
          </div>
          <div className="card"><h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, color: "var(--danger)" }}>Recent Expenses</h3>
            {expenses.slice(0, 8).map(e => (<div key={e.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid var(--border)", fontSize: 13 }}><div><span className="badge badge-danger">{expCats[e.category] || e.category}</span> <span style={{ color: "var(--muted)", marginLeft: 4 }}>{e.paid_to || e.description || ""}</span></div><div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontWeight: 700, color: "var(--danger)" }}>-₹{Number(e.amount).toLocaleString()}</span><button style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "var(--primary)" }} onClick={() => printReceipt("expense", e)}>🖨</button></div></div>))}
          </div>
        </div>
      </div>)}

      {view === "income" && (<div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}><h3 style={{ fontSize: 17, fontWeight: 700 }}>Income Records</h3><button className="btn btn-success" onClick={() => setShowIncForm(!showIncForm)}>+ Add income</button></div>
        {showIncForm && (<div className="card" style={{ marginBottom: 16, borderColor: "var(--success)" }}>
          <div className="grid-3"><div><label className="label">Category</label><select className="select" value={incForm.category} onChange={e => setIncForm({ ...incForm, category: e.target.value })}>{Object.entries(incCats).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div><div><label className="label">Amount (₹) *</label><input className="input" type="number" value={incForm.amount} onChange={e => setIncForm({ ...incForm, amount: e.target.value })} /></div><div><label className="label">Date</label><input className="input" type="date" value={incForm.incomeDate} onChange={e => setIncForm({ ...incForm, incomeDate: e.target.value })} /></div></div>
          <div className="grid-2" style={{ marginTop: 12 }}><div><label className="label">Description</label><input className="input" value={incForm.description} onChange={e => setIncForm({ ...incForm, description: e.target.value })} placeholder="Details" /></div><div><label className="label">Mode</label><select className="select" value={incForm.paymentMode} onChange={e => setIncForm({ ...incForm, paymentMode: e.target.value })}><option value="cash">Cash</option><option value="upi">UPI</option><option value="bank_transfer">Bank</option><option value="cheque">Cheque</option></select></div></div>
          <button className="btn btn-success" style={{ marginTop: 12 }} onClick={addIncome}>Save income</button>
        </div>)}
        <div className="card">{incomes.length === 0 ? <p className="empty-state">No income records.</p> : (
          <table><thead><tr><th>Date</th><th>Category</th><th>Amount</th><th>Description</th><th>Mode</th><th></th></tr></thead>
          <tbody>{incomes.map(i => (<tr key={i.id}><td>{new Date(i.income_date).toLocaleDateString("en-IN")}</td><td><span className="badge badge-success">{incCats[i.category] || i.category}</span></td><td style={{ fontWeight: 700, color: "var(--success)" }}>₹{Number(i.amount).toLocaleString()}</td><td>{i.description || "-"}</td><td>{i.payment_mode}</td><td><button className="btn-outline" style={{ fontSize: 11, padding: "3px 8px" }} onClick={() => printReceipt("income", i)}>Print</button></td></tr>))}</tbody></table>
        )}</div>
      </div>)}

      {view === "expenses" && (<div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}><h3 style={{ fontSize: 17, fontWeight: 700 }}>Expense Records</h3><button className="btn btn-danger" onClick={() => setShowExpForm(!showExpForm)}>+ Add expense</button></div>
        {showExpForm && (<div className="card" style={{ marginBottom: 16, borderColor: "var(--danger)" }}>
          <div className="grid-3"><div><label className="label">Category</label><select className="select" value={expForm.category} onChange={e => setExpForm({ ...expForm, category: e.target.value })}>{Object.entries(expCats).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div><div><label className="label">Amount (₹) *</label><input className="input" type="number" value={expForm.amount} onChange={e => setExpForm({ ...expForm, amount: e.target.value })} /></div><div><label className="label">Date</label><input className="input" type="date" value={expForm.expenseDate} onChange={e => setExpForm({ ...expForm, expenseDate: e.target.value })} /></div></div>
          <div className="grid-3" style={{ marginTop: 12 }}><div><label className="label">Paid to</label><input className="input" value={expForm.paidTo} onChange={e => setExpForm({ ...expForm, paidTo: e.target.value })} placeholder="Vendor/Person" /></div><div><label className="label">Description</label><input className="input" value={expForm.description} onChange={e => setExpForm({ ...expForm, description: e.target.value })} /></div><div><label className="label">Mode</label><select className="select" value={expForm.paymentMode} onChange={e => setExpForm({ ...expForm, paymentMode: e.target.value })}><option value="cash">Cash</option><option value="upi">UPI</option><option value="bank_transfer">Bank</option><option value="cheque">Cheque</option></select></div></div>
          <button className="btn btn-danger" style={{ marginTop: 12 }} onClick={addExpense}>Save expense</button>
        </div>)}
        <div className="card">{expenses.length === 0 ? <p className="empty-state">No expenses.</p> : (
          <table><thead><tr><th>Date</th><th>Category</th><th>Amount</th><th>Paid to</th><th>Description</th><th>Mode</th><th></th></tr></thead>
          <tbody>{expenses.map(e => (<tr key={e.id}><td>{new Date(e.expense_date).toLocaleDateString("en-IN")}</td><td><span className="badge badge-danger">{expCats[e.category] || e.category}</span></td><td style={{ fontWeight: 700, color: "var(--danger)" }}>₹{Number(e.amount).toLocaleString()}</td><td>{e.paid_to || "-"}</td><td>{e.description || "-"}</td><td>{e.payment_mode}</td><td><button className="btn-outline" style={{ fontSize: 11, padding: "3px 8px" }} onClick={() => printReceipt("expense", e)}>Print</button></td></tr>))}</tbody></table>
        )}</div>
      </div>)}

      {view === "salary" && (<div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}><h3 style={{ fontSize: 17, fontWeight: 700 }}>Salary Payments</h3><button className="btn btn-accent" onClick={() => setShowSalForm(!showSalForm)}>+ Pay salary</button></div>
        {showSalForm && (<div className="card" style={{ marginBottom: 16, borderColor: "var(--accent)" }}>
          <div className="grid-3"><div><label className="label">Staff *</label><select className="select" value={salForm.staffId} onChange={e => setSalForm({ ...salForm, staffId: e.target.value })}><option value="">Select</option>{staffList.map(s => <option key={s.id} value={s.id}>{s.profiles?.full_name}</option>)}</select></div><div><label className="label">Base amount (₹) *</label><input className="input" type="number" value={salForm.amount} onChange={e => setSalForm({ ...salForm, amount: e.target.value })} /></div><div><label className="label">Month *</label><input className="input" value={salForm.month} onChange={e => setSalForm({ ...salForm, month: e.target.value })} placeholder="April 2026" /></div></div>
          <div className="grid-3" style={{ marginTop: 12 }}><div><label className="label">Deductions</label><input className="input" type="number" value={salForm.deductions} onChange={e => setSalForm({ ...salForm, deductions: e.target.value })} /></div><div><label className="label">Bonus</label><input className="input" type="number" value={salForm.bonus} onChange={e => setSalForm({ ...salForm, bonus: e.target.value })} /></div><div><label className="label">Net: ₹{(Number(salForm.amount || 0) - Number(salForm.deductions || 0) + Number(salForm.bonus || 0)).toLocaleString()}</label><select className="select" value={salForm.paymentMode} onChange={e => setSalForm({ ...salForm, paymentMode: e.target.value })}><option value="bank_transfer">Bank</option><option value="cash">Cash</option><option value="upi">UPI</option><option value="cheque">Cheque</option></select></div></div>
          <button className="btn btn-success" style={{ marginTop: 12 }} onClick={addSalary}>Pay salary</button>
        </div>)}
        <div className="card">{salaries.length === 0 ? <p className="empty-state">No salary records.</p> : (
          <table><thead><tr><th>Staff</th><th>Month</th><th>Base</th><th>Deductions</th><th>Bonus</th><th>Net paid</th><th>Mode</th></tr></thead>
          <tbody>{salaries.map(s => (<tr key={s.id}><td style={{ fontWeight: 600 }}>{s.staff?.profiles?.full_name}</td><td>{s.month}</td><td>₹{Number(s.amount).toLocaleString()}</td><td style={{ color: "var(--danger)" }}>-₹{Number(s.deductions || 0).toLocaleString()}</td><td style={{ color: "var(--success)" }}>+₹{Number(s.bonus || 0).toLocaleString()}</td><td style={{ fontWeight: 700 }}>₹{Number(s.net_amount || s.amount).toLocaleString()}</td><td>{s.payment_mode}</td><td><button className="btn-outline" style={{ fontSize: 11, padding: "3px 8px" }} onClick={() => printSalarySlip(s)}>Slip</button></td></tr>))}</tbody></table>
        )}</div>
      </div>)}
    </div>
  );
}

// ========== GUARDIANS (NEW) ==========
function GuardiansTab() {
  const [students, setStudents] = useState([]); const [selStudent, setSelStudent] = useState(null); const [guardians, setGuardians] = useState([]);
  const [showForm, setShowForm] = useState(false); const [form, setForm] = useState({ fullName: "", email: "", phone: "", relation: "", occupation: "" });
  const [loading, setLoading] = useState(false); const [msg, setMsg] = useState("");
  useEffect(() => { supabase.from("students").select("*, profiles!inner(full_name)").eq("status", "active").order("created_at", { ascending: false }).then(({ data }) => setStudents(data || [])); }, []);
  const loadGuardians = async (student) => {
    setSelStudent(student); setShowForm(false); setMsg("");
    const { data } = await supabase.from("student_guardians").select("*, guardians!inner(*, profiles!inner(full_name, phone, email))").eq("student_id", student.id);
    setGuardians(data || []);
  };
  const addGuardian = async () => {
    if (!form.fullName || !form.email) return; setLoading(true); setMsg("");
    try {
      const tempPass = "Guardian@" + Date.now().toString().slice(-6);
      const { data: authData, error: authErr } = await supabase.auth.signUp({ email: form.email, password: tempPass, options: { data: { full_name: form.fullName, role: "guardian" } } });
      if (authErr) throw authErr;
      const userId = authData.user?.id; if (!userId) throw new Error("Failed");
      await new Promise(r => setTimeout(r, 1500));
      await supabase.from("profiles").update({ phone: form.phone, full_name: form.fullName, role: "guardian" }).eq("id", userId);
      const { data: gData, error: gErr } = await supabase.from("guardians").insert({ profile_id: userId, relation: form.relation || null, occupation: form.occupation || null }).select().single();
      if (gErr) throw gErr;
      await supabase.from("student_guardians").insert({ student_id: selStudent.id, guardian_id: gData.id, is_primary: guardians.length === 0 });
      setMsg(`Guardian added! Pass: ${tempPass}`);
      setForm({ fullName: "", email: "", phone: "", relation: "", occupation: "" }); setShowForm(false);
      loadGuardians(selStudent);
    } catch (e) { setMsg("Error: " + e.message); }
    setLoading(false);
  };
  const removeLink = async (sgId) => { await supabase.from("student_guardians").delete().eq("id", sgId); loadGuardians(selStudent); };
  const setPrimary = async (sgId) => {
    for (const g of guardians) { await supabase.from("student_guardians").update({ is_primary: g.id === sgId }).eq("id", g.id); }
    loadGuardians(selStudent);
  };
  return (
    <div><h1 className="page-title">Guardian management</h1><p className="page-sub">Link parents/guardians to students</p>
      <div style={{ display: "flex", gap: 20 }}>
        <div style={{ width: 260, flexShrink: 0 }}><div className="card" style={{ maxHeight: 500, overflowY: "auto" }}><h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: "var(--muted)" }}>Select student</h3>{students.map(st => <div key={st.id} className={`student-item ${selStudent?.id === st.id ? "active" : ""}`} onClick={() => loadGuardians(st)}>{st.profiles?.full_name}</div>)}</div></div>
        <div style={{ flex: 1 }}>
          {!selStudent ? <div className="card empty-state">Select a student to manage guardians</div> : (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h3 style={{ fontSize: 17, fontWeight: 700 }}>Guardians of {selStudent.profiles?.full_name}</h3>
                <button className="btn btn-accent" onClick={() => setShowForm(!showForm)}>+ Add guardian</button>
              </div>
              {msg && <div className={msg.startsWith("Error") ? "error-box" : "success-box"}>{msg}</div>}
              {showForm && (
                <div className="card" style={{ marginBottom: 16, borderColor: "var(--accent)" }}>
                  <div className="grid-3">
                    <div><label className="label">Name *</label><input className="input" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} /></div>
                    <div><label className="label">Email *</label><input className="input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
                    <div><label className="label">Phone</label><input className="input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
                  </div>
                  <div className="grid-2" style={{ marginTop: 12 }}>
                    <div><label className="label">Relation</label><select className="select" value={form.relation} onChange={e => setForm({ ...form, relation: e.target.value })}><option value="">Select</option><option value="father">Father</option><option value="mother">Mother</option><option value="guardian">Guardian</option><option value="sibling">Sibling</option><option value="other">Other</option></select></div>
                    <div><label className="label">Occupation</label><input className="input" value={form.occupation} onChange={e => setForm({ ...form, occupation: e.target.value })} placeholder="Business, Teacher, etc." /></div>
                  </div>
                  <button className="btn btn-success" style={{ marginTop: 12 }} onClick={addGuardian} disabled={loading}>{loading ? "Adding..." : "Save guardian"}</button>
                </div>
              )}
              {guardians.length === 0 ? <div className="card empty-state">No guardians linked yet.</div> : guardians.map(sg => (
                <div key={sg.id} className="card" style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontWeight: 700, fontSize: 15 }}>{sg.guardians?.profiles?.full_name}</span>
                        {sg.is_primary && <span className="badge badge-success">Primary</span>}
                        {sg.guardians?.relation && <span className="badge badge-primary">{sg.guardians.relation}</span>}
                      </div>
                      <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>{sg.guardians?.profiles?.phone || "No phone"} | {sg.guardians?.profiles?.email || ""} {sg.guardians?.occupation ? `| ${sg.guardians.occupation}` : ""}</div>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      {!sg.is_primary && <button className="btn-outline" style={{ fontSize: 12, padding: "6px 12px" }} onClick={() => setPrimary(sg.id)}>Set primary</button>}
                      <button style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer", fontSize: 12, fontWeight: 600 }} onClick={() => removeLink(sg.id)}>Remove</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ========== HOSTEL MANAGEMENT (NEW) ==========
function HostelTab() {
  const [hostels, setHostels] = useState([]); const [rooms, setRooms] = useState([]); const [allotments, setAllotments] = useState([]);
  const [students, setStudents] = useState([]); const [view, setView] = useState("overview");
  const [selHostel, setSelHostel] = useState(null); const [showHostelForm, setShowHostelForm] = useState(false); const [showRoomForm, setShowRoomForm] = useState(false); const [showAllotForm, setShowAllotForm] = useState(false);
  const [hostelForm, setHostelForm] = useState({ name: "", type: "boys", wardenName: "", wardenPhone: "", totalRooms: "" });
  const [roomForm, setRoomForm] = useState({ roomNumber: "", floor: "", roomType: "double", totalBeds: "2", monthlyRent: "", hasAc: false, hasAttachedBath: false });
  const [allotForm, setAllotForm] = useState({ studentId: "", roomId: "", bedNumber: "1" });
  const [hostelFees, setHostelFees] = useState([]); const [showFeeForm, setShowFeeForm] = useState(false);
  const [feeForm, setFeeForm] = useState({ studentId: "", amount: "", feeMonth: "", paymentMode: "cash" });
  const [msg, setMsg] = useState("");

  const loadHostels = async () => { const { data } = await supabase.from("hostels").select("*").order("name"); setHostels(data || []); };
  const loadRooms = async (hostelId) => { const { data } = await supabase.from("hostel_rooms").select("*").eq("hostel_id", hostelId).order("room_number"); setRooms(data || []); };
  const loadAllotments = async () => { const { data } = await supabase.from("hostel_allotments").select("*, students!inner(admission_number, profiles!inner(full_name, phone)), hostel_rooms!inner(room_number, hostels!inner(name))").eq("status", "active"); setAllotments(data || []); };
  const loadStudents = async () => { const { data } = await supabase.from("students").select("*, profiles!inner(full_name)").eq("status", "active"); setStudents(data || []); };
  const loadHostelFees = async () => { const { data } = await supabase.from("hostel_fees").select("*, students!inner(profiles!inner(full_name))").order("created_at", { ascending: false }).limit(50); setHostelFees(data || []); };

  useEffect(() => { loadHostels(); loadAllotments(); loadStudents(); loadHostelFees(); }, []);

  const addHostel = async () => {
    if (!hostelForm.name) return;
    await supabase.from("hostels").insert({ name: hostelForm.name, type: hostelForm.type, warden_name: hostelForm.wardenName || null, warden_phone: hostelForm.wardenPhone || null, total_rooms: hostelForm.totalRooms ? Number(hostelForm.totalRooms) : 0 });
    setHostelForm({ name: "", type: "boys", wardenName: "", wardenPhone: "", totalRooms: "" }); setShowHostelForm(false); loadHostels();
  };

  const addRoom = async () => {
    if (!roomForm.roomNumber || !selHostel) return;
    await supabase.from("hostel_rooms").insert({ hostel_id: selHostel.id, room_number: roomForm.roomNumber, floor: roomForm.floor || null, room_type: roomForm.roomType, total_beds: Number(roomForm.totalBeds), monthly_rent: roomForm.monthlyRent ? Number(roomForm.monthlyRent) : 0, has_ac: roomForm.hasAc, has_attached_bath: roomForm.hasAttachedBath });
    setRoomForm({ roomNumber: "", floor: "", roomType: "double", totalBeds: "2", monthlyRent: "", hasAc: false, hasAttachedBath: false }); setShowRoomForm(false); loadRooms(selHostel.id);
  };

  const allotRoom = async () => {
    if (!allotForm.studentId || !allotForm.roomId) return;
    await supabase.from("hostel_allotments").insert({ student_id: allotForm.studentId, room_id: allotForm.roomId, bed_number: Number(allotForm.bedNumber) });
    await supabase.from("students").update({ is_hosteler: true }).eq("id", allotForm.studentId);
    setAllotForm({ studentId: "", roomId: "", bedNumber: "1" }); setShowAllotForm(false); loadAllotments(); setMsg("Room allotted!");
  };

  const vacateStudent = async (allotId, studentId) => {
    await supabase.from("hostel_allotments").update({ status: "vacated", vacate_date: new Date().toISOString().split("T")[0] }).eq("id", allotId);
    await supabase.from("students").update({ is_hosteler: false }).eq("id", studentId);
    loadAllotments(); setMsg("Student vacated.");
  };

  const addHostelFee = async () => {
    if (!feeForm.studentId || !feeForm.amount || !feeForm.feeMonth) return;
    await supabase.from("hostel_fees").insert({ student_id: feeForm.studentId, amount: Number(feeForm.amount), fee_month: feeForm.feeMonth, payment_mode: feeForm.paymentMode, receipt_number: "HF-" + Date.now() });
    setFeeForm({ studentId: "", amount: "", feeMonth: "", paymentMode: "cash" }); setShowFeeForm(false); loadHostelFees(); setMsg("Hostel fee recorded!");
  };

  const occupiedBeds = allotments.reduce((acc, a) => { acc[a.room_id] = (acc[a.room_id] || 0) + 1; return acc; }, {});

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div><h1 className="page-title">Hostel management</h1><p className="page-sub" style={{ marginBottom: 0 }}>{allotments.length} hostelers | {hostels.length} hostels</p></div>
        <div style={{ display: "flex", gap: 8 }}>
          {["overview", "rooms", "allotments", "fees"].map(v => <button key={v} className={`tag ${view === v ? "active" : ""}`} onClick={() => setView(v)}>{v.charAt(0).toUpperCase() + v.slice(1)}</button>)}
        </div>
      </div>
      {msg && <div className="success-box">{msg}</div>}

      {view === "overview" && (<div>
        <div className="grid-4" style={{ marginBottom: 20 }}>
          <StatCard title="Hostels" value={hostels.length} variant="primary" />
          <StatCard title="Total rooms" value={rooms.length || hostels.reduce((a, h) => a + (h.total_rooms || 0), 0)} variant="success" />
          <StatCard title="Hostelers" value={allotments.length} variant="warning" />
          <StatCard title="Fee records" value={hostelFees.length} variant="danger" />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}><h3 style={{ fontSize: 15, fontWeight: 700 }}>Hostels</h3><button className="btn btn-accent" onClick={() => setShowHostelForm(!showHostelForm)}>+ Add hostel</button></div>
        {showHostelForm && (<div className="card" style={{ marginBottom: 16, borderColor: "var(--accent)" }}>
          <div className="grid-2"><div><label className="label">Hostel name *</label><input className="input" value={hostelForm.name} onChange={e => setHostelForm({ ...hostelForm, name: e.target.value })} placeholder="Boys Hostel" /></div><div><label className="label">Type</label><select className="select" value={hostelForm.type} onChange={e => setHostelForm({ ...hostelForm, type: e.target.value })}><option value="boys">Boys</option><option value="girls">Girls</option><option value="mixed">Mixed</option></select></div></div>
          <div className="grid-3" style={{ marginTop: 12 }}><div><label className="label">Warden name</label><input className="input" value={hostelForm.wardenName} onChange={e => setHostelForm({ ...hostelForm, wardenName: e.target.value })} /></div><div><label className="label">Warden phone</label><input className="input" value={hostelForm.wardenPhone} onChange={e => setHostelForm({ ...hostelForm, wardenPhone: e.target.value })} /></div><div><label className="label">Total rooms</label><input className="input" type="number" value={hostelForm.totalRooms} onChange={e => setHostelForm({ ...hostelForm, totalRooms: e.target.value })} /></div></div>
          <button className="btn btn-success" style={{ marginTop: 12 }} onClick={addHostel}>Save hostel</button>
        </div>)}
        {hostels.map(h => (<div key={h.id} className="card" style={{ marginBottom: 12, cursor: "pointer" }} onClick={() => { setSelHostel(h); loadRooms(h.id); setView("rooms"); }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><div><span style={{ fontWeight: 700, fontSize: 15 }}>{h.name}</span><span className={`badge ${h.type === "boys" ? "badge-primary" : h.type === "girls" ? "badge-danger" : "badge-warning"}`} style={{ marginLeft: 8 }}>{h.type}</span><div style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>Warden: {h.warden_name || "-"} | Phone: {h.warden_phone || "-"} | Rooms: {h.total_rooms}</div></div><span style={{ color: "var(--primary)", fontWeight: 600, fontSize: 13 }}>Manage →</span></div>
        </div>))}
      </div>)}

      {view === "rooms" && (<div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div><h3 style={{ fontSize: 17, fontWeight: 700 }}>{selHostel?.name || "Select a hostel"}</h3><div style={{ display: "flex", gap: 8, marginTop: 8 }}>{hostels.map(h => <button key={h.id} className={`tag ${selHostel?.id === h.id ? "active" : ""}`} onClick={() => { setSelHostel(h); loadRooms(h.id); }}>{h.name}</button>)}</div></div>
          {selHostel && <button className="btn btn-accent" onClick={() => setShowRoomForm(!showRoomForm)}>+ Add room</button>}
        </div>
        {showRoomForm && (<div className="card" style={{ marginBottom: 16, borderColor: "var(--accent)" }}>
          <div className="grid-3"><div><label className="label">Room no. *</label><input className="input" value={roomForm.roomNumber} onChange={e => setRoomForm({ ...roomForm, roomNumber: e.target.value })} placeholder="101" /></div><div><label className="label">Floor</label><input className="input" value={roomForm.floor} onChange={e => setRoomForm({ ...roomForm, floor: e.target.value })} placeholder="1st Floor" /></div><div><label className="label">Type</label><select className="select" value={roomForm.roomType} onChange={e => setRoomForm({ ...roomForm, roomType: e.target.value })}><option value="single">Single</option><option value="double">Double</option><option value="triple">Triple</option><option value="dormitory">Dormitory</option></select></div></div>
          <div className="grid-3" style={{ marginTop: 12 }}><div><label className="label">Total beds</label><input className="input" type="number" value={roomForm.totalBeds} onChange={e => setRoomForm({ ...roomForm, totalBeds: e.target.value })} /></div><div><label className="label">Monthly rent (₹)</label><input className="input" type="number" value={roomForm.monthlyRent} onChange={e => setRoomForm({ ...roomForm, monthlyRent: e.target.value })} /></div><div style={{ display: "flex", gap: 16, alignItems: "flex-end", paddingBottom: 4 }}><label style={{ fontSize: 13, display: "flex", alignItems: "center", gap: 4 }}><input type="checkbox" checked={roomForm.hasAc} onChange={e => setRoomForm({ ...roomForm, hasAc: e.target.checked })} /> AC</label><label style={{ fontSize: 13, display: "flex", alignItems: "center", gap: 4 }}><input type="checkbox" checked={roomForm.hasAttachedBath} onChange={e => setRoomForm({ ...roomForm, hasAttachedBath: e.target.checked })} /> Attached Bath</label></div></div>
          <button className="btn btn-success" style={{ marginTop: 12 }} onClick={addRoom}>Save room</button>
        </div>)}
        <div className="card">{rooms.length === 0 ? <p className="empty-state">No rooms added. {!selHostel ? "Select a hostel first." : ""}</p> : (
          <table><thead><tr><th>Room</th><th>Floor</th><th>Type</th><th>Beds</th><th>Occupied</th><th>Rent/month</th><th>Facilities</th></tr></thead>
          <tbody>{rooms.map(r => { const occ = occupiedBeds[r.id] || 0; return (
            <tr key={r.id}><td style={{ fontWeight: 700 }}>{r.room_number}</td><td>{r.floor || "-"}</td><td><span className="badge badge-primary">{r.room_type}</span></td><td>{r.total_beds}</td><td><span className={`badge ${occ >= r.total_beds ? "badge-danger" : occ > 0 ? "badge-warning" : "badge-success"}`}>{occ}/{r.total_beds}</span></td><td>₹{r.monthly_rent}</td><td>{r.has_ac ? "AC " : ""}{r.has_attached_bath ? "Bath" : ""}{!r.has_ac && !r.has_attached_bath ? "-" : ""}</td></tr>
          ); })}</tbody></table>
        )}</div>
      </div>)}

      {view === "allotments" && (<div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}><h3 style={{ fontSize: 17, fontWeight: 700 }}>Room allotments</h3><button className="btn btn-accent" onClick={() => setShowAllotForm(!showAllotForm)}>+ Allot room</button></div>
        {showAllotForm && (<div className="card" style={{ marginBottom: 16, borderColor: "var(--accent)" }}>
          <div className="grid-3">
            <div><label className="label">Student</label><select className="select" value={allotForm.studentId} onChange={e => setAllotForm({ ...allotForm, studentId: e.target.value })}><option value="">Select student</option>{students.filter(s => !allotments.find(a => a.student_id === s.id)).map(s => <option key={s.id} value={s.id}>{s.profiles?.full_name}</option>)}</select></div>
            <div><label className="label">Room</label><select className="select" value={allotForm.roomId} onChange={e => setAllotForm({ ...allotForm, roomId: e.target.value })}><option value="">Select room</option>{rooms.length > 0 ? rooms.filter(r => (occupiedBeds[r.id] || 0) < r.total_beds).map(r => <option key={r.id} value={r.id}>{r.room_number} ({r.room_type})</option>) : hostels.map(h => <option key={h.id} disabled>Load rooms from Rooms tab first</option>)}</select></div>
            <div><label className="label">Bed no.</label><input className="input" type="number" value={allotForm.bedNumber} onChange={e => setAllotForm({ ...allotForm, bedNumber: e.target.value })} /></div>
          </div>
          <button className="btn btn-success" style={{ marginTop: 12 }} onClick={allotRoom}>Allot room</button>
        </div>)}
        <div className="card">{allotments.length === 0 ? <p className="empty-state">No allotments yet.</p> : (
          <table><thead><tr><th>Student</th><th>Room</th><th>Hostel</th><th>Bed</th><th>Since</th><th></th></tr></thead>
          <tbody>{allotments.map(a => (
            <tr key={a.id}><td style={{ fontWeight: 600 }}>{a.students?.profiles?.full_name}</td><td><span className="badge badge-primary">{a.hostel_rooms?.room_number}</span></td><td>{a.hostel_rooms?.hostels?.name}</td><td>Bed {a.bed_number}</td><td>{new Date(a.allotment_date).toLocaleDateString("en-IN")}</td><td><button style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer", fontSize: 12, fontWeight: 600 }} onClick={() => vacateStudent(a.id, a.student_id)}>Vacate</button></td></tr>
          ))}</tbody></table>
        )}</div>
      </div>)}

      {view === "fees" && (<div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}><h3 style={{ fontSize: 17, fontWeight: 700 }}>Hostel fee payments</h3><button className="btn btn-accent" onClick={() => setShowFeeForm(!showFeeForm)}>+ Record fee</button></div>
        {showFeeForm && (<div className="card" style={{ marginBottom: 16, borderColor: "var(--accent)" }}>
          <div className="grid-2">
            <div><label className="label">Student</label><select className="select" value={feeForm.studentId} onChange={e => setFeeForm({ ...feeForm, studentId: e.target.value })}><option value="">Select</option>{allotments.map(a => <option key={a.student_id} value={a.student_id}>{a.students?.profiles?.full_name} ({a.hostel_rooms?.room_number})</option>)}</select></div>
            <div><label className="label">Amount (₹)</label><input className="input" type="number" value={feeForm.amount} onChange={e => setFeeForm({ ...feeForm, amount: e.target.value })} placeholder="3000" /></div>
          </div>
          <div className="grid-2" style={{ marginTop: 12 }}>
            <div><label className="label">Fee month</label><input className="input" value={feeForm.feeMonth} onChange={e => setFeeForm({ ...feeForm, feeMonth: e.target.value })} placeholder="April 2026" /></div>
            <div><label className="label">Mode</label><select className="select" value={feeForm.paymentMode} onChange={e => setFeeForm({ ...feeForm, paymentMode: e.target.value })}><option value="cash">Cash</option><option value="upi">UPI</option><option value="bank_transfer">Bank</option><option value="cheque">Cheque</option></select></div>
          </div>
          <button className="btn btn-success" style={{ marginTop: 12 }} onClick={addHostelFee}>Save payment</button>
        </div>)}
        <div className="card">{hostelFees.length === 0 ? <p className="empty-state">No hostel fee records.</p> : (
          <table><thead><tr><th>Student</th><th>Amount</th><th>Month</th><th>Mode</th><th>Date</th><th>Receipt</th></tr></thead>
          <tbody>{hostelFees.map(f => (
            <tr key={f.id}><td style={{ fontWeight: 600 }}>{f.students?.profiles?.full_name}</td><td style={{ fontWeight: 700, color: "var(--success)" }}>₹{f.amount}</td><td>{f.fee_month}</td><td><span className="badge badge-primary">{f.payment_mode}</span></td><td>{new Date(f.payment_date).toLocaleDateString("en-IN")}</td><td style={{ fontSize: 12, color: "var(--muted)" }}>{f.receipt_number}</td></tr>
          ))}</tbody></table>
        )}</div>
      </div>)}
    </div>
  );
}

// ========== STAFF ==========
function StaffTab() {
  const [staffList, setStaffList] = useState([]); const [showForm, setShowForm] = useState(false); const [form, setForm] = useState({ fullName: "", email: "", phone: "", designation: "", specialization: "", salary: "" }); const [loading, setLoading] = useState(false); const [msg, setMsg] = useState("");
  useEffect(() => { supabase.from("staff").select("*, profiles!inner(full_name, phone, email)").then(({ data }) => setStaffList(data || [])); }, []);
  const add = async () => { if (!form.fullName || !form.email) return; setLoading(true); try { const tempPass = "Staff@" + Date.now().toString().slice(-6); const { data: authData, error: authErr } = await supabase.auth.signUp({ email: form.email, password: tempPass, options: { data: { full_name: form.fullName, role: "teacher" } } }); if (authErr) throw authErr; await new Promise(r => setTimeout(r, 1500)); const userId = authData.user?.id; await supabase.from("profiles").update({ phone: form.phone, role: "teacher" }).eq("id", userId); await supabase.from("staff").insert({ profile_id: userId, designation: form.designation || null, subject_specialization: form.specialization || null, salary: form.salary ? Number(form.salary) : null }); setMsg(`Added! Pass: ${tempPass}`); setShowForm(false); setForm({ fullName: "", email: "", phone: "", designation: "", specialization: "", salary: "" }); const { data } = await supabase.from("staff").select("*, profiles!inner(full_name, phone, email)"); setStaffList(data || []); } catch (e) { setMsg(e.message); } setLoading(false); };
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}><div><h1 className="page-title">Staff</h1><p style={{ fontSize: 13, color: "var(--muted)" }}>{staffList.length} members</p></div><button className="btn btn-accent" onClick={() => setShowForm(!showForm)}>+ Add staff</button></div>
      {msg && <div className="success-box">{msg}</div>}
      {showForm && (<div className="card" style={{ marginBottom: 20, borderColor: "var(--accent)" }}><div className="grid-3"><div><label className="label">Name *</label><input className="input" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} /></div><div><label className="label">Email *</label><input className="input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div><div><label className="label">Phone</label><input className="input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div></div><div className="grid-3" style={{ marginTop: 12 }}><div><label className="label">Designation</label><input className="input" value={form.designation} onChange={e => setForm({ ...form, designation: e.target.value })} /></div><div><label className="label">Subject</label><input className="input" value={form.specialization} onChange={e => setForm({ ...form, specialization: e.target.value })} /></div><div><label className="label">Salary</label><input className="input" type="number" value={form.salary} onChange={e => setForm({ ...form, salary: e.target.value })} /></div></div><button className="btn btn-success" style={{ marginTop: 14 }} onClick={add} disabled={loading}>{loading ? "..." : "Save"}</button></div>)}
      <div className="card">{staffList.length === 0 ? <p className="empty-state">No staff.</p> : (<table><thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Designation</th><th>Subject</th></tr></thead><tbody>{staffList.map(st => (<tr key={st.id}><td style={{ fontWeight: 600 }}>{st.profiles?.full_name}</td><td>{st.profiles?.email}</td><td>{st.profiles?.phone || "-"}</td><td>{st.designation || "-"}</td><td><span className="badge badge-primary">{st.subject_specialization || "-"}</span></td></tr>))}</tbody></table>)}</div>
    </div>
  );
}

// ========== NOTIFICATIONS / NOTICES (NEW) ==========
function NoticesTab({ profile }) {
  const [notices, setNotices] = useState([]); const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", body: "", targetRole: "" });
  const [loading, setLoading] = useState(false);
  const isAdmin = profile?.role === "admin";

  const loadNotices = async () => {
    const { data } = await supabase.from("notifications").select("*").order("created_at", { ascending: false }).limit(50);
    setNotices(data || []);
  };
  useEffect(() => { loadNotices(); }, []);

  const send = async () => {
    if (!form.title) return; setLoading(true);
    await supabase.from("notifications").insert({ title: form.title, body: form.body || null, target_role: form.targetRole || null, target_user_id: null });
    setForm({ title: "", body: "", targetRole: "" }); setShowForm(false); setLoading(false); loadNotices();
  };

  const deleteNotice = async (id) => { await supabase.from("notifications").delete().eq("id", id); loadNotices(); };

  const markRead = async (id) => { await supabase.from("notifications").update({ is_read: true }).eq("id", id); loadNotices(); };

  const myNotices = notices.filter(n => !n.target_role || n.target_role === profile?.role);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div><h1 className="page-title">Notices & announcements</h1><p className="page-sub" style={{ marginBottom: 0 }}>{myNotices.filter(n => !n.is_read).length} unread</p></div>
        {isAdmin && <button className="btn btn-accent" onClick={() => setShowForm(!showForm)}>+ New notice</button>}
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: 20, borderColor: "var(--accent)" }}>
          <div className="form-group"><label className="label">Title *</label><input className="input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Exam schedule update" /></div>
          <div className="form-group"><label className="label">Message</label><textarea className="input" rows={3} value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} placeholder="Detailed announcement..." style={{ resize: "vertical" }} /></div>
          <div className="form-group"><label className="label">Send to</label>
            <select className="select" value={form.targetRole} onChange={e => setForm({ ...form, targetRole: e.target.value })}>
              <option value="">Everyone</option><option value="student">Students only</option><option value="teacher">Teachers only</option><option value="guardian">Guardians only</option><option value="staff">Staff only</option>
            </select>
          </div>
          <button className="btn btn-success" onClick={send} disabled={loading}>{loading ? "Sending..." : "Send notice"}</button>
        </div>
      )}

      {myNotices.length === 0 ? <div className="card empty-state">No notices yet.</div> : myNotices.map(n => (
        <div key={n.id} className="card" style={{ marginBottom: 12, borderLeft: n.is_read ? "4px solid var(--border)" : "4px solid var(--primary)", opacity: n.is_read ? 0.7 : 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{ fontWeight: 700, fontSize: 15 }}>{n.title}</span>
                {!n.is_read && <span className="badge badge-primary">New</span>}
                {n.target_role && <span className="badge badge-muted">{n.target_role}</span>}
              </div>
              {n.body && <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 4, lineHeight: 1.5 }}>{n.body}</p>}
              <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 8 }}>{new Date(n.created_at).toLocaleString("en-IN")}</p>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {!n.is_read && <button className="btn-outline" style={{ fontSize: 11, padding: "4px 10px" }} onClick={() => markRead(n.id)}>Read</button>}
              {isAdmin && <button style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer", fontSize: 11 }} onClick={() => deleteNotice(n.id)}>Del</button>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ========== PROGRESS ==========
function ProgressTab() {
  const [subjects, setSubjects] = useState([]); const [chapters, setChapters] = useState([]); const [selSub, setSelSub] = useState("");
  useEffect(() => { supabase.from("subjects").select("*, courses(name)").then(({ data }) => setSubjects(data || [])); }, []);
  useEffect(() => { if (selSub) supabase.from("chapters").select("*").eq("subject_id", selSub).order("sort_order").then(({ data }) => setChapters(data || [])); }, [selSub]);
  return (
    <div><h1 className="page-title">Progress</h1><p className="page-sub">Track by subject</p>
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>{subjects.map(s => <button key={s.id} className={`tag ${selSub === s.id ? "active" : ""}`} onClick={() => setSelSub(s.id)}>{s.name} ({s.courses?.name})</button>)}</div>
      {selSub && (<div className="card">{chapters.length === 0 ? <p style={{ color: "var(--muted)" }}>No chapters.</p> : (<table><thead><tr><th>#</th><th>Chapter</th><th>Status</th></tr></thead><tbody>{chapters.map((ch, i) => (<tr key={ch.id}><td>{i + 1}</td><td style={{ fontWeight: 500 }}>{ch.name}</td><td><span className="badge badge-muted">Pending</span></td></tr>))}</tbody></table>)}</div>)}
    </div>
  );
}

// ========== MAIN APP ==========
export default function Home() {
  const [session, setSession] = useState(null); const [profile, setProfile] = useState(null); const [activeTab, setActiveTab] = useState("Dashboard"); const [checking, setChecking] = useState(true); const [detailStudent, setDetailStudent] = useState(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => { setSession(s); if (s) loadProfile(s.user.id, s.access_token); setChecking(false); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => { setSession(s); if (s) loadProfile(s.user.id, s.access_token); });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => { if (profile) { supabase.from("notifications").select("*").order("created_at", { ascending: false }).limit(50).then(({ data }) => setNotifications(data || [])); } }, [profile]);

  const loadProfile = async (uid, token) => { const data = await fetchProfileDirect(uid, token); setProfile(data); };
  const login = async () => { const { data: { session: s } } = await supabase.auth.getSession(); setSession(s); if (s) loadProfile(s.user.id, s.access_token); };
  const logout = async () => { await supabase.auth.signOut(); setSession(null); setProfile(null); setActiveTab("Dashboard"); };
  const navigate = (tab, data) => { if (tab === "StudentDetail") { setDetailStudent(data); setActiveTab("StudentDetail"); } else { setActiveTab(tab); setDetailStudent(null); } };

  if (checking) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif" }}>Loading...</div>;
  if (!session) return <LoginScreen onLogin={login} />;

  const role = profile?.role || "student";
  const tabs = TABS[role] || TABS.student;
  const icons = { Dashboard: "◫", Students: "☺", Admission: "✚", Courses: "◈", Timetable: "▦", "Live Classes": "▶", Attendance: "✔", Fees: "₹", Tests: "✎", Hostel: "⌂", Accounts: "◎", Guardians: "♥", Staff: "★", Progress: "★", Notices: "◉" };
  const unreadCount = (notifications || []).filter(n => !n.is_read && (!n.target_role || n.target_role === role)).length;

  const renderTab = () => {
    if (activeTab === "StudentDetail") return <StudentDetailTab student={detailStudent} onBack={() => { setActiveTab("Students"); setDetailStudent(null); }} />;
    switch (activeTab) {
      case "Dashboard": return <DashboardTab profile={profile} onNavigate={navigate} notifications={notifications} />;
      case "Students": return <StudentsTab onNavigate={navigate} />;
      case "Admission": return <AdmissionTab />;
      case "Courses": return <CoursesTab />;
      case "Timetable": return <TimetableTab profile={profile} />;
      case "Live Classes": return <LiveClassesTab profile={profile} />;
      case "Attendance": return <AttendanceTab />;
      case "Fees": return <FeesTab profile={profile} />;
      case "Tests": return <TestsTab />;
      case "Hostel": return <HostelTab />;
      case "Accounts": return <AccountsTab />;
      case "Guardians": return <GuardiansTab />;
      case "Staff": return <StaffTab />;
      case "Notices": return <NoticesTab profile={profile} />;
      case "Progress": return <ProgressTab />;
      default: return <DashboardTab profile={profile} onNavigate={navigate} notifications={notifications} />;
    }
  };

  return (
    <div>
      <div className="sidebar">
        <div className="sidebar-header">
          <h1 style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.3px" }}>My Career Academic</h1>
          <div style={{ fontSize: 11, opacity: 0.6, marginTop: 4 }}>Coaching Management</div>
        </div>
        <div style={{ padding: "12px 0", flex: 1, overflowY: "auto" }}>
          {tabs.map(tab => (
            <div key={tab} className={`nav-item ${activeTab === tab ? "active" : ""}`} onClick={() => navigate(tab)}>
              <span style={{ fontSize: 14 }}>{icons[tab]}</span> {tab}
              {tab === "Notices" && unreadCount > 0 && <span style={{ marginLeft: "auto", background: "var(--danger)", color: "#fff", borderRadius: 10, padding: "1px 7px", fontSize: 11, fontWeight: 700 }}>{unreadCount}</span>}
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
