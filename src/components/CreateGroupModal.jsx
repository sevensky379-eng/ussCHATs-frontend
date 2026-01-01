import React, { useState, useEffect } from "react";

export default function CreateGroupModal({ open, onClose, onCreate }) {
  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const token = localStorage.getItem("usschats_token");

  useEffect(() => {
    if (open) {
      fetch("http://localhost:5000/api/users/all", {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(setUsers)
        .catch(() => setUsers([]));
    }
  }, [open, token]);

  const handleUserToggle = (userId) => {
    setSelectedUsers(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (groupName && selectedUsers.length) {
      onCreate({ groupName, members: selectedUsers });
      setGroupName("");
      setSelectedUsers([]);
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div className="modal">
      <h2>Create Group</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Group Name"
          value={groupName}
          onChange={e => setGroupName(e.target.value)}
          required
        />
        <div className="user-list">
          {users.map(user => (
            <label key={user._id} className="user-item">
              <input
                type="checkbox"
                checked={selectedUsers.includes(user._id)}
                onChange={() => handleUserToggle(user._id)}
              />
              <span className="avatar">{user.name[0]}</span>
              <span className="name">{user.name}</span>
            </label>
          ))}
        </div>
        <button type="submit">Create Group</button>
        <button type="button" onClick={onClose} style={{marginLeft:8}}>Cancel</button>
      </form>
    </div>
  );
}
