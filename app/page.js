"use client";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";

const SUPABASE_URL = "https://sxqddwpszfumcwxtmxsk.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4cWRkd3BzemZ1bWN3eHRteHNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2NzMyMTIsImV4cCI6MjA5MjI0OTIxMn0.N-6xZneRahpcpGZVjdSlsb1_gHsWiBTvYm2LNqStF_Q";

const DAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const DAYS_SHORT = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

// Role-based tab access
const TABS = {
  admin:   ["Dashboard","Students","Admission","Courses","Timetable","Live Classes","Attendance","Fees","Tests","Hostel","Accounts","Guardians","Staff","Notices"],
  teacher: ["Dashboard","Timetable","Live Classes","Attendance","Tests","Notices"],
  staff:   ["Dashboard","Students","Live Classes","Attendance","Hostel","Notices"],
  student: ["Dashboard","Timetable","Live Classes","Fees","Progress","Notices"],
  guardian:["Dashboard","Timetable","Live Classes","Fees","Notices"],
};

const TAB_ICONS = {
  Dashboard:"◫", Students:"☺", Admission:"✚", Courses:"◈",
  Timetable:"▦", "Live Classes":"▶", Attendance:"✔", Fees:"₹",
  Tests:"✎", Hostel:"⌂", Accounts:"◎", Guardians:"♥",
  Staff:"★", Progress:"◉", Notices:"◉"
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
    const res = await fetch(SUPABASE_URL + "/rest/v1/profiles?id=eq." + uid + "&select=*", {
      headers: { apikey: SUPABASE_KEY, Authorization: "Bearer " + (token || SUPABASE_KEY) }
    });
    const rows = await res.json();
    if (Array.isArray(rows) && rows.length > 0) return rows[0];
    return null;
  } catch (e) { return null; }
}

// ========== LOGIN ==========
function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotMsg, setForgotMsg] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) { setError("Please enter email and password."); return; }
    setLoading(true); setError("");
    try {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) throw err;
      onLogin();
    } catch (e) { setError(e.message || "Login failed. Please check your credentials."); }
    setLoading(false);
  };

  const handleForgotPassword = async () => {
    if (!forgotEmail) { setForgotMsg("Please enter your email address."); return; }
    setForgotLoading(true); setForgotMsg("");
    try {
      const { error: err } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
        redirectTo: window.location.origin,
      });
      if (err) throw err;
      setForgotMsg("Password reset link sent! Check your email.");
    } catch (e) { setForgotMsg("Error: " + e.message); }
    setForgotLoading(false);
  };

  return (
    <div className="login-bg">
      <div className="login-card">
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ width: 64, height: 64, background: "var(--primary)", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", fontSize: 28, color: "#fff", fontWeight: 700 }}>M</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--primary)" }}>My Career Academic</h1>
          <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>Coaching Center Management System</p>
        </div>

        {!showForgot ? (
          <>
            {error && <div className="error-box">{error}</div>}
            <div className="form-group">
              <label className="label">Email Address</label>
              <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email" onKeyDown={e => e.key === "Enter" && handleLogin()} />
            </div>
            <div className="form-group">
              <label className="label">Password</label>
              <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" onKeyDown={e => e.key === "Enter" && handleLogin()} />
            </div>
            <button className="btn" style={{ width: "100%", padding: 13, marginTop: 8, fontSize: 15 }} onClick={handleLogin} disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
            <div style={{ textAlign: "center", marginTop: 16 }}>
              <button onClick={() => setShowForgot(true)} style={{ background: "none", border: "none", color: "var(--primary)", cursor: "pointer", fontSize: 13 }}>
                Forgot Password?
              </button>
            </div>
          </>
        ) : (
          <>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Reset Password</h3>
            <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 16 }}>Enter your email and we will send a password reset link.</p>
            {forgotMsg && <div className={forgotMsg.startsWith("Error") ? "error-box" : "success-box"}>{forgotMsg}</div>}
            <div className="form-group">
              <label className="label">Email Address</label>
              <input className="input" type="email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} placeholder="Enter your email" />
            </div>
            <button className="btn" style={{ width: "100%", padding: 13, marginTop: 8 }} onClick={handleForgotPassword} disabled={forgotLoading}>
              {forgotLoading ? "Sending..." : "Send Reset Link"}
            </button>
            <div style={{ textAlign: "center", marginTop: 16 }}>
              <button onClick={() => { setShowForgot(false); setForgotMsg(""); }} style={{ background: "none", border: "none", color: "var(--primary)", cursor: "pointer", fontSize: 13 }}>
                ← Back to Login
              </button>
            </div>
          </>
        )}
        <div style={{ textAlign: "center", marginTop: 24, fontSize: 11, color: "var(--muted)" }}>
          My Career Academic — A Division of MY LIFELINE FOUNDATION
        </div>
      </div>
    </div>
  );
}

// ========== STAT CARD ==========
function StatCard({ title, value, variant }) {
  const bc = variant === "danger" ? "var(--danger)" : variant === "success" ? "var(--success)" : variant === "warning" ? "var(--warning)" : "var(--primary)";
  const bg = variant === "danger" ? "var(--danger-light)" : variant === "success" ? "var(--success-light)" : variant === "warning" ? "var(--warning-light)" : "var(--primary-light)";
  return (
    <div className="card" style={{ borderLeft: `4px solid ${bc}`, background: bg }}>
      <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>{title}</div>
      <div style={{ fontSize: 28, fontWeight: 700, marginTop: 6, color: bc }}>{value}</div>
    </div>
  );
}

