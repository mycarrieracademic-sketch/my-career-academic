"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

export default function StudentsTab() {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCourse, setFilterCourse] = useState("");
  const [filterStatus, setFilterStatus] = useState("active");
  const [selected, setSelected] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    const [s, c] = await Promise.all([
      supabase.from("students").select("*, courses(name)").order("created_at", { ascending: false }),
      supabase.from("courses").select("*").order("name")
    ]);
    setStudents(s.data || []);
    setCourses(c.data || []);
    setLoading(false);
  }

  async function handleStatusChange(id, status) {
    if (!confirm(`Change student status to "${status}"?`)) return;
    await supabase.from("students").update({ status }).eq("id", id);
    fetchAll();
    setSelected(null);
  }

  function openEdit(s) {
    setEditForm({
      full_name: s.full_name || "", father_name: s.father_name || "", mother_name: s.mother_name || "",
      dob: s.dob || "", gender: s.gender || "", blood_group: s.blood_group || "",
      aadhar_number: s.aadhar_number || "", email: s.email || "",
      mobile: s.mobile || "", guardian_mobile: s.guardian_mobile || "",
      previous_qualification: s.previous_qualification || "", course_id: s.course_id || "",
      address: s.address || "", district: s.district || "", state: s.state || "Odisha", pincode: s.pincode || "",
      hostel_required: s.hostel_required !== false, admission_date: s.admission_date || ""
    });
    setPhotoFile(null);
    setPhotoPreview(s.photo_url || null);
    setEditMode(true);
  }

  function handlePhotoSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  async function uploadPhoto() {
    if (!photoFile) return null;
    const fileExt = photoFile.name.split(".").pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${fileExt}`;
    const { error } = await supabase.storage.from("student-photos").upload(fileName, photoFile);
    if (error) { alert("Photo upload failed: " + error.message); return null; }
    const { data } = supabase.storage.from("student-photos").getPublicUrl(fileName);
    return data.publicUrl;
  }

  function update(field, value) {
    setEditForm(prev => ({ ...prev, [field]: value }));
  }

  async function saveEdit() {
    if (!editForm.full_name.trim()) return alert("Name required!");
    if (!editForm.course_id) return alert("Course required!");
    setSaving(true);
    let photoUrl = selected.photo_url || null;
    if (photoFile) {
      const uploaded = await uploadPhoto();
      if (uploaded) photoUrl = uploaded;
    }
    const { error } = await supabase.from("students").update({
      photo_url: photoUrl,
      full_name: editForm.full_name.trim(), father_name: editForm.father_name.trim(),
      mother_name: editForm.mother_name.trim(), dob: editForm.dob || null,
      gender: editForm.gender, blood_group: editForm.blood_group,
      aadhar_number: editForm.aadhar_number.trim(), email: editForm.email.trim(),
      mobile: editForm.mobile.trim(), guardian_mobile: editForm.guardian_mobile.trim(),
      previous_qualification: editForm.previous_qualification.trim(), course_id: editForm.course_id,
      address: editForm.address.trim(), district: editForm.district.trim(),
      state: editForm.state.trim(), pincode: editForm.pincode.trim(),
      hostel_required: editForm.hostel_required, admission_date: editForm.admission_date
    }).eq("id", selected.id);
    setSaving(false);
    if (error) return alert("Error: " + error.message);
    setEditMode(false);
    const updated = { ...selected, ...editForm, courses: courses.find(c => c.id === editForm.course_id) };
    setSelected(updated);
    fetchAll();
  }

  function printAdmissionSlip(s) {
    const courseName = s.courses?.name || courses.find(c => c.id === s.course_id)?.name || "-";
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
              <div class="field"><div class="label">Course</div><div class="value">${courseName}</div></div>
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

  function closeModal() {
    setSelected(null);
    setEditMode(false);
    setEditForm(null);
  }

  const filtered = students.filter(s => {
    const matchSearch = s.full_name.toLowerCase().includes(search.toLowerCase()) ||
      (s.mobile && s.mobile.includes(search));
    const matchCourse = filterCourse ? s.course_id === filterCourse : true;
    const matchStatus = filterStatus ? s.status === filterStatus : true;
    return matchSearch && matchCourse && matchStatus;
  });

  const statusColor = { active: "#27ae60", dropped: "#e74c3c", passed: "#3498db" };
  const inputStyle = { width: "100%", padding: "8px 10px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "13px" };
  const labelStyle = { display: "block", marginBottom: "4px", fontSize: "12px", fontWeight: "500", color: "#555" };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2 style={{ fontSize: "22px", fontWeight: "700" }}>Students</h2>
        <div style={{ fontSize: "14px", color: "#666" }}>Total: {filtered.length}</div>
      </div>

      <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search name or mobile..."
          style={{ padding: "10px 12px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "14px", width: "220px" }}
        />
        <select value={filterCourse} onChange={e => setFilterCourse(e.target.value)}
          style={{ padding: "10px 12px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "14px" }}>
          <option value="">All Courses</option>
          {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          style={{ padding: "10px 12px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "14px" }}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="dropped">Dropped</option>
          <option value="passed">Passed</option>
        </select>
      </div>

      {loading ? <div>Loading...</div> : (
        <div style={{ background: "white", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", overflow: "hidden" }}>
          {filtered.length === 0 ? (
            <div style={{ padding: "32px", textAlign: "center", color: "#666" }}>No students found.</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8f9fa", borderBottom: "2px solid #eee" }}>
                  {["#", "Name", "Course", "Mobile", "Admission Date", "Status", "Action"].map(h => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "#444" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, i) => (
                  <tr key={s.id} style={{ borderBottom: "1px solid #f0f0f0" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#fafafa"}
                    onMouseLeave={e => e.currentTarget.style.background = "white"}>
                    <td style={{ padding: "12px 16px", fontSize: "14px", color: "#888" }}>{i + 1}</td>
                    <td style={{ padding: "12px 16px", fontSize: "14px", fontWeight: "500" }}>{s.full_name}</td>
                    <td style={{ padding: "12px 16px", fontSize: "14px", color: "#555" }}>{s.courses?.name || "-"}</td>
                    <td style={{ padding: "12px 16px", fontSize: "14px", color: "#555" }}>{s.mobile || "-"}</td>
                    <td style={{ padding: "12px 16px", fontSize: "14px", color: "#555" }}>{s.admission_date || "-"}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{
                        padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "600",
                        background: statusColor[s.status] + "20", color: statusColor[s.status]
                      }}>{s.status}</span>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <button onClick={() => setSelected(s)}
                        style={{ padding: "6px 14px", background: "#f0f4ff", color: "#1a1a2e", border: "1px solid #c0d0ff", borderRadius: "6px", fontSize: "13px" }}>
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {selected && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
          display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000, padding: "20px"
        }}>
          <div style={{ background: "white", borderRadius: "12px", padding: "32px", width: "640px", maxWidth: "95vw", maxHeight: "90vh", overflowY: "auto" }}>

            {!editMode ? (
              <>
                <h3 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "20px" }}>{selected.full_name}</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "14px" }}>
                  {[
                    ["Father's Name", selected.father_name],
                    ["Mother's Name", selected.mother_name],
                    ["Date of Birth", selected.dob],
                    ["Gender", selected.gender],
                    ["Blood Group", selected.blood_group],
                    ["Aadhar Number", selected.aadhar_number],
                    ["Email", selected.email],
                    ["Course", selected.courses?.name],
                    ["Student Mobile", selected.mobile],
                    ["Guardian Mobile", selected.guardian_mobile],
                    ["Previous Qualification", selected.previous_qualification],
                    ["Admission Date", selected.admission_date],
                    ["Hostel Required", selected.hostel_required ? "Yes" : "No"],
                    ["Address", selected.address],
                    ["District", selected.district],
                    ["State", selected.state],
                    ["Pincode", selected.pincode],
                    ["Status", selected.status],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <div style={{ color: "#888", fontSize: "12px", marginBottom: "2px" }}>{label}</div>
                      <div style={{ fontWeight: "500" }}>{value || "-"}</div>
                    </div>
                  ))}
                </div>

                <div style={{ display: "flex", gap: "10px", marginTop: "24px", flexWrap: "wrap" }}>
                  <button onClick={() => openEdit(selected)}
                    style={{ padding: "8px 16px", background: "#1a1a2e", color: "white", border: "none", borderRadius: "6px", fontSize: "13px", fontWeight: "600" }}>
                    ✎ Edit Details
                  </button>
                  <button onClick={() => printAdmissionSlip(selected)}
                    style={{ padding: "8px 16px", background: "#f0f7ff", color: "#1a5cc8", border: "1px solid #c0d8ff", borderRadius: "6px", fontSize: "13px", fontWeight: "600" }}>
                    🖨 Print Admission Slip
                  </button>
                  {selected.status !== "dropped" && (
                    <button onClick={() => handleStatusChange(selected.id, "dropped")}
                      style={{ padding: "8px 16px", background: "#fff0f0", color: "#c00", border: "1px solid #ffc0c0", borderRadius: "6px", fontSize: "13px" }}>
                      Drop Student
                    </button>
                  )}
                  {selected.status !== "active" && (
                    <button onClick={() => handleStatusChange(selected.id, "active")}
                      style={{ padding: "8px 16px", background: "#f0fff4", color: "#27ae60", border: "1px solid #b0f0c0", borderRadius: "6px", fontSize: "13px" }}>
                      Set Active
                    </button>
                  )}
                  {selected.status !== "passed" && (
                    <button onClick={() => handleStatusChange(selected.id, "passed")}
                      style={{ padding: "8px 16px", background: "#f0f4ff", color: "#3498db", border: "1px solid #c0d0ff", borderRadius: "6px", fontSize: "13px" }}>
                      Mark Passed
                    </button>
                  )}
                  <button onClick={closeModal}
                    style={{ padding: "8px 16px", background: "#f0f0f0", border: "none", borderRadius: "6px", fontSize: "13px", marginLeft: "auto" }}>
                    Close
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "20px" }}>Edit: {selected.full_name}</h3>

                <div style={{ display: "flex", gap: "16px", alignItems: "center", marginBottom: "18px" }}>
                  <div style={{
                    width: "80px", height: "80px", borderRadius: "10px", overflow: "hidden",
                    background: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center",
                    border: "1px solid #ddd", flexShrink: 0
                  }}>
                    {photoPreview ? (
                      <img src={photoPreview} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <span style={{ fontSize: "10px", color: "#aaa" }}>No Photo</span>
                    )}
                  </div>
                  <div>
                    <label style={labelStyle}>Student Photo</label>
                    <input type="file" accept="image/*" onChange={handlePhotoSelect} style={{ fontSize: "13px" }} />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <div><label style={labelStyle}>Full Name *</label>
                    <input value={editForm.full_name} onChange={e => update("full_name", e.target.value)} style={inputStyle} /></div>
                  <div><label style={labelStyle}>Father's Name</label>
                    <input value={editForm.father_name} onChange={e => update("father_name", e.target.value)} style={inputStyle} /></div>
                  <div><label style={labelStyle}>Mother's Name</label>
                    <input value={editForm.mother_name} onChange={e => update("mother_name", e.target.value)} style={inputStyle} /></div>
                  <div><label style={labelStyle}>Date of Birth</label>
                    <input type="date" value={editForm.dob} onChange={e => update("dob", e.target.value)} style={inputStyle} /></div>
                  <div><label style={labelStyle}>Gender</label>
                    <select value={editForm.gender} onChange={e => update("gender", e.target.value)} style={inputStyle}>
                      <option value="">-- Select --</option>
                      <option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option>
                    </select></div>
                  <div><label style={labelStyle}>Blood Group</label>
                    <select value={editForm.blood_group} onChange={e => update("blood_group", e.target.value)} style={inputStyle}>
                      <option value="">-- Select --</option>
                      {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                    </select></div>
                  <div><label style={labelStyle}>Aadhar Number</label>
                    <input value={editForm.aadhar_number} onChange={e => update("aadhar_number", e.target.value)} style={inputStyle} /></div>
                  <div><label style={labelStyle}>Email</label>
                    <input type="email" value={editForm.email} onChange={e => update("email", e.target.value)} style={inputStyle} /></div>
                  <div><label style={labelStyle}>Student Mobile</label>
                    <input value={editForm.mobile} onChange={e => update("mobile", e.target.value)} style={inputStyle} /></div>
                  <div><label style={labelStyle}>Guardian Mobile</label>
                    <input value={editForm.guardian_mobile} onChange={e => update("guardian_mobile", e.target.value)} style={inputStyle} /></div>
                  <div><label style={labelStyle}>Previous Qualification</label>
                    <input value={editForm.previous_qualification} onChange={e => update("previous_qualification", e.target.value)} style={inputStyle} /></div>
                  <div><label style={labelStyle}>Course *</label>
                    <select value={editForm.course_id} onChange={e => update("course_id", e.target.value)} style={inputStyle}>
                      <option value="">-- Select --</option>
                      {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select></div>
                  <div><label style={labelStyle}>Admission Date</label>
                    <input type="date" value={editForm.admission_date} onChange={e => update("admission_date", e.target.value)} style={inputStyle} /></div>
                  <div><label style={labelStyle}>Hostel Required?</label>
                    <select value={editForm.hostel_required ? "yes" : "no"} onChange={e => update("hostel_required", e.target.value === "yes")} style={inputStyle}>
                      <option value="yes">Yes</option><option value="no">No</option>
                    </select></div>
                  <div style={{ gridColumn: "1 / -1" }}><label style={labelStyle}>Address</label>
                    <input value={editForm.address} onChange={e => update("address", e.target.value)} style={inputStyle} /></div>
                  <div><label style={labelStyle}>District</label>
                    <input value={editForm.district} onChange={e => update("district", e.target.value)} style={inputStyle} /></div>
                  <div><label style={labelStyle}>State</label>
                    <input value={editForm.state} onChange={e => update("state", e.target.value)} style={inputStyle} /></div>
                  <div><label style={labelStyle}>Pincode</label>
                    <input value={editForm.pincode} onChange={e => update("pincode", e.target.value)} style={inputStyle} /></div>
                </div>

                <div style={{ display: "flex", gap: "10px", marginTop: "24px" }}>
                  <button onClick={saveEdit} disabled={saving}
                    style={{ padding: "10px 24px", background: saving ? "#999" : "#1a1a2e", color: "white", border: "none", borderRadius: "6px", fontWeight: "600", fontSize: "13px" }}>
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                  <button onClick={() => setEditMode(false)}
                    style={{ padding: "10px 24px", background: "#f0f0f0", border: "none", borderRadius: "6px", fontSize: "13px" }}>
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
