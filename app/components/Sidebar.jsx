"use client";
import { useState } from "react";
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
  guardian: ["Guardians","Notices"],
};

export default function Sidebar({ role, activeTab, setActiveTab, onLogout, collapsed, onToggleCollapse }) {
  const tabs = ROLE_TABS[role] || ["Dashboard"];
  const width = collapsed ? "68px" : "230px";

  return (
    <div style={{
      width, minHeight: "100vh",
      background: "linear-gradient(180deg, #14142b 0%, #1a1a2e 100%)",
      color: "white",
      display: "flex", flexDirection: "column",
      position: "fixed", left: 0, top: 0, zIndex: 100,
      transition: "width 0.2s ease",
      borderRight: "1px solid #ffffff0d",
      boxShadow: "2px 0 12px rgba(0,0,0,0.15)"
    }}>
      <div style={{
        padding: collapsed ? "16px 8px 12px" : "18px 16px 14px",
        borderBottom: "1px solid #ffffff14",
        display: "flex", flexDirection: "column", alignItems: "center",
        position: "relative"
      }}>
        <Image src="/mca-logo.png" alt="My Career Academic" width={collapsed ? 34 : 52} height={collapsed ? 34 : 52} style={{ objectFit: "contain", transition: "all 0.2s ease" }} priority />
        {!collapsed && (
          <>
            <div style={{ fontSize: "12px", fontWeight: "700", color: "white", marginTop: "8px", textAlign: "center", letterSpacing: "0.6px" }}>
              MY CAREER ACADEMIC
            </div>
            <div style={{ fontSize: "8px", color: "#8b8ba3", marginTop: "3px", textAlign: "center", letterSpacing: "1px", fontWeight: "500" }}>
              DIVISION OF MLF GROUP
            </div>
          </>
        )}

        <button
          onClick={onToggleCollapse}
          title={collapsed ? "Show" : "Hide"}
          style={{
            position: "absolute", top: "50%", right: "-13px", transform: "translateY(-50%)",
            width: "26px", height: "26px", borderRadius: "50%",
            background: "#4f8ef7", border: "2px solid #14142b",
            color: "white", fontSize: "12px", fontWeight: "700",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 2px 6px rgba(0,0,0,0.3)"
          }}
        >
          {collapsed ? "›" : "‹"}
        </button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: "10px 0" }}>
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            title={collapsed ? (TAB_LABELS[tab] || tab) : ""}
            style={{
              width: "100%", padding: collapsed ? "13px 0" : "12px 18px",
              background: activeTab === tab ? "#ffffff14" : "transparent",
              color: activeTab === tab ? "white" : "#a8a8c0",
              border: "none", textAlign: "left",
              fontSize: "13.5px", fontWeight: activeTab === tab ? "600" : "500",
              cursor: "pointer",
              borderLeft: activeTab === tab ? "3px solid #4f8ef7" : "3px solid transparent",
              display: "flex", alignItems: "center",
              justifyContent: collapsed ? "center" : "flex-start",
              gap: "12px",
              transition: "background 0.15s ease, color 0.15s ease"
            }}
            onMouseEnter={e => { if (activeTab !== tab) e.currentTarget.style.background = "#ffffff0a"; }}
            onMouseLeave={e => { if (activeTab !== tab) e.currentTarget.style.background = "transparent"; }}
          >
            <span style={{ fontSize: "15px", width: "18px", textAlign: "center", flexShrink: 0 }}>{TAB_ICONS[tab] || "•"}</span>
            {!collapsed && <span>{TAB_LABELS[tab] || tab}</span>}
          </button>
        ))}
      </div>

      <div style={{ padding: collapsed ? "12px 8px" : "16px" }}>
        <button
          onClick={onLogout}
          title={collapsed ? "Logout" : ""}
          style={{
            width: "100%", padding: "10px",
            background: "#ffffff10", color: "#e8e8f0",
            border: "1px solid #ffffff20", borderRadius: "8px",
            fontSize: "13.5px", fontWeight: "600", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "8px"
          }}
        >
          <span>⏻</span>
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
}
