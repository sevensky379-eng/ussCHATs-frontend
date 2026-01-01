import React, { useState, useContext } from "react";
import GroupInfoModal from "./GroupInfoModal";
import { SettingsContext } from "../context/SettingsContext";

export default function ChatHeader({ chat, onToggleSidebar, sidebarHidden }) {
  const [showInfo, setShowInfo] = useState(false);
  const { chatModes } = useContext(SettingsContext);
  const isAdmin = chat.admins && chat.admins.includes(chat.currentUserId);

  return (
    <div className="chat-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 16px", background: "#075e54", color: "#fff" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <button
          onClick={onToggleSidebar}
          style={{
            background: "transparent",
            border: "none",
            color: "#fff",
            fontSize: "18px",
            cursor: "pointer",
            padding: "4px",
            borderRadius: "4px"
          }}
          title={`${sidebarHidden ? "Show" : "Hide"} sidebar (Ctrl+B)`}
        >
          {sidebarHidden ? "☰" : "✕"}
        </button>
        <div className="chat-title" style={{ fontWeight: "bold", fontSize: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
          {chat.name || chat.title || "Chat"}
          {/* Mode indicators */}
          {chatModes.focusMode && (
            <span title="Focus Mode: Distractions hidden" style={{ fontSize: "12px", background: "#0a84ff", color: "white", padding: "2px 6px", borderRadius: "10px" }}>
              🎯 Focus
            </span>
          )}
          {chatModes.studyMode && (
            <span title="Study Mode: Notes & Pomodoro active" style={{ fontSize: "12px", background: "#4caf50", color: "white", padding: "2px 6px", borderRadius: "10px" }}>
              📚 Study
            </span>
          )}
          {chatModes.workMode && (
            <span title="Work Mode: Tasks & Pomodoro active" style={{ fontSize: "12px", background: "#ff9800", color: "white", padding: "2px 6px", borderRadius: "10px" }}>
              💼 Work
            </span>
          )}
          {chatModes.gamesMode && (
            <span title="Games Mode: Play offline games" style={{ fontSize: "12px", background: "#9c27b0", color: "white", padding: "2px 6px", borderRadius: "10px" }}>
              🎮 Games
            </span>
          )}
        </div>
      </div>
      {chat.isGroup && chat.members && (
        <>
          <button className="group-info-btn" onClick={() => setShowInfo(true)}>
            Group Info
          </button>
          <div className="group-members">
            {chat.members.map((member) => (
              <span key={member._id} className="group-member">
                <span className="avatar">{member.name[0]}</span>
                <span className="name">{member.name}</span>
                {chat.admins && chat.admins.includes(member._id) && (
                  <span className="admin-badge">Admin</span>
                )}
                {isAdmin && member._id !== chat.currentUserId && (
                  <button
                    className="remove-member-btn"
                    title="Remove Member"
                    // onClick={() => handleRemoveMember(member._id)}
                  >
                    ✕
                  </button>
                )}
              </span>
            ))}
            {isAdmin && (
              <button className="add-member-btn" title="Add Member">
                + Add
              </button>
            )}
          </div>
          <GroupInfoModal
            open={showInfo}
            onClose={() => setShowInfo(false)}
            chat={chat}
          />
        </>
      )}
    </div>
  );
}
