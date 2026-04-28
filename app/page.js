"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../lib/supabase";

const SUPABASE_URL = "https://sxqddwpszfumcwxtmxsk.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4cWRkd3BzemZ1bWN3eHRteHNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2NzMyMTIsImV4cCI6MjA5MjI0OTIxMn0.N-6xZneRahpcpGZVjdSlsb1_gHsWiBTvYm2LNqStF_Q";

const DAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const DAYS_SHORT = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

const MCA_LOGO = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHgAAABQCAIAAABd+SbeAAABCGlDQ1BJQ0MgUHJvZmlsZQAAeJxjYGA8wQAELAYMDLl5JUVB7k4KEZFRCuwPGBiBEAwSk4sLGHADoKpv1yBqL+viUYcLcKakFicD6Q9ArFIEtBxopAiQLZIOYWuA2EkQtg2IXV5SUAJkB4DYRSFBzkB2CpCtkY7ETkJiJxcUgdT3ANk2uTmlyQh3M/Ck5oUGA2kOIJZhKGYIYnBncAL5H6IkfxEDg8VXBgbmCQixpJkMDNtbGRgkbiHEVBYwMPC3MDBsO48QQ4RJQWJRIliIBYiZ0tIYGD4tZ2DgjWRgEL7AwMAVDQsIHG5TALvNnSEfCNMZchhSgSKeDHkMyQx6QJYRgwGDIYMZAKbWPz9HbOBQAAAbXklEQVR4nO18eXRVx5nnV1X33nffep+e3pOEFhBCgFiNsJGNHQwxYBsS7zbjtuNJOpk5mUymJ2fO6WRO4u7OMp1O0s7WPRl3Z+nuOO54GU/idho7tts2YEPAYHYEkkBCCxJa3r7cpW4t88eVHjJgvCAM7qPfHxzxXt26dX/3q19981ffPYBpTGMa05jGNKYxjWn8OwK63AN4f8AYI4TkBC73cP49AqGzbQJjfFlG8sHw0bBoz4oxxi0LWurr6vKF/IH9B23b9j6/3KN7T/gIEO2xWVdbu+n+TW3XtiUSiWAwODg4+L3v/vWe3Xs+Klxf6UR7PEYrKh566MGmptkRw4hEIsFg0DAipml+8b/+SVdnF8ZYCHG5R/ou+GjI3KLFC30+XyaTKZVKxWKxWCwODJxyHLrxExvf9dpztP3yQLncAwAAwBi9kxPhSXNlZcw0S0IITIht2/l8HgDS6VRFrMLn8zmOc14B8dbPK0RYLjPRPr+GMLZLNgBggqU4P99CSNu2KXUZZ6VCUdU0IYWU0rJtRVUcxzmrPUIIIeTpSTRqOA61LOtDeJwL4HISjRAghOa01lbWGIe39WTGcgBACBaT6Pb4SibHqhOJUqnEBTcRJoS4jAGCkZFRs2TCJLMtUyylbJrT1NTcNNDXf7Kn97KvmVeEgM1tq1uzqbU0wjb/fEc+WwAATLAQAiaYqais+MSGDf6A33YcEFJKiTAiirJ167beCRInW3Fz85yb1q3NZjNbXts6Njp2GR+tjMtP9LiP7INND69atXH59l8ff+4XW82CCR7dXCCEJMj6utrVa1YnEgmPfcux39z15sGDh7z/limurZ1x73331dTOePrJpw4eOFju/zI+oIfLTzQAYIyEkACwYEPV5751Q0TOeONjY7//ya0/f3sfYFQgBQiuWre1RkWIBrq9JqELjMDpFSzQKT3E/JGm5MJzE+xjR/pWfHi5n/mZJd8DgAAAABJRU5ErkJggg==";

const TABS = {
  admin: ["Dashboard","Students","Admission","Enquiry","Courses","Timetable","Live Classes","Attendance","Fees","Tests","Hostel","Accounts","Guardians","Staff","Notices"],
  teacher: ["Dashboard","Timetable","Live Classes","Attendance","Tests","Notices"],
  staff: ["Dashboard","Students","Live Classes","Attendance","Hostel","Notices"],
  student: ["Dashboard","Timetable","Live Classes","Fees","Progress","Notices"],
  guardian: ["Dashboard","Fees","Notices"],
};

const TAB_ICONS = {
  Dashboard:"⊞", Students:"☺", Admission:"✚", Enquiry:"📞", Courses:"◈",
  Timetable:"▦", "Live Classes":"▶", Attendance:"✔", Fees:"₹", Tests:"✎",
  Hostel:"⌂", Accounts:"◎", Guardians:"♥", Staff:"★", Progress:"◉", Notices:"🔔"
};

