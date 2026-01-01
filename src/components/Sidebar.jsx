// Import necessary components and hooks
import React, { useState, useEffect } from "react";
import ChatList from "./ChatList";
import ContactsList from "./ContactsList";
import CreateChatModal from "./CreateChatModal";
import UserSearch from "./UserSearch";
import InvitationModal from "./InvitationModal";
import useAuth from "../hooks/useAuth";
import { useContext } from "react";
import { SettingsContext } from "../context/SettingsContext";

// Sidebar component for navigation and chat/contact lists
export default function Sidebar({ chats, onSelectChat, activeChat, onChatCreated }) {
  const { user } = useAuth();
  const { chatModes, setChatModes } = useContext(SettingsContext);
  // State for active tab (chats, contacts, starred)
  const [tab, setTab] = useState("chats");
  // Theme state (light/dark)
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  // API URL for backend (configurable)
  const [apiUrl, setApiUrl] = useState(
    localStorage.getItem("usschats_api_url") || "https://api.example.com"
  );
  // Modal state for creating new chats
  const [showCreateChat, setShowCreateChat] = useState(false);
  // Modal state for invitation
  const [showInvitation, setShowInvitation] = useState(false);
  // Filter chats that have starred messages
  const starredChats = chats.filter((c) => c.messages?.some((m) => m.starred));
  // Scheduled messages state
  const [scheduledMessages, setScheduledMessages] = useState([]);

  // Load scheduled messages
  const loadScheduledMessages = async () => {
    try {
      const token = localStorage.getItem("usschats_token");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/messages/scheduled`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setScheduledMessages(data);
      }
    } catch (error) {
      console.error("Failed to load scheduled messages:", error);
    }
  };

  // Load scheduled messages when scheduled tab is selected
  useEffect(() => {
    if (tab === "scheduled") {
      loadScheduledMessages();
    }
  }, [tab]);

  // Apply theme to document body
  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Save API URL to localStorage
  useEffect(() => {
    localStorage.setItem("usschats_api_url", apiUrl);
  }, [apiUrl]);

  return (
    <div className="sidebar" style={{ background: "#075e54", color: "#fff", height: "100vh", overflowY: "auto" }}>
      {/* Brand header */}
      <div className="brand" style={{ color: "#fff", fontWeight: "bold", padding: "16px", fontSize: "18px", display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
        <button
          onClick={() => setShowInvitation(true)}
          style={{
            background: "#25d366",
            color: "#fff",
            border: "none",
            borderRadius: "50%",
            width: "32px",
            height: "32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            fontSize: "16px"
          }}
          title="Invite Friends"
        >
          +
        </button>
      </div>
      
      {/* Tab navigation */}
      <div
        className="sidebar-tabs"
        style={{
          display: "flex",
          gap: 8,
          padding: "12px 16px",
          background: "#128c7e",
          borderBottom: "1px solid #075e54",
        }}
      >
        <button
          className={tab === "chats" ? "active" : ""}
          onClick={() => setTab("chats")}
          style={{ color: "#fff", background: tab === "chats" ? "#25d366" : "transparent", border: "none", padding: "8px 12px", borderRadius: 4 }}
        >
          Chats
        </button>
        <button
          className={tab === "contacts" ? "active" : ""}
          onClick={() => setTab("contacts")}
          style={{ color: "#fff", background: tab === "contacts" ? "#25d366" : "transparent", border: "none", padding: "8px 12px", borderRadius: 4 }}
        >
          Contacts
        </button>
        <button
          className={tab === "starred" ? "active" : ""}
          onClick={() => setTab("starred")}
          style={{ color: "#fff", background: tab === "starred" ? "#25d366" : "transparent", border: "none", padding: "8px 12px", borderRadius: 4 }}
        >
          Starred
        </button>
        <button
          className={tab === "scheduled" ? "active" : ""}
          onClick={() => setTab("scheduled")}
          style={{ color: "#fff", background: tab === "scheduled" ? "#25d366" : "transparent", border: "none", padding: "8px 12px", borderRadius: 4 }}
        >
          Scheduled ({scheduledMessages.length})
        </button>
        <button
          className={tab === "search" ? "active" : ""}
          onClick={() => setTab("search")}
          style={{ color: "#fff", background: tab === "search" ? "#25d366" : "transparent", border: "none", padding: "8px 12px", borderRadius: 4 }}
        >
          Search
        </button>
        {/* Focus mode toggle */}
        <button
          style={{ marginLeft: "auto", color: "#fff", background: "transparent", border: "none", fontSize: 18, marginRight: 8 }}
          onClick={() => setChatModes({ ...chatModes, focusMode: !chatModes.focusMode })}
          aria-label="Toggle focus mode"
        >
          {chatModes.focusMode ? "🔕" : "🔔"}
        </button>
        {/* Games mode toggle */}
        <button
          style={{ marginLeft: "auto", color: "#fff", background: "transparent", border: "none", fontSize: 18, marginRight: 8 }}
          onClick={() => setChatModes({ ...chatModes, gamesMode: !chatModes.gamesMode })}
          aria-label="Toggle games mode"
        >
          {chatModes.gamesMode ? "🎮" : "🎯"}
        </button>
        {/* Theme toggle */}
        <button
          style={{ marginLeft: "auto", color: "#fff", background: "transparent", border: "none", fontSize: 18 }}
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          aria-label="Toggle theme"
        >
          {theme === "light" ? "🌙" : "☀️"}
        </button>
      </div>
      
      {/* Content based on active tab */}
      {tab === "chats" ? (
        <ChatList
          chats={chats}
          activeChat={activeChat}
          onSelect={onSelectChat}
        />
      ) : tab === "contacts" ? (
        <ContactsList onSelectUser={(user) => setShowCreateChat(user)} />
      ) : tab === "search" ? (
        <UserSearch onSelectUser={(user) => setShowCreateChat(user)} />
      ) : tab === "scheduled" ? (
        <div style={{ padding: "16px" }}>
          <h3 style={{ margin: 0, marginBottom: 16, color: "#fff" }}>Scheduled Messages</h3>
          {scheduledMessages.length === 0 ? (
            <p style={{ color: "#ccc", fontStyle: "italic" }}>No scheduled messages</p>
          ) : (
            scheduledMessages.map(msg => (
              <div
                key={msg._id}
                style={{
                  background: "#128c7e",
                  padding: 12,
                  borderRadius: 8,
                  marginBottom: 8,
                  cursor: "pointer",
                  color: "#fff"
                }}
                onClick={() => onSelectChat(msg.chatId)}
              >
                <div style={{ fontWeight: "bold", marginBottom: 4 }}>
                  {msg.chatId?.chatName || "Unknown Chat"}
                </div>
                <div style={{ fontSize: 14, marginBottom: 4 }}>
                  {msg.content || "Media message"}
                </div>
                <div style={{ fontSize: 12, color: "#ccc" }}>
                  Scheduled: {new Date(msg.scheduledTime).toLocaleString()}
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      const newTime = prompt("Edit scheduled time (YYYY-MM-DDTHH:mm)", msg.scheduledTime.slice(0, 16));
                      if (newTime) {
                        const token = localStorage.getItem("usschats_token");
                        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/messages/scheduled/${msg._id}`, {
                          method: "PUT",
                          headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`
                          },
                          body: JSON.stringify({ scheduledTime: newTime })
                        });
                        if (res.ok) {
                          loadScheduledMessages();
                        } else {
                          alert("Failed to update scheduled time");
                        }
                      }
                    }}
                    style={{
                      background: "#0a84ff",
                      color: "#fff",
                      border: "none",
                      borderRadius: 4,
                      padding: "4px 8px",
                      fontSize: 12,
                      cursor: "pointer"
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm("Delete this scheduled message?")) {
                        const token = localStorage.getItem("usschats_token");
                        fetch(`${import.meta.env.VITE_API_URL}/api/messages/scheduled/${msg._id}`, {
                          method: "DELETE",
                          headers: { Authorization: `Bearer ${token}` }
                        }).then(() => {
                          setScheduledMessages(prev => prev.filter(m => m._id !== msg._id));
                        });
                      }
                    }}
                    style={{
                      background: "#d32f2f",
                      color: "#fff",
                      border: "none",
                      borderRadius: 4,
                      padding: "4px 8px",
                      fontSize: 12,
                      cursor: "pointer"
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <ChatList
          chats={starredChats}
          activeChat={activeChat}
          onSelect={onSelectChat}
        />
      )}
      
      {/* API environment selector */}
      <div style={{ marginTop: 8 }}>
        <label style={{ fontSize: 13, color: "#888" }}>
          API Environment:
        </label>
        <select
          value={apiUrl}
          onChange={(e) => setApiUrl(e.target.value)}
          style={{ marginLeft: 8 }}
        >
          <option value="http://localhost:5000">Local</option>
          <option value="https://api.staging.example.com">Staging</option>
          <option value="https://api.example.com">Production</option>
        </select>
      </div>
      
      {/* Create chat modal */}
      {showCreateChat && (
        <CreateChatModal
          onClose={() => { setShowCreateChat(false); onChatCreated(); }}
          selectedUser={showCreateChat}
          currentUserId={user?.id || user?._id}
        />
      )}

      {/* Invitation modal */}
      <InvitationModal
        isOpen={showInvitation}
        onClose={() => setShowInvitation(false)}
        currentUser={user}
      />
    </div>
  );
}
