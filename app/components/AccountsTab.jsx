"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

export default function AccountsTab() {
  const [incomeRecords, setIncomeRecords] = useState([]);
  const [expenseRecords, setExpenseRecords] = useState([]);
  const [teacherPayments, setTeacherPayments] = useState([]);
  const [staff, setStaff] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("summary");
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState("income");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    amount: "", category: "", description: "",
    date: new Date().toISOString().split("T")[0],
    teacher_id: "", live_class_id: ""
  });

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    const [inc, exp, tp, st, cl] = await Promise.all([
      supabase.from("income_records").select("*").order("income_date", { ascending: false }),
      supabase.from("expense_records").select("*").order("expense_date", { ascending: false }),
      supabase.from("teacher_class_payments").select("*, staff(full_name), live_classes(title, class_date)").order("payment_date", { ascending: false }),
      supabase.from("staff").select("*").eq("role", "teacher").eq("status", "active"),
      supabase.from("live_classes").select("*").eq("status", "completed").order("class_date", { ascending: false })
    ]);
    setIncomeRecords(inc.data || []);
    setExpenseRecords(exp.data || []);
    setTeacherPayments(tp.data || []);
    setStaff(st.data || []);
    setClasses(cl.data || []);
    setLoading(false);
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
        note: form.description.trim()
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

  const totalIncome = incomeRecords.reduce((s, r) => s + (r.amount || 0), 0);
  const totalExpense = expenseRecords.reduce((s, r) => s + (r.amount || 0), 0);
  const totalTeacherPay = teacherPayments.reduce((s, r) => s + (r.amount || 0), 0);
  const netBalance = totalIncome - totalExpense - totalTeacherPay;

  const sections = ["summary", "income", "expense", "teacher_payment"];
  const sectionLabels = { summary: "Summary", income: "Income", expense: "Expense", teacher_payment: "Teacher Payments" };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2 style={{ fontSize: "22px", fontWeight: "700" }}>Accounts</h2>
        {activeSection !== "summary" && (
          <button onClick={() => { setFormType(activeSection); setShowForm(true); }}
            style={{ padding: "10px 20px", background: "#1a1a2e", color: "white", border: "none", borderRadius: "6px", fontWeight: "600" }}>
            + Add {sectionLabels[activeSection]}
          </button>
        )}
      </div>

      {/* Section Tabs */}
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

      {/* Summary */}
      {activeSection === "summary" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px", marginBottom: "24px" }}>
            {[
              { label: "Total Income", value: totalIncome, color: "#27ae60" },
              { label: "Total Expense", value: totalExpense, color: "#e74c3c" },
              { label: "Teacher Payments", value: totalTeacherPay, color: "#e67e22" },
              { label: "Net Balance", value: netBalance, color: netBalance >= 0 ? "#27ae60" : "#e74c3c" },
            ].map(card => (
              <div key={card.label} style={{ background: "white", borderRadius: "12px", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", borderTop: `4px solid ${card.color}` }}>
                <div style={{ fontSize: "26px", fontWeight: "700", color: card.color }}>₹{card.value.toLocaleString()}</div>
                <div style={{ fontSize: "13px", color: "#666", marginTop: "4px" }}>{card.label}</div>
              </div>
            ))}
          </div>
          <div style={{ background: "white", borderRadius: "12px", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
            <div style={{ fontSize: "14px", color: "#555", lineHeight: "2" }}>
              <div>📈 Income Records: <strong>{incomeRecords.length}</strong></div>
              <div>📉 Expense Records: <strong>{expenseRecords.length}</strong></div>
              <div>👤 Teacher Payment Records: <strong>{teacherPayments.length}</strong></div>
              <div style={{ marginTop: "8px", fontSize: "13px", color: "#888" }}>
                Formula: NET = Income - Expense - Teacher Payments
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Form */}
      {showForm && (
        <div style={{ background: "white", borderRadius: "12px", padding: "24px", marginBottom: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
          <h3 style={{ marginBottom: "16px", fontWeight: "600" }}>
            Add {sectionLabels[formType]}
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
                  placeholder="e.g. Salary, Rent, Misc"
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

      {/* Income Records */}
      {activeSection === "income" && !loading && (
        <div style={{ background: "white", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", overflow: "hidden" }}>
          {incomeRecords.length === 0 ? (
            <div style={{ padding: "32px", textAlign: "center", color: "#666" }}>No income records.</div>
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
                {incomeRecords.map((r, i) => (
                  <tr key={r.id} style={{ borderTop: "1px solid #f0f0f0" }}>
                    <td style={{ padding: "12px 16px", fontSize: "14px", color: "#888" }}>{i + 1}</td>
                    <td style={{ padding: "12px 16px", fontSize: "14px" }}>{r.income_date}</td>
                    <td style={{ padding: "12px 16px", fontSize: "14px" }}>{r.category}</td>
                    <td style={{ padding: "12px 16px", fontSize: "14px", color: "#555" }}>{r.description || "-"}</td>
                    <td style={{ padding: "12px 16px", fontSize: "14px", fontWeight: "600", color: "#27ae60" }}>₹{r.amount}</td>
                    <td style={{ padding: "12px 16px" }}>
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
      )}

      {/* Expense Records */}
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

      {/* Teacher Payments */}
      {activeSection === "teacher_payment" && !loading && (
        <div style={{ background: "white", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", overflow: "hidden" }}>
          {teacherPayments.length === 0 ? (
            <div style={{ padding: "32px", textAlign: "center", color: "#666" }}>No teacher payments.</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8f9fa" }}>
                  {["#", "Date", "Teacher", "Class", "Note", "Amount", ""].map(h => (
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
                      <button onClick={() => handleDeleteTeacherPayment(r.id)}
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
