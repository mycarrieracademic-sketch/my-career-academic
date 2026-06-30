"use client";

const TAB_ICONS = {
  Dashboard: "◫", Students: "☺", Admission: "✚", Courses: "◈",
  Timetable: "▦", "Live Classes": "▶", Attendance: "✔", Fees: "₹",
  Tests: "✎", Hostel: "⌂", Accounts: "◎", Guardians: "♥",
  Staff: "★", Notices: "◉"
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
      <div style={{ padding: "20px 16px", borderBottom: "1px solid #ffffff20" }}>
        <div style={{ fontSize: "16px", fontWeight: "700" }}>My Career Academic</div>
        <div style={{ fontSize: "11px", color: "#ffffff80", marginTop: "4px" }}>MY LIFELINE FOUNDATION</div>
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
            <span>{tab}</span>
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
