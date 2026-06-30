"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

export default function AdmissionTab() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    full_name: "", father_name: "", mother_name: "", dob: "", gender: "",
    blood_group: "", aadhar_number: "", email: "",
    mobile: "", guardian_mobile: "",
    previous_qualification: "", course_id: "",
    address: "", district: "", state: "Odisha", pincode: "",
    hostel_required: true,
    admission_date: new Date().toISOString().split("T")[0]
  });

  useEffect(() => { fetchCourses(); }, []);

  async function fetchCourses() {
    const { data } = await supabase.from("courses").select("*").order("name");
    setCourses(data || []);
  }

  function update(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSubmit() {
    if (!form.full_name.trim()) return alert("Student name required!");
    if (!form.course_id) return alert("Please select a course!");
    setLoading(true);

    const { data: student, error } = await supabase.from("students").insert({
      full_name: form.full_name.trim(),
      father_name: form.father_name.trim(),
      mother_name: form.mother_name.trim(),
      dob: form.dob || null,
      gender: form.gender,
      blood_group: form.blood_group,
      aadhar_number: form.aadhar_number.trim(),
      email: form.email.trim(),
      mobile: form.mobile.trim(),
      guardian_mobile: form.guardian_mobile.trim(),
      previous_qualification: form.previous_qualification.trim(),
      course_id: form.course_id,
      address: form.address.trim(),
      district: form.district.trim(),
      state: form.state.trim(),
      pincode: form.pincode.trim(),
      hostel_required: form.hostel_required,
      admission_date: form.admission_date,
      status: "active"
    }).select().single();

    if (error) { alert("Error: " + error.message); setLoading(false); return; }

    await supabase.from("academic_terms").insert({
      student_id: student.id,
      course_id: form.course_id,
      start_date: form.admission_date,
      is_current: true
    });

    setSuccess(`✅ ${form.full_name} admitted successfully!`);
    setForm({
      full_name: "", father_name: "", mother_name: "", dob: "", gender: "",
      blood_group: "", aadhar_number: "", email: "",
      mobile: "", guardian_mobile: "",
      previous_qualification: "", course_id: "",
      address: "", district: "", state: "Odisha", pincode: "",
      hostel_required: true,
      admission_date: new Date().toISOString().split("T")[0]
    });
    setLoading(false);
    setTimeout(() => setSuccess(""), 4000);
  }

  const inputStyle = { width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "14px" };
  const labelStyle = { display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: "500", color: "#333" };

  function Field({ label, children }) {
    return (
      <div>
        <label style={labelStyle}>{label}</label>
        {children}
      </div>
    );
  }

  function SectionTitle({ children }) {
    return (
      <div style={{ fontSize: "15px", fontWeight: "700", color: "#1a1a2e", margin: "28px 0 14px", paddingBottom: "8px", borderBottom: "2px solid #f0f0f0" }}>
        {children}
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ fontSize: "22px", fontWeight: "700", marginBottom: "24px" }}>New Admission</h2>

      {success && (
        <div style={{ background: "#f0fff4", color: "#27ae60", padding: "12px 16px", borderRadius: "8px", marginBottom: "20px", fontWeight: "500" }}>
          {success}
        </div>
      )}

      <div style={{ background: "white", borderRadius: "12px", padding: "28px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>

        <SectionTitle>👤 Personal Details</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "18px" }}>
          <Field label="Student Full Name *">
            <input value={form.full_name} onChange={e => update("full_name", e.target.value)} placeholder="Enter full name" style={inputStyle} />
          </Field>
          <Field label="Father's Name">
            <input value={form.father_name} onChange={e => update("father_name", e.target.value)} placeholder="Father's name" style={inputStyle} />
          </Field>
          <Field label="Mother's Name">
            <input value={form.mother_name} onChange={e => update("mother_name", e.target.value)} placeholder="Mother's name" style={inputStyle} />
          </Field>
          <Field label="Date of Birth">
            <input type="date" value={form.dob} onChange={e => update("dob", e.target.value)} style={inputStyle} />
          </Field>
          <Field label="Gender">
            <select value={form.gender} onChange={e => update("gender", e.target.value)} style={inputStyle}>
              <option value="">-- Select --</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </Field>
          <Field label="Blood Group">
            <select value={form.blood_group} onChange={e => update("blood_group", e.target.value)} style={inputStyle}>
              <option value="">-- Select --</option>
              {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(bg => <option key={bg} value={bg}>{bg}</option>)}
            </select>
          </Field>
          <Field label="Aadhar Number">
            <input value={form.aadhar_number} onChange={e => update("aadhar_number", e.target.value)} placeholder="12 digit Aadhar number" style={inputStyle} />
          </Field>
          <Field label="Email">
            <input type="email" value={form.email} onChange={e => update("email", e.target.value)} placeholder="email@example.com" style={inputStyle} />
          </Field>
        </div>

        <SectionTitle>📞 Contact Details</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
          <Field label="Student Mobile">
            <input value={form.mobile} onChange={e => update("mobile", e.target.value)} placeholder="10 digit mobile number" style={inputStyle} />
          </Field>
          <Field label="Guardian Mobile">
            <input value={form.guardian_mobile} onChange={e => update("guardian_mobile", e.target.value)} placeholder="Parent/Guardian mobile" style={inputStyle} />
          </Field>
        </div>

        <SectionTitle>🎓 Academic & Course Details</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
          <Field label="Previous Qualification">
            <input value={form.previous_qualification} onChange={e => update("previous_qualification", e.target.value)} placeholder="e.g. 10th passed, 12th Science" style={inputStyle} />
          </Field>
          <Field label="Course *">
            <select value={form.course_id} onChange={e => update("course_id", e.target.value)} style={inputStyle}>
              <option value="">-- Select Course --</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
          <Field label="Admission Date">
            <input type="date" value={form.admission_date} onChange={e => update("admission_date", e.target.value)} style={inputStyle} />
          </Field>
          <Field label="Hostel Required?">
            <select value={form.hostel_required ? "yes" : "no"} onChange={e => update("hostel_required", e.target.value === "yes")} style={inputStyle}>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </Field>
        </div>

        <SectionTitle>🏠 Address</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "18px" }}>
          <div style={{ gridColumn: "1 / -1" }}>
            <Field label="Address">
              <input value={form.address} onChange={e => update("address", e.target.value)} placeholder="Village/Street/Landmark" style={inputStyle} />
            </Field>
          </div>
          <Field label="District">
            <input value={form.district} onChange={e => update("district", e.target.value)} placeholder="e.g. Kendrapara" style={inputStyle} />
          </Field>
          <Field label="State">
            <input value={form.state} onChange={e => update("state", e.target.value)} style={inputStyle} />
          </Field>
          <Field label="Pincode">
            <input value={form.pincode} onChange={e => update("pincode", e.target.value)} placeholder="6 digit pincode" style={inputStyle} />
          </Field>
        </div>

        <button onClick={handleSubmit} disabled={loading}
          style={{
            marginTop: "28px", padding: "12px 32px",
            background: loading ? "#999" : "#1a1a2e",
            color: "white", border: "none", borderRadius: "6px",
            fontSize: "16px", fontWeight: "600"
          }}>
          {loading ? "Saving..." : "Admit Student"}
        </button>
      </div>
    </div>
  );
}
