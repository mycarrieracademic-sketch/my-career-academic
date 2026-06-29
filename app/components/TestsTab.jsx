"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

export default function TestsTab() {
  const [tests, setTests] = useState([]);
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "", course_id: "", subject_id: "",
    test_date: new Date().toISOString().split("T")[0], total_marks: 100
  });

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    const [t, c, sub] = await Promise.all([
      supabase.from("tests").select("*, courses(name), subjects(name)").order("test_date", { ascending: false }),
      supabase.from("courses").select("*").order("name"),
      supabase.from("subjects").select("*").order("name")
    ]);
    setTests(t.data || []);
    setCourses(c.data || []);
    setSubjects(sub.data || []);
    setLoading(false);
  }

  async function handleSaveTest() {
    if (!form.title.trim()) return alert("Title required!");
    if (!form.course_id) return alert("Select a course!");
    await supabase.from("tests").insert({
      title: form.title.trim(),
      course_id: form.course_id,
      subject_id: form.subject_id || null,
      test_date: form.test_date,
      total_marks: parseInt(form.total_marks) || 100
    });
    setShowForm(false);
    setForm({ title: "", course_id: "", subject_id: "", test_date: new Date().toISOString().split("T")[0], total_marks: 100 });
    fetchAll();
  }

  async function selectTest(test) {
    setSelectedTest(test);
    const { data: studs } = await supabase.from("students")
      .select("*").eq("course_id", test.course_id).eq("status", "active").order("full_name");
    setStudents(studs || []);

    const { data: res } = await supabase.from("test_results")
      .select("*").eq("test_id", test.id);
    const resMap = {};
    (res || []).forEach(r => { resMap[r.student_id] = r.marks_obtained; });
    setResults(resMap);
  }

  async function handleSaveResults() {
    if (!selectedTest) return;
    setSaving(true);
    await supabase.from("test_results").delete().eq("test_id", selectedTest.id);
    const records = students
      .filter(s => results[s.id] !== undefined && results[s.id] !== "")
      .map(s => ({
        test_id: selectedTest.id,
        student_id: s.id,
        marks_obtained: parseFloat(results[s.id]),
        grade: getGrade(parseFloat(results[s.id]), selectedTest.total_marks)
      }));
    if (records.length > 0) await supabase.from("test_results").insert(records);
    setSaving(false);
    alert("Results saved!");
  }

  async function handleDeleteTest(id) {
    if (!confirm("Delete this test?")) return;
    await supabase.from("tests").delete().eq("id", id);
    if (selectedTest?.id === id) setSelectedTest(null);
    fetchAll();
  }

  function getGrade(marks, total) {
    const pct = (marks / total) * 100;
    if (pct >= 90) return "A+";
    if (pct >= 80) return "A";
    if (pct >= 70) return "B+";
    if (pct >= 60) return "B";
    if (pct >= 50) return "C";
    if (pct >= 40) return "D";
    return "F";
  }

  const filteredSubjects = form.course_id ? subjects.filter(s => s.course_id === form.course_id) : subjects;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2 style={{ fontSize: "22px", fontWeight: "700" }}>Tests & Results</h2>
        <button onClick={() => setShowForm(true)}
          style={{ padding: "10px 20px", background: "#1a1a2e", color: "white", border: "none", borderRadius: "6px", fontWeight: "600" }}>
          + Add Test
        </button>
      </div>

      {showForm && (
        <div style={{ background: "white", borderRadius: "12px", padding: "24px", marginBottom: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
          <h3 style={{ marginBottom: "16px", fontWeight: "600" }}>New Test</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>Test Title *</label>
              <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Unit Test 1"
                style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "6px" }} />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>Course *</label>
              <select value={form.course_id} onChange={e => setForm({ ...form, course_id: e.target.value, subject_id: "" })}
                style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "6px" }}>
                <option value="">-- Select Course --</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>Subject</label>
              <select value={form.subject_id} onChange={e => setForm({ ...form, subject_id: e.target.value })}
                style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "6px" }}>
                <option value="">-- Select Subject --</option>
                {filteredSubjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>Test Date</label>
              <input type="date" value={form.test_date} onChange={e => setForm({ ...form, test_date: e.target.value })}
                style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "6px" }} />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>Total Marks</label>
              <input type="number" value={form.total_marks} onChange={e => setForm({ ...form, total_marks: e.target.value })}
                style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "6px" }} />
            </div>
          </div>
          <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
            <button onClick={handleSaveTest}
              style={{ padding: "10px 24px", background: "#1a1a2e", color: "white", border: "none", borderRadius: "6px", fontWeight: "600" }}>
              Save
            </button>
            <button onClick={() => setShowForm(false)}
              style={{ padding: "10px 24px", background: "#f0f0f0", border: "none", borderRadius: "6px" }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: selectedTest ? "320px 1fr" : "1fr", gap: "20px" }}>
        {/* Tests List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {loading ? <div>Loading...</div> : tests.length === 0 ? (
            <div style={{ background: "white", borderRadius: "12px", padding: "32px", textAlign: "center", color: "#666" }}>
              No tests yet.
            </div>
          ) : tests.map(test => (
            <div key={test.id} onClick={() => selectTest(test)}
              style={{
                background: "white", borderRadius: "10px", padding: "16px",
                cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                border: selectedTest?.id === test.id ? "2px solid #1a1a2e" : "2px solid transparent"
              }}>
              <div style={{ fontWeight: "600", fontSize: "15px", marginBottom: "4px" }}>{test.title}</div>
              <div style={{ fontSize: "13px", color: "#666" }}>{test.courses?.name}</div>
              {test.subjects?.name && <div style={{ fontSize: "12px", color: "#888" }}>{test.subjects.name}</div>}
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px", fontSize: "12px", color: "#888" }}>
                <span>📅 {test.test_date}</span>
                <span>Total: {test.total_marks}</span>
              </div>
              <button onClick={e => { e.stopPropagation(); handleDeleteTest(test.id); }}
                style={{ marginTop: "8px", padding: "4px 10px", background: "#fff0f0", color: "#c00", border: "1px solid #ffc0c0", borderRadius: "6px", fontSize: "12px" }}>
                Delete
              </button>
            </div>
          ))}
        </div>

        {/* Results Entry */}
        {selectedTest && (
          <div style={{ background: "white", borderRadius: "12px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
            <h3 style={{ fontWeight: "700", fontSize: "16px", marginBottom: "4px" }}>{selectedTest.title}</h3>
            <div style={{ fontSize: "13px", color: "#666", marginBottom: "20px" }}>
              {selectedTest.courses?.name} • Total Marks: {selectedTest.total_marks}
            </div>
            {students.length === 0 ? (
              <div style={{ color: "#666" }}>No active students in this course.</div>
            ) : (
              <div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
                  {students.map(s => {
                    const marks = results[s.id];
                    const grade = marks !== undefined && marks !== "" ? getGrade(parseFloat(marks), selectedTest.total_marks) : "";
                    return (
                      <div key={s.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 16px", background: "#f8f9fa", borderRadius: "8px" }}>
                        <div style={{ flex: 1, fontWeight: "500", fontSize: "14px" }}>{s.full_name}</div>
                        <input
                          type="number" min="0" max={selectedTest.total_marks}
                          value={results[s.id] ?? ""}
                          onChange={e => setResults({ ...results, [s.id]: e.target.value })}
                          placeholder="Marks"
                          style={{ width: "80px", padding: "6px 10px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "14px", textAlign: "center" }}
                        />
                        <span style={{ width: "40px", textAlign: "center", fontWeight: "700", fontSize: "14px",
                          color: grade === "F" ? "#e74c3c" : grade.startsWith("A") ? "#27ae60" : "#e67e22" }}>
                          {grade}
                        </span>
                        <span style={{ fontSize: "13px", color: "#888" }}>
                          {marks !== undefined && marks !== "" ? Math.round((parseFloat(marks) / selectedTest.total_marks) * 100) + "%" : ""}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <button onClick={handleSaveResults} disabled={saving}
                  style={{ padding: "12px 32px", background: saving ? "#999" : "#1a1a2e", color: "white", border: "none", borderRadius: "6px", fontWeight: "600", fontSize: "15px" }}>
                  {saving ? "Saving..." : "Save Results"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
