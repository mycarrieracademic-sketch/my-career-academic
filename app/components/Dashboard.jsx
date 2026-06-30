"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

export default function Dashboard({ role, userId }) {
  const [stats, setStats] = useState({
    students: 0, courses: 0, todayClasses: 0, pendingFees: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      const [studentsRes, coursesRes, classesRes] = await Promise.all([
        supabase.from("students").select("id", { count: "exact" }).eq("status", "active"),
        supabase.from("courses").select("id", { count: "exact" }),
        supabase.from("live_classes").select("id", { count: "exact" }).eq("class_date", new Date().toISOString().split("T")[0]),
      ]);
      setStats({
        students: studentsRes.count || 0,
        courses: coursesRes.count || 0,
        todayClasses: classesRes.count || 0,
        pendingFees: 0
      });
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  const cards = [
    { label: "Active Students", value: stats.students, color: "#4f8ef7", icon: "☺" },
    { label: "Total Courses", value: stats.courses, color: "#27ae60", icon: "◈" },
    { label: "Today's Classes", value: stats.todayClasses, color: "#e67e22", icon: "▶" },
    { label: "Pending Fees", value: "₹" + stats.pendingFees, color: "#e74c3c", icon: "₹" },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: "24px", fontSize: "22px", fontWeight: "700" }}>
        Dashboard
      </h2>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "16px"
        }}>
          {cards.map(card => (
            <div key={card.label} style={{
              background: "white", borderRadius: "12px",
              padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              borderTop: `4px solid ${card.color}`
            }}>
              <div style={{ fontSize: "28px", marginBottom: "8px" }}>{card.icon}</div>
              <div style={{ fontSize: "28px", fontWeight: "700", color: card.color }}>
                {card.value}
              </div>
              <div style={{ fontSize: "14px", color: "#666", marginTop: "4px" }}>
                {card.label}
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{
        marginTop: "32px", background: "white",
        borderRadius: "12px", padding: "24px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
      }}>
        <h3 style={{ marginBottom: "16px", fontSize: "16px", fontWeight: "600" }}>
          Welcome to My Career Academic
        </h3>
        <p style={{ color: "#666", fontSize: "14px", lineHeight: "1.6" }}>
          Role: <strong style={{ textTransform: "capitalize" }}>{role || "Loading..."}</strong>
          <br />
          Use the sidebar to navigate between sections.
        </p>
      </div>
    </div>
  );
}
