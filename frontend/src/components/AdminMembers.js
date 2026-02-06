import { useState, useEffect } from "react";
import "./admin.css";

export default function Members() {
  const [logActionFilter, setLogActionFilter] = useState("ALL");
  const [logMemberFilter, setLogMemberFilter] = useState("")
  const [search, setSearch] = useState("");
  const [auditLogs, setAuditLogs] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/admin/members', {
        headers: {
          'Authorization': 'Bearer admin-token'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch members');
      const data = await response.json();
      setMembers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

 const filteredAuditLogs = auditLogs.filter(log => {
  const actionMatch =
    logActionFilter === "ALL" || log.action === logActionFilter;

  const memberMatch =
    log.member.toLowerCase().includes(logMemberFilter.toLowerCase());

  return actionMatch && memberMatch;
});

  const filteredMembers = members.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.mobile.includes(search) ||
    (m.email && m.email.toLowerCase().includes(search.toLowerCase()))
  );

  const [showAdd, setShowAdd] = useState(false);
  const [newMember, setNewMember] = useState({ name: "", mobile: "" });

  const addMember = async () => {
    if (!newMember.name.trim() || !newMember.mobile.trim()) return;

    try {
      const response = await fetch('http://localhost:5000/api/admin/members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer admin-token'
        },
        body: JSON.stringify({
          name: newMember.name,
          mobile: newMember.mobile
        })
      });

      if (!response.ok) throw new Error('Failed to create member');

      const newMemberData = await response.json();
      setMembers([newMemberData, ...members]);
      logAction("CREATED", newMemberData.name);

      setNewMember({ name: "", mobile: "" });
      setShowAdd(false);
    } catch (err) {
      alert('Error creating member: ' + err.message);
    }
  };

  /* ================= AUDIT LOG ================= */
  const logAction = (action, memberName) => {
    setAuditLogs(prev => [
      {
        id: Date.now(),
        admin: "ADMIN",
        action,
        member: memberName,
        time: new Date().toLocaleString(),
      },
      ...prev,
    ]);
  };

  /* ================= ACTIONS ================= */
  const approveMember = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/members/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer admin-token'
        },
        body: JSON.stringify({ action: 'approve' })
      });

      if (!response.ok) throw new Error('Failed to approve member');

      const updatedMember = await response.json();
      setMembers(members.map(m => m.id === id ? updatedMember : m));
      logAction("APPROVED", updatedMember.name);
    } catch (err) {
      alert('Error approving member: ' + err.message);
    }
  };

  const rejectMember = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/members/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer admin-token'
        },
        body: JSON.stringify({ action: 'reject' })
      });

      if (!response.ok) throw new Error('Failed to reject member');

      const updatedMember = await response.json();
      setMembers(members.map(m => m.id === id ? updatedMember : m));
      logAction("REJECTED", updatedMember.name);
    } catch (err) {
      alert('Error rejecting member: ' + err.message);
    }
  };

  const deactivateMember = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/members/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer admin-token'
        },
        body: JSON.stringify({ action: 'deactivate' })
      });

      if (!response.ok) throw new Error('Failed to deactivate member');

      const updatedMember = await response.json();
      setMembers(members.map(m => m.id === id ? updatedMember : m));
      logAction("DEACTIVATED", updatedMember.name);
    } catch (err) {
      alert('Error deactivating member: ' + err.message);
    }
  };

  const extendValidity = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/members/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer admin-token'
        },
        body: JSON.stringify({ action: 'extend' })
      });

      if (!response.ok) throw new Error('Failed to extend member validity');

      const updatedMember = await response.json();
      setMembers(members.map(m => m.id === id ? updatedMember : m));
      logAction("EXTENDED", updatedMember.name);
    } catch (err) {
      alert('Error extending member validity: ' + err.message);
    }
  };

  const removeMember = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/members/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer admin-token'
        }
      });

      if (!response.ok) throw new Error('Failed to remove member');

      const member = members.find(m => m.id === id);
      if (member) logAction("REMOVED", member.name);
      setMembers(members.filter(m => m.id !== id));
    } catch (err) {
      alert('Error removing member: ' + err.message);
    }
  };

  const deleteUser = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer admin-token'
        }
      });

      if (!response.ok) throw new Error('Failed to delete user');

      const member = members.find(m => m.id === id);
      if (member) logAction("DELETED_USER", member.name);
      setMembers(members.filter(m => m.id !== id));
    } catch (err) {
      alert('Error deleting user: ' + err.message);
    }
  };

  return (
    <>
      {/* Page Bar */}
      <div className="page-bar">
        <input
          className="search-input"
          placeholder="Search member…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <button className="btn primary" onClick={() => setShowAdd(true)}>
          + Add Member
        </button>
      </div>

      {/* Add Member Modal */}
      {showAdd && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>Add New Member</h3>

            <input
              placeholder="Member Name"
              value={newMember.name}
              onChange={(e) =>
                setNewMember({ ...newMember, name: e.target.value })
              }
            />

            <input
              placeholder="Mobile Number"
              value={newMember.mobile}
              onChange={(e) =>
                setNewMember({ ...newMember, mobile: e.target.value })
              }
            />

            <div className="modal-actions">
              <button className="btn primary" onClick={addMember}>
                Create (Pending)
              </button>
              <button className="btn" onClick={() => setShowAdd(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="stats-row">
        <Stat label="Total Members" value={members.length} />
        <Stat label="Active Members" value={members.filter(m => m.status === "Active").length} />
        <Stat label="Inactive Members" value={members.filter(m => m.status === "Inactive").length} />
      </div>

      {/* Table */}
      <div className="card">
        {loading && <p>Loading members...</p>}
        {error && <p style={{ color: 'red' }}>Error: {error}</p>}
        {!loading && !error && (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Mobile</th>
                <th>Email</th>
                <th>Status</th>
                <th>Valid Till</th>
                <th>Profile</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>
                    No members found
                  </td>
                </tr>
              ) : (
                filteredMembers.map(m => (
                  <tr key={m.id}>
                    <td>{m.name}</td>
                    <td>{m.mobile}</td>
                    <td>{m.email || "-"}</td>
                    <td>
                      <span className={`badge ${m.status.toLowerCase()}`}>
                        {m.status}
                      </span>
                    </td>
                    <td>{m.validTill ? new Date(m.validTill).toLocaleDateString() : "-"}</td>
                    <td>
                      <span className={`badge ${m.profileComplete ? 'complete' : 'incomplete'}`}>
                        {m.profileComplete ? 'Complete' : 'Incomplete'}
                      </span>
                    </td>

                    <td className="actions">
                      <button className="btn danger" onClick={() => deleteUser(m.id)} style={{ marginRight: '8px' }}>Delete User</button>

                      {m.status === "NO_MEMBERSHIP" && (
                        <span className="badge no-membership">No Membership</span>
                      )}

                      {m.status === "PENDING" && (
                        <>
                          <button className="btn primary" onClick={() => approveMember(m.id)}>Approve</button>
                          <button className="btn danger" onClick={() => rejectMember(m.id)}>Reject</button>
                        </>
                      )}

                      {m.status === "ACTIVE" && (
                        <>
                          <button className="btn warning" onClick={() => deactivateMember(m.id)}>Deactivate</button>
                          <button className="btn primary" onClick={() => extendValidity(m.id)}>Extend</button>
                          <button className="btn danger" onClick={() => removeMember(m.id)}>Remove</button>
                        </>
                      )}

                      {m.status === "INACTIVE" && (
                        <>
                          <button className="btn primary" onClick={() => {
                            const action = async (id) => {
                              try {
                                const response = await fetch(`http://localhost:5000/api/admin/members/${id}/status`, {
                                  method: 'PUT',
                                  headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer admin-token'
                                  },
                                  body: JSON.stringify({ action: 'reactivate' })
                                });

                                if (!response.ok) throw new Error('Failed to reactivate member');

                                const updatedMember = await response.json();
                                setMembers(members.map(m => m.id === id ? updatedMember : m));
                                logAction("REACTIVATED", updatedMember.name);
                              } catch (err) {
                                alert('Error reactivating member: ' + err.message);
                              }
                            };
                            action(m.id);
                          }}>Reactivate</button>
                          <button className="btn danger" onClick={() => removeMember(m.id)}>Remove</button>
                        </>
                      )}

                      {m.status === "REJECTED" && (
                        <>
                          <button className="btn primary" onClick={() => approveMember(m.id)}>Re-Approve</button>
                          <button className="btn danger" onClick={() => removeMember(m.id)}>Remove</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
      {/* ================= AUDIT LOG TABLE ================= */}
<div className="card" style={{ marginTop: 30 }}>
  <h3 style={{ marginBottom: 16, color: "#0F3B5F" }}>
    Admin Audit Log
  </h3>
<div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
  <select
    value={logActionFilter}
    onChange={(e) => setLogActionFilter(e.target.value)}
    style={{ padding: "8px", borderRadius: 6 }}
  >
    <option value="ALL">All Actions</option>
    <option value="CREATED">Created</option>
    <option value="APPROVED">Approved</option>
    <option value="REJECTED">Rejected</option>
    <option value="DEACTIVATED">Deactivated</option>
    <option value="EXTENDED">Extended</option>
    <option value="REMOVED">Removed</option>
    <option value="DELETED_USER">Deleted User</option>
  </select>

  <input
    placeholder="Filter by member name"
    value={logMemberFilter}
    onChange={(e) => setLogMemberFilter(e.target.value)}
    style={{
      padding: "8px",
      borderRadius: 6,
      border: "1px solid #ccc",
    }}
  />
</div>

 {filteredAuditLogs.length === 0 ? (
    <p style={{ color: "#777" }}>No audit actions recorded.</p>
  ) : (
    <table className="admin-table">
      <thead>
        <tr>
          <th>Admin</th>
          <th>Action</th>
          <th>Member</th>
          <th>Date & Time</th>
        </tr>
      </thead>
      <tbody>
        {filteredAuditLogs.map(log => (
          <tr key={log.id}>
            <td>{log.admin}</td>
            <td>
              <span className={`badge log-${log.action.toLowerCase()}`}>
                {log.action}
              </span>
            </td>
            <td>{log.member}</td>
            <td>{log.time}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )}
</div>

    </>
  );
}

/* ================= STAT CARD ================= */
function Stat({ label, value }) {
  return (
    <div className="stat-card">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
    
  );
}