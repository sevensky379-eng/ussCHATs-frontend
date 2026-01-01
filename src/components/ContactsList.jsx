import React, { useEffect, useState } from "react";
import io from "socket.io-client";

export default function ContactsList({ onSelectUser }) {
  const [users, setUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const token = localStorage.getItem("usschats_token");

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch("http://localhost:5000/api/users/all", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        console.error("Failed to fetch users", err);
      }
    }
    fetchUsers();
  }, [token]);

  useEffect(() => {
    const socket = io("http://localhost:5000", {
      auth: { token },
      transports: ["websocket"]
    });
    socket.on("user_online", (userId) => {
      setOnlineUsers(prev => [...new Set([...prev, userId])]);
    });
    socket.on("user_offline", (userId) => {
      setOnlineUsers(prev => prev.filter(id => id !== userId));
    });
    socket.on("online_users", (ids) => {
      setOnlineUsers(ids);
    });
    return () => { socket.disconnect(); };
  }, [token]);

  return (
    <div className="contacts-list" style={{ color: "#fff", padding: "16px" }}>
      <h3 style={{ marginBottom: 16, color: "#fff" }}>Contacts</h3>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {users.map(user => (
          <li key={user._id} className="contact-item" onClick={() => onSelectUser && onSelectUser(user)} style={{ display: "flex", alignItems: "center", padding: "8px 0", cursor: "pointer", borderBottom: "1px solid #128c7e" }}>
            <span className="avatar" style={{ width: 40, height: 40, borderRadius: "50%", background: "#25d366", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", marginRight: 12, fontWeight: "bold", overflow: "hidden" }}>
              {user.avatar ? <img src={`${import.meta.env.VITE_API_URL}/${user.avatar}`} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : user.name[0]}
            </span>
            <div style={{ flex: 1 }}>
              <span className="name" style={{ display: "block", color: "#fff", fontWeight: "bold" }}>{user.name}</span>
              {user.status && <div style={{ fontSize: 12, color: "#e0e0e0", marginBottom: 2 }}>{user.status}</div>}
              <div className="status" style={{ fontSize: 12, color: "#e0e0e0" }}>
                {onlineUsers.includes(user._id) ? (
                  <span style={{color:'#25d366'}}>● Online</span>
                ) : user.lastSeen ? (
                  <span>Last seen {new Date(user.lastSeen).toLocaleString()}</span>
                ) : (
                  <span>Offline</span>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
