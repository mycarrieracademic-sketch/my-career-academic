"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

export default function HostelTab() {
  const [rooms, setRooms] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("rooms");
  const [showRoomForm, setShowRoomForm] = useState(false);
  const [showAllocForm, setShowAllocForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [roomForm, setRoomForm] = useState({ room_number: "", capacity: 4, room_type: "standard", monthly_rent: "" });
  const [allocForm, setAllocForm] = useState({ student_id: "", room_id: "", check_in_date: new Date().toISOString().split("T")[0] });

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    const [r, a, s] = await Promise.all([
      supabase.from("hostel_rooms").select("*").order("room_number"),
      supabase.from("hostel_allocations").select("*, students(full_name, courses(name)), hostel_rooms(room_number, monthly_rent)").eq("is_current", true),
      supabase.from("students").select("*").eq("status", "active").order("full_name")
    ]);
    setRooms(r.data || []);
    setAllocations(a.data || []);
    setStudents(s.data || []);
    setLoading(false);
  }

  async function handleSaveRoom() {
    if (!roomForm.room_number.trim()) return alert("Room number required!");
    setSaving(true);
    await supabase.from("hostel_rooms").insert({
      room_number: roomForm.room_number.trim(),
      capacity: parseInt(roomForm.capacity) || 4,
      room_type: roomForm.room_type,
      monthly_rent: parseFloat(roomForm.monthly_rent) || 0
    });
    setShowRoomForm(false);
    setRoomForm({ room_number: "", capacity: 4, room_type: "standard", monthly_rent: "" });
    setSaving(false);
    fetchAll();
  }

  async function handleSaveAlloc() {
    if (!allocForm.student_id) return alert("Select student!");
    if (!allocForm.room_id) return alert("Select room!");
    setSaving(true);
    await supabase.from("hostel_allocations").insert({
      student_id: allocForm.student_id,
      room_id: allocForm.room_id,
      check_in_date: allocForm.check_in_date,
      is_current: true
    });
    setShowAllocForm(false);
    setAllocForm({ student_id: "", room_id: "", check_in_date: new Date().toISOString().split("T")[0] });
    setSaving(false);
    fetchAll();
  }

  async function handleCheckout(id) {
    if (!confirm("Checkout this student?")) return;
    await supabase.from("hostel_allocations").update({ is_current: false, check_out_date: new Date().toISOString().split("T")[0] }).eq("id", id);
    fetchAll();
  }

  async function handleDeleteRoom(id) {
    if (!confirm("Delete this room?")) return;
    await supabase.from("hostel_rooms").delete().eq("id", id);
    fetchAll();
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2 style={{ fontSize: "22px", fontWeight: "700" }}>Hostel</h2>
        <div style={{ display: "flex", gap: "8px" }}>
          {activeSection === "rooms" && (
            <button onClick={() => setShowRoomForm(true)}
              style={{ padding: "10px 20px", background: "#1a1a2e", color: "white", border: "none", borderRadius: "6px", fontWeight: "600" }}>
              + Add Room
            </button>
          )}
          {activeSection === "allocations" && (
            <button onClick={() => setShowAllocForm(true)}
              style={{ padding: "10px 20px", background: "#1a1a2e", color: "white", border: "none", borderRadius: "6px", fontWeight: "600" }}>
              + Allocate Room
            </button>
          )}
        </div>
      </div>

      {/* Section Tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
        {[["rooms", "Rooms"], ["allocations", "Allocations"]].map(([key, label]) => (
          <button key={key} onClick={() => setActiveSection(key)}
            style={{ padding: "8px 16px", border: "none", borderRadius: "6px", fontSize: "14px", fontWeight: "500", background: activeSection === key ? "#1a1a2e" : "#f0f0f0", color: activeSection === key ? "white" : "#333" }}>
            {label}
          </button>
        ))}
      </div>

      {/* ROOMS */}
      {activeSection === "rooms" && (
        <div>
          {showRoomForm && (
            <div style={{ background: "white", borderRadius: "12px", padding: "24px", marginBottom: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
              <h3 style={{ marginBottom: "16px", fontWeight: "600" }}>New Room</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>Room Number *</label>
                  <input value={roomForm.room_number} onChange={e => setRoomForm({ ...roomForm, room_number: e.target.value })}
                    placeholder="e.g. 101"
                    style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "6px" }} />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>Capacity</label>
                  <input type="number" value={roomForm.capacity} onChange={e => setRoomForm({ ...roomForm, capacity: e.target.value })}
                    style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "6px" }} />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>Room Type</label>
                  <select value={roomForm.room_type} onChange={e => setRoomForm({ ...roomForm, room_type: e.target.value })}
                    style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "6px" }}>
                    <option value="standard">Standard</option>
                    <option value="deluxe">Deluxe</option>
                    <option value="ac">AC</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>Monthly Rent (₹) (Reference only)</label>
                  <input type="number" value={roomForm.monthly_rent} onChange={e => setRoomForm({ ...roomForm, monthly_rent: e.target.value })}
                    style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "6px" }} />
                </div>
              </div>
              <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
                <button onClick={handleSaveRoom} disabled={saving}
                  style={{ padding: "10px 24px", background: "#1a1a2e", color: "white", border: "none", borderRadius: "6px", fontWeight: "600" }}>
                  {saving ? "Saving..." : "Save"}
                </button>
                <button onClick={() => setShowRoomForm(false)}
                  style={{ padding: "10px 24px", background: "#f0f0f0", border: "none", borderRadius: "6px" }}>
                  Cancel
                </button>
              </div>
            </div>
          )}
          {loading ? <div>Loading...</div> : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "16px" }}>
              {rooms.length === 0 && <div style={{ color: "#666" }}>No rooms yet.</div>}
              {rooms.map(room => {
                const occupied = allocations.filter(a => a.room_id === room.id).length;
                return (
                  <div key={room.id} style={{ background: "white", borderRadius: "12px", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
                    <div style={{ fontSize: "20px", fontWeight: "700", marginBottom: "8px" }}>Room {room.room_number}</div>
                    <div style={{ fontSize: "14px", color: "#555", marginBottom: "4px" }}>Type: {room.room_type}</div>
                    <div style={{ fontSize: "14px", color: "#555", marginBottom: "12px" }}>Capacity: {occupied}/{room.capacity}</div>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <span style={{ padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "600", background: occupied >= room.capacity ? "#ffeaea" : "#e8f8f0", color: occupied >= room.capacity ? "#e74c3c" : "#27ae60" }}>
                        {occupied >= room.capacity ? "Full" : "Available"}
                      </span>
                      <button onClick={() => handleDeleteRoom(room.id)}
                        style={{ padding: "4px 10px", background: "#fff0f0", color: "#c00", border: "1px solid #ffc0c0", borderRadius: "6px", fontSize: "12px" }}>
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ALLOCATIONS */}
      {activeSection === "allocations" && (
        <div>
          {showAllocForm && (
            <div style={{ background: "white", borderRadius: "12px", padding: "24px", marginBottom: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
              <h3 style={{ marginBottom: "16px", fontWeight: "600" }}>Allocate Room</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>Student *</label>
                  <select value={allocForm.student_id} onChange={e => setAllocForm({ ...allocForm, student_id: e.target.value })}
                    style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "6px" }}>
                    <option value="">-- Select Student --</option>
                    {students.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>Room *</label>
                  <select value={allocForm.room_id} onChange={e => setAllocForm({ ...allocForm, room_id: e.target.value })}
                    style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "6px" }}>
                    <option value="">-- Select Room --</option>
                    {rooms.map(r => <option key={r.id} value={r.id}>Room {r.room_number}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>Check-in Date</label>
                  <input type="date" value={allocForm.check_in_date} onChange={e => setAllocForm({ ...allocForm, check_in_date: e.target.value })}
                    style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "6px" }} />
                </div>
              </div>
              <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
                <button onClick={handleSaveAlloc} disabled={saving}
                  style={{ padding: "10px 24px", background: "#1a1a2e", color: "white", border: "none", borderRadius: "6px", fontWeight: "600" }}>
                  {saving ? "Saving..." : "Allocate"}
                </button>
                <button onClick={() => setShowAllocForm(false)}
                  style={{ padding: "10px 24px", background: "#f0f0f0", border: "none", borderRadius: "6px" }}>
                  Cancel
                </button>
              </div>
            </div>
          )}
          <div style={{ background: "white", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", overflow: "hidden" }}>
            {allocations.length === 0 ? (
              <div style={{ padding: "32px", textAlign: "center", color: "#666" }}>No current allocations.</div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f8f9fa" }}>
                    {["#", "Student", "Room", "Check-in", ""].map(h => (
                      <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "#444" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allocations.map((a, i) => (
                    <tr key={a.id} style={{ borderTop: "1px solid #f0f0f0" }}>
                      <td style={{ padding: "12px 16px", fontSize: "14px", color: "#888" }}>{i + 1}</td>
                      <td style={{ padding: "12px 16px", fontSize: "14px", fontWeight: "500" }}>{a.students?.full_name}</td>
                      <td style={{ padding: "12px 16px", fontSize: "14px" }}>Room {a.hostel_rooms?.room_number}</td>
                      <td style={{ padding: "12px 16px", fontSize: "14px", color: "#555" }}>{a.check_in_date}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <button onClick={() => handleCheckout(a.id)}
                          style={{ padding: "5px 12px", background: "#fff0f0", color: "#c00", border: "1px solid #ffc0c0", borderRadius: "6px", fontSize: "12px" }}>
                          Checkout
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
    </div>
  );
}