// ─── UTILS ───────────────────────────────────────────────────────────────────
function numberToWords(n) {
  if (!n || n === 0) return "zero";
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
    const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${uid}&select=*`, {
      headers: { apikey: SUPABASE_KEY, Authorization: "Bearer " + (token || SUPABASE_KEY) }
    });
    const rows = await res.json();
    return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
  } catch { return null; }
}

// ─── Safe user create — admin session logout nahi hoga ───────────────────────
async function createUserSafely(email, password, fullName, role, phone) {
  const { data: { session: adminSession } } = await supabase.auth.getSession();
  const { data: authData, error: authErr } = await supabase.auth.signUp({
    email, password,
    options: { data: { full_name: fullName, role } }
  });
  if (authErr) throw authErr;
  const userId = authData.user?.id;
  if (!userId) throw new Error("User creation failed");
  if (adminSession) {
    await supabase.auth.setSession({
      access_token: adminSession.access_token,
      refresh_token: adminSession.refresh_token,
    });
  }
  await new Promise(r => setTimeout(r, 2000));
  const token = adminSession?.access_token || SUPABASE_KEY;
  const profRes = await fetch(SUPABASE_URL + "/rest/v1/profiles?id=eq." + userId + "&select=id", {
    headers: { apikey: SUPABASE_KEY, Authorization: "Bearer " + token }
  });
  const profRows = await profRes.json();
  if (!profRows || profRows.length === 0) {
    await fetch(SUPABASE_URL + "/rest/v1/profiles", {
      method: "POST",
      headers: { apikey: SUPABASE_KEY, Authorization: "Bearer " + token, "Content-Type": "application/json", "Prefer": "return=minimal" },
      body: JSON.stringify({ id: userId, full_name: fullName, phone: phone || null, email, role, is_active: true })
    });
    await new Promise(r => setTimeout(r, 500));
  } else {
    await fetch(SUPABASE_URL + "/rest/v1/profiles?id=eq." + userId, {
      method: "PATCH",
      headers: { apikey: SUPABASE_KEY, Authorization: "Bearer " + token, "Content-Type": "application/json", "Prefer": "return=minimal" },
      body: JSON.stringify({ full_name: fullName, phone: phone || null, role })
    });
  }
  return userId;
}


const today = () => new Date().toISOString().split("T")[0];
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-IN") : "-";
const fmtMoney = (n) => "₹" + (Number(n)||0).toLocaleString("en-IN");

// ─── STAT CARD ───────────────────────────────────────────────────────────────
function StatCard({ title, value, sub, variant = "primary", onClick }) {
  const colors = {
    primary: { bg: "var(--primary-light)", border: "var(--primary)", text: "var(--primary)" },
    danger:  { bg: "var(--danger-light)",  border: "var(--danger)",  text: "var(--danger)"  },
    success: { bg: "var(--success-light)", border: "var(--success)", text: "var(--success)" },
    warning: { bg: "var(--warning-light)", border: "var(--warning)", text: "var(--warning)" },
  };
  const c = colors[variant] || colors.primary;
  return (
    <div className="card" onClick={onClick}
      style={{ borderLeft: `4px solid ${c.border}`, background: c.bg, cursor: onClick ? "pointer" : "default" }}>
      <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>{title}</div>
      <div style={{ fontSize: 26, fontWeight: 700, marginTop: 4, color: c.text }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

// ─── LOGIN ───────────────────────────────────────────────────────────────────
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
          <img src={MCA_LOGO} style={{ height: 52, marginBottom: 12 }} alt="MCA" />
          <h1 style={{ fontSize: 21, fontWeight: 700 }}>My Career Academic</h1>
          <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>A Division of MY LIFELINE FOUNDATION</p>
        </div>
        {error && <div className="error-box">{error}</div>}
        <div className="form-group"><label className="label">Email</label>
          <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} /></div>
        <div className="form-group"><label className="label">Password</label>
          <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleLogin()} /></div>
        <button className="btn" style={{ width: "100%", padding: 12, marginTop: 8 }}
          onClick={handleLogin} disabled={loading}>{loading ? "Logging in…" : "Login"}</button>
      </div>
    </div>
  );
}

// ─── DASHBOARD (ROLE-BASED) ───────────────────────────────────────────────────
function DashboardTab({ profile, onNavigate, notifications }) {
  const role = profile?.role || "student";
  if (role === "admin" || role === "staff") return <AdminDashboard profile={profile} onNavigate={onNavigate} notifications={notifications} />;
  if (role === "teacher") return <TeacherDashboard profile={profile} />;
  if (role === "student") return <StudentDashboard profile={profile} />;
  if (role === "guardian") return <GuardianDashboard profile={profile} />;
  return <AdminDashboard profile={profile} onNavigate={onNavigate} notifications={notifications} />;
}

function AdminDashboard({ profile, onNavigate, notifications }) {
  const [stats, setStats] = useState({ students: 0, courses: 6, staff: 0, live: 0, pendingFee: 0, hostelers: 0 });
  const [recent, setRecent] = useState([]);
  const [todayClasses, setTodayClasses] = useState([]);
  const [enquiries, setEnquiries] = useState([]);

  useEffect(() => {
    (async () => {
      const t = today();
      const [a, b, c, d, e] = await Promise.all([
        supabase.from("students").select("id", { count: "exact" }).eq("status", "active"),
        supabase.from("staff").select("id", { count: "exact" }),
        supabase.from("live_classes").select("id", { count: "exact" }).eq("class_date", t).eq("status", "live"),
        supabase.from("students").select("id", { count: "exact" }).eq("is_hosteler", true),
        supabase.from("enquiries").select("id", { count: "exact" }).eq("status", "pending"),
      ]);
      setStats({ students: a.count||0, staff: b.count||0, live: c.count||0, hostelers: d.count||0, pendingEnq: e.count||0 });
      const { data: r } = await supabase.from("students").select("*, profiles!inner(full_name)").eq("status","active").order("created_at",{ascending:false}).limit(5);
      setRecent(r||[]);
      const { data: cls } = await supabase.from("live_classes").select("*, subjects(name), courses(name)").eq("class_date",t).order("start_time");
      setTodayClasses(cls||[]);
      const { data: enq } = await supabase.from("enquiries").select("*").eq("status","pending").order("created_at",{ascending:false}).limit(4);
      setEnquiries(enq||[]);
    })();
  }, []);

  const unread = (notifications||[]).filter(n=>!n.is_read).length;

  return (
    <div>
      <h1 className="page-title">Dashboard</h1>
      <p className="page-sub">Welcome back, {profile?.full_name || "Admin"} — {new Date().toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long"})}</p>

      <div className="grid-4" style={{marginBottom:20}}>
        <StatCard title="Total Students" value={stats.students} variant="primary" onClick={() => onNavigate("Students")} />
        <StatCard title="Live Now" value={stats.live} variant="danger" />
        <StatCard title="Hostelers" value={stats.hostelers} variant="success" onClick={() => onNavigate("Hostel")} />
        <StatCard title="Unread Notices" value={unread} variant="warning" onClick={() => onNavigate("Notices")} />
      </div>

      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:16}}>
        <div className="card">
          <h3 style={{fontSize:14,fontWeight:700,marginBottom:12,display:"flex",alignItems:"center",gap:8}}>
            Today&apos;s Classes
            <span style={{fontSize:11,background:"var(--primary-light)",color:"var(--primary)",padding:"2px 8px",borderRadius:10}}>{todayClasses.length}</span>
          </h3>
          {todayClasses.length===0 ? <p style={{color:"var(--muted)",fontSize:13}}>No classes scheduled today.</p>
            : todayClasses.map(cl=>(
              <div key={cl.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:"1px solid var(--border)"}}>
                <div>
                  <span style={{fontWeight:600,fontSize:13}}>{cl.subjects?.name}</span>
                  <span style={{fontSize:11,color:"var(--muted)",marginLeft:6}}>{cl.start_time?.slice(0,5)}-{cl.end_time?.slice(0,5)}</span>
                  <div style={{fontSize:11,color:"var(--muted)"}}>{cl.courses?.name} {cl.room ? `· Room ${cl.room}` : ""}</div>
                </div>
                <span className={`badge ${cl.status==="live"?"badge-danger":cl.status==="completed"?"badge-success":"badge-primary"}`}>
                  {cl.status==="live"?"🔴 LIVE":cl.status}
                </span>
              </div>
            ))}
        </div>

        <div className="card">
          <h3 style={{fontSize:14,fontWeight:700,marginBottom:12}}>Recent Admissions</h3>
          {recent.length===0 ? <p style={{color:"var(--muted)",fontSize:13}}>No students yet.</p>
            : recent.map(st=>(
              <div key={st.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:"1px solid var(--border)",cursor:"pointer"}}
                onClick={()=>onNavigate("StudentDetail",st)}>
                <div>
                  <span style={{fontWeight:600,fontSize:13}}>{st.profiles?.full_name}</span>
                  <div style={{fontSize:11,color:"var(--muted)"}}>{fmtDate(st.admission_date)}</div>
                </div>
                <span className="badge badge-primary">{st.admission_number}</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

function TeacherDashboard({ profile }) {
  const [todayClasses, setTodayClasses] = useState([]);
  const [pendingAtt, setPendingAtt] = useState(0);
  useEffect(() => {
    (async () => {
      const t = today();
      const { data: staffRow } = await supabase.from("staff").select("id").eq("profile_id", profile?.id).single();
      if (!staffRow) return;
      const { data: cls } = await supabase.from("live_classes").select("*, subjects(name), courses(name)").eq("class_date",t).eq("teacher_id",staffRow.id).order("start_time");
      setTodayClasses(cls||[]);
      const completed = (cls||[]).filter(c=>c.status==="completed");
      let pen = 0;
      for (const c of completed) {
        const { count } = await supabase.from("attendance").select("id",{count:"exact"}).eq("live_class_id",c.id);
        if (!count) pen++;
      }
      setPendingAtt(pen);
    })();
  }, [profile]);

  return (
    <div>
      <h1 className="page-title">Dashboard</h1>
      <p className="page-sub">Welcome, {profile?.full_name}</p>
      <div className="grid-4" style={{marginBottom:20}}>
        <StatCard title="Today's Classes" value={todayClasses.length} variant="primary"/>
        <StatCard title="Live Now" value={todayClasses.filter(c=>c.status==="live").length} variant="danger"/>
        <StatCard title="Pending Attendance" value={pendingAtt} variant="warning"/>
        <StatCard title="Completed Today" value={todayClasses.filter(c=>c.status==="completed").length} variant="success"/>
      </div>
      <div className="card">
        <h3 style={{fontSize:14,fontWeight:700,marginBottom:12}}>Your Classes Today</h3>
        {todayClasses.length===0?<p style={{color:"var(--muted)",fontSize:13}}>No classes assigned today.</p>
          :todayClasses.map(cl=>(
            <div key={cl.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:"1px solid var(--border)"}}>
              <div>
                <span style={{fontWeight:600}}>{cl.subjects?.name}</span>
                <span style={{fontSize:12,color:"var(--muted)",marginLeft:8}}>{cl.start_time?.slice(0,5)}-{cl.end_time?.slice(0,5)}</span>
                <div style={{fontSize:12,color:"var(--muted)"}}>{cl.courses?.name}</div>
              </div>
              <span className={`badge ${cl.status==="live"?"badge-danger":cl.status==="completed"?"badge-success":"badge-primary"}`}>{cl.status}</span>
            </div>
          ))}
      </div>
    </div>
  );
}

function StudentDashboard({ profile }) {
  const [student, setStudent] = useState(null);
  const [todayClasses, setTodayClasses] = useState([]);
  const [fee, setFee] = useState(null);
  const [attendance, setAttendance] = useState({ pct: 0, total: 0 });
  const [recentTests, setRecentTests] = useState([]);
  const [hostelInfo, setHostelInfo] = useState(null);
  const [foodMenu, setFoodMenu] = useState(null);

  useEffect(() => {
    (async () => {
      const { data: st } = await supabase.from("students").select("*, courses(name,id)").eq("profile_id",profile?.id).single();
      if (!st) return;
      setStudent(st);
      const { data: cls } = await supabase.from("live_classes").select("*, subjects(name)").eq("class_date",today()).eq("course_id",st.course_id).order("start_time");
      setTodayClasses(cls||[]);
      const { data: fData } = await supabase.rpc("get_fee_summary",{p_student_id:st.id});
      setFee(fData?.[0]||null);
      const { data: attData } = await supabase.from("attendance").select("status").eq("student_id",st.id);
      const total = attData?.length||0;
      const present = attData?.filter(a=>a.status==="present"||a.status==="late").length||0;
      setAttendance({ pct: total>0?Math.round((present/total)*100):0, total });
      const { data: tr } = await supabase.from("test_results").select("*, tests!inner(name,total_marks,subjects(name))").eq("student_id",st.id).order("created_at",{ascending:false}).limit(3);
      setRecentTests(tr||[]);
      if (st.is_hosteler) {
        const { data: allot } = await supabase.from("hostel_allotments").select("*, hostel_rooms!inner(room_number,monthly_rent,hostels!inner(name,warden_name,warden_phone))").eq("student_id",st.id).eq("status","active").single();
        setHostelInfo(allot);
        const dow = new Date().getDay();
        const { data: menu } = await supabase.from("hostel_food_menu").select("*").eq("day_of_week",dow).single();
        setFoodMenu(menu);
      }
    })();
  }, [profile]);

  return (
    <div>
      <h1 className="page-title">My Dashboard</h1>
      <p className="page-sub">Welcome back, {profile?.full_name} — {student?.courses?.name || ""}</p>

      <div className="grid-4" style={{marginBottom:20}}>
        <StatCard title="Attendance" value={`${attendance.pct}%`} variant={attendance.pct>=75?"success":"danger"} sub={`${attendance.total} classes`}/>
        <StatCard title="Today's Classes" value={todayClasses.length} variant="primary"/>
        <StatCard title="Fee Paid" value={fmtMoney(fee?.total_paid)} variant="success"/>
        <StatCard title="Fee Pending" value={fmtMoney(fee?.pending)} variant={fee?.pending>0?"danger":"success"}/>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        <div className="card">
          <h3 style={{fontSize:14,fontWeight:700,marginBottom:12}}>Today&apos;s Classes</h3>
          {todayClasses.length===0?<p style={{color:"var(--muted)",fontSize:13}}>No classes today.</p>
            :todayClasses.map(cl=>(
              <div key={cl.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:"1px solid var(--border)"}}>
                <div>
                  <span style={{fontWeight:600,fontSize:13}}>{cl.subjects?.name}</span>
                  <span style={{fontSize:11,color:"var(--muted)",marginLeft:6}}>{cl.start_time?.slice(0,5)}-{cl.end_time?.slice(0,5)}</span>
                </div>
                <span className={`badge ${cl.status==="live"?"badge-danger":cl.status==="completed"?"badge-success":"badge-primary"}`}>{cl.status==="live"?"🔴 LIVE":cl.status}</span>
              </div>
            ))}
        </div>

        <div className="card">
          <h3 style={{fontSize:14,fontWeight:700,marginBottom:12}}>Recent Test Results</h3>
          {recentTests.length===0?<p style={{color:"var(--muted)",fontSize:13}}>No test results yet.</p>
            :recentTests.map(tr=>(
              <div key={tr.id} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid var(--border)"}}>
                <div>
                  <span style={{fontWeight:600,fontSize:13}}>{tr.tests?.name}</span>
                  <div style={{fontSize:11,color:"var(--muted)"}}>{tr.tests?.subjects?.name}</div>
                </div>
                <span className={`badge ${tr.marks_obtained>=tr.tests?.total_marks*0.4?"badge-success":"badge-danger"}`}>
                  {tr.marks_obtained}/{tr.tests?.total_marks}
                </span>
              </div>
            ))}
        </div>

        {hostelInfo && (
          <div className="card" style={{borderLeft:"4px solid var(--success)"}}>
            <h3 style={{fontSize:14,fontWeight:700,marginBottom:10}}>⌂ Hostel Info</h3>
            <div style={{fontSize:13}}><b>Hostel:</b> {hostelInfo.hostel_rooms?.hostels?.name}</div>
            <div style={{fontSize:13}}><b>Room:</b> {hostelInfo.hostel_rooms?.room_number} · Bed {hostelInfo.bed_number}</div>
            <div style={{fontSize:13}}><b>Rent:</b> {fmtMoney(hostelInfo.hostel_rooms?.monthly_rent)}/month</div>
            <div style={{fontSize:13}}><b>Warden:</b> {hostelInfo.hostel_rooms?.hostels?.warden_name} · {hostelInfo.hostel_rooms?.hostels?.warden_phone}</div>
          </div>
        )}

        {foodMenu && (
          <div className="card" style={{borderLeft:"4px solid var(--warning)"}}>
            <h3 style={{fontSize:14,fontWeight:700,marginBottom:10}}>🍽 Today&apos;s Food Menu</h3>
            {foodMenu.breakfast && <div style={{fontSize:13,marginBottom:4}}><b>Breakfast:</b> {foodMenu.breakfast}</div>}
            {foodMenu.lunch && <div style={{fontSize:13,marginBottom:4}}><b>Lunch:</b> {foodMenu.lunch}</div>}
            {foodMenu.evening_snack && <div style={{fontSize:13,marginBottom:4}}><b>Evening:</b> {foodMenu.evening_snack}</div>}
            {foodMenu.dinner && <div style={{fontSize:13}}><b>Dinner:</b> {foodMenu.dinner}</div>}
          </div>
        )}
      </div>
    </div>
  );
}

function GuardianDashboard({ profile }) {
  const [children, setChildren] = useState([]);
  const [selChild, setSelChild] = useState(null);
  const [todayClasses, setTodayClasses] = useState([]);
  const [fee, setFee] = useState(null);
  const [attendance, setAttendance] = useState({pct:0});
  const [foodMenu, setFoodMenu] = useState(null);

  useEffect(() => {
    (async () => {
      const { data: gData } = await supabase.from("guardians").select("id").eq("profile_id",profile?.id).single();
      if (!gData) return;
      const { data: sgData } = await supabase.from("student_guardians").select("*, students!inner(*, profiles!inner(full_name), courses(name))").eq("guardian_id",gData.id);
      const kids = (sgData||[]).map(sg=>sg.students);
      setChildren(kids);
      if (kids.length>0) loadChild(kids[0]);
    })();
  }, [profile]);

  const loadChild = async (child) => {
    setSelChild(child);
    const { data: cls } = await supabase.from("live_classes").select("*, subjects(name)").eq("class_date",today()).eq("course_id",child.course_id).order("start_time");
    setTodayClasses(cls||[]);
    const { data: fData } = await supabase.rpc("get_fee_summary",{p_student_id:child.id});
    setFee(fData?.[0]||null);
    const { data: attData } = await supabase.from("attendance").select("status").eq("student_id",child.id);
    const total = attData?.length||0;
    const present = attData?.filter(a=>a.status==="present"||a.status==="late").length||0;
    setAttendance({pct:total>0?Math.round((present/total)*100):0,total});
    if (child.is_hosteler) {
      const dow = new Date().getDay();
      const { data: menu } = await supabase.from("hostel_food_menu").select("*").eq("day_of_week",dow).single();
      setFoodMenu(menu);
    }
  };

  return (
    <div>
      <h1 className="page-title">Parent Dashboard</h1>
      {children.length>1 && (
        <div style={{display:"flex",gap:8,marginBottom:16}}>
          {children.map(c=>(
            <button key={c.id} className={`tag ${selChild?.id===c.id?"active":""}`} onClick={()=>loadChild(c)}>
              {c.profiles?.full_name}
            </button>
          ))}
        </div>
      )}
      {selChild && (
        <>
          <p className="page-sub">{selChild.profiles?.full_name} — {selChild.courses?.name} · Adm: {selChild.admission_number}</p>
          <div className="grid-4" style={{marginBottom:20}}>
            <StatCard title="Attendance" value={`${attendance.pct}%`} variant={attendance.pct>=75?"success":"danger"} sub={`${attendance.total} classes`}/>
            <StatCard title="Today's Classes" value={todayClasses.length} variant="primary"/>
            <StatCard title="Fee Paid" value={fmtMoney(fee?.total_paid)} variant="success"/>
            <StatCard title="Fee Pending" value={fmtMoney(fee?.pending)} variant={fee?.pending>0?"danger":"success"}/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
            <div className="card">
              <h3 style={{fontSize:14,fontWeight:700,marginBottom:12}}>Today&apos;s Schedule</h3>
              {todayClasses.length===0?<p style={{color:"var(--muted)",fontSize:13}}>No classes today.</p>
                :todayClasses.map(cl=>(
                  <div key={cl.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:"1px solid var(--border)"}}>
                    <div>
                      <span style={{fontWeight:600,fontSize:13}}>{cl.subjects?.name}</span>
                      <span style={{fontSize:11,color:"var(--muted)",marginLeft:6}}>{cl.start_time?.slice(0,5)}-{cl.end_time?.slice(0,5)}</span>
                    </div>
                    <span className={`badge ${cl.status==="live"?"badge-danger":cl.status==="completed"?"badge-success":"badge-primary"}`}>{cl.status==="live"?"🔴 LIVE":cl.status}</span>
                  </div>
                ))}
            </div>
            {foodMenu && (
              <div className="card" style={{borderLeft:"4px solid var(--warning)"}}>
                <h3 style={{fontSize:14,fontWeight:700,marginBottom:10}}>🍽 Today&apos;s Hostel Menu</h3>
                {foodMenu.breakfast && <div style={{fontSize:13,marginBottom:4}}><b>Breakfast:</b> {foodMenu.breakfast}</div>}
                {foodMenu.lunch && <div style={{fontSize:13,marginBottom:4}}><b>Lunch:</b> {foodMenu.lunch}</div>}
                {foodMenu.evening_snack && <div style={{fontSize:13,marginBottom:4}}><b>Evening:</b> {foodMenu.evening_snack}</div>}
                {foodMenu.dinner && <div style={{fontSize:13}}><b>Dinner:</b> {foodMenu.dinner}</div>}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ─── STUDENT DETAIL ───────────────────────────────────────────────────────────
function StudentDetailTab({ student, onBack }) {
  const [profile, setProfile] = useState(null);
  const [course, setCourse] = useState(null);
  const [fee, setFee] = useState(null);
  const [payments, setPayments] = useState([]);
  const [attendance, setAttendance] = useState({total:0,present:0,pct:0});
  const [testResults, setTestResults] = useState([]);
  const [progress, setProgress] = useState({total:0,done:0});
  const [guardians, setGuardians] = useState([]);
  const [hostelAllot, setHostelAllot] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [activeView, setActiveView] = useState("overview");

  useEffect(() => {
    if (!student) return;
    (async () => {
      const { data: p } = await supabase.from("profiles").select("*").eq("id",student.profile_id).single();
      setProfile(p);
      setEditForm({full_name:p?.full_name||"",phone:p?.phone||"",gender:student.gender||"",address:student.address||"",date_of_birth:student.date_of_birth||""});
      const { data: c } = await supabase.from("courses").select("*").eq("id",student.course_id).single();
      setCourse(c);
      const { data: fData } = await supabase.rpc("get_fee_summary",{p_student_id:student.id});
      setFee(fData?.[0]||null);
      const { data: payData } = await supabase.from("fee_payments").select("*").eq("student_id",student.id).order("payment_date",{ascending:false});
      setPayments(payData||[]);
      const { data: attData } = await supabase.from("attendance").select("*").eq("student_id",student.id);
      const total = attData?.length||0;
      const present = attData?.filter(a=>a.status==="present"||a.status==="late").length||0;
      setAttendance({total,present,pct:total>0?Math.round((present/total)*100):0});
      const { data: tr } = await supabase.from("test_results").select("*, tests!inner(name,total_marks,test_date,subjects(name))").eq("student_id",student.id);
      setTestResults(tr||[]);
      const { data: subjects } = await supabase.from("subjects").select("id").eq("course_id",student.course_id);
      const subIds = subjects?.map(s=>s.id)||[];
      if (subIds.length>0) {
        const { data: chapters } = await supabase.from("chapters").select("id").in("subject_id",subIds);
        const { data: prog } = await supabase.from("chapter_progress").select("id").eq("student_id",student.id).eq("is_completed",true);
        setProgress({total:chapters?.length||0,done:prog?.length||0});
      }
      const { data: sgData } = await supabase.from("student_guardians").select("*, guardians!inner(*, profiles!inner(full_name,phone,email))").eq("student_id",student.id);
      setGuardians(sgData||[]);
      if (student.is_hosteler) {
        const { data: allot } = await supabase.from("hostel_allotments").select("*, hostel_rooms!inner(room_number,monthly_rent,hostels!inner(name))").eq("student_id",student.id).eq("status","active").single();
        setHostelAllot(allot);
      }
    })();
  }, [student]);

  const saveEdit = async () => {
    await supabase.from("profiles").update({full_name:editForm.full_name,phone:editForm.phone}).eq("id",student.profile_id);
    await supabase.from("students").update({gender:editForm.gender||null,address:editForm.address||null,date_of_birth:editForm.date_of_birth||null}).eq("id",student.id);
    setProfile({...profile,full_name:editForm.full_name,phone:editForm.phone});
    setEditing(false);
  };

  const markComplete = async () => {
    if (fee?.pending > 0) { alert("Fee pending hai! Pehle fees clear karein."); return; }
    if (!confirm("Course complete mark karein?")) return;
    await supabase.from("students").update({status:"completed"}).eq("id",student.id);
    alert("Student course completed!");
    onBack();
  };

  const printIDCard = () => {
    const w = window.open("","_blank");
    w.document.write(`<html><head><title>ID Card - ${student.admission_number}</title><style>
      body{font-family:Arial,sans-serif;padding:20px}
      .card{width:320px;border:2px solid #1a5c2e;border-radius:12px;overflow:hidden;padding:0}
      .header{background:#1a2a6c;color:#fff;padding:10px 14px;text-align:center}
      .body{padding:14px;display:flex;gap:12px}
      .photo{width:70px;height:85px;border:1px solid #ccc;object-fit:cover;border-radius:4px}
      .info{flex:1;font-size:12px}
      .name{font-size:14px;font-weight:bold;margin-bottom:4px}
      .footer{background:#1a5c2e;color:#fff;padding:6px 14px;font-size:11px;text-align:center}
      @media print{body{padding:0}}
    </style></head><body>
    <div class="card">
      <div class="header">
        <div style="font-size:16px;font-weight:bold">MY CAREER ACADEMIC</div>
        <div style="font-size:10px">A Division of MY LIFELINE FOUNDATION</div>
      </div>
      <div class="body">
        ${student.student_photo?`<img src="${student.student_photo}" class="photo"/>`:
          `<div class="photo" style="background:#f0f0f0;display:flex;align-items:center;justify-content:center;font-size:11px;color:#999">No Photo</div>`}
        <div class="info">
          <div class="name">${profile?.full_name||""}</div>
          <div><b>Adm No:</b> ${student.admission_number}</div>
          <div><b>Course:</b> ${course?.name||""}</div>
          <div><b>Mobile:</b> ${profile?.phone||"-"}</div>
          ${student.blood_group?`<div><b>Blood:</b> ${student.blood_group}</div>`:""}
          <div><b>Year:</b> ${new Date(student.admission_date||Date.now()).getFullYear()}-${new Date(student.admission_date||Date.now()).getFullYear()+1}</div>
        </div>
      </div>
      <div class="footer">Kendrapara · Ph: 06727796700 · mylifelinefoundation.org</div>
    </div>
    </body></html>`);
    w.document.close(); w.print();
  };

  if (!student) return null;
  const views = ["overview","fees","tests","attendance"];

  return (
    <div>
      <button className="btn-outline" onClick={onBack} style={{marginBottom:16,fontSize:13}}>← Back to Students</button>
      <div className="card" style={{marginBottom:16}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div style={{display:"flex",gap:16,alignItems:"center"}}>
            {student.student_photo
              ? <img src={student.student_photo} style={{width:56,height:68,borderRadius:6,objectFit:"cover",border:"1px solid var(--border)"}} alt="photo"/>
              : <div style={{width:56,height:68,borderRadius:6,background:"var(--primary-light)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,fontWeight:700,color:"var(--primary)"}}>{(profile?.full_name||"S")[0].toUpperCase()}</div>}
            <div>
              <h2 style={{fontSize:19,fontWeight:700,margin:0}}>{profile?.full_name||"Student"}</h2>
              <p style={{fontSize:12,color:"var(--muted)",marginTop:2}}>{student.admission_number} · {course?.name||""} {student.is_hosteler?"· 🏠 Hosteler":""}</p>
              <p style={{fontSize:12,color:"var(--muted)"}}>{profile?.phone||"No phone"} · {profile?.email||""}</p>
              {student.father_name && <p style={{fontSize:12,color:"var(--muted)"}}>Father: {student.father_name} {student.mother_name?`· Mother: ${student.mother_name}`:""}</p>}
            </div>
          </div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap",justifyContent:"flex-end"}}>
            <button className="btn-outline" style={{fontSize:12,padding:"5px 10px"}} onClick={printIDCard}>🪪 ID Card</button>
            <button className="btn-outline" style={{fontSize:12,padding:"5px 10px"}} onClick={()=>setEditing(!editing)}>{editing?"Cancel":"Edit"}</button>
            {student.status==="active" && <button className="btn" style={{fontSize:12,padding:"5px 10px",background:"var(--success)"}} onClick={markComplete}>✓ Complete</button>}
          </div>
        </div>
        {editing && (
          <div style={{marginTop:16,padding:16,background:"var(--primary-light)",borderRadius:8}}>
            <div className="grid-3">
              <div><label className="label">Name</label><input className="input" value={editForm.full_name} onChange={e=>setEditForm({...editForm,full_name:e.target.value})}/></div>
              <div><label className="label">Phone</label><input className="input" value={editForm.phone} onChange={e=>setEditForm({...editForm,phone:e.target.value})}/></div>
              <div><label className="label">Gender</label>
                <select className="select" value={editForm.gender} onChange={e=>setEditForm({...editForm,gender:e.target.value})}>
                  <option value="">Select</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
                </select>
              </div>
            </div>
            <div className="grid-2" style={{marginTop:10}}>
              <div><label className="label">DOB</label><input className="input" type="date" value={editForm.date_of_birth} onChange={e=>setEditForm({...editForm,date_of_birth:e.target.value})}/></div>
              <div><label className="label">Address</label><input className="input" value={editForm.address} onChange={e=>setEditForm({...editForm,address:e.target.value})}/></div>
            </div>
            <button className="btn btn-success" style={{marginTop:10,fontSize:13}} onClick={saveEdit}>Save Changes</button>
          </div>
        )}
      </div>

      <div className="grid-4" style={{marginBottom:16}}>
        <StatCard title="Attendance" value={`${attendance.pct}%`} variant={attendance.pct>=75?"success":"danger"} sub={`${attendance.present}/${attendance.total} classes`}/>
        <StatCard title="Fee Paid" value={fmtMoney(fee?.total_paid)} variant="success"/>
        <StatCard title="Pending" value={fmtMoney(fee?.pending)} variant={fee?.pending>0?"danger":"success"}/>
        <StatCard title="Syllabus" value={progress.total>0?`${Math.round((progress.done/progress.total)*100)}%`:"0%"} variant="primary" sub={`${progress.done}/${progress.total} chapters`}/>
      </div>

      <div style={{display:"flex",gap:8,marginBottom:16}}>
        {views.map(v=>(
          <button key={v} className={`tag ${activeView===v?"active":""}`} onClick={()=>setActiveView(v)}>
            {v.charAt(0).toUpperCase()+v.slice(1)}
          </button>
        ))}
        {hostelAllot && <button className={`tag ${activeView==="hostel"?"active":""}`} onClick={()=>setActiveView("hostel")}>Hostel</button>}
      </div>

      {activeView==="overview" && (
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
          <div className="card">
            <h3 style={{fontSize:14,fontWeight:700,marginBottom:12}}>Personal Details</h3>
            <table><tbody>
              <tr><td style={{color:"var(--muted)",fontSize:12,paddingBottom:6}}>DOB</td><td style={{fontSize:13}}>{fmtDate(student.date_of_birth)}</td></tr>
              <tr><td style={{color:"var(--muted)",fontSize:12,paddingBottom:6}}>Gender</td><td style={{fontSize:13}}>{student.gender||"-"}</td></tr>
              <tr><td style={{color:"var(--muted)",fontSize:12,paddingBottom:6}}>Blood Group</td><td style={{fontSize:13}}>{student.blood_group||"-"}</td></tr>
              <tr><td style={{color:"var(--muted)",fontSize:12,paddingBottom:6}}>Category</td><td style={{fontSize:13}}>{student.category||"-"}</td></tr>
              <tr><td style={{color:"var(--muted)",fontSize:12,paddingBottom:6}}>Aadhar</td><td style={{fontSize:13}}>{student.aadhar_number||"-"}</td></tr>
              <tr><td style={{color:"var(--muted)",fontSize:12,paddingBottom:6}}>Address</td><td style={{fontSize:13}}>{student.address||"-"}</td></tr>
              <tr><td style={{color:"var(--muted)",fontSize:12,paddingBottom:6}}>Prev School</td><td style={{fontSize:13}}>{student.previous_school||"-"}</td></tr>
              <tr><td style={{color:"var(--muted)",fontSize:12,paddingBottom:6}}>10th Marks</td><td style={{fontSize:13}}>{student.previous_marks||"-"}</td></tr>
            </tbody></table>
          </div>
          <div className="card">
            <h3 style={{fontSize:14,fontWeight:700,marginBottom:12}}>Guardians</h3>
            {guardians.length===0?<p style={{color:"var(--muted)",fontSize:13}}>No guardians linked.</p>:guardians.map(sg=>(
              <div key={sg.id} style={{padding:"8px 0",borderBottom:"1px solid var(--border)"}}>
                <div style={{fontWeight:600,fontSize:13}}>{sg.guardians?.profiles?.full_name} {sg.is_primary&&<span className="badge badge-success" style={{marginLeft:6}}>Primary</span>}</div>
                <div style={{fontSize:12,color:"var(--muted)"}}>{sg.guardians?.relation||""} · {sg.guardians?.profiles?.phone||""}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeView==="fees" && (
        <div className="card">
          <h3 style={{fontSize:14,fontWeight:700,marginBottom:12}}>Payment History</h3>
          {payments.length===0?<p style={{color:"var(--muted)",fontSize:13}}>No payments.</p>
            :<table><thead><tr><th>Date</th><th>Amount</th><th>Mode</th><th>Receipt</th><th>Installment</th></tr></thead>
            <tbody>{payments.map(p=>(
              <tr key={p.id}>
                <td>{fmtDate(p.payment_date)}</td>
                <td style={{fontWeight:700,color:"var(--success)"}}>{fmtMoney(p.amount)}</td>
                <td><span className="badge badge-primary">{p.payment_mode}</span></td>
                <td style={{fontSize:12,color:"var(--muted)"}}>{p.receipt_number}</td>
                <td style={{fontSize:12}}>#{p.installment_number}</td>
              </tr>
            ))}</tbody></table>}
        </div>
      )}

      {activeView==="tests" && (
        <div className="card">
          <h3 style={{fontSize:14,fontWeight:700,marginBottom:12}}>Test Results</h3>
          {testResults.length===0?<p style={{color:"var(--muted)",fontSize:13}}>No results.</p>
            :<table><thead><tr><th>Test</th><th>Subject</th><th>Date</th><th>Marks</th><th>%</th></tr></thead>
            <tbody>{testResults.map(tr=>{
              const pct=Math.round((tr.marks_obtained/tr.tests?.total_marks)*100);
              return(<tr key={tr.id}>
                <td style={{fontWeight:600}}>{tr.tests?.name}</td>
                <td><span className="badge badge-primary">{tr.tests?.subjects?.name}</span></td>
                <td>{fmtDate(tr.tests?.test_date)}</td>
                <td style={{fontWeight:700}}>{tr.marks_obtained}/{tr.tests?.total_marks}</td>
                <td><span className={`badge ${pct>=40?"badge-success":"badge-danger"}`}>{pct}%</span></td>
              </tr>);
            })}</tbody></table>}
        </div>
      )}

      {activeView==="attendance" && (
        <div className="card">
          <h3 style={{fontSize:14,fontWeight:700,marginBottom:12}}>Attendance Summary</h3>
          <div style={{display:"flex",gap:16,marginBottom:16}}>
            <div style={{padding:"12px 20px",background:"var(--success-light)",borderRadius:8,textAlign:"center"}}>
              <div style={{fontSize:22,fontWeight:700,color:"var(--success)"}}>{attendance.pct}%</div>
              <div style={{fontSize:12,color:"var(--muted)"}}>Overall</div>
            </div>
            <div style={{padding:"12px 20px",background:"var(--primary-light)",borderRadius:8,textAlign:"center"}}>
              <div style={{fontSize:22,fontWeight:700,color:"var(--primary)"}}>{attendance.present}</div>
              <div style={{fontSize:12,color:"var(--muted)"}}>Present</div>
            </div>
            <div style={{padding:"12px 20px",background:"var(--danger-light)",borderRadius:8,textAlign:"center"}}>
              <div style={{fontSize:22,fontWeight:700,color:"var(--danger)"}}>{attendance.total-attendance.present}</div>
              <div style={{fontSize:12,color:"var(--muted)"}}>Absent</div>
            </div>
          </div>
          {attendance.pct<75 && <div className="error-box">⚠ Attendance below 75% — guardian notification required.</div>}
        </div>
      )}

      {activeView==="hostel" && hostelAllot && (
        <div className="card">
          <h3 style={{fontSize:14,fontWeight:700,marginBottom:12}}>Hostel Information</h3>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <div><b style={{fontSize:12,color:"var(--muted)"}}>Hostel</b><div>{hostelAllot.hostel_rooms?.hostels?.name}</div></div>
            <div><b style={{fontSize:12,color:"var(--muted)"}}>Room</b><div>{hostelAllot.hostel_rooms?.room_number} · Bed {hostelAllot.bed_number}</div></div>
            <div><b style={{fontSize:12,color:"var(--muted)"}}>Monthly Rent</b><div>{fmtMoney(hostelAllot.hostel_rooms?.monthly_rent)}</div></div>
            <div><b style={{fontSize:12,color:"var(--muted)"}}>Since</b><div>{fmtDate(hostelAllot.allotment_date)}</div></div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── STUDENTS ────────────────────────────────────────────────────────────────
function StudentsTab({ onNavigate }) {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [filter, setFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("active");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    let q = supabase.from("students").select("*, profiles!inner(full_name,phone,email), courses(name)").order("created_at",{ascending:false});
    if (statusFilter!=="all") q = q.eq("status",statusFilter);
    if (filter!=="all") q = q.eq("course_id",filter);
    const { data } = await q;
    setStudents(data||[]);
    setLoading(false);
  }, [filter, statusFilter]);

  useEffect(() => { load(); supabase.from("courses").select("*").eq("is_active",true).then(({data})=>setCourses(data||[])); }, [load]);

  const filtered = students.filter(st => {
    if (!search) return true;
    const s = search.toLowerCase();
    return st.profiles?.full_name?.toLowerCase().includes(s) || st.admission_number?.toLowerCase().includes(s) || st.profiles?.phone?.includes(s);
  });

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div><h1 className="page-title">Students</h1><p style={{fontSize:13,color:"var(--muted)"}}>{filtered.length} students</p></div>
      </div>
      <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap",alignItems:"center"}}>
        <input className="input" style={{width:200}} placeholder="Search name / phone / adm no..." value={search} onChange={e=>setSearch(e.target.value)}/>
        <div style={{display:"flex",gap:6}}>
          {["active","completed","dropped","all"].map(s=>(
            <button key={s} className={`tag ${statusFilter===s?"active":""}`} onClick={()=>setStatusFilter(s)} style={{textTransform:"capitalize"}}>{s}</button>
          ))}
        </div>
        <div style={{display:"flex",gap:6}}>
          <button className={`tag ${filter==="all"?"active":""}`} onClick={()=>setFilter("all")}>All Courses</button>
          {courses.map(c=><button key={c.id} className={`tag ${filter===c.id?"active":""}`} onClick={()=>setFilter(c.id)}>{c.name}</button>)}
        </div>
      </div>
      <div className="card">
        {loading?<p style={{color:"var(--muted)"}}>Loading…</p>:filtered.length===0?<p className="empty-state">No students found.</p>:(
          <table><thead><tr><th>Name</th><th>Adm. No.</th><th>Course</th><th>Phone</th><th>Date</th><th>Status</th><th></th></tr></thead>
          <tbody>{filtered.map(st=>(
            <tr key={st.id} style={{cursor:"pointer"}} onClick={()=>onNavigate("StudentDetail",st)}>
              <td style={{fontWeight:600}}>{st.profiles?.full_name}</td>
              <td><span className="badge badge-primary">{st.admission_number}</span></td>
              <td>{st.courses?.name}</td>
              <td>{st.profiles?.phone||"-"}</td>
              <td>{fmtDate(st.admission_date)}</td>
              <td><span className={`badge ${st.status==="active"?"badge-success":st.status==="completed"?"badge-primary":"badge-muted"}`}>{st.status}</span></td>
              <td style={{color:"var(--primary)",fontWeight:600,fontSize:13}}>View →</td>
            </tr>
          ))}</tbody></table>
        )}
      </div>
    </div>
  );
}

// ─── ENQUIRY ─────────────────────────────────────────────────────────────────
function EnquiryTab() {
  const [enquiries, setEnquiries] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({name:"",phone:"",email:"",class_interest:"",stream_interest:"",source:"walk_in",notes:""});
  const [filter, setFilter] = useState("all");

  const load = async () => {
    const { data } = await supabase.from("enquiries").select("*").order("created_at",{ascending:false});
    setEnquiries(data||[]);
  };
  useEffect(()=>{ load(); },[]);

  const add = async () => {
    if (!form.name||!form.phone) return;
    await supabase.from("enquiries").insert({name:form.name,phone:form.phone,email:form.email||null,class_interest:form.class_interest||null,stream_interest:form.stream_interest||null,source:form.source,notes:form.notes||null,status:"pending"});
    setForm({name:"",phone:"",email:"",class_interest:"",stream_interest:"",source:"walk_in",notes:""});
    setShowForm(false); load();
  };

  const updateStatus = async (id, status) => {
    await supabase.from("enquiries").update({status}).eq("id",id);
    load();
  };

  const filtered = filter==="all"?enquiries:enquiries.filter(e=>e.status===filter);
  const sources = {walk_in:"Walk-in",phone_call:"Phone Call",referral:"Referral",social_media:"Social Media",other:"Other"};

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div>
          <h1 className="page-title">Enquiry Register</h1>
          <p style={{fontSize:13,color:"var(--muted)"}}>{enquiries.length} total · {enquiries.filter(e=>e.status==="pending").length} pending</p>
        </div>
        <button className="btn btn-accent" onClick={()=>setShowForm(!showForm)}>+ New Enquiry</button>
      </div>

      {showForm && (
        <div className="card" style={{marginBottom:16,borderColor:"var(--accent)"}}>
          <h3 style={{fontSize:14,fontWeight:700,marginBottom:12}}>New Enquiry</h3>
          <div className="grid-3">
            <div><label className="label">Name *</label><input className="input" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Student/Parent name"/></div>
            <div><label className="label">Phone *</label><input className="input" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="9876543210"/></div>
            <div><label className="label">Email</label><input className="input" type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></div>
          </div>
          <div className="grid-3" style={{marginTop:10}}>
            <div><label className="label">Class Interest</label>
              <select className="select" value={form.class_interest} onChange={e=>setForm({...form,class_interest:e.target.value})}>
                <option value="">Select</option><option value="11th">11th</option><option value="12th">12th</option>
              </select>
            </div>
            <div><label className="label">Stream</label>
              <select className="select" value={form.stream_interest} onChange={e=>setForm({...form,stream_interest:e.target.value})}>
                <option value="">Select</option><option value="Science">Science</option><option value="Commerce">Commerce</option><option value="Arts">Arts</option>
              </select>
            </div>
            <div><label className="label">Source</label>
              <select className="select" value={form.source} onChange={e=>setForm({...form,source:e.target.value})}>
                {Object.entries(sources).map(([k,v])=><option key={k} value={k}>{v}</option>)}
              </select>
            </div>
          </div>
          <div style={{marginTop:10}}><label className="label">Notes</label><input className="input" value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} placeholder="Any additional details…"/></div>
          <button className="btn btn-success" style={{marginTop:12}} onClick={add}>Save Enquiry</button>
        </div>
      )}

      <div style={{display:"flex",gap:6,marginBottom:12}}>
        {["all","pending","followup","admitted","not_interested"].map(s=>(
          <button key={s} className={`tag ${filter===s?"active":""}`} onClick={()=>setFilter(s)} style={{textTransform:"capitalize"}}>{s==="all"?"All":s.replace("_"," ")}</button>
        ))}
      </div>

      <div className="card">
        {filtered.length===0?<p className="empty-state">No enquiries.</p>:(
          <table><thead><tr><th>Name</th><th>Phone</th><th>Interest</th><th>Source</th><th>Date</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>{filtered.map(e=>(
            <tr key={e.id}>
              <td style={{fontWeight:600}}>{e.name}</td>
              <td>{e.phone}</td>
              <td>{[e.class_interest,e.stream_interest].filter(Boolean).join(" · ")||"-"}</td>
              <td><span className="badge badge-primary">{sources[e.source]||e.source}</span></td>
              <td style={{fontSize:12}}>{fmtDate(e.created_at)}</td>
              <td><span className={`badge ${e.status==="admitted"?"badge-success":e.status==="pending"?"badge-warning":e.status==="not_interested"?"badge-danger":"badge-primary"}`}>{e.status?.replace("_"," ")}</span></td>
              <td>
                <select className="select" style={{fontSize:11,padding:"3px 6px",width:"auto"}} value={e.status} onChange={ev=>updateStatus(e.id,ev.target.value)}>
                  <option value="pending">Pending</option>
                  <option value="followup">Follow Up</option>
                  <option value="admitted">Admitted</option>
                  <option value="not_interested">Not Interested</option>
                </select>
              </td>
            </tr>
          ))}</tbody></table>
        )}
      </div>
    </div>
  );
}

// ─── ADMISSION ───────────────────────────────────────────────────────────────
function PhotoUpload({ label, value, onChange }) {
  const handleFile = (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => onChange(ev.target.result);
    reader.readAsDataURL(file);
  };
  return (
    <div style={{textAlign:"center"}}>
      <div style={{width:90,height:110,border:"2px dashed var(--border)",borderRadius:8,overflow:"hidden",margin:"0 auto 6px",display:"flex",alignItems:"center",justifyContent:"center",background:value?"none":"var(--bg)",cursor:"pointer"}}
        onClick={()=>document.getElementById("photo-"+label)?.click()}>
        {value?<img src={value} alt={label} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<span style={{fontSize:24,color:"var(--muted)"}}>+</span>}
      </div>
      <input id={"photo-"+label} type="file" accept="image/*" style={{display:"none"}} onChange={handleFile}/>
      <div style={{fontSize:11,color:"var(--muted)",fontWeight:600}}>{label}</div>
    </div>
  );
}

function AdmissionTab() {
  const [courses, setCourses] = useState([]);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({fullName:"",phone:"",email:"",gender:"",address:"",dob:"",fatherName:"",motherName:"",aadhar:"",category:"",religion:"",previousSchool:"",previousMarks:"",emergencyContact:"",bloodGroup:""});
  const [photos, setPhotos] = useState({student:"",father:"",mother:""});
  const [stream, setStream] = useState("");
  const [classLevel, setClassLevel] = useState("");
  const [selSubjects, setSelSubjects] = useState([]);
  const [manualSubject, setManualSubject] = useState("");
  const [subjectTab, setSubjectTab] = useState("list");
  const [courseFee, setCourseFee] = useState("");
  const [discount, setDiscount] = useState("");
  const [duration, setDuration] = useState("12");
  const [installments, setInstallments] = useState([{amount:"",due_date:"",label:"1st Installment"}]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({type:"",text:""});
  const [admittedData, setAdmittedData] = useState(null);

  useEffect(()=>{ supabase.from("courses").select("*").eq("is_active",true).then(({data})=>setCourses(data||[])); },[]);

  const streamSubjects = {
    science:["Physics","Chemistry","Mathematics","Biology","English","Computer Science"],
    commerce:["Accountancy","Business Studies","Economics","Mathematics","English"],
    arts:["History","Political Science","Geography","Economics","English","Odia"]
  };

  const addSubjectFromList = (sub) => { if (sub&&!selSubjects.includes(sub)) setSelSubjects([...selSubjects,sub]); };
  const addManualSubject = () => { const s=manualSubject.trim(); if(s&&!selSubjects.includes(s)){setSelSubjects([...selSubjects,s]);setManualSubject("");} };
  const removeSubject = (s) => setSelSubjects(selSubjects.filter(x=>x!==s));

  const selectedCourse = courses.find(c => {
    const n = c.name?.toLowerCase();
    return n?.includes(classLevel?.toLowerCase()) && n?.includes(stream?.toLowerCase());
  }) || null;

  const addInstallment = () => setInstallments([...installments,{amount:"",due_date:"",label:`${installments.length+1}${["st","nd","rd"][installments.length]||"th"} Installment`}]);
  const removeInstallment = (i) => setInstallments(installments.filter((_,idx)=>idx!==i));
  const updateInstallment = (i,field,val) => setInstallments(installments.map((ins,idx)=>idx===i?{...ins,[field]:val}:ins));

  const submit = async () => {
    if (!form.fullName||!form.phone) { setMsg({type:"error",text:"Name and phone required!"}); return; }
    if (!stream||!classLevel) { setMsg({type:"error",text:"Stream and class required!"}); return; }
    if (!courseFee) { setMsg({type:"error",text:"Fee amount required!"}); return; }
    setLoading(true); setMsg({type:"",text:""});
    try {
      const email = form.email||(form.phone+"@student.mca.local");
      const tempPass = "Welcome@"+Date.now().toString().slice(-6);
      const userId = await createUserSafely(email, tempPass, form.fullName, "student", form.phone);

      // Find or create course
      let courseId = selectedCourse?.id;
      if (!courseId) {
        const courseName = `${classLevel}th ${stream.charAt(0).toUpperCase()+stream.slice(1)}`;
        const {data:newCourse} = await supabase.from("courses").insert({name:courseName,total_fee:Number(courseFee),duration_months:Number(duration)}).select().single();
        courseId = newCourse?.id;
        if (selSubjects.length>0 && courseId) {
          for (const sub of selSubjects) await supabase.from("subjects").insert({name:sub,course_id:courseId});
        }
      }

      const {data:admData} = await supabase.rpc("generate_admission_number");
      const admNo = admData||"MCA-"+new Date().getFullYear()+"-"+String(Date.now()).slice(-4);
      const {data:stData,error:stErr} = await supabase.from("students").insert({
        profile_id:userId,course_id:courseId,admission_number:admNo,
        gender:form.gender||null,address:form.address||null,date_of_birth:form.dob||null,
        father_name:form.fatherName||null,mother_name:form.motherName||null,
        aadhar_number:form.aadhar||null,category:form.category||null,religion:form.religion||null,
        previous_school:form.previousSchool||null,previous_marks:form.previousMarks||null,
        emergency_contact:form.emergencyContact||null,blood_group:form.bloodGroup||null,
        student_photo:photos.student||null,father_photo:photos.father||null,mother_photo:photos.mother||null,
      }).select().single();
      if (stErr) throw stErr;

      const net = Number(courseFee)-Number(discount||0);
      await supabase.from("fee_structures").insert({student_id:stData.id,total_amount:Number(courseFee),discount:Number(discount||0),net_amount:net});

      // Save installment plan
      for (let i=0;i<installments.length;i++) {
        const ins = installments[i];
        if (ins.amount&&Number(ins.amount)>0) {
          await supabase.from("fee_installments").insert({student_id:stData.id,installment_number:i+1,label:ins.label,amount:Number(ins.amount),due_date:ins.due_date||null,status:"pending"});
        }
      }

      setAdmittedData({admNo,tempPass,form:{...form},stream,classLevel,selSubjects:[...selSubjects],courseFee,discount,date:new Date().toLocaleDateString("en-IN"),photos:{...photos}});
      setMsg({type:"success",text:`✅ Admitted! No: ${admNo} | Temp Password: ${tempPass}`});
      setForm({fullName:"",phone:"",email:"",gender:"",address:"",dob:"",fatherName:"",motherName:"",aadhar:"",category:"",religion:"",previousSchool:"",previousMarks:"",emergencyContact:"",bloodGroup:""});
      setPhotos({student:"",father:"",mother:""});
      setStream(""); setClassLevel(""); setSelSubjects([]); setCourseFee(""); setDiscount(""); setStep(1);
    } catch(e) { setMsg({type:"error",text:e.message}); }
    setLoading(false);
  };

  const printAdmission = () => {
    if (!admittedData) return;
    const d = admittedData;
    const w = window.open("","_blank");
    const net = Number(d.courseFee)-Number(d.discount||0);
    w.document.write(`<html><head><title>Admission Form</title><style>body{font-family:Arial,sans-serif;padding:20px;color:#1a1a2e}table{width:100%;border-collapse:collapse;margin:10px 0}td,th{border:1px solid #ccc;padding:8px;font-size:12px}.section{background:#f0f4f8;font-weight:bold;font-size:13px;color:#1a2a6c}.header{text-align:center;border-bottom:3px solid #1a5c2e;padding-bottom:15px;margin-bottom:20px}.photo{width:80px;height:100px;border:1px solid #ccc;object-fit:cover}@media print{body{padding:10px}}</style></head><body>
    <div class="header"><img src="${MCA_LOGO}" style="height:45px;margin-bottom:4px"/><div style="font-size:20px;font-weight:bold;color:#1a5c2e">MY CAREER ACADEMIC</div><div style="font-size:11px;font-weight:bold">A Division of:- MY LIFELINE FOUNDATION</div><div style="font-size:10px;color:#555">Kendrapara Town, Maruti Chhak, Khairabad, Kendrapara, 754211 | Ph: 06727796700</div><div style="margin-top:8px;font-size:14px;font-weight:bold;text-decoration:underline">ADMISSION FORM</div></div>
    <table><tr><td colspan="3" class="section">ADMISSION DETAILS</td><td rowspan="4" style="text-align:center;width:90px">${d.photos.student?`<img src="${d.photos.student}" class="photo"/>`:'<div class="photo" style="display:flex;align-items:center;justify-content:center;background:#f5f5f5;font-size:10px">Photo</div>'}<br><small>Student</small></td></tr>
    <tr><td><b>Admission No</b></td><td>${d.admNo}</td><td><b>Date:</b> ${d.date}</td></tr>
    <tr><td><b>Class/Stream</b></td><td colspan="2">${d.classLevel}th ${d.stream.charAt(0).toUpperCase()+d.stream.slice(1)}</td></tr>
    <tr><td><b>Subjects</b></td><td colspan="2">${d.selSubjects.join(", ")||"-"}</td></tr></table>
    <table><tr><td colspan="4" class="section">PERSONAL INFORMATION</td></tr>
    <tr><td><b>Full Name</b></td><td colspan="3">${d.form.fullName}</td></tr>
    <tr><td><b>Mobile</b></td><td>${d.form.phone}</td><td><b>Email</b></td><td>${d.form.email||"-"}</td></tr>
    <tr><td><b>Gender</b></td><td>${d.form.gender||"-"}</td><td><b>DOB</b></td><td>${d.form.dob||"-"}</td></tr>
    <tr><td><b>Blood Group</b></td><td>${d.form.bloodGroup||"-"}</td><td><b>Aadhar</b></td><td>${d.form.aadhar||"-"}</td></tr>
    <tr><td><b>Address</b></td><td colspan="3">${d.form.address||"-"}</td></tr></table>
    <table><tr><td colspan="2" class="section">FAMILY DETAILS</td><td style="text-align:center;width:85px">${d.photos.father?`<img src="${d.photos.father}" style="width:65px;height:80px;border:1px solid #ccc;object-fit:cover"/>`:""}<br><small>Father</small></td><td style="text-align:center;width:85px">${d.photos.mother?`<img src="${d.photos.mother}" style="width:65px;height:80px;border:1px solid #ccc;object-fit:cover"/>`:""}<br><small>Mother</small></td></tr>
    <tr><td><b>Father's Name</b></td><td>${d.form.fatherName||"-"}</td><td colspan="2"><b>Mother's Name:</b> ${d.form.motherName||"-"}</td></tr>
    <tr><td><b>Category</b></td><td>${d.form.category||"-"}</td><td><b>Religion</b></td><td>${d.form.religion||"-"}</td></tr>
    <tr><td><b>Emergency</b></td><td colspan="3">${d.form.emergencyContact||"-"}</td></tr></table>
    <table><tr><td colspan="4" class="section">FEE STRUCTURE</td></tr>
    <tr><td><b>Total Fee</b></td><td>₹${Number(d.courseFee).toLocaleString("en-IN")}</td><td><b>Discount</b></td><td>₹${Number(d.discount||0).toLocaleString("en-IN")}</td></tr>
    <tr><td><b>Net Payable</b></td><td colspan="3"><b>₹${net.toLocaleString("en-IN")} (${numberToWords(net)} only)</b></td></tr></table>
    <div style="margin-top:40px;display:flex;justify-content:space-between"><div style="text-align:center;border-top:1px solid #333;padding-top:5px;width:150px;font-size:11px">Student Signature</div><div style="text-align:center;border-top:1px solid #333;padding-top:5px;width:150px;font-size:11px">Parent Signature</div><div style="text-align:center;border-top:1px solid #333;padding-top:5px;width:150px;font-size:11px">Admin Signature</div></div>
    </body></html>`);
    w.document.close(); w.print();
  };

  return (
    <div>
      <h1 className="page-title">New Admission</h1>
      <p className="page-sub">11th / 12th — Arts, Commerce, Science</p>
      <div style={{display:"flex",gap:10,marginBottom:20}}>
        {[1,2,3].map(s=>(
          <div key={s} onClick={()=>setStep(s)} style={{flex:1,padding:"10px 16px",borderRadius:8,cursor:"pointer",textAlign:"center",fontSize:13,fontWeight:600,background:step===s?"var(--primary)":"var(--primary-light)",color:step===s?"#fff":"var(--primary)"}}>
            {s===1?"1. Personal Info":s===2?"2. Class & Stream":"3. Family & Summary"}
          </div>
        ))}
      </div>

      <div className="card" style={{maxWidth:720}}>
        {msg.text && <div className={msg.type==="success"?"success-box":"error-box"} style={{whiteSpace:"pre-line",marginBottom:16}}>
          {msg.text}
          {msg.type==="success"&&admittedData&&<button className="btn" style={{marginTop:8,display:"block"}} onClick={printAdmission}>🖨 Print Admission Form</button>}
        </div>}

        {/* STEP 1 */}
        {step===1 && (
          <div>
            <h3 style={{fontSize:14,fontWeight:700,marginBottom:16}}>Personal Information & Photos</h3>
            <div style={{display:"flex",gap:16,marginBottom:20,justifyContent:"center",padding:16,background:"var(--bg)",borderRadius:8}}>
              <PhotoUpload label="Student Photo" value={photos.student} onChange={v=>setPhotos({...photos,student:v})}/>
              <PhotoUpload label="Father Photo" value={photos.father} onChange={v=>setPhotos({...photos,father:v})}/>
              <PhotoUpload label="Mother Photo" value={photos.mother} onChange={v=>setPhotos({...photos,mother:v})}/>
            </div>
            <div className="grid-2">
              <div className="form-group"><label className="label">Full Name *</label><input className="input" value={form.fullName} onChange={e=>setForm({...form,fullName:e.target.value})} placeholder="Student full name"/></div>
              <div className="form-group"><label className="label">Mobile *</label><input className="input" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="9876543210"/></div>
            </div>
            <div className="grid-3">
              <div className="form-group"><label className="label">Gender</label>
                <select className="select" value={form.gender} onChange={e=>setForm({...form,gender:e.target.value})}>
                  <option value="">Select</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
                </select>
              </div>
              <div className="form-group"><label className="label">Date of Birth</label><input className="input" type="date" value={form.dob} onChange={e=>setForm({...form,dob:e.target.value})}/></div>
              <div className="form-group"><label className="label">Blood Group</label>
                <select className="select" value={form.bloodGroup} onChange={e=>setForm({...form,bloodGroup:e.target.value})}>
                  <option value="">Select</option>{["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(bg=><option key={bg} value={bg}>{bg}</option>)}
                </select>
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group"><label className="label">Email (optional)</label><input className="input" type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></div>
              <div className="form-group"><label className="label">Aadhar Number</label><input className="input" value={form.aadhar} onChange={e=>setForm({...form,aadhar:e.target.value})} placeholder="1234 5678 9012"/></div>
            </div>
            <div className="form-group"><label className="label">Address</label><input className="input" value={form.address} onChange={e=>setForm({...form,address:e.target.value})} placeholder="Village/Town, District, State"/></div>
            <button className="btn" style={{marginTop:8}} onClick={()=>{if(!form.fullName||!form.phone){setMsg({type:"error",text:"Name and phone required!"});return;}setMsg({type:"",text:""});setStep(2);}}>Next → Class & Stream</button>
          </div>
        )}

        {/* STEP 2 */}
        {step===2 && (
          <div>
            <h3 style={{fontSize:14,fontWeight:700,marginBottom:16}}>Class, Stream & Fee</h3>
            <div style={{marginBottom:16}}>
              <label className="label">Select Stream *</label>
              <div style={{display:"flex",gap:10}}>
                {["science","commerce","arts"].map(s=>(
                  <div key={s} onClick={()=>{setStream(s);setSelSubjects([]);}} style={{flex:1,padding:"14px 10px",borderRadius:8,cursor:"pointer",textAlign:"center",border:stream===s?"2px solid var(--primary)":"1px solid var(--border)",background:stream===s?"var(--primary-light)":"white",transition:"all .15s"}}>
                    <div style={{fontSize:20,marginBottom:4}}>{s==="science"?"🔬":s==="commerce"?"📊":"🎨"}</div>
                    <div style={{fontWeight:stream===s?700:400,fontSize:14}}>{s.charAt(0).toUpperCase()+s.slice(1)}</div>
                  </div>
                ))}
              </div>
            </div>

            {stream && (
              <div style={{marginBottom:16}}>
                <label className="label">Select Class *</label>
                <div style={{display:"flex",gap:10}}>
                  {["11","12"].map(c=>(
                    <div key={c} onClick={()=>setClassLevel(c)} style={{flex:1,padding:"12px",borderRadius:8,cursor:"pointer",textAlign:"center",border:classLevel===c?"2px solid var(--primary)":"1px solid var(--border)",background:classLevel===c?"var(--primary-light)":"white",fontWeight:classLevel===c?700:400,fontSize:15}}>
                      {c}th Class
                    </div>
                  ))}
                </div>
              </div>
            )}

            {stream && (
              <div style={{marginBottom:16,padding:14,background:"var(--bg)",borderRadius:8,border:"1px solid var(--border)"}}>
                <label className="label">Subjects</label>
                <div style={{display:"flex",gap:0,marginBottom:10,borderRadius:6,overflow:"hidden",border:"1px solid var(--border)",width:"fit-content"}}>
                  <button onClick={()=>setSubjectTab("list")} style={{padding:"6px 16px",fontSize:12,border:"none",background:subjectTab==="list"?"var(--primary)":"var(--bg)",color:subjectTab==="list"?"#fff":"var(--text)",cursor:"pointer"}}>Choose from list</button>
                  <button onClick={()=>setSubjectTab("manual")} style={{padding:"6px 16px",fontSize:12,border:"none",background:subjectTab==="manual"?"var(--primary)":"var(--bg)",color:subjectTab==="manual"?"#fff":"var(--text)",cursor:"pointer"}}>Add manually</button>
                </div>
                {subjectTab==="list" && (
                  <div style={{display:"flex",gap:8,marginBottom:10}}>
                    <select className="select" style={{flex:1}} defaultValue="" onChange={e=>{addSubjectFromList(e.target.value);e.target.value="";}}>
                      <option value="">— pick a subject —</option>
                      {(streamSubjects[stream]||[]).filter(s=>!selSubjects.includes(s)).map(s=><option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                )}
                {subjectTab==="manual" && (
                  <div style={{display:"flex",gap:8,marginBottom:10}}>
                    <input className="input" style={{flex:1}} placeholder="Type subject name, e.g. Sanskrit" value={manualSubject} onChange={e=>setManualSubject(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addManualSubject()}/>
                    <button className="btn" style={{padding:"8px 16px",fontSize:13}} onClick={addManualSubject}>+ Add</button>
                  </div>
                )}
                <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                  {selSubjects.length===0?<span style={{fontSize:13,color:"var(--muted)"}}>No subjects added yet.</span>
                    :selSubjects.map(s=>(
                      <span key={s} style={{display:"flex",alignItems:"center",gap:5,padding:"4px 10px",borderRadius:20,fontSize:12,fontWeight:500,background:"var(--primary-light)",border:"1px solid var(--primary)",color:"var(--primary)"}}>
                        {s}<span onClick={()=>removeSubject(s)} style={{cursor:"pointer",opacity:.6,fontSize:14}}>×</span>
                      </span>
                    ))}
                </div>
              </div>
            )}

            <div className="grid-2" style={{marginBottom:16}}>
              <div>
                <label className="label">Course Fee (₹) *</label>
                <div style={{position:"relative"}}><span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:"var(--muted)"}}>₹</span>
                  <input className="input" type="number" style={{paddingLeft:24}} value={courseFee} onChange={e=>setCourseFee(e.target.value)} placeholder="e.g. 25000"/>
                </div>
              </div>
              <div>
                <label className="label">Discount (₹)</label>
                <div style={{position:"relative"}}><span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:"var(--muted)"}}>₹</span>
                  <input className="input" type="number" style={{paddingLeft:24}} value={discount} onChange={e=>setDiscount(e.target.value)} placeholder="0"/>
                </div>
              </div>
            </div>

            <div style={{marginBottom:16}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <label className="label" style={{margin:0}}>Installment Plan (optional)</label>
                <button className="btn-outline" style={{fontSize:12,padding:"4px 10px"}} onClick={addInstallment}>+ Add Installment</button>
              </div>
              {installments.map((ins,i)=>(
                <div key={i} style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr auto",gap:8,marginBottom:8,alignItems:"flex-end"}}>
                  <div><label className="label" style={{fontSize:11}}>{ins.label}</label>
                    <input className="input" value={ins.label} onChange={e=>updateInstallment(i,"label",e.target.value)} placeholder="Label"/></div>
                  <div><label className="label" style={{fontSize:11}}>Amount (₹)</label>
                    <input className="input" type="number" value={ins.amount} onChange={e=>updateInstallment(i,"amount",e.target.value)} placeholder="8000"/></div>
                  <div><label className="label" style={{fontSize:11}}>Due Date</label>
                    <input className="input" type="date" value={ins.due_date} onChange={e=>updateInstallment(i,"due_date",e.target.value)}/></div>
                  {installments.length>1&&<button style={{background:"none",border:"none",color:"var(--danger)",cursor:"pointer",fontSize:18,paddingBottom:4}} onClick={()=>removeInstallment(i)}>×</button>}
                </div>
              ))}
            </div>

            {courseFee && (
              <div style={{padding:12,background:"var(--primary-light)",borderRadius:8,fontSize:13,marginBottom:16}}>
                <b>{classLevel?`${classLevel}th `:""}{stream?.charAt(0).toUpperCase()+(stream?.slice(1)||"")} Stream</b>{selSubjects.length>0?` — ${selSubjects.join(", ")}`:""}
                <div style={{marginTop:4}}>Fee: <b>₹{Number(courseFee).toLocaleString("en-IN")}</b>{discount&&Number(discount)>0?` − ₹${Number(discount).toLocaleString("en-IN")} discount = `:""}
                  {discount&&Number(discount)>0?<b>₹{(Number(courseFee)-Number(discount)).toLocaleString("en-IN")} net</b>:""}
                </div>
              </div>
            )}
            <div style={{display:"flex",gap:8}}>
              <button className="btn-outline" onClick={()=>setStep(1)}>← Back</button>
              <button className="btn" onClick={()=>{if(!stream||!classLevel){setMsg({type:"error",text:"Stream and class required!"});return;}if(!courseFee){setMsg({type:"error",text:"Fee required!"});return;}setMsg({type:"",text:""});setStep(3);}}>Next → Family Details</button>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step===3 && (
          <div>
            <h3 style={{fontSize:14,fontWeight:700,marginBottom:16}}>Family & Previous Education</h3>
            <div className="grid-2">
              <div className="form-group"><label className="label">Father&apos;s Name</label><input className="input" value={form.fatherName} onChange={e=>setForm({...form,fatherName:e.target.value})}/></div>
              <div className="form-group"><label className="label">Mother&apos;s Name</label><input className="input" value={form.motherName} onChange={e=>setForm({...form,motherName:e.target.value})}/></div>
            </div>
            <div className="grid-3">
              <div className="form-group"><label className="label">Category</label>
                <select className="select" value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>
                  <option value="">Select</option><option value="General">General</option><option value="OBC">OBC</option><option value="SC">SC</option><option value="ST">ST</option><option value="EWS">EWS</option>
                </select>
              </div>
              <div className="form-group"><label className="label">Religion</label>
                <select className="select" value={form.religion} onChange={e=>setForm({...form,religion:e.target.value})}>
                  <option value="">Select</option><option value="Hindu">Hindu</option><option value="Muslim">Muslim</option><option value="Christian">Christian</option><option value="Sikh">Sikh</option><option value="Buddhist">Buddhist</option><option value="Jain">Jain</option><option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group"><label className="label">Emergency Contact</label><input className="input" value={form.emergencyContact} onChange={e=>setForm({...form,emergencyContact:e.target.value})}/></div>
            </div>
            <div className="grid-2">
              <div className="form-group"><label className="label">Previous School</label><input className="input" value={form.previousSchool} onChange={e=>setForm({...form,previousSchool:e.target.value})}/></div>
              <div className="form-group"><label className="label">10th Marks / %</label><input className="input" value={form.previousMarks} onChange={e=>setForm({...form,previousMarks:e.target.value})}/></div>
            </div>
            <div style={{marginTop:16,padding:14,background:"var(--bg)",borderRadius:8,fontSize:13,border:"1px solid var(--border)"}}>
              <b>Summary:</b> {form.fullName} | {form.phone} | {classLevel}th {stream} | Subjects: {selSubjects.join(", ")||"none"} | Fee: ₹{Number(courseFee||0).toLocaleString("en-IN")}{discount?` (−₹${discount} disc)`:""}
              {form.fatherName?` | Father: ${form.fatherName}`:""}
            </div>
            <div style={{display:"flex",gap:8,marginTop:16}}>
              <button className="btn-outline" onClick={()=>setStep(2)}>← Back</button>
              <button className="btn btn-success" style={{flex:1,padding:14,fontSize:15}} onClick={submit} disabled={loading}>{loading?"Admitting Student…":"✓ Complete Admission"}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── COURSES ─────────────────────────────────────────────────────────────────
function CoursesTab() {
  const [courses,setCourses]=useState([]);const [showForm,setShowForm]=useState(false);const [form,setForm]=useState({name:"",description:"",duration:"",fee:""});const [editId,setEditId]=useState(null);
  const [subjects,setSubjects]=useState({});const [newSubject,setNewSubject]=useState({});const [chapters,setChapters]=useState({});const [newChapter,setNewChapter]=useState({});const [expanded,setExpanded]=useState(null);
  const loadCourses=async()=>{const {data}=await supabase.from("courses").select("*").order("created_at",{ascending:false});setCourses(data||[]);};
  useEffect(()=>{loadCourses();},[]);
  const loadSubjects=async(cid)=>{const {data}=await supabase.from("subjects").select("*").eq("course_id",cid).order("created_at");setSubjects(p=>({...p,[cid]:data||[]}));for(const s of(data||[])){const {data:ch}=await supabase.from("chapters").select("*").eq("subject_id",s.id).order("sort_order");setChapters(p=>({...p,[s.id]:ch||[]}));}};
  const toggleExpand=(id)=>{if(expanded===id){setExpanded(null);return;}setExpanded(id);loadSubjects(id);};
  const saveCourse=async()=>{if(!form.name||!form.fee)return;if(editId){await supabase.from("courses").update({name:form.name,description:form.description||null,duration_months:form.duration?Number(form.duration):null,total_fee:Number(form.fee)}).eq("id",editId);}else{await supabase.from("courses").insert({name:form.name,description:form.description||null,duration_months:form.duration?Number(form.duration):null,total_fee:Number(form.fee)});}setForm({name:"",description:"",duration:"",fee:""});setEditId(null);setShowForm(false);loadCourses();};
  const editCourse=(c)=>{setForm({name:c.name,description:c.description||"",duration:c.duration_months?.toString()||"",fee:c.total_fee?.toString()||""});setEditId(c.id);setShowForm(true);};
  const toggleCourse=async(c)=>{await supabase.from("courses").update({is_active:!c.is_active}).eq("id",c.id);loadCourses();};
  const addSubject=async(cid)=>{if(!newSubject[cid])return;await supabase.from("subjects").insert({name:newSubject[cid],course_id:cid});setNewSubject(p=>({...p,[cid]:""}));loadSubjects(cid);};
  const deleteSubject=async(sid,cid)=>{await supabase.from("subjects").delete().eq("id",sid);loadSubjects(cid);};
  const addChapter=async(sid,cid)=>{if(!newChapter[sid])return;const ex=chapters[sid]||[];await supabase.from("chapters").insert({name:newChapter[sid],subject_id:sid,sort_order:ex.length+1});setNewChapter(p=>({...p,[sid]:""}));loadSubjects(cid);};
  const deleteChapter=async(chid,cid)=>{await supabase.from("chapters").delete().eq("id",chid);loadSubjects(cid);};
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}><div><h1 className="page-title">Courses</h1><p className="page-sub" style={{marginBottom:0}}>{courses.length} courses</p></div><button className="btn btn-accent" onClick={()=>{setShowForm(!showForm);setEditId(null);setForm({name:"",description:"",duration:"",fee:""});}}>+ Add Course</button></div>
      {showForm&&(<div className="card" style={{marginBottom:20,borderColor:"var(--accent)"}}><div className="grid-2"><div><label className="label">Name *</label><input className="input" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></div><div><label className="label">Fee (₹) *</label><input className="input" type="number" value={form.fee} onChange={e=>setForm({...form,fee:e.target.value})}/></div></div><div className="grid-2" style={{marginTop:12}}><div><label className="label">Duration (months)</label><input className="input" type="number" value={form.duration} onChange={e=>setForm({...form,duration:e.target.value})}/></div><div><label className="label">Description</label><input className="input" value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></div></div><div style={{display:"flex",gap:8,marginTop:14}}><button className="btn btn-success" onClick={saveCourse}>{editId?"Update":"Create"}</button><button className="btn-outline" onClick={()=>setShowForm(false)}>Cancel</button></div></div>)}
      {courses.map(c=>(<div key={c.id} className="card" style={{marginBottom:12,opacity:c.is_active?1:0.6}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div style={{cursor:"pointer",flex:1}} onClick={()=>toggleExpand(c.id)}><div style={{display:"flex",alignItems:"center",gap:10}}><span style={{fontWeight:700,fontSize:15}}>{c.name}</span><span className={`badge ${c.is_active?"badge-success":"badge-muted"}`}>{c.is_active?"Active":"Inactive"}</span></div><div style={{fontSize:13,color:"var(--muted)",marginTop:4}}>₹{c.total_fee?.toLocaleString("en-IN")} · {c.duration_months||"-"} months</div></div><div style={{display:"flex",gap:6}}><button className="btn-outline" style={{fontSize:12,padding:"6px 12px"}} onClick={()=>editCourse(c)}>Edit</button><button className="btn-outline" style={{fontSize:12,padding:"6px 12px"}} onClick={()=>toggleCourse(c)}>{c.is_active?"Disable":"Enable"}</button><button className="btn-outline" style={{fontSize:12,padding:"6px 12px"}} onClick={()=>toggleExpand(c.id)}>{expanded===c.id?"▲":"▼"}</button></div></div>
        {expanded===c.id&&(<div style={{marginTop:16,paddingTop:16,borderTop:"1px solid var(--border)"}}><h4 style={{fontSize:13,fontWeight:700,color:"var(--muted)",marginBottom:12}}>Subjects & Chapters</h4>{(subjects[c.id]||[]).map(sub=>(<div key={sub.id} style={{marginBottom:16,padding:12,background:"var(--bg)",borderRadius:8}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}><span style={{fontWeight:600}}>{sub.name}</span><button style={{background:"none",border:"none",color:"var(--danger)",cursor:"pointer",fontSize:12}} onClick={()=>deleteSubject(sub.id,c.id)}>Delete</button></div>{(chapters[sub.id]||[]).map((ch,i)=>(<div key={ch.id} style={{display:"flex",justifyContent:"space-between",padding:"4px 0 4px 16px",fontSize:13}}><span>{i+1}. {ch.name}</span><button style={{background:"none",border:"none",color:"var(--danger)",cursor:"pointer",fontSize:11}} onClick={()=>deleteChapter(ch.id,c.id)}>×</button></div>))}<div style={{display:"flex",gap:8,marginTop:8,paddingLeft:16}}><input className="input" style={{flex:1,padding:"6px 10px",fontSize:12}} placeholder="New chapter" value={newChapter[sub.id]||""} onChange={e=>setNewChapter(p=>({...p,[sub.id]:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&addChapter(sub.id,c.id)}/><button className="btn" style={{fontSize:11,padding:"6px 12px"}} onClick={()=>addChapter(sub.id,c.id)}>+</button></div></div>))}<div style={{display:"flex",gap:8,marginTop:8}}><input className="input" style={{flex:1,padding:"8px 10px",fontSize:13}} placeholder="New subject" value={newSubject[c.id]||""} onChange={e=>setNewSubject(p=>({...p,[c.id]:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&addSubject(c.id)}/><button className="btn btn-accent" style={{fontSize:12,padding:"8px 16px"}} onClick={()=>addSubject(c.id)}>+ Subject</button></div></div>)}
      </div>))}
    </div>
  );
}

// ─── TIMETABLE ───────────────────────────────────────────────────────────────
function TimetableTab({ profile }) {
  const [courses,setCourses]=useState([]);const [selCourse,setSelCourse]=useState("");const [subjects,setSubjects]=useState([]);const [staffList,setStaffList]=useState([]);
  const [schedules,setSchedules]=useState([]);const [showForm,setShowForm]=useState(false);const [selDay,setSelDay]=useState(new Date().getDay());
  const [form,setForm]=useState({subjectId:"",teacherId:"",startTime:"",endTime:"",room:"",dayOfWeek:""});
  const isAdmin=["admin","staff"].includes(profile?.role);
  const load=useCallback(async()=>{if(!selCourse)return;const {data}=await supabase.from("class_schedules").select("*, subjects(name), staff!inner(profiles!inner(full_name))").eq("course_id",selCourse).order("start_time");setSchedules(data||[]);},[selCourse]);
  useEffect(()=>{supabase.from("courses").select("*").eq("is_active",true).then(({data})=>{setCourses(data||[]);if(data?.length)setSelCourse(data[0].id);});},[]);
  useEffect(()=>{load();},[selCourse,load]);
  useEffect(()=>{if(selCourse){supabase.from("subjects").select("*").eq("course_id",selCourse).then(({data})=>setSubjects(data||[]));supabase.from("staff").select("*, profiles!inner(full_name)").then(({data})=>setStaffList(data||[]));}  },[selCourse]);
  const addSchedule=async()=>{if(!form.subjectId||!form.teacherId||!form.startTime||!form.endTime||form.dayOfWeek==="")return;await supabase.from("class_schedules").insert({course_id:selCourse,subject_id:form.subjectId,teacher_id:form.teacherId,day_of_week:Number(form.dayOfWeek),start_time:form.startTime,end_time:form.endTime,room:form.room||null});setForm({subjectId:"",teacherId:"",startTime:"",endTime:"",room:"",dayOfWeek:""});setShowForm(false);load();};
  const deleteSchedule=async(id)=>{await supabase.from("class_schedules").delete().eq("id",id);load();};
  const generateToday=async()=>{const t=today();const dow=new Date().getDay();const todaySchedules=schedules.filter(s=>s.day_of_week===dow);if(todaySchedules.length===0){alert("No classes scheduled for "+DAYS[dow]);return;}const {data:existing}=await supabase.from("live_classes").select("id").eq("class_date",t).eq("course_id",selCourse);if(existing&&existing.length>0){alert("Today's classes already generated!");return;}for(const s of todaySchedules){await supabase.from("live_classes").insert({schedule_id:s.id,course_id:selCourse,subject_id:s.subject_id,teacher_id:s.teacher_id,class_date:t,start_time:s.start_time,end_time:s.end_time,room:s.room,status:"scheduled"});}alert(`${todaySchedules.length} classes generated!`);};
  const daySchedules=schedules.filter(s=>s.day_of_week===selDay);
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <div><h1 className="page-title">Weekly Timetable</h1></div>
        <div style={{display:"flex",gap:8}}>{courses.map(c=><button key={c.id} className={`tag ${selCourse===c.id?"active":""}`} onClick={()=>setSelCourse(c.id)}>{c.name}</button>)}</div>
      </div>
      <div style={{display:"flex",gap:6,marginBottom:16}}>
        {DAYS.map((d,i)=><button key={i} className={`tag ${selDay===i?"active":""}`} onClick={()=>setSelDay(i)}>{DAYS_SHORT[i]}</button>)}
        {isAdmin&&<button className="btn btn-accent" style={{marginLeft:"auto"}} onClick={()=>{setShowForm(!showForm);setForm({...form,dayOfWeek:selDay.toString()});}}>+ Add Slot</button>}
        {isAdmin&&<button className="btn" onClick={generateToday}>Generate Today</button>}
      </div>
      {showForm&&(<div className="card" style={{marginBottom:16,borderColor:"var(--accent)"}}><div className="grid-3"><div><label className="label">Day</label><select className="select" value={form.dayOfWeek} onChange={e=>setForm({...form,dayOfWeek:e.target.value})}><option value="">Select</option>{DAYS.map((d,i)=><option key={i} value={i}>{d}</option>)}</select></div><div><label className="label">Subject</label><select className="select" value={form.subjectId} onChange={e=>setForm({...form,subjectId:e.target.value})}><option value="">Select</option>{subjects.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></div><div><label className="label">Teacher</label><select className="select" value={form.teacherId} onChange={e=>setForm({...form,teacherId:e.target.value})}><option value="">Select</option>{staffList.map(s=><option key={s.id} value={s.id}>{s.profiles?.full_name}</option>)}</select></div></div><div className="grid-3" style={{marginTop:12}}><div><label className="label">Start</label><input className="input" type="time" value={form.startTime} onChange={e=>setForm({...form,startTime:e.target.value})}/></div><div><label className="label">End</label><input className="input" type="time" value={form.endTime} onChange={e=>setForm({...form,endTime:e.target.value})}/></div><div><label className="label">Room</label><input className="input" value={form.room} onChange={e=>setForm({...form,room:e.target.value})} placeholder="Room 1"/></div></div><button className="btn btn-success" style={{marginTop:12}} onClick={addSchedule}>Save Slot</button></div>)}
      <div className="card"><h3 style={{fontSize:14,fontWeight:700,marginBottom:12}}>{DAYS[selDay]} Schedule</h3>{daySchedules.length===0?<p className="empty-state">No classes on {DAYS[selDay]}.</p>:(<table><thead><tr><th>Time</th><th>Subject</th><th>Teacher</th><th>Room</th>{isAdmin&&<th></th>}</tr></thead><tbody>{daySchedules.map(s=>(<tr key={s.id}><td style={{fontWeight:600}}>{s.start_time?.slice(0,5)} - {s.end_time?.slice(0,5)}</td><td><span className="badge badge-primary">{s.subjects?.name}</span></td><td>{s.staff?.profiles?.full_name}</td><td>{s.room||"-"}</td>{isAdmin&&<td><button style={{background:"none",border:"none",color:"var(--danger)",cursor:"pointer",fontSize:12,fontWeight:600}} onClick={()=>deleteSchedule(s.id)}>Delete</button></td>}</tr>))}</tbody></table>)}</div>
    </div>
  );
}

// ─── LIVE CLASSES ─────────────────────────────────────────────────────────────
function LiveClassesTab({ profile }) {
  const [classes,setClasses]=useState([]);const [courses,setCourses]=useState([]);const [selCourse,setSelCourse]=useState("");
  const [showForm,setShowForm]=useState(false);const [form,setForm]=useState({subjectId:"",teacherId:"",startTime:"",endTime:"",topic:""});
  const [subjects,setSubjects]=useState([]);const [staffList,setStaffList]=useState([]);
  const isStaff=["admin","staff","teacher"].includes(profile?.role);const t=today();
  const load=useCallback(async()=>{let q=supabase.from("live_classes").select("*, subjects(name), staff!inner(id, profiles!inner(full_name)), courses(name)").eq("class_date",t);if(selCourse)q=q.eq("course_id",selCourse);const {data}=await q.order("start_time");setClasses(data||[]);},[selCourse,t]);
  useEffect(()=>{supabase.from("courses").select("*").eq("is_active",true).then(({data})=>{setCourses(data||[]);if(data?.length)setSelCourse(data[0].id);});},[]);
  useEffect(()=>{if(selCourse)load();},[selCourse,load]);
  useEffect(()=>{if(selCourse){supabase.from("subjects").select("*").eq("course_id",selCourse).then(({data})=>setSubjects(data||[]));supabase.from("staff").select("*, profiles!inner(full_name)").then(({data})=>setStaffList(data||[]));}  },[selCourse]);
  const updateStatus=async(id,st)=>{await supabase.from("live_classes").update({status:st}).eq("id",id);load();};
  const addClass=async()=>{if(!form.subjectId||!form.teacherId||!form.startTime||!form.endTime)return;await supabase.from("live_classes").insert({course_id:selCourse,subject_id:form.subjectId,teacher_id:form.teacherId,class_date:t,start_time:form.startTime,end_time:form.endTime,topic:form.topic||null,status:"scheduled"});setShowForm(false);setForm({subjectId:"",teacherId:"",startTime:"",endTime:"",topic:""});load();};
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}><div><h1 className="page-title">Today&apos;s Classes</h1><p style={{fontSize:13,color:"var(--muted)"}}>{t}</p></div><div style={{display:"flex",gap:8}}>{courses.map(c=><button key={c.id} className={`tag ${selCourse===c.id?"active":""}`} onClick={()=>setSelCourse(c.id)}>{c.name}</button>)}{isStaff&&<button className="btn btn-accent" onClick={()=>setShowForm(!showForm)}>+ Add</button>}</div></div>
      {showForm&&(<div className="card" style={{marginBottom:20,borderColor:"var(--accent)"}}><div className="grid-3"><div><label className="label">Subject</label><select className="select" value={form.subjectId} onChange={e=>setForm({...form,subjectId:e.target.value})}><option value="">Select</option>{subjects.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></div><div><label className="label">Teacher</label><select className="select" value={form.teacherId} onChange={e=>setForm({...form,teacherId:e.target.value})}><option value="">Select</option>{staffList.map(s=><option key={s.id} value={s.id}>{s.profiles?.full_name}</option>)}</select></div><div><label className="label">Topic</label><input className="input" value={form.topic} onChange={e=>setForm({...form,topic:e.target.value})}/></div></div><div className="grid-3" style={{marginTop:12}}><div><label className="label">Start</label><input className="input" type="time" value={form.startTime} onChange={e=>setForm({...form,startTime:e.target.value})}/></div><div><label className="label">End</label><input className="input" type="time" value={form.endTime} onChange={e=>setForm({...form,endTime:e.target.value})}/></div><div style={{display:"flex",alignItems:"flex-end"}}><button className="btn btn-success" onClick={addClass}>Save</button></div></div></div>)}
      {classes.length===0?<div className="card empty-state">No classes today for this course.</div>:<div style={{display:"flex",flexDirection:"column",gap:12}}>{classes.map(cl=>(<div key={cl.id} className={`card class-card ${cl.status==="live"?"live":""}`}><div style={{flex:1}}><div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}><span style={{fontWeight:700,fontSize:15}}>{cl.subjects?.name}</span><span className={`badge ${cl.status==="live"?"badge-danger":cl.status==="completed"?"badge-success":"badge-primary"}`}>{cl.status==="live"?"🔴 LIVE":cl.status}</span><span style={{fontSize:12,color:"var(--muted)"}}>{cl.courses?.name}</span></div><div style={{fontSize:13,color:"var(--muted)"}}>{cl.start_time?.slice(0,5)}-{cl.end_time?.slice(0,5)} · {cl.staff?.profiles?.full_name}{cl.topic?` · ${cl.topic}`:""}{cl.room?` · Room ${cl.room}`:""}</div></div>{isStaff&&<div style={{display:"flex",gap:8}}>{cl.status==="scheduled"&&<button className="btn btn-danger" onClick={()=>updateStatus(cl.id,"live")}>Go Live</button>}{cl.status==="live"&&<button className="btn btn-success" onClick={()=>updateStatus(cl.id,"completed")}>Complete</button>}{cl.status==="scheduled"&&<button className="btn-outline" onClick={()=>updateStatus(cl.id,"cancelled")}>Cancel</button>}</div>}</div>))}</div>}
    </div>
  );
}

// ─── ATTENDANCE ───────────────────────────────────────────────────────────────
function AttendanceTab() {
  const [classes,setClasses]=useState([]);const [selClass,setSelClass]=useState(null);const [students,setStudents]=useState([]);const [att,setAtt]=useState({});const [saving,setSaving]=useState(false);const [saved,setSaved]=useState(false);
  const t=today();
  useEffect(()=>{supabase.from("live_classes").select("*, subjects(name), courses(name)").eq("class_date",t).in("status",["live","completed","scheduled"]).then(({data})=>setClasses(data||[]));  },[t]);
  useEffect(()=>{if(!selClass)return;(async()=>{const {data:stData}=await supabase.from("students").select("*, profiles!inner(full_name)").eq("course_id",selClass.course_id).eq("status","active");setStudents(stData||[]);const {data:attData}=await supabase.from("attendance").select("*").eq("live_class_id",selClass.id);const map={};(attData||[]).forEach(a=>{map[a.student_id]=a.status;});const def={};(stData||[]).forEach(st=>{def[st.id]=map[st.id]||"present";});setAtt(def);setSaved(false);})();},[selClass]);
  const save=async()=>{setSaving(true);const {data:{user}}=await supabase.auth.getUser();const records=Object.entries(att).map(([sid,status])=>({student_id:sid,live_class_id:selClass.id,status,marked_by:user?.id}));await supabase.from("attendance").upsert(records,{onConflict:"student_id,live_class_id"});setSaving(false);setSaved(true);};
  const markAll=(status)=>setAtt(Object.fromEntries(Object.keys(att).map(k=>[k,status])));
  const presentCount=Object.values(att).filter(s=>s==="present").length;
  return(
    <div><h1 className="page-title">Attendance</h1>
      <div style={{display:"flex",gap:10,marginBottom:20,flexWrap:"wrap"}}>{classes.length===0&&<p style={{color:"var(--muted)",fontSize:13}}>No classes today.</p>}{classes.map(cl=><button key={cl.id} className={`tag ${selClass?.id===cl.id?"active":""}`} onClick={()=>setSelClass(cl)}>{cl.subjects?.name} — {cl.courses?.name} ({cl.start_time?.slice(0,5)})</button>)}</div>
      {selClass&&(<div className="card">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div><h3 style={{fontSize:14,fontWeight:700}}>{selClass.subjects?.name}</h3><p style={{fontSize:12,color:"var(--muted)"}}>{presentCount}/{students.length} present</p></div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <button className="btn-outline" style={{fontSize:11,padding:"4px 10px"}} onClick={()=>markAll("present")}>All Present</button>
            <button className="btn-outline" style={{fontSize:11,padding:"4px 10px"}} onClick={()=>markAll("absent")}>All Absent</button>
            {saved&&<span style={{color:"var(--success)",fontSize:13,fontWeight:600}}>✓ Saved!</span>}
            <button className="btn btn-success" onClick={save} disabled={saving}>{saving?"Saving…":"Save"}</button>
          </div>
        </div>
        {students.length===0?<p style={{color:"var(--muted)"}}>No students.</p>:<table><thead><tr><th>Student</th><th>Status</th></tr></thead><tbody>{students.map(st=>(<tr key={st.id}><td style={{fontWeight:600}}>{st.profiles?.full_name}</td><td><div style={{display:"flex",gap:6}}>{["present","absent","late","excused"].map(status=>(<button key={status} className={`att-btn ${att[st.id]===status?status:""}`} onClick={()=>setAtt({...att,[st.id]:status})}>{status}</button>))}</div></td></tr>))}</tbody></table>}
      </div>)}
    </div>
  );
}

// ─── FEES (Enhanced with installments) ───────────────────────────────────────
function FeesTab({ profile }) {
  const [students,setStudents]=useState([]);const [selSt,setSelSt]=useState(null);const [fee,setFee]=useState(null);const [payments,setPayments]=useState([]);const [installments,setInstallments]=useState([]);
  const [showPay,setShowPay]=useState(false);const [payForm,setPayForm]=useState({amount:"",mode:"cash",notes:"",installment_id:""});const [saving,setSaving]=useState(false);
  const isAdmin=profile?.role==="admin";
  useEffect(()=>{supabase.from("students").select("*, profiles!inner(full_name)").eq("status","active").order("created_at",{ascending:false}).then(({data})=>setStudents(data||[]));  },[]);
  const loadFee=async(student)=>{setSelSt(student);setShowPay(false);const {data:fData}=await supabase.rpc("get_fee_summary",{p_student_id:student.id});setFee(fData?.[0]||null);const {data:pData}=await supabase.from("fee_payments").select("*").eq("student_id",student.id).order("payment_date",{ascending:false});setPayments(pData||[]);const {data:ins}=await supabase.from("fee_installments").select("*").eq("student_id",student.id).order("installment_number");setInstallments(ins||[]);};
  const pay=async()=>{if(!payForm.amount||Number(payForm.amount)<=0)return;setSaving(true);const {data:fs}=await supabase.from("fee_structures").select("id").eq("student_id",selSt.id).single();if(fs){await supabase.from("fee_payments").insert({fee_structure_id:fs.id,student_id:selSt.id,amount:Number(payForm.amount),payment_mode:payForm.mode,receipt_number:"RCP-"+Date.now(),installment_number:payments.length+1,notes:payForm.notes||null});if(payForm.installment_id){await supabase.from("fee_installments").update({status:"paid",paid_date:today()}).eq("id",payForm.installment_id);}}setPayForm({amount:"",mode:"cash",notes:"",installment_id:""});setShowPay(false);setSaving(false);loadFee(selSt);};
  const printReceipt=(payment)=>{
    const receiptCSS=`body{font-family:Arial,sans-serif;padding:20px;max-width:550px;margin:0 auto}table{width:100%;border-collapse:collapse}td,th{padding:6px 10px;font-size:13px;border:1px solid #333}.header{text-align:center;padding-bottom:12px;border-bottom:3px solid #1a5c2e;margin-bottom:12px}.footer{text-align:right;margin-top:30px;font-weight:bold}@media print{body{padding:10px}}`;
    const w=window.open("","_blank");
    w.document.write(`<html><head><title>Receipt ${payment.receipt_number}</title><style>${receiptCSS}</style></head><body>
    <div class="header"><img src="${MCA_LOGO}" style="height:45px;margin-bottom:4px"/><div style="font-size:20px;font-weight:bold;color:#1a5c2e">MY CAREER ACADEMIC</div><div style="font-size:11px;font-weight:bold">A Division of:- MY LIFELINE FOUNDATION</div><div style="font-size:10px;color:#555">Kendrapara Town, Maruti Chhak, Khairabad, Kendrapara, 754211 | Ph: 06727796700</div></div>
    <div style="text-align:center;font-size:16px;font-weight:bold;text-decoration:underline;margin:10px 0">MONEY RECEIPT</div>
    <div style="display:flex;justify-content:space-between;font-size:13px;margin:4px 0"><span>Sl. No.: <b>${payment.receipt_number}</b></span><span>Date: <b>${fmtDate(payment.payment_date)}</b></span></div>
    <div style="font-size:13px;margin:6px 0">Received from: <b>${selSt?.profiles?.full_name||""}</b> (${selSt?.admission_number||""})</div>
    <div style="font-size:13px;margin:4px 0">Rs. <b style="font-size:16px">₹${Number(payment.amount).toLocaleString("en-IN")}/-</b> (${numberToWords(Number(payment.amount))} only)</div>
    <table style="margin-top:15px"><tr><th style="width:60%">PARTICULARS</th><th>AMOUNT</th></tr>
    <tr><td>Tuition Fee${payment.installment_number?` (Installment #${payment.installment_number})`:""}</td><td style="text-align:right;font-weight:bold">₹${Number(payment.amount).toLocaleString("en-IN")}/-</td></tr>
    <tr style="background:#f5f5f5"><td style="text-align:right;font-weight:bold">Total</td><td style="text-align:right;font-weight:bold">₹${Number(payment.amount).toLocaleString("en-IN")}/-</td></tr></table>
    <div style="font-size:12px;margin-top:8px">Mode: <b>${(payment.payment_mode||"").toUpperCase()}</b>${payment.notes?` | Notes: ${payment.notes}`:""}</div>
    <div class="footer">ACCOUNTANT</div></body></html>`);
    w.document.close();w.print();
  };
  return(
    <div><h1 className="page-title">Fee Management</h1>
      <div style={{display:"flex",gap:20}}>
        <div style={{width:260,flexShrink:0}}><div className="card" style={{maxHeight:500,overflowY:"auto"}}><h3 style={{fontSize:13,fontWeight:700,marginBottom:12,color:"var(--muted)"}}>Students</h3>{students.map(st=><div key={st.id} className={`student-item ${selSt?.id===st.id?"active":""}`} onClick={()=>loadFee(st)}>{st.profiles?.full_name}</div>)}</div></div>
        <div style={{flex:1}}>
          {!selSt?<div className="card empty-state">Select a student</div>:(
            <div>
              <div className="grid-3" style={{marginBottom:16}}>
                <StatCard title="Total Fee" value={fmtMoney(fee?.total_fee)} variant="primary"/>
                <StatCard title="Paid" value={fmtMoney(fee?.total_paid)} variant="success"/>
                <StatCard title="Pending" value={fmtMoney(fee?.pending)} variant={fee?.pending>0?"danger":"success"}/>
              </div>

              {installments.length>0&&(
                <div className="card" style={{marginBottom:16}}>
                  <h3 style={{fontSize:14,fontWeight:700,marginBottom:10}}>Installment Plan</h3>
                  {installments.map(ins=>(
                    <div key={ins.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:"1px solid var(--border)"}}>
                      <div><span style={{fontWeight:600,fontSize:13}}>{ins.label}</span>{ins.due_date&&<span style={{fontSize:12,color:"var(--muted)",marginLeft:8}}>Due: {fmtDate(ins.due_date)}</span>}</div>
                      <div style={{display:"flex",alignItems:"center",gap:10}}>
                        <span style={{fontWeight:700}}>{fmtMoney(ins.amount)}</span>
                        <span className={`badge ${ins.status==="paid"?"badge-success":"badge-warning"}`}>{ins.status}</span>
                        {ins.status==="pending"&&isAdmin&&<button className="btn" style={{fontSize:11,padding:"3px 10px"}} onClick={()=>{setPayForm({amount:ins.amount.toString(),mode:"cash",notes:ins.label,installment_id:ins.id});setShowPay(true);}}>Pay</button>}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="card">
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                  <h3 style={{fontSize:14,fontWeight:700}}>Payment History</h3>
                  {isAdmin&&<button className="btn btn-success" onClick={()=>setShowPay(!showPay)}>+ Record Payment</button>}
                </div>
                {showPay&&(<div style={{background:"var(--success-light)",padding:16,borderRadius:8,marginBottom:14}}>
                  <div className="grid-3">
                    <div><label className="label">Amount *</label><input className="input" type="number" value={payForm.amount} onChange={e=>setPayForm({...payForm,amount:e.target.value})}/></div>
                    <div><label className="label">Mode</label><select className="select" value={payForm.mode} onChange={e=>setPayForm({...payForm,mode:e.target.value})}><option value="cash">Cash</option><option value="upi">UPI</option><option value="bank_transfer">Bank Transfer</option><option value="cheque">Cheque</option><option value="online">Online</option></select></div>
                    <div><label className="label">Notes</label><input className="input" value={payForm.notes} onChange={e=>setPayForm({...payForm,notes:e.target.value})}/></div>
                  </div>
                  <button className="btn btn-success" style={{marginTop:12}} onClick={pay} disabled={saving}>{saving?"…":"Save Payment"}</button>
                </div>)}
                {payments.length===0?<p style={{color:"var(--muted)",fontSize:13}}>No payments yet.</p>:<table><thead><tr><th>Date</th><th>Amount</th><th>Mode</th><th>Receipt</th><th></th></tr></thead><tbody>{payments.map(p=>(<tr key={p.id}><td>{fmtDate(p.payment_date)}</td><td style={{fontWeight:700,color:"var(--success)"}}>{fmtMoney(p.amount)}</td><td><span className="badge badge-primary">{p.payment_mode}</span></td><td style={{fontSize:12,color:"var(--muted)"}}>{p.receipt_number}</td><td><button className="btn-outline" style={{fontSize:11,padding:"3px 8px"}} onClick={()=>printReceipt(p)}>🖨 Print</button></td></tr>))}</tbody></table>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── TESTS ────────────────────────────────────────────────────────────────────
function TestsTab() {
  const [tests,setTests]=useState([]);const [courses,setCourses]=useState([]);const [subjects,setSubjects]=useState([]);const [showForm,setShowForm]=useState(false);
  const [form,setForm]=useState({name:"",courseId:"",subjectId:"",totalMarks:"",testDate:""});
  const [marksTest,setMarksTest]=useState(null);const [students,setStudents]=useState([]);const [marks,setMarks]=useState({});const [savingMarks,setSavingMarks]=useState(false);const [marksSaved,setMarksSaved]=useState(false);const [showRank,setShowRank]=useState(false);
  const loadTests=async()=>{const {data}=await supabase.from("tests").select("*, courses(name), subjects(name)").order("test_date",{ascending:false});setTests(data||[]);};
  useEffect(()=>{loadTests();supabase.from("courses").select("*").eq("is_active",true).then(({data})=>setCourses(data||[]));  },[]);
  useEffect(()=>{if(form.courseId)supabase.from("subjects").select("*").eq("course_id",form.courseId).then(({data})=>setSubjects(data||[]));  },[form.courseId]);
  const add=async()=>{if(!form.name||!form.courseId||!form.subjectId||!form.totalMarks||!form.testDate)return;await supabase.from("tests").insert({name:form.name,course_id:form.courseId,subject_id:form.subjectId,total_marks:Number(form.totalMarks),test_date:form.testDate});setShowForm(false);setForm({name:"",courseId:"",subjectId:"",totalMarks:"",testDate:""});loadTests();};
  const openMarks=async(test)=>{setMarksTest(test);setMarksSaved(false);setShowRank(false);const {data:stData}=await supabase.from("students").select("*, profiles!inner(full_name)").eq("course_id",test.course_id).eq("status","active");setStudents(stData||[]);const {data:ex}=await supabase.from("test_results").select("*").eq("test_id",test.id);const map={};(ex||[]).forEach(r=>{map[r.student_id]=r.marks_obtained?.toString()||"";});(stData||[]).forEach(st=>{if(!(st.id in map))map[st.id]="";});setMarks(map);};
  const saveMarks=async()=>{setSavingMarks(true);const records=Object.entries(marks).filter(([,v])=>v!=="").map(([sid,val])=>({test_id:marksTest.id,student_id:sid,marks_obtained:Number(val)}));if(records.length>0)await supabase.from("test_results").upsert(records,{onConflict:"test_id,student_id"});setSavingMarks(false);setMarksSaved(true);};
  const deleteTest=async(id)=>{await supabase.from("test_results").delete().eq("test_id",id);await supabase.from("tests").delete().eq("id",id);loadTests();if(marksTest?.id===id)setMarksTest(null);};
  const rankedStudents=students.filter(st=>marks[st.id]!=="").map(st=>({...st,m:Number(marks[st.id])})).sort((a,b)=>b.m-a.m).map((st,i)=>({...st,rank:i+1}));
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}><div><h1 className="page-title">Tests & Marks</h1><p style={{fontSize:13,color:"var(--muted)"}}>{tests.length} tests</p></div><button className="btn btn-accent" onClick={()=>setShowForm(!showForm)}>+ Create Test</button></div>
      {showForm&&(<div className="card" style={{marginBottom:20,borderColor:"var(--accent)"}}><div className="grid-3"><div><label className="label">Test Name</label><input className="input" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></div><div><label className="label">Course</label><select className="select" value={form.courseId} onChange={e=>setForm({...form,courseId:e.target.value,subjectId:""})}><option value="">Select</option>{courses.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></div><div><label className="label">Subject</label><select className="select" value={form.subjectId} onChange={e=>setForm({...form,subjectId:e.target.value})}><option value="">Select</option>{subjects.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></div></div><div className="grid-3" style={{marginTop:12}}><div><label className="label">Total Marks</label><input className="input" type="number" value={form.totalMarks} onChange={e=>setForm({...form,totalMarks:e.target.value})}/></div><div><label className="label">Date</label><input className="input" type="date" value={form.testDate} onChange={e=>setForm({...form,testDate:e.target.value})}/></div><div style={{display:"flex",alignItems:"flex-end"}}><button className="btn btn-success" onClick={add}>Save</button></div></div></div>)}
      <div style={{display:"flex",gap:20}}>
        <div style={{width:340,flexShrink:0}}><div className="card">{tests.length===0?<p className="empty-state">No tests.</p>:tests.map(t=>(<div key={t.id} style={{padding:"10px 0",borderBottom:"1px solid var(--border)",display:"flex",justifyContent:"space-between",alignItems:"center"}}><div style={{cursor:"pointer"}} onClick={()=>openMarks(t)}><div style={{fontWeight:600,fontSize:13}}>{t.name}</div><div style={{fontSize:12,color:"var(--muted)"}}>{t.courses?.name} · {t.subjects?.name} · {t.total_marks}m · {fmtDate(t.test_date)}</div></div><div style={{display:"flex",gap:6}}><button className="btn" style={{fontSize:11,padding:"4px 10px"}} onClick={()=>openMarks(t)}>Marks</button><button style={{background:"none",border:"none",color:"var(--danger)",cursor:"pointer",fontSize:11}} onClick={()=>deleteTest(t.id)}>Del</button></div></div>))}</div></div>
        <div style={{flex:1}}>
          {!marksTest?<div className="card empty-state">Select a test</div>:(
            <div className="card">
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                <div><h3 style={{fontSize:15,fontWeight:700}}>{marksTest.name}</h3><p style={{fontSize:12,color:"var(--muted)"}}>Total: {marksTest.total_marks}m · {marksTest.subjects?.name}</p></div>
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  <button className="btn-outline" style={{fontSize:12,padding:"5px 12px"}} onClick={()=>setShowRank(!showRank)}>{showRank?"Edit Marks":"🏆 Rank List"}</button>
                  {marksSaved&&<span style={{color:"var(--success)",fontSize:13,fontWeight:600}}>✓ Saved!</span>}
                  <button className="btn btn-success" onClick={saveMarks} disabled={savingMarks}>{savingMarks?"…":"Save Marks"}</button>
                </div>
              </div>
              {showRank?(
                <table><thead><tr><th>Rank</th><th>Student</th><th>Marks</th><th>%</th></tr></thead>
                <tbody>{rankedStudents.map(st=>{const pct=Math.round((st.m/marksTest.total_marks)*100);return(<tr key={st.id}><td><span style={{fontWeight:700,fontSize:15}}>{st.rank===1?"🥇":st.rank===2?"🥈":st.rank===3?"🥉":st.rank}</span></td><td style={{fontWeight:600}}>{st.profiles?.full_name}</td><td style={{fontWeight:700}}>{st.m}/{marksTest.total_marks}</td><td><span className={`badge ${pct>=40?"badge-success":"badge-danger"}`}>{pct}%</span></td></tr>);})}
                </tbody></table>
              ):(
                <table><thead><tr><th>Student</th><th style={{width:120}}>Marks</th><th style={{width:80}}>%</th></tr></thead>
                <tbody>{students.map(st=>{const val=marks[st.id]||"";const pct=val?Math.round((Number(val)/marksTest.total_marks)*100):null;return(<tr key={st.id}><td style={{fontWeight:600}}>{st.profiles?.full_name}</td><td><input className="input" type="number" min="0" max={marksTest.total_marks} style={{width:100,padding:"6px 10px",fontSize:13}} value={val} onChange={e=>setMarks({...marks,[st.id]:e.target.value})}/></td><td>{pct!==null?<span className={`badge ${pct>=40?"badge-success":"badge-danger"}`}>{pct}%</span>:"-"}</td></tr>);})}
                </tbody></table>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── HOSTEL (Smart — with food menu) ─────────────────────────────────────────
function HostelTab() {
  const [hostels,setHostels]=useState([]);const [rooms,setRooms]=useState([]);const [allotments,setAllotments]=useState([]);
  const [students,setStudents]=useState([]);const [view,setView]=useState("overview");
  const [selHostel,setSelHostel]=useState(null);
  const [showHostelForm,setShowHostelForm]=useState(false);const [showRoomForm,setShowRoomForm]=useState(false);const [showAllotForm,setShowAllotForm]=useState(false);
  const [hostelForm,setHostelForm]=useState({name:"",type:"boys",wardenName:"",wardenPhone:"",totalRooms:""});
  const [roomForm,setRoomForm]=useState({roomNumber:"",floor:"",roomType:"double",totalBeds:"2",monthlyRent:"",hasAc:false,hasAttachedBath:false});
  const [allotForm,setAllotForm]=useState({studentId:"",roomId:"",bedNumber:"1"});
  const [hostelFees,setHostelFees]=useState([]);const [showFeeForm,setShowFeeForm]=useState(false);
  const [feeForm,setFeeForm]=useState({studentId:"",amount:"",feeMonth:"",paymentMode:"cash"});
  const [foodMenus,setFoodMenus]=useState([]);const [showMenuForm,setShowMenuForm]=useState(false);
  const [menuForm,setMenuForm]=useState({day_of_week:new Date().getDay(),breakfast:"",lunch:"",evening_snack:"",dinner:""});
  const [msg,setMsg]=useState("");

  const loadHostels=async()=>{const {data}=await supabase.from("hostels").select("*").order("name");setHostels(data||[]);};
  const loadRooms=async(hostelId)=>{const {data}=await supabase.from("hostel_rooms").select("*").eq("hostel_id",hostelId).order("room_number");setRooms(data||[]);};
  const loadAllotments=async()=>{const {data}=await supabase.from("hostel_allotments").select("*, students!inner(admission_number,profiles!inner(full_name,phone)), hostel_rooms!inner(room_number,hostels!inner(name))").eq("status","active");setAllotments(data||[]);};
  const loadHostelFees=async()=>{const {data}=await supabase.from("hostel_fees").select("*, students!inner(profiles!inner(full_name))").order("created_at",{ascending:false}).limit(50);setHostelFees(data||[]);};
  const loadFoodMenus=async()=>{const {data}=await supabase.from("hostel_food_menu").select("*").order("day_of_week");setFoodMenus(data||[]);};
  useEffect(()=>{loadHostels();loadAllotments();supabase.from("students").select("*, profiles!inner(full_name)").eq("status","active").then(({data})=>setStudents(data||[]));loadHostelFees();loadFoodMenus();},[]);

  const addHostel=async()=>{if(!hostelForm.name)return;await supabase.from("hostels").insert({name:hostelForm.name,type:hostelForm.type,warden_name:hostelForm.wardenName||null,warden_phone:hostelForm.wardenPhone||null,total_rooms:hostelForm.totalRooms?Number(hostelForm.totalRooms):0});setHostelForm({name:"",type:"boys",wardenName:"",wardenPhone:"",totalRooms:""});setShowHostelForm(false);loadHostels();};
  const addRoom=async()=>{if(!roomForm.roomNumber||!selHostel)return;await supabase.from("hostel_rooms").insert({hostel_id:selHostel.id,room_number:roomForm.roomNumber,floor:roomForm.floor||null,room_type:roomForm.roomType,total_beds:Number(roomForm.totalBeds),monthly_rent:roomForm.monthlyRent?Number(roomForm.monthlyRent):0,has_ac:roomForm.hasAc,has_attached_bath:roomForm.hasAttachedBath});setRoomForm({roomNumber:"",floor:"",roomType:"double",totalBeds:"2",monthlyRent:"",hasAc:false,hasAttachedBath:false});setShowRoomForm(false);loadRooms(selHostel.id);};
  const allotRoom=async()=>{if(!allotForm.studentId||!allotForm.roomId)return;await supabase.from("hostel_allotments").insert({student_id:allotForm.studentId,room_id:allotForm.roomId,bed_number:Number(allotForm.bedNumber)});await supabase.from("students").update({is_hosteler:true}).eq("id",allotForm.studentId);setAllotForm({studentId:"",roomId:"",bedNumber:"1"});setShowAllotForm(false);loadAllotments();setMsg("Room allotted!");};
  const vacateStudent=async(allotId,studentId)=>{await supabase.from("hostel_allotments").update({status:"vacated",vacate_date:today()}).eq("id",allotId);await supabase.from("students").update({is_hosteler:false}).eq("id",studentId);loadAllotments();setMsg("Student vacated.");};
  const addHostelFee=async()=>{if(!feeForm.studentId||!feeForm.amount||!feeForm.feeMonth)return;await supabase.from("hostel_fees").insert({student_id:feeForm.studentId,amount:Number(feeForm.amount),fee_month:feeForm.feeMonth,payment_mode:feeForm.paymentMode,receipt_number:"HF-"+Date.now()});setFeeForm({studentId:"",amount:"",feeMonth:"",paymentMode:"cash"});setShowFeeForm(false);loadHostelFees();setMsg("Hostel fee recorded!");};
  const saveMenuDay=async()=>{await supabase.from("hostel_food_menu").upsert({day_of_week:Number(menuForm.day_of_week),breakfast:menuForm.breakfast||null,lunch:menuForm.lunch||null,evening_snack:menuForm.evening_snack||null,dinner:menuForm.dinner||null},{onConflict:"day_of_week"});setShowMenuForm(false);loadFoodMenus();setMsg("Menu updated!");};

  const occupiedBeds=allotments.reduce((acc,a)=>{acc[a.room_id]=(acc[a.room_id]||0)+1;return acc;},{});

  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <div><h1 className="page-title">Hostel Management</h1><p className="page-sub" style={{marginBottom:0}}>{allotments.length} hostelers · {hostels.length} hostels</p></div>
        <div style={{display:"flex",gap:8}}>{["overview","rooms","allotments","fees","food"].map(v=><button key={v} className={`tag ${view===v?"active":""}`} onClick={()=>setView(v)}>{v.charAt(0).toUpperCase()+v.slice(1)}</button>)}</div>
      </div>
      {msg&&<div className="success-box" style={{marginBottom:12}}>{msg}</div>}

      {view==="overview"&&(
        <div>
          <div className="grid-4" style={{marginBottom:20}}>
            <StatCard title="Hostels" value={hostels.length} variant="primary"/>
            <StatCard title="Hostelers" value={allotments.length} variant="success"/>
            <StatCard title="Fee Records" value={hostelFees.length} variant="warning"/>
            <StatCard title="Total Rooms" value={hostels.reduce((a,h)=>a+(h.total_rooms||0),0)} variant="primary"/>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <h3 style={{fontSize:15,fontWeight:700}}>Hostels</h3>
            <button className="btn btn-accent" onClick={()=>setShowHostelForm(!showHostelForm)}>+ Add Hostel</button>
          </div>
          {showHostelForm&&(<div className="card" style={{marginBottom:14,borderColor:"var(--accent)"}}>
            <div className="grid-2"><div><label className="label">Hostel Name *</label><input className="input" value={hostelForm.name} onChange={e=>setHostelForm({...hostelForm,name:e.target.value})} placeholder="Boys Hostel"/></div><div><label className="label">Type</label><select className="select" value={hostelForm.type} onChange={e=>setHostelForm({...hostelForm,type:e.target.value})}><option value="boys">Boys</option><option value="girls">Girls</option><option value="mixed">Mixed</option></select></div></div>
            <div className="grid-3" style={{marginTop:10}}><div><label className="label">Warden Name</label><input className="input" value={hostelForm.wardenName} onChange={e=>setHostelForm({...hostelForm,wardenName:e.target.value})}/></div><div><label className="label">Warden Phone</label><input className="input" value={hostelForm.wardenPhone} onChange={e=>setHostelForm({...hostelForm,wardenPhone:e.target.value})}/></div><div><label className="label">Total Rooms</label><input className="input" type="number" value={hostelForm.totalRooms} onChange={e=>setHostelForm({...hostelForm,totalRooms:e.target.value})}/></div></div>
            <button className="btn btn-success" style={{marginTop:12}} onClick={addHostel}>Save Hostel</button>
          </div>)}
          {hostels.map(h=>(<div key={h.id} className="card" style={{marginBottom:10,cursor:"pointer"}} onClick={()=>{setSelHostel(h);loadRooms(h.id);setView("rooms");}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div><span style={{fontWeight:700,fontSize:15}}>{h.name}</span><span className={`badge ${h.type==="boys"?"badge-primary":h.type==="girls"?"badge-danger":"badge-warning"}`} style={{marginLeft:8}}>{h.type}</span><div style={{fontSize:12,color:"var(--muted)",marginTop:3}}>Warden: {h.warden_name||"-"} · {h.warden_phone||"-"} · {h.total_rooms} rooms</div></div>
              <span style={{color:"var(--primary)",fontWeight:600,fontSize:13}}>Manage →</span>
            </div>
          </div>))}
        </div>
      )}

      {view==="rooms"&&(
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <div><h3 style={{fontSize:15,fontWeight:700}}>{selHostel?.name||"Select a hostel"}</h3><div style={{display:"flex",gap:8,marginTop:8}}>{hostels.map(h=><button key={h.id} className={`tag ${selHostel?.id===h.id?"active":""}`} onClick={()=>{setSelHostel(h);loadRooms(h.id);}}>{h.name}</button>)}</div></div>
            {selHostel&&<button className="btn btn-accent" onClick={()=>setShowRoomForm(!showRoomForm)}>+ Add Room</button>}
          </div>
          {showRoomForm&&(<div className="card" style={{marginBottom:14,borderColor:"var(--accent)"}}>
            <div className="grid-3"><div><label className="label">Room No. *</label><input className="input" value={roomForm.roomNumber} onChange={e=>setRoomForm({...roomForm,roomNumber:e.target.value})} placeholder="101"/></div><div><label className="label">Floor</label><input className="input" value={roomForm.floor} onChange={e=>setRoomForm({...roomForm,floor:e.target.value})} placeholder="Ground"/></div><div><label className="label">Type</label><select className="select" value={roomForm.roomType} onChange={e=>setRoomForm({...roomForm,roomType:e.target.value})}><option value="single">Single</option><option value="double">Double</option><option value="triple">Triple</option><option value="dormitory">Dormitory</option></select></div></div>
            <div className="grid-3" style={{marginTop:10}}><div><label className="label">Total Beds</label><input className="input" type="number" value={roomForm.totalBeds} onChange={e=>setRoomForm({...roomForm,totalBeds:e.target.value})}/></div><div><label className="label">Monthly Rent (₹)</label><input className="input" type="number" value={roomForm.monthlyRent} onChange={e=>setRoomForm({...roomForm,monthlyRent:e.target.value})}/></div><div style={{display:"flex",gap:16,alignItems:"flex-end",paddingBottom:4}}><label style={{fontSize:13,display:"flex",alignItems:"center",gap:4}}><input type="checkbox" checked={roomForm.hasAc} onChange={e=>setRoomForm({...roomForm,hasAc:e.target.checked})}/> AC</label><label style={{fontSize:13,display:"flex",alignItems:"center",gap:4}}><input type="checkbox" checked={roomForm.hasAttachedBath} onChange={e=>setRoomForm({...roomForm,hasAttachedBath:e.target.checked})}/> Bath</label></div></div>
            <button className="btn btn-success" style={{marginTop:12}} onClick={addRoom}>Save Room</button>
          </div>)}
          <div className="card">{rooms.length===0?<p className="empty-state">No rooms.{!selHostel?" Select a hostel first.":""}</p>:<table><thead><tr><th>Room</th><th>Floor</th><th>Type</th><th>Beds</th><th>Occupied</th><th>Rent/month</th><th>Facilities</th></tr></thead><tbody>{rooms.map(r=>{const occ=occupiedBeds[r.id]||0;return(<tr key={r.id}><td style={{fontWeight:700}}>{r.room_number}</td><td>{r.floor||"-"}</td><td><span className="badge badge-primary">{r.room_type}</span></td><td>{r.total_beds}</td><td><span className={`badge ${occ>=r.total_beds?"badge-danger":occ>0?"badge-warning":"badge-success"}`}>{occ}/{r.total_beds}</span></td><td>{fmtMoney(r.monthly_rent)}</td><td>{r.has_ac?"AC ":""}{r.has_attached_bath?"Bath":""}{!r.has_ac&&!r.has_attached_bath?"-":""}</td></tr>);})}</tbody></table>}</div>
        </div>
      )}

      {view==="allotments"&&(
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <h3 style={{fontSize:15,fontWeight:700}}>Room Allotments</h3>
            <button className="btn btn-accent" onClick={()=>setShowAllotForm(!showAllotForm)}>+ Allot Room</button>
          </div>
          {showAllotForm&&(<div className="card" style={{marginBottom:14,borderColor:"var(--accent)"}}>
            <div className="grid-3">
              <div><label className="label">Student</label><select className="select" value={allotForm.studentId} onChange={e=>setAllotForm({...allotForm,studentId:e.target.value})}><option value="">Select student</option>{students.filter(s=>!allotments.find(a=>a.student_id===s.id)).map(s=><option key={s.id} value={s.id}>{s.profiles?.full_name}</option>)}</select></div>
              <div><label className="label">Hostel → Room</label>
                <select className="select" value={allotForm.roomId} onChange={e=>setAllotForm({...allotForm,roomId:e.target.value})}>
                  <option value="">Select room</option>
                  {hostels.map(h=><optgroup key={h.id} label={h.name}>{(rooms.filter(r=>r.hostel_id===h.id&&(occupiedBeds[r.id]||0)<r.total_beds)||[]).map(r=><option key={r.id} value={r.id}>Room {r.room_number} ({r.room_type}) — {fmtMoney(r.monthly_rent)}/mo</option>)}</optgroup>)}
                </select>
              </div>
              <div><label className="label">Bed No.</label><input className="input" type="number" value={allotForm.bedNumber} onChange={e=>setAllotForm({...allotForm,bedNumber:e.target.value})}/></div>
            </div>
            <button className="btn btn-success" style={{marginTop:12}} onClick={allotRoom}>Allot Room</button>
          </div>)}
          <div className="card">{allotments.length===0?<p className="empty-state">No allotments yet.</p>:<table><thead><tr><th>Student</th><th>Phone</th><th>Room</th><th>Hostel</th><th>Bed</th><th>Since</th><th></th></tr></thead><tbody>{allotments.map(a=>(<tr key={a.id}><td style={{fontWeight:600}}>{a.students?.profiles?.full_name}</td><td style={{fontSize:12}}>{a.students?.profiles?.phone||"-"}</td><td><span className="badge badge-primary">{a.hostel_rooms?.room_number}</span></td><td>{a.hostel_rooms?.hostels?.name}</td><td>Bed {a.bed_number}</td><td>{fmtDate(a.allotment_date)}</td><td><button style={{background:"none",border:"none",color:"var(--danger)",cursor:"pointer",fontSize:12,fontWeight:600}} onClick={()=>vacateStudent(a.id,a.student_id)}>Vacate</button></td></tr>))}</tbody></table>}</div>
        </div>
      )}

      {view==="fees"&&(
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <h3 style={{fontSize:15,fontWeight:700}}>Hostel Fee Payments</h3>
            <button className="btn btn-accent" onClick={()=>setShowFeeForm(!showFeeForm)}>+ Record Fee</button>
          </div>
          {showFeeForm&&(<div className="card" style={{marginBottom:14,borderColor:"var(--accent)"}}>
            <div className="grid-2"><div><label className="label">Student</label><select className="select" value={feeForm.studentId} onChange={e=>setFeeForm({...feeForm,studentId:e.target.value})}><option value="">Select</option>{allotments.map(a=><option key={a.student_id} value={a.student_id}>{a.students?.profiles?.full_name} ({a.hostel_rooms?.room_number})</option>)}</select></div><div><label className="label">Amount (₹)</label><input className="input" type="number" value={feeForm.amount} onChange={e=>setFeeForm({...feeForm,amount:e.target.value})}/></div></div>
            <div className="grid-2" style={{marginTop:10}}><div><label className="label">Fee Month</label><input className="input" value={feeForm.feeMonth} onChange={e=>setFeeForm({...feeForm,feeMonth:e.target.value})} placeholder="May 2026"/></div><div><label className="label">Mode</label><select className="select" value={feeForm.paymentMode} onChange={e=>setFeeForm({...feeForm,paymentMode:e.target.value})}><option value="cash">Cash</option><option value="upi">UPI</option><option value="bank_transfer">Bank</option><option value="cheque">Cheque</option></select></div></div>
            <button className="btn btn-success" style={{marginTop:12}} onClick={addHostelFee}>Save Payment</button>
          </div>)}
          <div className="card">{hostelFees.length===0?<p className="empty-state">No hostel fee records.</p>:<table><thead><tr><th>Student</th><th>Amount</th><th>Month</th><th>Mode</th><th>Date</th><th>Receipt</th></tr></thead><tbody>{hostelFees.map(f=>(<tr key={f.id}><td style={{fontWeight:600}}>{f.students?.profiles?.full_name}</td><td style={{fontWeight:700,color:"var(--success)"}}>{fmtMoney(f.amount)}</td><td>{f.fee_month}</td><td><span className="badge badge-primary">{f.payment_mode}</span></td><td>{fmtDate(f.payment_date)}</td><td style={{fontSize:12,color:"var(--muted)"}}>{f.receipt_number}</td></tr>))}</tbody></table>}</div>
        </div>
      )}

      {view==="food"&&(
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <div><h3 style={{fontSize:15,fontWeight:700}}>Weekly Food Menu 🍽</h3><p style={{fontSize:12,color:"var(--muted)",marginTop:2}}>Students & parents can see today&apos;s menu in their dashboard</p></div>
            <button className="btn btn-accent" onClick={()=>setShowMenuForm(!showMenuForm)}>✏ Edit Menu</button>
          </div>
          {showMenuForm&&(<div className="card" style={{marginBottom:14,borderColor:"var(--accent)"}}>
            <div style={{marginBottom:10}}><label className="label">Day</label>
              <select className="select" style={{width:200}} value={menuForm.day_of_week} onChange={e=>{const d=Number(e.target.value);const existing=foodMenus.find(m=>m.day_of_week===d);setMenuForm(existing?{...existing}:{day_of_week:d,breakfast:"",lunch:"",evening_snack:"",dinner:""});}}>
                {DAYS.map((d,i)=><option key={i} value={i}>{d}</option>)}
              </select>
            </div>
            <div className="grid-2">
              <div><label className="label">Breakfast</label><input className="input" value={menuForm.breakfast} onChange={e=>setMenuForm({...menuForm,breakfast:e.target.value})} placeholder="Poha, Tea, Bread Butter"/></div>
              <div><label className="label">Lunch</label><input className="input" value={menuForm.lunch} onChange={e=>setMenuForm({...menuForm,lunch:e.target.value})} placeholder="Rice, Dal, Sabji, Roti"/></div>
            </div>
            <div className="grid-2" style={{marginTop:10}}>
              <div><label className="label">Evening Snack</label><input className="input" value={menuForm.evening_snack} onChange={e=>setMenuForm({...menuForm,evening_snack:e.target.value})} placeholder="Samosa, Tea"/></div>
              <div><label className="label">Dinner</label><input className="input" value={menuForm.dinner} onChange={e=>setMenuForm({...menuForm,dinner:e.target.value})} placeholder="Roti, Dal, Sabji, Rice"/></div>
            </div>
            <button className="btn btn-success" style={{marginTop:12}} onClick={saveMenuDay}>Save Menu</button>
          </div>)}
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:12}}>
            {DAYS.map((day,i)=>{const menu=foodMenus.find(m=>m.day_of_week===i);const isToday=new Date().getDay()===i;return(<div key={i} className="card" style={{borderLeft:isToday?"4px solid var(--primary)":"4px solid var(--border)"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <h4 style={{fontSize:13,fontWeight:700}}>{day}</h4>
                {isToday&&<span className="badge badge-primary">Today</span>}
              </div>
              {menu?(
                <div style={{fontSize:12}}>
                  {menu.breakfast&&<div style={{marginBottom:4}}><b>Breakfast:</b> {menu.breakfast}</div>}
                  {menu.lunch&&<div style={{marginBottom:4}}><b>Lunch:</b> {menu.lunch}</div>}
                  {menu.evening_snack&&<div style={{marginBottom:4}}><b>Evening:</b> {menu.evening_snack}</div>}
                  {menu.dinner&&<div><b>Dinner:</b> {menu.dinner}</div>}
                  {!menu.breakfast&&!menu.lunch&&!menu.evening_snack&&!menu.dinner&&<p style={{color:"var(--muted)"}}>No menu set</p>}
                </div>
              ):<p style={{color:"var(--muted)",fontSize:12}}>No menu set for {day}</p>}
            </div>);})}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ACCOUNTS ─────────────────────────────────────────────────────────────────
function AccountsTab() {
  const [view,setView]=useState("overview");
  const [incomes,setIncomes]=useState([]);const [expenses,setExpenses]=useState([]);const [salaries,setSalaries]=useState([]);
  const [showIncForm,setShowIncForm]=useState(false);const [showExpForm,setShowExpForm]=useState(false);const [showSalForm,setShowSalForm]=useState(false);
  const [incForm,setIncForm]=useState({category:"tuition_fee",amount:"",description:"",paymentMode:"cash",incomeDate:today()});
  const [expForm,setExpForm]=useState({category:"salary",amount:"",description:"",paidTo:"",paymentMode:"cash",expenseDate:today()});
  const [salForm,setSalForm]=useState({staffId:"",amount:"",month:"",deductions:"0",bonus:"0",paymentMode:"bank_transfer"});
  const [staffList,setStaffList]=useState([]);const [msg,setMsg]=useState("");
  const incCats={tuition_fee:"Tuition Fee",hostel_fee:"Hostel Fee",admission_fee:"Admission Fee",exam_fee:"Exam Fee",late_fee:"Late Fee",donation:"Donation",other_income:"Other"};
  const expCats={salary:"Salary",electricity:"Electricity",water:"Water",rent:"Rent",maintenance:"Maintenance",stationery:"Stationery",internet:"Internet",furniture:"Furniture",transport:"Transport",food:"Food/Canteen",events:"Events",marketing:"Marketing",taxes:"Taxes",insurance:"Insurance",other_expense:"Other"};

  const loadData=async()=>{
    const {data:inc}=await supabase.from("income_records").select("*").order("income_date",{ascending:false}).limit(100);setIncomes(inc||[]);
    const {data:exp}=await supabase.from("expense_records").select("*").order("expense_date",{ascending:false}).limit(100);setExpenses(exp||[]);
    const {data:sal}=await supabase.from("salary_records").select("*, staff!inner(profiles!inner(full_name))").order("payment_date",{ascending:false}).limit(50);setSalaries(sal||[]);
  };
  useEffect(()=>{loadData();supabase.from("staff").select("*, profiles!inner(full_name)").then(({data})=>setStaffList(data||[]));},[]);

  const totalIncome=incomes.reduce((a,i)=>a+Number(i.amount||0),0);
  const totalExpense=expenses.reduce((a,e)=>a+Number(e.amount||0),0);
  const totalSalary=salaries.reduce((a,s)=>a+Number(s.net_amount||s.amount||0),0);
  const profit=totalIncome-totalExpense-totalSalary;

  const addIncome=async()=>{if(!incForm.amount)return;await supabase.from("income_records").insert({category:incForm.category,amount:Number(incForm.amount),description:incForm.description||null,payment_mode:incForm.paymentMode,income_date:incForm.incomeDate,receipt_number:"INC-"+Date.now()});setIncForm({category:"tuition_fee",amount:"",description:"",paymentMode:"cash",incomeDate:today()});setShowIncForm(false);loadData();setMsg("Income recorded!");};
  const addExpense=async()=>{if(!expForm.amount)return;await supabase.from("expense_records").insert({category:expForm.category,amount:Number(expForm.amount),description:expForm.description||null,paid_to:expForm.paidTo||null,payment_mode:expForm.paymentMode,expense_date:expForm.expenseDate,bill_number:"EXP-"+Date.now()});setExpForm({category:"salary",amount:"",description:"",paidTo:"",paymentMode:"cash",expenseDate:today()});setShowExpForm(false);loadData();setMsg("Expense recorded!");};
  const addSalary=async()=>{if(!salForm.staffId||!salForm.amount||!salForm.month)return;const net=Number(salForm.amount)-Number(salForm.deductions||0)+Number(salForm.bonus||0);await supabase.from("salary_records").insert({staff_id:salForm.staffId,amount:Number(salForm.amount),month:salForm.month,deductions:Number(salForm.deductions||0),bonus:Number(salForm.bonus||0),net_amount:net,payment_mode:salForm.paymentMode});await supabase.from("expense_records").insert({category:"salary",amount:net,description:"Salary - "+salForm.month,paid_to:staffList.find(s=>s.id===salForm.staffId)?.profiles?.full_name||"",payment_mode:salForm.paymentMode,expense_date:today()});setSalForm({staffId:"",amount:"",month:"",deductions:"0",bonus:"0",paymentMode:"bank_transfer"});setShowSalForm(false);loadData();setMsg("Salary paid!");};

  const receiptCSS=`body{font-family:Arial,sans-serif;padding:20px;max-width:550px;margin:0 auto;color:#000}table{width:100%;border-collapse:collapse}td,th{padding:6px 10px;font-size:13px;border:1px solid #333;text-align:left}.header{text-align:center;padding-bottom:12px;border-bottom:3px solid #1a5c2e;margin-bottom:12px}.footer{text-align:right;margin-top:30px;font-weight:bold;font-size:14px}@media print{body{padding:10px}}`;
  const mcaHeader=`<div class="header"><img src="${MCA_LOGO}" style="height:45px;margin-bottom:4px"/><div style="font-size:20px;font-weight:bold;color:#1a5c2e">MY CAREER ACADEMIC</div><div style="font-size:11px;font-weight:bold">A Division of:- MY LIFELINE FOUNDATION</div><div style="font-size:10px;color:#555">Kendrapara Town, Maruti Chhak, Khairabad, Kendrapara, 754211 | Ph: 06727796700</div></div>`;

  const printReceipt=(type,record)=>{
    const isInc=type==="income";const cats=isInc?incCats:expCats;const catName=cats[record.category]||record.category;
    const receiptNo=record.receipt_number||record.bill_number||"N/A";const date=fmtDate(record.income_date||record.expense_date);const amt=Number(record.amount).toLocaleString("en-IN");
    const w=window.open("","_blank");
    w.document.write(`<html><head><title>Money Receipt - ${receiptNo}</title><style>${receiptCSS}</style></head><body>
    ${mcaHeader}<div style="text-align:center;font-size:16px;font-weight:bold;text-decoration:underline;margin:10px 0">MONEY RECEIPT</div>
    <div style="display:flex;justify-content:space-between;font-size:13px;margin:4px 0"><span>Sl. No.: <b>${receiptNo}</b></span><span>Date: <b>${date}</b></span></div>
    <div style="font-size:13px;margin:6px 0">Received from / Paid to: <b>${record.paid_to||record.description||catName}</b></div>
    <div style="font-size:13px">Payment Mode: <b>${(record.payment_mode||"cash").toUpperCase()}</b></div>
    <div style="font-size:13px;margin-top:5px">Rs. <b style="font-size:16px">₹${amt}/-</b> (${numberToWords(Number(record.amount))} only)</div>
    <table style="margin-top:15px"><tr><th style="width:60%">PARTICULARS</th><th>AMOUNT</th></tr>
    <tr><td>1. ${catName}</td><td style="text-align:right;font-weight:bold">₹${amt}/-</td></tr>
    ${isInc?`<tr><td>2. Registration fee</td><td></td></tr><tr><td>3. Admission fee</td><td></td></tr><tr><td>4. Course fee</td><td></td></tr><tr><td>5. Hostel fee</td><td></td></tr>`:
    `<tr><td>2. ${record.description||"-"}</td><td></td></tr>`}
    <tr style="background:#f5f5f5"><td style="text-align:right;font-weight:bold">G. Total</td><td style="text-align:right;font-weight:bold;font-size:15px">₹${amt}/-</td></tr></table>
    <div class="footer">ACCOUNTANT</div></body></html>`);
    w.document.close();w.print();
  };

  const printSalarySlip=(record)=>{const w=window.open("","_blank");w.document.write(`<html><head><title>Salary Slip</title><style>${receiptCSS}</style></head><body>
    ${mcaHeader}<div style="text-align:center;font-size:16px;font-weight:bold;text-decoration:underline;margin:10px 0">SALARY SLIP</div>
    <div style="display:flex;justify-content:space-between;font-size:13px;margin:4px 0"><span>Employee: <b>${record.staff?.profiles?.full_name||"N/A"}</b></span><span>Month: <b>${record.month}</b></span></div>
    <div style="display:flex;justify-content:space-between;font-size:13px;margin:4px 0"><span>Payment Date: <b>${fmtDate(record.payment_date)}</b></span><span>Mode: <b>${(record.payment_mode||"bank").toUpperCase()}</b></span></div>
    <table style="margin-top:15px"><tr><th style="width:60%">PARTICULARS</th><th>AMOUNT</th></tr>
    <tr><td>Base Salary</td><td style="text-align:right">₹${Number(record.amount).toLocaleString("en-IN")}/-</td></tr>
    <tr><td>Deductions</td><td style="text-align:right;color:#c4342d">-₹${Number(record.deductions||0).toLocaleString("en-IN")}/-</td></tr>
    <tr><td>Bonus / Incentive</td><td style="text-align:right;color:#1a8a5c">+₹${Number(record.bonus||0).toLocaleString("en-IN")}/-</td></tr>
    <tr style="background:#f0f4f0"><td style="text-align:right;font-weight:bold">Net Pay</td><td style="text-align:right;font-weight:bold;font-size:16px">₹${Number(record.net_amount||record.amount).toLocaleString("en-IN")}/-</td></tr></table>
    <div style="margin-top:40px;display:flex;justify-content:space-between"><div style="text-align:center;border-top:1px solid #333;padding-top:5px;width:150px;font-size:12px">Employee</div><div style="text-align:center;border-top:1px solid #333;padding-top:5px;width:150px;font-size:12px">ACCOUNTANT</div></div>
    </body></html>`);w.document.close();w.print();};

  const printMonthlyReport=()=>{const now=new Date();const monthName=now.toLocaleDateString("en-IN",{month:"long",year:"numeric"});const mInc=incomes.filter(i=>{const d=new Date(i.income_date);return d.getMonth()===now.getMonth()&&d.getFullYear()===now.getFullYear();});const mExp=expenses.filter(e=>{const d=new Date(e.expense_date);return d.getMonth()===now.getMonth()&&d.getFullYear()===now.getFullYear();});const mSal=salaries.filter(s=>{const d=new Date(s.payment_date);return d.getMonth()===now.getMonth()&&d.getFullYear()===now.getFullYear();});const mTI=mInc.reduce((a,i)=>a+Number(i.amount),0);const mTE=mExp.reduce((a,e)=>a+Number(e.amount),0);const mTS=mSal.reduce((a,s)=>a+Number(s.net_amount||s.amount),0);const mP=mTI-mTE-mTS;const incByCat={};mInc.forEach(i=>{incByCat[i.category]=(incByCat[i.category]||0)+Number(i.amount);});const expByCat={};mExp.forEach(e=>{expByCat[e.category]=(expByCat[e.category]||0)+Number(e.amount);});
  const w=window.open("","_blank");w.document.write(`<html><head><title>Monthly Report - ${monthName}</title><style>body{font-family:Arial,sans-serif;padding:30px;max-width:700px;margin:0 auto}table{width:100%;border-collapse:collapse;margin:10px 0}td,th{padding:7px 10px;font-size:12px;border:1px solid #ddd}.header{text-align:center;border-bottom:3px solid #1a5c2e;padding-bottom:12px;margin-bottom:20px}.section{background:#f0f4f0;font-weight:bold;font-size:12px;color:#1a5c2e}.summary{display:flex;gap:10px;margin:15px 0}.sbox{flex:1;padding:12px;border-radius:8px;text-align:center;border:1px solid #ddd}.green{background:#e6f5ee;color:#1a8a5c}.red{background:#fceaea;color:#c4342d}.blue{background:#e8f0f8;color:#1a2a6c}@media print{body{padding:10px}}</style></head><body>
  <div class="header"><img src="${MCA_LOGO}" style="height:45px;margin-bottom:4px"/><div style="font-size:20px;font-weight:bold;color:#1a5c2e">MY CAREER ACADEMIC</div><div style="font-size:11px;font-weight:bold">A Division of:- MY LIFELINE FOUNDATION</div><div style="font-size:10px;color:#555">Kendrapara Town, Maruti Chhak, Khairabad, Kendrapara, 754211</div><div style="font-size:14px;font-weight:bold;margin-top:8px;text-decoration:underline">MONTHLY FINANCIAL REPORT — ${monthName}</div></div>
  <div class="summary"><div class="sbox green"><div style="font-size:10px">TOTAL INCOME</div><div style="font-size:18px;font-weight:bold">₹${mTI.toLocaleString("en-IN")}</div></div><div class="sbox red"><div style="font-size:10px">TOTAL EXPENSE</div><div style="font-size:18px;font-weight:bold">₹${(mTE+mTS).toLocaleString("en-IN")}</div></div><div class="sbox ${mP>=0?"green":"red"}"><div style="font-size:10px">${mP>=0?"PROFIT":"LOSS"}</div><div style="font-size:18px;font-weight:bold">₹${Math.abs(mP).toLocaleString("en-IN")}</div></div></div>
  <table><tr><td colspan="3" class="section">INCOME BREAKDOWN</td></tr><tr><th>Category</th><th>Count</th><th>Amount</th></tr>${Object.entries(incByCat).map(([k,v])=>`<tr><td>${incCats[k]||k}</td><td>${mInc.filter(i=>i.category===k).length}</td><td style="font-weight:bold;color:#1a8a5c">₹${v.toLocaleString("en-IN")}</td></tr>`).join("")}<tr style="background:#f5f5f5"><td><b>Total</b></td><td><b>${mInc.length}</b></td><td><b>₹${mTI.toLocaleString("en-IN")}</b></td></tr></table>
  <table><tr><td colspan="3" class="section">EXPENSE BREAKDOWN</td></tr><tr><th>Category</th><th>Count</th><th>Amount</th></tr>${Object.entries(expByCat).map(([k,v])=>`<tr><td>${expCats[k]||k}</td><td>${mExp.filter(e=>e.category===k).length}</td><td style="font-weight:bold;color:#c4342d">₹${v.toLocaleString("en-IN")}</td></tr>`).join("")}<tr style="background:#f5f5f5"><td><b>Total</b></td><td><b>${mExp.length}</b></td><td><b>₹${mTE.toLocaleString("en-IN")}</b></td></tr></table>
  ${mSal.length>0?`<table><tr><td colspan="4" class="section">SALARIES PAID</td></tr><tr><th>Employee</th><th>Month</th><th>Net</th><th>Mode</th></tr>${mSal.map(s=>`<tr><td>${s.staff?.profiles?.full_name||""}</td><td>${s.month}</td><td>₹${Number(s.net_amount||s.amount).toLocaleString("en-IN")}</td><td>${s.payment_mode}</td></tr>`).join("")}</table>`:""}
  <div style="text-align:center;font-size:10px;color:#999;margin-top:20px">Generated on ${new Date().toLocaleDateString("en-IN")} | My Career Academic</div></body></html>`);w.document.close();w.print();};

  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <div><h1 className="page-title">Accounts & Finance</h1></div>
        <div style={{display:"flex",gap:8}}>{["overview","income","expenses","salary"].map(v=><button key={v} className={`tag ${view===v?"active":""}`} onClick={()=>setView(v)}>{v.charAt(0).toUpperCase()+v.slice(1)}</button>)}</div>
      </div>
      {msg&&<div className="success-box" style={{marginBottom:12}}>{msg}</div>}

      {view==="overview"&&(<div>
        <div className="grid-4" style={{marginBottom:20}}>
          <StatCard title="Total Income" value={fmtMoney(totalIncome)} variant="success"/>
          <StatCard title="Total Expenses" value={fmtMoney(totalExpense)} variant="danger"/>
          <StatCard title="Salaries Paid" value={fmtMoney(totalSalary)} variant="warning"/>
          <StatCard title={profit>=0?"Profit":"Loss"} value={fmtMoney(Math.abs(profit))} variant={profit>=0?"success":"danger"}/>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <h3 style={{fontSize:15,fontWeight:700}}>Overview</h3>
          <button className="btn" onClick={printMonthlyReport}>📊 Monthly Report</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
          <div className="card"><h3 style={{fontSize:14,fontWeight:700,marginBottom:10,color:"var(--success)"}}>Recent Income</h3>
            {incomes.slice(0,8).map(i=>(<div key={i.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:"1px solid var(--border)",fontSize:13}}>
              <div><span className="badge badge-success">{incCats[i.category]||i.category}</span><span style={{color:"var(--muted)",marginLeft:4,fontSize:12}}>{i.description||""}</span></div>
              <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontWeight:700,color:"var(--success)"}}>+{fmtMoney(i.amount)}</span><button style={{background:"none",border:"none",cursor:"pointer",fontSize:12,color:"var(--primary)"}} onClick={()=>printReceipt("income",i)}>🖨</button></div>
            </div>))}
          </div>
          <div className="card"><h3 style={{fontSize:14,fontWeight:700,marginBottom:10,color:"var(--danger)"}}>Recent Expenses</h3>
            {expenses.slice(0,8).map(e=>(<div key={e.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:"1px solid var(--border)",fontSize:13}}>
              <div><span className="badge badge-danger">{expCats[e.category]||e.category}</span><span style={{color:"var(--muted)",marginLeft:4,fontSize:12}}>{e.paid_to||e.description||""}</span></div>
              <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontWeight:700,color:"var(--danger)"}}>-{fmtMoney(e.amount)}</span><button style={{background:"none",border:"none",cursor:"pointer",fontSize:12,color:"var(--primary)"}} onClick={()=>printReceipt("expense",e)}>🖨</button></div>
            </div>))}
          </div>
        </div>
      </div>)}

      {view==="income"&&(<div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}><h3 style={{fontSize:15,fontWeight:700}}>Income Records</h3><button className="btn btn-success" onClick={()=>setShowIncForm(!showIncForm)}>+ Add Income</button></div>
        {showIncForm&&(<div className="card" style={{marginBottom:14,borderColor:"var(--success)"}}>
          <div className="grid-3"><div><label className="label">Category</label><select className="select" value={incForm.category} onChange={e=>setIncForm({...incForm,category:e.target.value})}>{Object.entries(incCats).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></div><div><label className="label">Amount (₹) *</label><input className="input" type="number" value={incForm.amount} onChange={e=>setIncForm({...incForm,amount:e.target.value})}/></div><div><label className="label">Date</label><input className="input" type="date" value={incForm.incomeDate} onChange={e=>setIncForm({...incForm,incomeDate:e.target.value})}/></div></div>
          <div className="grid-2" style={{marginTop:10}}><div><label className="label">Description</label><input className="input" value={incForm.description} onChange={e=>setIncForm({...incForm,description:e.target.value})}/></div><div><label className="label">Mode</label><select className="select" value={incForm.paymentMode} onChange={e=>setIncForm({...incForm,paymentMode:e.target.value})}><option value="cash">Cash</option><option value="upi">UPI</option><option value="bank_transfer">Bank</option><option value="cheque">Cheque</option></select></div></div>
          <button className="btn btn-success" style={{marginTop:12}} onClick={addIncome}>Save Income</button>
        </div>)}
        <div className="card">{incomes.length===0?<p className="empty-state">No income records.</p>:<table><thead><tr><th>Date</th><th>Category</th><th>Amount</th><th>Description</th><th>Mode</th><th></th></tr></thead><tbody>{incomes.map(i=>(<tr key={i.id}><td>{fmtDate(i.income_date)}</td><td><span className="badge badge-success">{incCats[i.category]||i.category}</span></td><td style={{fontWeight:700,color:"var(--success)"}}>{fmtMoney(i.amount)}</td><td>{i.description||"-"}</td><td>{i.payment_mode}</td><td><button className="btn-outline" style={{fontSize:11,padding:"3px 8px"}} onClick={()=>printReceipt("income",i)}>Print</button></td></tr>))}</tbody></table>}</div>
      </div>)}

      {view==="expenses"&&(<div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}><h3 style={{fontSize:15,fontWeight:700}}>Expense Records</h3><button className="btn btn-danger" onClick={()=>setShowExpForm(!showExpForm)}>+ Add Expense</button></div>
        {showExpForm&&(<div className="card" style={{marginBottom:14,borderColor:"var(--danger)"}}>
          <div className="grid-3"><div><label className="label">Category</label><select className="select" value={expForm.category} onChange={e=>setExpForm({...expForm,category:e.target.value})}>{Object.entries(expCats).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></div><div><label className="label">Amount (₹) *</label><input className="input" type="number" value={expForm.amount} onChange={e=>setExpForm({...expForm,amount:e.target.value})}/></div><div><label className="label">Date</label><input className="input" type="date" value={expForm.expenseDate} onChange={e=>setExpForm({...expForm,expenseDate:e.target.value})}/></div></div>
          <div className="grid-3" style={{marginTop:10}}><div><label className="label">Paid To</label><input className="input" value={expForm.paidTo} onChange={e=>setExpForm({...expForm,paidTo:e.target.value})}/></div><div><label className="label">Description</label><input className="input" value={expForm.description} onChange={e=>setExpForm({...expForm,description:e.target.value})}/></div><div><label className="label">Mode</label><select className="select" value={expForm.paymentMode} onChange={e=>setExpForm({...expForm,paymentMode:e.target.value})}><option value="cash">Cash</option><option value="upi">UPI</option><option value="bank_transfer">Bank</option><option value="cheque">Cheque</option></select></div></div>
          <button className="btn btn-danger" style={{marginTop:12}} onClick={addExpense}>Save Expense</button>
        </div>)}
        <div className="card">{expenses.length===0?<p className="empty-state">No expenses.</p>:<table><thead><tr><th>Date</th><th>Category</th><th>Amount</th><th>Paid To</th><th>Mode</th><th></th></tr></thead><tbody>{expenses.map(e=>(<tr key={e.id}><td>{fmtDate(e.expense_date)}</td><td><span className="badge badge-danger">{expCats[e.category]||e.category}</span></td><td style={{fontWeight:700,color:"var(--danger)"}}>{fmtMoney(e.amount)}</td><td>{e.paid_to||"-"}</td><td>{e.payment_mode}</td><td><button className="btn-outline" style={{fontSize:11,padding:"3px 8px"}} onClick={()=>printReceipt("expense",e)}>Print</button></td></tr>))}</tbody></table>}</div>
      </div>)}

      {view==="salary"&&(<div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}><h3 style={{fontSize:15,fontWeight:700}}>Salary Payments</h3><button className="btn btn-accent" onClick={()=>setShowSalForm(!showSalForm)}>+ Pay Salary</button></div>
        {showSalForm&&(<div className="card" style={{marginBottom:14,borderColor:"var(--accent)"}}>
          <div className="grid-3"><div><label className="label">Staff *</label><select className="select" value={salForm.staffId} onChange={e=>setSalForm({...salForm,staffId:e.target.value})}><option value="">Select</option>{staffList.map(s=><option key={s.id} value={s.id}>{s.profiles?.full_name}</option>)}</select></div><div><label className="label">Base Amount (₹) *</label><input className="input" type="number" value={salForm.amount} onChange={e=>setSalForm({...salForm,amount:e.target.value})}/></div><div><label className="label">Month *</label><input className="input" value={salForm.month} onChange={e=>setSalForm({...salForm,month:e.target.value})} placeholder="May 2026"/></div></div>
          <div className="grid-3" style={{marginTop:10}}><div><label className="label">Deductions</label><input className="input" type="number" value={salForm.deductions} onChange={e=>setSalForm({...salForm,deductions:e.target.value})}/></div><div><label className="label">Bonus</label><input className="input" type="number" value={salForm.bonus} onChange={e=>setSalForm({...salForm,bonus:e.target.value})}/></div><div><label className="label">Net: {fmtMoney(Number(salForm.amount||0)-Number(salForm.deductions||0)+Number(salForm.bonus||0))}</label><select className="select" value={salForm.paymentMode} onChange={e=>setSalForm({...salForm,paymentMode:e.target.value})}><option value="bank_transfer">Bank</option><option value="cash">Cash</option><option value="upi">UPI</option><option value="cheque">Cheque</option></select></div></div>
          <button className="btn btn-success" style={{marginTop:12}} onClick={addSalary}>Pay Salary</button>
        </div>)}
        <div className="card">{salaries.length===0?<p className="empty-state">No salary records.</p>:<table><thead><tr><th>Staff</th><th>Month</th><th>Base</th><th>Deductions</th><th>Bonus</th><th>Net Paid</th><th>Mode</th><th></th></tr></thead><tbody>{salaries.map(s=>(<tr key={s.id}><td style={{fontWeight:600}}>{s.staff?.profiles?.full_name}</td><td>{s.month}</td><td>{fmtMoney(s.amount)}</td><td style={{color:"var(--danger)"}}>-{fmtMoney(s.deductions||0)}</td><td style={{color:"var(--success)"}}>+{fmtMoney(s.bonus||0)}</td><td style={{fontWeight:700}}>{fmtMoney(s.net_amount||s.amount)}</td><td>{s.payment_mode}</td><td><button className="btn-outline" style={{fontSize:11,padding:"3px 8px"}} onClick={()=>printSalarySlip(s)}>Slip</button></td></tr>))}</tbody></table>}</div>
      </div>)}
    </div>
  );
}

// ─── GUARDIANS ────────────────────────────────────────────────────────────────
function GuardiansTab() {
  const [students,setStudents]=useState([]);const [selStudent,setSelStudent]=useState(null);const [guardians,setGuardians]=useState([]);
  const [showForm,setShowForm]=useState(false);const [form,setForm]=useState({fullName:"",email:"",phone:"",relation:"",occupation:""});
  const [loading,setLoading]=useState(false);const [msg,setMsg]=useState("");
  useEffect(()=>{supabase.from("students").select("*, profiles!inner(full_name)").eq("status","active").then(({data})=>setStudents(data||[]));  },[]);
  const loadGuardians=async(student)=>{setSelStudent(student);setShowForm(false);setMsg("");const {data}=await supabase.from("student_guardians").select("*, guardians!inner(*, profiles!inner(full_name,phone,email))").eq("student_id",student.id);setGuardians(data||[]);};
  const addGuardian=async()=>{if(!form.fullName||!form.email)return;setLoading(true);setMsg("");
    try{const tempPass="Guardian@"+Date.now().toString().slice(-6);const userId=await createUserSafely(form.email,tempPass,form.fullName,"guardian",form.phone);const {data:gData,error:gErr}=await supabase.from("guardians").insert({profile_id:userId,relation:form.relation||null,occupation:form.occupation||null}).select().single();if(gErr)throw gErr;await supabase.from("student_guardians").insert({student_id:selStudent.id,guardian_id:gData.id,is_primary:guardians.length===0});setMsg("Guardian added! Password: "+tempPass);setForm({fullName:"",email:"",phone:"",relation:"",occupation:""});setShowForm(false);loadGuardians(selStudent);}catch(e){setMsg("Error: "+e.message);}
    setLoading(false);};
  const removeLink=async(sgId)=>{await supabase.from("student_guardians").delete().eq("id",sgId);loadGuardians(selStudent);};
  const setPrimary=async(sgId)=>{for(const g of guardians){await supabase.from("student_guardians").update({is_primary:g.id===sgId}).eq("id",g.id);}loadGuardians(selStudent);};
  return(
    <div><h1 className="page-title">Guardian Management</h1>
      <div style={{display:"flex",gap:20}}>
        <div style={{width:260,flexShrink:0}}><div className="card" style={{maxHeight:500,overflowY:"auto"}}><h3 style={{fontSize:13,fontWeight:700,marginBottom:12,color:"var(--muted)"}}>Select Student</h3>{students.map(st=><div key={st.id} className={`student-item ${selStudent?.id===st.id?"active":""}`} onClick={()=>loadGuardians(st)}>{st.profiles?.full_name}</div>)}</div></div>
        <div style={{flex:1}}>
          {!selStudent?<div className="card empty-state">Select a student</div>:(
            <div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}><h3 style={{fontSize:15,fontWeight:700}}>Guardians of {selStudent.profiles?.full_name}</h3><button className="btn btn-accent" onClick={()=>setShowForm(!showForm)}>+ Add Guardian</button></div>
              {msg&&<div className={msg.startsWith("Error")?"error-box":"success-box"}>{msg}</div>}
              {showForm&&(<div className="card" style={{marginBottom:14,borderColor:"var(--accent)"}}>
                <div className="grid-3"><div><label className="label">Name *</label><input className="input" value={form.fullName} onChange={e=>setForm({...form,fullName:e.target.value})}/></div><div><label className="label">Email *</label><input className="input" type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></div><div><label className="label">Phone</label><input className="input" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/></div></div>
                <div className="grid-2" style={{marginTop:10}}><div><label className="label">Relation</label><select className="select" value={form.relation} onChange={e=>setForm({...form,relation:e.target.value})}><option value="">Select</option><option value="father">Father</option><option value="mother">Mother</option><option value="guardian">Guardian</option><option value="sibling">Sibling</option><option value="other">Other</option></select></div><div><label className="label">Occupation</label><input className="input" value={form.occupation} onChange={e=>setForm({...form,occupation:e.target.value})}/></div></div>
                <button className="btn btn-success" style={{marginTop:12}} onClick={addGuardian} disabled={loading}>{loading?"Adding…":"Save Guardian"}</button>
              </div>)}
              {guardians.length===0?<div className="card empty-state">No guardians linked yet.</div>:guardians.map(sg=>(<div key={sg.id} className="card" style={{marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div><div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontWeight:700,fontSize:14}}>{sg.guardians?.profiles?.full_name}</span>{sg.is_primary&&<span className="badge badge-success">Primary</span>}{sg.guardians?.relation&&<span className="badge badge-primary">{sg.guardians.relation}</span>}</div><div style={{fontSize:12,color:"var(--muted)",marginTop:3}}>{sg.guardians?.profiles?.phone||"No phone"} · {sg.guardians?.profiles?.email||""}{sg.guardians?.occupation?` · ${sg.guardians.occupation}`:""}</div></div>
                  <div style={{display:"flex",gap:6}}>{!sg.is_primary&&<button className="btn-outline" style={{fontSize:12,padding:"5px 10px"}} onClick={()=>setPrimary(sg.id)}>Set Primary</button>}<button style={{background:"none",border:"none",color:"var(--danger)",cursor:"pointer",fontSize:12,fontWeight:600}} onClick={()=>removeLink(sg.id)}>Remove</button></div>
                </div>
              </div>))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── STAFF ────────────────────────────────────────────────────────────────────
function StaffTab() {
  const [staffList,setStaffList]=useState([]);const [showForm,setShowForm]=useState(false);const [form,setForm]=useState({fullName:"",email:"",phone:"",designation:"",specialization:"",salary:""});const [loading,setLoading]=useState(false);const [msg,setMsg]=useState("");
  const load=()=>supabase.from("staff").select("*, profiles!inner(full_name,phone,email)").then(({data})=>setStaffList(data||[]));
  useEffect(()=>{load();},[]);
  const add=async()=>{if(!form.fullName||!form.email)return;setLoading(true);try{const tempPass="Staff@"+Date.now().toString().slice(-6);const userId=await createUserSafely(form.email,tempPass,form.fullName,"teacher",form.phone);await supabase.from("staff").insert({profile_id:userId,designation:form.designation||null,subject_specialization:form.specialization||null,salary:form.salary?Number(form.salary):null});setMsg("Added! Password: "+tempPass);setShowForm(false);setForm({fullName:"",email:"",phone:"",designation:"",specialization:"",salary:""});load();}catch(e){setMsg(e.message);}setLoading(false);};
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}><div><h1 className="page-title">Staff Management</h1><p style={{fontSize:13,color:"var(--muted)"}}>{staffList.length} members</p></div><button className="btn btn-accent" onClick={()=>setShowForm(!showForm)}>+ Add Staff</button></div>
      {msg&&<div className="success-box">{msg}</div>}
      {showForm&&(<div className="card" style={{marginBottom:16,borderColor:"var(--accent)"}}><div className="grid-3"><div><label className="label">Name *</label><input className="input" value={form.fullName} onChange={e=>setForm({...form,fullName:e.target.value})}/></div><div><label className="label">Email *</label><input className="input" type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></div><div><label className="label">Phone</label><input className="input" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/></div></div><div className="grid-3" style={{marginTop:10}}><div><label className="label">Designation</label><input className="input" value={form.designation} onChange={e=>setForm({...form,designation:e.target.value})}/></div><div><label className="label">Subject</label><input className="input" value={form.specialization} onChange={e=>setForm({...form,specialization:e.target.value})}/></div><div><label className="label">Salary</label><input className="input" type="number" value={form.salary} onChange={e=>setForm({...form,salary:e.target.value})}/></div></div><button className="btn btn-success" style={{marginTop:12}} onClick={add} disabled={loading}>{loading?"…":"Save Staff"}</button></div>)}
      <div className="card">{staffList.length===0?<p className="empty-state">No staff.</p>:<table><thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Designation</th><th>Subject</th><th>Salary</th></tr></thead><tbody>{staffList.map(st=>(<tr key={st.id}><td style={{fontWeight:600}}>{st.profiles?.full_name}</td><td style={{fontSize:12}}>{st.profiles?.email}</td><td>{st.profiles?.phone||"-"}</td><td>{st.designation||"-"}</td><td><span className="badge badge-primary">{st.subject_specialization||"-"}</span></td><td>{st.salary?fmtMoney(st.salary):"-"}</td></tr>))}</tbody></table>}</div>
    </div>
  );
}

// ─── NOTICES ─────────────────────────────────────────────────────────────────
function NoticesTab({ profile }) {
  const [notices,setNotices]=useState([]);const [showForm,setShowForm]=useState(false);const [form,setForm]=useState({title:"",body:"",targetRole:""});const [loading,setLoading]=useState(false);
  const isAdmin=profile?.role==="admin";
  const loadNotices=async()=>{const {data}=await supabase.from("notifications").select("*").order("created_at",{ascending:false}).limit(50);setNotices(data||[]);};
  useEffect(()=>{loadNotices();},[]);
  const send=async()=>{if(!form.title)return;setLoading(true);await supabase.from("notifications").insert({title:form.title,body:form.body||null,target_role:form.targetRole||null});setForm({title:"",body:"",targetRole:""});setShowForm(false);setLoading(false);loadNotices();};
  const deleteNotice=async(id)=>{await supabase.from("notifications").delete().eq("id",id);loadNotices();};
  const markRead=async(id)=>{await supabase.from("notifications").update({is_read:true}).eq("id",id);loadNotices();};
  const myNotices=notices.filter(n=>!n.target_role||n.target_role===profile?.role);
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <div><h1 className="page-title">Notices & Announcements</h1><p className="page-sub" style={{marginBottom:0}}>{myNotices.filter(n=>!n.is_read).length} unread</p></div>
        {isAdmin&&<button className="btn btn-accent" onClick={()=>setShowForm(!showForm)}>+ New Notice</button>}
      </div>
      {showForm&&(<div className="card" style={{marginBottom:16,borderColor:"var(--accent)"}}>
        <div className="form-group"><label className="label">Title *</label><input className="input" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Exam schedule update"/></div>
        <div className="form-group"><label className="label">Message</label><textarea className="input" rows={3} value={form.body} onChange={e=>setForm({...form,body:e.target.value})} style={{resize:"vertical"}}/></div>
        <div className="form-group"><label className="label">Send To</label>
          <select className="select" value={form.targetRole} onChange={e=>setForm({...form,targetRole:e.target.value})}>
            <option value="">Everyone</option><option value="student">Students only</option><option value="teacher">Teachers only</option><option value="guardian">Parents/Guardians only</option><option value="staff">Staff only</option>
          </select>
        </div>
        <button className="btn btn-success" onClick={send} disabled={loading}>{loading?"Sending…":"Send Notice"}</button>
      </div>)}
      {myNotices.length===0?<div className="card empty-state">No notices yet.</div>:myNotices.map(n=>(
        <div key={n.id} className="card" style={{marginBottom:10,borderLeft:n.is_read?"4px solid var(--border)":"4px solid var(--primary)",opacity:n.is_read?0.7:1}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div style={{flex:1}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                <span style={{fontWeight:700,fontSize:14}}>{n.title}</span>
                {!n.is_read&&<span className="badge badge-primary">New</span>}
                {n.target_role&&<span className="badge badge-muted">{n.target_role}</span>}
              </div>
              {n.body&&<p style={{fontSize:13,color:"var(--muted)",lineHeight:1.5}}>{n.body}</p>}
              <p style={{fontSize:11,color:"var(--muted)",marginTop:6}}>{new Date(n.created_at).toLocaleString("en-IN")}</p>
            </div>
            <div style={{display:"flex",gap:6}}>
              {!n.is_read&&<button className="btn-outline" style={{fontSize:11,padding:"4px 10px"}} onClick={()=>markRead(n.id)}>Mark Read</button>}
              {isAdmin&&<button style={{background:"none",border:"none",color:"var(--danger)",cursor:"pointer",fontSize:11}} onClick={()=>deleteNotice(n.id)}>Del</button>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── PROGRESS ─────────────────────────────────────────────────────────────────
function ProgressTab({ profile }) {
  const [subjects,setSubjects]=useState([]);const [chapters,setChapters]=useState([]);const [selSub,setSelSub]=useState("");const [progress,setProgress]=useState({});
  const [studentId,setStudentId]=useState(null);
  const isStudent=profile?.role==="student";
  useEffect(()=>{
    (async()=>{
      if(isStudent){const {data:st}=await supabase.from("students").select("id,course_id").eq("profile_id",profile?.id).single();if(st){setStudentId(st.id);const {data:subs}=await supabase.from("subjects").select("*, courses(name)").eq("course_id",st.course_id);setSubjects(subs||[]);}}
      else{const {data}=await supabase.from("subjects").select("*, courses(name)");setSubjects(data||[]);}
    })();
  },[profile,isStudent]);
  useEffect(()=>{
    if(!selSub)return;
    (async()=>{
      const {data:ch}=await supabase.from("chapters").select("*").eq("subject_id",selSub).order("sort_order");setChapters(ch||[]);
      if(studentId){const {data:prog}=await supabase.from("chapter_progress").select("*").eq("student_id",studentId).eq("is_completed",true);const map={};(prog||[]).forEach(p=>{map[p.chapter_id]=true;});setProgress(map);}
    })();
  },[selSub,studentId]);
  const toggleChapter=async(chId)=>{if(!studentId)return;if(progress[chId]){await supabase.from("chapter_progress").delete().eq("student_id",studentId).eq("chapter_id",chId);}else{await supabase.from("chapter_progress").upsert({student_id:studentId,chapter_id:chId,is_completed:true,completed_at:new Date().toISOString()},{onConflict:"student_id,chapter_id"});}setProgress({...progress,[chId]:!progress[chId]});};
  const doneCount=chapters.filter(ch=>progress[ch.id]).length;
  return(
    <div><h1 className="page-title">Syllabus Progress</h1>
      <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>{subjects.map(s=><button key={s.id} className={`tag ${selSub===s.id?"active":""}`} onClick={()=>setSelSub(s.id)}>{s.name}{s.courses?.name?` (${s.courses.name})`:""}</button>)}</div>
      {selSub&&(<div className="card">
        {chapters.length>0&&<div style={{marginBottom:12}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
          <span style={{fontSize:13,fontWeight:600}}>{doneCount}/{chapters.length} chapters complete</span>
          <span style={{fontSize:13,color:"var(--success)",fontWeight:700}}>{chapters.length>0?Math.round((doneCount/chapters.length)*100):0}%</span>
        </div>
        <div style={{height:6,background:"var(--border)",borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",width:`${chapters.length>0?Math.round((doneCount/chapters.length)*100):0}%`,background:"var(--success)",borderRadius:3,transition:"width .3s"}}/></div></div>}
        {chapters.length===0?<p style={{color:"var(--muted)"}}>No chapters.</p>:<table><thead><tr><th>#</th><th>Chapter</th><th>Status</th></tr></thead><tbody>{chapters.map((ch,i)=>(<tr key={ch.id}><td>{i+1}</td><td style={{fontWeight:500}}>{ch.name}</td><td>
          {isStudent?<button onClick={()=>toggleChapter(ch.id)} style={{background:progress[ch.id]?"var(--success)":"var(--bg)",color:progress[ch.id]?"#fff":"var(--muted)",border:`1px solid ${progress[ch.id]?"var(--success)":"var(--border)"}`,borderRadius:6,padding:"4px 12px",cursor:"pointer",fontSize:12,fontWeight:600}}>{progress[ch.id]?"✓ Done":"Pending"}</button>:
          <span className={`badge ${progress[ch.id]?"badge-success":"badge-muted"}`}>{progress[ch.id]?"Done":"Pending"}</span>}
        </td></tr>))}</tbody></table>}
      </div>)}
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function Home() {
  const [session,setSession]=useState(null);const [profile,setProfile]=useState(null);const [activeTab,setActiveTab]=useState("Dashboard");const [checking,setChecking]=useState(true);const [detailStudent,setDetailStudent]=useState(null);const [notifications,setNotifications]=useState([]);const [sidebarOpen,setSidebarOpen]=useState(true);

  useEffect(()=>{
    supabase.auth.getSession().then(({data:{session:s}})=>{setSession(s);if(s)loadProfile(s.user.id,s.access_token);setChecking(false);});
    const {data:{subscription}}=supabase.auth.onAuthStateChange((_e,s)=>{setSession(s);if(s)loadProfile(s.user.id,s.access_token);});
    return()=>subscription.unsubscribe();
  },[]);

  useEffect(()=>{if(profile){supabase.from("notifications").select("*").order("created_at",{ascending:false}).limit(50).then(({data})=>setNotifications(data||[]));}},[profile]);

  const loadProfile=async(uid,token)=>{const data=await fetchProfileDirect(uid,token);setProfile(data);};
  const login=async()=>{const {data:{session:s}}=await supabase.auth.getSession();setSession(s);if(s)loadProfile(s.user.id,s.access_token);};
  const logout=async()=>{await supabase.auth.signOut();setSession(null);setProfile(null);setActiveTab("Dashboard");};
  const navigate=(tab,data)=>{if(tab==="StudentDetail"){setDetailStudent(data);setActiveTab("StudentDetail");}else{setActiveTab(tab);setDetailStudent(null);}};

  if(checking)return(<div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'DM Sans',sans-serif"}}>Loading…</div>);
  if(!session)return<LoginScreen onLogin={login}/>;

  const role=profile?.role||"student";
  const tabs=TABS[role]||TABS.student;
  const unreadCount=(notifications||[]).filter(n=>!n.is_read&&(!n.target_role||n.target_role===role)).length;

  const renderTab=()=>{
    if(activeTab==="StudentDetail")return<StudentDetailTab student={detailStudent} onBack={()=>{setActiveTab("Students");setDetailStudent(null);}}/>;
    switch(activeTab){
      case "Dashboard":return<DashboardTab profile={profile} onNavigate={navigate} notifications={notifications}/>;
      case "Students":return<StudentsTab onNavigate={navigate}/>;
      case "Admission":return<AdmissionTab/>;
      case "Enquiry":return<EnquiryTab/>;
      case "Courses":return<CoursesTab/>;
      case "Timetable":return<TimetableTab profile={profile}/>;
      case "Live Classes":return<LiveClassesTab profile={profile}/>;
      case "Attendance":return<AttendanceTab/>;
      case "Fees":return<FeesTab profile={profile}/>;
      case "Tests":return<TestsTab/>;
      case "Hostel":return<HostelTab/>;
      case "Accounts":return<AccountsTab/>;
      case "Guardians":return<GuardiansTab/>;
      case "Staff":return<StaffTab/>;
      case "Notices":return<NoticesTab profile={profile}/>;
      case "Progress":return<ProgressTab profile={profile}/>;
      default:return<DashboardTab profile={profile} onNavigate={navigate} notifications={notifications}/>;
    }
  };

  return(
    <div>
      <div className="sidebar">
        <div className="sidebar-header">
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <img src={MCA_LOGO} style={{height:32,width:32,borderRadius:6,background:"white",padding:2}} alt="MCA"/>
            <div>
              <h1 style={{fontSize:14,fontWeight:700,letterSpacing:"-0.3px",lineHeight:1.2}}>My Career Academic</h1>
              <div style={{fontSize:10,opacity:0.5,marginTop:2}}>Coaching Management</div>
            </div>
          </div>
        </div>
        <div style={{padding:"8px 0",flex:1,overflowY:"auto"}}>
          {tabs.map(tab=>(
            <div key={tab} className={`nav-item ${activeTab===tab||activeTab==="StudentDetail"&&tab==="Students"?"active":""}`} onClick={()=>navigate(tab)}>
              <span style={{fontSize:13,width:18,textAlign:"center"}}>{TAB_ICONS[tab]||"◉"}</span>
              <span style={{flex:1}}>{tab}</span>
              {tab==="Notices"&&unreadCount>0&&<span style={{background:"var(--danger)",color:"#fff",borderRadius:10,padding:"1px 7px",fontSize:10,fontWeight:700}}>{unreadCount}</span>}
            </div>
          ))}
        </div>
        <div style={{padding:"12px 16px",borderTop:"1px solid rgba(255,255,255,0.12)"}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
            <div style={{width:28,height:28,borderRadius:"50%",background:"rgba(255,255,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700}}>
              {(profile?.full_name||"U")[0].toUpperCase()}
            </div>
            <div>
              <div style={{fontSize:12,fontWeight:600}}>{profile?.full_name||"User"}</div>
              <div style={{fontSize:10,opacity:0.5}}>{role.toUpperCase()}</div>
            </div>
          </div>
          <div onClick={logout} style={{fontSize:11,opacity:0.6,cursor:"pointer",paddingTop:4,borderTop:"1px solid rgba(255,255,255,0.1)"}}>↩ Logout</div>
        </div>
      </div>
      <div className="main">{renderTab()}</div>
    </div>
  );
}
