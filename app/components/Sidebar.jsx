"use client";
import Image from "next/image";

const TAB_ICONS = {
  Dashboard: "◫", Students: "☺", Admission: "✚", Courses: "◈",
  Timetable: "▦", "Live Classes": "▶", Attendance: "✔", Fees: "₹",
  Tests: "✎", Hostel: "⌂", Accounts: "◎", Guardians: "♥",
  Staff: "★", Notices: "◉"
};
const TAB_LABELS = {
  Fees: "Hostel Fee"
};
const ROLE_TABS = {
  admin: ["Dashboard","Students","Admission","Courses","Timetable","Live Classes","Attendance","Fees","Tests","Hostel","Accounts","Guardians","Staff","Notices"],
  teacher: ["Dashboard","Live Classes","Attendance","Tests","Notices"],
  accountant: ["Dashboard","Fees","Accounts","Notices"],
  cleaner: ["Dashboard","Notices"],
};
export default function Sidebar({ role, activeTab, setActiveTab, onLogout }) {
  const tabs = ROLE_TABS[role] || ["Dashboard"];
  return (
    <div style={{
      width: "220px", minHeight: "100vh",
      background: "#1a1a2e", color: "white",
      display: "flex", flexDirection: "column",
      position: "fixed", left: 0, top: 0, zIndex: 100
    }}>
      <div style={{ padding: "14px 16px", borderBottom: "1px solid #ffffff20", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Image src="/mca-logo.png" alt="My Career Academic" width={90} height={90} style={{ objectFit: "contain" }} priority />
        <div style={{ fontSize: "12px", fontWeight: "700", color: "white", marginTop: "8px", textAlign: "center", letterSpacing: "0.3px" }}>
          MY CAREER ACADEMIC
        </div>
        <div style={{ fontSize: "9px", color: "#ffffff80", marginTop: "2px", textAlign: "center", letterSpacing: "0.3px" }}>
          DIVISION OF MLF GROUP
        </div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              width: "100%", padding: "12px 16px",
              background: activeTab === tab ? "#ffffff15" : "transparent",
              color: activeTab === tab ? "white" : "#ffffff90",
              border: "none", textAlign: "left",
              fontSize: "14px", cursor: "pointer",
              borderLeft: activeTab === tab ? "3px solid #4f8ef7" : "3px solid transparent",
              display: "flex", alignItems: "center", gap: "10px"
            }}
          >
            <span>{TAB_ICONS[tab] || "•"}</span>
            <span>{TAB_LABELS[tab] || tab}</span>
          </button>
        ))}
      </div>
      <div style={{ padding: "16px" }}>
        <button
          onClick={onLogout}
          style={{
            width: "100%", padding: "10px",
            background: "#ffffff15", color: "white",
            border: "1px solid #ffffff30", borderRadius: "6px",
            fontSize: "14px", cursor: "pointer"
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}
