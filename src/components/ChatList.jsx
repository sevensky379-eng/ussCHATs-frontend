export default function ChatList({ chats, activeChat, onSelect }) {
  const handleKeyDown = (e, chat) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(chat);
    }
  };

  return (
    <div
      className="chat-list"
      style={{ color: "#fff" }}
      role="listbox"
      aria-label="Chat list"
    >
      {chats.map((c) => (
        <div
          key={c._id}
          className={`chat-item ${activeChat?._id === c._id ? "active" : ""}`}
          onClick={() => onSelect(c)}
          onKeyDown={(e) => handleKeyDown(e, c)}
          style={{
            padding: "12px 16px",
            borderBottom: "1px solid #128c7e",
            cursor: "pointer",
            background: activeChat?._id === c._id ? "#25d366" : "transparent",
            color: "#fff"
          }}
          role="option"
          aria-selected={activeChat?._id === c._id}
          tabIndex={0}
          aria-label={`Chat with ${c.chatName}${c.unreadCount > 0 ? `, ${c.unreadCount} unread messages` : ''}`}
        >
          <div className="chat-name" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span>{c.chatName}</span>
            {c.unreadCount > 0 && (
              <span
                className="unread-badge"
                style={{
                  background: "#ff5722",
                  color: "#fff",
                  borderRadius: "50%",
                  minWidth: 22,
                  height: 22,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 13,
                  fontWeight: 700,
                  marginLeft: 8
                }}
                aria-label={`${c.unreadCount} unread messages`}
              >
                {c.unreadCount > 99 ? "99+" : c.unreadCount}
              </span>
            )}
          </div>
          {c.latestMessage?.content && (
            <div
              className="chat-preview"
              style={{ color: "#e0e0e0", fontSize: 14 }}
              aria-label={`Last message: ${c.latestMessage.content}`}
            >
              {c.latestMessage.content.slice(0, 28)}…
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
