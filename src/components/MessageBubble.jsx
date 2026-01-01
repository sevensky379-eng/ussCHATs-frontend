// Import necessary components and utilities
import React, { useState, useRef } from "react";
import { format } from "date-fns";
import { FaPaperclip, FaStar, FaRegStar, FaReply, FaShare, FaTrash, FaThumbsUp, FaHeart, FaLaughSquint, FaSurprise, FaSadTear, FaAngry, FaGift, FaFire, FaHands } from "react-icons/fa";
import { FaBan, FaFlag } from "react-icons/fa";

// MessageBubble component for displaying individual chat messages
export default function MessageBubble({
  message,
  meId,
  onReply,
  onForward,
  onDelete,
  onStar,
  onEdit,
  onReact,
  compact = false
}) {
  // Check if message is sent by current user
  const mine = (message.sender?._id || message.sender) === meId;
  // Format timestamp
  const ts = message.createdAt ? format(new Date(message.createdAt), "HH:mm") : "";
  // Get media files array
  const mediaFiles = message.mediaUrl || [];
  // State for context menu
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
  // Ref for bubble element
  const bubbleRef = useRef(null);
  // Self-destruct countdown
  const [timeLeft, setTimeLeft] = useState(null);

  // Self-destruct countdown timer
  React.useEffect(() => {
    if (message.selfDestructAt) {
      const destructTime = new Date(message.selfDestructAt).getTime();
      const updateCountdown = () => {
        const now = Date.now();
        const remaining = Math.max(0, Math.ceil((destructTime - now) / 1000));
        setTimeLeft(remaining);
        if (remaining <= 0) {
          // Message should be deleted, but we'll let the socket handle it
          setTimeLeft(null);
        }
      };
      updateCountdown();
      const interval = setInterval(updateCountdown, 1000);
      return () => clearInterval(interval);
    }
  }, [message.selfDestructAt]);

  // Handle right-click context menu
  const handleContextMenu = (e) => {
    e.preventDefault();
    setMenuOpen(true);
    setMenuPos({ x: e.clientX, y: e.clientY });
    document.addEventListener("click", closeMenu);
  };
  
  // Close context menu
  const closeMenu = () => {
    setMenuOpen(false);
    document.removeEventListener("click", closeMenu);
  };

  // Handle blocking a user
  const handleBlockUser = async () => {
    if (!window.confirm(`Block ${message.sender?.name}? You won't receive messages from them.`)) return;
    try {
      const token = localStorage.getItem("usschats_token");
      await fetch(`${import.meta.env.VITE_API_URL}/api/users/block`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId: meId, targetId: message.sender._id || message.sender })
      });
      alert("User blocked successfully");
      closeMenu();
    } catch (err) {
      alert("Failed to block user: " + err.message);
    }
  };

  // Handle reporting a user
  const handleReportUser = async () => {
    const reason = prompt("Why are you reporting this user? (optional)");
    try {
      const token = localStorage.getItem("usschats_token");
      await fetch(`${import.meta.env.VITE_API_URL}/api/users/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId: meId, targetId: message.sender._id || message.sender, reason })
      });
      alert("User reported successfully");
      closeMenu();
    } catch (err) {
      alert("Failed to report user: " + err.message);
    }
  };

  // Generate reply preview if message is a reply
  const replyPreview = message.replyTo && (
    <div className="reply-preview" style={{ background: "#f3f3f3", borderRadius: 8, padding: "4px 10px", marginBottom: 4, fontSize: 13, color: "#555" }}>
      <span style={{ fontWeight: 600, color: "#0a84ff" }}>Reply:</span>
      <span style={{ marginLeft: 6 }}>{message.replyTo.content?.slice(0, 60) || "Media"}</span>
    </div>
  );

  // Determine message status (sent/delivered/read) for own messages
  let status = "";
  let statusColor = "";
  if (mine) {
    if (message.readBy && message.readBy.length > 0) {
      status = "✓✓"; // read
      statusColor = "#0a84ff"; // blue
    } else if (message.deliveredTo && message.deliveredTo.length > 0) {
      status = "✓✓"; // delivered
      statusColor = "#666"; // grey/white
    } else if (message._id) {
      status = "✓"; // sent
      statusColor = "#888"; // grey
    } else {
      status = ""; // pending
      statusColor = "#ccc";
    }
  }

  // Star/unstar state and handler
  const [starred, setStarred] = useState(message.starredBy?.includes(meId) || false);
  const handleStar = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/messages/star`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId: message._id, userId: meId })
      });
      if (res.ok) {
        setStarred(s => !s);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Copy message content
  const handleCopyMessage = async () => {
    if (message.content) {
      try {
        await navigator.clipboard.writeText(message.content);
        // Show temporary feedback
        const notification = document.createElement('div');
        notification.textContent = 'Message copied!';
        notification.style.cssText = `
          position: fixed;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          background: #4CAF50;
          color: white;
          padding: 8px 16px;
          border-radius: 4px;
          z-index: 10000;
          font-size: 14px;
        `;
        document.body.appendChild(notification);
        setTimeout(() => document.body.removeChild(notification), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
    closeMenu();
  };

  // Edit message
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content || '');
  
  const handleEditMessage = () => {
    setEditing(true);
    setEditContent(message.content || '');
    closeMenu();
  };

  const saveEdit = async () => {
    if (editContent.trim() && editContent !== message.content) {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/messages/${message._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: editContent.trim() })
        });
        if (res.ok) {
          const updated = await res.json();
          onEdit?.(updated);
          setEditing(false);
        }
      } catch (err) {
        console.error('Failed to edit message:', err);
      }
    } else {
      setEditing(false);
    }
  };

  const cancelEdit = () => {
    setEditing(false);
    setEditContent(message.content || '');
  };

  // Emoji reactions
  const [showReactions, setShowReactions] = useState(false);
  const reactionIcons = [
    { icon: <FaThumbsUp />, label: 'thumbs up' },
    { icon: <FaHeart />, label: 'heart' },
    { icon: <FaLaughSquint />, label: 'laugh' },
    { icon: <FaSurprise />, label: 'surprise' },
    { icon: <FaSadTear />, label: 'sad' },
    { icon: <FaAngry />, label: 'angry' },
    { icon: <FaGift />, label: 'party' },
    { icon: <FaFire />, label: 'fire' },
    { icon: <FaHands />, label: 'clap' },
    { icon: '100', label: '100' }
  ];

  const handleReact = async (reaction) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/messages/react`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId: message._id, userId: meId, emoji: reaction.label })
      });
      if (res.ok) {
        const updated = await res.json();
        onReact?.(updated);
      }
    } catch (err) {
      console.error('Failed to react:', err);
    }
    setShowReactions(false);
    closeMenu();
  };

  return (
    <div
      className={`message-bubble ${mine ? "sent" : "received"} ${compact ? "compact" : ""}`}
      ref={bubbleRef}
      onContextMenu={handleContextMenu}
      tabIndex={0}
      role="button"
      aria-label={`Message from ${message.sender?.name || 'Unknown'}: ${message.content || 'Media message'}. ${mine ? 'Sent' : 'Received'} at ${ts}${message.selfDestructAt ? `. Self-destructs in ${timeLeft} seconds` : ''}`}
      aria-expanded={menuOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setMenuOpen(!menuOpen);
        }
      }}
      style={{
        ...(menuOpen ? { boxShadow: "0 0 0 2px #0a84ff" } : {}),
        ...(compact ? {
          margin: "4px 0",
          maxWidth: "80%",
          fontSize: "14px"
        } : {})
      }}
    >
      {replyPreview}
      {mediaFiles.length > 0 && (
        <div className="media">
          {mediaFiles.map((file, idx) =>
            file.match(/\.(jpg|jpeg|png|gif)$/i) ? (
              <img
                key={idx}
                src={`${import.meta.env.VITE_API_URL}/${file.replace(/^\/?/, "")}`}
                alt="media"
                loading="lazy"
                style={{ maxWidth: 180, borderRadius: 8, marginRight: 8 }}
              />
            ) : (
              <a
                key={idx}
                href={`${import.meta.env.VITE_API_URL}/${file.replace(/^\/?/, "")}`}
                target="_blank"
                rel="noreferrer"
                style={{ display: "block", marginBottom: 4 }}
              >
                <FaPaperclip style={{ marginRight: 4 }} />
                {file.split("/").pop()}
              </a>
            )
          )}
        </div>
      )}
      {message.content && (
        editing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  saveEdit();
                } else if (e.key === 'Escape') {
                  cancelEdit();
                }
              }}
              style={{
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                resize: 'none',
                minHeight: '60px',
                fontSize: '14px',
                fontFamily: 'inherit'
              }}
              autoFocus
            />
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                onClick={cancelEdit}
                style={{
                  padding: '4px 12px',
                  background: '#f5f5f5',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                disabled={!editContent.trim() || editContent === message.content}
                style={{
                  padding: '4px 12px',
                  background: editContent.trim() && editContent !== message.content ? '#0a84ff' : '#ccc',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: editContent.trim() && editContent !== message.content ? 'pointer' : 'not-allowed',
                  fontSize: '12px'
                }}
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <div className="text">
            {message.content}
            {message.edited && (
              <span style={{ fontSize: '12px', color: '#666', marginLeft: '8px', fontStyle: 'italic' }}>
                (edited)
              </span>
            )}
          </div>
        )
      )}
      
      {/* Self-destruct countdown */}
      {timeLeft !== null && timeLeft > 0 && (
        <div style={{ 
          fontSize: '12px', 
          color: timeLeft <= 10 ? '#f44336' : '#ff9800', 
          fontWeight: 'bold',
          marginTop: '4px',
          textAlign: 'right'
        }}>
          ⏰ {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
        </div>
      )}
      
      {/* Message reactions */}
      {message.reactions && message.reactions.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
          {message.reactions.map((reaction, idx) => (
            <span
              key={idx}
              title={`Reacted by ${reaction.user?.name || 'Someone'}`}
              style={{
                background: '#f0f0f0',
                borderRadius: '12px',
                padding: '2px 6px',
                fontSize: '12px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '2px'
              }}
            >
              {reaction.emoji}
              <span style={{ fontSize: '10px', color: '#666' }}>
                {message.reactions.filter(r => r.emoji === reaction.emoji).length}
              </span>
            </span>
          ))}
        </div>
      )}
      <div className="meta">
        <span className="time">{ts}</span>
        {/* Encryption indicator */}
        {message.encrypted && (
          <span title="End-to-end encrypted" style={{ marginLeft: 4, fontSize: 12, color: "#4CAF50" }}>🔒</span>
        )}
        {/* Priority indicator */}
        {message.priority === 'high' && (
          <span title="High priority" style={{ marginLeft: 4, fontSize: 12, color: "#f44336" }}>⚡</span>
        )}
        {message.priority === 'low' && (
          <span title="Low priority" style={{ marginLeft: 4, fontSize: 12, color: "#2196F3" }}>↓</span>
        )}
        {mine && (
          <span
            className="read"
            title={
              status === "✓✓" && message.readBy?.length > 0 ? "Read" :
              status === "✓✓" && message.deliveredTo?.length > 0 ? "Delivered" :
              status === "✓" ? "Sent" : "Pending"
            }
            style={{ display: "inline-flex", alignItems: "center", marginLeft: 6 }}
          >
            {/* Enhanced status indicators with proper colors */}
            {status === "✓" && (
              <svg width="16" height="16" viewBox="0 0 16 16" style={{ color: statusColor }}>
                <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 0 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z" fill="currentColor"/>
              </svg>
            )}
            {status === "✓✓" && (
              <span style={{ position: "relative", width: 24, height: 16 }}>
                <svg width="16" height="16" viewBox="0 0 16 16" style={{ position: "absolute", left: 0, top: 0, color: statusColor }}>
                  <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 0 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z" fill="currentColor"/>
                </svg>
                <svg width="16" height="16" viewBox="0 0 16 16" style={{ position: "absolute", left: 8, top: 0, color: statusColor }}>
                  <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 0 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z" fill="currentColor"/>
                </svg>
              </span>
            )}
          </span>
        )}
      </div>
      {menuOpen && (
        <ul
          className="message-menu"
          role="menu"
          aria-label="Message actions"
          style={{ position: "fixed", top: menuPos.y, left: menuPos.x, zIndex: 1000, background: "#fff", boxShadow: "0 2px 12px rgba(0,0,0,0.15)", borderRadius: 8, padding: 0, margin: 0, listStyle: "none", minWidth: 160, transition: "box-shadow 0.2s", border: "1px solid #eee" }}
        >
          <li>
            <button
              tabIndex={0}
              title="Reply (Ctrl+R)"
              style={{ width: "100%", textAlign: "left", padding: "10px 16px", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontSize: 15 }}
              onClick={() => { onReply?.(message); closeMenu(); }}
              onKeyDown={e => { if (e.ctrlKey && (e.key === 'r' || e.key === 'R')) { onReply?.(message); closeMenu(); } }}
            >
              <FaReply style={{ marginRight: 6 }} /> Reply
            </button>
          </li>
          <li>
            <button
              tabIndex={0}
              title="React (Ctrl+E)"
              style={{ width: "100%", textAlign: "left", padding: "10px 16px", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontSize: 15 }}
              onClick={() => { setShowReactions(!showReactions); }}
              onKeyDown={e => { if (e.ctrlKey && (e.key === 'e' || e.key === 'E')) { setShowReactions(!showReactions); } }}
            >
              <FaSmile style={{ marginRight: 6 }} /> React
            </button>
            {showReactions && (
              <div style={{
                position: 'absolute',
                right: '100%',
                top: 0,
                background: 'white',
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '8px',
                display: 'flex',
                gap: '4px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                zIndex: 1000
              }}>
                {reactionIcons.map(reaction => (
                  <button
                    key={reaction.label}
                    onClick={() => handleReact(reaction)}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '20px',
                      cursor: 'pointer',
                      padding: '4px',
                      borderRadius: '4px'
                    }}
                    onMouseEnter={(e) => e.target.style.background = '#f0f0f0'}
                    onMouseLeave={(e) => e.target.style.background = 'none'}
                    title={reaction.label}
                  >
                    {reaction.icon}
                  </button>
                ))}
              </div>
            )}
          </li>
          {message.content && (
            <li>
              <button
                tabIndex={0}
                title="Copy message (Ctrl+C)"
                style={{ width: "100%", textAlign: "left", padding: "10px 16px", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontSize: 15 }}
                onClick={handleCopyMessage}
                onKeyDown={e => { if (e.ctrlKey && (e.key === 'c' || e.key === 'C')) { handleCopyMessage(); } }}
              >
                📋 Copy
              </button>
            </li>
          )}
          {mine && message.content && (
            <li>
              <button
                tabIndex={0}
                title="Edit message (Ctrl+Shift+E)"
                style={{ width: "100%", textAlign: "left", padding: "10px 16px", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontSize: 15 }}
                onClick={handleEditMessage}
                onKeyDown={e => { if (e.ctrlKey && e.shiftKey && (e.key === 'e' || e.key === 'E')) { handleEditMessage(); } }}
              >
                ✏️ Edit
              </button>
            </li>
          )}
          <li>
            <button
              tabIndex={0}
              title="Forward (Ctrl+F)"
              style={{ width: "100%", textAlign: "left", padding: "10px 16px", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontSize: 15 }}
              onClick={() => { onForward?.(message); closeMenu(); }}
              onKeyDown={e => { if (e.ctrlKey && (e.key === 'f' || e.key === 'F')) { onForward?.(message); closeMenu(); } }}
            >
              <FaShare style={{ marginRight: 6 }} /> Forward
            </button>
          </li>
          <li>
            <button
              tabIndex={0}
              title="Delete for me (Ctrl+Del)"
              style={{ width: "100%", textAlign: "left", padding: "10px 16px", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontSize: 15 }}
              onClick={() => { onDelete?.(message, 'me'); closeMenu(); }}
              onKeyDown={e => { if (e.ctrlKey && e.key === 'Delete') { onDelete?.(message, 'me'); closeMenu(); } }}
            >
              <FaTrash style={{ marginRight: 6 }} /> Delete for me
            </button>
          </li>
          {mine && (
            <li>
              <button
                tabIndex={0}
                title="Delete for everyone (Ctrl+Shift+Del)"
                style={{ width: "100%", textAlign: "left", padding: "10px 16px", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontSize: 15 }}
                onClick={() => { onDelete?.(message, 'everyone'); closeMenu(); }}
                onKeyDown={e => { if (e.ctrlKey && e.shiftKey && e.key === 'Delete') { onDelete?.(message, 'everyone'); closeMenu(); } }}
              >
                <FaTrash style={{ marginRight: 6, color: '#d32f2f' }} /> Delete for everyone
              </button>
            </li>
          )}
          <li>
            <button
              tabIndex={0}
              title={pinned ? "Unpin (Ctrl+P)" : "Pin (Ctrl+P)"}
              style={{ width: "100%", textAlign: "left", padding: "10px 16px", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontSize: 15 }}
              onClick={handlePin}
              onKeyDown={e => { if (e.ctrlKey && (e.key === 'p' || e.key === 'P')) { handlePin(); } }}
            >
              📌 {pinned ? "Unpin" : "Pin"}
            </button>
          </li>
              
<li>
  <button
    tabIndex={0}
    title="Block User (Ctrl+B)"
    style={{ width: "100%", textAlign: "left", padding: "10px 16px", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontSize: 15 }}
    onClick={handleBlockUser}
    onKeyDown={e => { if (e.ctrlKey && (e.key === 'b' || e.key === 'B')) { handleBlockUser(); } }}
  >
    <FaBan style={{ marginRight: 6, color: '#d32f2f' }} /> Block User
  </button>
</li>
<li>
  <button
    tabIndex={0}
    title="Report User (Ctrl+Shift+R)"
    style={{ width: "100%", textAlign: "left", padding: "10px 16px", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontSize: 15 }}
    onClick={handleReportUser}
    onKeyDown={e => { if (e.ctrlKey && e.shiftKey && (e.key === 'r' || e.key === 'R')) { handleReportUser(); } }}
  >
    <FaFlag style={{ marginRight: 6, color: '#fbc02d' }} /> Report User
  </button>
</li>
        </ul>
      )}
      {starred && (
        <FaStar title="Starred" style={{ color: "#ffd700", fontSize: 18, marginLeft: 6 }} />
      )}
      {pinned && (
        <span title="Pinned" style={{ color: "#ff5722", fontSize: 18, marginLeft: 6 }}>📌</span>
      )}
    </div>
  );
}