// ========== PHOTO UPLOAD ==========
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
      <div style={{ width: 90, height: 110, border: "2px dashed var(--border)", borderRadius: 8, overflow: "hidden", margin: "0 auto 6px", display: "flex", alignItems: "center", justifyContent: "center", background: value ? "none" : "var(--bg)", cursor: "pointer" }} onClick={() => document.getElementById("photo-" + label)?.click()}>
        {value ? <img src={value} alt={label} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: 24, color: "var(--muted)" }}>+</span>}
      </div>
      <input id={"photo-" + label} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />
      <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600 }}>{label}</div>
    </div>
  );
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
  const role = profile?.role;

  return (
    <div>
      <h1 className="page-title">Dashboard</h1>
      <p className="page-sub">Welcome back, {profile?.full_name || "User"} — <span style={{ textTransform: "capitalize" }}>{role}</span></p>

      {(role === "admin" || role === "staff") && (
        <div className="grid-4" style={{ marginBottom: 20 }}>
          <StatCard title="Total Students" value={stats.students} variant="primary" />
          <StatCard title="Live Now" value={stats.live} variant="danger" />
          <StatCard title="Active Courses" value={stats.courses} variant="success" />
          <StatCard title="Unread Notices" value={unread} variant="warning" />
        </div>
      )}

      {(role === "student" || role === "guardian") && (
        <div className="grid-2" style={{ marginBottom: 20 }}>
          <StatCard title="Unread Notices" value={unread} variant="warning" />
          <StatCard title="Live Now" value={stats.live} variant="danger" />
        </div>
      )}

      {role === "teacher" && (
        <div className="grid-3" style={{ marginBottom: 20 }}>
          <StatCard title="Live Now" value={stats.live} variant="danger" />
          <StatCard title="Unread Notices" value={unread} variant="warning" />
          <StatCard title="Active Courses" value={stats.courses} variant="success" />
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 8 }}>
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Today&apos;s Schedule</h3>
          {todayClasses.length === 0 ? <p style={{ color: "var(--muted)", fontSize: 13 }}>No classes scheduled today.</p> : todayClasses.map(cl => (
            <div key={cl.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
              <div>
                <span style={{ fontWeight: 600, fontSize: 13.5 }}>{cl.subjects?.name}</span>
                <span style={{ fontSize: 12, color: "var(--muted)", marginLeft: 8 }}>{cl.start_time?.slice(0,5)} - {cl.end_time?.slice(0,5)}</span>
              </div>
              <span className={`badge ${cl.status === "live" ? "badge-danger" : cl.status === "completed" ? "badge-success" : "badge-primary"}`}>
                {cl.status === "live" ? "LIVE" : cl.status}
              </span>
            </div>
          ))}
        </div>

        {(role === "admin" || role === "staff") && (
          <div className="card">
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Recent Admissions</h3>
            {recent.length === 0 ? <p style={{ color: "var(--muted)", fontSize: 13 }}>No students admitted yet.</p> : recent.map(st => (
              <div key={st.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid var(--border)", cursor: "pointer" }} onClick={() => onNavigate("StudentDetail", st)}>
                <span style={{ fontWeight: 500, fontSize: 13.5 }}>{st.profiles?.full_name}</span>
                <span className="badge badge-primary">{st.admission_number}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ========== STUDENT DETAIL ==========
function StudentDetailTab({ student, onBack, userRole }) {
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
  const [courses, setCourses] = useState([]);
  const [allSubjects, setAllSubjects] = useState([]);
  const [showCourseChange, setShowCourseChange] = useState(false);
  const [showStatusControl, setShowStatusControl] = useState(false);
  const [showFeeEdit, setShowFeeEdit] = useState(false);
  const [newCourseId, setNewCourseId] = useState("");
  const [newFeeAmount, setNewFeeAmount] = useState("");
  const [adminMsg, setAdminMsg] = useState({ type: "", text: "" });
  const [saving, setSaving] = useState(false);
  const isAdmin = userRole === "admin";

  const loadAll = useCallback(async () => {
    if (!student) return;
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
    const { data: subs } = await supabase.from("subjects").select("id").eq("course_id", student.course_id);
    const subIds = subs?.map(s => s.id) || [];
    if (subIds.length > 0) {
      const { data: chapters } = await supabase.from("chapters").select("id").in("subject_id", subIds);
      const { data: prog } = await supabase.from("chapter_progress").select("id").eq("student_id", student.id).eq("is_completed", true);
      setProgress({ total: chapters?.length || 0, done: prog?.length || 0 });
    }
    const { data: sgData } = await supabase.from("student_guardians").select("*, guardians!inner(*, profiles!inner(full_name, phone, email))").eq("student_id", student.id);
    setGuardians(sgData || []);
  }, [student]);

  useEffect(() => {
    loadAll();
    if (isAdmin) supabase.from("courses").select("*").eq("is_active", true).then(({ data }) => setCourses(data || []));
  }, [loadAll, isAdmin]);

  useEffect(() => {
    if (newCourseId) supabase.from("subjects").select("*").eq("course_id", newCourseId).then(({ data }) => setAllSubjects(data || []));
  }, [newCourseId]);

  const saveEdit = async () => {
    await supabase.from("profiles").update({ full_name: editForm.full_name, phone: editForm.phone }).eq("id", student.profile_id);
    await supabase.from("students").update({ gender: editForm.gender || null, address: editForm.address || null, date_of_birth: editForm.date_of_birth || null }).eq("id", student.id);
    setProfile(p => ({ ...p, full_name: editForm.full_name, phone: editForm.phone }));
    setEditing(false);
    setAdminMsg({ type: "success", text: "Profile updated successfully!" });
  };

  const changeCourse = async () => {
    if (!newCourseId) return;
    setSaving(true);
    await supabase.from("students").update({ course_id: newCourseId }).eq("id", student.id);
    const nc = courses.find(c => c.id === newCourseId);
    setCourse(nc); setShowCourseChange(false); setNewCourseId("");
    setAdminMsg({ type: "success", text: `Course changed to ${nc?.name}` });
    setSaving(false); await loadAll();
  };

  const changeStatus = async (newStatus) => {
    setSaving(true);
    await supabase.from("students").update({ status: newStatus }).eq("id", student.id);
    setShowStatusControl(false);
    const labels = { active: "Active", dropped: "Dropped / Terminated", completed: "Completed — Account Closed" };
    setAdminMsg({ type: newStatus === "active" ? "success" : "error", text: `Student status updated: ${labels[newStatus]}` });
    setSaving(false);
  };

  const updateFee = async () => {
    if (!newFeeAmount || Number(newFeeAmount) <= 0) return;
    setSaving(true);
    const { data: fs } = await supabase.from("fee_structures").select("id").eq("student_id", student.id).single();
    if (fs) await supabase.from("fee_structures").update({ total_amount: Number(newFeeAmount) }).eq("id", fs.id);
    setAdminMsg({ type: "success", text: `Fee updated to ₹${Number(newFeeAmount).toLocaleString()}` });
    setShowFeeEdit(false); setNewFeeAmount(""); setSaving(false); await loadAll();
  };

  if (!student) return null;
  const currentStatus = student.status || "active";
  const statusLabels = { active: "Active", dropped: "Dropped / Terminated", completed: "Completed" };

  return (
    <div>
      <button className="btn-outline" onClick={onBack} style={{ marginBottom: 16, fontSize: 13 }}>← Back to Students</button>

      {adminMsg.text && (
        <div className={adminMsg.type === "success" ? "success-box" : "error-box"} style={{ marginBottom: 12 }}>{adminMsg.text}</div>
      )}

      {currentStatus !== "active" && (
        <div style={{ padding: "10px 16px", borderRadius: 8, marginBottom: 16, fontWeight: 700, fontSize: 14, background: currentStatus === "completed" ? "var(--warning-light)" : "var(--danger-light)", color: currentStatus === "completed" ? "#7a5c00" : "var(--danger)" }}>
          ⚠️ Student Status: {statusLabels[currentStatus]}
          {isAdmin && <button className="btn-outline" style={{ marginLeft: 12, fontSize: 12 }} onClick={() => changeStatus("active")}>Reactivate</button>}
        </div>
      )}

      {/* Profile Card */}
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
              {student.father_name && <p style={{ fontSize: 13, color: "var(--muted)" }}>Father: {student.father_name}{student.mother_name ? ` | Mother: ${student.mother_name}` : ""}</p>}
              {(student.category || student.blood_group) && <p style={{ fontSize: 12, color: "var(--muted)" }}>{student.category || ""}{student.blood_group ? ` | ${student.blood_group}` : ""}{student.previous_marks ? ` | 10th: ${student.previous_marks}` : ""}</p>}
            </div>
          </div>
          {isAdmin && <button className="btn-outline" style={{ fontSize: 12 }} onClick={() => setEditing(!editing)}>{editing ? "Cancel" : "Edit Profile"}</button>}
        </div>

        {editing && (
          <div style={{ marginTop: 16, padding: 16, background: "var(--primary-light)", borderRadius: 8 }}>
            <div className="grid-3">
              <div><label className="label">Full Name</label><input className="input" value={editForm.full_name} onChange={e => setEditForm({ ...editForm, full_name: e.target.value })} /></div>
              <div><label className="label">Phone</label><input className="input" value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} /></div>
              <div><label className="label">Gender</label><select className="select" value={editForm.gender} onChange={e => setEditForm({ ...editForm, gender: e.target.value })}><option value="">Select</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></select></div>
            </div>
            <div className="grid-2" style={{ marginTop: 12 }}>
              <div><label className="label">Date of Birth</label><input className="input" type="date" value={editForm.date_of_birth} onChange={e => setEditForm({ ...editForm, date_of_birth: e.target.value })} /></div>
              <div><label className="label">Address</label><input className="input" value={editForm.address} onChange={e => setEditForm({ ...editForm, address: e.target.value })} /></div>
            </div>
            <button className="btn btn-success" style={{ marginTop: 12, fontSize: 13 }} onClick={saveEdit}>Save Changes</button>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: 16 }}>
        <StatCard title="Attendance" value={`${attendance.pct}%`} variant={attendance.pct >= 75 ? "success" : "danger"} />
        <StatCard title="Fee Paid" value={`₹${fee?.total_paid || 0}`} variant="success" />
        <StatCard title="Pending" value={`₹${fee?.pending || 0}`} variant={fee?.pending > 0 ? "danger" : "success"} />
        <StatCard title="Syllabus" value={progress.total > 0 ? `${Math.round((progress.done/progress.total)*100)}%` : "0%"} variant="primary" />
      </div>

      {/* Admin Controls */}
      {isAdmin && (
        <div className="card" style={{ marginBottom: 16, borderLeft: "4px solid var(--warning)" }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, color: "#7a5c00" }}>⚙️ Admin Controls</h3>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button className="btn-outline" style={{ fontSize: 13 }} onClick={() => { setShowCourseChange(!showCourseChange); setShowStatusControl(false); setShowFeeEdit(false); }}>📚 Change Course</button>
            <button className="btn-outline" style={{ fontSize: 13 }} onClick={() => { setShowFeeEdit(!showFeeEdit); setShowCourseChange(false); setShowStatusControl(false); }}>₹ Update Fee</button>
            <button className="btn-outline" style={{ fontSize: 13, borderColor: "var(--danger)", color: "var(--danger)" }} onClick={() => { setShowStatusControl(!showStatusControl); setShowCourseChange(false); setShowFeeEdit(false); }}>🔒 Account Control</button>
          </div>

          {showCourseChange && (
            <div style={{ marginTop: 16, padding: 16, background: "var(--bg)", borderRadius: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Current Course: <span style={{ color: "var(--primary)" }}>{course?.name}</span></div>
              <label className="label">Select New Course</label>
              <select className="select" value={newCourseId} onChange={e => setNewCourseId(e.target.value)} style={{ marginBottom: 12 }}>
                <option value="">-- Select --</option>
                {courses.filter(c => c.id !== student.course_id).map(c => <option key={c.id} value={c.id}>{c.name} (₹{c.total_fee?.toLocaleString()})</option>)}
              </select>
              {allSubjects.length > 0 && <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 12 }}>Subjects: {allSubjects.map(s => s.name).join(", ")}</div>}
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-success" onClick={changeCourse} disabled={!newCourseId || saving}>{saving ? "..." : "Confirm Change"}</button>
                <button className="btn-outline" onClick={() => setShowCourseChange(false)}>Cancel</button>
              </div>
            </div>
          )}

          {showFeeEdit && (
            <div style={{ marginTop: 16, padding: 16, background: "var(--bg)", borderRadius: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Current Total Fee: <span style={{ color: "var(--primary)" }}>₹{fee?.total_fee?.toLocaleString() || "0"}</span></div>
              <label className="label">New Fee Amount (₹)</label>
              <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                <input className="input" type="number" value={newFeeAmount} onChange={e => setNewFeeAmount(e.target.value)} placeholder="e.g. 30000" style={{ flex: 1 }} />
                <button className="btn btn-success" onClick={updateFee} disabled={saving}>{saving ? "..." : "Update"}</button>
                <button className="btn-outline" onClick={() => setShowFeeEdit(false)}>Cancel</button>
              </div>
            </div>
          )}

          {showStatusControl && (
            <div style={{ marginTop: 16, padding: 16, background: "#fff5f5", border: "1px solid var(--danger)", borderRadius: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: "var(--danger)" }}>Current Status: {statusLabels[currentStatus]}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {currentStatus !== "dropped" && (
                  <div style={{ padding: 12, background: "#fff", borderRadius: 8, border: "1px solid var(--border)" }}>
                    <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>🚫 Terminate / Drop Student</div>
                    <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 8 }}>Student dropped out or was removed from the institute.</div>
                    <button className="btn btn-danger" style={{ fontSize: 13 }} onClick={() => changeStatus("dropped")} disabled={saving}>Terminate Student</button>
                  </div>
                )}
                {currentStatus !== "completed" && (
                  <div style={{ padding: 12, background: "#fff", borderRadius: 8, border: "1px solid var(--border)" }}>
                    <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>✅ Mark Course Complete</div>
                    <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 8 }}>Student has completed 2 years. Save records and close account.</div>
                    <button className="btn" style={{ fontSize: 13, background: "var(--warning)", color: "#fff" }} onClick={() => changeStatus("completed")} disabled={saving}>Complete & Close Account</button>
                  </div>
                )}
                {currentStatus !== "active" && (
                  <div style={{ padding: 12, background: "#fff", borderRadius: 8, border: "1px solid var(--border)" }}>
                    <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>🔄 Reactivate Account</div>
                    <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 8 }}>Reactivate student if closed by mistake.</div>
                    <button className="btn btn-success" style={{ fontSize: 13 }} onClick={() => changeStatus("active")} disabled={saving}>Reactivate Student</button>
                  </div>
                )}
                <button className="btn-outline" style={{ alignSelf: "flex-start", fontSize: 12 }} onClick={() => setShowStatusControl(false)}>Cancel</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Test Results + Guardians */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Test Results</h3>
          {testResults.length === 0 ? <p style={{ color: "var(--muted)", fontSize: 13 }}>No test results yet.</p> : (
            <table><thead><tr><th>Test</th><th>Subject</th><th>Marks</th></tr></thead>
            <tbody>{testResults.map(tr => (
              <tr key={tr.id}>
                <td style={{ fontWeight: 500 }}>{tr.tests?.name}</td>
                <td><span className="badge badge-primary">{tr.tests?.subjects?.name}</span></td>
                <td style={{ fontWeight: 700, color: tr.marks_obtained >= tr.tests?.total_marks * 0.4 ? "var(--success)" : "var(--danger)" }}>{tr.marks_obtained}/{tr.tests?.total_marks}</td>
              </tr>
            ))}</tbody></table>
          )}
        </div>
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Guardians</h3>
          {guardians.length === 0 ? <p style={{ color: "var(--muted)", fontSize: 13 }}>No guardians linked yet.</p> : guardians.map(sg => (
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
function StudentsTab({ onNavigate, userRole }) {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [filter, setFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("active");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    let q = supabase.from("students").select("*, profiles!inner(full_name, phone, email), courses(name)").order("created_at", { ascending: false });
    if (statusFilter !== "all") q = q.eq("status", statusFilter);
    if (filter !== "all") q = q.eq("course_id", filter);
    const { data } = await q;
    setStudents(data || []);
    setLoading(false);
  }, [filter, statusFilter]);

  useEffect(() => {
    load();
    supabase.from("courses").select("*").eq("is_active", true).then(({ data }) => setCourses(data || []));
  }, [load]);

  const filtered = students.filter(st => {
    if (!search) return true;
    const s = search.toLowerCase();
    return st.profiles?.full_name?.toLowerCase().includes(s) || st.admission_number?.toLowerCase().includes(s) || st.profiles?.phone?.includes(s);
  });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div><h1 className="page-title">Students</h1><p style={{ fontSize: 13, color: "var(--muted)" }}>{filtered.length} students found</p></div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <input className="input" style={{ width: 180 }} placeholder="Search name / phone..." value={search} onChange={e => setSearch(e.target.value)} />
          <select className="select" style={{ width: 120 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="active">Active</option>
            <option value="dropped">Dropped</option>
            <option value="completed">Completed</option>
            <option value="all">All Status</option>
          </select>
          <button className={`tag ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>All</button>
          {courses.map(c => <button key={c.id} className={`tag ${filter === c.id ? "active" : ""}`} onClick={() => setFilter(c.id)}>{c.name}</button>)}
        </div>
      </div>
      <div className="card">
        {loading ? <p style={{ color: "var(--muted)" }}>Loading...</p> : filtered.length === 0 ? <p className="empty-state">No students found.</p> : (
          <table><thead><tr><th>Name</th><th>Adm. No.</th><th>Course</th><th>Phone</th><th>Status</th><th>Date</th><th></th></tr></thead>
          <tbody>{filtered.map(st => (
            <tr key={st.id} style={{ cursor: "pointer" }} onClick={() => onNavigate("StudentDetail", st)}>
              <td style={{ fontWeight: 600 }}>{st.profiles?.full_name}</td>
              <td><span className="badge badge-primary">{st.admission_number}</span></td>
              <td>{st.courses?.name}</td>
              <td>{st.profiles?.phone || "-"}</td>
              <td><span className={`badge ${st.status === "active" ? "badge-success" : st.status === "completed" ? "badge-warning" : "badge-danger"}`}>{st.status}</span></td>
              <td>{st.admission_date ? new Date(st.admission_date).toLocaleDateString("en-IN") : "-"}</td>
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
  const [subjects, setSubjects] = useState([]);
  const [selStream, setSelStream] = useState("");
  const [selClass, setSelClass] = useState("");
  const [form, setForm] = useState({
    fullName: "", phone: "", email: "", courseId: "", fee: "", selectedSubjects: [],
    gender: "", address: "", dob: "", fatherName: "", motherName: "",
    aadhar: "", category: "", religion: "", previousSchool: "", previousMarks: "", emergencyContact: "", bloodGroup: ""
  });
  const [photos, setPhotos] = useState({ student: "", father: "", mother: "" });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [step, setStep] = useState(1);
  const [admittedData, setAdmittedData] = useState(null);

  const STREAMS = [
    { label: "Science", key: "science", color: "#1a2a6c" },
    { label: "Commerce", key: "commerce", color: "#b8860b" },
    { label: "Arts / Humanities", key: "arts", color: "#1a6c3a" },
  ];
  const CLASSES = ["11th", "12th"];

  useEffect(() => {
    supabase.from("courses").select("*").eq("is_active", true).order("name").then(({ data }) => setCourses(data || []));
  }, []);

  useEffect(() => {
    if (form.courseId) {
      supabase.from("subjects").select("*").eq("course_id", form.courseId).then(({ data }) => {
        setSubjects(data || []);
        setForm(f => ({ ...f, selectedSubjects: (data || []).map(s => s.id) }));
      });
    } else { setSubjects([]); }
  }, [form.courseId]);

  useEffect(() => {
    if (selStream && selClass) {
      const matched = courses.find(c => {
        const n = c.name?.toLowerCase();
        return n.startsWith(selClass.toLowerCase()) && n.includes(selStream.toLowerCase());
      });
      if (matched) setForm(f => ({ ...f, courseId: matched.id, fee: matched.total_fee?.toString() || "" }));
    }
  }, [selStream, selClass, courses]);

  const toggleSubject = (sid) => {
    setForm(f => ({
      ...f,
      selectedSubjects: f.selectedSubjects.includes(sid)
        ? f.selectedSubjects.filter(id => id !== sid)
        : [...f.selectedSubjects, sid]
    }));
  };

  const selectedCourse = courses.find(c => c.id === form.courseId);
  const streamColor = selStream === "science" ? "#1a2a6c" : selStream === "commerce" ? "#b8860b" : selStream === "arts" ? "#1a6c3a" : "var(--primary)";

  const submit = async () => {
    if (!form.fullName || !form.phone || !form.courseId) { setMsg({ type: "error", text: "Full name, phone and class/stream are required!" }); return; }
    if (!form.fee || Number(form.fee) <= 0) { setMsg({ type: "error", text: "Please enter a valid fee amount!" }); return; }
    setLoading(true); setMsg({ type: "", text: "" });
    try {
      const email = form.email || (form.phone + "@student.mca.local");
      const tempPass = "MCA@" + Date.now().toString().slice(-6);
      const { data: userId, error: authErr } = await supabase.rpc("create_student_account", {
        p_email: email, p_password: tempPass, p_full_name: form.fullName, p_role: "student"
      });
      if (authErr) throw authErr;
      if (!userId) throw new Error("User creation failed. Please try again.");
      await supabase.from("profiles").update({ phone: form.phone }).eq("id", userId);
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
      const { data: stData } = await supabase.from("students").select("id").eq("profile_id", userId).single();
      if (stData) {
        await supabase.from("fee_structures").insert({ student_id: stData.id, total_amount: Number(form.fee) });
        await supabase.from("income_records").insert({ category: "admission_fee", amount: 0, description: "Admission - " + admNo, student_id: stData.id, income_date: new Date().toISOString().split("T")[0] });
      }
      const subjectNames = subjects.filter(s => form.selectedSubjects.includes(s.id)).map(s => s.name);
      setAdmittedData({ admNo, tempPass, email, form: { ...form }, course: selectedCourse, photos: { ...photos }, date: new Date().toLocaleDateString("en-IN"), subjectNames });
      setMsg({ type: "success", text: `✅ Admission Successful!\nAdmission No: ${admNo}\nLogin Email: ${email}\nPassword: ${tempPass}` });
      setForm({ fullName: "", phone: "", email: "", courseId: "", fee: "", selectedSubjects: [], gender: "", address: "", dob: "", fatherName: "", motherName: "", aadhar: "", category: "", religion: "", previousSchool: "", previousMarks: "", emergencyContact: "", bloodGroup: "" });
      setPhotos({ student: "", father: "", mother: "" });
      setSelStream(""); setSelClass(""); setStep(1);
    } catch (e) { setMsg({ type: "error", text: e.message }); }
    setLoading(false);
  };

  const printAdmission = () => {
    if (!admittedData) return;
    const d = admittedData;
    const w = window.open("", "_blank");
    w.document.write(`<html><head><title>Admission Form</title><style>body{font-family:Arial,sans-serif;padding:20px;color:#000}table{width:100%;border-collapse:collapse;margin:10px 0}td,th{border:1px solid #ccc;padding:8px;font-size:13px}.section{background:#e8f0e8;padding:8px 12px;font-weight:bold;color:#1a5c2e;border:1px solid #ccc}.header{text-align:center;border-bottom:3px solid #1a5c2e;padding-bottom:15px;margin-bottom:20px}@media print{body{padding:5px}}</style></head><body>
    <div class="header"><img src="${admittedData.photos?.student || ""}" style="display:none"/><div style="font-size:22px;font-weight:bold;color:#1a5c2e">MY CAREER ACADEMIC</div><div style="font-size:12px;font-weight:bold">A Division of MY LIFELINE FOUNDATION</div><div style="font-size:11px;color:#555">Kendrapara Town, Maruti Chhak, Khairabad, Kendrapara — 754211 | Ph: 06727796700</div><div style="font-size:15px;font-weight:bold;margin-top:8px;text-decoration:underline">ADMISSION FORM</div></div>
    <table><tr><td colspan="3" class="section">ADMISSION DETAILS</td><td rowspan="5" style="text-align:center;width:100px">${d.photos.student ? `<img src="${d.photos.student}" style="width:90px;height:110px;object-fit:cover;border:1px solid #ccc"/>` : '<div style="width:90px;height:110px;border:1px solid #ccc;display:flex;align-items:center;justify-content:center">Photo</div>'}<br><small>Student</small></td></tr>
    <tr><td><b>Admission No.</b></td><td colspan="2">${d.admNo}</td></tr>
    <tr><td><b>Date</b></td><td colspan="2">${d.date}</td></tr>
    <tr><td><b>Class / Stream</b></td><td colspan="2">${d.course?.name || ""}</td></tr>
    <tr><td><b>Subjects</b></td><td colspan="2">${d.subjectNames?.join(", ") || "-"}</td></tr>
    <tr><td><b>Total Fee</b></td><td colspan="3">&#8377;${Number(d.form.fee).toLocaleString()}</td></tr></table>
    <table><tr><td colspan="4" class="section">PERSONAL INFORMATION</td></tr>
    <tr><td><b>Full Name</b></td><td colspan="3">${d.form.fullName}</td></tr>
    <tr><td><b>Mobile</b></td><td>${d.form.phone}</td><td><b>Email</b></td><td>${d.form.email || "-"}</td></tr>
    <tr><td><b>Gender</b></td><td>${d.form.gender || "-"}</td><td><b>Date of Birth</b></td><td>${d.form.dob || "-"}</td></tr>
    <tr><td><b>Blood Group</b></td><td>${d.form.bloodGroup || "-"}</td><td><b>Aadhar No.</b></td><td>${d.form.aadhar || "-"}</td></tr>
    <tr><td><b>Address</b></td><td colspan="3">${d.form.address || "-"}</td></tr></table>
    <table><tr><td colspan="2" class="section">FAMILY DETAILS</td>
    <td style="text-align:center;width:100px">${d.photos.father ? `<img src="${d.photos.father}" style="width:70px;height:85px;object-fit:cover"/>` : ""}<br><small>Father</small></td>
    <td style="text-align:center;width:100px">${d.photos.mother ? `<img src="${d.photos.mother}" style="width:70px;height:85px;object-fit:cover"/>` : ""}<br><small>Mother</small></td></tr>
    <tr><td><b>Father's Name</b></td><td>${d.form.fatherName || "-"}</td><td><b>Mother's Name</b></td><td>${d.form.motherName || "-"}</td></tr>
    <tr><td><b>Category</b></td><td>${d.form.category || "-"}</td><td><b>Religion</b></td><td>${d.form.religion || "-"}</td></tr>
    <tr><td><b>Emergency Contact</b></td><td colspan="3">${d.form.emergencyContact || "-"}</td></tr></table>
    <table><tr><td colspan="4" class="section">PREVIOUS EDUCATION</td></tr>
    <tr><td><b>Previous School</b></td><td>${d.form.previousSchool || "-"}</td><td><b>10th Marks</b></td><td>${d.form.previousMarks || "-"}</td></tr></table>
    <table><tr><td colspan="4" class="section">LOGIN CREDENTIALS</td></tr>
    <tr><td><b>Login Email</b></td><td>${d.email}</td><td><b>Password</b></td><td>${d.tempPass}</td></tr>
    <tr><td><b>Website</b></td><td colspan="3">my-career-academic.vercel.app</td></tr></table>
    <div style="margin-top:40px;display:flex;justify-content:space-between;padding:0 20px">
    <div style="text-align:center;border-top:1px solid #333;padding-top:5px;width:150px;font-size:12px">Student Signature</div>
    <div style="text-align:center;border-top:1px solid #333;padding-top:5px;width:150px;font-size:12px">Parent Signature</div>
    <div style="text-align:center;border-top:1px solid #333;padding-top:5px;width:150px;font-size:12px">Admin Signature</div></div>
    <div style="text-align:center;margin-top:20px;font-size:10px;color:#999">Computer generated admission form | My Career Academic</div>
    </body></html>`);
    w.document.close(); w.print();
  };

  const sendWhatsApp = () => {
    if (!admittedData) return;
    const phone = admittedData.form.phone.replace(/\D/g, "");
    const text = `🎓 *MY CAREER ACADEMIC*\n\nDear ${admittedData.form.fullName},\n\nYour admission has been successfully completed!\n\n📋 *Admission Details:*\n• Admission No: ${admittedData.admNo}\n• Class: ${admittedData.course?.name}\n• Fee: ₹${Number(admittedData.form.fee).toLocaleString()}\n• Subjects: ${admittedData.subjectNames?.join(", ")}\n\n🔐 *Login Credentials:*\n• Website: my-career-academic.vercel.app\n• Email: ${admittedData.email}\n• Password: ${admittedData.tempPass}\n\nFor queries: 06727796700\n\n_My Career Academic — A Division of MY LIFELINE FOUNDATION_`;
    window.open("https://wa.me/91" + phone + "?text=" + encodeURIComponent(text), "_blank");
  };

  return (
    <div>
      <h1 className="page-title">New Admission</h1>
      <p className="page-sub">11th &amp; 12th Class — Arts, Commerce, Science</p>

      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        {[1, 2, 3].map(s => (
          <div key={s} onClick={() => setStep(s)} style={{ flex: 1, padding: "10px 16px", borderRadius: 8, cursor: "pointer", textAlign: "center", fontSize: 13, fontWeight: 600, background: step === s ? "var(--primary)" : "var(--primary-light)", color: step === s ? "#fff" : "var(--primary)" }}>
            {s === 1 ? "1. Personal Info" : s === 2 ? "2. Class & Subjects" : "3. Family & Previous"}
          </div>
        ))}
      </div>

      <div className="card" style={{ maxWidth: 720 }}>
        {msg.text && (
          <div className={msg.type === "success" ? "success-box" : "error-box"} style={{ whiteSpace: "pre-line", marginBottom: 16 }}>
            {msg.text}
            {msg.type === "success" && admittedData && (
              <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                <button className="btn" style={{ fontSize: 13 }} onClick={printAdmission}>🖨️ Print Admission Form</button>
                <button className="btn" style={{ background: "#25D366", border: "none", fontSize: 13 }} onClick={sendWhatsApp}>📱 Send on WhatsApp</button>
              </div>
            )}
          </div>
        )}

        {/* STEP 1 */}
        {step === 1 && (
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Personal Information & Photos</h3>
            <div style={{ display: "flex", gap: 16, marginBottom: 20, justifyContent: "center", padding: 16, background: "var(--bg)", borderRadius: 8 }}>
              <PhotoUpload label="Student Photo" value={photos.student} onChange={v => setPhotos({ ...photos, student: v })} />
              <PhotoUpload label="Father Photo" value={photos.father} onChange={v => setPhotos({ ...photos, father: v })} />
              <PhotoUpload label="Mother Photo" value={photos.mother} onChange={v => setPhotos({ ...photos, mother: v })} />
            </div>
            <div className="grid-2">
              <div className="form-group"><label className="label">Full Name *</label><input className="input" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} placeholder="Student full name" /></div>
              <div className="form-group"><label className="label">Mobile Number *</label><input className="input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="10-digit mobile number" /></div>
            </div>
            <div className="grid-3">
              <div className="form-group"><label className="label">Gender</label><select className="select" value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}><option value="">Select</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></select></div>
              <div className="form-group"><label className="label">Date of Birth</label><input className="input" type="date" value={form.dob} onChange={e => setForm({ ...form, dob: e.target.value })} /></div>
              <div className="form-group"><label className="label">Blood Group</label><select className="select" value={form.bloodGroup} onChange={e => setForm({ ...form, bloodGroup: e.target.value })}><option value="">Select</option>{["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(bg => <option key={bg} value={bg}>{bg}</option>)}</select></div>
            </div>
            <div className="grid-2">
              <div className="form-group"><label className="label">Email (optional)</label><input className="input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="student@email.com" /></div>
              <div className="form-group"><label className="label">Aadhar Number</label><input className="input" value={form.aadhar} onChange={e => setForm({ ...form, aadhar: e.target.value })} placeholder="12-digit Aadhar number" /></div>
            </div>
            <div className="form-group"><label className="label">Address</label><input className="input" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Village / Town, District, State" /></div>
            <button className="btn" onClick={() => { if (!form.fullName || !form.phone) { setMsg({ type: "error", text: "Name and phone are required!" }); return; } setMsg({ type: "", text: "" }); setStep(2); }}>Next → Class & Subjects</button>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Select Class & Subjects</h3>
            <div style={{ marginBottom: 20 }}>
              <label className="label" style={{ marginBottom: 10, display: "block" }}>Select Stream *</label>
              <div style={{ display: "flex", gap: 10 }}>
                {STREAMS.map(st => (
                  <div key={st.key} onClick={() => setSelStream(st.key)} style={{ flex: 1, padding: "14px 10px", borderRadius: 10, cursor: "pointer", textAlign: "center", fontWeight: 700, fontSize: 14, transition: "all 0.15s", border: selStream === st.key ? `2px solid ${st.color}` : "2px solid var(--border)", background: selStream === st.key ? st.color : "#fff", color: selStream === st.key ? "#fff" : "#333", boxShadow: selStream === st.key ? "0 4px 12px rgba(0,0,0,0.15)" : "none" }}>
                    {st.label}
                  </div>
                ))}
              </div>
            </div>

            {selStream && (
              <div style={{ marginBottom: 20 }}>
                <label className="label" style={{ marginBottom: 10, display: "block" }}>Select Class *</label>
                <div style={{ display: "flex", gap: 10 }}>
                  {CLASSES.map(cls => (
                    <div key={cls} onClick={() => setSelClass(cls)} style={{ flex: 1, padding: "14px 10px", borderRadius: 10, cursor: "pointer", textAlign: "center", fontWeight: 700, fontSize: 18, transition: "all 0.15s", border: selClass === cls ? `2px solid ${streamColor}` : "2px solid var(--border)", background: selClass === cls ? streamColor : "#fff", color: selClass === cls ? "#fff" : "#333" }}>
                      {cls}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {form.courseId && (
              <div style={{ marginBottom: 20, padding: 16, background: "var(--bg)", borderRadius: 10, border: "1px solid var(--border)" }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: streamColor, marginBottom: 10 }}>✓ {selectedCourse?.name}</div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="label">Fee Amount (₹) — Admin can modify *</label>
                  <input className="input" type="number" value={form.fee} onChange={e => setForm({ ...form, fee: e.target.value })} placeholder="Enter fee amount" style={{ fontWeight: 700, fontSize: 16 }} />
                  {selectedCourse?.total_fee && Number(form.fee) !== selectedCourse.total_fee && (
                    <div style={{ fontSize: 12, color: "var(--warning)", marginTop: 4 }}>Default: ₹{selectedCourse.total_fee.toLocaleString()} — Modified</div>
                  )}
                </div>
              </div>
            )}

            {subjects.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <label className="label" style={{ marginBottom: 10, display: "block" }}>Subjects — {form.selectedSubjects.length} selected (click to add/remove)</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {subjects.map(sub => {
                    const isSel = form.selectedSubjects.includes(sub.id);
                    return (
                      <div key={sub.id} onClick={() => toggleSubject(sub.id)} style={{ padding: "8px 16px", borderRadius: 20, cursor: "pointer", fontWeight: 600, fontSize: 13, transition: "all 0.15s", border: isSel ? `2px solid ${streamColor}` : "2px solid var(--border)", background: isSel ? streamColor : "#fff", color: isSel ? "#fff" : "#555", userSelect: "none" }}>
                        {isSel ? "✓ " : "+ "}{sub.name}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {!selStream && <div style={{ padding: 20, textAlign: "center", color: "var(--muted)", fontSize: 14 }}>☝️ Please select a stream first</div>}

            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
              <button className="btn-outline" onClick={() => setStep(1)}>← Back</button>
              <button className="btn" onClick={() => { if (!form.courseId) { setMsg({ type: "error", text: "Please select stream and class!" }); return; } if (!form.fee || Number(form.fee) <= 0) { setMsg({ type: "error", text: "Please enter fee amount!" }); return; } setMsg({ type: "", text: "" }); setStep(3); }}>Next → Family Details</button>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div>
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
              <div className="form-group"><label className="label">Previous School / College</label><input className="input" value={form.previousSchool} onChange={e => setForm({ ...form, previousSchool: e.target.value })} placeholder="Last attended institution" /></div>
              <div className="form-group"><label className="label">10th Marks / Percentage</label><input className="input" value={form.previousMarks} onChange={e => setForm({ ...form, previousMarks: e.target.value })} placeholder="e.g. 85% or 425/500" /></div>
            </div>

            <div style={{ marginTop: 16, padding: 16, background: "var(--bg)", borderRadius: 8, fontSize: 13, lineHeight: 1.8 }}>
              <div style={{ fontWeight: 700, marginBottom: 6, color: "var(--primary)" }}>📋 Admission Summary</div>
              <div><b>Name:</b> {form.fullName} &nbsp;|&nbsp; <b>Phone:</b> {form.phone}</div>
              <div><b>Class:</b> {selectedCourse?.name || "Not selected"} &nbsp;|&nbsp; <b>Fee:</b> ₹{Number(form.fee || 0).toLocaleString()}</div>
              <div><b>Subjects ({form.selectedSubjects.length}):</b> {subjects.filter(s => form.selectedSubjects.includes(s.id)).map(s => s.name).join(", ") || "-"}</div>
              {form.fatherName && <div><b>Father:</b> {form.fatherName}{form.motherName ? ` &nbsp;|&nbsp; Mother: ${form.motherName}` : ""}</div>}
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
              <button className="btn-outline" onClick={() => setStep(2)}>← Back</button>
              <button className="btn btn-success" style={{ flex: 1, padding: 14, fontSize: 15 }} onClick={submit} disabled={loading}>
                {loading ? "Processing Admission..." : "✓ Complete Admission"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ========== COURSES ==========
function CoursesTab() {
  const [courses, setCourses] = useState([]); const [showForm, setShowForm] = useState(false); const [form, setForm] = useState({ name: "", description: "", duration: "", fee: "" }); const [editId, setEditId] = useState(null);
  const [subjects, setSubjects] = useState({}); const [newSubject, setNewSubject] = useState({}); const [chapters, setChapters] = useState({}); const [newChapter, setNewChapter] = useState({}); const [expanded, setExpanded] = useState(null);
  const loadCourses = async () => { const { data } = await supabase.from("courses").select("*").order("name"); setCourses(data || []); };
  useEffect(() => { loadCourses(); }, []);
  const loadSubjects = async (cid) => {
    const { data } = await supabase.from("subjects").select("*").eq("course_id", cid).order("created_at");
    setSubjects(p => ({ ...p, [cid]: data || [] }));
    for (const s of (data || [])) { const { data: ch } = await supabase.from("chapters").select("*").eq("subject_id", s.id).order("sort_order"); setChapters(p => ({ ...p, [s.id]: ch || [] })); }
  };
  const toggleExpand = (id) => { if (expanded === id) { setExpanded(null); return; } setExpanded(id); loadSubjects(id); };
  const saveCourse = async () => { if (!form.name || !form.fee) return; if (editId) { await supabase.from("courses").update({ name: form.name, description: form.description || null, duration_months: form.duration ? Number(form.duration) : null, total_fee: Number(form.fee) }).eq("id", editId); } else { await supabase.from("courses").insert({ name: form.name, description: form.description || null, duration_months: form.duration ? Number(form.duration) : null, total_fee: Number(form.fee) }); } setForm({ name: "", description: "", duration: "", fee: "" }); setEditId(null); setShowForm(false); loadCourses(); };
  const editCourse = (c) => { setForm({ name: c.name, description: c.description || "", duration: c.duration_months?.toString() || "", fee: c.total_fee?.toString() || "" }); setEditId(c.id); setShowForm(true); };
  const toggleCourse = async (c) => { await supabase.from("courses").update({ is_active: !c.is_active }).eq("id", c.id); loadCourses(); };
  const addSubject = async (cid) => { if (!newSubject[cid]) return; await supabase.from("subjects").insert({ name: newSubject[cid], course_id: cid }); setNewSubject(p => ({ ...p, [cid]: "" })); loadSubjects(cid); };
  const deleteSubject = async (sid, cid) => { if (!confirm("Delete this subject and all its chapters?")) return; await supabase.from("subjects").delete().eq("id", sid); loadSubjects(cid); };
  const addChapter = async (sid, cid) => { if (!newChapter[sid]) return; const ex = chapters[sid] || []; await supabase.from("chapters").insert({ name: newChapter[sid], subject_id: sid, sort_order: ex.length + 1 }); setNewChapter(p => ({ ...p, [sid]: "" })); loadSubjects(cid); };
  const deleteChapter = async (chid, cid) => { await supabase.from("chapters").delete().eq("id", chid); loadSubjects(cid); };
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div><h1 className="page-title">Courses</h1><p className="page-sub" style={{ marginBottom: 0 }}>{courses.length} courses</p></div>
        <button className="btn btn-accent" onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ name: "", description: "", duration: "", fee: "" }); }}>+ Add Course</button>
      </div>
      {showForm && (<div className="card" style={{ marginBottom: 20, borderColor: "var(--accent)" }}>
        <div className="grid-2"><div><label className="label">Course Name *</label><input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. 11th Science" /></div><div><label className="label">Total Fee (₹) *</label><input className="input" type="number" value={form.fee} onChange={e => setForm({ ...form, fee: e.target.value })} /></div></div>
        <div className="grid-2" style={{ marginTop: 12 }}><div><label className="label">Duration (months)</label><input className="input" type="number" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} placeholder="12" /></div><div><label className="label">Description</label><input className="input" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div></div>
        <div style={{ display: "flex", gap: 8, marginTop: 14 }}><button className="btn btn-success" onClick={saveCourse}>{editId ? "Update Course" : "Create Course"}</button><button className="btn-outline" onClick={() => setShowForm(false)}>Cancel</button></div>
      </div>)}
      {courses.map(c => (
        <div key={c.id} className="card" style={{ marginBottom: 12, opacity: c.is_active ? 1 : 0.6 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ cursor: "pointer", flex: 1 }} onClick={() => toggleExpand(c.id)}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}><span style={{ fontWeight: 700, fontSize: 15 }}>{c.name}</span><span className={`badge ${c.is_active ? "badge-success" : "badge-muted"}`}>{c.is_active ? "Active" : "Inactive"}</span></div>
              <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>₹{c.total_fee?.toLocaleString()} | {c.duration_months || "-"} months</div>
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
                    <span style={{ fontWeight: 600 }}>{sub.name}</span>
                    <button style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer", fontSize: 12 }} onClick={() => deleteSubject(sub.id, c.id)}>Delete Subject</button>
                  </div>
                  {(chapters[sub.id] || []).map((ch, i) => (
                    <div key={ch.id} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0 4px 16px", fontSize: 13 }}>
                      <span>{i + 1}. {ch.name}</span>
                      <button style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer", fontSize: 11 }} onClick={() => deleteChapter(ch.id, c.id)}>✕</button>
                    </div>
                  ))}
                  <div style={{ display: "flex", gap: 8, marginTop: 8, paddingLeft: 16 }}>
                    <input className="input" style={{ flex: 1, padding: "6px 10px", fontSize: 12 }} placeholder="Add new chapter..." value={newChapter[sub.id] || ""} onChange={e => setNewChapter(p => ({ ...p, [sub.id]: e.target.value }))} onKeyDown={e => e.key === "Enter" && addChapter(sub.id, c.id)} />
                    <button className="btn" style={{ fontSize: 11, padding: "6px 12px" }} onClick={() => addChapter(sub.id, c.id)}>+ Add</button>
                  </div>
                </div>
              ))}
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <input className="input" style={{ flex: 1, padding: "8px 10px", fontSize: 13 }} placeholder="Add new subject..." value={newSubject[c.id] || ""} onChange={e => setNewSubject(p => ({ ...p, [c.id]: e.target.value }))} onKeyDown={e => e.key === "Enter" && addSubject(c.id)} />
                <button className="btn btn-accent" style={{ fontSize: 12, padding: "8px 16px" }} onClick={() => addSubject(c.id)}>+ Subject</button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ========== TIMETABLE ==========
function TimetableTab({ profile }) {
  const [courses, setCourses] = useState([]); const [selCourse, setSelCourse] = useState(""); const [subjects, setSubjects] = useState([]); const [staffList, setStaffList] = useState([]);
  const [schedules, setSchedules] = useState([]); const [showForm, setShowForm] = useState(false); const [selDay, setSelDay] = useState(new Date().getDay());
  const [form, setForm] = useState({ subjectId: "", teacherId: "", startTime: "", endTime: "", room: "", dayOfWeek: "" });
  const isAdmin = profile?.role === "admin";
  const isStudent = profile?.role === "student" || profile?.role === "guardian";

  const load = useCallback(async () => {
    if (!selCourse) return;
    const { data } = await supabase.from("class_schedules").select("*, subjects(name), staff!inner(profiles!inner(full_name))").eq("course_id", selCourse).order("start_time");
    setSchedules(data || []);
  }, [selCourse]);

  useEffect(() => {
    if (isStudent) {
      supabase.from("students").select("course_id, courses(*)").eq("profile_id", profile.id).single().then(({ data }) => {
        if (data?.course_id) { setSelCourse(data.course_id); setCourses(data.courses ? [data.courses] : []); }
      });
    } else {
      supabase.from("courses").select("*").eq("is_active", true).then(({ data }) => { setCourses(data || []); if (data?.length) setSelCourse(data[0].id); });
    }
  }, [isStudent, profile?.id]);

  useEffect(() => { load(); }, [selCourse, load]);
  useEffect(() => { if (selCourse && !isStudent) { supabase.from("subjects").select("*").eq("course_id", selCourse).then(({ data }) => setSubjects(data || [])); supabase.from("staff").select("*, profiles!inner(full_name)").then(({ data }) => setStaffList(data || [])); } }, [selCourse, isStudent]);

  const addSchedule = async () => {
    if (!form.subjectId || !form.teacherId || !form.startTime || !form.endTime || form.dayOfWeek === "") return;
    await supabase.from("class_schedules").insert({ course_id: selCourse, subject_id: form.subjectId, teacher_id: form.teacherId, day_of_week: Number(form.dayOfWeek), start_time: form.startTime, end_time: form.endTime, room: form.room || null });
    setForm({ subjectId: "", teacherId: "", startTime: "", endTime: "", room: "", dayOfWeek: "" }); setShowForm(false); load();
  };
  const deleteSchedule = async (id) => { await supabase.from("class_schedules").delete().eq("id", id); load(); };
  const generateToday = async () => {
    const today = new Date().toISOString().split("T")[0]; const dow = new Date().getDay();
    const todaySchedules = schedules.filter(s => s.day_of_week === dow);
    if (todaySchedules.length === 0) { alert("No classes scheduled for today (" + DAYS[dow] + ")"); return; }
    const { data: existing } = await supabase.from("live_classes").select("id").eq("class_date", today).eq("course_id", selCourse);
    if (existing && existing.length > 0) { alert("Today's classes already generated!"); return; }
    for (const s of todaySchedules) { await supabase.from("live_classes").insert({ schedule_id: s.id, course_id: selCourse, subject_id: s.subject_id, teacher_id: s.teacher_id, class_date: today, start_time: s.start_time, end_time: s.end_time, room: s.room, status: "scheduled" }); }
    alert(todaySchedules.length + " classes generated for today!");
  };
  const daySchedules = schedules.filter(s => s.day_of_week === selDay);
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div><h1 className="page-title">Weekly Timetable</h1><p className="page-sub" style={{ marginBottom: 0 }}>Recurring class schedule</p></div>
        {!isStudent && <div style={{ display: "flex", gap: 8 }}>{courses.map(c => <button key={c.id} className={`tag ${selCourse === c.id ? "active" : ""}`} onClick={() => setSelCourse(c.id)}>{c.name}</button>)}</div>}
      </div>
      <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
        {DAYS.map((d, i) => <button key={i} className={`tag ${selDay === i ? "active" : ""}`} onClick={() => setSelDay(i)}>{DAYS_SHORT[i]}</button>)}
        {isAdmin && <>
          <button className="btn btn-accent" style={{ marginLeft: "auto" }} onClick={() => { setShowForm(!showForm); setForm({ ...form, dayOfWeek: selDay.toString() }); }}>+ Add Slot</button>
          <button className="btn" onClick={generateToday}>Generate Today</button>
        </>}
      </div>
      {showForm && isAdmin && (
        <div className="card" style={{ marginBottom: 16, borderColor: "var(--accent)" }}>
          <div className="grid-3">
            <div><label className="label">Day</label><select className="select" value={form.dayOfWeek} onChange={e => setForm({ ...form, dayOfWeek: e.target.value })}><option value="">Select</option>{DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}</select></div>
            <div><label className="label">Subject</label><select className="select" value={form.subjectId} onChange={e => setForm({ ...form, subjectId: e.target.value })}><option value="">Select</option>{subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
            <div><label className="label">Teacher</label><select className="select" value={form.teacherId} onChange={e => setForm({ ...form, teacherId: e.target.value })}><option value="">Select</option>{staffList.map(s => <option key={s.id} value={s.id}>{s.profiles?.full_name}</option>)}</select></div>
          </div>
          <div className="grid-3" style={{ marginTop: 12 }}>
            <div><label className="label">Start Time</label><input className="input" type="time" value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} /></div>
            <div><label className="label">End Time</label><input className="input" type="time" value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })} /></div>
            <div><label className="label">Room</label><input className="input" value={form.room} onChange={e => setForm({ ...form, room: e.target.value })} placeholder="e.g. Room 1" /></div>
          </div>
          <button className="btn btn-success" style={{ marginTop: 12 }} onClick={addSchedule}>Save Slot</button>
        </div>
      )}
      <div className="card">
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>{DAYS[selDay]} Schedule</h3>
        {daySchedules.length === 0 ? <p className="empty-state">No classes on {DAYS[selDay]}.</p> : (
          <table><thead><tr><th>Time</th><th>Subject</th><th>Teacher</th><th>Room</th>{isAdmin && <th></th>}</tr></thead>
          <tbody>{daySchedules.map(s => (
            <tr key={s.id}>
              <td style={{ fontWeight: 600 }}>{s.start_time?.slice(0,5)} - {s.end_time?.slice(0,5)}</td>
              <td><span className="badge badge-primary">{s.subjects?.name}</span></td>
              <td>{s.staff?.profiles?.full_name}</td>
              <td>{s.room || "-"}</td>
              {isAdmin && <td><button style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer", fontSize: 12, fontWeight: 600 }} onClick={() => deleteSchedule(s.id)}>Delete</button></td>}
            </tr>
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
  const isStaff = ["admin","staff","teacher"].includes(profile?.role);
  const isStudent = profile?.role === "student" || profile?.role === "guardian";
  const today = new Date().toISOString().split("T")[0];

  const load = useCallback(async () => {
    let q = supabase.from("live_classes").select("*, subjects(name), staff!inner(id, profiles!inner(full_name))").eq("class_date", today);
    if (selCourse) q = q.eq("course_id", selCourse);
    const { data } = await q.order("start_time");
    setClasses(data || []);
  }, [selCourse, today]);

  useEffect(() => {
    if (isStudent) {
      supabase.from("students").select("course_id, courses(*)").eq("profile_id", profile.id).single().then(({ data }) => {
        if (data?.course_id) { setSelCourse(data.course_id); setCourses(data.courses ? [data.courses] : []); }
      });
    } else {
      supabase.from("courses").select("*").eq("is_active", true).then(({ data }) => { setCourses(data || []); if (data?.length) setSelCourse(data[0].id); });
    }
  }, [isStudent, profile?.id]);

  useEffect(() => { if (selCourse) load(); }, [selCourse, load]);
  useEffect(() => { if (selCourse && !isStudent) { supabase.from("subjects").select("*").eq("course_id", selCourse).then(({ data }) => setSubjects(data || [])); supabase.from("staff").select("*, profiles!inner(full_name)").then(({ data }) => setStaffList(data || [])); } }, [selCourse, isStudent]);

  const updateStatus = async (id, st) => { await supabase.from("live_classes").update({ status: st }).eq("id", id); load(); };
  const addClass = async () => {
    if (!form.subjectId || !form.teacherId || !form.startTime || !form.endTime) return;
    await supabase.from("live_classes").insert({ course_id: selCourse, subject_id: form.subjectId, teacher_id: form.teacherId, class_date: today, start_time: form.startTime, end_time: form.endTime, topic: form.topic || null, status: "scheduled" });
    setShowForm(false); setForm({ subjectId: "", teacherId: "", startTime: "", endTime: "", topic: "" }); load();
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div><h1 className="page-title">Today&apos;s Classes</h1><p style={{ fontSize: 13, color: "var(--muted)" }}>{today}</p></div>
        <div style={{ display: "flex", gap: 8 }}>
          {!isStudent && courses.map(c => <button key={c.id} className={`tag ${selCourse === c.id ? "active" : ""}`} onClick={() => setSelCourse(c.id)}>{c.name}</button>)}
          {isStaff && <button className="btn btn-accent" onClick={() => setShowForm(!showForm)}>+ Add Class</button>}
        </div>
      </div>
      {showForm && isStaff && (
        <div className="card" style={{ marginBottom: 20, borderColor: "var(--accent)" }}>
          <div className="grid-3">
            <div><label className="label">Subject</label><select className="select" value={form.subjectId} onChange={e => setForm({ ...form, subjectId: e.target.value })}><option value="">Select</option>{subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
            <div><label className="label">Teacher</label><select className="select" value={form.teacherId} onChange={e => setForm({ ...form, teacherId: e.target.value })}><option value="">Select</option>{staffList.map(s => <option key={s.id} value={s.id}>{s.profiles?.full_name}</option>)}</select></div>
            <div><label className="label">Topic</label><input className="input" value={form.topic} onChange={e => setForm({ ...form, topic: e.target.value })} placeholder="Class topic" /></div>
          </div>
          <div className="grid-3" style={{ marginTop: 12 }}>
            <div><label className="label">Start Time</label><input className="input" type="time" value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} /></div>
            <div><label className="label">End Time</label><input className="input" type="time" value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })} /></div>
            <div style={{ display: "flex", alignItems: "flex-end" }}><button className="btn btn-success" onClick={addClass}>Save Class</button></div>
          </div>
        </div>
      )}
      {classes.length === 0 ? <div className="card empty-state">No classes scheduled today.</div> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {classes.map(cl => (
            <div key={cl.id} className={`card class-card ${cl.status === "live" ? "live" : ""}`}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                  <span style={{ fontWeight: 700, fontSize: 15 }}>{cl.subjects?.name}</span>
                  <span className={`badge ${cl.status === "live" ? "badge-danger" : cl.status === "completed" ? "badge-success" : "badge-primary"}`}>{cl.status === "live" ? "🔴 LIVE" : cl.status}</span>
                </div>
                <div style={{ fontSize: 13, color: "var(--muted)" }}>{cl.start_time?.slice(0,5)} - {cl.end_time?.slice(0,5)} | {cl.staff?.profiles?.full_name}{cl.topic ? ` | ${cl.topic}` : ""}</div>
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
function AttendanceTab({ profile }) {
  const [classes, setClasses] = useState([]); const [selClass, setSelClass] = useState(null); const [students, setStudents] = useState([]); const [att, setAtt] = useState({}); const [saving, setSaving] = useState(false); const [saved, setSaved] = useState(false);
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    let q = supabase.from("live_classes").select("*, subjects(name), courses(name)").eq("class_date", today).in("status", ["live","completed"]);
    if (profile?.role === "teacher") {
      supabase.from("staff").select("id").eq("profile_id", profile.id).single().then(({ data }) => {
        if (data?.id) supabase.from("live_classes").select("*, subjects(name), courses(name)").eq("class_date", today).eq("teacher_id", data.id).in("status", ["live","completed"]).then(({ data: cls }) => setClasses(cls || []));
      });
    } else {
      q.then(({ data }) => setClasses(data || []));
    }
  }, [today, profile?.role, profile?.id]);

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
      <h1 className="page-title">Attendance</h1>
      <p className="page-sub">Select a class to mark attendance</p>
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        {classes.length === 0 && <p style={{ color: "var(--muted)", fontSize: 13 }}>No live or completed classes today.</p>}
        {classes.map(cl => <button key={cl.id} className={`tag ${selClass?.id === cl.id ? "active" : ""}`} onClick={() => setSelClass(cl)}>{cl.subjects?.name} ({cl.start_time?.slice(0,5)}) — {cl.courses?.name}</button>)}
      </div>
      {selClass && (
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700 }}>{selClass.subjects?.name}</h3>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {saved && <span style={{ color: "var(--success)", fontSize: 13, fontWeight: 600 }}>✓ Saved!</span>}
              <button className="btn btn-success" onClick={save} disabled={saving}>{saving ? "Saving..." : "Save Attendance"}</button>
            </div>
          </div>
          {students.length === 0 ? <p style={{ color: "var(--muted)" }}>No active students in this course.</p> : (
            <table><thead><tr><th>#</th><th>Student</th><th>Status</th></tr></thead>
            <tbody>{students.map((st, i) => (
              <tr key={st.id}>
                <td style={{ color: "var(--muted)", fontSize: 13 }}>{i+1}</td>
                <td style={{ fontWeight: 600 }}>{st.profiles?.full_name}</td>
                <td><div style={{ display: "flex", gap: 6 }}>{["present","absent","late","excused"].map(status => (<button key={status} className={`att-btn ${att[st.id] === status ? status : ""}`} onClick={() => setAtt({ ...att, [st.id]: status })}>{status}</button>))}</div></td>
              </tr>
            ))}</tbody></table>
          )}
        </div>
      )}
    </div>
  );
}

// ========== FEES ==========
function FeesTab({ profile }) {
  const [students, setStudents] = useState([]); const [selSt, setSelSt] = useState(null); const [fee, setFee] = useState(null); const [payments, setPayments] = useState([]);
  const [showPay, setShowPay] = useState(false); const [payForm, setPayForm] = useState({ amount: "", mode: "cash", notes: "" }); const [saving, setSaving] = useState(false);
  const [lastPayment, setLastPayment] = useState(null);
  const isAdmin = profile?.role === "admin";
  const isStudent = profile?.role === "student" || profile?.role === "guardian";

  useEffect(() => {
    if (isStudent) {
      supabase.from("students").select("*, profiles!inner(full_name)").eq("profile_id", profile.id).single().then(({ data }) => {
        if (data) { setStudents([data]); loadFee(data); }
      });
    } else {
      supabase.from("students").select("*, profiles!inner(full_name)").eq("status", "active").order("created_at", { ascending: false }).then(({ data }) => setStudents(data || []));
    }
  }, [isStudent, profile?.id]);

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
    const rcpNo = "RCP-" + Date.now();
    const { data: fs } = await supabase.from("fee_structures").select("id").eq("student_id", selSt.id).single();
    if (fs) await supabase.from("fee_payments").insert({ fee_structure_id: fs.id, student_id: selSt.id, amount: Number(payForm.amount), payment_mode: payForm.mode, receipt_number: rcpNo, installment_number: payments.length + 1, notes: payForm.notes || null });
    setLastPayment({ amount: payForm.amount, mode: payForm.mode, rcpNo, student: selSt });
    setPayForm({ amount: "", mode: "cash", notes: "" }); setShowPay(false); setSaving(false);
    loadFee(selSt);
  };

  const sendFeeWhatsApp = () => {
    if (!lastPayment) return;
    const phone = lastPayment.student?.profiles?.phone?.replace(/\D/g, "") || "";
    const text = `💰 *MY CAREER ACADEMIC*\n\nDear ${lastPayment.student?.profiles?.full_name},\n\nYour fee payment has been recorded successfully!\n\n📋 *Payment Details:*\n• Receipt No: ${lastPayment.rcpNo}\n• Amount Paid: ₹${Number(lastPayment.amount).toLocaleString()}\n• Payment Mode: ${lastPayment.mode?.toUpperCase()}\n• Date: ${new Date().toLocaleDateString("en-IN")}\n\nFor queries: 06727796700\n\n_My Career Academic_`;
    window.open("https://wa.me/91" + phone + "?text=" + encodeURIComponent(text), "_blank");
  };

  return (
    <div>
      <h1 className="page-title">Fee Management</h1>
      <p className="page-sub">Track student fees and payments</p>
      <div style={{ display: "flex", gap: 20 }}>
        {!isStudent && (
          <div style={{ width: 260, flexShrink: 0 }}>
            <div className="card" style={{ maxHeight: 500, overflowY: "auto" }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: "var(--muted)" }}>Select Student</h3>
              {students.map(st => <div key={st.id} className={`student-item ${selSt?.id === st.id ? "active" : ""}`} onClick={() => loadFee(st)}>{st.profiles?.full_name}</div>)}
            </div>
          </div>
        )}
        <div style={{ flex: 1 }}>
          {!selSt ? <div className="card empty-state">Select a student to view fee details</div> : (
            <div>
              {fee && (
                <div className="grid-3" style={{ marginBottom: 20 }}>
                  <StatCard title="Total Fee" value={`₹${fee.total_fee || 0}`} variant="primary" />
                  <StatCard title="Amount Paid" value={`₹${fee.total_paid || 0}`} variant="success" />
                  <StatCard title="Pending" value={`₹${fee.pending || 0}`} variant={fee.pending > 0 ? "danger" : "success"} />
                </div>
              )}
              <div className="card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700 }}>Payment History</h3>
                  <div style={{ display: "flex", gap: 8 }}>
                    {lastPayment && lastPayment.student?.id === selSt?.id && (
                      <button className="btn" style={{ background: "#25D366", border: "none", fontSize: 13 }} onClick={sendFeeWhatsApp}>📱 WhatsApp</button>
                    )}
                    {isAdmin && <button className="btn btn-success" onClick={() => setShowPay(!showPay)}>+ Record Payment</button>}
                  </div>
                </div>
                {showPay && (
                  <div style={{ background: "var(--success-light)", padding: 16, borderRadius: 8, marginBottom: 16 }}>
                    <div className="grid-3">
                      <div><label className="label">Amount (₹)</label><input className="input" type="number" value={payForm.amount} onChange={e => setPayForm({ ...payForm, amount: e.target.value })} placeholder="Enter amount" /></div>
                      <div><label className="label">Payment Mode</label><select className="select" value={payForm.mode} onChange={e => setPayForm({ ...payForm, mode: e.target.value })}><option value="cash">Cash</option><option value="upi">UPI</option><option value="bank_transfer">Bank Transfer</option><option value="cheque">Cheque</option><option value="online">Online</option></select></div>
                      <div><label className="label">Notes</label><input className="input" value={payForm.notes} onChange={e => setPayForm({ ...payForm, notes: e.target.value })} placeholder="Optional notes" /></div>
                    </div>
                    <button className="btn btn-success" style={{ marginTop: 12 }} onClick={pay} disabled={saving}>{saving ? "Saving..." : "Record Payment"}</button>
                  </div>
                )}
                {payments.length === 0 ? <p style={{ color: "var(--muted)", fontSize: 13 }}>No payment records yet.</p> : (
                  <table><thead><tr><th>Date</th><th>Amount</th><th>Mode</th><th>Installment</th><th>Receipt</th></tr></thead>
                  <tbody>{payments.map(p => (
                    <tr key={p.id}>
                      <td>{new Date(p.payment_date).toLocaleDateString("en-IN")}</td>
                      <td style={{ fontWeight: 700, color: "var(--success)" }}>₹{p.amount?.toLocaleString()}</td>
                      <td><span className="badge badge-primary">{p.payment_mode}</span></td>
                      <td>#{p.installment_number || "-"}</td>
                      <td style={{ fontSize: 12, color: "var(--muted)" }}>{p.receipt_number}</td>
                    </tr>
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
function TestsTab({ profile }) {
  const [tests, setTests] = useState([]); const [courses, setCourses] = useState([]); const [subjects, setSubjects] = useState([]); const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", courseId: "", subjectId: "", totalMarks: "", testDate: "" });
  const [marksTest, setMarksTest] = useState(null); const [students, setStudents] = useState([]); const [marks, setMarks] = useState({}); const [savingMarks, setSavingMarks] = useState(false); const [marksSaved, setMarksSaved] = useState(false);
  const isAdmin = profile?.role === "admin";
  const isTeacher = profile?.role === "teacher";
  const canCreate = isAdmin || isTeacher;

  const loadTests = async () => { const { data } = await supabase.from("tests").select("*, courses(name), subjects(name)").order("test_date", { ascending: false }); setTests(data || []); };
  useEffect(() => { loadTests(); supabase.from("courses").select("*").eq("is_active", true).then(({ data }) => setCourses(data || [])); }, []);
  useEffect(() => { if (form.courseId) supabase.from("subjects").select("*").eq("course_id", form.courseId).then(({ data }) => setSubjects(data || [])); }, [form.courseId]);

  const add = async () => {
    if (!form.name || !form.courseId || !form.subjectId || !form.totalMarks || !form.testDate) return;
    await supabase.from("tests").insert({ name: form.name, course_id: form.courseId, subject_id: form.subjectId, total_marks: Number(form.totalMarks), test_date: form.testDate });
    setShowForm(false); setForm({ name: "", courseId: "", subjectId: "", totalMarks: "", testDate: "" }); loadTests();
  };

  const openMarks = async (test) => {
    setMarksTest(test); setMarksSaved(false);
    const { data: stData } = await supabase.from("students").select("*, profiles!inner(full_name)").eq("course_id", test.course_id).eq("status", "active");
    setStudents(stData || []);
    const { data: ex } = await supabase.from("test_results").select("*").eq("test_id", test.id);
    const map = {}; (ex || []).forEach(r => { map[r.student_id] = r.marks_obtained?.toString() || ""; });
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
        <div><h1 className="page-title">Tests &amp; Marks</h1><p style={{ fontSize: 13, color: "var(--muted)" }}>{tests.length} tests created</p></div>
        {canCreate && <button className="btn btn-accent" onClick={() => setShowForm(!showForm)}>+ Create Test</button>}
      </div>
      {showForm && canCreate && (
        <div className="card" style={{ marginBottom: 20, borderColor: "var(--accent)" }}>
          <div className="grid-3">
            <div><label className="label">Test Name</label><input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Unit Test 1" /></div>
            <div><label className="label">Course</label><select className="select" value={form.courseId} onChange={e => setForm({ ...form, courseId: e.target.value, subjectId: "" })}><option value="">Select</option>{courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
            <div><label className="label">Subject</label><select className="select" value={form.subjectId} onChange={e => setForm({ ...form, subjectId: e.target.value })}><option value="">Select</option>{subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
          </div>
          <div className="grid-3" style={{ marginTop: 12 }}>
            <div><label className="label">Total Marks</label><input className="input" type="number" value={form.totalMarks} onChange={e => setForm({ ...form, totalMarks: e.target.value })} placeholder="100" /></div>
            <div><label className="label">Test Date</label><input className="input" type="date" value={form.testDate} onChange={e => setForm({ ...form, testDate: e.target.value })} /></div>
            <div style={{ display: "flex", alignItems: "flex-end" }}><button className="btn btn-success" onClick={add}>Save Test</button></div>
          </div>
        </div>
      )}
      <div style={{ display: "flex", gap: 20 }}>
        <div style={{ width: 340, flexShrink: 0 }}>
          <div className="card">
            {tests.length === 0 ? <p className="empty-state">No tests created yet.</p> : tests.map(t => (
              <div key={t.id} style={{ padding: "10px 0", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ cursor: "pointer" }} onClick={() => openMarks(t)}>
                  <div style={{ fontWeight: 600, fontSize: 13.5 }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>{t.courses?.name} | {t.subjects?.name} | {t.total_marks} marks | {t.test_date ? new Date(t.test_date).toLocaleDateString("en-IN") : ""}</div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button className="btn" style={{ fontSize: 11, padding: "4px 10px" }} onClick={() => openMarks(t)}>Marks</button>
                  {canCreate && <button style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer", fontSize: 11 }} onClick={() => deleteTest(t.id)}>Del</button>}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ flex: 1 }}>
          {!marksTest ? <div className="card empty-state">Select a test to enter marks</div> : (
            <div className="card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div><h3 style={{ fontSize: 15, fontWeight: 700 }}>{marksTest.name}</h3><p style={{ fontSize: 12, color: "var(--muted)" }}>Total: {marksTest.total_marks} marks | {marksTest.subjects?.name}</p></div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  {marksSaved && <span style={{ color: "var(--success)", fontSize: 13, fontWeight: 600 }}>✓ Saved!</span>}
                  {canCreate && <button className="btn btn-success" onClick={saveMarks} disabled={savingMarks}>{savingMarks ? "..." : "Save Marks"}</button>}
                </div>
              </div>
              {students.length === 0 ? <p style={{ color: "var(--muted)" }}>No active students in this course.</p> : (
                <table><thead><tr><th>#</th><th>Student</th><th style={{ width: 120 }}>Marks</th><th style={{ width: 80 }}>%</th><th>Result</th></tr></thead>
                <tbody>{students.map((st, i) => {
                  const val = marks[st.id] || "";
                  const pct = val ? Math.round((Number(val) / marksTest.total_marks) * 100) : null;
                  return (
                    <tr key={st.id}>
                      <td style={{ color: "var(--muted)", fontSize: 13 }}>{i+1}</td>
                      <td style={{ fontWeight: 600 }}>{st.profiles?.full_name}</td>
                      <td>{canCreate ? <input className="input" type="number" min="0" max={marksTest.total_marks} style={{ width: 100, padding: "6px 10px", fontSize: 13 }} value={val} onChange={e => setMarks({ ...marks, [st.id]: e.target.value })} /> : <span>{val || "-"}</span>}</td>
                      <td>{pct !== null ? <span className={`badge ${pct >= 40 ? "badge-success" : "badge-danger"}`}>{pct}%</span> : "-"}</td>
                      <td>{pct !== null ? <span style={{ fontSize: 12, fontWeight: 600, color: pct >= 40 ? "var(--success)" : "var(--danger)" }}>{pct >= 40 ? "Pass" : "Fail"}</span> : "-"}</td>
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

// ========== ACCOUNTS ==========
function AccountsTab() {
  const [view, setView] = useState("overview");
  const [incomes, setIncomes] = useState([]); const [expenses, setExpenses] = useState([]); const [salaries, setSalaries] = useState([]);
  const [showIncForm, setShowIncForm] = useState(false); const [showExpForm, setShowExpForm] = useState(false); const [showSalForm, setShowSalForm] = useState(false);
  const [incForm, setIncForm] = useState({ category: "tuition_fee", amount: "", description: "", paymentMode: "cash", incomeDate: new Date().toISOString().split("T")[0] });
  const [expForm, setExpForm] = useState({ category: "salary", amount: "", description: "", paidTo: "", paymentMode: "cash", expenseDate: new Date().toISOString().split("T")[0] });
  const [salForm, setSalForm] = useState({ staffId: "", amount: "", month: "", deductions: "0", bonus: "0", paymentMode: "bank_transfer" });
  const [staffList, setStaffList] = useState([]); const [msg, setMsg] = useState("");
  const [lastSalary, setLastSalary] = useState(null);

  const loadData = async () => {
    const { data: inc } = await supabase.from("income_records").select("*").order("income_date", { ascending: false }).limit(100); setIncomes(inc || []);
    const { data: exp } = await supabase.from("expense_records").select("*").order("expense_date", { ascending: false }).limit(100); setExpenses(exp || []);
    const { data: sal } = await supabase.from("salary_records").select("*, staff!inner(profiles!inner(full_name, phone))").order("payment_date", { ascending: false }).limit(50); setSalaries(sal || []);
  };
  useEffect(() => { loadData(); supabase.from("staff").select("*, profiles!inner(full_name, phone)").then(({ data }) => setStaffList(data || [])); }, []);

  const totalIncome = incomes.reduce((a, i) => a + Number(i.amount || 0), 0);
  const totalExpense = expenses.reduce((a, e) => a + Number(e.amount || 0), 0);
  const totalSalary = salaries.reduce((a, s) => a + Number(s.net_amount || s.amount || 0), 0);
  const profit = totalIncome - totalExpense - totalSalary;

  const addIncome = async () => { if (!incForm.amount) return; await supabase.from("income_records").insert({ category: incForm.category, amount: Number(incForm.amount), description: incForm.description || null, payment_mode: incForm.paymentMode, income_date: incForm.incomeDate, receipt_number: "INC-" + Date.now() }); setIncForm({ category: "tuition_fee", amount: "", description: "", paymentMode: "cash", incomeDate: new Date().toISOString().split("T")[0] }); setShowIncForm(false); loadData(); setMsg("Income recorded!"); };
  const addExpense = async () => { if (!expForm.amount) return; await supabase.from("expense_records").insert({ category: expForm.category, amount: Number(expForm.amount), description: expForm.description || null, paid_to: expForm.paidTo || null, payment_mode: expForm.paymentMode, expense_date: expForm.expenseDate, bill_number: "EXP-" + Date.now() }); setExpForm({ category: "salary", amount: "", description: "", paidTo: "", paymentMode: "cash", expenseDate: new Date().toISOString().split("T")[0] }); setShowExpForm(false); loadData(); setMsg("Expense recorded!"); };
  const addSalary = async () => {
    if (!salForm.staffId || !salForm.amount || !salForm.month) return;
    const net = Number(salForm.amount) - Number(salForm.deductions || 0) + Number(salForm.bonus || 0);
    const staffMember = staffList.find(s => s.id === salForm.staffId);
    await supabase.from("salary_records").insert({ staff_id: salForm.staffId, amount: Number(salForm.amount), month: salForm.month, deductions: Number(salForm.deductions || 0), bonus: Number(salForm.bonus || 0), net_amount: net, payment_mode: salForm.paymentMode });
    await supabase.from("expense_records").insert({ category: "salary", amount: net, description: "Salary - " + salForm.month, paid_to: staffMember?.profiles?.full_name || "", payment_mode: salForm.paymentMode, expense_date: new Date().toISOString().split("T")[0] });
    setLastSalary({ staffName: staffMember?.profiles?.full_name, staffPhone: staffMember?.profiles?.phone, amount: salForm.amount, net, month: salForm.month, deductions: salForm.deductions, bonus: salForm.bonus, mode: salForm.paymentMode });
    setSalForm({ staffId: "", amount: "", month: "", deductions: "0", bonus: "0", paymentMode: "bank_transfer" }); setShowSalForm(false); loadData(); setMsg("Salary paid successfully!");
  };

  const sendSalaryWhatsApp = () => {
    if (!lastSalary) return;
    const phone = lastSalary.staffPhone?.replace(/\D/g, "") || "";
    const text = `💼 *MY CAREER ACADEMIC*\n\nDear ${lastSalary.staffName},\n\nYour salary has been processed!\n\n📋 *Salary Details:*\n• Month: ${lastSalary.month}\n• Basic Salary: ₹${Number(lastSalary.amount).toLocaleString()}\n• Deductions: -₹${Number(lastSalary.deductions || 0).toLocaleString()}\n• Bonus: +₹${Number(lastSalary.bonus || 0).toLocaleString()}\n• *Net Paid: ₹${Number(lastSalary.net).toLocaleString()}*\n• Mode: ${lastSalary.mode?.toUpperCase()}\n\nFor queries, please contact admin.\n\n_My Career Academic_`;
    window.open("https://wa.me/91" + phone + "?text=" + encodeURIComponent(text), "_blank");
  };

  const incCats = { tuition_fee: "Tuition Fee", hostel_fee: "Hostel Fee", admission_fee: "Admission Fee", exam_fee: "Exam Fee", late_fee: "Late Fee", donation: "Donation", other_income: "Other Income" };
  const expCats = { salary: "Salary", electricity: "Electricity", water: "Water", rent: "Rent", maintenance: "Maintenance", stationery: "Stationery", internet: "Internet", furniture: "Furniture", transport: "Transport", food: "Food / Canteen", events: "Events", marketing: "Marketing", taxes: "Taxes", insurance: "Insurance", other_expense: "Other Expense" };

  const receiptCSS = `body{font-family:Arial,sans-serif;padding:20px;max-width:580px;margin:0 auto;color:#000}table{width:100%;border-collapse:collapse}td,th{padding:7px 10px;font-size:13px;border:1px solid #333;text-align:left}.header{text-align:center;padding-bottom:12px;border-bottom:3px solid #1a5c2e;margin-bottom:12px}.inst-name{font-size:20px;font-weight:bold;color:#1a5c2e}.title{text-align:center;font-size:16px;font-weight:bold;text-decoration:underline;margin:10px 0}.footer{text-align:right;margin-top:30px;font-weight:bold;font-size:14px}.gen{text-align:center;font-size:9px;color:#999;margin-top:15px;border-top:1px solid #eee;padding-top:5px}@media print{body{padding:5px}}`;
  const mcaHeader = `<div class="header"><div class="inst-name">MY CAREER ACADEMIC</div><div style="font-size:12px;font-weight:bold">A Division of:- MY LIFELINE FOUNDATION</div><div style="font-size:11px;color:#555">Kendrapara Town, Maruti Chhak, Khairabad, Kendrapara — 754211</div><div style="font-size:11px;color:#555">Ph: 06727796700 | info.mylifelinefoundation@gmail.com</div></div>`;

  const printReceipt = (type, record) => {
    const isInc = type === "income"; const cats = isInc ? incCats : expCats;
    const catName = cats[record.category] || record.category;
    const receiptNo = record.receipt_number || record.bill_number || "N/A";
    const date = new Date(record.income_date || record.expense_date).toLocaleDateString("en-IN");
    const amt = Number(record.amount).toLocaleString();
    const w = window.open("", "_blank");
    w.document.write(`<html><head><title>Receipt - ${receiptNo}</title><style>${receiptCSS}</style></head><body>${mcaHeader}<div class="title">MONEY RECEIPT</div><div style="display:flex;justify-content:space-between;font-size:13px;margin:4px 0"><span>Receipt No.: <b>${receiptNo}</b></span><span>Date: <b>${date}</b></span></div><div style="font-size:13px;margin:6px 0">Received from / Paid to: <b>${record.paid_to || record.description || catName}</b></div><div style="font-size:13px;margin:4px 0">Payment Mode: <b>${(record.payment_mode || "cash").toUpperCase()}</b></div><div style="font-size:14px;margin:8px 0">Amount: <b style="font-size:17px">&#8377;${amt}/-</b> (Rupees <b>${numberToWords(Number(record.amount))} only</b>)</div><table style="margin-top:15px"><tr><th style="width:65%">PARTICULARS</th><th>AMOUNT</th></tr><tr><td>1. ${catName}${record.description && record.description !== catName ? ' — ' + record.description : ''}</td><td style="text-align:right;font-weight:bold">&#8377;${amt}/-</td></tr>${isInc ? '<tr><td>2. </td><td></td></tr><tr><td>3. </td><td></td></tr><tr><td>4. </td><td></td></tr>' : '<tr><td>2. </td><td></td></tr>'}<tr style="background:#f5f5f5"><td style="text-align:right;font-weight:bold">Grand Total</td><td style="text-align:right;font-weight:bold;font-size:15px">&#8377;${amt}/-</td></tr></table><div class="footer">ACCOUNTANT</div><div class="gen">Computer generated receipt | My Career Academic</div></body></html>`);
    w.document.close(); w.print();
  };

  const printSalarySlip = (record) => {
    const w = window.open("", "_blank");
    w.document.write(`<html><head><title>Salary Slip</title><style>${receiptCSS}</style></head><body>${mcaHeader}<div class="title">SALARY SLIP</div><div style="display:flex;justify-content:space-between;font-size:13px;margin:4px 0"><span>Employee: <b>${record.staff?.profiles?.full_name || "N/A"}</b></span><span>Month: <b>${record.month}</b></span></div><div style="font-size:13px;margin:4px 0">Payment Date: <b>${new Date(record.payment_date).toLocaleDateString("en-IN")}</b> | Mode: <b>${(record.payment_mode || "bank").toUpperCase()}</b></div><table style="margin-top:15px"><tr><th style="width:65%">PARTICULARS</th><th>AMOUNT</th></tr><tr><td>Basic Salary</td><td style="text-align:right">&#8377;${Number(record.amount).toLocaleString()}/-</td></tr><tr><td>Deductions</td><td style="text-align:right;color:#c4342d">- &#8377;${Number(record.deductions || 0).toLocaleString()}/-</td></tr><tr><td>Bonus / Incentive</td><td style="text-align:right;color:#1a8a5c">+ &#8377;${Number(record.bonus || 0).toLocaleString()}/-</td></tr><tr style="background:#f0f4f0"><td style="text-align:right;font-weight:bold">Net Pay</td><td style="text-align:right;font-weight:bold;font-size:16px">&#8377;${Number(record.net_amount || record.amount).toLocaleString()}/-</td></tr></table><div style="margin-top:50px;display:flex;justify-content:space-between;padding:0 20px"><div style="text-align:center;border-top:1px solid #333;padding-top:5px;width:150px;font-size:12px">Employee Signature</div><div style="text-align:center;border-top:1px solid #333;padding-top:5px;width:150px;font-size:12px">ACCOUNTANT</div></div><div class="gen">Computer generated salary slip | My Career Academic</div></body></html>`);
    w.document.close(); w.print();
  };

  const printMonthlyReport = () => {
    const now = new Date(); const monthName = now.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
    const mInc = incomes.filter(i => { const d = new Date(i.income_date); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); });
    const mExp = expenses.filter(e => { const d = new Date(e.expense_date); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); });
    const mSal = salaries.filter(s => { const d = new Date(s.payment_date); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); });
    const mTI = mInc.reduce((a, i) => a + Number(i.amount), 0);
    const mTE = mExp.reduce((a, e) => a + Number(e.amount), 0);
    const mTS = mSal.reduce((a, s) => a + Number(s.net_amount || s.amount), 0);
    const mP = mTI - mTE - mTS;
    const incByCat = {}; mInc.forEach(i => { incByCat[i.category] = (incByCat[i.category] || 0) + Number(i.amount); });
    const expByCat = {}; mExp.forEach(e => { expByCat[e.category] = (expByCat[e.category] || 0) + Number(e.amount); });
    const w = window.open("", "_blank");
    w.document.write(`<html><head><title>Monthly Report - ${monthName}</title><style>body{font-family:Arial,sans-serif;padding:30px;color:#000;max-width:720px;margin:0 auto}table{width:100%;border-collapse:collapse;margin:10px 0}td,th{padding:8px 10px;font-size:12px;border:1px solid #ddd;text-align:left}.header{text-align:center;border-bottom:3px solid #1a5c2e;padding-bottom:12px;margin-bottom:20px}.section{background:#e8f4e8;padding:8px 12px;font-weight:bold;font-size:13px;color:#1a5c2e}.sbox{flex:1;padding:12px;border-radius:8px;text-align:center;border:1px solid #ddd}.green{background:#e6f5ee;color:#1a8a5c}.red{background:#fceaea;color:#c4342d}@media print{body{padding:10px}}</style></head><body>
    <div class="header"><div style="font-size:20px;font-weight:bold;color:#1a5c2e">MY CAREER ACADEMIC</div><div style="font-size:12px;font-weight:bold">A Division of MY LIFELINE FOUNDATION</div><div style="font-size:15px;font-weight:bold;margin-top:8px;text-decoration:underline">MONTHLY FINANCIAL REPORT — ${monthName}</div></div>
    <div style="display:flex;gap:10px;margin:15px 0">
    <div class="sbox green"><div style="font-size:11px">TOTAL INCOME</div><div style="font-size:20px;font-weight:bold">&#8377;${mTI.toLocaleString()}</div></div>
    <div class="sbox red"><div style="font-size:11px">TOTAL EXPENSE</div><div style="font-size:20px;font-weight:bold">&#8377;${(mTE + mTS).toLocaleString()}</div></div>
    <div class="sbox ${mP >= 0 ? "green" : "red"}"><div style="font-size:11px">${mP >= 0 ? "PROFIT" : "LOSS"}</div><div style="font-size:20px;font-weight:bold">&#8377;${Math.abs(mP).toLocaleString()}</div></div></div>
    <table><tr><td colspan="3" class="section">INCOME BREAKDOWN</td></tr><tr><th>Category</th><th>Transactions</th><th>Amount</th></tr>${Object.entries(incByCat).map(([k, v]) => `<tr><td>${incCats[k] || k}</td><td>${mInc.filter(i => i.category === k).length}</td><td style="color:#1a8a5c;font-weight:bold">&#8377;${v.toLocaleString()}</td></tr>`).join("")}<tr style="background:#f5f5f5"><td><b>Total</b></td><td><b>${mInc.length}</b></td><td><b style="color:#1a8a5c">&#8377;${mTI.toLocaleString()}</b></td></tr></table>
    <table><tr><td colspan="3" class="section">EXPENSE BREAKDOWN</td></tr><tr><th>Category</th><th>Transactions</th><th>Amount</th></tr>${Object.entries(expByCat).map(([k, v]) => `<tr><td>${expCats[k] || k}</td><td>${mExp.filter(e => e.category === k).length}</td><td style="color:#c4342d;font-weight:bold">&#8377;${v.toLocaleString()}</td></tr>`).join("")}<tr style="background:#f5f5f5"><td><b>Total</b></td><td><b>${mExp.length}</b></td><td><b style="color:#c4342d">&#8377;${mTE.toLocaleString()}</b></td></tr></table>
    ${mSal.length > 0 ? `<table><tr><td colspan="4" class="section">SALARY PAYMENTS</td></tr><tr><th>Employee</th><th>Month</th><th>Net Amount</th><th>Mode</th></tr>${mSal.map(s => `<tr><td>${s.staff?.profiles?.full_name || ""}</td><td>${s.month}</td><td>&#8377;${Number(s.net_amount || s.amount).toLocaleString()}</td><td>${s.payment_mode}</td></tr>`).join("")}<tr style="background:#f5f5f5"><td colspan="2"><b>Total Salaries</b></td><td colspan="2"><b>&#8377;${mTS.toLocaleString()}</b></td></tr></table>` : ""}
    <div style="text-align:center;font-size:10px;color:#999;margin-top:20px;border-top:1px solid #eee;padding-top:10px">Generated on ${new Date().toLocaleDateString("en-IN")} | My Career Academic</div></body></html>`);
    w.document.close(); w.print();
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div><h1 className="page-title">Accounts &amp; Finance</h1><p className="page-sub" style={{ marginBottom: 0 }}>Income, expense &amp; salary tracking</p></div>
        <div style={{ display: "flex", gap: 8 }}>{["overview","income","expenses","salary"].map(v => <button key={v} className={`tag ${view === v ? "active" : ""}`} onClick={() => setView(v)}>{v.charAt(0).toUpperCase() + v.slice(1)}</button>)}</div>
      </div>
      {msg && <div className="success-box" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><span>{msg}</span>{lastSalary && msg === "Salary paid successfully!" && <button className="btn" style={{ background: "#25D366", border: "none", fontSize: 13, marginLeft: 12 }} onClick={sendSalaryWhatsApp}>📱 Send WhatsApp to Staff</button>}</div>}

      {view === "overview" && (
        <div>
          <div className="grid-4" style={{ marginBottom: 20 }}>
            <StatCard title="Total Income" value={`₹${totalIncome.toLocaleString()}`} variant="success" />
            <StatCard title="Total Expenses" value={`₹${totalExpense.toLocaleString()}`} variant="danger" />
            <StatCard title="Salaries Paid" value={`₹${totalSalary.toLocaleString()}`} variant="warning" />
            <StatCard title={profit >= 0 ? "Net Profit" : "Net Loss"} value={`₹${Math.abs(profit).toLocaleString()}`} variant={profit >= 0 ? "success" : "danger"} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h3 style={{ fontSize: 17, fontWeight: 700 }}>Recent Transactions</h3>
            <button className="btn" onClick={printMonthlyReport}>📊 Monthly Report</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div className="card">
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, color: "var(--success)" }}>Recent Income</h3>
              {incomes.slice(0, 8).map(i => (
                <div key={i.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid var(--border)", fontSize: 13 }}>
                  <div><span className="badge badge-success">{incCats[i.category] || i.category}</span> <span style={{ color: "var(--muted)", marginLeft: 4 }}>{i.description || ""}</span></div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontWeight: 700, color: "var(--success)" }}>+₹{Number(i.amount).toLocaleString()}</span><button style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "var(--primary)" }} onClick={() => printReceipt("income", i)}>🖨️</button></div>
                </div>
              ))}
            </div>
            <div className="card">
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, color: "var(--danger)" }}>Recent Expenses</h3>
              {expenses.slice(0, 8).map(e => (
                <div key={e.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid var(--border)", fontSize: 13 }}>
                  <div><span className="badge badge-danger">{expCats[e.category] || e.category}</span> <span style={{ color: "var(--muted)", marginLeft: 4 }}>{e.paid_to || e.description || ""}</span></div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontWeight: 700, color: "var(--danger)" }}>-₹{Number(e.amount).toLocaleString()}</span><button style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "var(--primary)" }} onClick={() => printReceipt("expense", e)}>🖨️</button></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {view === "income" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}><h3 style={{ fontSize: 17, fontWeight: 700 }}>Income Records</h3><button className="btn btn-success" onClick={() => setShowIncForm(!showIncForm)}>+ Add Income</button></div>
          {showIncForm && (
            <div className="card" style={{ marginBottom: 16, borderColor: "var(--success)" }}>
              <div className="grid-3">
                <div><label className="label">Category</label><select className="select" value={incForm.category} onChange={e => setIncForm({ ...incForm, category: e.target.value })}>{Object.entries(incCats).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
                <div><label className="label">Amount (₹) *</label><input className="input" type="number" value={incForm.amount} onChange={e => setIncForm({ ...incForm, amount: e.target.value })} /></div>
                <div><label className="label">Date</label><input className="input" type="date" value={incForm.incomeDate} onChange={e => setIncForm({ ...incForm, incomeDate: e.target.value })} /></div>
              </div>
              <div className="grid-2" style={{ marginTop: 12 }}>
                <div><label className="label">Description</label><input className="input" value={incForm.description} onChange={e => setIncForm({ ...incForm, description: e.target.value })} placeholder="Details" /></div>
                <div><label className="label">Payment Mode</label><select className="select" value={incForm.paymentMode} onChange={e => setIncForm({ ...incForm, paymentMode: e.target.value })}><option value="cash">Cash</option><option value="upi">UPI</option><option value="bank_transfer">Bank Transfer</option><option value="cheque">Cheque</option></select></div>
              </div>
              <button className="btn btn-success" style={{ marginTop: 12 }} onClick={addIncome}>Save Income</button>
            </div>
          )}
          <div className="card">
            {incomes.length === 0 ? <p className="empty-state">No income records yet.</p> : (
              <table><thead><tr><th>Date</th><th>Category</th><th>Amount</th><th>Description</th><th>Mode</th><th></th></tr></thead>
              <tbody>{incomes.map(i => (
                <tr key={i.id}>
                  <td>{new Date(i.income_date).toLocaleDateString("en-IN")}</td>
                  <td><span className="badge badge-success">{incCats[i.category] || i.category}</span></td>
                  <td style={{ fontWeight: 700, color: "var(--success)" }}>₹{Number(i.amount).toLocaleString()}</td>
                  <td>{i.description || "-"}</td>
                  <td>{i.payment_mode}</td>
                  <td><button className="btn-outline" style={{ fontSize: 11, padding: "3px 8px" }} onClick={() => printReceipt("income", i)}>Print</button></td>
                </tr>
              ))}</tbody></table>
            )}
          </div>
        </div>
      )}

      {view === "expenses" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}><h3 style={{ fontSize: 17, fontWeight: 700 }}>Expense Records</h3><button className="btn btn-danger" onClick={() => setShowExpForm(!showExpForm)}>+ Add Expense</button></div>
          {showExpForm && (
            <div className="card" style={{ marginBottom: 16, borderColor: "var(--danger)" }}>
              <div className="grid-3">
                <div><label className="label">Category</label><select className="select" value={expForm.category} onChange={e => setExpForm({ ...expForm, category: e.target.value })}>{Object.entries(expCats).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
                <div><label className="label">Amount (₹) *</label><input className="input" type="number" value={expForm.amount} onChange={e => setExpForm({ ...expForm, amount: e.target.value })} /></div>
                <div><label className="label">Date</label><input className="input" type="date" value={expForm.expenseDate} onChange={e => setExpForm({ ...expForm, expenseDate: e.target.value })} /></div>
              </div>
              <div className="grid-3" style={{ marginTop: 12 }}>
                <div><label className="label">Paid To</label><input className="input" value={expForm.paidTo} onChange={e => setExpForm({ ...expForm, paidTo: e.target.value })} placeholder="Vendor / Person" /></div>
                <div><label className="label">Description</label><input className="input" value={expForm.description} onChange={e => setExpForm({ ...expForm, description: e.target.value })} /></div>
                <div><label className="label">Payment Mode</label><select className="select" value={expForm.paymentMode} onChange={e => setExpForm({ ...expForm, paymentMode: e.target.value })}><option value="cash">Cash</option><option value="upi">UPI</option><option value="bank_transfer">Bank Transfer</option><option value="cheque">Cheque</option></select></div>
              </div>
              <button className="btn btn-danger" style={{ marginTop: 12 }} onClick={addExpense}>Save Expense</button>
            </div>
          )}
          <div className="card">
            {expenses.length === 0 ? <p className="empty-state">No expense records yet.</p> : (
              <table><thead><tr><th>Date</th><th>Category</th><th>Amount</th><th>Paid To</th><th>Mode</th><th></th></tr></thead>
              <tbody>{expenses.map(e => (
                <tr key={e.id}>
                  <td>{new Date(e.expense_date).toLocaleDateString("en-IN")}</td>
                  <td><span className="badge badge-danger">{expCats[e.category] || e.category}</span></td>
                  <td style={{ fontWeight: 700, color: "var(--danger)" }}>₹{Number(e.amount).toLocaleString()}</td>
                  <td>{e.paid_to || "-"}</td>
                  <td>{e.payment_mode}</td>
                  <td><button className="btn-outline" style={{ fontSize: 11, padding: "3px 8px" }} onClick={() => printReceipt("expense", e)}>Print</button></td>
                </tr>
              ))}</tbody></table>
            )}
          </div>
        </div>
      )}

      {view === "salary" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}><h3 style={{ fontSize: 17, fontWeight: 700 }}>Salary Payments</h3><button className="btn btn-accent" onClick={() => setShowSalForm(!showSalForm)}>+ Pay Salary</button></div>
          {showSalForm && (
            <div className="card" style={{ marginBottom: 16, borderColor: "var(--accent)" }}>
              <div className="grid-3">
                <div><label className="label">Staff Member *</label><select className="select" value={salForm.staffId} onChange={e => setSalForm({ ...salForm, staffId: e.target.value })}><option value="">Select Staff</option>{staffList.map(s => <option key={s.id} value={s.id}>{s.profiles?.full_name}</option>)}</select></div>
                <div><label className="label">Basic Amount (₹) *</label><input className="input" type="number" value={salForm.amount} onChange={e => setSalForm({ ...salForm, amount: e.target.value })} /></div>
                <div><label className="label">Month *</label><input className="input" value={salForm.month} onChange={e => setSalForm({ ...salForm, month: e.target.value })} placeholder="e.g. April 2026" /></div>
              </div>
              <div className="grid-3" style={{ marginTop: 12 }}>
                <div><label className="label">Deductions (₹)</label><input className="input" type="number" value={salForm.deductions} onChange={e => setSalForm({ ...salForm, deductions: e.target.value })} /></div>
                <div><label className="label">Bonus (₹)</label><input className="input" type="number" value={salForm.bonus} onChange={e => setSalForm({ ...salForm, bonus: e.target.value })} /></div>
                <div><label className="label">Net: ₹{(Number(salForm.amount || 0) - Number(salForm.deductions || 0) + Number(salForm.bonus || 0)).toLocaleString()}</label>
                  <select className="select" value={salForm.paymentMode} onChange={e => setSalForm({ ...salForm, paymentMode: e.target.value })}><option value="bank_transfer">Bank Transfer</option><option value="cash">Cash</option><option value="upi">UPI</option><option value="cheque">Cheque</option></select></div>
              </div>
              <button className="btn btn-success" style={{ marginTop: 12 }} onClick={addSalary}>Pay Salary</button>
            </div>
          )}
          <div className="card">
            {salaries.length === 0 ? <p className="empty-state">No salary records yet.</p> : (
              <table><thead><tr><th>Staff</th><th>Month</th><th>Basic</th><th>Deductions</th><th>Bonus</th><th>Net Paid</th><th>Mode</th><th></th></tr></thead>
              <tbody>{salaries.map(s => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 600 }}>{s.staff?.profiles?.full_name}</td>
                  <td>{s.month}</td>
                  <td>₹{Number(s.amount).toLocaleString()}</td>
                  <td style={{ color: "var(--danger)" }}>-₹{Number(s.deductions || 0).toLocaleString()}</td>
                  <td style={{ color: "var(--success)" }}>+₹{Number(s.bonus || 0).toLocaleString()}</td>
                  <td style={{ fontWeight: 700 }}>₹{Number(s.net_amount || s.amount).toLocaleString()}</td>
                  <td>{s.payment_mode}</td>
                  <td><button className="btn-outline" style={{ fontSize: 11, padding: "3px 8px" }} onClick={() => printSalarySlip(s)}>Slip</button></td>
                </tr>
              ))}</tbody></table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ========== GUARDIANS ==========
function GuardiansTab() {
  const [students, setStudents] = useState([]); const [selStudent, setSelStudent] = useState(null); const [guardians, setGuardians] = useState([]);
  const [showForm, setShowForm] = useState(false); const [form, setForm] = useState({ fullName: "", email: "", phone: "", relation: "", occupation: "" });
  const [loading, setLoading] = useState(false); const [msg, setMsg] = useState("");
  useEffect(() => { supabase.from("students").select("*, profiles!inner(full_name)").eq("status", "active").order("created_at", { ascending: false }).then(({ data }) => setStudents(data || [])); }, []);
  const loadGuardians = async (student) => { setSelStudent(student); setShowForm(false); setMsg(""); const { data } = await supabase.from("student_guardians").select("*, guardians!inner(*, profiles!inner(full_name, phone, email))").eq("student_id", student.id); setGuardians(data || []); };
  const addGuardian = async () => {
    if (!form.fullName || !form.email) { setMsg("Error: Name and email are required!"); return; }
    setLoading(true); setMsg("");
    try {
      const tempPass = "Guard@" + Date.now().toString().slice(-6);
      const { data: userId, error: authErr } = await supabase.rpc("create_guardian_account", { p_email: form.email, p_password: tempPass, p_full_name: form.fullName });
      if (authErr) throw authErr;
      if (!userId) throw new Error("User creation failed");
      await supabase.from("profiles").update({ phone: form.phone }).eq("id", userId);
      const { data: gData, error: gErr } = await supabase.from("guardians").insert({ profile_id: userId, relation: form.relation || null, occupation: form.occupation || null }).select().single();
      if (gErr) throw gErr;
      await supabase.from("student_guardians").insert({ student_id: selStudent.id, guardian_id: gData.id, is_primary: guardians.length === 0 });
      setMsg(`✅ Guardian added! Login: ${form.email} | Password: ${tempPass}`);
      setForm({ fullName: "", email: "", phone: "", relation: "", occupation: "" }); setShowForm(false);
      loadGuardians(selStudent);
    } catch (e) { setMsg("Error: " + e.message); }
    setLoading(false);
  };
  const removeLink = async (sgId) => { if (!confirm("Remove this guardian link?")) return; await supabase.from("student_guardians").delete().eq("id", sgId); loadGuardians(selStudent); };
  const setPrimary = async (sgId) => { for (const g of guardians) { await supabase.from("student_guardians").update({ is_primary: g.id === sgId }).eq("id", g.id); } loadGuardians(selStudent); };

  return (
    <div>
      <h1 className="page-title">Guardian Management</h1>
      <p className="page-sub">Link parents &amp; guardians to students</p>
      <div style={{ display: "flex", gap: 20 }}>
        <div style={{ width: 260, flexShrink: 0 }}>
          <div className="card" style={{ maxHeight: 500, overflowY: "auto" }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: "var(--muted)" }}>Select Student</h3>
            {students.map(st => <div key={st.id} className={`student-item ${selStudent?.id === st.id ? "active" : ""}`} onClick={() => loadGuardians(st)}>{st.profiles?.full_name}</div>)}
          </div>
        </div>
        <div style={{ flex: 1 }}>
          {!selStudent ? <div className="card empty-state">Select a student to manage guardians</div> : (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h3 style={{ fontSize: 17, fontWeight: 700 }}>Guardians of {selStudent.profiles?.full_name}</h3>
                <button className="btn btn-accent" onClick={() => setShowForm(!showForm)}>+ Add Guardian</button>
              </div>
              {msg && <div className={msg.startsWith("Error") ? "error-box" : "success-box"} style={{ marginBottom: 12 }}>{msg}</div>}
              {showForm && (
                <div className="card" style={{ marginBottom: 16, borderColor: "var(--accent)" }}>
                  <div className="grid-3">
                    <div><label className="label">Full Name *</label><input className="input" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} /></div>
                    <div><label className="label">Email *</label><input className="input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
                    <div><label className="label">Phone</label><input className="input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
                  </div>
                  <div className="grid-2" style={{ marginTop: 12 }}>
                    <div><label className="label">Relation</label><select className="select" value={form.relation} onChange={e => setForm({ ...form, relation: e.target.value })}><option value="">Select</option><option value="father">Father</option><option value="mother">Mother</option><option value="guardian">Guardian</option><option value="sibling">Sibling</option><option value="other">Other</option></select></div>
                    <div><label className="label">Occupation</label><input className="input" value={form.occupation} onChange={e => setForm({ ...form, occupation: e.target.value })} placeholder="e.g. Business, Teacher" /></div>
                  </div>
                  <button className="btn btn-success" style={{ marginTop: 12 }} onClick={addGuardian} disabled={loading}>{loading ? "Adding Guardian..." : "Save Guardian"}</button>
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
                      <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>{sg.guardians?.profiles?.phone || "No phone"} | {sg.guardians?.profiles?.email || ""}{sg.guardians?.occupation ? ` | ${sg.guardians.occupation}` : ""}</div>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      {!sg.is_primary && <button className="btn-outline" style={{ fontSize: 12, padding: "6px 12px" }} onClick={() => setPrimary(sg.id)}>Set Primary</button>}
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

// ========== HOSTEL ==========
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
  const addHostel = async () => { if (!hostelForm.name) return; await supabase.from("hostels").insert({ name: hostelForm.name, type: hostelForm.type, warden_name: hostelForm.wardenName || null, warden_phone: hostelForm.wardenPhone || null, total_rooms: hostelForm.totalRooms ? Number(hostelForm.totalRooms) : 0 }); setHostelForm({ name: "", type: "boys", wardenName: "", wardenPhone: "", totalRooms: "" }); setShowHostelForm(false); loadHostels(); };
  const addRoom = async () => { if (!roomForm.roomNumber || !selHostel) return; await supabase.from("hostel_rooms").insert({ hostel_id: selHostel.id, room_number: roomForm.roomNumber, floor: roomForm.floor || null, room_type: roomForm.roomType, total_beds: Number(roomForm.totalBeds), monthly_rent: roomForm.monthlyRent ? Number(roomForm.monthlyRent) : 0, has_ac: roomForm.hasAc, has_attached_bath: roomForm.hasAttachedBath }); setRoomForm({ roomNumber: "", floor: "", roomType: "double", totalBeds: "2", monthlyRent: "", hasAc: false, hasAttachedBath: false }); setShowRoomForm(false); loadRooms(selHostel.id); };
  const allotRoom = async () => { if (!allotForm.studentId || !allotForm.roomId) return; await supabase.from("hostel_allotments").insert({ student_id: allotForm.studentId, room_id: allotForm.roomId, bed_number: Number(allotForm.bedNumber) }); await supabase.from("students").update({ is_hosteler: true }).eq("id", allotForm.studentId); setAllotForm({ studentId: "", roomId: "", bedNumber: "1" }); setShowAllotForm(false); loadAllotments(); setMsg("Room allotted successfully!"); };
  const vacateStudent = async (allotId, studentId) => { if (!confirm("Vacate this student from hostel?")) return; await supabase.from("hostel_allotments").update({ status: "vacated", vacate_date: new Date().toISOString().split("T")[0] }).eq("id", allotId); await supabase.from("students").update({ is_hosteler: false }).eq("id", studentId); loadAllotments(); setMsg("Student vacated from hostel."); };
  const addHostelFee = async () => { if (!feeForm.studentId || !feeForm.amount || !feeForm.feeMonth) return; await supabase.from("hostel_fees").insert({ student_id: feeForm.studentId, amount: Number(feeForm.amount), fee_month: feeForm.feeMonth, payment_mode: feeForm.paymentMode, receipt_number: "HF-" + Date.now() }); setFeeForm({ studentId: "", amount: "", feeMonth: "", paymentMode: "cash" }); setShowFeeForm(false); loadHostelFees(); setMsg("Hostel fee recorded!"); };
  const occupiedBeds = allotments.reduce((acc, a) => { acc[a.room_id] = (acc[a.room_id] || 0) + 1; return acc; }, {});
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div><h1 className="page-title">Hostel Management</h1><p className="page-sub" style={{ marginBottom: 0 }}>{allotments.length} hostelers | {hostels.length} hostels</p></div>
        <div style={{ display: "flex", gap: 8 }}>{["overview","rooms","allotments","fees"].map(v => <button key={v} className={`tag ${view === v ? "active" : ""}`} onClick={() => setView(v)}>{v.charAt(0).toUpperCase() + v.slice(1)}</button>)}</div>
      </div>
      {msg && <div className="success-box">{msg}</div>}
      {view === "overview" && (<div>
        <div className="grid-4" style={{ marginBottom: 20 }}><StatCard title="Total Hostels" value={hostels.length} variant="primary" /><StatCard title="Total Rooms" value={hostels.reduce((a, h) => a + (h.total_rooms || 0), 0)} variant="success" /><StatCard title="Hostelers" value={allotments.length} variant="warning" /><StatCard title="Fee Records" value={hostelFees.length} variant="danger" /></div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}><h3 style={{ fontSize: 15, fontWeight: 700 }}>Hostels</h3><button className="btn btn-accent" onClick={() => setShowHostelForm(!showHostelForm)}>+ Add Hostel</button></div>
        {showHostelForm && (<div className="card" style={{ marginBottom: 16, borderColor: "var(--accent)" }}><div className="grid-2"><div><label className="label">Hostel Name *</label><input className="input" value={hostelForm.name} onChange={e => setHostelForm({ ...hostelForm, name: e.target.value })} placeholder="e.g. Boys Hostel Block A" /></div><div><label className="label">Type</label><select className="select" value={hostelForm.type} onChange={e => setHostelForm({ ...hostelForm, type: e.target.value })}><option value="boys">Boys</option><option value="girls">Girls</option><option value="mixed">Mixed</option></select></div></div><div className="grid-3" style={{ marginTop: 12 }}><div><label className="label">Warden Name</label><input className="input" value={hostelForm.wardenName} onChange={e => setHostelForm({ ...hostelForm, wardenName: e.target.value })} /></div><div><label className="label">Warden Phone</label><input className="input" value={hostelForm.wardenPhone} onChange={e => setHostelForm({ ...hostelForm, wardenPhone: e.target.value })} /></div><div><label className="label">Total Rooms</label><input className="input" type="number" value={hostelForm.totalRooms} onChange={e => setHostelForm({ ...hostelForm, totalRooms: e.target.value })} /></div></div><button className="btn btn-success" style={{ marginTop: 12 }} onClick={addHostel}>Save Hostel</button></div>)}
        {hostels.map(h => (<div key={h.id} className="card" style={{ marginBottom: 12, cursor: "pointer" }} onClick={() => { setSelHostel(h); loadRooms(h.id); setView("rooms"); }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><div><span style={{ fontWeight: 700, fontSize: 15 }}>{h.name}</span><span className={`badge ${h.type === "boys" ? "badge-primary" : h.type === "girls" ? "badge-danger" : "badge-warning"}`} style={{ marginLeft: 8 }}>{h.type}</span><div style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>Warden: {h.warden_name || "-"} | Phone: {h.warden_phone || "-"} | Rooms: {h.total_rooms}</div></div><span style={{ color: "var(--primary)", fontWeight: 600, fontSize: 13 }}>Manage →</span></div></div>))}
      </div>)}
      {view === "rooms" && (<div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}><div><h3 style={{ fontSize: 17, fontWeight: 700 }}>{selHostel?.name || "Select a Hostel"}</h3><div style={{ display: "flex", gap: 8, marginTop: 8 }}>{hostels.map(h => <button key={h.id} className={`tag ${selHostel?.id === h.id ? "active" : ""}`} onClick={() => { setSelHostel(h); loadRooms(h.id); }}>{h.name}</button>)}</div></div>{selHostel && <button className="btn btn-accent" onClick={() => setShowRoomForm(!showRoomForm)}>+ Add Room</button>}</div>
        {showRoomForm && (<div className="card" style={{ marginBottom: 16, borderColor: "var(--accent)" }}><div className="grid-3"><div><label className="label">Room No. *</label><input className="input" value={roomForm.roomNumber} onChange={e => setRoomForm({ ...roomForm, roomNumber: e.target.value })} placeholder="101" /></div><div><label className="label">Floor</label><input className="input" value={roomForm.floor} onChange={e => setRoomForm({ ...roomForm, floor: e.target.value })} placeholder="1st Floor" /></div><div><label className="label">Type</label><select className="select" value={roomForm.roomType} onChange={e => setRoomForm({ ...roomForm, roomType: e.target.value })}><option value="single">Single</option><option value="double">Double</option><option value="triple">Triple</option><option value="dormitory">Dormitory</option></select></div></div><div className="grid-3" style={{ marginTop: 12 }}><div><label className="label">Total Beds</label><input className="input" type="number" value={roomForm.totalBeds} onChange={e => setRoomForm({ ...roomForm, totalBeds: e.target.value })} /></div><div><label className="label">Monthly Rent (₹)</label><input className="input" type="number" value={roomForm.monthlyRent} onChange={e => setRoomForm({ ...roomForm, monthlyRent: e.target.value })} /></div><div style={{ display: "flex", gap: 16, alignItems: "flex-end", paddingBottom: 4 }}><label style={{ fontSize: 13, display: "flex", alignItems: "center", gap: 4 }}><input type="checkbox" checked={roomForm.hasAc} onChange={e => setRoomForm({ ...roomForm, hasAc: e.target.checked })} /> AC</label><label style={{ fontSize: 13, display: "flex", alignItems: "center", gap: 4 }}><input type="checkbox" checked={roomForm.hasAttachedBath} onChange={e => setRoomForm({ ...roomForm, hasAttachedBath: e.target.checked })} /> Attached Bath</label></div></div><button className="btn btn-success" style={{ marginTop: 12 }} onClick={addRoom}>Save Room</button></div>)}
        <div className="card">{rooms.length === 0 ? <p className="empty-state">{selHostel ? "No rooms added yet." : "Select a hostel first."}</p> : (<table><thead><tr><th>Room</th><th>Floor</th><th>Type</th><th>Beds</th><th>Occupied</th><th>Rent/Month</th><th>Facilities</th></tr></thead><tbody>{rooms.map(r => { const occ = occupiedBeds[r.id] || 0; return (<tr key={r.id}><td style={{ fontWeight: 700 }}>{r.room_number}</td><td>{r.floor || "-"}</td><td><span className="badge badge-primary">{r.room_type}</span></td><td>{r.total_beds}</td><td><span className={`badge ${occ >= r.total_beds ? "badge-danger" : occ > 0 ? "badge-warning" : "badge-success"}`}>{occ}/{r.total_beds}</span></td><td>₹{r.monthly_rent?.toLocaleString()}</td><td>{[r.has_ac && "AC", r.has_attached_bath && "Attached Bath"].filter(Boolean).join(", ") || "-"}</td></tr>); })}</tbody></table>)}</div>
      </div>)}
      {view === "allotments" && (<div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}><h3 style={{ fontSize: 17, fontWeight: 700 }}>Room Allotments</h3><button className="btn btn-accent" onClick={() => setShowAllotForm(!showAllotForm)}>+ Allot Room</button></div>
        {showAllotForm && (<div className="card" style={{ marginBottom: 16, borderColor: "var(--accent)" }}><div className="grid-3"><div><label className="label">Student</label><select className="select" value={allotForm.studentId} onChange={e => setAllotForm({ ...allotForm, studentId: e.target.value })}><option value="">Select Student</option>{students.filter(s => !allotments.find(a => a.student_id === s.id)).map(s => <option key={s.id} value={s.id}>{s.profiles?.full_name}</option>)}</select></div><div><label className="label">Room</label><select className="select" value={allotForm.roomId} onChange={e => setAllotForm({ ...allotForm, roomId: e.target.value })}><option value="">Select Room</option>{rooms.filter(r => (occupiedBeds[r.id] || 0) < r.total_beds).map(r => <option key={r.id} value={r.id}>{r.room_number} ({r.room_type}) — {r.total_beds - (occupiedBeds[r.id] || 0)} bed(s) free</option>)}</select></div><div><label className="label">Bed Number</label><input className="input" type="number" value={allotForm.bedNumber} onChange={e => setAllotForm({ ...allotForm, bedNumber: e.target.value })} /></div></div><button className="btn btn-success" style={{ marginTop: 12 }} onClick={allotRoom}>Allot Room</button></div>)}
        <div className="card">{allotments.length === 0 ? <p className="empty-state">No allotments yet.</p> : (<table><thead><tr><th>Student</th><th>Room</th><th>Hostel</th><th>Bed</th><th>Since</th><th></th></tr></thead><tbody>{allotments.map(a => (<tr key={a.id}><td style={{ fontWeight: 600 }}>{a.students?.profiles?.full_name}</td><td><span className="badge badge-primary">{a.hostel_rooms?.room_number}</span></td><td>{a.hostel_rooms?.hostels?.name}</td><td>Bed {a.bed_number}</td><td>{new Date(a.allotment_date).toLocaleDateString("en-IN")}</td><td><button style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer", fontSize: 12, fontWeight: 600 }} onClick={() => vacateStudent(a.id, a.student_id)}>Vacate</button></td></tr>))}</tbody></table>)}</div>
      </div>)}
      {view === "fees" && (<div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}><h3 style={{ fontSize: 17, fontWeight: 700 }}>Hostel Fee Payments</h3><button className="btn btn-accent" onClick={() => setShowFeeForm(!showFeeForm)}>+ Record Fee</button></div>
        {showFeeForm && (<div className="card" style={{ marginBottom: 16, borderColor: "var(--accent)" }}><div className="grid-2"><div><label className="label">Student</label><select className="select" value={feeForm.studentId} onChange={e => setFeeForm({ ...feeForm, studentId: e.target.value })}><option value="">Select</option>{allotments.map(a => <option key={a.student_id} value={a.student_id}>{a.students?.profiles?.full_name} (Room {a.hostel_rooms?.room_number})</option>)}</select></div><div><label className="label">Amount (₹)</label><input className="input" type="number" value={feeForm.amount} onChange={e => setFeeForm({ ...feeForm, amount: e.target.value })} /></div></div><div className="grid-2" style={{ marginTop: 12 }}><div><label className="label">Fee Month</label><input className="input" value={feeForm.feeMonth} onChange={e => setFeeForm({ ...feeForm, feeMonth: e.target.value })} placeholder="e.g. April 2026" /></div><div><label className="label">Payment Mode</label><select className="select" value={feeForm.paymentMode} onChange={e => setFeeForm({ ...feeForm, paymentMode: e.target.value })}><option value="cash">Cash</option><option value="upi">UPI</option><option value="bank_transfer">Bank Transfer</option><option value="cheque">Cheque</option></select></div></div><button className="btn btn-success" style={{ marginTop: 12 }} onClick={addHostelFee}>Save Payment</button></div>)}
        <div className="card">{hostelFees.length === 0 ? <p className="empty-state">No hostel fee records yet.</p> : (<table><thead><tr><th>Student</th><th>Amount</th><th>Month</th><th>Mode</th><th>Date</th><th>Receipt</th></tr></thead><tbody>{hostelFees.map(f => (<tr key={f.id}><td style={{ fontWeight: 600 }}>{f.students?.profiles?.full_name}</td><td style={{ fontWeight: 700, color: "var(--success)" }}>₹{f.amount?.toLocaleString()}</td><td>{f.fee_month}</td><td><span className="badge badge-primary">{f.payment_mode}</span></td><td>{new Date(f.payment_date).toLocaleDateString("en-IN")}</td><td style={{ fontSize: 12, color: "var(--muted)" }}>{f.receipt_number}</td></tr>))}</tbody></table>)}</div>
      </div>)}
    </div>
  );
}

// ========== STAFF ==========
function StaffTab() {
  const [staffList, setStaffList] = useState([]); const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", designation: "", specialization: "", salary: "", role: "teacher" });
  const [loading, setLoading] = useState(false); const [msg, setMsg] = useState("");

  const loadStaff = async () => { const { data } = await supabase.from("staff").select("*, profiles!inner(full_name, phone, email, role)"); setStaffList(data || []); };
  useEffect(() => { loadStaff(); }, []);

  const add = async () => {
    if (!form.fullName || !form.email) { setMsg("Error: Name and email are required!"); return; }
    setLoading(true);
    try {
      const tempPass = "MCA@" + Date.now().toString().slice(-6);
      const { data: userId, error: authErr } = await supabase.rpc("create_staff_account", { p_email: form.email, p_password: tempPass, p_full_name: form.fullName, p_role: form.role });
      if (authErr) throw authErr;
      if (!userId) throw new Error("User creation failed");
      await supabase.from("profiles").update({ phone: form.phone }).eq("id", userId);
      await supabase.from("staff").insert({ profile_id: userId, designation: form.designation || null, subject_specialization: form.specialization || null, salary: form.salary ? Number(form.salary) : null });
      setMsg(`✅ Staff added!\nLogin Email: ${form.email}\nPassword: ${tempPass}\nRole: ${form.role}`);
      setShowForm(false); setForm({ fullName: "", email: "", phone: "", designation: "", specialization: "", salary: "", role: "teacher" });
      loadStaff();
    } catch (e) { setMsg("Error: " + e.message); }
    setLoading(false);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div><h1 className="page-title">Staff Management</h1><p style={{ fontSize: 13, color: "var(--muted)" }}>{staffList.length} staff members</p></div>
        <button className="btn btn-accent" onClick={() => setShowForm(!showForm)}>+ Add Staff</button>
      </div>
      {msg && <div className={msg.startsWith("Error") ? "error-box" : "success-box"} style={{ whiteSpace: "pre-line", marginBottom: 16 }}>{msg}</div>}
      {showForm && (
        <div className="card" style={{ marginBottom: 20, borderColor: "var(--accent)" }}>
          <div className="grid-3">
            <div><label className="label">Full Name *</label><input className="input" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} /></div>
            <div><label className="label">Email *</label><input className="input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
            <div><label className="label">Phone</label><input className="input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
          </div>
          <div className="grid-3" style={{ marginTop: 12 }}>
            <div><label className="label">Designation</label><input className="input" value={form.designation} onChange={e => setForm({ ...form, designation: e.target.value })} placeholder="e.g. Senior Teacher" /></div>
            <div><label className="label">Subject Specialization</label><input className="input" value={form.specialization} onChange={e => setForm({ ...form, specialization: e.target.value })} placeholder="e.g. Mathematics" /></div>
            <div><label className="label">Monthly Salary (₹)</label><input className="input" type="number" value={form.salary} onChange={e => setForm({ ...form, salary: e.target.value })} /></div>
          </div>
          <div style={{ marginTop: 12 }}>
            <label className="label">Role / Access Level</label>
            <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
              {[{ val: "teacher", label: "Teacher", desc: "Timetable, Live Classes, Attendance, Tests, Notices" }, { val: "staff", label: "Staff", desc: "Students, Live Classes, Attendance, Hostel, Notices" }].map(r => (
                <div key={r.val} onClick={() => setForm({ ...form, role: r.val })} style={{ flex: 1, padding: 12, borderRadius: 8, cursor: "pointer", border: form.role === r.val ? "2px solid var(--primary)" : "2px solid var(--border)", background: form.role === r.val ? "var(--primary-light)" : "#fff" }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{r.label}</div>
                  <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>{r.desc}</div>
                </div>
              ))}
            </div>
          </div>
          <button className="btn btn-success" style={{ marginTop: 14 }} onClick={add} disabled={loading}>{loading ? "Creating account..." : "Add Staff Member"}</button>
        </div>
      )}
      <div className="card">
        {staffList.length === 0 ? <p className="empty-state">No staff members added yet.</p> : (
          <table><thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Designation</th><th>Subject</th></tr></thead>
          <tbody>{staffList.map(st => (
            <tr key={st.id}>
              <td style={{ fontWeight: 600 }}>{st.profiles?.full_name}</td>
              <td>{st.profiles?.email}</td>
              <td>{st.profiles?.phone || "-"}</td>
              <td><span className={`badge ${st.profiles?.role === "teacher" ? "badge-primary" : "badge-warning"}`}>{st.profiles?.role || "teacher"}</span></td>
              <td>{st.designation || "-"}</td>
              <td><span className="badge badge-primary">{st.subject_specialization || "-"}</span></td>
            </tr>
          ))}</tbody></table>
        )}
      </div>
    </div>
  );
}

// ========== NOTICES ==========
function NoticesTab({ profile }) {
  const [notices, setNotices] = useState([]); const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", body: "", targetRole: "" });
  const [loading, setLoading] = useState(false);
  const isAdmin = profile?.role === "admin";
  const loadNotices = async () => { const { data } = await supabase.from("notifications").select("*").order("created_at", { ascending: false }).limit(50); setNotices(data || []); };
  useEffect(() => { loadNotices(); }, []);
  const send = async () => { if (!form.title) return; setLoading(true); await supabase.from("notifications").insert({ title: form.title, body: form.body || null, target_role: form.targetRole || null, target_user_id: null }); setForm({ title: "", body: "", targetRole: "" }); setShowForm(false); setLoading(false); loadNotices(); };
  const deleteNotice = async (id) => { if (!confirm("Delete this notice?")) return; await supabase.from("notifications").delete().eq("id", id); loadNotices(); };
  const markRead = async (id) => { await supabase.from("notifications").update({ is_read: true }).eq("id", id); loadNotices(); };
  const myNotices = notices.filter(n => !n.target_role || n.target_role === profile?.role);
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div><h1 className="page-title">Notices &amp; Announcements</h1><p className="page-sub" style={{ marginBottom: 0 }}>{myNotices.filter(n => !n.is_read).length} unread notices</p></div>
        {isAdmin && <button className="btn btn-accent" onClick={() => setShowForm(!showForm)}>+ New Notice</button>}
      </div>
      {showForm && (
        <div className="card" style={{ marginBottom: 20, borderColor: "var(--accent)" }}>
          <div className="form-group"><label className="label">Title *</label><input className="input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Notice title" /></div>
          <div className="form-group"><label className="label">Message</label><textarea className="input" rows={3} value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} placeholder="Notice details..." style={{ resize: "vertical" }} /></div>
          <div className="form-group"><label className="label">Send To</label>
            <select className="select" value={form.targetRole} onChange={e => setForm({ ...form, targetRole: e.target.value })}>
              <option value="">Everyone</option><option value="student">Students Only</option><option value="teacher">Teachers Only</option><option value="guardian">Guardians Only</option><option value="staff">Staff Only</option>
            </select>
          </div>
          <button className="btn btn-success" onClick={send} disabled={loading}>{loading ? "Sending..." : "Send Notice"}</button>
        </div>
      )}
      {myNotices.length === 0 ? <div className="card empty-state">No notices yet.</div> : myNotices.map(n => (
        <div key={n.id} className="card" style={{ marginBottom: 12, borderLeft: n.is_read ? "4px solid var(--border)" : "4px solid var(--primary)", opacity: n.is_read ? 0.75 : 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{ fontWeight: 700, fontSize: 15 }}>{n.title}</span>
                {!n.is_read && <span className="badge badge-primary">New</span>}
                {n.target_role && <span className="badge badge-muted">{n.target_role}</span>}
              </div>
              {n.body && <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 4, lineHeight: 1.6 }}>{n.body}</p>}
              <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 8 }}>{new Date(n.created_at).toLocaleString("en-IN")}</p>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {!n.is_read && <button className="btn-outline" style={{ fontSize: 11, padding: "4px 10px" }} onClick={() => markRead(n.id)}>Mark Read</button>}
              {isAdmin && <button style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer", fontSize: 11 }} onClick={() => deleteNotice(n.id)}>Delete</button>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ========== PROGRESS ==========
function ProgressTab({ profile }) {
  const [subjects, setSubjects] = useState([]); const [chapters, setChapters] = useState([]); const [selSub, setSelSub] = useState(""); const [progress, setProgress] = useState({});
  const isStudent = profile?.role === "student";
  const [studentId, setStudentId] = useState(null);

  useEffect(() => {
    if (isStudent) {
      supabase.from("students").select("id, course_id").eq("profile_id", profile.id).single().then(({ data }) => {
        if (data) {
          setStudentId(data.id);
          supabase.from("subjects").select("*, courses(name)").eq("course_id", data.course_id).then(({ data: subs }) => setSubjects(subs || []));
        }
      });
    } else {
      supabase.from("subjects").select("*, courses(name)").then(({ data }) => setSubjects(data || []));
    }
  }, [isStudent, profile?.id]);

  useEffect(() => {
    if (selSub) {
      supabase.from("chapters").select("*").eq("subject_id", selSub).order("sort_order").then(({ data }) => setChapters(data || []));
      if (studentId) {
        supabase.from("chapter_progress").select("chapter_id").eq("student_id", studentId).eq("is_completed", true).then(({ data }) => {
          const map = {}; (data || []).forEach(p => { map[p.chapter_id] = true; }); setProgress(map);
        });
      }
    }
  }, [selSub, studentId]);

  const toggleChapter = async (chId) => {
    if (!studentId || !isStudent) return;
    const isDone = progress[chId];
    if (isDone) {
      await supabase.from("chapter_progress").delete().eq("student_id", studentId).eq("chapter_id", chId);
    } else {
      await supabase.from("chapter_progress").upsert({ student_id: studentId, chapter_id: chId, is_completed: true, completed_at: new Date().toISOString() }, { onConflict: "student_id,chapter_id" });
    }
    setProgress(p => ({ ...p, [chId]: !isDone }));
  };

  const done = chapters.filter(ch => progress[ch.id]).length;

  return (
    <div>
      <h1 className="page-title">Progress Tracker</h1>
      <p className="page-sub">Track syllabus completion by subject</p>
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {subjects.map(s => <button key={s.id} className={`tag ${selSub === s.id ? "active" : ""}`} onClick={() => setSelSub(s.id)}>{s.name} ({s.courses?.name})</button>)}
      </div>
      {selSub && (
        <div>
          {chapters.length > 0 && (
            <div className="card" style={{ marginBottom: 16, background: "var(--primary-light)", borderLeft: "4px solid var(--primary)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: 600 }}>Progress: {done}/{chapters.length} chapters completed</span>
                <span style={{ fontWeight: 700, fontSize: 18, color: "var(--primary)" }}>{chapters.length > 0 ? Math.round((done / chapters.length) * 100) : 0}%</span>
              </div>
              <div style={{ marginTop: 8, background: "#fff", borderRadius: 4, height: 8, overflow: "hidden" }}>
                <div style={{ height: "100%", background: "var(--primary)", width: `${chapters.length > 0 ? Math.round((done / chapters.length) * 100) : 0}%`, transition: "width 0.3s" }} />
              </div>
            </div>
          )}
          <div className="card">
            {chapters.length === 0 ? <p style={{ color: "var(--muted)" }}>No chapters added for this subject.</p> : (
              <table><thead><tr><th>#</th><th>Chapter</th><th>Status</th></tr></thead>
              <tbody>{chapters.map((ch, i) => (
                <tr key={ch.id}>
                  <td style={{ color: "var(--muted)", fontSize: 13 }}>{i + 1}</td>
                  <td style={{ fontWeight: 500 }}>{ch.name}</td>
                  <td>
                    {isStudent ? (
                      <button onClick={() => toggleChapter(ch.id)} className={`badge ${progress[ch.id] ? "badge-success" : "badge-muted"}`} style={{ cursor: "pointer", border: "none" }}>
                        {progress[ch.id] ? "✓ Completed" : "Pending"}
                      </button>
                    ) : (
                      <span className={`badge ${progress[ch.id] ? "badge-success" : "badge-muted"}`}>{progress[ch.id] ? "✓ Completed" : "Pending"}</span>
                    )}
                  </td>
                </tr>
              ))}</tbody></table>
            )}
          </div>
        </div>
      )}
      {!selSub && subjects.length > 0 && <div className="card empty-state">Select a subject to view chapters</div>}
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
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      if (s) loadProfile(s.user.id, s.access_token);
      setChecking(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      if (s) loadProfile(s.user.id, s.access_token);
      else { setProfile(null); setActiveTab("Dashboard"); }
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (profile) {
      supabase.from("notifications").select("*").order("created_at", { ascending: false }).limit(50).then(({ data }) => setNotifications(data || []));
    }
  }, [profile]);

  const loadProfile = async (uid, token) => {
    const data = await fetchProfileDirect(uid, token);
    setProfile(data);
  };

  const login = async () => {
    const { data: { session: s } } = await supabase.auth.getSession();
    setSession(s);
    if (s) loadProfile(s.user.id, s.access_token);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setSession(null); setProfile(null); setActiveTab("Dashboard"); setDetailStudent(null);
  };

  const navigate = (tab, data) => {
    if (tab === "StudentDetail") { setDetailStudent(data); setActiveTab("StudentDetail"); }
    else { setActiveTab(tab); setDetailStudent(null); }
  };

  if (checking) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif" }}>Loading...</div>;
  if (!session) return <LoginScreen onLogin={login} />;

  const role = profile?.role || "student";
  const tabs = TABS[role] || TABS.student;
  const unreadCount = (notifications || []).filter(n => !n.is_read && (!n.target_role || n.target_role === role)).length;

  const renderTab = () => {
    if (activeTab === "StudentDetail") return <StudentDetailTab student={detailStudent} onBack={() => { setActiveTab("Students"); setDetailStudent(null); }} userRole={role} />;
    switch (activeTab) {
      case "Dashboard":    return <DashboardTab profile={profile} onNavigate={navigate} notifications={notifications} />;
      case "Students":     return <StudentsTab onNavigate={navigate} userRole={role} />;
      case "Admission":    return <AdmissionTab />;
      case "Courses":      return <CoursesTab />;
      case "Timetable":    return <TimetableTab profile={profile} />;
      case "Live Classes": return <LiveClassesTab profile={profile} />;
      case "Attendance":   return <AttendanceTab profile={profile} />;
      case "Fees":         return <FeesTab profile={profile} />;
      case "Tests":        return <TestsTab profile={profile} />;
      case "Hostel":       return <HostelTab />;
      case "Accounts":     return <AccountsTab />;
      case "Guardians":    return <GuardiansTab />;
      case "Staff":        return <StaffTab />;
      case "Notices":      return <NoticesTab profile={profile} />;
      case "Progress":     return <ProgressTab profile={profile} />;
      default:             return <DashboardTab profile={profile} onNavigate={navigate} notifications={notifications} />;
    }
  };

  return (
    <div>
      <div className="sidebar">
        <div className="sidebar-header">
          <h1 style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.3px", lineHeight: 1.3 }}>My Career Academic</h1>
          <div style={{ fontSize: 10, opacity: 0.6, marginTop: 4 }}>Coaching Center Management</div>
        </div>
        <div style={{ padding: "12px 0", flex: 1, overflowY: "auto" }}>
          {tabs.map(tab => (
            <div key={tab} className={`nav-item ${activeTab === tab || (activeTab === "StudentDetail" && tab === "Students") ? "active" : ""}`} onClick={() => navigate(tab)}>
              <span style={{ fontSize: 14 }}>{TAB_ICONS[tab]}</span>
              <span>{tab}</span>
              {tab === "Notices" && unreadCount > 0 && (
                <span style={{ marginLeft: "auto", background: "var(--danger)", color: "#fff", borderRadius: 10, padding: "1px 7px", fontSize: 11, fontWeight: 700 }}>{unreadCount}</span>
              )}
            </div>
          ))}
        </div>
        <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,0.12)" }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{profile?.full_name || "User"}</div>
          <div style={{ fontSize: 11, opacity: 0.6, marginTop: 2, textTransform: "capitalize" }}>{role}</div>
          <div onClick={logout} style={{ fontSize: 12, opacity: 0.7, cursor: "pointer", marginTop: 10, display: "inline-block" }}>Sign Out</div>
        </div>
      </div>
      <div className="main">{renderTab()}</div>
    </div>
  );
}
