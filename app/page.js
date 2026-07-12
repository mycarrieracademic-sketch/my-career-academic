"use client";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import CoursesTab from "./components/CoursesTab";
import AdmissionTab from "./components/AdmissionTab";
import StudentsTab from "./components/StudentsTab";
import StaffTab from "./components/StaffTab";
import TimetableTab from "./components/TimetableTab";
import LiveClassesTab from "./components/LiveClassesTab";
import AttendanceTab from "./components/AttendanceTab";
import FeesTab from "./components/FeesTab";
import TestsTab from "./components/TestsTab";
import AccountsTab from "./components/AccountsTab";
import HostelTab from "./components/HostelTab";
import NoticesTab from "./components/NoticesTab";
import GuardiansTab from "./components/GuardiansTab";

export default function App() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [teacherStaff, setTeacherStaff] = useState(null);
  const [guardianStudent, setGuardianStudent] = useState(null);
  const [loginMode, setLoginMode] = useState("admin");
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const [teacherEmail, setTeacherEmail] = useState("");
  const [teacherPassword, setTeacherPassword] = useState("");
  const [teacherError, setTeacherError] = useState("");
  const [teacherLoading, setTeacherLoading] = useState(false);

  const [guardianMobile, setGuardianMobile] = useState("");
  const [guardianError, setGuardianError] = useState("");
  const [guardianLoading, setGuardianLoading] = useState(false);

  useEffect(() => {
    const savedTeacherId = typeof window !== "undefined" ? localStorage.getItem("mca_teacher_staff_id") : null;
    const savedGuardianId = typeof window !== "undefined" ? localStorage.getItem("mca_guardian_student_id") : null;

    if (savedTeacherId) {
      restoreTeacherSession(savedTeacherId);
    } else if (savedGuardianId) {
      restoreGuardianSession(savedGuardianId);
    } else {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        if (session) fetchProfile(session.user.id);
        else setLoading(false);
      });
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (localStorage.getItem("mca_teacher_staff_id") || localStorage.getItem("mca_guardian_student_id")) return;
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else { setProfile(null); setLoading(false); }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(userId) {
    const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
    setProfile(data);
    setLoading(false);
  }

  async function restoreTeacherSession(staffId) {
    const { data } = await supabase.from("staff").select("*").eq("id", staffId).eq("role", "teacher").eq("status", "active").single();
    if (data) {
      setTeacherStaff(data);
    } else {
      localStorage.removeItem("mca_teacher_staff_id");
    }
    setLoading(false);
  }

  async function restoreGuardianSession(studentId) {
    const { data } = await supabase.from("students").select("*").eq("id", studentId).eq("status", "active").limit(1);
    if (data && data.length > 0) {
      setGuardianStudent(data[0]);
    } else {
      localStorage.removeItem("mca_guardian_student_id");
    }
    setLoading(false);
  }

  async function handleLogin() {
    setAuthLoading(true);
    setAuthError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setAuthError(error.message);
    setAuthLoading(false);
  }

  async function handleTeacherLogin() {
    setTeacherLoading(true);
    setTeacherError("");
    const { data, error } = await supabase
      .from("staff")
      .select("*")
      .eq("email", teacherEmail.trim())
      .eq("password", teacherPassword)
      .eq("role", "teacher")
      .eq("status", "active")
      .single();

    if (error || !data) {
      setTeacherError("Invalid email or password.");
      setTeacherLoading(false);
      return;
    }

    setTeacherStaff(data);
    localStorage.setItem("mca_teacher_staff_id", data.id);
    setTeacherLoading(false);
  }

  async function handleGuardianLogin() {
    setGuardianLoading(true);
    setGuardianError("");
    const { data, error } = await supabase
      .from("students")
      .select("*")
      .eq("guardian_mobile", guardianMobile.trim())
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1);

    if (error || !data || data.length === 0) {
      setGuardianError("No student found with this mobile number.");
      setGuardianLoading(false);
      return;
    }

    setGuardianStudent(data[0]);
    localStorage.setItem("mca_guardian_student_id", data[0].id);
    setGuardianLoading(false);
  }

  async function handleLogout() {
    if (teacherStaff) {
      localStorage.removeItem("mca_teacher_staff_id");
      setTeacherStaff(null);
    } else if (guardianStudent) {
      localStorage.removeItem("mca_guardian_student_id");
      setGuardianStudent(null);
    } else {
      await supabase.auth.signOut();
    }
    setActiveTab("Dashboard");
  }

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
      <div style={{ fontSize: "18px", color: "#666" }}>Loading...</div>
    </div>
  );

  const loggedIn = session || teacherStaff || guardianStudent;

  if (!loggedIn) return (
    <div style={{
      display: "flex", justifyContent: "center",
      alignItems: "center", minHeight: "100vh", background: "#f0f2f5"
    }}>
      <div style={{
        background: "white", padding: "40px", borderRadius: "12px",
        width: "360px", boxShadow: "0 4px 20px rgba(0,0,0,0.1)"
      }}>
        <h1 style={{ textAlign: "center", marginBottom: "8px", color: "#1a1a2e" }}>
          My Career Academic
        </h1>
        <p style={{ textAlign: "center", color: "#666", marginBottom: "24px", fontSize: "14px" }}>
          MY LIFELINE FOUNDATION
        </p>

        <div style={{ display: "flex", marginBottom: "24px", border: "1px solid #ddd", borderRadius: "6px", overflow: "hidden" }}>
          <button
            onClick={() => setLoginMode("admin")}
            style={{
              flex: 1, padding: "10px", border: "none", cursor: "pointer",
              background: loginMode === "admin" ? "#1a1a2e" : "#f5f5f5",
              color: loginMode === "admin" ? "white" : "#444",
              fontWeight: "600", fontSize: "12px"
            }}>
            Admin
          </button>
          <button
            onClick={() => setLoginMode("teacher")}
            style={{
              flex: 1, padding: "10px", border: "none", cursor: "pointer",
              background: loginMode === "teacher" ? "#1a1a2e" : "#f5f5f5",
              color: loginMode === "teacher" ? "white" : "#444",
              fontWeight: "600", fontSize: "12px"
            }}>
            Teacher
          </button>
          <button
            onClick={() => setLoginMode("guardian")}
            style={{
              flex: 1, padding: "10px", border: "none", cursor: "pointer",
              background: loginMode === "guardian" ? "#1a1a2e" : "#f5f5f5",
              color: loginMode === "guardian" ? "white" : "#444",
              fontWeight: "600", fontSize: "12px"
            }}>
            Guardian
          </button>
        </div>

        {loginMode === "admin" && (
          <>
            {authError && (
              <div style={{
                background: "#fff0f0", color: "#c00", padding: "10px",
                borderRadius: "6px", marginBottom: "16px", fontSize: "14px"
              }}>
                {authError}
              </div>
            )}

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>Email</label>
              <input
                type="email" value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@mycareeracademic.com"
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "14px" }}
              />
            </div>

            <div style={{ marginBottom: "24px" }}>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>Password</label>
              <input
                type="password" value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                onKeyDown={e => e.key === "Enter" && handleLogin()}
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "14px" }}
              />
            </div>

            <button
              onClick={handleLogin} disabled={authLoading}
              style={{
                width: "100%", padding: "12px",
                background: authLoading ? "#999" : "#1a1a2e",
                color: "white", border: "none", borderRadius: "6px",
                fontSize: "16px", fontWeight: "600"
              }}
            >
              {authLoading ? "Logging in..." : "Login"}
            </button>
          </>
        )}

        {loginMode === "teacher" && (
          <>
            {teacherError && (
              <div style={{
                background: "#fff0f0", color: "#c00", padding: "10px",
                borderRadius: "6px", marginBottom: "16px", fontSize: "14px"
              }}>
                {teacherError}
              </div>
            )}

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>Email</label>
              <input
                type="email" value={teacherEmail}
                onChange={e => setTeacherEmail(e.target.value)}
                placeholder="teacher@mycareeracademic.com"
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "14px" }}
              />
            </div>

            <div style={{ marginBottom: "24px" }}>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>Password</label>
              <input
                type="password" value={teacherPassword}
                onChange={e => setTeacherPassword(e.target.value)}
                placeholder="••••••••"
                onKeyDown={e => e.key === "Enter" && handleTeacherLogin()}
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "14px" }}
              />
            </div>

            <button
              onClick={handleTeacherLogin} disabled={teacherLoading}
              style={{
                width: "100%", padding: "12px",
                background: teacherLoading ? "#999" : "#1a1a2e",
                color: "white", border: "none", borderRadius: "6px",
                fontSize: "16px", fontWeight: "600"
              }}
            >
              {teacherLoading ? "Logging in..." : "Login"}
            </button>
          </>
        )}

        {loginMode === "guardian" && (
          <>
            {guardianError && (
              <div style={{
                background: "#fff0f0", color: "#c00", padding: "10px",
                borderRadius: "6px", marginBottom: "16px", fontSize: "14px"
              }}>
                {guardianError}
              </div>
            )}

            <div style={{ marginBottom: "24px" }}>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>Guardian Mobile Number</label>
              <input
                type="tel" value={guardianMobile}
                onChange={e => setGuardianMobile(e.target.value)}
                placeholder="10 digit mobile number"
                onKeyDown={e => e.key === "Enter" && handleGuardianLogin()}
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "14px" }}
              />
            </div>

            <button
              onClick={handleGuardianLogin} disabled={guardianLoading}
              style={{
                width: "100%", padding: "12px",
                background: guardianLoading ? "#999" : "#1a1a2e",
                color: "white", border: "none", borderRadius: "6px",
                fontSize: "16px", fontWeight: "600"
              }}
            >
              {guardianLoading ? "Checking..." : "Login"}
            </button>
          </>
        )}
      </div>
    </div>
  );

  const role = teacherStaff ? "teacher" : guardianStudent ? "guardian" : (profile?.role || "admin");
  const userId = teacherStaff ? teacherStaff.id : session?.user?.id;

  return (
    <div style={{ display: "flex" }}>
      <Sidebar
        role={role}
        activeTab={role === "guardian" ? "Guardians" : activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <div style={{ marginLeft: sidebarCollapsed ? "68px" : "230px", flex: 1, padding: "32px", minHeight: "100vh", transition: "margin-left 0.2s ease" }}>
        {activeTab === "Dashboard" && role !== "guardian" && (
          <Dashboard role={role} userId={userId} />
        )}
        {activeTab === "Courses" && <CoursesTab />}
        {activeTab === "Admission" && <AdmissionTab />}
        {activeTab === "Students" && <StudentsTab />}
        {activeTab === "Staff" && <StaffTab />}
        {activeTab === "Timetable" && <TimetableTab />}
        {activeTab === "Live Classes" && <LiveClassesTab role={role} staffId={userId} />}
        {activeTab === "Attendance" && <AttendanceTab />}
        {activeTab === "Fees" && <FeesTab />}
        {activeTab === "Tests" && <TestsTab />}
        {activeTab === "Accounts" && <AccountsTab />}
        {activeTab === "Hostel" && <HostelTab />}
        {activeTab === "Notices" && <NoticesTab userId={userId} role={role} />}
        {(activeTab === "Guardians" || role === "guardian") && (
          <GuardiansTab role={role} studentId={guardianStudent?.id} />
        )}
        {!["Dashboard","Courses","Admission","Students","Staff","Timetable","Live Classes","Attendance","Fees","Tests","Hostel","Accounts","Guardians","Notices"].includes(activeTab) && role !== "guardian" && (
        <div style={{
          background: "white", borderRadius: "12px",
          padding: "32px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
          }}>
        <h2 style={{ fontSize: "22px", fontWeight: "700", marginBottom: "16px" }}>
          {activeTab}
          </h2>
            <p style={{ color: "#666" }}>Coming soon...</p>
        </div>
        )}
      </div>
    </div>
  );
}
