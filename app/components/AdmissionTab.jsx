"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

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

export default function AdmissionTab() {
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [lastAdmitted, setLastAdmitted] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    full_name: "", father_name: "", mother_name: "", dob: "", gender: "",
    blood_group: "", aadhar_number: "", email: "",
    mobile: "", guardian_mobile: "",
    previous_qualification: "", course_id: "", stream: "",
    address: "", district: "", state: "Odisha", pincode: "",
    hostel_required: true,
    admission_date: new Date().toISOString().split("T")[0]
  });

  const STREAMS = ["Science", "Arts", "Commerce"];

  useEffect(() => { fetchCourses(); fetchSubjects(); }, []);

  async function fetchCourses() {
    const { data } = await supabase.from("courses").select("*").order("name");
    setCourses(data || []);
  }

  async function fetchSubjects() {
    const { data } = await supabase.from("subjects").select("*").order("name");
    setSubjects(data || []);
  }

  function toggleSubject(id) {
    setSelectedSubjects(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  function update(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function handlePhotoSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  async function uploadPhoto() {
    if (!photoFile) return null;
    setUploading(true);
    const fileExt = photoFile.name.split(".").pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${fileExt}`;
    const { error } = await supabase.storage.from("student-photos").upload(fileName, photoFile);
    setUploading(false);
    if (error) { alert("Photo upload failed: " + error.message); return null; }
    const { data } = supabase.storage.from("student-photos").getPublicUrl(fileName);
    return data.publicUrl;
  }

  function printAdmissionSlip(s) {
    const win = window.open("", "_blank", "width=580,height=820");
    win.document.write(`
      <html>
        <head>
          <title>Admission Slip - ${s.full_name}</title>
          <style>
            * { box-sizing: border-box; }
            body { font-family: Georgia, 'Times New Roman', serif; padding: 30px 40px; color: #1a1a1a; }
            .letterhead { text-align: center; border-bottom: 3px double #1a1a2e; padding-bottom: 12px; margin-bottom: 4px; position: relative; }
            .letterhead img { width: 64px; height: 64px; object-fit: contain; }
            .letterhead h1 { margin: 6px 0 2px; font-size: 20px; letter-spacing: 1px; color: #1a1a2e; }
            .letterhead p { margin: 0; font-size: 11px; color: #555; }
            .photo-box {
              position: absolute; top: 0; right: 0; width: 80px; height: 96px;
              border: 1.5px solid #1a1a2e; border-radius: 4px; overflow: hidden;
              background: #f5f5f5; display: flex; align-items: center; justify-content: center;
            }
            .photo-box img { width: 100%; height: 100%; object-fit: cover; }
            .photo-box span { font-size: 9px; color: #999; }
            .title-band {
              background: #1a1a2e; color: white; text-align: center; padding: 7px;
              font-size: 13px; font-weight: 700; letter-spacing: 1.5px; margin: 16px 0 18px;
            }
            .section { margin-bottom: 16px; }
            .section-title {
              font-size: 12px; font-weight: 700; color: #1a1a2e; text-transform: uppercase;
              letter-spacing: 0.5px; border-bottom: 1.5px solid #1a1a2e; padding-bottom: 4px; margin-bottom: 10px;
            }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 20px; }
            .field .label { font-size: 10px; color: #777; text-transform: uppercase; letter-spacing: 0.3px; }
            .field .value { font-size: 13px; font-weight: 600; color: #1a1a1a; margin-top: 1px; }
            .full-width { grid-column: 1 / -1; }
            .sign-row { display: flex; justify-content: space-between; margin-top: 50px; }
            .sign-box { text-align: center; width: 180px; }
            .sign-line { border-top: 1px solid #333; padding-top: 5px; font-size: 11px; color: #444; }
            .seal-box {
              width: 90px; height: 90px; border: 1.5px dashed #999; border-radius: 50%;
              display: flex; align-items: center; justify-content: center; text-align: center;
              font-size: 9px; color: #aaa; margin: 0 auto 8px;
            }
            .footer-note { text-align: center; font-size: 10px; color: #999; margin-top: 30px; border-top: 1px solid #eee; padding-top: 10px; }
          </style>
        </head>
        <body>
          <div class="letterhead">
            <img src="/mca-logo.png" />
            <h1>MY CAREER ACADEMIC</h1>
            <p>Division of MY LIFELINE FOUNDATION</p>
            <p>Kendrapara, Odisha</p>
            <div class="photo-box">
              ${s.photo_url ? `<img src="${s.photo_url}" />` : `<span>No Photo</span>`}
            </div>
          </div>

          <div class="title-band">STUDENT ADMISSION SLIP</div>

          <div class="section">
            <div class="section-title">Personal Details</div>
            <div class="grid">
              <div class="field"><div class="label">Student Name</div><div class="value">${s.full_name}</div></div>
              <div class="field"><div class="label">Admission Date</div><div class="value">${s.admission_date || "-"}</div></div>
              <div class="field"><div class="label">Father's Name</div><div class="value">${s.father_name || "-"}</div></div>
              <div class="field"><div class="label">Mother's Name</div><div class="value">${s.mother_name || "-"}</div></div>
              <div class="field"><div class="label">Date of Birth</div><div class="value">${s.dob || "-"}</div></div>
              <div class="field"><div class="label">Gender</div><div class="value">${s.gender || "-"}</div></div>
              <div class="field"><div class="label">Blood Group</div><div class="value">${s.blood_group || "-"}</div></div>
              <div class="field"><div class="label">Aadhar Number</div><div class="value">${s.aadhar_number || "-"}</div></div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Contact Details</div>
            <div class="grid">
              <div class="field"><div class="label">Student Mobile</div><div class="value">${s.mobile || "-"}</div></div>
              <div class="field"><div class="label">Guardian Mobile</div><div class="value">${s.guardian_mobile || "-"}</div></div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Academic Details</div>
            <div class="grid">
              <div class="field"><div class="label">Course</div><div class="value">${s.course_name}</div></div>
              <div class="field"><div class="label">Previous Qualification</div><div class="value">${s.previous_qualification || "-"}</div></div>
              <div class="field"><div class="label">Hostel Required</div><div class="value">${s.hostel_required ? "Yes" : "No"}</div></div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Address</div>
            <div class="grid">
              <div class="field full-width"><div class="label">Address</div><div class="value">${s.address || "-"}</div></div>
              <div class="field"><div class="label">District/State</div><div class="value">${s.district || "-"}, ${s.state || "-"}</div></div>
              <div class="field"><div class="label">Pincode</div><div class="value">${s.pincode || "-"}</div></div>
            </div>
          </div>

          <div class="sign-row">
            <div class="sign-box">
              <div class="sign-line">Student / Guardian Signature</div>
            </div>
            <div class="sign-box">
              <div class="seal-box">Official Seal</div>
              <div class="sign-line">Authorized Signatory</div>
            </div>
          </div>

          <div class="footer-note">This is a computer-generated admission slip.</div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    win.document.close();
  }
  async function handleSubmit() {
    if (!form.full_name.trim()) return alert("Student name required!");
    if (!form.course_id) return alert("Please select a course!");
    setLoading(true);

    const photoUrl = await uploadPhoto();

    const { data: student, error } = await supabase.from("students").insert({
      photo_url: photoUrl,
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
      stream: form.stream,
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

    if (selectedSubjects.length > 0) {
      await supabase.from("student_subjects").insert(
        selectedSubjects.map(subject_id => ({ student_id: student.id, subject_id }))
      );
    }

    const subjectNames = subjects.filter(s => selectedSubjects.includes(s.id)).map(s => s.name);
    setLastAdmitted({ ...form, course_name: courses.find(c => c.id === form.course_id)?.name || "", subject_names: subjectNames, photo_url: photoUrl });
    setSuccess(`✅ ${form.full_name} admitted successfully!`);
    setPhotoFile(null);
    setPhotoPreview(null);
    setSelectedSubjects([]);
    setForm({
      full_name: "", father_name: "", mother_name: "", dob: "", gender: "",
      blood_group: "", aadhar_number: "", email: "",
      mobile: "", guardian_mobile: "",
      previous_qualification: "", course_id: "", stream: "",
      address: "", district: "", state: "Odisha", pincode: "",
      hostel_required: true,
      admission_date: new Date().toISOString().split("T")[0]
    });
    setLoading(false);
    setTimeout(() => setSuccess(""), 4000);
  }

  return (
    <div>
      <h2 style={{ fontSize: "22px", fontWeight: "700", marginBottom: "24px" }}>New Admission</h2>

      {success && (
        <div style={{ background: "#f0fff4", color: "#27ae60", padding: "12px 16px", borderRadius: "8px", marginBottom: "20px", fontWeight: "500", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>{success}</span>
          {lastAdmitted && (
            <button onClick={() => printAdmissionSlip(lastAdmitted)}
              style={{ padding: "8px 16px", background: "#1a1a2e", color: "white", border: "none", borderRadius: "6px", fontSize: "13px", fontWeight: "600" }}>
              🖨 Print Admission Slip
            </button>
          )}
        </div>
      )}

      <div style={{ background: "white", borderRadius: "12px", padding: "28px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>

        <SectionTitle>👤 Personal Details</SectionTitle>

        <div style={{ display: "flex", gap: "20px", alignItems: "center", marginBottom: "20px" }}>
          <div style={{
            width: "90px", height: "90px", borderRadius: "10px", overflow: "hidden",
            background: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center",
            border: "1px solid #ddd", flexShrink: 0
          }}>
            {photoPreview ? (
              <img src={photoPreview} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <span style={{ fontSize: "11px", color: "#aaa" }}>No Photo</span>
            )}
          </div>
          <div>
            <label style={labelStyle}>Student Photo</label>
            <input type="file" accept="image/*" onChange={handlePhotoSelect}
              style={{ fontSize: "13px" }} />
            {uploading && <div style={{ fontSize: "12px", color: "#888", marginTop: "4px" }}>Uploading...</div>}
          </div>
        </div>

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
          <Field label="Stream">
            <select value={form.stream} onChange={e => { update("stream", e.target.value); setSelectedSubjects([]); }} style={inputStyle}>
              <option value="">-- Select Stream --</option>
              {STREAMS.map(st => <option key={st} value={st}>{st}</option>)}
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

        {form.course_id && form.stream && (
          <div style={{ marginTop: "18px" }}>
            <label style={labelStyle}>Subjects</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", padding: "14px", background: "#f8f9fa", borderRadius: "8px" }}>
              {subjects.filter(s => s.course_id === form.course_id && s.stream === form.stream).length === 0 && (
                <span style={{ fontSize: "13px", color: "#999" }}>this Course/Stream. Please add them first from the Courses tab.</span>
              )}
              {subjects.filter(s => s.course_id === form.course_id && s.stream === form.stream).map(s => (
                <label key={s.id} style={{
                  display: "flex", alignItems: "center", gap: "6px", padding: "6px 12px",
                  background: selectedSubjects.includes(s.id) ? "#1a1a2e" : "white",
                  color: selectedSubjects.includes(s.id) ? "white" : "#333",
                  border: "1px solid #ddd", borderRadius: "20px", fontSize: "13px", cursor: "pointer"
                }}>
                  <input type="checkbox" checked={selectedSubjects.includes(s.id)} onChange={() => toggleSubject(s.id)}
                    style={{ display: "none" }} />
                  {s.name}
                </label>
              ))}
            </div>
          </div>
        )}

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
