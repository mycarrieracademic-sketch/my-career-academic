"use client";
import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { supabase } from "../../lib/supabase";

export default function AccountsTab() {
  const [incomeRecords, setIncomeRecords] = useState([]);
  const [feeRecords, setFeeRecords] = useState([]);
  const [expenseRecords, setExpenseRecords] = useState([]);
  const [teacherPayments, setTeacherPayments] = useState([]);
  const [staff, setStaff] = useState([]);
  const [classes, setClasses] = useState([]);
  const [activeStudents, setActiveStudents] = useState([]);
  const [feeTargets, setFeeTargets] = useState([]);
  const [overviewYear, setOverviewYear] = useState("1st Year");
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("summary");
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState("income");
  const [saving, setSaving] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [form, setForm] = useState({
    amount: "", category: "", description: "",
    date: new Date().toISOString().split("T")[0],
    teacher_id: "", live_class_id: ""
  });

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    const [inc, fee, exp, tp, st, cl, stu, tgt] = await Promise.all([
      supabase.from("income_records").select("*").order("income_date", { ascending: false }),
      supabase.from("fee_records").select("*, students(full_name)").order("payment_date", { ascending: false }),
      supabase.from("expense_records").select("*").order("expense_date", { ascending: false }),
      supabase.from("teacher_class_payments").select("*, staff(full_name), live_classes(title, class_date)").order("payment_date", { ascending: false }),
      supabase.from("staff").select("*").eq("role", "teacher").eq("status", "active"),
      supabase.from("live_classes").select("*").eq("status", "completed").order("class_date", { ascending: false }),
      supabase.from("students").select("*, courses(monthly_fee)").eq("status", "active"),
      supabase.from("student_fee_targets").select("*")
    ]);
    setIncomeRecords(inc.data || []);
    setFeeRecords(fee.data || []);
    setExpenseRecords(exp.data || []);
    setTeacherPayments(tp.data || []);
    setStaff(st.data || []);
    setClasses(cl.data || []);
    setActiveStudents(stu.data || []);
    setFeeTargets(tgt.data || []);
    setLoading(false);
  }

  function studentTargetFor(student, year) {
    const custom = feeTargets.find(t => t.student_id === student.id && t.academic_year === year);
    if (custom) return custom.target_amount;
    return student.courses?.monthly_fee || 0;
  }

  async function handleSave() {
    if (!form.amount) return alert("Enter amount!");
    setSaving(true);

    if (formType === "income") {
      if (!form.category.trim()) return alert("Enter category!");
      await supabase.from("income_records").insert({
        amount: parseFloat(form.amount),
        category: form.category.trim(),
        description: form.description.trim(),
        income_date: form.date
      });
    } else if (formType === "expense") {
      if (!form.category.trim()) return alert("Enter category!");
      await supabase.from("expense_records").insert({
        amount: parseFloat(form.amount),
        category: form.category.trim(),
        description: form.description.trim(),
        expense_date: form.date
      });
    } else if (formType === "teacher_payment") {
      if (!form.teacher_id) return alert("Select a teacher!");
      await supabase.from("teacher_class_payments").insert({
        teacher_id: form.teacher_id,
        live_class_id: form.live_class_id || null,
        amount: parseFloat(form.amount),
        payment_date: form.date,
        note: form.description.trim(),
        status: "pending"
      });
    }

    setShowForm(false);
    setForm({ amount: "", category: "", description: "", date: new Date().toISOString().split("T")[0], teacher_id: "", live_class_id: "" });
    setSaving(false);
    fetchAll();
  }

  async function handleDeleteIncome(id) {
    if (!confirm("Delete?")) return;
    await supabase.from("income_records").delete().eq("id", id);
    fetchAll();
  }

  async function handleDeleteExpense(id) {
    if (!confirm("Delete?")) return;
    await supabase.from("expense_records").delete().eq("id", id);
    fetchAll();
  }

  async function handleDeleteTeacherPayment(id) {
    if (!confirm("Delete?")) return;
    await supabase.from("teacher_class_payments").delete().eq("id", id);
    fetchAll();
  }

  async function handleConfirmPayment(id) {
    await supabase.from("teacher_class_payments").update({ status: "confirmed" }).eq("id", id);
    fetchAll();
  }

  async function handleMarkPaid(id) {
    await supabase.from("teacher_class_payments").update({ status: "paid" }).eq("id", id);
    fetchAll();
  }

  // ---- Date filter helper ----
  function inRange(dateStr) {
    if (!dateStr) return false;
    if (dateFrom && dateStr < dateFrom) return false;
    if (dateTo && dateStr > dateTo) return false;
    return true;
  }
  function applyFilter(records, dateField) {
    if (!dateFrom && !dateTo) return records;
    return records.filter(r => inRange(r[dateField]));
  }

  const filteredFee = applyFilter(feeRecords, "payment_date");
  const filteredIncome = applyFilter(incomeRecords, "income_date");
  const filteredExpense = applyFilter(expenseRecords, "expense_date");
  const filteredTeacherPay = applyFilter(teacherPayments, "payment_date");

  const totalFeeIncome = feeRecords.reduce((s, r) => s + (r.amount || 0), 0);
  const totalMiscIncome = incomeRecords.reduce((s, r) => s + (r.amount || 0), 0);
  const totalIncome = totalFeeIncome + totalMiscIncome;
  const totalExpense = expenseRecords.reduce((s, r) => s + (r.amount || 0), 0);
  const totalTeacherPayPaid = teacherPayments.filter(r => r.status === "paid").reduce((s, r) => s + (r.amount || 0), 0);
  const totalTeacherPayDue = teacherPayments.filter(r => r.status !== "paid").reduce((s, r) => s + (r.amount || 0), 0);
  const netBalance = totalIncome - totalExpense - totalTeacherPayPaid;

  const feeByYear = ["1st Year", "2nd Year", "3rd Year"].map(yr => ({
    year: yr,
    total: feeRecords.filter(f => f.months_paid === yr).reduce((s, f) => s + (f.amount || 0), 0),
    count: feeRecords.filter(f => f.months_paid === yr).length
  }));

  const overviewExpected = activeStudents.reduce((s, stu) => s + studentTargetFor(stu, overviewYear), 0);
  const overviewPaid = feeRecords.filter(f => f.months_paid === overviewYear)
    .reduce((s, f) => s + (f.amount || 0), 0);
  const overviewPending = Math.max(0, overviewExpected - overviewPaid);

  // ---- Excel Export functions ----
  function exportOverall() {
    const wb = XLSX.utils.book_new();

    const incomeSheet = [
      ...filteredFee.map(r => ({ Date: r.payment_date, Type: "Hostel Fee", Student: r.students?.full_name || "", "Academic Year": r.months_paid || "", Mode: r.payment_mode, Amount: r.amount, Note: r.note || "" })),
      ...filteredIncome.map(r => ({ Date: r.income_date, Type: "Misc Income", Student: "", "Academic Year": "", Mode: r.category, Amount: r.amount, Note: r.description || "" }))
    ];
    const expenseSheet = filteredExpense.map(r => ({ Date: r.expense_date, Category: r.category, Description: r.description || "", Amount: r.amount }));
    const teacherSheet = filteredTeacherPay.map(r => ({ Date: r.payment_date, Teacher: r.staff?.full_name || "", Class: r.live_classes?.title || "", Note: r.note || "", Amount: r.amount }));

    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(incomeSheet), "Income");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(expenseSheet), "Expense");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(teacherSheet), "Teacher Payments");

    const filterLabel = (dateFrom || dateTo) ? `_${dateFrom || "start"}_to_${dateTo || "end"}` : "";
    XLSX.writeFile(wb, `MCA_Accounts_Report${filterLabel}.xlsx`);
  }

  function exportSection(type) {
    let data = [];
    let filename = "";
    if (type === "income") {
      data = [
        ...filteredFee.map(r => ({ Date: r.payment_date, Type: "Hostel Fee", Student: r.students?.full_name || "", "Academic Year": r.months_paid || "", Mode: r.payment_mode, Amount: r.amount, Note: r.note || "" })),
        ...filteredIncome.map(r => ({ Date: r.income_date, Type: "Misc Income", Student: "", "Academic Year": "", Mode: r.category, Amount: r.amount, Note: r.description || "" }))
      ];
      filename = "MCA_Income_Report.xlsx";
    } else if (type === "expense") {
      data = filteredExpense.map(r => ({ Date: r.expense_date, Category: r.category, Description: r.description || "", Amount: r.amount }));
      filename = "MCA_Expense_Report.xlsx";
    } else if (type === "teacher_payment") {
      data = filteredTeacherPay.map(r => ({ Date: r.payment_date, Teacher: r.staff?.full_name || "", Class: r.live_classes?.title || "", Note: r.note || "", Amount: r.amount }));
      filename = "MCA_TeacherPayments_Report.xlsx";
    }
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report");
    XLSX.writeFile(wb, filename);
  }

  const sections = ["summary", "income", "expense", "teacher_payment"];
  const sectionLabels = { summary: "Summary", income: "Income", expense: "Expense", teacher_payment: "Teacher Payments" };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <h2 style={{ fontSize: "22px", fontWeight: "700" }}>Accounts</h2>
        <div style={{ display: "flex", gap: "10px" }}>
          {activeSection !== "summary" && (
            <button onClick={() => exportSection(activeSection)}
              style={{ padding: "10px 18px", background: "#1a7a3c", color: "white", border: "none", borderRadius: "6px", fontWeight: "600" }}>
              ⬇ Export {sectionLabels[activeSection]}
            </button>
          )}
          <button onClick={exportOverall}
            style={{ padding: "10px 18px", background: "#1a5cc8", color: "white", border: "none", borderRadius: "6px", fontWeight: "600" }}>
            ⬇ Export Overall
          </button>
          {activeSection !== "summary" && activeSection !== "income" && (
            <button onClick={() => { setFormType(activeSection); setShowForm(true); }}
              style={{ padding: "10px 20px", background: "#1a1a2e", color: "white", border: "none", borderRadius: "6px", fontWeight: "600" }}>
              + Add {sectionLabels[activeSection]}
            </button>
          )}
          {activeSection === "income" && (
            <button onClick={() => { setFormType("income"); setShowForm(true); }}
              style={{ padding: "10px 20px", background: "#1a1a2e", color: "white", border: "none", borderRadius: "6px", fontWeight: "600" }}>
              + Add Misc Income
            </button>
          )}
        </div>
      </div>

      {/* Date Filter for Export */}
      <div style={{ display: "flex", gap: "12px", alignItems: "flex-end", marginBottom: "20px", background: "white", padding: "14px 16px", borderRadius: "10px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <div>
          <label style={{ display: "block", marginBottom: "4px", fontSize: "12px", color: "#666" }}>From Date (for export)</label>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
            style={{ padding: "8px", border: "1px solid #ddd", borderRadius: "6px" }} />
        </div>
        <div>
          <label style={{ display: "block", marginBottom: "4px", fontSize: "12px", color: "#666" }}>To Date (for export)</label>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
            style={{ padding: "8px", border: "1px solid #ddd", borderRadius: "6px" }} />
        </div>
        {(dateFrom || dateTo) && (
          <button onClick={() => { setDateFrom(""); setDateTo(""); }}
            style={{ padding: "8px 14px", background: "#f0f0f0", border: "none", borderRadius: "6px", fontSize: "13px" }}>
            Clear Filter
          </button>
        )}
        <div style={{ fontSize: "12px", color: "#999", marginLeft: "auto" }}>
          Leave blank to export all-time data
        </div>
      </div>

      <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
        {sections.map(s => (
          <button key={s} onClick={() => { setActiveSection(s); setShowForm(false); }}
            style={{
              padding: "8px 16px", border: "none", borderRadius: "6px", fontSize: "14px", fontWeight: "500",
              background: activeSection === s ? "#1a1a2e" : "#f0f0f0",
              color: activeSection === s ? "white" : "#333"
            }}>
            {sectionLabels[s]}
          </button>
        ))}
      </div>

      {activeSection === "summary" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px", marginBottom: "24px" }}>
            {[
              { label: "Total Income", value: totalIncome, color: "#27ae60" },
              { label: "Total Expense", value: totalExpense, color: "#e74c3c" },
              { label: "Teacher Payments (Paid)", value: totalTeacherPayPaid, color: "#e67e22" },
              { label: "Teacher Dues (Unpaid)", value: totalTeacherPayDue, color: "#c0392b" },
              { label: "Net Balance", value: netBalance, color: netBalance >= 0 ? "#27ae60" : "#e74c3c" },
            ].map(card => (
              <div key={card.label} style={{ background: "white", borderRadius: "12px", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", borderTop: `4px solid ${card.color}` }}>
                <div style={{ fontSize: "26px", fontWeight: "700", color: card.color }}>₹{card.value.toLocaleString()}</div>
                <div style={{ fontSize: "13px", color: "#666", marginTop: "4px" }}>{card.label}</div>
              </div>
            ))}
          </div>

          <div style={{ background: "white", borderRadius: "12px", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", marginBottom: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <div style={{ fontWeight: "600" }}>Institute Fee Overview — {overviewYear}</div>
              <div style={{ display: "flex", gap: "6px" }}>
                {["1st Year", "2nd Year", "3rd Year"].map(yr => (
                  <button key={yr} onClick={() => setOverviewYear(yr)}
                    style={{
                      padding: "5px 12px", border: "none", borderRadius: "5px", fontSize: "12px", fontWeight: "600",
                      background: overviewYear === yr ? "#1a1a2e" : "#f0f0f0",
                      color: overviewYear === yr ? "white" : "#333"
                    }}>
                    {yr}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "12px" }}>
              {[
                { label: "Active Students", value: activeStudents.length, color: "#1a1a2e" },
                { label: "Total Expected", value: "₹" + overviewExpected.toLocaleString(), color: "#3498db" },
                { label: "Total Paid", value: "₹" + overviewPaid.toLocaleString(), color: "#27ae60" },
                { label: "Total Pending", value: "₹" + overviewPending.toLocaleString(), color: overviewPending > 0 ? "#e74c3c" : "#27ae60" },
              ].map(c => (
                <div key={c.label} style={{ padding: "12px 14px", background: "#f8f9fa", borderRadius: "8px", textAlign: "center" }}>
                  <div style={{ fontSize: "18px", fontWeight: "700", color: c.color }}>{c.value}</div>
                  <div style={{ fontSize: "11px", color: "#888", marginTop: "4px" }}>{c.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: "white", borderRadius: "12px", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", marginBottom: "16px" }}>
            <div style={{ fontWeight: "600", marginBottom: "12px" }}>Hostel Fee Income — Year-wise</div>
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
              {feeByYear.map(y => (
                <div key={y.year} style={{ padding: "12px 18px", background: "#f8f9fa", borderRadius: "8px", minWidth: "140px" }}>
                  <div style={{ fontSize: "12px", color: "#888" }}>{y.year}</div>
                  <div style={{ fontSize: "18px", fontWeight: "700", color: "#27ae60" }}>₹{y.total.toLocaleString()}</div>
                  <div style={{ fontSize: "11px", color: "#aaa" }}>{y.count} payments</div>
                </div>
              ))}
              <div style={{ padding: "12px 18px", background: "#eef4ff", borderRadius: "8px", minWidth: "140px" }}>
                <div style={{ fontSize: "12px", color: "#888" }}>Misc Income</div>
                <div style={{ fontSize: "18px", fontWeight: "700", color: "#3498db" }}>₹{totalMiscIncome.toLocaleString()}</div>
                <div style={{ fontSize: "11px", color: "#aaa" }}>{incomeRecords.length} records</div>
              </div>
            </div>
          </div>

          <div style={{ background: "white", borderRadius: "12px", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
            <div style={{ fontSize: "14px", color: "#555", lineHeight: "2" }}>
              <div>📈 Hostel Fee Records: <strong>{feeRecords.length}</strong></div>
              <div>📈 Misc Income Records: <strong>{incomeRecords.length}</strong></div>
              <div>📉 Expense Records: <strong>{expenseRecords.length}</strong></div>
              <div>👤 Teacher Payment Records: <strong>{teacherPayments.length}</strong></div>
              <div style={{ marginTop: "8px", fontSize: "13px", color: "#888" }}>
                Formula: NET = (Hostel Fee + Misc Income) - Expense - Teacher Payments
              </div>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div style={{ background: "white", borderRadius: "12px", padding: "24px", marginBottom: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
          <h3 style={{ marginBottom: "16px", fontWeight: "600" }}>
            Add {formType === "income" ? "Misc Income" : sectionLabels[formType]}
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>Amount (₹) *</label>
              <input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })}
                style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "6px" }} />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>Date</label>
              <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
                style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "6px" }} />
            </div>
            {formType !== "teacher_payment" && (
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>Category *</label>
                <input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                  placeholder={formType === "income" ? "e.g. Donation, Other" : "e.g. Salary, Rent, Misc"}
                  style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "6px" }} />
              </div>
            )}
            {formType === "teacher_payment" && (
              <>
                <div>
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>Teacher *</label>
                  <select value={form.teacher_id} onChange={e => setForm({ ...form, teacher_id: e.target.value })}
                    style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "6px" }}>
                    <option value="">-- Select Teacher --</option>
                    {staff.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>Class (Optional)</label>
                  <select value={form.live_class_id} onChange={e => setForm({ ...form, live_class_id: e.target.value })}
                    style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "6px" }}>
                    <option value="">-- Select Class --</option>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.title} ({c.class_date})</option>)}
                  </select>
                </div>
              </>
            )}
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>Description / Note</label>
              <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Optional"
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

      {activeSection === "income" && !loading && (
        <div>
          <div style={{ background: "white", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", overflow: "hidden", marginBottom: "20px" }}>
            <div style={{ padding: "14px 16px", fontWeight: "600", borderBottom: "1px solid #f0f0f0", background: "#f8f9fa" }}>
              Hostel Fee Income (from Hostel Fee tab)
            </div>
            {feeRecords.length === 0 ? (
              <div style={{ padding: "24px", textAlign: "center", color: "#666" }}>No hostel fee records.</div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#fafafa" }}>
                    {["#", "Date", "Student", "Academic Year", "Mode", "Amount"].map(h => (
                      <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#666" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {feeRecords.map((r, i) => (
                    <tr key={r.id} style={{ borderTop: "1px solid #f5f5f5" }}>
                      <td style={{ padding: "10px 16px", fontSize: "13px", color: "#888" }}>{i + 1}</td>
                      <td style={{ padding: "10px 16px", fontSize: "13px" }}>{r.payment_date}</td>
                      <td style={{ padding: "10px 16px", fontSize: "13px" }}>{r.students?.full_name}</td>
                      <td style={{ padding: "10px 16px", fontSize: "13px" }}>{r.months_paid}</td>
                      <td style={{ padding: "10px 16px", fontSize: "13px", textTransform: "capitalize" }}>{r.payment_mode}</td>
                      <td style={{ padding: "10px 16px", fontSize: "13px", fontWeight: "600", color: "#27ae60" }}>₹{r.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div style={{ background: "white", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", overflow: "hidden" }}>
            <div style={{ padding: "14px 16px", fontWeight: "600", borderBottom: "1px solid #f0f0f0", background: "#f8f9fa" }}>
              Misc Income (Donations, Other)
            </div>
            {incomeRecords.length === 0 ? (
              <div style={{ padding: "24px", textAlign: "center", color: "#666" }}>No misc income records.</div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#fafafa" }}>
                    {["#", "Date", "Category", "Description", "Amount", ""].map(h => (
                      <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#666" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {incomeRecords.map((r, i) => (
                    <tr key={r.id} style={{ borderTop: "1px solid #f5f5f5" }}>
                      <td style={{ padding: "10px 16px", fontSize: "13px", color: "#888" }}>{i + 1}</td>
                      <td style={{ padding: "10px 16px", fontSize: "13px" }}>{r.income_date}</td>
                      <td style={{ padding: "10px 16px", fontSize: "13px" }}>{r.category}</td>
                      <td style={{ padding: "10px 16px", fontSize: "13px", color: "#555" }}>{r.description || "-"}</td>
                      <td style={{ padding: "10px 16px", fontSize: "13px", fontWeight: "600", color: "#27ae60" }}>₹{r.amount}</td>
                      <td style={{ padding: "10px 16px" }}>
                        <button onClick={() => handleDeleteIncome(r.id)}
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
        </div>
      )}

      {activeSection === "expense" && !loading && (
        <div style={{ background: "white", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", overflow: "hidden" }}>
          {expenseRecords.length === 0 ? (
            <div style={{ padding: "32px", textAlign: "center", color: "#666" }}>No expense records.</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8f9fa" }}>
                  {["#", "Date", "Category", "Description", "Amount", ""].map(h => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "#444" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {expenseRecords.map((r, i) => (
                  <tr key={r.id} style={{ borderTop: "1px solid #f0f0f0" }}>
                    <td style={{ padding: "12px 16px", fontSize: "14px", color: "#888" }}>{i + 1}</td>
                    <td style={{ padding: "12px 16px", fontSize: "14px" }}>{r.expense_date}</td>
                    <td style={{ padding: "12px 16px", fontSize: "14px" }}>{r.category}</td>
                    <td style={{ padding: "12px 16px", fontSize: "14px", color: "#555" }}>{r.description || "-"}</td>
                    <td style={{ padding: "12px 16px", fontSize: "14px", fontWeight: "600", color: "#e74c3c" }}>₹{r.amount}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <button onClick={() => handleDeleteExpense(r.id)}
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

      {activeSection === "teacher_payment" && !loading && (
        <div style={{ background: "white", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", overflow: "hidden" }}>
          {teacherPayments.length === 0 ? (
            <div style={{ padding: "32px", textAlign: "center", color: "#666" }}>No teacher payments.</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8f9fa" }}>
                  {["#", "Date", "Teacher", "Class", "Note", "Amount", "Status", "Actions"].map(h => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "#444" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {teacherPayments.map((r, i) => (
                  <tr key={r.id} style={{ borderTop: "1px solid #f0f0f0" }}>
                    <td style={{ padding: "12px 16px", fontSize: "14px", color: "#888" }}>{i + 1}</td>
                    <td style={{ padding: "12px 16px", fontSize: "14px" }}>{r.payment_date}</td>
                    <td style={{ padding: "12px 16px", fontSize: "14px", fontWeight: "500" }}>{r.staff?.full_name}</td>
                    <td style={{ padding: "12px 16px", fontSize: "14px", color: "#555" }}>{r.live_classes?.title || "-"}</td>
                    <td style={{ padding: "12px 16px", fontSize: "14px", color: "#555" }}>{r.note || "-"}</td>
                    <td style={{ padding: "12px 16px", fontSize: "14px", fontWeight: "600", color: "#e67e22" }}>₹{r.amount}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{
                        padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "600",
                        background: r.status === "paid" ? "#e8f8f0" : r.status === "confirmed" ? "#eef4ff" : "#fff8e1",
                        color: r.status === "paid" ? "#27ae60" : r.status === "confirmed" ? "#3498db" : "#b8860b"
                      }}>{r.status || "pending"}</span>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", gap: "8px" }}>
                        {r.status === "pending" && (
                          <button onClick={() => handleConfirmPayment(r.id)}
                            style={{ padding: "5px 12px", background: "#eef4ff", color: "#3498db", border: "1px solid #c0d8ff", borderRadius: "6px", fontSize: "12px" }}>
                            Confirm
                          </button>
                        )}
                        {r.status === "confirmed" && (
                          <button onClick={() => handleMarkPaid(r.id)}
                            style={{ padding: "5px 12px", background: "#e8f8f0", color: "#27ae60", border: "1px solid #b0f0c0", borderRadius: "6px", fontSize: "12px" }}>
                            Mark Paid
                          </button>
                        )}
                        <button onClick={() => handleDeleteTeacherPayment(r.id)}
                          style={{ padding: "5px 12px", background: "#fff0f0", color: "#c00", border: "1px solid #ffc0c0", borderRadius: "6px", fontSize: "12px" }}>
                          Delete
                        </button>
                      </div>
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
