"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../lib/supabase";

// ── Mobile detection hook ──────────────────────────────────
function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= breakpoint);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [breakpoint]);
  return isMobile;
}

const SUPABASE_URL = "https://sxqddwpszfumcwxtmxsk.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4cWRkd3BzemZ1bWN3eHRteHNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2NzMyMTIsImV4cCI6MjA5MjI0OTIxMn0.N-6xZneRahpcpGZVjdSlsb1_gHsWiBTvYm2LNqStF_Q";

const MCA_LOGO = "data:image/png;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDAAUDBAQEAwUEBAQFBQUGBwwIBwcHBw8LCwkMEQ8SEhEPERETFhwXExQaFRERGCEYGh0dHx8fExciJCIeJBweHx7/2wBDAQUFBQcGBw4ICA4eFBEUHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCAQABgADASIAAhEBAxEB/8QAHQABAAAHAQEAAAAAAAAAAAAAAAECAwQFBgcICf/EAFAQAAIBAwIDBAUIBwUGBAYCAwABAgMEEQUhBhIxB0FRYRMicYGRFCMyQlKhscEIFWJygtHwJDOSouEWNENjssJEU3PxJTVUg5PSdKNVZLP/xAAcAQEBAAIDAQEAAAAAAAAAAAAAAQUGAgMEBwj/xAA7EQEAAgECBAMFBwQABQUBAAAAAQIDBBEFEiExE0FRBiJhcaEygZGxwdHwFCNC4RUWQ1JyM2KCotLi/9oADAMBAAIRAxEAPwDxkAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf/Z";

const DAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const DAYS_SHORT = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

// Role-based tab access
const TABS = {
  admin:   ["Dashboard","Students","Admission","Courses","Timetable","Live Classes","Attendance","Fees","Tests","Hostel","Accounts","Guardians","Staff","Notices","Users"],
  teacher: ["Dashboard","My Classes","Live Classes","Attendance","Tests","Notices"],
  staff:   ["Dashboard","Students","Live Classes","Attendance","Hostel","Notices"],
  helper:  ["Dashboard","Hostel","Notices"],
  cooker:  ["Dashboard","Notices"],
  cleaner: ["Dashboard","Notices"],
  student: ["Dashboard","My Classes","Attendance","Fees","Progress","Notices"],
  guardian:["Dashboard","My Classes","Attendance","Fees","Progress","Notices"],
};

const TAB_ICONS = {
  Users:"👤",
  Dashboard:"◫", Students:"☺", Admission:"✚", Courses:"◈",
  Timetable:"▦", "Live Classes":"▶", "My Classes":"▦", Attendance:"✔", Fees:"₹",
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

// ── Helper: Get student record for any role (student or guardian) ──
async function getStudentForProfile(profileId, role) {
  if (role === "guardian") {
    const { data: gData } = await supabase.from("guardians")
      .select("id").eq("profile_id", profileId).single();
    if (!gData) return null;
    const { data: sgData } = await supabase.from("student_guardians")
      .select("student_id").eq("guardian_id", gData.id).limit(1).single();
    if (!sgData) return null;
    const { data: st } = await supabase.from("students")
      .select("*, courses(name, id), profiles!inner(full_name, phone)")
      .eq("id", sgData.student_id).single();
    return st;
  } else {
    const { data: st } = await supabase.from("students")
      .select("*, courses(name, id), profiles!inner(full_name, phone)")
      .eq("profile_id", profileId).single();
    return st;
  }
}

// ══════════════════════════════════════════════════════════════
// SIMPLIFIED LOGIN SYSTEM
// ══════════════════════════════════════════════════════════════
// RULES:
// 1. Admin/Staff/Teacher → Login with EMAIL + password
// 2. Student/Guardian → Login with PHONE NUMBER + password (MCA@last6digits)
// 3. Internal email format: phone@mca.local (never shown to user)
// 4. Admission number (MCA-XXXX) also works for students
// ══════════════════════════════════════════════════════════════

function makePasswordFromPhone(phone) {
  const clean = phone.replace(/[^0-9]/g, "");
  return "MCA@" + clean.slice(-6);
}

function makeInternalEmail(phone) {
  const clean = phone.replace(/[^0-9]/g, "");
  return clean + "@mca.local";
}

// ========== LOGIN ==========
function LoginScreen({ onLogin }) {
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const handleLogin = async () => {
    if (!loginId || !password) { 
      setError("Login ID aur Password dono daalo."); 
      return; 
    }
    setLoading(true); setError("");
    
    try {
      const trimmed = loginId.trim().replace(/\s/g, "");
      
      // ── CASE 1: Email login (admin/staff/teacher) ──
      if (trimmed.includes("@") && !trimmed.endsWith("@mca.local")) {
        const { error: err } = await supabase.auth.signInWithPassword({ 
          email: trimmed, password 
        });
        if (err) throw new Error("Email ya password galat hai.");
        onLogin(); setLoading(false); return;
      }
      
      // ── CASE 2: Admission number (MCA-XXXX) ──
      if (trimmed.toUpperCase().startsWith("MCA")) {
        // Find student by admission number, get their phone, login with phone@mca.local
        const { data: st } = await supabase.from("students")
          .select("profiles!inner(phone)")
          .eq("admission_number", trimmed.toUpperCase()).single();
        const phone = st?.profiles?.phone;
        if (!phone) { 
          setError("Admission number nahi mila. Apna mobile number try karo."); 
          setLoading(false); return; 
        }
        const email = makeInternalEmail(phone);
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw new Error("Password galat hai. Try: MCA@" + phone.slice(-6));
        onLogin(); setLoading(false); return;
      }
      
      // ── CASE 3: 10-digit phone number (students & guardians) ──
      if (/^\d{10}$/.test(trimmed)) {
        const email = makeInternalEmail(trimmed);
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (!err) { onLogin(); setLoading(false); return; }
        
        // Login failed — give helpful error
        const expectedPass = makePasswordFromPhone(trimmed);
        if (password !== expectedPass) {
          setError(
            `Password galat hai!\n\n` +
            `✅ Sahi password: MCA@ + mobile ke last 6 digits\n` +
            `📱 Tumhara password hoga: ${expectedPass}\n\n` +
            `Kaam nahi kare to Admin se baat karo: 06727796700`
          );
        } else {
          setError(
            `Account nahi mila!\n\n` +
            `Ye mobile number (${trimmed}) register nahi hai.\n` +
            `Admission complete nahi hua hoga.\n\n` +
            `Admin se contact karo: 06727796700`
          );
        }
        setLoading(false); return;
      }
      
      // ── CASE 4: Invalid format ──
      setError("Galat format!\n\nEnter karo:\n• 10-digit mobile number (students/parents)\n• Email (staff/admin)");
      
    } catch (e) { 
      setError(e.message || "Login failed."); 
    }
    setLoading(false);
  };

  return (
    <div className="login-bg">
      <div className="login-card">
        <div style={{ textAlign:"center", marginBottom:28 }}>
          <img src={MCA_LOGO} alt="MCA Logo" style={{ width:80, height:80, borderRadius:16, objectFit:"contain", margin:"0 auto 14px", display:"block", border:"2px solid var(--border)", padding:6, background:"#fff" }} />
          <h1 style={{ fontSize:22, fontWeight:700, color:"var(--primary)" }}>My Career Academic</h1>
          <p style={{ fontSize:12, color:"var(--muted)", marginTop:4 }}>Coaching Center Management System</p>
        </div>

        {error && <div className="error-box" style={{ marginBottom:14, whiteSpace:"pre-line" }}>{error}</div>}

        <div className="form-group">
          <label className="label">Login ID</label>
          <input className="input" type="text" value={loginId}
            onChange={e => setLoginId(e.target.value)}
            placeholder="Mobile number / Email"
            onKeyDown={e => e.key === "Enter" && handleLogin()}
            autoComplete="username" autoFocus />
          <div style={{ fontSize:11, color:"var(--muted)", marginTop:4 }}>
            👨‍👩‍👧 Students/Parents: <b>mobile number</b> &nbsp;|&nbsp; 👨‍🏫 Staff/Admin: <b>email</b>
          </div>
        </div>

        <div className="form-group">
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
            <label className="label" style={{ margin:0 }}>Password</label>
            <button type="button" onClick={()=>setShowPassword(!showPassword)}
              style={{ background:"none", border:"none", fontSize:11, color:"var(--primary)", cursor:"pointer", padding:0 }}>
              {showPassword ? "🙈 Hide" : "👁 Show"}
            </button>
          </div>
          <input className="input" type={showPassword?"text":"password"} value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="MCA@last6digits (e.g. MCA@543210)"
            onKeyDown={e => e.key === "Enter" && handleLogin()}
            autoComplete="current-password" />
        </div>

        <button className="btn" style={{ width:"100%", padding:13, marginTop:8, fontSize:15, fontWeight:700 }}
          onClick={handleLogin} disabled={loading}>
          {loading ? "⏳ Signing in..." : "Sign In →"}
        </button>

        <div style={{ textAlign:"center", marginTop:16 }}>
          <button onClick={()=>setShowHelp(!showHelp)}
            style={{ background:"none", border:"none", color:"var(--primary)", cursor:"pointer", fontSize:12, fontWeight:600 }}>
            {showHelp ? "✕ Close help" : "🔑 Login me problem?"}
          </button>
        </div>

        {showHelp && (
          <div style={{ marginTop:12, padding:16, background:"var(--primary-light)", borderRadius:10, fontSize:12, lineHeight:2 }}>
            <div style={{ fontWeight:700, marginBottom:6, color:"var(--primary)" }}>Login Guide:</div>
            <div>👨‍👩‍👧 <b>Students / Parents:</b></div>
            <div style={{ paddingLeft:16, color:"var(--muted)" }}>Login ID = Apna Mobile number (10 digits)</div>
            <div style={{ paddingLeft:16, color:"var(--muted)" }}>Password = MCA@ + mobile ke last 6 digits</div>
            <div style={{ paddingLeft:16, color:"var(--muted)", fontSize:11 }}>Example: mobile 9876543210 → password MCA@543210</div>
            <div style={{ marginTop:8 }}>👨‍🏫 <b>Teachers / Staff / Admin:</b></div>
            <div style={{ paddingLeft:16, color:"var(--muted)" }}>Login ID = Admin ne jo email diya hai</div>
            <div style={{ marginTop:8 }}>🔒 <b>Password bhool gaye?</b> Admin se contact: <b>06727796700</b></div>
          </div>
        )}

        <div style={{ textAlign:"center", marginTop:24, fontSize:11, color:"var(--muted)" }}>
          My Career Academic — A Division of MY LIFELINE FOUNDATION
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, variant, subtitle, onClick }) {
  const bc = variant === "danger" ? "var(--danger)" : variant === "success" ? "var(--success)" : variant === "warning" ? "var(--warning)" : "var(--primary)";
  const bg = variant === "danger" ? "var(--danger-light)" : variant === "success" ? "var(--success-light)" : variant === "warning" ? "var(--warning-light)" : "var(--primary-light)";
  return (
    <div className="card" style={{ borderLeft: `4px solid ${bc}`, background: bg, cursor: onClick ? "pointer" : "default" }} onClick={onClick}>
      <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>{title}</div>
      <div style={{ fontSize: 28, fontWeight: 700, marginTop: 6, color: bc }}>{value}</div>
      {subtitle && <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>{subtitle}</div>}
    </div>
  );
}

function MiniProgress({ value, max, color }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  const c = color || (pct >= 75 ? "var(--success)" : pct >= 50 ? "var(--warning)" : "var(--danger)");
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, background: "var(--border)", borderRadius: 4, height: 8, overflow: "hidden", minWidth: 60 }}>
        <div style={{ width: `${pct}%`, height: "100%", background: c, borderRadius: 4, transition: "width 0.4s ease" }} />
      </div>
      <span style={{ fontSize: 13, fontWeight: 700, color: c, minWidth: 38, textAlign: "right" }}>{pct}%</span>
    </div>
  );
}

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

