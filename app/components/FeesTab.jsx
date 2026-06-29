"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

export default function FeesTab() {
  const [students, setStudents] = useState([]);
  const [feeRecords, setFeeRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    student_id: "", amount: "", payment_date: new Date().toISOString().split("T")[0],
    payment_mode: "cash", months_paid: "", note: ""
  });

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    const [s, f] = await Promise.all([
      supabase.from("students").select("*, courses(name, monthly_fee)").eq("status", "active").order("full_name"),
      supabase.from("fee_records").select("*, students(full_name)").order("payment_date", { ascending: false })
    ]);
    setStudents(s.data || []);
    setFeeRecords(f.data || []);
    setLoading(false);
  }

  async function handleSave() {
    if (!form.student_id) return alert("Select a student!");
    if (!form.amount) return alert("Enter amount!");
    setSaving(true);

    // Get academic term
    const { data: term } = await supabase.from("academic_terms")
      .select("id").eq("student_id", form.student_id).eq("is_current", true).single();

    await supabase.from("fee_records").insert({
      student_id: form.student_id,
      academic_term_id: term?.id || null,
      amount: parseFloat(form.amount),
      payment_date: form.payment_date,
      payment_mode: form.payment_mode,
      months_paid: form.months_paid,
      note: form.note,
      receipt_number: "RCP" + Date.now()
    });

    setShowForm(false);
    setForm({
      student_id: "", amount: "", payment_date: new Date().toISOString().split("T")[0],
      payment_mode: "cash", months_paid: "", note: ""
    });
    setSaving(false);
    fetchAll();
  }

  async function handleDelete(id) {
    if (!confirm("Delete this fee record?")) return;
    await supabase.from("fee_records").delete().eq("id", id);
    fetchAll();
  }

  const selectedStudent = students.find(s => s.id === form.student_id);
  const filtered = feeRecords.filter(f =>
    f.students?.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  const totalCollected = feeRecords.reduce((sum, f) => sum + (f.amount || 0), 0);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2 style={{ fontSize: "22px", fontWeight: "700" }}>Fees</h2>
        <button onClick={() => setShowForm(true)}
          style={{ padding: "10px 20px", background: "#1a1a2e", color: "white", border: "none", borderRadius: "6px", fontWeight: "600" }}>
          + Collect Fee
        </button>
      </div>

      {/* Summary */}
      <div style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
        <div style={{ background: "white", borderRadius: "10px", padding: "16px 24px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", borderTop: "4px solid #27ae60" }}>
          <div style={{ fontSize: "24px", fontWeight: "700", color: "#27ae60" }}>₹{totalCollected.toLocaleString()}</div>
          <div style={{ fontSize: "13px", color: "#666", marginTop: "4px" }}>Total Collected</div>
        </div>
        <div style={{ background: "white", borderRadius: "10px", padding: "16px 24px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", borderTop: "4px solid #3498db" }}>
          <div style={{ fontSize: "24px", fontWeight: "700", color: "#3498db" }}>{feeRecords.length}</div>
          <div style={{ fontSize: "13px", color: "#666", marginTop: "4px" }}>Total Transactions</div>
        </div>
      </div>

      {/* Collect Fee Form */}
      {showForm && (
        <div style={{ background: "white", borderRadius: "12px", padding: "24px", marginBottom: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
          <h3 style={{ marginBottom: "16px", fontWeight: "600" }}>Collect Fee</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>Student *</label>
              <select value={form.student_id} onChange={e => setForm({ ...form, student_id: e.target.value })}
                style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "6px" }}>
                <option value="">-- Select Student --</option>
                {students.map(s => <option key={s.id} value={s.id}>{s.full_name} — {s.courses?.name}</option>)}
              </select>
              {selectedStudent && (
                <div style={{ fontSize: "12px", color: "#27ae60", marginTop: "4px" }}>
                  Monthly Fee: ₹{selectedStudent.courses?.monthly_fee || 0}
                </div>
              )}
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>Amount (₹) *</label>
              <input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })}
                placeholder="Enter amount"
                style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "6px" }} />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>Payment Date</label>
              <input type="date" value={form.payment_date} onChange={e => setForm({ ...form, payment_date: e.target.value })}
                style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "6px" }} />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>Payment Mode</label>
              <select value={form.payment_mode} onChange={e => setForm({ ...form, payment_mode: e.target.value })}
                style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "6px" }}>
                <option value="cash">Cash</option>
                <option value="online">Online</option>
                <option value="cheque">Cheque</option>
              </select>
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>Months Paid</label>
              <input value={form.months_paid} onChange={e => setForm({ ...form, months_paid: e.target.value })}
                placeholder="e.g. Jan, Feb 2026"
                style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "6px" }} />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>Note</label>
              <input value={form.note} onChange={e => setForm({ ...form, note: e.target.value })}
                placeholder="Optional note"
                style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "6px" }} />
            </div>
          </div>
          <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
            <button onClick={handleSave} disabled={saving}
              style={{ padding: "10px 24px", background: saving ? "#999" : "#1a1a2e", color: "white", border: "none", borderRadius: "6px", fontWeight: "600" }}>
              {saving ? "Saving..." : "Save"}
            </button>
            <button onClick={() => setShowForm(false)}
              style={{ padding: "10px 24px", background: "#f0f0f0", border: "none", borderRadius: "6px" }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Search */}
      <div style={{ marginBottom: "16px" }}>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search student name..."
          style={{ padding: "10px 12px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "14px", width: "260px" }} />
      </div>

      {/* Records Table */}
      {loading ? <div>Loading...</div> : (
        <div style={{ background: "white", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", overflow: "hidden" }}>
          {filtered.length === 0 ? (
            <div style={{ padding: "32px", textAlign: "center", color: "#666" }}>No fee records found.</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8f9fa", borderBottom: "2px solid #eee" }}>
                  {["#", "Student", "Amount", "Date", "Mode", "Months", "Receipt", ""].map(h => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "#444" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((f, i) => (
                  <tr key={f.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                    <td style={{ padding: "12px 16px", fontSize: "14px", color: "#888" }}>{i + 1}</td>
                    <td style={{ padding: "12px 16px", fontSize: "14px", fontWeight: "500" }}>{f.students?.full_name}</td>
                    <td style={{ padding: "12px 16px", fontSize: "14px", fontWeight: "600", color: "#27ae60" }}>₹{f.amount}</td>
                    <td style={{ padding: "12px 16px", fontSize: "14px", color: "#555" }}>{f.payment_date}</td>
                    <td style={{ padding: "12px 16px", fontSize: "14px", color: "#555", textTransform: "capitalize" }}>{f.payment_mode}</td>
                    <td style={{ padding: "12px 16px", fontSize: "14px", color: "#555" }}>{f.months_paid || "-"}</td>
                    <td style={{ padding: "12px 16px", fontSize: "12px", color: "#888" }}>{f.receipt_number}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <button onClick={() => handleDelete(f.id)}
                        style={{ padding: "5px 12px", background: "#fff0f0", color: "#c00", border: "1px solid #ffc0c0", borderRadius: "6px", fontSize: "12px" }}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
