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
  const [feeTargets, setFeeTargets] = useState([]);
  const [targetAmount, setTargetAmount] = useState("");
  const [savingTarget, setSavingTarget] = useState(false);
  const [form, setForm] = useState({
    student_id: "", amount: "", payment_date: new Date().toISOString().split("T")[0],
    payment_mode: "cash", academic_year: "1st Year", note: ""
  });

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    const [s, f, t] = await Promise.all([
      supabase.from("students").select("*, courses(name, monthly_fee)").eq("status", "active").order("full_name"),
      supabase.from("fee_records").select("*, students(full_name, mobile, guardian_mobile, courses(name))").order("payment_date", { ascending: false }),
      supabase.from("student_fee_targets").select("*")
    ]);
    setStudents(s.data || []);
    setFeeRecords(f.data || []);
    setFeeTargets(t.data || []);
    setLoading(false);
  }

  function getTarget(studentId, year) {
    const custom = feeTargets.find(t => t.student_id === studentId && t.academic_year === year);
    if (custom) return custom.target_amount;
    const stu = students.find(s => s.id === studentId);
    return stu?.courses?.monthly_fee || 0;
  }

  async function saveTarget() {
    if (!form.student_id) return alert("Select a student first!");
    if (!targetAmount) return alert("Enter target amount!");
    setSavingTarget(true);
    await supabase.from("student_fee_targets").upsert({
      student_id: form.student_id,
      academic_year: form.academic_year,
      target_amount: parseFloat(targetAmount)
    }, { onConflict: "student_id,academic_year" });
    setSavingTarget(false);
    setTargetAmount("");
    fetchAll();
  }

  async function handleSave() {
    if (!form.student_id) return alert("Select a student!");
    if (!form.amount) return alert("Enter amount!");
    setSaving(true);

    const { data: term } = await supabase.from("academic_terms")
      .select("id").eq("student_id", form.student_id).eq("is_current", true).single();

    const { data: receiptNo } = await supabase.rpc("generate_receipt_number");

    await supabase.from("fee_records").insert({
      student_id: form.student_id,
      academic_term_id: term?.id || null,
      amount: parseFloat(form.amount),
      payment_date: form.payment_date,
      payment_mode: form.payment_mode,
      months_paid: form.academic_year,
      note: form.note,
      receipt_number: receiptNo || ("RCP" + Date.now())
    });

    setShowForm(false);
    setForm({ student_id: "", amount: "", payment_date: new Date().toISOString().split("T")[0], payment_mode: "cash", academic_year: "1st Year", note: "" });
    setSaving(false);
    fetchAll();
  }

  async function handleDelete(id) {
    if (!confirm("Delete this fee record?")) return;
    await supabase.from("fee_records").delete().eq("id", id);
    fetchAll();
  }

  function printReceipt(f) {
    const studentName = f.students?.full_name || "-";
    const studentMobile = f.students?.mobile || "-";
    const guardianMobile = f.students?.guardian_mobile || "-";
    const courseName = f.students?.courses?.name || "-";

    const win = window.open("", "_blank", "width=480,height=750");
    win.document.write(`
      <html>
        <head>
          <title>Receipt - ${f.receipt_number}</title>
          <style>
            * { box-sizing: border-box; }
            @page { size: A4; margin: 8mm; }
            body { font-family: Georgia, 'Times New Roman', serif; color: #1a1a1a; margin: 0; }
            .receipt {
              padding: 12px 24px;
              height: 138mm;
              display: flex; flex-direction: column; justify-content: flex-start;
            }
            .letterhead { text-align: center; border-bottom: 2px double #1a1a2e; padding-bottom: 6px; margin-bottom: 6px; }
            .letterhead img { width: 40px; height: 40px; object-fit: contain; }
            .letterhead h1 { margin: 4px 0 1px; font-size: 15px; letter-spacing: 0.5px; color: #1a1a2e; }
            .letterhead p { margin: 0; font-size: 9px; color: #555; }
            .title-band {
              background: #1a1a2e; color: white; text-align: center; padding: 4px;
              font-size: 11px; font-weight: 700; letter-spacing: 1px; margin: 8px 0 10px;
            }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 5px 16px; }
            .field .label { font-size: 8px; color: #777; text-transform: uppercase; letter-spacing: 0.2px; }
            .field .value { font-size: 11px; font-weight: 600; color: #1a1a1a; margin-top: 0px; }
            .amount-box { text-align: center; margin: 10px 0; padding: 8px; background: #f5f5f5; border: 1px solid #ddd; border-radius: 6px; }
            .amount-box .label { font-size: 9px; color: #777; text-transform: uppercase; }
            .amount-box .amt { font-size: 19px; font-weight: 700; color: #1a7a3c; margin-top: 2px; }
            .sign-row { display: flex; justify-content: space-between; margin-top: 16px; }
            .sign-box { text-align: center; width: 140px; }
            .sign-line { border-top: 1px solid #333; padding-top: 3px; font-size: 9px; color: #444; }
            .seal-box {
              width: 46px; height: 46px; border: 1.2px dashed #999; border-radius: 50%;
              display: flex; align-items: center; justify-content: center; text-align: center;
              font-size: 7px; color: #aaa; margin: 0 auto 4px;
            }
            .footer-note { text-align: center; font-size: 8px; color: #999; margin-top: 10px; border-top: 1px solid #eee; padding-top: 5px; }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="letterhead">
              <img src="/mca-logo.png" />
              <h1>MY CAREER ACADEMIC</h1>
              <p>Division of MY LIFELINE FOUNDATION</p>
              <p>Kendrapara, Odisha</p>
            </div>

            <div class="title-band">HOSTEL FEE RECEIPT</div>

            <div class="grid">
              <div class="field"><div class="label">Receipt No.</div><div class="value">${f.receipt_number}</div></div>
              <div class="field"><div class="label">Date</div><div class="value">${f.payment_date}</div></div>
              <div class="field"><div class="label">Student Name</div><div class="value">${studentName}</div></div>
              <div class="field"><div class="label">Course</div><div class="value">${courseName}</div></div>
              <div class="field"><div class="label">Student Mobile</div><div class="value">${studentMobile}</div></div>
              <div class="field"><div class="label">Guardian Mobile</div><div class="value">${guardianMobile}</div></div>
              <div class="field"><div class="label">Academic Year</div><div class="value">${f.months_paid || "-"}</div></div>
              <div class="field"><div class="label">Payment Mode</div><div class="value" style="text-transform:capitalize">${f.payment_mode}</div></div>
              ${f.note ? `<div class="field" style="grid-column: 1 / -1;"><div class="label">Note</div><div class="value">${f.note}</div></div>` : ""}
            </div>

            <div class="amount-box">
              <div class="label">Amount Paid</div>
              <div class="amt">₹${f.amount}</div>
            </div>

            <div class="sign-row">
              <div class="sign-box">
                <div class="sign-line">Received By</div>
              </div>
              <div class="sign-box">
                <div class="seal-box">Seal</div>
                <div class="sign-line">Authorized Signatory</div>
              </div>
            </div>

            <div class="footer-note">This is a computer-generated receipt.</div>
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    win.document.close();
  }

  const filtered = feeRecords.filter(f =>
    f.students?.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  const totalCollected = feeRecords.reduce((sum, f) => sum + (f.amount || 0), 0);

  function studentTotalPaid(studentId) {
    return feeRecords.filter(f => f.student_id === studentId).reduce((s, f) => s + (f.amount || 0), 0);
  }

  function studentYearPaid(studentId, year) {
    return feeRecords.filter(f => f.student_id === studentId && f.months_paid === year).reduce((s, f) => s + (f.amount || 0), 0);
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2 style={{ fontSize: "22px", fontWeight: "700" }}>Hostel Fee</h2>
        <button onClick={() => setShowForm(true)}
          style={{ padding: "10px 20px", background: "#1a1a2e", color: "white", border: "none", borderRadius: "6px", fontWeight: "600" }}>
          + Collect Payment
        </button>
      </div>

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

      {showForm && (
        <div style={{ background: "white", borderRadius: "12px", padding: "24px", marginBottom: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
          <h3 style={{ marginBottom: "16px", fontWeight: "600" }}>Collect Hostel Fee</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>Student *</label>
              <select value={form.student_id} onChange={e => setForm({ ...form, student_id: e.target.value })}
                style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "6px" }}>
                <option value="">-- Select Student --</option>
                {students.map(s => <option key={s.id} value={s.id}>{s.full_name} — {s.courses?.name}</option>)}
              </select>
              {form.student_id && (
                <div style={{ fontSize: "12px", color: "#888", marginTop: "4px" }}>
                  {form.academic_year} — Paid: ₹{studentYearPaid(form.student_id, form.academic_year).toLocaleString()}
                  {" "}/ Target: ₹{getTarget(form.student_id, form.academic_year).toLocaleString()}
                  {" "}/ Pending: ₹{Math.max(0, getTarget(form.student_id, form.academic_year) - studentYearPaid(form.student_id, form.academic_year)).toLocaleString()}
                </div>
              )}
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>Amount (₹) *</label>
              <input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })}
                placeholder="e.g. 20000"
                style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "6px" }} />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>Academic Year *</label>
              <select value={form.academic_year} onChange={e => setForm({ ...form, academic_year: e.target.value })}
                style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "6px" }}>
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
              </select>
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
                <option value="online">UPI / Online</option>
                <option value="cheque">Cheque</option>
              </select>
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>Note</label>
              <input value={form.note} onChange={e => setForm({ ...form, note: e.target.value })}
                placeholder="e.g. Admission fee, EMI 2"
                style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "6px" }} />
            </div>
          </div>
          {form.student_id && (
            <div style={{ marginTop: "16px", padding: "14px", background: "#f8f9fa", borderRadius: "8px" }}>
              <div style={{ fontSize: "13px", fontWeight: "600", marginBottom: "8px" }}>
                Set Custom Fee Target for {form.academic_year} (overrides course default)
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <input type="number" value={targetAmount} onChange={e => setTargetAmount(e.target.value)}
                  placeholder={`Default: ₹${getTarget(form.student_id, form.academic_year)}`}
                  style={{ flex: 1, padding: "8px 10px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "13px" }} />
                <button onClick={saveTarget} disabled={savingTarget}
                  style={{ padding: "8px 16px", background: "#1a5cc8", color: "white", border: "none", borderRadius: "6px", fontSize: "13px", fontWeight: "600" }}>
                  {savingTarget ? "Saving..." : "Set Target"}
                </button>
              </div>
            </div>
          )}

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

      <div style={{ marginBottom: "16px" }}>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search student name..."
          style={{ padding: "10px 12px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "14px", width: "260px" }} />
      </div>

      {loading ? <div>Loading...</div> : (
        <div style={{ background: "white", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", overflow: "hidden" }}>
          {filtered.length === 0 ? (
            <div style={{ padding: "32px", textAlign: "center", color: "#666" }}>No fee records found.</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8f9fa", borderBottom: "2px solid #eee" }}>
                  {["#", "Student", "Amount", "Date", "Mode", "Academic Year", "Note", "Receipt", ""].map(h => (
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
                    <td style={{ padding: "12px 16px", fontSize: "14px", color: "#555" }}>{f.note || "-"}</td>
                    <td style={{ padding: "12px 16px", fontSize: "12px", color: "#888" }}>{f.receipt_number}</td>
                    <td style={{ padding: "12px 16px", display: "flex", gap: "8px" }}>
                      <button onClick={() => printReceipt(f)}
                        style={{ padding: "5px 12px", background: "#f0f7ff", color: "#1a5cc8", border: "1px solid #c0d8ff", borderRadius: "6px", fontSize: "12px" }}>
                        Print
                      </button>
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