function PasswordChangeWidget({ profile }) {
  const [oldPwd, setOldPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);

  const changePassword = async () => {
    if (!oldPwd || !newPwd) { setMsg("❌ Current aur new password daalo."); return; }
    if (newPwd.length < 6) { setMsg("❌ Password kam se kam 6 characters ka hona chahiye."); return; }
    if (newPwd !== confirmPwd) { setMsg("❌ New passwords match nahi kar rahe."); return; }
    setLoading(true); setMsg("");
    try {
      const { data: user } = await supabase.auth.getUser();
      const email = user?.user?.email;
      const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password: oldPwd });
      if (signInErr) { setMsg("❌ Current password galat hai."); setLoading(false); return; }
      const { error: updateErr } = await supabase.auth.updateUser({ password: newPwd });
      if (updateErr) throw updateErr;
      setMsg("✅ Password change ho gaya!");
      setOldPwd(""); setNewPwd(""); setConfirmPwd("");
      setTimeout(() => setShow(false), 2000);
    } catch (e) { setMsg("❌ " + e.message); }
    setLoading(false);
  };

  return (
    <div className="card" style={{ marginTop:16 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <h3 style={{ fontSize:14, fontWeight:700 }}>🔐 Password Change</h3>
        <button className="btn-outline" style={{ fontSize:12 }} onClick={()=>setShow(!show)}>
          {show ? "Cancel" : "Change Password"}
        </button>
      </div>
      {show && (
        <div style={{ marginTop:14 }}>
          {msg && <div className={msg.startsWith("✅")?"success-box":"error-box"} style={{ marginBottom:10 }}>{msg}</div>}
          <div className="grid-3">
            <div><label className="label">Current Password</label><input className="input" type="password" value={oldPwd} onChange={e=>setOldPwd(e.target.value)} placeholder="Current password" /></div>
            <div><label className="label">New Password</label><input className="input" type="password" value={newPwd} onChange={e=>setNewPwd(e.target.value)} placeholder="Naya password (min 6 chars)" /></div>
            <div><label className="label">Confirm New Password</label><input className="input" type="password" value={confirmPwd} onChange={e=>setConfirmPwd(e.target.value)} placeholder="Confirm password" /></div>
          </div>
          <button className="btn btn-success" style={{ marginTop:12, fontSize:13 }} onClick={changePassword} disabled={loading}>
            {loading ? "Changing..." : "✅ Change Password"}
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================================
// MOBILE ICONS
// ============================================================
const MOBILE_ICONS = {
  Dashboard: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  Students: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Admission: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>,
  Courses: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
  Timetable: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  "My Classes": () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  "Live Classes": () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>,
  Attendance: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
  Fees: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  Tests: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
  Hostel: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  Accounts: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  Guardians: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  Staff: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="23" y1="11" x2="17" y2="11"/><line x1="20" y1="8" x2="20" y2="14"/></svg>,
  Progress: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  Notices: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  Users: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  More: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>,
};

const MOBILE_PRIMARY = {
  admin:    ["Dashboard","Students","Admission","Fees","More"],
  teacher:  ["Dashboard","My Classes","Attendance","Tests","More"],
  staff:    ["Dashboard","Students","Live Classes","Attendance","More"],
  helper:   ["Dashboard","Hostel","Notices"],
  cooker:   ["Dashboard","Notices"],
  cleaner:  ["Dashboard","Notices"],
  student:  ["Dashboard","My Classes","Attendance","Fees","More"],
  guardian: ["Dashboard","My Classes","Attendance","Fees","More"],
};

// ══════════════════════════════════════════════════════════════
// ADMISSION TAB — FIXED: Name bug resolved
// ══════════════════════════════════════════════════════════════
// BUG FIX: Previously, create_student_account RPC was setting
// full_name from p_full_name param, but profiles trigger was
// overwriting it. Now we FORCE UPDATE profiles AFTER RPC call
// with the correct student name, phone, and role.
//
// FLOW:
// 1. Student account: phone@mca.local + MCA@last6digits
// 2. Guardian account: guardianphone@mca.local + MCA@last6digits
// 3. Both profiles FORCEFULLY updated with correct names
// 4. No email field shown — everything uses phone number
// ══════════════════════════════════════════════════════════════

function AdmissionTab() {
  const [courses, setCourses] = useState([]); 
  const [subjects, setSubjects] = useState([]);
  const [selStream, setSelStream] = useState(""); 
  const [selClass, setSelClass] = useState("");
  const [form, setForm] = useState({
    fullName: "", phone: "", courseId: "", selectedSubjects: [],
    gender: "", address: "", dob: "", bloodGroup: "", aadhar: "",
    fatherName: "", motherName: "", category: "", religion: "",
    previousSchool: "", previousMarks: "", emergencyContact: "",
    guardianPhone: "", guardianName: "", guardianRelation: "father",
    amountPaidNow: "",
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
      if (matched) setForm(f => ({ ...f, courseId: matched.id }));
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
    if (!form.fullName || !form.phone || !form.courseId) { 
      setMsg({ type: "error", text: "Student ka naam, mobile number aur class zaruri hai!" }); return; 
    }
    if (!form.guardianName || !form.guardianPhone) { 
      setMsg({ type: "error", text: "Parent ka naam aur mobile number zaruri hai!" }); return; 
    }
    
    const studentPhone = form.phone.replace(/[^0-9]/g, "");
    const guardianPhone = form.guardianPhone.replace(/[^0-9]/g, "");
    
    if (studentPhone.length !== 10) {
      setMsg({ type: "error", text: "Student ka mobile number 10 digits ka hona chahiye!" }); return;
    }
    if (guardianPhone.length !== 10) {
      setMsg({ type: "error", text: "Parent ka mobile number 10 digits ka hona chahiye!" }); return;
    }
    
    setLoading(true); setMsg({ type: "", text: "" });
    
    try {
      // ══════════════════════════════════════════════════
      // STEP 1: Create Student Auth Account
      // ══════════════════════════════════════════════════
      const studentEmail = makeInternalEmail(studentPhone);
      const studentPass = makePasswordFromPhone(studentPhone);

      const { data: studentUserId, error: authErr } = await supabase.rpc("create_student_account", {
        p_email: studentEmail, 
        p_password: studentPass, 
        p_full_name: form.fullName,  // Student ka naam
        p_role: "student"
      });
      if (authErr) throw authErr;
      if (!studentUserId) throw new Error("Student account creation failed.");
      
      // ══════════════════════════════════════════════════
      // CRITICAL FIX: Force update profile with STUDENT name
      // This prevents the RPC/trigger from saving wrong name
      // ══════════════════════════════════════════════════
      await supabase.from("profiles").update({
        full_name: form.fullName,   // STUDENT KA NAAM — not father's
        phone: studentPhone,
        role: "student"
      }).eq("id", studentUserId);

      // ══════════════════════════════════════════════════
      // STEP 2: Generate Admission Number
      // ══════════════════════════════════════════════════
      const { data: admData } = await supabase.rpc("generate_admission_number");
      const admNo = admData || "MCA-" + new Date().getFullYear() + "-" + String(Date.now()).slice(-4);

      // ══════════════════════════════════════════════════
      // STEP 3: Create Student Record
      // ══════════════════════════════════════════════════
      const { error: stErr } = await supabase.from("students").insert({
        profile_id: studentUserId, 
        course_id: form.courseId, 
        admission_number: admNo,
        gender: form.gender || null, 
        address: form.address || null, 
        date_of_birth: form.dob || null,
        father_name: form.fatherName || null, 
        mother_name: form.motherName || null,
        aadhar_number: form.aadhar || null, 
        category: form.category || null,
        religion: form.religion || null, 
        previous_school: form.previousSchool || null,
        previous_marks: form.previousMarks || null, 
        emergency_contact: form.emergencyContact || null,
        blood_group: form.bloodGroup || null,
        student_photo: photos.student || null, 
        father_photo: photos.father || null, 
        mother_photo: photos.mother || null,
      });
      if (stErr) throw stErr;

      const { data: stData } = await supabase.from("students").select("id").eq("profile_id", studentUserId).single();
      
      // ══════════════════════════════════════════════════
      // STEP 4: Record admission fee if paid
      // ══════════════════════════════════════════════════
      if (form.amountPaidNow && Number(form.amountPaidNow) > 0 && stData) {
        await supabase.from("income_records").insert({
          student_id: stData.id,
          category: "admission_fee",
          amount: Number(form.amountPaidNow),
          description: "Admission Fee — " + form.fullName + " | " + admNo,
          payment_mode: "cash",
          income_date: new Date().toISOString().split("T")[0],
          receipt_number: "ADM-" + Date.now(),
        });
      }

      // ══════════════════════════════════════════════════
      // STEP 5: Create Guardian Account + Link
      // ══════════════════════════════════════════════════
      let guardianCreated = false;
      if (guardianPhone.length === 10 && stData) {
        try {
          const gEmail = makeInternalEmail(guardianPhone);
          const gPass = makePasswordFromPhone(guardianPhone);
          let gProfileId = null;

          // Check if profile with this phone already exists
          const { data: existGuardianProfile } = await supabase.from("profiles")
            .select("id, role").eq("phone", guardianPhone).single();

          if (existGuardianProfile?.id) {
            gProfileId = existGuardianProfile.id;
            // Update with GUARDIAN name (not student name!)
            await supabase.from("profiles").update({
              full_name: form.guardianName,  // GUARDIAN KA NAAM
              role: "guardian"
            }).eq("id", gProfileId);
          } else {
            // Create new guardian auth account
            const { data: gId, error: gAuthErr } = await supabase.rpc("create_guardian_account", {
              p_email: gEmail, 
              p_password: gPass, 
              p_full_name: form.guardianName  // GUARDIAN KA NAAM
            });
            if (!gAuthErr && gId) {
              gProfileId = gId;
              // CRITICAL FIX: Force update with GUARDIAN name
              await supabase.from("profiles").update({
                full_name: form.guardianName,  // GUARDIAN KA NAAM — not student's
                phone: guardianPhone,
                role: "guardian"
              }).eq("id", gProfileId);
            }
          }

          if (gProfileId) {
            // Create/find guardians record
            const { data: existG } = await supabase.from("guardians")
              .select("id").eq("profile_id", gProfileId).single();

            let guardianRecordId = existG?.id;
            if (!guardianRecordId) {
              const { data: newG } = await supabase.from("guardians").insert({
                profile_id: gProfileId,
                relation: form.guardianRelation || "father",
                occupation: null
              }).select().single();
              guardianRecordId = newG?.id;
            }

            if (guardianRecordId) {
              const { data: existLink } = await supabase.from("student_guardians")
                .select("id").eq("student_id", stData.id).eq("guardian_id", guardianRecordId).single();
              if (!existLink) {
                await supabase.from("student_guardians").insert({
                  student_id: stData.id, guardian_id: guardianRecordId, is_primary: true
                });
              }
              guardianCreated = true;
            }
          }
        } catch (guardianError) {
          console.warn("Guardian creation error (non-fatal):", guardianError.message);
        }
      }

      // ══════════════════════════════════════════════════
      // STEP 6: Verify names are correct (double-check)
      // ══════════════════════════════════════════════════
      const { data: verifyProfile } = await supabase.from("profiles")
        .select("full_name").eq("id", studentUserId).single();
      if (verifyProfile?.full_name !== form.fullName) {
        // Name was wrong! Force fix it
        console.warn("NAME MISMATCH DETECTED! Fixing:", verifyProfile?.full_name, "→", form.fullName);
        await supabase.from("profiles").update({ full_name: form.fullName }).eq("id", studentUserId);
      }

      const subjectNames = subjects.filter(s => form.selectedSubjects.includes(s.id)).map(s => s.name);
      
      setAdmittedData({ 
        admNo, 
        studentPhone,
        guardianPhone,
        form: { ...form }, 
        course: selectedCourse, 
        photos: { ...photos }, 
        date: new Date().toLocaleDateString("en-IN"), 
        subjectNames, 
        guardianCreated 
      });
      
      setMsg({ type: "success", text: 
        "✅ Admission Complete!\n\n" +
        "👦 Student Login:\n" +
        "   Mobile: " + studentPhone + "\n" +
        "   Password: " + makePasswordFromPhone(studentPhone) + "\n\n" +
        (guardianCreated ? 
          "👨 Parent Login:\n" +
          "   Mobile: " + guardianPhone + "\n" +
          "   Password: " + makePasswordFromPhone(guardianPhone) 
          : "")
      });
      
      // Reset form
      setForm({ fullName: "", phone: "", courseId: "", selectedSubjects: [], gender: "", address: "", dob: "", bloodGroup: "", aadhar: "", fatherName: "", motherName: "", category: "", religion: "", previousSchool: "", previousMarks: "", emergencyContact: "", guardianPhone: "", guardianName: "", guardianRelation: "father", amountPaidNow: "" });
      setPhotos({ student: "", father: "", mother: "" });
      setSelStream(""); setSelClass(""); setStep(1);
    } catch (e) { setMsg({ type: "error", text: e.message }); }
    setLoading(false);
  };

  const printAdmission = () => {
    if (!admittedData) return;
    const d = admittedData;
    const studentPass = makePasswordFromPhone(d.studentPhone);
    const guardianPass = makePasswordFromPhone(d.guardianPhone);
    const w = window.open("", "_blank");
    w.document.write('<html><head><title>Admission Form</title><style>body{font-family:Arial,sans-serif;padding:20px;color:#000}table{width:100%;border-collapse:collapse;margin:10px 0}td,th{border:1px solid #ccc;padding:8px;font-size:13px}.section{background:#e8f0e8;padding:8px 12px;font-weight:bold;color:#1a5c2e;border:1px solid #ccc}.header{text-align:center;border-bottom:3px solid #1a5c2e;padding-bottom:15px;margin-bottom:20px}@media print{body{padding:5px}}</style></head><body>' +
    '<div class="header"><div style="font-size:22px;font-weight:bold;color:#1a5c2e">MY CAREER ACADEMIC</div><div style="font-size:12px;font-weight:bold">A Division of MY LIFELINE FOUNDATION</div><div style="font-size:11px;color:#555">Kendrapara Town, Maruti Chhak, Khairabad — 754211 | Ph: 06727796700</div><div style="font-size:15px;font-weight:bold;margin-top:8px;text-decoration:underline">ADMISSION FORM</div></div>' +
    '<table><tr><td colspan="3" class="section">ADMISSION DETAILS</td></tr>' +
    '<tr><td><b>Admission No.</b></td><td colspan="2">' + d.admNo + '</td></tr>' +
    '<tr><td><b>Date</b></td><td colspan="2">' + d.date + '</td></tr>' +
    '<tr><td><b>Class / Stream</b></td><td colspan="2">' + (d.course?.name || "") + '</td></tr>' +
    '<tr><td><b>Subjects</b></td><td colspan="2">' + (d.subjectNames?.join(", ") || "-") + '</td></tr></table>' +
    '<table><tr><td colspan="4" class="section">PERSONAL INFORMATION</td></tr>' +
    '<tr><td><b>Student Name</b></td><td colspan="3">' + d.form.fullName + '</td></tr>' +
    '<tr><td><b>Mobile</b></td><td>' + d.studentPhone + '</td><td><b>Gender</b></td><td>' + (d.form.gender || "-") + '</td></tr>' +
    '<tr><td><b>DOB</b></td><td>' + (d.form.dob || "-") + '</td><td><b>Blood Group</b></td><td>' + (d.form.bloodGroup || "-") + '</td></tr>' +
    '<tr><td><b>Address</b></td><td colspan="3">' + (d.form.address || "-") + '</td></tr></table>' +
    '<table><tr><td colspan="4" class="section">FAMILY DETAILS</td></tr>' +
    '<tr><td><b>Father Name</b></td><td>' + (d.form.fatherName || "-") + '</td><td><b>Mother Name</b></td><td>' + (d.form.motherName || "-") + '</td></tr>' +
    '<tr><td><b>Category</b></td><td>' + (d.form.category || "-") + '</td><td><b>Religion</b></td><td>' + (d.form.religion || "-") + '</td></tr></table>' +
    '<table><tr><td colspan="4" class="section">LOGIN CREDENTIALS — IMPORTANT!</td></tr>' +
    '<tr><td><b>Student Login</b></td><td>Mobile: ' + d.studentPhone + '</td><td><b>Password</b></td><td>' + studentPass + '</td></tr>' +
    '<tr><td><b>Parent Login</b></td><td>Mobile: ' + d.guardianPhone + '</td><td><b>Password</b></td><td>' + guardianPass + '</td></tr>' +
    '<tr><td><b>Website</b></td><td colspan="3">my-career-academic.vercel.app</td></tr></table>' +
    '<div style="margin-top:40px;display:flex;justify-content:space-between;padding:0 20px"><div style="text-align:center;border-top:1px solid #333;padding-top:5px;width:150px;font-size:12px">Student Signature</div><div style="text-align:center;border-top:1px solid #333;padding-top:5px;width:150px;font-size:12px">Parent Signature</div><div style="text-align:center;border-top:1px solid #333;padding-top:5px;width:150px;font-size:12px">Admin Signature</div></div>' +
    '</body></html>');
    w.document.close(); w.print();
  };

  const sendWhatsApp = () => {
    if (!admittedData) return;
    const d = admittedData;
    const phone = d.guardianPhone || d.studentPhone;
    const studentPass = makePasswordFromPhone(d.studentPhone);
    const guardianPass = makePasswordFromPhone(d.guardianPhone);
    const text = "🎓 *MY CAREER ACADEMIC*\n\nAdmission complete for *" + d.form.fullName + "*!\n\n📋 Admission No: " + d.admNo + "\nClass: " + (d.course?.name || "") + "\nSubjects: " + (d.subjectNames?.join(", ") || "-") + "\n\n🔐 *Login Details:*\nWebsite: my-career-academic.vercel.app\n\n👦 Student Login:\n  Mobile: " + d.studentPhone + "\n  Password: " + studentPass + "\n\n👨 Parent Login:\n  Mobile: " + d.guardianPhone + "\n  Password: " + guardianPass + "\n\nFor queries: 06727796700\n\n_My Career Academic_";
    window.open("https://wa.me/91" + phone + "?text=" + encodeURIComponent(text), "_blank");
  };

  return (
    <div>
      <h1 className="page-title">New Admission</h1>
      <p className="page-sub">11th &amp; 12th Class — Arts, Commerce, Science</p>

      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {[1, 2, 3, 4].map(s => (
          <div key={s} onClick={() => step > s && setStep(s)} style={{ flex: 1, padding: "10px 8px", borderRadius: 8, cursor: step > s ? "pointer" : "default", textAlign: "center", fontSize: 12, fontWeight: 600, background: step === s ? "var(--primary)" : step > s ? "var(--success)" : "var(--bg)", color: step === s ? "#fff" : step > s ? "#fff" : "var(--muted)", border: "1px solid var(--border)" }}>
            {s === 1 ? "1. Student Info" : s === 2 ? "2. Class & Fee" : s === 3 ? "3. Family Details" : "4. Parent Login"}
          </div>
        ))}
      </div>

      <div className="card" style={{ maxWidth: 720 }}>
        {msg.text && (
          <div className={msg.type === "success" ? "success-box" : "error-box"} style={{ whiteSpace: "pre-line", marginBottom: 16 }}>
            {msg.text}
            {msg.type === "success" && admittedData && (
              <div style={{ marginTop: 12 }}>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button className="btn" style={{ fontSize: 13 }} onClick={printAdmission}>🖨️ Print Admission Form</button>
                  <button className="btn" style={{ background: "#25D366", border: "none", fontSize: 13 }} onClick={sendWhatsApp}>📱 WhatsApp to Parent</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 1: Student Personal Info */}
        {step === 1 && (
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Student Personal Information</h3>
            <div style={{ display: "flex", gap: 16, marginBottom: 20, justifyContent: "center", padding: 16, background: "var(--bg)", borderRadius: 8 }}>
              <PhotoUpload label="Student Photo" value={photos.student} onChange={v => setPhotos({ ...photos, student: v })} />
              <PhotoUpload label="Father Photo" value={photos.father} onChange={v => setPhotos({ ...photos, father: v })} />
              <PhotoUpload label="Mother Photo" value={photos.mother} onChange={v => setPhotos({ ...photos, mother: v })} />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="label">Student Ka Full Name *</label>
                <input className="input" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} placeholder="Student ka poora naam" />
              </div>
              <div className="form-group">
                <label className="label">Student Ka Mobile Number *</label>
                <input className="input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="10-digit mobile (yahi Login ID hoga)" />
                <div style={{ fontSize:10, color:"var(--primary)", marginTop:2 }}>📱 Yahi number se student login karega</div>
              </div>
            </div>
            <div className="grid-3">
              <div className="form-group"><label className="label">Gender</label><select className="select" value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}><option value="">Select</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></select></div>
              <div className="form-group"><label className="label">Date of Birth</label><input className="input" type="date" value={form.dob} onChange={e => setForm({ ...form, dob: e.target.value })} /></div>
              <div className="form-group"><label className="label">Blood Group</label><select className="select" value={form.bloodGroup} onChange={e => setForm({ ...form, bloodGroup: e.target.value })}><option value="">Select</option>{["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(bg => <option key={bg} value={bg}>{bg}</option>)}</select></div>
            </div>
            <div className="grid-2">
              <div className="form-group"><label className="label">Aadhar Number</label><input className="input" value={form.aadhar} onChange={e => setForm({ ...form, aadhar: e.target.value })} placeholder="12-digit Aadhar" /></div>
              <div className="form-group"><label className="label">Emergency Contact</label><input className="input" value={form.emergencyContact} onChange={e => setForm({ ...form, emergencyContact: e.target.value })} placeholder="Alternate phone" /></div>
            </div>
            <div className="form-group"><label className="label">Address</label><input className="input" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Village / Town, District, State" /></div>
            <button className="btn" onClick={() => { if (!form.fullName || !form.phone) { setMsg({ type: "error", text: "Naam aur mobile number zaruri hai!" }); return; } if (form.phone.replace(/[^0-9]/g,"").length !== 10) { setMsg({ type: "error", text: "Mobile number 10 digits ka hona chahiye!" }); return; } setMsg({ type: "", text: "" }); setStep(2); }}>Next → Class & Subjects</button>
          </div>
        )}

        {/* STEP 2: Class Selection */}
        {step === 2 && (
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Select Class & Subjects</h3>
            <div style={{ marginBottom: 20 }}>
              <label className="label" style={{ marginBottom: 10, display: "block" }}>Select Stream *</label>
              <div style={{ display: "flex", gap: 10 }}>
                {STREAMS.map(st => (
                  <div key={st.key} onClick={() => setSelStream(st.key)} style={{ flex: 1, padding: "14px 10px", borderRadius: 10, cursor: "pointer", textAlign: "center", fontWeight: 700, fontSize: 14, transition: "all 0.15s", border: selStream === st.key ? "2px solid " + st.color : "2px solid var(--border)", background: selStream === st.key ? st.color : "#fff", color: selStream === st.key ? "#fff" : "#333" }}>
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
                    <div key={cls} onClick={() => setSelClass(cls)} style={{ flex: 1, padding: "14px 10px", borderRadius: 10, cursor: "pointer", textAlign: "center", fontWeight: 700, fontSize: 18, border: selClass === cls ? "2px solid " + streamColor : "2px solid var(--border)", background: selClass === cls ? streamColor : "#fff", color: selClass === cls ? "#fff" : "#333" }}>
                      {cls}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {form.courseId && (
              <div style={{ marginBottom: 20, padding: 16, background: "var(--bg)", borderRadius: 10 }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: streamColor }}>✓ {selectedCourse?.name}</div>
              </div>
            )}
            {subjects.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <label className="label" style={{ marginBottom: 10, display: "block" }}>Subjects — {form.selectedSubjects.length} selected</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {subjects.map(sub => {
                    const isSel = form.selectedSubjects.includes(sub.id);
                    return (
                      <div key={sub.id} onClick={() => toggleSubject(sub.id)} style={{ padding: "8px 16px", borderRadius: 20, cursor: "pointer", fontWeight: 600, fontSize: 13, border: isSel ? "2px solid " + streamColor : "2px solid var(--border)", background: isSel ? streamColor : "#fff", color: isSel ? "#fff" : "#555", userSelect: "none" }}>
                        {isSel ? "✓ " : "+ "}{sub.name}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
              <button className="btn-outline" onClick={() => setStep(1)}>← Back</button>
              <button className="btn" onClick={() => { if (!form.courseId) { setMsg({ type: "error", text: "Stream aur class select karo!" }); return; } setMsg({ type: "", text: "" }); setStep(3); }}>Next → Family Details</button>
            </div>
          </div>
        )}

        {/* STEP 3: Family Details */}
        {step === 3 && (
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Family & Previous School</h3>
            <div className="grid-2">
              <div className="form-group"><label className="label">Father Ka Naam</label><input className="input" value={form.fatherName} onChange={e => setForm({ ...form, fatherName: e.target.value })} placeholder="Father ka full name" /></div>
              <div className="form-group"><label className="label">Mother Ka Naam</label><input className="input" value={form.motherName} onChange={e => setForm({ ...form, motherName: e.target.value })} placeholder="Mother ka full name" /></div>
            </div>
            <div className="grid-3">
              <div className="form-group"><label className="label">Category</label><select className="select" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}><option value="">Select</option><option value="General">General</option><option value="OBC">OBC</option><option value="SC">SC</option><option value="ST">ST</option><option value="EWS">EWS</option></select></div>
              <div className="form-group"><label className="label">Religion</label><select className="select" value={form.religion} onChange={e => setForm({ ...form, religion: e.target.value })}><option value="">Select</option><option value="Hindu">Hindu</option><option value="Muslim">Muslim</option><option value="Christian">Christian</option><option value="Sikh">Sikh</option><option value="Other">Other</option></select></div>
              <div></div>
            </div>
            <div className="grid-2">
              <div className="form-group"><label className="label">Previous School</label><input className="input" value={form.previousSchool} onChange={e => setForm({ ...form, previousSchool: e.target.value })} /></div>
              <div className="form-group"><label className="label">10th Marks / Percentage</label><input className="input" value={form.previousMarks} onChange={e => setForm({ ...form, previousMarks: e.target.value })} placeholder="e.g. 85% or 425/500" /></div>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
              <button className="btn-outline" onClick={() => setStep(2)}>← Back</button>
              <button className="btn" onClick={() => { setMsg({ type: "", text: "" }); setStep(4); }}>Next → Parent Login</button>
            </div>
          </div>
        )}

        {/* STEP 4: Parent Login Setup + Fee + Submit */}
        {step === 4 && (
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>Parent / Guardian Login Setup</h3>
            
            {/* Student login preview */}
            <div style={{ padding: 16, background: "var(--primary-light)", borderRadius: 10, marginBottom: 16, borderLeft: "4px solid var(--primary)" }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6, color: "var(--primary)" }}>👦 Student Login (auto-created)</div>
              <div style={{ fontSize: 13 }}>
                <b>Student:</b> {form.fullName}<br/>
                <b>Login ID:</b> {form.phone} (mobile number)<br/>
                <b>Password:</b> {makePasswordFromPhone(form.phone)}
              </div>
            </div>

            {/* Fee collection */}
            <div style={{ padding: 16, background: "var(--warning-light)", borderRadius: 10, marginBottom: 16, border: "1px solid var(--warning)" }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: "#7a5c00" }}>₹ Admission Fee (optional)</div>
              <div className="grid-2">
                <div>
                  <label className="label">Total Course Fee</label>
                  <div style={{ padding: "10px 14px", background: "#fff", borderRadius: 8, fontSize: 14, fontWeight: 700, color: "var(--primary)" }}>
                    ₹{selectedCourse?.total_fee?.toLocaleString() || "0"}
                  </div>
                </div>
                <div>
                  <label className="label">Amount Received Now (₹)</label>
                  <input className="input" type="number" value={form.amountPaidNow || ""} onChange={e => setForm({...form, amountPaidNow: e.target.value})} placeholder="0 if nothing paid" />
                </div>
              </div>
            </div>

            {/* Guardian details */}
            <div style={{ padding: 16, background: "var(--bg)", borderRadius: 10, marginBottom: 16, border: "1px solid var(--border)" }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>👨‍👩‍👧 Parent / Guardian Login</div>
              <div className="grid-3">
                <div className="form-group">
                  <label className="label">Parent Ka Naam *</label>
                  <input className="input" value={form.guardianName} onChange={e => setForm({ ...form, guardianName: e.target.value })} placeholder="Father / Mother naam" />
                </div>
                <div className="form-group">
                  <label className="label">Relation</label>
                  <select className="select" value={form.guardianRelation} onChange={e => setForm({ ...form, guardianRelation: e.target.value })}>
                    <option value="father">Father</option><option value="mother">Mother</option><option value="guardian">Guardian</option><option value="sibling">Elder Sibling</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="label">Parent Ka Mobile *</label>
                  <input className="input" value={form.guardianPhone} onChange={e => setForm({ ...form, guardianPhone: e.target.value })} placeholder="10-digit mobile" />
                  <div style={{ fontSize:10, color:"var(--primary)", marginTop:2 }}>📱 Parent isi number se login karega</div>
                </div>
              </div>
              {form.guardianPhone && form.guardianPhone.replace(/[^0-9]/g,"").length === 10 && (
                <div style={{ marginTop:8, padding:"8px 12px", background:"var(--success-light)", borderRadius:6, fontSize:12 }}>
                  ✅ Parent Password hoga: <b>{makePasswordFromPhone(form.guardianPhone)}</b>
                </div>
              )}
            </div>

            {/* Summary */}
            <div style={{ padding: 14, background: "var(--bg)", borderRadius: 10, marginBottom: 16, fontSize: 13, lineHeight: 2 }}>
              <div style={{ fontWeight: 700, color: "var(--primary)" }}>📋 Summary</div>
              <div><b>Student:</b> {form.fullName} | Mobile: {form.phone}</div>
              <div><b>Class:</b> {selectedCourse?.name}</div>
              <div><b>Subjects:</b> {subjects.filter(s => form.selectedSubjects.includes(s.id)).map(s => s.name).join(", ") || "-"}</div>
              {form.guardianName && <div><b>Parent:</b> {form.guardianName} ({form.guardianRelation}) — Mobile: {form.guardianPhone}</div>}
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
              <button className="btn-outline" onClick={() => setStep(3)}>← Back</button>
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

// ========== DASHBOARD ROUTER ==========
function DashboardTab({ profile, onNavigate, notifications }) {
  const role = profile?.role;
  const unread = (notifications || []).filter(n => !n.is_read).length;
  if (role === "admin" || role === "staff") return <AdminDashboard profile={profile} onNavigate={onNavigate} unread={unread} />;
  if (role === "student" || role === "guardian") return <StudentDashboard profile={profile} onNavigate={onNavigate} unread={unread} />;
  if (role === "teacher") return <TeacherDashboard profile={profile} onNavigate={onNavigate} unread={unread} />;
  return <DefaultDashboard profile={profile} unread={unread} />;
}

function AdminDashboard({ profile, onNavigate, unread }) {
  const [stats, setStats] = useState({ activeStudents: 0, totalStudents: 0, totalIncome: 0, totalExpense: 0, liveNow: 0, hostelers: 0, totalStaff: 0, netProfit: 0 });
  const [recentAdmissions, setRecentAdmissions] = useState([]);
  const [todayClasses, setTodayClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef(null);

  const loadData = useCallback(async () => {
    const today = new Date().toISOString().split("T")[0];
    const [stRes, liveRes, staffRes, incRes, expRes, hostelRes, hfRes, admRes, clsRes] = await Promise.all([
      supabase.from("students").select("id, status"),
      supabase.from("live_classes").select("id", { count: "exact" }).eq("class_date", today).eq("status", "live"),
      supabase.from("staff").select("id", { count: "exact" }),
      supabase.from("income_records").select("amount"),
      supabase.from("expense_records").select("amount"),
      supabase.from("hostel_allotments").select("id", { count: "exact" }).eq("status", "active"),
      supabase.from("hostel_fees").select("amount"),
      supabase.from("students").select("id, admission_number, admission_date, profiles!inner(full_name), courses(name)").eq("status","active").order("created_at",{ascending:false}).limit(6),
      supabase.from("live_classes").select("*, subjects(name), courses(name), staff!inner(profiles!inner(full_name))").eq("class_date",today).order("start_time"),
    ]);
    const allSt = stRes.data || [];
    const activeSt = allSt.filter(s => s.status === "active").length;
    const totalInc = [...(incRes.data||[]), ...(hfRes.data||[])].reduce((a,r)=>a+Number(r.amount||0),0);
    const totalExp = (expRes.data||[]).reduce((a,r)=>a+Number(r.amount||0),0);
    setStats({ activeStudents: activeSt, totalStudents: allSt.length, totalIncome: totalInc, totalExpense: totalExp, liveNow: liveRes.count||0, hostelers: hostelRes.count||0, totalStaff: staffRes.count||0, netProfit: totalInc - totalExp });
    setRecentAdmissions(admRes.data||[]);
    setTodayClasses(clsRes.data||[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
    intervalRef.current = setInterval(loadData, 30000);
    return () => clearInterval(intervalRef.current);
  }, [loadData]);

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <div>
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-sub">Welcome, {profile?.full_name} &nbsp;&middot;&nbsp; <span style={{ color:"var(--success)", fontSize:12, fontWeight:600 }}>&bull; Auto-refresh 30s</span></p>
        </div>
        <button className="btn-outline" style={{ fontSize:12 }} onClick={loadData}>&#128260; Refresh</button>
      </div>
      {loading ? <div className="card" style={{ textAlign:"center", padding:30, color:"var(--muted)" }}>Loading...</div> : (
        <>
          <div className="grid-4" style={{ marginBottom:12 }}>
            <StatCard title="Active Students" value={stats.activeStudents} variant="primary" subtitle={"Total: " + stats.totalStudents} onClick={()=>onNavigate("Students")} />
            <StatCard title="Live Classes Now" value={stats.liveNow} variant={stats.liveNow>0?"danger":"primary"} onClick={()=>onNavigate("Live Classes")} />
            <StatCard title="Total Income" value={"₹"+(stats.totalIncome||0).toLocaleString()} variant="success" onClick={()=>onNavigate("Accounts")} />
            <StatCard title="Unread Notices" value={unread} variant="warning" onClick={()=>onNavigate("Notices")} />
          </div>
          <div className="grid-4" style={{ marginBottom:20 }}>
            <StatCard title="Total Staff" value={stats.totalStaff} variant="primary" onClick={()=>onNavigate("Staff")} />
            <StatCard title="Hostelers" value={stats.hostelers} variant="success" onClick={()=>onNavigate("Hostel")} />
            <StatCard title="Expenses" value={"₹"+(stats.totalExpense||0).toLocaleString()} variant="danger" onClick={()=>onNavigate("Accounts")} />
            <StatCard title={stats.netProfit>=0?"Net Profit":"Net Loss"} value={"₹"+Math.abs(stats.netProfit||0).toLocaleString()} variant={stats.netProfit>=0?"success":"danger"} onClick={()=>onNavigate("Accounts")} />
          </div>
          <div className="card" style={{ marginBottom:20 }}>
            <h3 style={{ fontSize:13, fontWeight:700, marginBottom:12, color:"var(--muted)", textTransform:"uppercase" }}>Quick Actions</h3>
            <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
              {[{label:"+ New Admission",tab:"Admission",color:"var(--primary)"},{label:"Mark Attendance",tab:"Attendance",color:"var(--success)"},{label:"Collect Hostel Fee",tab:"Hostel",color:"#e67e22"},{label:"Send Notice",tab:"Notices",color:"#9b59b6"},{label:"View Accounts",tab:"Accounts",color:"#2ecc71"},{label:"Manage Users",tab:"Users",color:"#e74c3c"}].map(a=>(
                <button key={a.tab} onClick={()=>onNavigate(a.tab)} style={{ padding:"10px 18px", borderRadius:8, border:"none", background:a.color, color:"#fff", cursor:"pointer", fontWeight:600, fontSize:13 }}>{a.label}</button>
              ))}
            </div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
            <div className="card">
              <h3 style={{ fontSize:15, fontWeight:700, marginBottom:12 }}>Today's Classes</h3>
              {todayClasses.length===0?<p style={{ color:"var(--muted)", fontSize:13 }}>No classes today.</p>:todayClasses.map(cl=>(
                <div key={cl.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:"1px solid var(--border)" }}>
                  <div><div style={{ fontWeight:600, fontSize:13 }}>{cl.subjects?.name} ({cl.courses?.name})</div><div style={{ fontSize:11, color:"var(--muted)" }}>{cl.start_time?.slice(0,5)}-{cl.end_time?.slice(0,5)} | {cl.staff?.profiles?.full_name}</div></div>
                  <span className={"badge " + (cl.status==="live"?"badge-danger":cl.status==="completed"?"badge-success":"badge-primary")}>{cl.status==="live"?"LIVE":cl.status}</span>
                </div>
              ))}
            </div>
            <div className="card">
              <h3 style={{ fontSize:15, fontWeight:700, marginBottom:12 }}>Recent Admissions</h3>
              {recentAdmissions.length===0?<p style={{ color:"var(--muted)", fontSize:13 }}>No admissions.</p>:recentAdmissions.map(st=>(
                <div key={st.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"7px 0", borderBottom:"1px solid var(--border)", cursor:"pointer" }} onClick={()=>onNavigate("StudentDetail",st)}>
                  <div><span style={{ fontWeight:600, fontSize:13 }}>{st.profiles?.full_name}</span><div style={{ fontSize:11, color:"var(--muted)" }}>{st.courses?.name}</div></div>
                  <span className="badge badge-primary">{st.admission_number}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function StudentDashboard({ profile, onNavigate, unread }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    const stRes = await getStudentForProfile(profile.id, profile.role);
    if (!stRes) { setLoading(false); return; }
    const today = new Date().toISOString().split("T")[0];
    const [attRes, classesRes] = await Promise.all([
      supabase.from("attendance").select("status, live_classes!inner(subject_id, subjects(name))").eq("student_id", stRes.id),
      supabase.from("live_classes").select("*, subjects(name), staff!inner(profiles!inner(full_name))").eq("course_id", stRes.course_id).eq("class_date", today).order("start_time"),
    ]);
    const attMap = {};
    (attRes.data||[]).forEach(a => {
      const sub = a.live_classes?.subjects?.name || "Unknown";
      if (!attMap[sub]) attMap[sub] = { present:0, total:0 };
      attMap[sub].total++;
      if (a.status==="present"||a.status==="late") attMap[sub].present++;
    });
    const totalAtt = Object.values(attMap).reduce((a,s)=>({present:a.present+s.present,total:a.total+s.total}),{present:0,total:0});
    const overallPct = totalAtt.total>0?Math.round((totalAtt.present/totalAtt.total)*100):null;
    setData({ student:stRes, attendanceMap:attMap, overallPct, totalAtt, todayClasses:classesRes.data||[] });
    setLoading(false);
  }, [profile.id, profile.role]);

  useEffect(() => { loadData(); }, [loadData]);

  if (loading) return <div className="card" style={{ textAlign:"center", padding:40, color:"var(--muted)" }}>Loading...</div>;
  if (!data) return <div className="card empty-state">Student record nahi mila.</div>;
  const { student, overallPct, totalAtt, todayClasses } = data;

  return (
    <div>
      <h1 className="page-title">My Dashboard</h1>
      <p className="page-sub">{student.courses?.name} | {student.admission_number}</p>
      <div className="grid-3" style={{ marginBottom:20 }}>
        <StatCard title="Attendance" value={overallPct!==null?overallPct+"%":"—"} variant={overallPct>=75?"success":"danger"} subtitle={totalAtt.present+"/"+totalAtt.total+" classes"} onClick={()=>onNavigate("Attendance")} />
        <StatCard title="Classes Today" value={todayClasses.length} variant="primary" onClick={()=>onNavigate("My Classes")} />
        <StatCard title="Notices" value={unread} variant="warning" onClick={()=>onNavigate("Notices")} />
      </div>
      {overallPct!==null&&overallPct<75&&(
        <div style={{ background:"var(--danger-light)", border:"2px solid var(--danger)", borderRadius:10, padding:"12px 16px", marginBottom:16, fontWeight:700, color:"var(--danger)", fontSize:14 }}>
          Attendance {overallPct}% hai — 75% se neeche! Regular class attend karo!
        </div>
      )}
      <div className="card">
        <h3 style={{ fontSize:15, fontWeight:700, marginBottom:12 }}>Today's Classes</h3>
        {todayClasses.length===0?<p style={{ color:"var(--muted)", fontSize:13 }}>Aaj koi class nahi hai.</p>:todayClasses.map(cl=>(
          <div key={cl.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:"1px solid var(--border)" }}>
            <div><div style={{ fontWeight:700, fontSize:14 }}>{cl.subjects?.name}</div><div style={{ fontSize:12, color:"var(--muted)" }}>{cl.start_time?.slice(0,5)}-{cl.end_time?.slice(0,5)} | {cl.staff?.profiles?.full_name}</div></div>
            <span className={"badge " + (cl.status==="live"?"badge-danger":cl.status==="completed"?"badge-success":"badge-primary")}>{cl.status==="live"?"🔴 LIVE":cl.status==="completed"?"Done":"Scheduled"}</span>
          </div>
        ))}
      </div>
      <PasswordChangeWidget profile={profile} />
    </div>
  );
}

function TeacherDashboard({ profile, onNavigate, unread }) {
  const [todayClasses, setTodayClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    supabase.from("staff").select("id").eq("profile_id", profile.id).single().then(({ data: staffRec }) => {
      if (!staffRec) { setLoading(false); return; }
      supabase.from("live_classes").select("*, subjects(name), courses(name)").eq("teacher_id",staffRec.id).eq("class_date",today).order("start_time").then(({ data }) => { setTodayClasses(data||[]); setLoading(false); });
    });
  }, [profile.id]);
  if (loading) return <div className="card" style={{ textAlign:"center", padding:30, color:"var(--muted)" }}>Loading...</div>;
  return (
    <div>
      <h1 className="page-title">Teacher Dashboard</h1>
      <p className="page-sub">Welcome, {profile?.full_name}</p>
      <div className="grid-3" style={{ marginBottom:20 }}>
        <StatCard title="Today's Classes" value={todayClasses.length} variant="primary" onClick={()=>onNavigate("My Classes")} />
        <StatCard title="Unread Notices" value={unread} variant="warning" onClick={()=>onNavigate("Notices")} />
        <StatCard title="Quick" value="Mark Attendance" variant="success" onClick={()=>onNavigate("Attendance")} />
      </div>
      <div className="card">
        <h3 style={{ fontSize:15, fontWeight:700, marginBottom:12 }}>Today's Schedule</h3>
        {todayClasses.length===0?<p style={{ color:"var(--muted)" }}>No classes today.</p>:todayClasses.map(cl=>(
          <div key={cl.id} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid var(--border)" }}>
            <div><div style={{ fontWeight:600 }}>{cl.subjects?.name} ({cl.courses?.name})</div><div style={{ fontSize:11, color:"var(--muted)" }}>{cl.start_time?.slice(0,5)}-{cl.end_time?.slice(0,5)}</div></div>
            <span className={"badge " + (cl.status==="live"?"badge-danger":cl.status==="completed"?"badge-success":"badge-primary")}>{cl.status==="live"?"LIVE":cl.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DefaultDashboard({ profile, unread }) {
  return (
    <div>
      <h1 className="page-title">Dashboard</h1>
      <p className="page-sub">Welcome, {profile?.full_name} — {profile?.role}</p>
      <StatCard title="Unread Notices" value={unread} variant="warning" />
      <PasswordChangeWidget profile={profile} />
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
    let q = supabase.from("students").select("*, profiles!inner(full_name, phone), courses(name)").order("created_at", { ascending: false });
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
        <div><h1 className="page-title">Students</h1><p style={{ fontSize: 13, color: "var(--muted)" }}>{filtered.length} students</p></div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <input className="input" style={{ width: 180 }} placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
          <select className="select" style={{ width: 120 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="active">Active</option><option value="dropped">Dropped</option><option value="all">All</option>
          </select>
          <button className={"tag " + (filter === "all" ? "active" : "")} onClick={() => setFilter("all")}>All</button>
          {courses.map(c => <button key={c.id} className={"tag " + (filter === c.id ? "active" : "")} onClick={() => setFilter(c.id)}>{c.name}</button>)}
        </div>
      </div>
      <div className="card">
        {loading ? <p style={{ color: "var(--muted)" }}>Loading...</p> : filtered.length === 0 ? <p className="empty-state">No students found.</p> : (
          <table><thead><tr><th>Name</th><th>Adm No</th><th>Course</th><th>Phone</th><th>Status</th><th></th></tr></thead>
          <tbody>{filtered.map(st => (
            <tr key={st.id} style={{ cursor: "pointer" }} onClick={() => onNavigate("StudentDetail", st)}>
              <td style={{ fontWeight: 600 }}>{st.profiles?.full_name}</td>
              <td><span className="badge badge-primary">{st.admission_number}</span></td>
              <td>{st.courses?.name}</td>
              <td>{st.profiles?.phone || "-"}</td>
              <td><span className={"badge " + (st.status === "active" ? "badge-success" : "badge-danger")}>{st.status}</span></td>
              <td style={{ color: "var(--primary)", fontWeight: 600, fontSize: 13 }}>View →</td>
            </tr>
          ))}</tbody></table>
        )}
      </div>
    </div>
  );
}

// ========== STUDENT DETAIL (simplified) ==========
function StudentDetailTab({ student, onBack, userRole }) {
  const [profile, setProfile] = useState(null);
  const [course, setCourse] = useState(null);
  const [attendance, setAttendance] = useState({ total: 0, present: 0, pct: 0, records: [] });
  const [guardians, setGuardians] = useState([]);
  const isAdmin = userRole === "admin";

  useEffect(() => {
    if (!student) return;
    (async () => {
      const [profRes, courseRes, attRes, sgRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", student.profile_id).single(),
        supabase.from("courses").select("*").eq("id", student.course_id).single(),
        supabase.from("attendance").select("*, live_classes!inner(class_date, subjects(name))").eq("student_id", student.id).order("live_classes(class_date)", { ascending: false }),
        supabase.from("student_guardians").select("*, guardians(*, profiles(full_name, phone))").eq("student_id", student.id),
      ]);
      setProfile(profRes.data);
      setCourse(courseRes.data);
      const attList = attRes.data || [];
      const total = attList.length;
      const present = attList.filter(a=>a.status==="present"||a.status==="late").length;
      setAttendance({ total, present, pct: total>0?Math.round((present/total)*100):0, records: attList });
      setGuardians(sgRes.data || []);
    })();
  }, [student]);

  if (!student) return null;

  return (
    <div>
      <button className="btn-outline" onClick={onBack} style={{ marginBottom:16 }}>← Back</button>
      <div className="card" style={{ marginBottom:16 }}>
        <div style={{ fontSize:20, fontWeight:800 }}>{profile?.full_name}</div>
        <div style={{ fontSize:13, color:"var(--muted)", marginTop:4 }}>
          {student.admission_number} | {course?.name} | 📱 {profile?.phone}
        </div>
        {student.father_name && <div style={{ fontSize:13, color:"var(--muted)" }}>Father: {student.father_name} {student.mother_name && " | Mother: "+student.mother_name}</div>}
      </div>
      <div className="grid-3" style={{ marginBottom:16 }}>
        <StatCard title="Attendance" value={attendance.pct+"%"} variant={attendance.pct>=75?"success":"danger"} subtitle={attendance.present+"/"+attendance.total} />
        <StatCard title="Status" value={student.status} variant={student.status==="active"?"success":"danger"} />
        <StatCard title="Guardians" value={guardians.length} variant="primary" />
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        <div className="card">
          <h3 style={{ fontSize:14, fontWeight:700, marginBottom:12 }}>Personal Details</h3>
          {[["Gender",student.gender],["DOB",student.date_of_birth],["Category",student.category],["Blood Group",student.blood_group],["Aadhar",student.aadhar_number],["Address",student.address]].map(([k,v])=>(
            <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"5px 0", borderBottom:"1px solid var(--border)", fontSize:13 }}>
              <span style={{ color:"var(--muted)" }}>{k}</span><span>{v||"-"}</span>
            </div>
          ))}
        </div>
        <div className="card">
          <h3 style={{ fontSize:14, fontWeight:700, marginBottom:12 }}>Guardians</h3>
          {guardians.length===0?<p style={{ color:"var(--muted)", fontSize:13 }}>No guardians linked.</p>:guardians.map(sg=>(
            <div key={sg.id} style={{ padding:"8px 0", borderBottom:"1px solid var(--border)" }}>
              <span style={{ fontWeight:600 }}>{sg.guardians?.profiles?.full_name}</span>
              {sg.is_primary&&<span className="badge badge-success" style={{ marginLeft:6, fontSize:10 }}>Primary</span>}
              <div style={{ fontSize:12, color:"var(--muted)" }}>📱 {sg.guardians?.profiles?.phone||"-"} | {sg.guardians?.relation}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="card" style={{ marginTop:16 }}>
        <h3 style={{ fontSize:14, fontWeight:700, marginBottom:12 }}>Attendance History</h3>
        {attendance.records.length===0?<p style={{ color:"var(--muted)" }}>No records.</p>:(
          <table><thead><tr><th>Date</th><th>Subject</th><th>Status</th></tr></thead>
          <tbody>{attendance.records.slice(0,20).map((a,i)=>(
            <tr key={i}>
              <td>{a.live_classes?.class_date?new Date(a.live_classes.class_date).toLocaleDateString("en-IN"):"-"}</td>
              <td>{a.live_classes?.subjects?.name||"-"}</td>
              <td><span className={"badge "+(a.status==="present"?"badge-success":a.status==="late"?"badge-warning":"badge-danger")}>{a.status}</span></td>
            </tr>
          ))}</tbody></table>
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
  const addSubject = async (cid) => { if (!newSubject[cid]) return; await supabase.from("subjects").insert({ name: newSubject[cid], course_id: cid }); setNewSubject(p => ({ ...p, [cid]: "" })); loadSubjects(cid); };
  const addChapter = async (sid, cid) => { if (!newChapter[sid]) return; const ex = chapters[sid] || []; await supabase.from("chapters").insert({ name: newChapter[sid], subject_id: sid, sort_order: ex.length + 1 }); setNewChapter(p => ({ ...p, [sid]: "" })); loadSubjects(cid); };
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1 className="page-title">Courses</h1>
        <button className="btn btn-accent" onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ name: "", description: "", duration: "", fee: "" }); }}>+ Add Course</button>
      </div>
      {showForm && (<div className="card" style={{ marginBottom: 20 }}>
        <div className="grid-2"><div><label className="label">Course Name *</label><input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div><div><label className="label">Total Fee (₹) *</label><input className="input" type="number" value={form.fee} onChange={e => setForm({ ...form, fee: e.target.value })} /></div></div>
        <button className="btn btn-success" style={{ marginTop: 12 }} onClick={saveCourse}>{editId ? "Update" : "Create"}</button>
      </div>)}
      {courses.map(c => (
        <div key={c.id} className="card" style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div onClick={() => toggleExpand(c.id)} style={{ cursor: "pointer", flex: 1 }}>
              <span style={{ fontWeight: 700 }}>{c.name}</span> <span className={"badge " + (c.is_active?"badge-success":"badge-muted")}>{c.is_active?"Active":"Inactive"}</span>
              <div style={{ fontSize: 13, color: "var(--muted)" }}>₹{c.total_fee?.toLocaleString()}</div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button className="btn-outline" style={{ fontSize: 12 }} onClick={() => editCourse(c)}>Edit</button>
              <button className="btn-outline" style={{ fontSize: 12 }} onClick={() => toggleExpand(c.id)}>{expanded === c.id ? "▲" : "▼"}</button>
            </div>
          </div>
          {expanded === c.id && (
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
              {(subjects[c.id] || []).map(sub => (
                <div key={sub.id} style={{ marginBottom: 16, padding: 12, background: "var(--bg)", borderRadius: 8 }}>
                  <span style={{ fontWeight: 600 }}>{sub.name}</span>
                  {(chapters[sub.id] || []).map((ch, i) => (<div key={ch.id} style={{ padding: "4px 0 4px 16px", fontSize: 13 }}>{i + 1}. {ch.name}</div>))}
                  <div style={{ display: "flex", gap: 8, marginTop: 8, paddingLeft: 16 }}>
                    <input className="input" style={{ flex: 1, fontSize: 12 }} placeholder="New chapter..." value={newChapter[sub.id] || ""} onChange={e => setNewChapter(p => ({ ...p, [sub.id]: e.target.value }))} onKeyDown={e => e.key === "Enter" && addChapter(sub.id, c.id)} />
                    <button className="btn" style={{ fontSize: 11 }} onClick={() => addChapter(sub.id, c.id)}>+ Add</button>
                  </div>
                </div>
              ))}
              <div style={{ display: "flex", gap: 8 }}>
                <input className="input" style={{ flex: 1, fontSize: 13 }} placeholder="New subject..." value={newSubject[c.id] || ""} onChange={e => setNewSubject(p => ({ ...p, [c.id]: e.target.value }))} onKeyDown={e => e.key === "Enter" && addSubject(c.id)} />
                <button className="btn btn-accent" style={{ fontSize: 12 }} onClick={() => addSubject(c.id)}>+ Subject</button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ========== MY CLASSES (Student/Teacher) ==========
function MyClassesTab({ profile }) {
  const [todayClasses, setTodayClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const today = new Date().toISOString().split("T")[0];
  useEffect(() => {
    (async () => {
      if (profile?.role === "student" || profile?.role === "guardian") {
        const st = await getStudentForProfile(profile.id, profile.role);
        if (st) {
          const { data } = await supabase.from("live_classes").select("*, subjects(name), staff!inner(profiles!inner(full_name))").eq("course_id", st.course_id).eq("class_date", today).order("start_time");
          setTodayClasses(data || []);
        }
      } else if (profile?.role === "teacher") {
        const { data: staffRec } = await supabase.from("staff").select("id").eq("profile_id", profile.id).single();
        if (staffRec) {
          const { data } = await supabase.from("live_classes").select("*, subjects(name), courses(name)").eq("teacher_id", staffRec.id).eq("class_date", today).order("start_time");
          setTodayClasses(data || []);
        }
      }
      setLoading(false);
    })();
  }, [profile?.id, profile?.role, today]);
  if (loading) return <div className="card"><p style={{ color: "var(--muted)" }}>Loading...</p></div>;
  return (
    <div>
      <h1 className="page-title">My Classes</h1>
      <div className="card">
        <h3 style={{ fontSize:15, fontWeight:700, marginBottom:12 }}>Today — {DAYS[new Date().getDay()]}</h3>
        {todayClasses.length===0?<p style={{ color:"var(--muted)" }}>No classes today.</p>:todayClasses.map(cl=>(
          <div key={cl.id} style={{ display:"flex", justifyContent:"space-between", padding:"10px 0", borderBottom:"1px solid var(--border)" }}>
            <div><div style={{ fontWeight:700 }}>{cl.subjects?.name}</div><div style={{ fontSize:12, color:"var(--muted)" }}>{cl.start_time?.slice(0,5)}-{cl.end_time?.slice(0,5)} | {cl.staff?.profiles?.full_name || cl.courses?.name}</div></div>
            <span className={"badge "+(cl.status==="live"?"badge-danger":cl.status==="completed"?"badge-success":"badge-primary")}>{cl.status==="live"?"🔴 LIVE":cl.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ========== TIMETABLE ==========
function TimetableTab({ profile }) {
  const [courses, setCourses] = useState([]); const [selCourse, setSelCourse] = useState(""); const [subjects, setSubjects] = useState([]); const [staffList, setStaffList] = useState([]);
  const [schedules, setSchedules] = useState([]); const [showForm, setShowForm] = useState(false); const [selDay, setSelDay] = useState(new Date().getDay());
  const [form, setForm] = useState({ subjectId: "", teacherId: "", startTime: "", endTime: "", room: "", dayOfWeek: "" });
  const isAdmin = profile?.role === "admin";
  const load = useCallback(async () => { if (!selCourse) return; const { data } = await supabase.from("class_schedules").select("*, subjects(name), staff!inner(profiles!inner(full_name))").eq("course_id", selCourse).order("start_time"); setSchedules(data || []); }, [selCourse]);
  useEffect(() => { supabase.from("courses").select("*").eq("is_active", true).then(({ data }) => { setCourses(data || []); if (data?.length) setSelCourse(data[0].id); }); }, []);
  useEffect(() => { load(); }, [selCourse, load]);
  useEffect(() => { if (selCourse) { supabase.from("subjects").select("*").eq("course_id", selCourse).then(({ data }) => setSubjects(data || [])); supabase.from("staff").select("*, profiles!inner(full_name)").then(({ data }) => setStaffList(data || [])); } }, [selCourse]);
  const addSchedule = async () => { if (!form.subjectId || !form.teacherId || !form.startTime || !form.endTime || form.dayOfWeek === "") return; await supabase.from("class_schedules").insert({ course_id: selCourse, subject_id: form.subjectId, teacher_id: form.teacherId, day_of_week: Number(form.dayOfWeek), start_time: form.startTime, end_time: form.endTime, room: form.room || null }); setForm({ subjectId: "", teacherId: "", startTime: "", endTime: "", room: "", dayOfWeek: "" }); setShowForm(false); load(); };
  const deleteSchedule = async (id) => { await supabase.from("class_schedules").delete().eq("id", id); load(); };
  const daySchedules = schedules.filter(s => s.day_of_week === selDay);
  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:20 }}>
        <h1 className="page-title">Timetable</h1>
        <div style={{ display:"flex", gap:8 }}>{courses.map(c=><button key={c.id} className={"tag "+(selCourse===c.id?"active":"")} onClick={()=>setSelCourse(c.id)}>{c.name}</button>)}</div>
      </div>
      <div style={{ display:"flex", gap:6, marginBottom:16 }}>
        {DAYS.map((d,i)=><button key={i} className={"tag "+(selDay===i?"active":"")} onClick={()=>setSelDay(i)}>{DAYS_SHORT[i]}</button>)}
        {isAdmin&&<button className="btn btn-accent" style={{ marginLeft:"auto" }} onClick={()=>{setShowForm(!showForm);setForm({...form,dayOfWeek:selDay.toString()});}}>+ Add</button>}
      </div>
      {showForm&&isAdmin&&(
        <div className="card" style={{ marginBottom:16 }}>
          <div className="grid-3">
            <div><label className="label">Day</label><select className="select" value={form.dayOfWeek} onChange={e=>setForm({...form,dayOfWeek:e.target.value})}><option value="">Select</option>{DAYS.map((d,i)=><option key={i} value={i}>{d}</option>)}</select></div>
            <div><label className="label">Subject</label><select className="select" value={form.subjectId} onChange={e=>setForm({...form,subjectId:e.target.value})}><option value="">Select</option>{subjects.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
            <div><label className="label">Teacher</label><select className="select" value={form.teacherId} onChange={e=>setForm({...form,teacherId:e.target.value})}><option value="">Select</option>{staffList.map(s=><option key={s.id} value={s.id}>{s.profiles?.full_name}</option>)}</select></div>
          </div>
          <div className="grid-3" style={{ marginTop:12 }}>
            <div><label className="label">Start</label><input className="input" type="time" value={form.startTime} onChange={e=>setForm({...form,startTime:e.target.value})} /></div>
            <div><label className="label">End</label><input className="input" type="time" value={form.endTime} onChange={e=>setForm({...form,endTime:e.target.value})} /></div>
            <div><label className="label">Room</label><input className="input" value={form.room} onChange={e=>setForm({...form,room:e.target.value})} /></div>
          </div>
          <button className="btn btn-success" style={{ marginTop:12 }} onClick={addSchedule}>Save</button>
        </div>
      )}
      <div className="card">
        <h3 style={{ fontSize:15, fontWeight:700, marginBottom:12 }}>{DAYS[selDay]}</h3>
        {daySchedules.length===0?<p className="empty-state">No classes.</p>:(
          <table><thead><tr><th>Time</th><th>Subject</th><th>Teacher</th><th>Room</th>{isAdmin&&<th></th>}</tr></thead>
          <tbody>{daySchedules.map(s=>(
            <tr key={s.id}>
              <td style={{ fontWeight:600 }}>{s.start_time?.slice(0,5)}-{s.end_time?.slice(0,5)}</td>
              <td><span className="badge badge-primary">{s.subjects?.name}</span></td>
              <td>{s.staff?.profiles?.full_name}</td>
              <td>{s.room||"-"}</td>
              {isAdmin&&<td><button style={{ background:"none", border:"none", color:"var(--danger)", cursor:"pointer" }} onClick={()=>deleteSchedule(s.id)}>Del</button></td>}
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
  const isStaff = ["admin","staff","teacher"].includes(profile?.role);
  const today = new Date().toISOString().split("T")[0];
  const load = useCallback(async () => { let q = supabase.from("live_classes").select("*, subjects(name), courses(name), staff!inner(profiles!inner(full_name))").eq("class_date", today); if (selCourse) q = q.eq("course_id", selCourse); const { data } = await q.order("start_time"); setClasses(data || []); }, [selCourse, today]);
  useEffect(() => { supabase.from("courses").select("*").eq("is_active", true).then(({ data }) => { setCourses(data || []); if (data?.length) setSelCourse(data[0].id); }); }, []);
  useEffect(() => { if (selCourse) load(); }, [selCourse, load]);
  const updateStatus = async (id, newStatus) => { await supabase.from("live_classes").update({ status: newStatus }).eq("id", id); load(); };
  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:20 }}>
        <h1 className="page-title">Live Classes</h1>
        <div style={{ display:"flex", gap:8 }}>{courses.map(c=><button key={c.id} className={"tag "+(selCourse===c.id?"active":"")} onClick={()=>setSelCourse(c.id)}>{c.name}</button>)}</div>
      </div>
      {classes.length===0?<div className="card empty-state">No classes today.</div>:classes.map(cl=>(
        <div key={cl.id} className={"card class-card "+(cl.status==="live"?"live":"")} style={{ marginBottom:12 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div>
              <span style={{ fontWeight:700, fontSize:15 }}>{cl.subjects?.name}</span>
              <span className={"badge "+(cl.status==="live"?"badge-danger":cl.status==="completed"?"badge-success":"badge-primary")} style={{ marginLeft:8 }}>{cl.status==="live"?"🔴 LIVE":cl.status}</span>
              <div style={{ fontSize:13, color:"var(--muted)" }}>{cl.start_time?.slice(0,5)}-{cl.end_time?.slice(0,5)} | {cl.staff?.profiles?.full_name}</div>
            </div>
            {isStaff&&(
              <div style={{ display:"flex", gap:8 }}>
                {cl.status==="scheduled"&&<button className="btn btn-danger" onClick={()=>updateStatus(cl.id,"live")}>🔴 Go Live</button>}
                {cl.status==="live"&&<button className="btn btn-success" onClick={()=>updateStatus(cl.id,"completed")}>✅ Complete</button>}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ========== ATTENDANCE ==========
function AttendanceTab({ profile }) {
  const [classes, setClasses] = useState([]); const [selClass, setSelClass] = useState(null); const [students, setStudents] = useState([]); const [att, setAtt] = useState({}); const [saving, setSaving] = useState(false); const [saved, setSaved] = useState(false);
  const today = new Date().toISOString().split("T")[0];
  const isStudentRole = profile?.role === "student" || profile?.role === "guardian";

  useEffect(() => {
    if (isStudentRole) return;
    if (profile?.role === "teacher") {
      supabase.from("staff").select("id").eq("profile_id", profile.id).single().then(({ data: staffRec }) => {
        if (staffRec?.id) supabase.from("live_classes").select("*, subjects(name), courses(name)").eq("class_date", today).eq("teacher_id", staffRec.id).in("status", ["live","completed"]).then(({ data }) => setClasses(data || []));
      });
    } else {
      supabase.from("live_classes").select("*, subjects(name), courses(name)").eq("class_date", today).in("status", ["live","completed"]).then(({ data }) => setClasses(data || []));
    }
  }, [today, profile?.role, profile?.id, isStudentRole]);

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

  // Student view
  if (isStudentRole) {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
      getStudentForProfile(profile.id, profile.role).then(st => {
        if (st) supabase.from("attendance").select("*, live_classes!inner(class_date, subjects(name))").eq("student_id", st.id).order("live_classes(class_date)", { ascending: false }).then(({ data }) => { setRecords(data||[]); setLoading(false); });
        else setLoading(false);
      });
    }, [profile?.id]);
    const present = records.filter(r => r.status==="present"||r.status==="late").length;
    const pct = records.length>0?Math.round((present/records.length)*100):null;
    if (loading) return <div className="card"><p style={{ color:"var(--muted)" }}>Loading...</p></div>;
    return (
      <div>
        <h1 className="page-title">My Attendance</h1>
        <div className="grid-3" style={{ marginBottom:20 }}>
          <StatCard title="Total Classes" value={records.length} variant="primary" />
          <StatCard title="Present" value={present} variant="success" />
          <StatCard title="Attendance %" value={pct!==null?pct+"%":"—"} variant={pct>=75?"success":"danger"} />
        </div>
        <div className="card">
          {records.length===0?<p style={{ color:"var(--muted)" }}>No records.</p>:(
            <table><thead><tr><th>Date</th><th>Subject</th><th>Status</th></tr></thead>
            <tbody>{records.map((r,i)=>(
              <tr key={i}><td>{r.live_classes?.class_date?new Date(r.live_classes.class_date).toLocaleDateString("en-IN"):"-"}</td><td>{r.live_classes?.subjects?.name}</td><td><span className={"badge "+(r.status==="present"?"badge-success":"badge-danger")}>{r.status}</span></td></tr>
            ))}</tbody></table>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="page-title">Attendance</h1>
      <div style={{ display:"flex", gap:12, marginBottom:20, flexWrap:"wrap" }}>
        {classes.length===0&&<p style={{ color:"var(--muted)", fontSize:13 }}>No live classes today.</p>}
        {classes.map(cl=><button key={cl.id} className={"tag "+(selClass?.id===cl.id?"active":"")} onClick={()=>setSelClass(cl)}>{cl.subjects?.name} ({cl.start_time?.slice(0,5)})</button>)}
      </div>
      {selClass&&(
        <div className="card">
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:16 }}>
            <h3 style={{ fontSize:15, fontWeight:700 }}>{selClass.subjects?.name}</h3>
            <div style={{ display:"flex", gap:8 }}>
              {saved&&<span style={{ color:"var(--success)", fontSize:13, fontWeight:600 }}>✓ Saved!</span>}
              <button className="btn btn-success" onClick={save} disabled={saving}>{saving?"Saving...":"Save"}</button>
            </div>
          </div>
          <table><thead><tr><th>#</th><th>Student</th><th>Status</th></tr></thead>
          <tbody>{students.map((st,i)=>(
            <tr key={st.id}>
              <td>{i+1}</td><td style={{ fontWeight:600 }}>{st.profiles?.full_name}</td>
              <td><div style={{ display:"flex", gap:6 }}>{["present","absent","late","excused"].map(status=>(<button key={status} className={"att-btn "+(att[st.id]===status?status:"")} onClick={()=>setAtt({...att,[st.id]:status})}>{status}</button>))}</div></td>
            </tr>
          ))}</tbody></table>
        </div>
      )}
    </div>
  );
}

// ========== FEES ==========
function FeesTab({ profile }) {
  const [students, setStudents] = useState([]);
  const [selSt, setSelSt] = useState(null);
  const [hostelFees, setHostelFees] = useState([]);
  const isAdmin = profile?.role === "admin";
  const isStudent = profile?.role === "student" || profile?.role === "guardian";

  const loadStudentFees = useCallback(async (student) => {
    setSelSt(student);
    const { data: hf } = await supabase.from("hostel_fees").select("*").eq("student_id", student.id).order("payment_date", { ascending: false });
    setHostelFees(hf || []);
  }, []);

  useEffect(() => {
    if (isStudent) {
      getStudentForProfile(profile.id, profile.role).then((data) => {
        if (data) { setStudents([data]); loadStudentFees(data); }
      });
    } else {
      supabase.from("students").select("*, profiles!inner(full_name)").eq("status", "active").then(({ data }) => setStudents(data || []));
    }
  }, [isStudent, profile?.id, loadStudentFees]);

  const totalPaid = hostelFees.reduce((a, f) => a + Number(f.amount || 0), 0);

  return (
    <div>
      <h1 className="page-title">Fees</h1>
      <div style={{ display:"flex", gap:20 }}>
        {!isStudent&&(
          <div style={{ width:260, flexShrink:0 }}>
            <div className="card" style={{ maxHeight:500, overflowY:"auto" }}>
              {students.map(st=><div key={st.id} className={"student-item "+(selSt?.id===st.id?"active":"")} onClick={()=>loadStudentFees(st)}>{st.profiles?.full_name}</div>)}
            </div>
          </div>
        )}
        <div style={{ flex:1 }}>
          {!selSt?<div className="card empty-state">Select student</div>:(
            <div>
              <StatCard title="Total Paid (Hostel)" value={"₹"+totalPaid.toLocaleString()} variant="success" />
              <div className="card" style={{ marginTop:16 }}>
                <h3 style={{ fontSize:15, fontWeight:700, marginBottom:12 }}>Payment History</h3>
                {hostelFees.length===0?<p style={{ color:"var(--muted)" }}>No payments.</p>:(
                  <table><thead><tr><th>Date</th><th>Month</th><th>Amount</th><th>Mode</th></tr></thead>
                  <tbody>{hostelFees.map(f=>(
                    <tr key={f.id}><td>{new Date(f.payment_date).toLocaleDateString("en-IN")}</td><td>{f.fee_month}</td><td style={{ fontWeight:700, color:"var(--success)" }}>₹{Number(f.amount).toLocaleString()}</td><td>{f.payment_mode}</td></tr>
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
  const [marksTest, setMarksTest] = useState(null); const [students, setStudents] = useState([]); const [marks, setMarks] = useState({}); const [savingMarks, setSavingMarks] = useState(false);
  const canCreate = profile?.role === "admin" || profile?.role === "teacher";
  const loadTests = async () => { const { data } = await supabase.from("tests").select("*, courses(name), subjects(name)").order("test_date", { ascending: false }); setTests(data || []); };
  useEffect(() => { loadTests(); supabase.from("courses").select("*").eq("is_active", true).then(({ data }) => setCourses(data || [])); }, []);
  useEffect(() => { if (form.courseId) supabase.from("subjects").select("*").eq("course_id", form.courseId).then(({ data }) => setSubjects(data || [])); }, [form.courseId]);
  const add = async () => { if (!form.name || !form.courseId || !form.subjectId || !form.totalMarks || !form.testDate) return; await supabase.from("tests").insert({ name: form.name, course_id: form.courseId, subject_id: form.subjectId, total_marks: Number(form.totalMarks), test_date: form.testDate }); setShowForm(false); loadTests(); };
  const openMarks = async (test) => { setMarksTest(test); const { data: stData } = await supabase.from("students").select("*, profiles!inner(full_name)").eq("course_id", test.course_id).eq("status", "active"); setStudents(stData || []); const { data: ex } = await supabase.from("test_results").select("*").eq("test_id", test.id); const map = {}; (ex || []).forEach(r => { map[r.student_id] = r.marks_obtained?.toString() || ""; }); (stData || []).forEach(st => { if (!(st.id in map)) map[st.id] = ""; }); setMarks(map); };
  const saveMarks = async () => { setSavingMarks(true); const records = Object.entries(marks).filter(([, v]) => v !== "").map(([sid, val]) => ({ test_id: marksTest.id, student_id: sid, marks_obtained: Number(val) })); if (records.length > 0) await supabase.from("test_results").upsert(records, { onConflict: "test_id,student_id" }); setSavingMarks(false); };
  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:20 }}>
        <h1 className="page-title">Tests</h1>
        {canCreate&&<button className="btn btn-accent" onClick={()=>setShowForm(!showForm)}>+ Create Test</button>}
      </div>
      {showForm&&canCreate&&(
        <div className="card" style={{ marginBottom:20 }}>
          <div className="grid-3">
            <div><label className="label">Name</label><input className="input" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} /></div>
            <div><label className="label">Course</label><select className="select" value={form.courseId} onChange={e=>setForm({...form,courseId:e.target.value,subjectId:""})}><option value="">Select</option>{courses.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
            <div><label className="label">Subject</label><select className="select" value={form.subjectId} onChange={e=>setForm({...form,subjectId:e.target.value})}><option value="">Select</option>{subjects.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
          </div>
          <div className="grid-2" style={{ marginTop:12 }}>
            <div><label className="label">Total Marks</label><input className="input" type="number" value={form.totalMarks} onChange={e=>setForm({...form,totalMarks:e.target.value})} /></div>
            <div><label className="label">Date</label><input className="input" type="date" value={form.testDate} onChange={e=>setForm({...form,testDate:e.target.value})} /></div>
          </div>
          <button className="btn btn-success" style={{ marginTop:12 }} onClick={add}>Save Test</button>
        </div>
      )}
      <div style={{ display:"flex", gap:20 }}>
        <div style={{ width:340, flexShrink:0 }}>
          <div className="card">{tests.map(t=>(
            <div key={t.id} style={{ padding:"10px 0", borderBottom:"1px solid var(--border)", cursor:"pointer" }} onClick={()=>openMarks(t)}>
              <div style={{ fontWeight:600 }}>{t.name}</div>
              <div style={{ fontSize:12, color:"var(--muted)" }}>{t.courses?.name} | {t.subjects?.name} | {t.total_marks} marks</div>
            </div>
          ))}</div>
        </div>
        <div style={{ flex:1 }}>
          {!marksTest?<div className="card empty-state">Select test</div>:(
            <div className="card">
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:16 }}>
                <h3 style={{ fontSize:15, fontWeight:700 }}>{marksTest.name} ({marksTest.total_marks} marks)</h3>
                {canCreate&&<button className="btn btn-success" onClick={saveMarks} disabled={savingMarks}>{savingMarks?"...":"Save Marks"}</button>}
              </div>
              <table><thead><tr><th>#</th><th>Student</th><th>Marks</th><th>%</th></tr></thead>
              <tbody>{students.map((st,i)=>{const val=marks[st.id]||"";const pct=val?Math.round((Number(val)/marksTest.total_marks)*100):null;return(
                <tr key={st.id}><td>{i+1}</td><td style={{ fontWeight:600 }}>{st.profiles?.full_name}</td>
                <td>{canCreate?<input className="input" type="number" style={{ width:100 }} value={val} onChange={e=>setMarks({...marks,[st.id]:e.target.value})} />:<span>{val||"-"}</span>}</td>
                <td>{pct!==null?<span className={"badge "+(pct>=40?"badge-success":"badge-danger")}>{pct}%</span>:"-"}</td></tr>
              );})}</tbody></table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ========== HOSTEL (simplified) ==========
function HostelTab() {
  const [allotments, setAllotments] = useState([]);
  const [hostelFees, setHostelFees] = useState([]);
  const [students, setStudents] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [view, setView] = useState("allotments");
  const [showFeeForm, setShowFeeForm] = useState(false);
  const [feeForm, setFeeForm] = useState({ studentId: "", amount: "", feeMonth: "", paymentMode: "cash" });
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);

  const loadAll = async () => {
    const [a, s, hf, r] = await Promise.all([
      supabase.from("hostel_allotments").select("*, students!inner(id, admission_number, profiles!inner(full_name, phone)), hostel_rooms!inner(room_number, monthly_rent, hostels!inner(name))").eq("status", "active"),
      supabase.from("students").select("id, admission_number, profiles!inner(full_name, phone)").eq("status", "active"),
      supabase.from("hostel_fees").select("*, students!inner(admission_number, profiles!inner(full_name))").order("payment_date", { ascending: false }),
      supabase.from("hostel_rooms").select("*, hostels(name)"),
    ]);
    setAllotments(a.data||[]); setStudents(s.data||[]); setHostelFees(hf.data||[]); setRooms(r.data||[]);
  };
  useEffect(() => { loadAll(); }, []);

  const collectFee = async () => {
    if (!feeForm.studentId || !feeForm.amount || !feeForm.feeMonth) { setMsg("❌ Sab fields bharo!"); return; }
    setSaving(true);
    const rcpNo = "HF-" + Date.now();
    await supabase.from("hostel_fees").insert({ student_id: feeForm.studentId, amount: Number(feeForm.amount), fee_month: feeForm.feeMonth, payment_mode: feeForm.paymentMode, receipt_number: rcpNo });
    await supabase.from("income_records").insert({ category: "hostel_fee", amount: Number(feeForm.amount), description: "Hostel Fee | " + feeForm.feeMonth, payment_mode: feeForm.paymentMode, income_date: new Date().toISOString().split("T")[0], receipt_number: rcpNo, student_id: feeForm.studentId });
    setFeeForm({ studentId: "", amount: "", feeMonth: "", paymentMode: "cash" }); setShowFeeForm(false); setSaving(false);
    setMsg("✅ Fee collected!"); await loadAll();
  };

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:20 }}>
        <h1 className="page-title">Hostel</h1>
        <div style={{ display:"flex", gap:8 }}>
          {["allotments","fees"].map(v=><button key={v} className={"tag "+(view===v?"active":"")} onClick={()=>setView(v)}>{v.charAt(0).toUpperCase()+v.slice(1)}</button>)}
        </div>
      </div>
      {msg&&<div className={msg.startsWith("❌")?"error-box":"success-box"} style={{ marginBottom:12 }}>{msg}</div>}
      <div className="grid-3" style={{ marginBottom:16 }}>
        <StatCard title="Hostelers" value={allotments.length} variant="primary" />
        <StatCard title="Total Rooms" value={rooms.length} variant="success" />
        <StatCard title="Fee Records" value={hostelFees.length} variant="warning" />
      </div>
      {view==="allotments"&&(
        <div className="card">
          <h3 style={{ fontSize:15, fontWeight:700, marginBottom:12 }}>Room Allotments</h3>
          {allotments.length===0?<p className="empty-state">No allotments.</p>:(
            <table><thead><tr><th>Student</th><th>Room</th><th>Hostel</th><th>Rent/Mo</th></tr></thead>
            <tbody>{allotments.map(a=>(
              <tr key={a.id}><td style={{ fontWeight:600 }}>{a.students?.profiles?.full_name}</td><td>Room {a.hostel_rooms?.room_number}</td><td>{a.hostel_rooms?.hostels?.name}</td><td>₹{Number(a.hostel_rooms?.monthly_rent||0).toLocaleString()}</td></tr>
            ))}</tbody></table>
          )}
        </div>
      )}
      {view==="fees"&&(
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12 }}>
            <h3 style={{ fontSize:16, fontWeight:700 }}>Hostel Fees</h3>
            <button className="btn btn-success" onClick={()=>setShowFeeForm(!showFeeForm)}>+ Collect Fee</button>
          </div>
          {showFeeForm&&(
            <div className="card" style={{ marginBottom:14 }}>
              <div className="grid-2">
                <div><label className="label">Student</label><select className="select" value={feeForm.studentId} onChange={e=>setFeeForm({...feeForm,studentId:e.target.value})}><option value="">Select</option>{allotments.map(a=><option key={a.student_id} value={a.student_id}>{a.students?.profiles?.full_name} | Room {a.hostel_rooms?.room_number}</option>)}</select></div>
                <div><label className="label">Month</label><input className="input" value={feeForm.feeMonth} onChange={e=>setFeeForm({...feeForm,feeMonth:e.target.value})} placeholder="e.g. April 2026" /></div>
              </div>
              <div className="grid-2" style={{ marginTop:10 }}>
                <div><label className="label">Amount (₹)</label><input className="input" type="number" value={feeForm.amount} onChange={e=>setFeeForm({...feeForm,amount:e.target.value})} /></div>
                <div><label className="label">Mode</label><select className="select" value={feeForm.paymentMode} onChange={e=>setFeeForm({...feeForm,paymentMode:e.target.value})}><option value="cash">Cash</option><option value="upi">UPI</option><option value="bank_transfer">Bank</option></select></div>
              </div>
              <button className="btn btn-success" style={{ marginTop:12 }} onClick={collectFee} disabled={saving}>{saving?"Processing...":"Collect Fee"}</button>
            </div>
          )}
          <div className="card">
            {hostelFees.length===0?<p className="empty-state">No fees collected.</p>:(
              <table><thead><tr><th>Student</th><th>Month</th><th>Amount</th><th>Mode</th><th>Date</th></tr></thead>
              <tbody>{hostelFees.map(f=>(
                <tr key={f.id}><td style={{ fontWeight:600 }}>{f.students?.profiles?.full_name}</td><td>{f.fee_month}</td><td style={{ fontWeight:700, color:"var(--success)" }}>₹{Number(f.amount).toLocaleString()}</td><td>{f.payment_mode}</td><td style={{ fontSize:12 }}>{new Date(f.payment_date).toLocaleDateString("en-IN")}</td></tr>
              ))}</tbody></table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ========== ACCOUNTS (simplified) ==========
function AccountsTab() {
  const [incomes, setIncomes] = useState([]); const [expenses, setExpenses] = useState([]);
  const [view, setView] = useState("overview");
  const loadData = async () => {
    const [incR, expR] = await Promise.all([
      supabase.from("income_records").select("*").order("income_date", { ascending: false }).limit(100),
      supabase.from("expense_records").select("*").order("expense_date", { ascending: false }).limit(100),
    ]);
    setIncomes(incR.data||[]); setExpenses(expR.data||[]);
  };
  useEffect(() => { loadData(); }, []);
  const totalInc = incomes.reduce((a,i)=>a+Number(i.amount||0),0);
  const totalExp = expenses.reduce((a,e)=>a+Number(e.amount||0),0);
  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:20 }}>
        <h1 className="page-title">Accounts</h1>
        <div style={{ display:"flex", gap:8 }}>{["overview","income","expenses"].map(v=><button key={v} className={"tag "+(view===v?"active":"")} onClick={()=>setView(v)}>{v.charAt(0).toUpperCase()+v.slice(1)}</button>)}</div>
      </div>
      {view==="overview"&&(
        <div className="grid-3" style={{ marginBottom:20 }}>
          <StatCard title="Total Income" value={"₹"+totalInc.toLocaleString()} variant="success" />
          <StatCard title="Total Expenses" value={"₹"+totalExp.toLocaleString()} variant="danger" />
          <StatCard title={totalInc-totalExp>=0?"Net Profit":"Net Loss"} value={"₹"+Math.abs(totalInc-totalExp).toLocaleString()} variant={totalInc-totalExp>=0?"success":"danger"} />
        </div>
      )}
      {view==="income"&&(
        <div className="card">
          <h3 style={{ fontSize:15, fontWeight:700, marginBottom:12 }}>Income</h3>
          <table><thead><tr><th>Date</th><th>Category</th><th>Description</th><th>Amount</th></tr></thead>
          <tbody>{incomes.map(i=>(
            <tr key={i.id}><td>{new Date(i.income_date).toLocaleDateString("en-IN")}</td><td><span className="badge badge-success">{i.category}</span></td><td style={{ fontSize:12 }}>{i.description||"-"}</td><td style={{ fontWeight:700, color:"var(--success)" }}>₹{Number(i.amount).toLocaleString()}</td></tr>
          ))}</tbody></table>
        </div>
      )}
      {view==="expenses"&&(
        <div className="card">
          <h3 style={{ fontSize:15, fontWeight:700, marginBottom:12 }}>Expenses</h3>
          <table><thead><tr><th>Date</th><th>Category</th><th>Description</th><th>Amount</th></tr></thead>
          <tbody>{expenses.map(e=>(
            <tr key={e.id}><td>{new Date(e.expense_date).toLocaleDateString("en-IN")}</td><td><span className="badge badge-danger">{e.category}</span></td><td style={{ fontSize:12 }}>{e.description||"-"}</td><td style={{ fontWeight:700, color:"var(--danger)" }}>₹{Number(e.amount).toLocaleString()}</td></tr>
          ))}</tbody></table>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// GUARDIANS TAB — FIXED: Phone-only login, no email needed
// ══════════════════════════════════════════════════════════════
function GuardiansTab() {
  const [students, setStudents] = useState([]);
  const [selStudent, setSelStudent] = useState(null);
  const [guardians, setGuardians] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ fullName: "", phone: "", relation: "father", occupation: "" });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    supabase.from("students").select("*, profiles!inner(full_name)").eq("status","active").order("created_at",{ascending:false}).then(({data})=>setStudents(data||[]));
  }, []);

  const loadGuardians = async (student) => {
    setSelStudent(student); setShowForm(false); setMsg("");
    const { data: sgData } = await supabase.from("student_guardians")
      .select("*, guardians(*, profiles(full_name, phone))").eq("student_id", student.id);
    setGuardians(sgData||[]);
  };

  const addGuardian = async () => {
    if (!form.fullName || !form.phone) { setMsg("❌ Naam aur mobile number zaruri hai!"); return; }
    const phone = form.phone.replace(/[^0-9]/g,"");
    if (phone.length !== 10) { setMsg("❌ 10-digit mobile number daalo!"); return; }
    setLoading(true); setMsg("");
    try {
      const gEmail = makeInternalEmail(phone);
      const gPass = makePasswordFromPhone(phone);
      let gProfileId = null;

      // Check existing profile with this phone
      const { data: existProf } = await supabase.from("profiles")
        .select("id").eq("phone", phone).single();

      if (existProf?.id) {
        gProfileId = existProf.id;
        await supabase.from("profiles").update({ 
          full_name: form.fullName, role: "guardian" 
        }).eq("id", gProfileId);
      } else {
        // Create new auth account
        const { data: gId, error: gAuthErr } = await supabase.rpc("create_guardian_account", {
          p_email: gEmail, p_password: gPass, p_full_name: form.fullName
        });
        if (gAuthErr) throw gAuthErr;
        if (!gId) throw new Error("Account creation failed");
        gProfileId = gId;
        // FORCE correct name + phone + role
        await supabase.from("profiles").update({
          full_name: form.fullName,
          phone: phone,
          role: "guardian"
        }).eq("id", gProfileId);
      }

      if (gProfileId) {
        const { data: existG } = await supabase.from("guardians")
          .select("id").eq("profile_id", gProfileId).single();
        let guardianId = existG?.id;
        if (!guardianId) {
          const { data: newG } = await supabase.from("guardians").insert({
            profile_id: gProfileId, relation: form.relation || null, occupation: form.occupation || null
          }).select().single();
          guardianId = newG?.id;
        }
        if (guardianId) {
          const { data: existLink } = await supabase.from("student_guardians")
            .select("id").eq("student_id", selStudent.id).eq("guardian_id", guardianId).single();
          if (!existLink) {
            await supabase.from("student_guardians").insert({
              student_id: selStudent.id, guardian_id: guardianId, is_primary: guardians.length === 0
            });
          }
        }
      }
      setMsg("✅ Guardian added!\n📱 Login: " + phone + "\n🔑 Password: " + gPass);
      setForm({ fullName: "", phone: "", relation: "father", occupation: "" });
      setShowForm(false);
      loadGuardians(selStudent);
    } catch (e) { setMsg("❌ " + e.message); }
    setLoading(false);
  };

  const sendPasswordWA = (sg) => {
    const phone = (sg.guardians?.profiles?.phone || "").replace(/[^0-9]/g,"");
    if (!phone) { setMsg("❌ Phone nahi hai!"); return; }
    const pass = makePasswordFromPhone(phone);
    const text = "🔐 *MY CAREER ACADEMIC*\n\nDear " + (sg.guardians?.profiles?.full_name||"") + ",\n\nLogin details:\n• Website: my-career-academic.vercel.app\n• Login ID: " + phone + "\n• Password: " + pass + "\n\nHelp: 06727796700\n\n_My Career Academic_";
    window.open("https://wa.me/91"+phone+"?text="+encodeURIComponent(text),"_blank");
  };

  const fixLogin = async (sg) => {
    const phone = (sg.guardians?.profiles?.phone || "").replace(/[^0-9]/g,"");
    const name = sg.guardians?.profiles?.full_name || "";
    if (!phone || phone.length !== 10) { setMsg("❌ Phone nahi hai! Pehle phone add karo."); return; }
    setLoading(true);
    const gEmail = makeInternalEmail(phone);
    const gPass = makePasswordFromPhone(phone);
    try {
      const { data: newId } = await supabase.rpc("create_guardian_account", {
        p_email: gEmail, p_password: gPass, p_full_name: name
      });
      if (newId) {
        await supabase.from("profiles").update({ phone, full_name: name, role: "guardian" }).eq("id", newId);
        await supabase.from("guardians").update({ profile_id: newId }).eq("id", sg.guardian_id);
      }
      setMsg("✅ Login fix ho gaya!\n📱 Login: " + phone + "\n🔑 Password: " + gPass);
      loadGuardians(selStudent);
    } catch (e) { setMsg("❌ " + e.message); }
    setLoading(false);
  };

  return (
    <div>
      <h1 className="page-title">Guardians</h1>
      <div style={{ display:"flex", gap:20 }}>
        <div style={{ width:260, flexShrink:0 }}>
          <div className="card" style={{ maxHeight:500, overflowY:"auto" }}>
            {students.map(st=><div key={st.id} className={"student-item "+(selStudent?.id===st.id?"active":"")} onClick={()=>loadGuardians(st)}>{st.profiles?.full_name}</div>)}
          </div>
        </div>
        <div style={{ flex:1 }}>
          {!selStudent?<div className="card empty-state">Student select karo</div>:(
            <div>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:16 }}>
                <h3 style={{ fontSize:17, fontWeight:700 }}>{selStudent.profiles?.full_name} ke Guardians</h3>
                <button className="btn btn-accent" onClick={()=>setShowForm(!showForm)}>+ Add Guardian</button>
              </div>
              {msg&&<div className={msg.startsWith("❌")?"error-box":"success-box"} style={{ marginBottom:12, whiteSpace:"pre-line" }}>{msg}</div>}
              {showForm&&(
                <div className="card" style={{ marginBottom:16 }}>
                  <div className="grid-3">
                    <div><label className="label">Guardian Ka Naam *</label><input className="input" value={form.fullName} onChange={e=>setForm({...form,fullName:e.target.value})} placeholder="Father / Mother naam" /></div>
                    <div><label className="label">Mobile Number * (Login ID)</label><input className="input" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="10-digit mobile" /></div>
                    <div><label className="label">Relation</label><select className="select" value={form.relation} onChange={e=>setForm({...form,relation:e.target.value})}><option value="father">Father</option><option value="mother">Mother</option><option value="guardian">Guardian</option></select></div>
                  </div>
                  {form.phone && form.phone.replace(/[^0-9]/g,"").length === 10 && (
                    <div style={{ marginTop:8, padding:"8px 12px", background:"var(--success-light)", borderRadius:6, fontSize:12 }}>
                      ✅ Password hoga: <b>{makePasswordFromPhone(form.phone)}</b>
                    </div>
                  )}
                  <button className="btn btn-success" style={{ marginTop:12 }} onClick={addGuardian} disabled={loading}>{loading?"Adding...":"Save Guardian"}</button>
                </div>
              )}
              {guardians.length===0?<div className="card empty-state">No guardians. "+ Add Guardian" click karo.</div>:guardians.map(sg=>(
                <div key={sg.id} className="card" style={{ marginBottom:12 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                    <div>
                      <span style={{ fontWeight:700, fontSize:15 }}>{sg.guardians?.profiles?.full_name}</span>
                      {sg.is_primary&&<span className="badge badge-success" style={{ marginLeft:6 }}>Primary</span>}
                      {sg.guardians?.relation&&<span className="badge badge-primary" style={{ marginLeft:6 }}>{sg.guardians.relation}</span>}
                      <div style={{ fontSize:13, color:"var(--muted)", marginTop:4 }}>📱 {sg.guardians?.profiles?.phone||"No phone"}</div>
                      <div style={{ fontSize:12, marginTop:4, padding:"4px 10px", background:"var(--success-light)", borderRadius:6 }}>
                        Login: <b>{sg.guardians?.profiles?.phone||"?"}</b> | Password: <b>{sg.guardians?.profiles?.phone ? makePasswordFromPhone(sg.guardians.profiles.phone) : "?"}</b>
                      </div>
                    </div>
                    <div style={{ display:"flex", gap:6 }}>
                      <button className="btn" style={{ fontSize:12, background:"#e67e22", border:"none" }} onClick={()=>fixLogin(sg)}>🔧 Fix</button>
                      <button className="btn" style={{ fontSize:12, background:"#25D366", border:"none" }} onClick={()=>sendPasswordWA(sg)}>📱 Send</button>
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

// ========== STAFF ==========
function StaffTab() {
  const [staffList, setStaffList] = useState([]); const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", designation: "", specialization: "", salary: "", ratePerClass: "", role: "teacher" });
  const [loading, setLoading] = useState(false); const [msg, setMsg] = useState("");
  const loadStaff = async () => { const { data } = await supabase.from("staff").select("*, profiles!inner(full_name, phone, email, role)"); setStaffList(data || []); };
  useEffect(() => { loadStaff(); }, []);
  const add = async () => {
    if (!form.fullName || !form.email) { setMsg("❌ Name aur email zaruri hai!"); return; }
    setLoading(true);
    try {
      const namePart = form.fullName.replace(/[^a-zA-Z]/g,"").slice(0,4).toUpperCase();
      const phonePart = form.phone.replace(/[^0-9]/g,"").slice(-4) || "1234";
      const tempPass = namePart + "@" + phonePart;
      const { data: userId, error: authErr } = await supabase.rpc("create_staff_account", { p_email: form.email, p_password: tempPass, p_full_name: form.fullName, p_role: form.role });
      if (authErr) throw authErr;
      if (!userId) throw new Error("Failed");
      await supabase.from("profiles").update({ phone: form.phone || null }).eq("id", userId);
      await supabase.from("staff").insert({ profile_id: userId, designation: form.designation || null, subject_specialization: form.specialization || null, salary: form.salary ? Number(form.salary) : null, rate_per_class: form.ratePerClass ? Number(form.ratePerClass) : null });
      setMsg("✅ Staff added!\n📧 Email: " + form.email + "\n🔑 Password: " + tempPass);
      setShowForm(false); setForm({ fullName: "", email: "", phone: "", designation: "", specialization: "", salary: "", ratePerClass: "", role: "teacher" });
      loadStaff();
    } catch (e) { setMsg("❌ " + e.message); }
    setLoading(false);
  };
  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:20 }}>
        <h1 className="page-title">Staff</h1>
        <button className="btn btn-accent" onClick={()=>setShowForm(!showForm)}>+ Add Staff</button>
      </div>
      {msg&&<div className={msg.startsWith("❌")?"error-box":"success-box"} style={{ whiteSpace:"pre-line", marginBottom:16 }}>{msg}</div>}
      {showForm&&(
        <div className="card" style={{ marginBottom:20 }}>
          <div className="grid-3">
            <div><label className="label">Full Name *</label><input className="input" value={form.fullName} onChange={e=>setForm({...form,fullName:e.target.value})} /></div>
            <div><label className="label">Email * (Login ID)</label><input className="input" type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} /></div>
            <div><label className="label">Phone</label><input className="input" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} /></div>
          </div>
          <div className="grid-3" style={{ marginTop:12 }}>
            <div><label className="label">Subject</label><input className="input" value={form.specialization} onChange={e=>setForm({...form,specialization:e.target.value})} /></div>
            <div><label className="label">Rate/Class (₹)</label><input className="input" type="number" value={form.ratePerClass} onChange={e=>setForm({...form,ratePerClass:e.target.value})} /></div>
            <div><label className="label">Role</label><select className="select" value={form.role} onChange={e=>setForm({...form,role:e.target.value})}><option value="teacher">Teacher</option><option value="staff">Staff</option><option value="helper">Helper</option><option value="cooker">Cooker</option><option value="cleaner">Cleaner</option></select></div>
          </div>
          <button className="btn btn-success" style={{ marginTop:14 }} onClick={add} disabled={loading}>{loading?"Creating...":"Add Staff"}</button>
        </div>
      )}
      <div className="card">
        {staffList.length===0?<p className="empty-state">No staff.</p>:(
          <table><thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Subject</th><th>Rate</th></tr></thead>
          <tbody>{staffList.map(st=>(
            <tr key={st.id}>
              <td style={{ fontWeight:700 }}>{st.profiles?.full_name}</td>
              <td style={{ fontSize:12 }}>{st.profiles?.email}</td>
              <td>{st.profiles?.phone||"-"}</td>
              <td><span className="badge badge-primary">{st.profiles?.role}</span></td>
              <td>{st.subject_specialization||"-"}</td>
              <td>{st.rate_per_class?"₹"+st.rate_per_class+"/class":"-"}</td>
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
  const isAdmin = profile?.role === "admin";
  const loadNotices = async () => { const { data } = await supabase.from("notifications").select("*").order("created_at", { ascending: false }).limit(50); setNotices(data || []); };
  useEffect(() => { loadNotices(); }, []);
  const send = async () => { if (!form.title) return; await supabase.from("notifications").insert({ title: form.title, body: form.body || null, target_role: form.targetRole || null }); setForm({ title: "", body: "", targetRole: "" }); setShowForm(false); loadNotices(); };
  const myNotices = notices.filter(n => !n.target_role || n.target_role === profile?.role);
  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:20 }}>
        <h1 className="page-title">Notices</h1>
        {isAdmin&&<button className="btn btn-accent" onClick={()=>setShowForm(!showForm)}>+ New Notice</button>}
      </div>
      {showForm&&(
        <div className="card" style={{ marginBottom:20 }}>
          <div className="form-group"><label className="label">Title *</label><input className="input" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} /></div>
          <div className="form-group"><label className="label">Message</label><textarea className="input" rows={3} value={form.body} onChange={e=>setForm({...form,body:e.target.value})} style={{ resize:"vertical" }} /></div>
          <div className="form-group"><label className="label">Send To</label><select className="select" value={form.targetRole} onChange={e=>setForm({...form,targetRole:e.target.value})}><option value="">Everyone</option><option value="student">Students</option><option value="teacher">Teachers</option><option value="guardian">Guardians</option></select></div>
          <button className="btn btn-success" onClick={send}>Send Notice</button>
        </div>
      )}
      {myNotices.length===0?<div className="card empty-state">No notices.</div>:myNotices.map(n=>(
        <div key={n.id} className="card" style={{ marginBottom:12, borderLeft:n.is_read?"4px solid var(--border)":"4px solid var(--primary)" }}>
          <div style={{ fontWeight:700, fontSize:15 }}>{n.title} {!n.is_read&&<span className="badge badge-primary">New</span>}</div>
          {n.body&&<p style={{ fontSize:13, color:"var(--muted)", marginTop:4 }}>{n.body}</p>}
          <p style={{ fontSize:11, color:"var(--muted)", marginTop:8 }}>{new Date(n.created_at).toLocaleString("en-IN")}</p>
        </div>
      ))}
    </div>
  );
}

// ========== PROGRESS ==========
function ProgressTab({ profile }) {
  const [subjects, setSubjects] = useState([]); const [chapters, setChapters] = useState([]); const [selSub, setSelSub] = useState(""); const [progress, setProgress] = useState({});
  const isStudent = profile?.role === "student" || profile?.role === "guardian";
  const [studentId, setStudentId] = useState(null);
  useEffect(() => {
    if (isStudent) {
      getStudentForProfile(profile.id, profile.role).then((data) => {
        if (data) { setStudentId(data.id); supabase.from("subjects").select("*, courses(name)").eq("course_id", data.course_id).then(({ data: subs }) => setSubjects(subs || [])); }
      });
    } else { supabase.from("subjects").select("*, courses(name)").then(({ data }) => setSubjects(data || [])); }
  }, [isStudent, profile?.id]);
  useEffect(() => {
    if (selSub) {
      supabase.from("chapters").select("*").eq("subject_id", selSub).order("sort_order").then(({ data }) => setChapters(data || []));
      if (studentId) supabase.from("chapter_progress").select("chapter_id").eq("student_id", studentId).eq("is_completed", true).then(({ data }) => { const map = {}; (data || []).forEach(p => { map[p.chapter_id] = true; }); setProgress(map); });
    }
  }, [selSub, studentId]);
  const toggleChapter = async (chId) => {
    if (!studentId || !isStudent) return;
    if (progress[chId]) { await supabase.from("chapter_progress").delete().eq("student_id", studentId).eq("chapter_id", chId); }
    else { await supabase.from("chapter_progress").upsert({ student_id: studentId, chapter_id: chId, is_completed: true, completed_at: new Date().toISOString() }, { onConflict: "student_id,chapter_id" }); }
    setProgress(p => ({ ...p, [chId]: !progress[chId] }));
  };
  const done = chapters.filter(ch => progress[ch.id]).length;
  return (
    <div>
      <h1 className="page-title">Progress</h1>
      <div style={{ display:"flex", gap:8, marginBottom:20, flexWrap:"wrap" }}>
        {subjects.map(s=><button key={s.id} className={"tag "+(selSub===s.id?"active":"")} onClick={()=>setSelSub(s.id)}>{s.name}</button>)}
      </div>
      {selSub&&chapters.length>0&&(
        <div className="card" style={{ marginBottom:16, background:"var(--primary-light)" }}>
          <span style={{ fontWeight:600 }}>{done}/{chapters.length} chapters done</span>
          <span style={{ fontWeight:700, fontSize:18, color:"var(--primary)", marginLeft:12 }}>{Math.round((done/chapters.length)*100)}%</span>
        </div>
      )}
      {selSub&&(
        <div className="card">
          {chapters.length===0?<p style={{ color:"var(--muted)" }}>No chapters.</p>:(
            <table><thead><tr><th>#</th><th>Chapter</th><th>Status</th></tr></thead>
            <tbody>{chapters.map((ch,i)=>(
              <tr key={ch.id}><td>{i+1}</td><td>{ch.name}</td>
              <td>{isStudent?<button onClick={()=>toggleChapter(ch.id)} className={"badge "+(progress[ch.id]?"badge-success":"badge-muted")} style={{ cursor:"pointer", border:"none" }}>{progress[ch.id]?"✓ Done":"Pending"}</button>:<span className={"badge "+(progress[ch.id]?"badge-success":"badge-muted")}>{progress[ch.id]?"✓":"Pending"}</span>}</td>
              </tr>
            ))}</tbody></table>
          )}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// USERS TAB — FIXED: Correct WhatsApp messages with phone login
// ══════════════════════════════════════════════════════════════
function UsersTab() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({ full_name: "", phone: "", role: "" });
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    setUsers(data || []);
    setLoading(false);
  };
  useEffect(() => { loadUsers(); }, []);

  const filtered = users.filter(u => {
    const s = search.toLowerCase();
    const matchSearch = !search || u.full_name?.toLowerCase().includes(s) || u.email?.toLowerCase().includes(s) || u.phone?.includes(s);
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const saveEdit = async () => {
    if (!editUser) return;
    setSaving(true);
    await supabase.from("profiles").update({ 
      full_name: editForm.full_name, 
      phone: editForm.phone || null, 
      role: editForm.role 
    }).eq("id", editUser.id);
    setMsg("✅ " + editForm.full_name + " updated!"); 
    setEditUser(null); setSaving(false); loadUsers();
  };

  // FIXED: WhatsApp message uses correct login format based on role
  const sendPasswordWA = (user) => {
    const phone = (user.phone || "").replace(/\D/g, "");
    if (!phone || phone.length < 10) { setMsg("❌ Phone nahi hai!"); return; }
    const role = user.role;
    let loginId, pass;
    if (role === "student" || role === "guardian") {
      // Students/Guardians login with PHONE number
      loginId = phone;
      pass = makePasswordFromPhone(phone);
    } else {
      // Staff/Admin login with EMAIL
      loginId = user.email;
      const namePart = (user.full_name || "STAFF").replace(/[^a-zA-Z]/g,"").slice(0,4).toUpperCase();
      pass = namePart + "@" + phone.slice(-4);
    }
    const text = "🔐 *MY CAREER ACADEMIC*\n\nDear " + (user.full_name || "User") + ",\n\nLogin details:\n🌐 Website: my-career-academic.vercel.app\n📱 Login ID: " + loginId + "\n🔑 Password: " + pass + "\n\nHelp: 06727796700\n\n_My Career Academic_";
    window.open("https://wa.me/91" + phone + "?text=" + encodeURIComponent(text), "_blank");
    setMsg("✅ WhatsApp opened! Login: " + loginId);
  };

  const ROLE_COLORS = { admin:"badge-danger", teacher:"badge-primary", staff:"badge-warning", student:"badge-success", guardian:"badge-muted", helper:"badge-warning", cooker:"badge-warning", cleaner:"badge-warning" };

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:16 }}>
        <div>
          <h1 className="page-title">Users</h1>
          <p className="page-sub">{users.length} total | {filtered.length} showing</p>
        </div>
        <input className="input" style={{ width:220 }} placeholder="Search..." value={search} onChange={e=>setSearch(e.target.value)} />
      </div>
      <div style={{ display:"flex", gap:8, marginBottom:16, flexWrap:"wrap" }}>
        <button className={"tag"+(roleFilter==="all"?" active":"")} onClick={()=>setRoleFilter("all")}>All</button>
        {["admin","teacher","staff","student","guardian"].map(r=>(
          <button key={r} className={"tag"+(roleFilter===r?" active":"")} onClick={()=>setRoleFilter(roleFilter===r?"all":r)}>{r.charAt(0).toUpperCase()+r.slice(1)}</button>
        ))}
        <button className="btn-outline" style={{ marginLeft:"auto", fontSize:12 }} onClick={loadUsers}>🔄 Refresh</button>
      </div>
      {msg&&<div className={msg.startsWith("❌")?"error-box":"success-box"} style={{ marginBottom:12 }}>{msg}<button style={{ marginLeft:10, background:"none", border:"none", cursor:"pointer" }} onClick={()=>setMsg("")}>×</button></div>}
      
      {editUser&&(
        <div className="card" style={{ marginBottom:20, borderLeft:"4px solid var(--primary)" }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:14 }}>
            <h3 style={{ fontSize:15, fontWeight:700 }}>Edit: {editUser.full_name}</h3>
            <button onClick={()=>setEditUser(null)} style={{ background:"none", border:"none", fontSize:20, cursor:"pointer" }}>×</button>
          </div>
          <div className="grid-3">
            <div><label className="label">Name</label><input className="input" value={editForm.full_name} onChange={e=>setEditForm({...editForm,full_name:e.target.value})} /></div>
            <div><label className="label">Phone</label><input className="input" value={editForm.phone} onChange={e=>setEditForm({...editForm,phone:e.target.value})} /></div>
            <div><label className="label">Role</label><select className="select" value={editForm.role} onChange={e=>setEditForm({...editForm,role:e.target.value})}><option value="admin">Admin</option><option value="teacher">Teacher</option><option value="staff">Staff</option><option value="student">Student</option><option value="guardian">Guardian</option><option value="helper">Helper</option><option value="cooker">Cooker</option><option value="cleaner">Cleaner</option></select></div>
          </div>
          <div style={{ marginTop:10, fontSize:12, color:"var(--muted)" }}>
            Email: {editUser.email} | 
            {(editForm.role==="student"||editForm.role==="guardian") && editForm.phone
              ? " Password: "+makePasswordFromPhone(editForm.phone)
              : " Password admin ke paas hai"}
          </div>
          <div style={{ display:"flex", gap:10, marginTop:14 }}>
            <button className="btn btn-success" onClick={saveEdit} disabled={saving}>{saving?"Saving...":"Save"}</button>
            <button className="btn" style={{ background:"#25D366", border:"none" }} onClick={()=>sendPasswordWA({...editUser, phone:editForm.phone, role:editForm.role})}>📱 WhatsApp</button>
          </div>
        </div>
      )}

      <div className="card">
        {loading?<p style={{ color:"var(--muted)" }}>Loading...</p>:filtered.length===0?<p className="empty-state">No users found.</p>:(
          <table><thead><tr><th>#</th><th>Name</th><th>Phone</th><th>Role</th><th>Login ID</th><th>Actions</th></tr></thead>
          <tbody>{filtered.map((u,idx)=>(
            <tr key={u.id}>
              <td style={{ color:"var(--muted)", fontSize:12 }}>{idx+1}</td>
              <td style={{ fontWeight:600 }}>{u.full_name||"-"}</td>
              <td>{u.phone||<span style={{ color:"var(--danger)", fontSize:12 }}>⚠️ No phone</span>}</td>
              <td><span className={"badge "+(ROLE_COLORS[u.role]||"badge-muted")}>{u.role}</span></td>
              <td style={{ fontSize:12, color:"var(--muted)" }}>
                {(u.role==="student"||u.role==="guardian") ? (u.phone||"No phone") : u.email}
              </td>
              <td>
                <div style={{ display:"flex", gap:6 }}>
                  <button className="btn-outline" style={{ fontSize:11, padding:"5px 12px" }} onClick={()=>{setEditUser(u);setEditForm({full_name:u.full_name||"",phone:u.phone||"",role:u.role||"student"});}}>✏️ Edit</button>
                  <button style={{ background:"#25D366", border:"none", borderRadius:6, padding:"5px 10px", cursor:"pointer", fontSize:13 }} onClick={()=>sendPasswordWA(u)}>📱</button>
                </div>
              </td>
            </tr>
          ))}</tbody></table>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// MAIN APP
// ══════════════════════════════════════════════════════════════
export default function Home() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [checking, setChecking] = useState(true);
  const [detailStudent, setDetailStudent] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const isMobile = useIsMobile();
  const sw = sidebarOpen ? 240 : 64;

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

  const primaryTabConfig = MOBILE_PRIMARY[role] || ["Dashboard","Notices"];
  const primaryTabs = primaryTabConfig.filter(t => t === "More" || tabs.includes(t));
  const bottomTabs = primaryTabs.filter(t => t !== "More");
  const moreTabsList = tabs.filter(t => !bottomTabs.includes(t));

  const renderTab = () => {
    if (activeTab === "StudentDetail") return <StudentDetailTab student={detailStudent} onBack={() => { setActiveTab("Students"); setDetailStudent(null); }} userRole={role} />;
    switch (activeTab) {
      case "Dashboard":    return <DashboardTab profile={profile} onNavigate={navigate} notifications={notifications} />;
      case "Students":     return <StudentsTab onNavigate={navigate} userRole={role} />;
      case "Admission":    return <AdmissionTab />;
      case "Courses":      return <CoursesTab />;
      case "Timetable":    return <TimetableTab profile={profile} />;
      case "My Classes":   return <MyClassesTab profile={profile} />;
      case "Live Classes": return <LiveClassesTab profile={profile} />;
      case "Attendance":   return <AttendanceTab profile={profile} />;
      case "Fees":         return <FeesTab profile={profile} />;
      case "Tests":        return <TestsTab profile={profile} />;
      case "Hostel":       return <HostelTab />;
      case "Accounts":     return <AccountsTab />;
      case "Guardians":    return <GuardiansTab />;
      case "Staff":        return <StaffTab />;
      case "Users":        return <UsersTab />;
      case "Notices":      return <NoticesTab profile={profile} />;
      case "Progress":     return <ProgressTab profile={profile} />;
      default:             return <DashboardTab profile={profile} onNavigate={navigate} notifications={notifications} />;
    }
  };

  return (
    <>
      {isMobile ? (
        /* ═══ MOBILE LAYOUT ═══ */
        <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "#f5f3ec" }}>
          {/* Top Header */}
          <div style={{ height: 56, background: "linear-gradient(90deg, #0f2a52 0%, #1a3f7a 100%)", display: "flex", alignItems: "center", padding: "0 16px", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>
            <img src={MCA_LOGO} alt="MCA" style={{ width: 34, height: 34, borderRadius: 8, objectFit: "cover", border: "2px solid rgba(255,255,255,0.4)", background: "#fff", flexShrink: 0 }} />
            <div style={{ marginLeft: 10, flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>My Career Academic</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.6)" }}>{activeTab === "StudentDetail" ? "Student Detail" : activeTab}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div onClick={() => { navigate("Notices"); setShowMoreMenu(false); }} style={{ cursor: "pointer", position: "relative", color: "rgba(255,255,255,0.85)" }}>
                <MOBILE_ICONS.Notices />
                {unreadCount > 0 && <span style={{ position: "absolute", top: -5, right: -5, background: "#e53e3e", color: "#fff", borderRadius: "50%", width: 15, height: 15, fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{unreadCount}</span>}
              </div>
              <div onClick={logout} style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff", cursor: "pointer" }}>
                {(profile?.full_name || "U")[0].toUpperCase()}
              </div>
            </div>
          </div>

          {/* More Drawer */}
          {showMoreMenu && (
            <>
              <div onClick={() => setShowMoreMenu(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 150 }} />
              <div style={{ position: "fixed", bottom: 62, left: 0, right: 0, background: "#fff", borderRadius: "20px 20px 0 0", zIndex: 200, padding: "0 0 8px", boxShadow: "0 -6px 24px rgba(0,0,0,0.15)", maxHeight: "65vh", overflowY: "auto" }}>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "14px 20px 8px" }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#1a3f7a" }}>All Pages</span>
                  <button onClick={() => setShowMoreMenu(false)} style={{ background: "none", border: "none", fontSize: 22, color: "#bbb", cursor: "pointer" }}>×</button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4, padding: "4px 12px" }}>
                  {moreTabsList.map(tab => {
                    const Icon = MOBILE_ICONS[tab];
                    const isAct = activeTab === tab;
                    return (
                      <div key={tab} onClick={() => { navigate(tab); setShowMoreMenu(false); }}
                        style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "14px 6px 10px", borderRadius: 14, cursor: "pointer", background: isAct ? "#e8eef9" : "#faf9f5", border: isAct ? "1.5px solid #1a3f7a" : "1.5px solid transparent" }}>
                        <span style={{ color: isAct ? "#1a3f7a" : "#555" }}>{Icon ? <Icon /> : TAB_ICONS[tab]}</span>
                        <span style={{ fontSize: 10, marginTop: 5, fontWeight: isAct ? 700 : 400, color: isAct ? "#1a3f7a" : "#666" }}>{tab}</span>
                      </div>
                    );
                  })}
                </div>
                <div style={{ margin: "8px 12px 0", borderTop: "1px solid #f0ede6", paddingTop: 4 }}>
                  <div onClick={logout} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 8px", cursor: "pointer", color: "#e53e3e" }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>🚪 Sign Out — {profile?.full_name}</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Page Content */}
          <div style={{ flex: 1, padding: "14px 12px 74px", overflowX: "hidden" }}>
            {renderTab()}
          </div>

          {/* Bottom Tab Bar */}
          <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, height: 62, background: "#fff", borderTop: "1px solid #e8e6de", display: "flex", alignItems: "stretch", zIndex: 100, boxShadow: "0 -2px 10px rgba(0,0,0,0.07)" }}>
            {primaryTabs.map(tab => {
              if (tab === "More") {
                return (
                  <div key="more" onClick={() => setShowMoreMenu(m => !m)}
                    style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3, cursor: "pointer", color: showMoreMenu ? "#1a3f7a" : "#888", borderTop: showMoreMenu ? "2.5px solid #1a3f7a" : "2.5px solid transparent", background: showMoreMenu ? "#f0f4ff" : "transparent" }}>
                    <MOBILE_ICONS.More />
                    <span style={{ fontSize: 9.5, fontWeight: 500 }}>More</span>
                  </div>
                );
              }
              const isActive = activeTab === tab || (activeTab === "StudentDetail" && tab === "Students");
              const Icon = MOBILE_ICONS[tab];
              return (
                <div key={tab} onClick={() => { navigate(tab); setShowMoreMenu(false); }}
                  style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3, cursor: "pointer", position: "relative", color: isActive ? "#1a3f7a" : "#888", borderTop: isActive ? "2.5px solid #1a3f7a" : "2.5px solid transparent", background: isActive ? "#f0f4ff" : "transparent" }}>
                  <span>{Icon ? <Icon /> : TAB_ICONS[tab]}</span>
                  <span style={{ fontSize: 9.5, fontWeight: isActive ? 700 : 400 }}>{tab}</span>
                  {tab === "Notices" && unreadCount > 0 && <span style={{ position: "absolute", top: 7, right: "28%", background: "#e53e3e", color: "#fff", borderRadius: "50%", width: 14, height: 14, fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{unreadCount}</span>}
                </div>
              );
            })}
          </div>
        </div>

      ) : (

        /* ═══ DESKTOP LAYOUT ═══ */
        <div style={{ display: "flex", minHeight: "100vh", background: "#f5f3ec" }}>
          {/* Sidebar */}
          <div style={{ width: sw, minWidth: sw, background: "linear-gradient(180deg, #0f2a52 0%, #1a3f7a 100%)", display: "flex", flexDirection: "column", position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 100, transition: "width 0.22s", overflow: "hidden", boxShadow: "2px 0 12px rgba(0,0,0,0.18)" }}>
            <div style={{ padding: sidebarOpen ? "16px 14px 12px" : "14px 8px 12px", borderBottom: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", gap: 10, minHeight: 68 }}>
              <img src={MCA_LOGO} alt="MCA" style={{ width: 40, height: 40, borderRadius: 10, objectFit: "cover", flexShrink: 0, border: "2px solid rgba(255,255,255,0.3)", background: "#fff" }} />
              {sidebarOpen && <div><div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>My Career Academic</div><div style={{ fontSize: 9.5, color: "rgba(255,255,255,0.5)" }}>Coaching Management</div></div>}
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "6px 0" }}>
              {tabs.map(tab => {
                const isActive = activeTab === tab || (activeTab === "StudentDetail" && tab === "Students");
                const Icon = MOBILE_ICONS[tab];
                return (
                  <div key={tab} title={!sidebarOpen ? tab : ""} onClick={() => navigate(tab)}
                    style={{ display: "flex", alignItems: "center", gap: 10, padding: sidebarOpen ? "9px 16px" : "9px 0", justifyContent: sidebarOpen ? "flex-start" : "center", cursor: "pointer", background: isActive ? "rgba(255,255,255,0.15)" : "transparent", borderLeft: isActive ? "3px solid #fff" : "3px solid transparent", color: isActive ? "#fff" : "rgba(255,255,255,0.65)", fontSize: 12.5, fontWeight: isActive ? 600 : 400 }}>
                    <span style={{ flexShrink: 0, width: 22, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {Icon ? <Icon /> : <span style={{ fontSize: 14 }}>{TAB_ICONS[tab]}</span>}
                    </span>
                    {sidebarOpen && <span style={{ whiteSpace: "nowrap" }}>{tab}</span>}
                    {sidebarOpen && tab === "Notices" && unreadCount > 0 && <span style={{ marginLeft: "auto", background: "#e53e3e", color: "#fff", borderRadius: 10, padding: "1px 6px", fontSize: 10, fontWeight: 700 }}>{unreadCount}</span>}
                  </div>
                );
              })}
            </div>
            <div style={{ padding: sidebarOpen ? "10px 14px 14px" : "10px 0 14px", borderTop: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", gap: 10, justifyContent: sidebarOpen ? "flex-start" : "center" }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                {(profile?.full_name || "U")[0].toUpperCase()}
              </div>
              {sidebarOpen && <>
                <div style={{ flex: 1 }}><div style={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>{profile?.full_name || "User"}</div><div style={{ fontSize: 9.5, color: "rgba(255,255,255,0.5)", textTransform: "capitalize" }}>{role}</div></div>
                <div onClick={logout} style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", cursor: "pointer" }}>Sign Out</div>
              </>}
            </div>
          </div>

          {/* Main Content */}
          <div style={{ flex: 1, marginLeft: sw, transition: "margin-left 0.22s", display: "flex", flexDirection: "column", minHeight: "100vh" }}>
            <div style={{ height: 54, background: "#fff", borderBottom: "1px solid #e8e6de", display: "flex", alignItems: "center", padding: "0 24px", position: "sticky", top: 0, zIndex: 50 }}>
              <button onClick={() => setSidebarOpen(o => !o)} style={{ background: "none", border: "none", cursor: "pointer", padding: "6px 8px", borderRadius: 6, marginRight: 14, color: "#666", display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ display: "block", width: 18, height: 2, background: "currentColor" }} />
                <span style={{ display: "block", width: sidebarOpen ? 13 : 18, height: 2, background: "currentColor", transition: "width 0.2s" }} />
                <span style={{ display: "block", width: 18, height: 2, background: "currentColor" }} />
              </button>
              <span style={{ fontSize: 14, fontWeight: 600, color: "#1a3f7a" }}>{activeTab === "StudentDetail" ? "Student Detail" : activeTab}</span>
              <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 16 }}>
                <div onClick={() => navigate("Notices")} style={{ cursor: "pointer", position: "relative", color: "#666" }}>
                  <MOBILE_ICONS.Notices />
                  {unreadCount > 0 && <span style={{ position: "absolute", top: -4, right: -4, background: "#e53e3e", color: "#fff", borderRadius: "50%", width: 15, height: 15, fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{unreadCount}</span>}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", padding: "4px 10px", borderRadius: 8, background: "#f5f3ec" }} onClick={logout}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#1a3f7a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff" }}>
                    {(profile?.full_name || "U")[0].toUpperCase()}
                  </div>
                  <div><div style={{ fontSize: 12, fontWeight: 600, color: "#333" }}>{profile?.full_name?.split(" ")[0] || "User"}</div><div style={{ fontSize: 10, color: "#aaa", textTransform: "capitalize" }}>{role}</div></div>
                </div>
              </div>
            </div>
            <div style={{ flex: 1, padding: "24px 28px" }}>
              {renderTab()}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
