import React, { useState, useEffect } from "react";

export default function GroupInfoModal({ open, onClose, chat }) {
  const [members, setMembers] = useState(chat.members || []);
  const [admins, setAdmins] = useState(chat.admins || []);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const token = localStorage.getItem("usschats_token");

  useEffect(() => {
    if (open) {
      setLoading(true);
      fetch("http://localhost:5000/api/users/all", {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => { setUsers(data); setLoading(false); })
        .catch(() => { setUsers([]); setLoading(false); });
    }
  }, [open, token]);

  const handleAddMember = async (userId) => {
    setLoading(true);
    try {
      await fetch(`http://localhost:5000/api/chats/group/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ chatId: chat._id, userId })
      });
      setMembers(prev => [...prev, users.find(u => u._id === userId)]);
      setError("");
    } catch {
      setError("Failed to add member");
    }
    setLoading(false);
  };

  const handleRemoveMember = async (userId) => {
    setLoading(true);
    try {
      await fetch(`http://localhost:5000/api/chats/group/remove`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ chatId: chat._id, userId })
      });
      setMembers(prev => prev.filter(m => m._id !== userId));
      setAdmins(prev => prev.filter(id => id !== userId));
      setError("");
    } catch {
      setError("Failed to remove member");
    }
    setLoading(false);
  };

  const handlePromoteAdmin = async (userId) => {
    setLoading(true);
    try {
      await fetch(`http://localhost:5000/api/chats/group/promote`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ chatId: chat._id, userId })
      });
      setAdmins(prev => [...prev, userId]);
      setError("");
    } catch {
      setError("Failed to promote admin");
    }
    setLoading(false);
  };

  const handleDemoteAdmin = async (userId) => {
    setLoading(true);
    try {
      await fetch(`http://localhost:5000/api/chats/group/demote`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ chatId: chat._id, userId })
      });
      setAdmins(prev => prev.filter(id => id !== userId));
      setError("");
    } catch {
      setError("Failed to demote admin");
    }
    setLoading(false);
  };

  if (!open) return null;

  return (
    <div className="modal" aria-label="Group info modal">
      <h2>Group Info</h2>
      <div><strong>Name:</strong> {chat.name}</div>
      {error && <div style={{ color: "#d32f2f", fontSize: 13, marginTop: 6 }}>{error}</div>}
      <div className="user-list">
        <h4>Members</h4>
        {members.map(member => (
          <div key={member._id} className="user-item">
            <span className="avatar">{member.name[0]}</span>
            <span className="name">{member.name}</span>
            {admins.includes(member._id) ? (
              <span className="admin-badge">Admin</span>
            ) : (
              <button className="add-member-btn" onClick={() => handlePromoteAdmin(member._id)} disabled={loading}>Promote</button>
            )}
            {admins.includes(member._id) && (
              <button className="remove-member-btn" onClick={() => handleDemoteAdmin(member._id)} disabled={loading}>Demote</button>
            )}
            <button className="remove-member-btn" onClick={() => handleRemoveMember(member._id)} disabled={loading}>Remove</button>
          </div>
        ))}
      </div>
      <div className="user-list">
        <h4>Add Members</h4>
        {users.filter(u => !members.some(m => m._id === u._id)).map(user => (
          <div key={user._id} className="user-item">
            <span className="avatar">{user.name[0]}</span>
            <span className="name">{user.name}</span>
            <button className="add-member-btn" onClick={() => handleAddMember(user._id)} disabled={loading}>Add</button>
          </div>
        ))}
      </div>
      <button type="button" onClick={onClose} style={{marginTop:12}}>Close</button>
    </div>
  );
}
