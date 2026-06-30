"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

export default function GuardiansTab() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [fees, setFees] = useState([]);
  const [tests, setTests] = useState([]);
  const [feeTargets, setFeeTargets] = useState([]);
  const [selectedYear, setSelectedYear] = useState("1st Year");

  useEffect(() => { fetchStudents(); }, []);

  async function fetchStudents() {
    const { data } = await supabase.from("students")
      .select("*, courses(name, monthly_fee)")
      .order("full_name");
    setStudents(data || []);
    setLoading(false);
  }

  async function selectStudent(student) {
    setSelected(student);
    const [att, fee, res, tgt] = await Promise.all([
      supabase.from("attendance").select("*, live_classes(title, class_date)")
        .eq("student_id", student.id).order("marked_at", { ascending: false }).limit(20),
      supabase.from("fee_records").select("*")
        .eq("student_id", student.id).order("payment_date", { ascending: false }),
      supabase.from("test_results").select("*, tests(title, total_marks, test_date)")
        .eq("student_id", student.id).order("created_at", { ascending: false }),
      supabase.from("student_fee_targets").select("*").eq("student_id", student.id)
    ]);
    setAttendance(att.data || []);
    setFees(fee.data || []);
    setTests(res.data || []);
    setFeeTargets(tgt.data || []);
  }

  function getTarget(year) {
    const custom = feeTargets.find(t => t.academic_year === year);
    if (custom) return custom.target_amount;
    return selected?.courses?.monthly_fee || 0;
  }

  const filtered = students.filter(s =>
    s.full_name.toLowerCase().includes(search.toLowerCase()) ||
    (s.guardian_mobile && s.guardian_mobile.includes(search))
  );

  const presentCount = attendance.filter(a => a.status === "present").length;
  const totalAtt = attendance.length;
  const attPct = totalAtt > 0 ? Math.round((presentCount / totalAtt) * 100) : 0;
  const totalFees = fees.reduce((s, f) => s + (f.amount || 0), 0);
  const yearFees = fees.filter(f => f.months_paid === selectedYear);
  const yearPaid = yearFees.reduce((s, f) => s + (f.amount || 0), 0);
  const yearTarget = getTarget(selectedYear);
  const yearPending = Math.max(0, yearTarget - yearPaid);
  const yearFees = fees.filter(f => f.months_paid === selectedYear);

  return (
    <div>
      <h2 style={{ fontSize: "22px", fontWeight: "700", marginBottom: "8px" }}>Guardian View</h2>
      <p style={{ color: "#666", fontSize: "14px", marginBottom: "20px" }}>
        Search karo student ya guardian mobile se — attendance, fees, results dekho.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: selected ? "300px 1fr" : "1fr", gap: "20px" }}>
        {/* Student List */}
        <div>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Name ya guardian mobile..."
            style={{ width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "14px", marginBottom: "12px" }} />
          {loading ? <div>Loading...</div> : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {filtered.length === 0 && <div style={{ color: "#666", fontSize: "14px" }}>Koi student nahi mila.</div>}
              {filtered.map(s => (
                <div key={s.id} onClick={() => selectStudent(s)}
                  style={{
                    background: "white", borderRadius: "10px", padding: "14px 16px",
                    cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                    border: selected?.id === s.id ? "2px solid #1a1a2e" : "2px solid transparent"
                  }}>
                  <div style={{ fontWeight: "600", fontSize: "14px" }}>{s.full_name}</div>
                  <div style={{ fontSize: "13px", color: "#666" }}>{s.courses?.name}</div>
                  {s.guardian_mobile && <div style={{ fontSize: "12px", color: "#888", marginTop: "4px" }}>📞 {s.guardian_mobile}</div>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detail Panel */}
        {selected && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Profile Card */}
            <div style={{ background: "white", borderRadius: "12px", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: "20px", fontWeight: "700" }}>{selected.full_name}</div>
                  <div style={{ fontSize: "14px", color: "#666", marginTop: "4px" }}>{selected.courses?.name}</div>
                </div>
                <span style={{
                  padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "600",
                  background: selected.status === "active" ? "#e8f8f0" : "#ffeaea",
                  color: selected.status === "active" ? "#27ae60" : "#e74c3c"
                }}>{selected.status}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "16px", fontSize: "14px" }}>
                {[
                  ["Student Mobile", selected.mobile],
                  ["Guardian Mobile", selected.guardian_mobile],
                  ["Admission Date", selected.admission_date],
                  ["Address", selected.address],
                  ["Monthly Fee", "₹" + (selected.courses?.monthly_fee || 0)],
                ].map(([label, value]) => (
                  <div key={label}>
                    <div style={{ color: "#888", fontSize: "12px" }}>{label}</div>
                    <div style={{ fontWeight: "500", marginTop: "2px" }}>{value || "-"}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Year Tabs */}
            <div style={{ display: "flex", gap: "8px" }}>
              {["1st Year", "2nd Year", "3rd Year"].map(yr => (
                <button key={yr} onClick={() => setSelectedYear(yr)}
                  style={{
                    padding: "8px 18px", border: "none", borderRadius: "6px", fontSize: "13px", fontWeight: "600",
                    background: selectedYear === yr ? "#1a1a2e" : "#f0f0f0",
                    color: selectedYear === yr ? "white" : "#333"
                  }}>
                  {yr}
                </button>
              ))}
            </div>

            {/* Year Tabs */}
            <div style={{ display: "flex", gap: "8px" }}>
              {["1st Year", "2nd Year", "3rd Year"].map(yr => (
                <button key={yr} onClick={() => setSelectedYear(yr)}
                  style={{
                    padding: "8px 18px", border: "none", borderRadius: "6px", fontSize: "13px", fontWeight: "600",
                    background: selectedYear === yr ? "#1a1a2e" : "#f0f0f0",
                    color: selectedYear === yr ? "white" : "#333"
                  }}>
                  {yr}
                </button>
              ))}
            </div>

            {/* Fee Summary for selected year */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "12px" }}>
              {[
                { label: "Total Fee (" + selectedYear + ")", value: "₹" + yearTarget.toLocaleString(), color: "#1a1a2e" },
                { label: "Paid", value: "₹" + yearPaid.toLocaleString(), color: "#27ae60" },
                { label: "Pending", value: "₹" + yearPending.toLocaleString(), color: yearPending > 0 ? "#e74c3c" : "#27ae60" },
              ].map(c => (
                <div key={c.label} style={{ background: "white", borderRadius: "10px", padding: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", textAlign: "center" }}>
                  <div style={{ fontSize: "20px", fontWeight: "700", color: c.color }}>{c.value}</div>
                  <div style={{ fontSize: "12px", fontWeight: "600", marginTop: "4px", color: "#666" }}>{c.label}</div>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "12px" }}>
              {[
                { label: "Attendance (Overall)", value: attPct + "%", sub: presentCount + "/" + totalAtt, color: attPct >= 75 ? "#27ae60" : "#e74c3c" },
                { label: "Total Fee Paid (All Years)", value: "₹" + totalFees.toLocaleString(), sub: fees.length + " payments", color: "#3498db" },
                { label: "Tests", value: tests.length, sub: "attempted", color: "#e67e22" },
              ].map(c => (
                <div key={c.label} style={{ background: "white", borderRadius: "10px", padding: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", textAlign: "center" }}>
                  <div style={{ fontSize: "22px", fontWeight: "700", color: c.color }}>{c.value}</div>
                  <div style={{ fontSize: "13px", fontWeight: "600", marginTop: "4px" }}>{c.label}</div>
                  <div style={{ fontSize: "12px", color: "#888" }}>{c.sub}</div>
                </div>
              ))}
            </div>

            {/* Attendance */}
            <div style={{ background: "white", borderRadius: "12px", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
              <h3 style={{ fontWeight: "600", fontSize: "15px", marginBottom: "12px" }}>Recent Attendance</h3>
              {attendance.length === 0 ? <div style={{ color: "#666", fontSize: "14px" }}>No records.</div> : (
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {attendance.map(a => (
                    <div key={a.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: "#f8f9fa", borderRadius: "6px", fontSize: "13px" }}>
                      <span>{a.live_classes?.title || "-"}</span>
                      <span style={{ color: "#888" }}>{a.live_classes?.class_date}</span>
                      <span style={{ fontWeight: "600", color: a.status === "present" ? "#27ae60" : a.status === "absent" ? "#e74c3c" : "#e67e22" }}>{a.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Fees */}
            <div style={{ background: "white", borderRadius: "12px", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
              <h3 style={{ fontWeight: "600", fontSize: "15px", marginBottom: "12px" }}>Fee History — {selectedYear}</h3>
              {yearFees.length === 0 ? <div style={{ color: "#666", fontSize: "14px" }}>No payments for {selectedYear}.</div> : (
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {yearFees.map(f => (
                    <div key={f.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: "#f8f9fa", borderRadius: "6px", fontSize: "13px" }}>
                      <span>{f.payment_date}</span>
                      <span style={{ color: "#555" }}>{f.months_paid || f.payment_mode}</span>
                      <span style={{ fontWeight: "600", color: "#27ae60" }}>₹{f.amount}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tests */}
            <div style={{ background: "white", borderRadius: "12px", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
              <h3 style={{ fontWeight: "600", fontSize: "15px", marginBottom: "12px" }}>Test Results</h3>
              {tests.length === 0 ? <div style={{ color: "#666", fontSize: "14px" }}>No results.</div> : (
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {tests.map(t => (
                    <div key={t.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: "#f8f9fa", borderRadius: "6px", fontSize: "13px" }}>
                      <span>{t.tests?.title}</span>
                      <span style={{ color: "#888" }}>{t.tests?.test_date}</span>
                      <span style={{ fontWeight: "600" }}>{t.marks_obtained}/{t.tests?.total_marks} ({t.grade})</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
