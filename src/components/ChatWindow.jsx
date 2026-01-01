// Import necessary components and hooks
import { useEffect, useRef, useState, useContext } from "react";
import { getMessages, sendMessage, markRead, markDelivered } from "../api/messages";
import useAuth from "../hooks/useAuth";
import useSocket from "../hooks/useSocket";
import ChatHeader from "./ChatHeader";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import InfiniteScroll from "react-infinite-scroll-component";
import { SettingsContext } from "../context/SettingsContext";
import { TicTacToe, RockPaperScissors, NumberGuessing, WordGuessing, InfiniteRunner } from "./Games";
import { analytics } from "../utils/analytics";

// ChatWindow component for displaying chat messages and input
export default function ChatWindow({ chat, sidebarHidden, onToggleSidebar }) {
  const { user } = useAuth();
  const { privacy, chatModes, notifications } = useContext(SettingsContext);
  // State for messages list
  const [messages, setMessages] = useState([]);
  // Pagination state
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  // Reply state
  const [replyTo, setReplyTo] = useState(null);
  // Search state
  const [search, setSearch] = useState("");
  // Socket reference
  const socketRef = useSocket(user?.id || user?._id, chat?._id);
  // Typing indicators
  const [typingUsers, setTypingUsers] = useState({});
  // Loader ref for infinite scroll
  const loaderRef = useRef(null);
  // View mode (chat or timeline)
  const [viewMode, setViewMode] = useState("chat"); // "chat" or "timeline"
  // Study mode notes
  const [studyNotes, setStudyNotes] = useState(() => {
    const saved = localStorage.getItem(`studyNotes_${chat?._id}`);
    return saved ? JSON.parse(saved) : [];
  });
  // Work mode tasks
  const [workTasks, setWorkTasks] = useState(() => {
    const saved = localStorage.getItem(`workTasks_${chat?._id}`);
    return saved ? JSON.parse(saved) : [];
  });
  // Pomodoro timer for study/work modes
  const [pomodoroTime, setPomodoroTime] = useState(25 * 60); // 25 minutes in seconds
  const [pomodoroActive, setPomodoroActive] = useState(false);
  const [pomodoroMode, setPomodoroMode] = useState('work'); // 'work' or 'break'
  // Games mode state
  const [currentGame, setCurrentGame] = useState(null); // null, 'tictactoe', 'rockpaperscissors', 'numberguessing', 'wordguessing'

  // Save study notes when they change
  useEffect(() => {
    if (chat?._id) {
      localStorage.setItem(`studyNotes_${chat._id}`, JSON.stringify(studyNotes));
    }
  }, [studyNotes, chat?._id]);

  // Save work tasks when they change
  useEffect(() => {
    if (chat?._id) {
      localStorage.setItem(`workTasks_${chat._id}`, JSON.stringify(workTasks));
    }
  }, [workTasks, chat?._id]);

  // Pomodoro timer effect
  useEffect(() => {
    let interval;
    if (pomodoroActive && pomodoroTime > 0) {
      interval = setInterval(() => {
        setPomodoroTime(time => {
          if (time <= 1) {
            // Timer finished
            setPomodoroActive(false);
            if (pomodoroMode === 'work') {
              // Switch to break
              setPomodoroMode('break');
              setPomodoroTime(5 * 60); // 5 minute break
              alert('Work session complete! Take a 5-minute break.');
            } else {
              // Switch to work
              setPomodoroMode('work');
              setPomodoroTime(25 * 60); // 25 minute work session
              alert('Break time over! Ready for another work session?');
            }
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [pomodoroActive, pomodoroTime, pomodoroMode]);

  // Add study note
  const addStudyNote = (note) => {
    const newNote = {
      id: Date.now(),
      content: note,
      timestamp: new Date().toISOString(),
      completed: false
    };
    setStudyNotes(prev => [...prev, newNote]);
  };

  // Toggle study note completion
  const toggleStudyNote = (id) => {
    setStudyNotes(prev => prev.map(note => 
      note.id === id ? { ...note, completed: !note.completed } : note
    ));
  };

  // Add work task
  const addWorkTask = (task) => {
    const newTask = {
      id: Date.now(),
      content: task,
      timestamp: new Date().toISOString(),
      completed: false,
      priority: 'normal'
    };
    setWorkTasks(prev => [...prev, newTask]);
  };

  // Toggle work task completion
  const toggleWorkTask = (id) => {
    setWorkTasks(prev => prev.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  // Set work task priority
  const setTaskPriority = (id, priority) => {
    setWorkTasks(prev => prev.map(task => 
      task.id === id ? { ...task, priority } : task
    ));
  };

  // Reset messages when chat changes
  useEffect(() => {
    setMessages([]); setPage(1); setHasMore(true);
    // Track chat opened analytics
    if (chat) {
      analytics.trackChatOpened(chat._id, chat.type || 'direct');
    }
  }, [chat._id]);

  // Mark messages as read when chat is viewed (unless invisible reading is enabled)
  useEffect(() => {
    if (chat && messages.length > 0 && !privacy.invisibleReading) {
      const unreadMessages = messages.filter(m =>
        m.sender !== (user.id || user._id) &&
        !m.readBy?.includes(user.id || user._id)
      );
      if (unreadMessages.length > 0) {
        markRead({
          messageIds: unreadMessages.map(m => m._id),
          userId: user.id || user._id
        }).catch(err => console.error('Failed to mark messages as read:', err));
      }
    }
  }, [chat._id, messages, privacy.invisibleReading, user.id, user._id]);

  // Mark messages as delivered when received
  useEffect(() => {
    if (chat && messages.length > 0) {
      const undeliveredMessages = messages.filter(m =>
        m.sender !== (user.id || user._id) &&
        !m.deliveredTo?.includes(user.id || user._id)
      );
      if (undeliveredMessages.length > 0) {
        markDelivered({
          messageIds: undeliveredMessages.map(m => m._id),
          userId: user.id || user._id
        }).catch(err => console.error('Failed to mark messages as delivered:', err));
      }
    }
  }, [chat._id, messages, user.id, user._id]);

  // Load more messages (pagination)
  const loadMore = async (p = 1) => {
    try {
      const { data } = await getMessages(chat._id + `?page=${p}&limit=20`);
      if (!data.length) setHasMore(false);
      setMessages(prev => [...data, ...prev]); // prepend older messages
    } catch (err) { console.error(err); }
  };

  // Handle incoming socket messages
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const onReceive = (message) => {
      if (message.chat === chat._id || message.chat._id === chat._id) {
        setMessages(prev => [...prev, message]);
        // Mark message as delivered for current user
        if (message.sender !== (user.id || user._id)) {
          markDelivered([message._id], user.id || user._id);
        }
        // Show push notification if enabled and not in focus mode
        if (notifications.pushNotifications && !chatModes.focusMode && document.visibilityState !== "visible" && "Notification" in window && Notification.permission === "granted") {
          new Notification(`New message from ${message.sender?.name || "Someone"}`, {
            body: message.content || "Media message",
            icon: "/favicon.ico"
          });
        }
        // Play sound notification if enabled and not in focus mode
        if (notifications.sounds && !chatModes.focusMode && document.visibilityState !== "visible") {
          const audio = new Audio("/notification.mp3");
          audio.play().catch(() => {}); // Ignore if blocked
        }
      }
    };
    const onTyping = ({ userId }) => setTypingUsers(prev => ({ ...prev, [userId]: true }));
    const onStopTyping = ({ userId }) => setTypingUsers(prev => { const copy = { ...prev }; delete copy[userId]; return copy; });
    const onEdited = (message) => setMessages(prev => prev.map(m => (m._id === message._id ? message : m)));
    const onDeleted = ({ messageId }) => setMessages(prev => prev.map(m => m._id === messageId ? { ...m, deleted: true, content: "" } : m));
    const onReacted = (message) => setMessages(prev => prev.map(m => m._id === message._id ? message : m));

    socket.on("receive message", onReceive);
    socket.on("typing", onTyping);
    socket.on("stop typing", onStopTyping);
    socket.on("message edited", onEdited);
    socket.on("message deleted", onDeleted);
    socket.on("message reacted", onReacted);

    return () => {
      socket.off("receive message", onReceive);
      socket.off("typing", onTyping);
      socket.off("stop typing", onStopTyping);
      socket.off("message edited", onEdited);
      socket.off("message deleted", onDeleted);
      socket.off("message reacted", onReacted);
    };
  }, [socketRef, chat._id]);

  const handleTyping = (isTyping) => {
    if (isTyping) {
      socketRef.current?.emit("typing", { chatId: chat._id, userId: user.id || user._id });
    } else {
      socketRef.current?.emit("stop typing", { chatId: chat._id, userId: user.id || user._id });
    }
  };

  const send = async ({ text, files, replyTo, selfDestructTime }) => {
    try {
      const { data } = await sendMessage({ 
        chatId: chat._id, 
        senderId: user.id || user._id, 
        content: text, 
        file: files?.[0], // For now, handle single file
        selfDestructTime,
        replyTo: replyTo?._id 
      });
      setMessages(prev => [...prev, data]);
      socketRef.current?.emit("send message", data);
      setReplyTo(null);
    } catch (err) { console.error(err); }
  };

  const handleEdit = async (messageId, newContent) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/messages/${messageId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newContent })
      });
      const updated = await res.json();
      socketRef.current?.emit("message edited", updated);
      setMessages(prev => prev.map(m => m._id === updated._id ? updated : m));
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (messageId, type = 'me') => {
    if (type === 'everyone') {
      // Hard delete
      try {
        await fetch(`${import.meta.env.VITE_API_URL}/api/messages/delete/${messageId}`, { method: "DELETE" });
        socketRef.current?.emit("message deleted", { messageId, chatId: chat._id });
        setMessages(prev => prev.filter(m => m._id !== messageId));
      } catch (err) { console.error(err); }
    } else {
      // Soft delete for me
      try {
        await fetch(`${import.meta.env.VITE_API_URL}/api/messages/deleteforme`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messageId, userId: user.id || user._id })
        });
        setMessages(prev => prev.map(m => m._id === messageId ? { ...m, deleted: true, content: "" } : m));
      } catch (err) { console.error(err); }
    }
  };

  const handleForward = async (message) => {
    const targetChatId = prompt("Enter chat ID to forward to:");
    if (!targetChatId) return;
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/messages/forward`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId: message._id, toChatId: targetChatId, senderId: user.id || user._id })
      });
      alert("Message forwarded!");
    } catch (err) { console.error(err); }
  };

  const handleReact = async (messageId, emoji) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/messages/react`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId, userId: user.id || user._id, emoji })
      });
      const updated = await res.json();
      socketRef.current?.emit("message reacted", updated);
      setMessages(prev => prev.map(m => m._id === updated._id ? updated : m));
    } catch (err) { console.error(err); }
  };

  // Show who is typing
  const typingUserNames = Object.keys(typingUsers)
    .map(id => {
      const u = messages.find(m => m.sender?._id === id || m.sender === id)?.sender?.name;
      return u || "Someone";
    })
    .filter((v, i, arr) => arr.indexOf(v) === i);

  const filteredMessages = search.trim()
    ? messages.filter(m => (m.content || "").toLowerCase().includes(search.toLowerCase()))
    : messages;

  // Group messages by date for timeline view with enhanced features
  const groupedMessages = viewMode === "timeline" ? filteredMessages.reduce((groups, msg) => {
    const date = new Date(msg.createdAt);
    const dateKey = date.toDateString();
    const timeKey = date.toTimeString().slice(0, 5); // HH:MM format

    if (!groups[dateKey]) {
      groups[dateKey] = {
        date: date,
        messages: [],
        messageCount: 0,
        participants: new Set(),
        mediaCount: 0,
        hasReplies: false
      };
    }

    groups[dateKey].messages.push({ ...msg, timeKey });
    groups[dateKey].messageCount++;
    groups[dateKey].participants.add(msg.sender?.name || 'Unknown');

    // Count media messages
    if (msg.media && msg.media.length > 0) {
      groups[dateKey].mediaCount++;
    }

    // Check for replies
    if (msg.replyTo) {
      groups[dateKey].hasReplies = true;
    }

    return groups;
  }, {}) : null;

  // Sort dates in descending order (newest first) for timeline
  const sortedDateKeys = viewMode === "timeline" && groupedMessages ?
    Object.keys(groupedMessages).sort((a, b) => new Date(b) - new Date(a)) : [];

  return (
    <div className="chat-window" style={{ position: "relative" }}>
      {/* Floating toggle button when sidebar is hidden */}
      {sidebarHidden && (
        <button
          onClick={onToggleSidebar}
          style={{
            position: "absolute",
            top: "10px",
            left: "10px",
            zIndex: 1000,
            background: "#25d366",
            color: "#fff",
            border: "none",
            borderRadius: "50%",
            width: "40px",
            height: "40px",
            fontSize: "18px",
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
          title="Show sidebar"
        >
          ☰
        </button>
      )}
      <ChatHeader chat={chat} onToggleSidebar={onToggleSidebar} sidebarHidden={sidebarHidden} />
      <div style={{ padding: "8px 16px", background: "#f7f7f7", borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search messages..."
          style={{ flex: 1, padding: 8, borderRadius: 8, border: "1px solid #ddd", marginRight: 8 }}
          aria-label="Search messages"
        />
        {!chatModes.focusMode && (
          <>
            <button onClick={() => setViewMode(viewMode === "chat" ? "timeline" : "chat")} style={{ padding: "8px 12px", background: "#0a84ff", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", marginRight: 8 }}>
              {viewMode === "chat" ? "Timeline" : "Chat"} View
            </button>
            <button onClick={() => {
              const dataStr = JSON.stringify(messages, null, 2);
              const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
              const exportFileDefaultName = `chat-${chat.chatName}.json`;
              const linkElement = document.createElement('a');
              linkElement.setAttribute('href', dataUri);
              linkElement.setAttribute('download', exportFileDefaultName);
              linkElement.click();
            }} style={{ padding: "8px 12px", background: "#ff5722", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" }}>
              Export JSON
            </button>
          </>
        )}
      </div>
      <div className="messages area" id="scrollableDiv" style={{ height: "400px", overflowY: "auto" }}>
        {viewMode === "chat" ? (
          <InfiniteScroll
            dataLength={filteredMessages.length}
            next={() => { loadMore(page + 1); setPage(page + 1); }}
            hasMore={hasMore}
            inverse={true}
            loader={<div key="loader">Loading...</div>}
            scrollableTarget="scrollableDiv"
          >
            {filteredMessages.map(m => (
              <MessageBubble
                key={m._id}
                message={m}
                meId={user.id || user._id}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onReact={handleReact}
                onReply={() => setReplyTo(m)}
                onForward={handleForward}
              />
            ))}
          </InfiniteScroll>
        ) : (
          <div style={{ padding: "16px" }}>
            {sortedDateKeys.map(dateKey => {
              const dayData = groupedMessages[dateKey];
              const isToday = new Date().toDateString() === dateKey;
              const isYesterday = new Date(Date.now() - 86400000).toDateString() === dateKey;

              let displayDate = dateKey;
              if (isToday) displayDate = "Today";
              else if (isYesterday) displayDate = "Yesterday";

              return (
                <div key={dateKey} style={{ marginBottom: "24px" }}>
                  {/* Date Header with Stats */}
                  <div style={{
                    position: "sticky",
                    top: "0",
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: "white",
                    padding: "12px 16px",
                    borderRadius: "12px",
                    marginBottom: "16px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    zIndex: 10
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "bold" }}>
                          {displayDate}
                        </h3>
                        <div style={{ fontSize: "12px", opacity: 0.9, marginTop: "4px" }}>
                          {dayData.date.toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                      </div>
                      <div style={{ textAlign: "right", fontSize: "12px" }}>
                        <div>{dayData.messageCount} messages</div>
                        <div>{dayData.participants.size} participants</div>
                        {dayData.mediaCount > 0 && <div>📎 {dayData.mediaCount} media</div>}
                        {dayData.hasReplies && <div>Has replies</div>}
                      </div>
                    </div>
                  </div>

                  {/* Timeline Messages */}
                  <div style={{ position: "relative" }}>
                    {/* Timeline line */}
                    <div style={{
                      position: "absolute",
                      left: "24px",
                      top: "0",
                      bottom: "0",
                      width: "3px",
                      background: "linear-gradient(to bottom, #667eea, #764ba2)",
                      borderRadius: "2px",
                      zIndex: 1
                    }}></div>

                    {dayData.messages
                      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
                      .map((message, index) => (
                        <div key={message._id} style={{
                          display: "flex",
                          marginBottom: "16px",
                          position: "relative",
                          zIndex: 2
                        }}>
                          {/* Timeline dot */}
                          <div style={{
                            width: "16px",
                            height: "16px",
                            background: message.sender?._id === (user.id || user._id) ? "#25d366" : "#667eea",
                            border: "3px solid white",
                            borderRadius: "50%",
                            marginRight: "16px",
                            marginTop: "8px",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                            flexShrink: 0
                          }}></div>

                          {/* Message bubble with time */}
                          <div style={{ flex: 1 }}>
                            <div style={{
                              fontSize: "11px",
                              color: "#666",
                              marginBottom: "4px",
                              fontWeight: "500"
                            }}>
                              {message.timeKey}
                            </div>
                            <MessageBubble
                              message={message}
                              meId={user.id || user._id}
                              onEdit={handleEdit}
                              onDelete={handleDelete}
                              onReact={handleReact}
                              onReply={() => setReplyTo(message)}
                              onForward={handleForward}
                              compact={true}
                            />
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              );
            })}

            {sortedDateKeys.length === 0 && (
              <div style={{
                textAlign: "center",
                padding: "40px",
                color: "#666",
                fontSize: "16px"
              }}>
                No messages found for the selected filters
              </div>
            )}
          </div>
        )}
      </div>
      <div className="typing-indicator" style={{ padding: "8px 16px", fontSize: "14px", color: "#666", display: "flex", alignItems: "center", gap: "8px" }}>
        {typingUserNames.length > 0 ? (
          <>
            <div style={{ display: "flex", gap: "2px" }}>
              <div className="typing-dot" style={{ width: "6px", height: "6px", background: "#25d366", borderRadius: "50%", animation: "typing 1.4s infinite ease-in-out" }}></div>
              <div className="typing-dot" style={{ width: "6px", height: "6px", background: "#25d366", borderRadius: "50%", animation: "typing 1.4s infinite ease-in-out 0.2s" }}></div>
              <div className="typing-dot" style={{ width: "6px", height: "6px", background: "#25d366", borderRadius: "50%", animation: "typing 1.4s infinite ease-in-out 0.4s" }}></div>
            </div>
            <small style={{ color: "#666" }}>
              {typingUserNames.join(", ")} {typingUserNames.length > 1 ? "are" : "is"} typing…
            </small>
            <style>{`
              @keyframes typing {
                0%, 60%, 100% { transform: translateY(0); }
                30% { transform: translateY(-10px); }
              }
            `}</style>
          </>
        ) : null}
      </div>

      {/* Study Mode Panel */}
      {chatModes.studyMode && (
        <div style={{
          background: "#e8f5e8",
          border: "1px solid #4caf50",
          borderRadius: "8px",
          padding: "12px",
          margin: "8px 16px",
          maxHeight: "200px",
          overflowY: "auto"
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
            <h4 style={{ margin: 0, color: "#2e7d32", display: "flex", alignItems: "center", gap: "8px" }}>
              Study Mode
              {pomodoroActive && (
                <span style={{ fontSize: "12px", color: "#666" }}>
                  {Math.floor(pomodoroTime / 60)}:{(pomodoroTime % 60).toString().padStart(2, '0')}
                </span>
              )}
            </h4>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={() => {
                  if (pomodoroActive) {
                    setPomodoroActive(false);
                  } else {
                    setPomodoroActive(true);
                    setPomodoroMode('work');
                    setPomodoroTime(25 * 60);
                  }
                }}
                style={{
                  padding: "4px 8px",
                  background: pomodoroActive ? "#f44336" : "#4caf50",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "12px"
                }}
              >
                {pomodoroActive ? "Pause" : "Start"} Pomodoro
              </button>
            </div>
          </div>
          
          <div style={{ marginBottom: "8px" }}>
            <input
              type="text"
              placeholder="Add study note..."
              onKeyPress={(e) => {
                if (e.key === 'Enter' && e.target.value.trim()) {
                  addStudyNote(e.target.value.trim());
                  e.target.value = '';
                }
              }}
              style={{
                width: "100%",
                padding: "6px",
                border: "1px solid #ccc",
                borderRadius: "4px",
                fontSize: "14px"
              }}
            />
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {studyNotes.map(note => (
              <div key={note.id} style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "4px",
                background: note.completed ? "#c8e6c9" : "white",
                borderRadius: "4px",
                textDecoration: note.completed ? "line-through" : "none"
              }}>
                <input
                  type="checkbox"
                  checked={note.completed}
                  onChange={() => toggleStudyNote(note.id)}
                />
                <span style={{ flex: 1, fontSize: "14px" }}>{note.content}</span>
                <span style={{ fontSize: "12px", color: "#666" }}>
                  {new Date(note.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Work Mode Panel */}
      {chatModes.workMode && (
        <div style={{
          background: "#fff3e0",
          border: "1px solid #ff9800",
          borderRadius: "8px",
          padding: "12px",
          margin: "8px 16px",
          maxHeight: "200px",
          overflowY: "auto"
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
            <h4 style={{ margin: 0, color: "#e65100", display: "flex", alignItems: "center", gap: "8px" }}>
              Work Mode
              {pomodoroActive && (
                <span style={{ fontSize: "12px", color: "#666" }}>
                  {Math.floor(pomodoroTime / 60)}:{(pomodoroTime % 60).toString().padStart(2, '0')}
                </span>
              )}
            </h4>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={() => {
                  if (pomodoroActive) {
                    setPomodoroActive(false);
                  } else {
                    setPomodoroActive(true);
                    setPomodoroMode('work');
                    setPomodoroTime(25 * 60);
                  }
                }}
                style={{
                  padding: "4px 8px",
                  background: pomodoroActive ? "#f44336" : "#ff9800",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "12px"
                }}
              >
                {pomodoroActive ? "Pause" : "Start"} Pomodoro
              </button>
            </div>
          </div>
          
          <div style={{ marginBottom: "8px" }}>
            <input
              type="text"
              placeholder="Add work task..."
              onKeyPress={(e) => {
                if (e.key === 'Enter' && e.target.value.trim()) {
                  addWorkTask(e.target.value.trim());
                  e.target.value = '';
                }
              }}
              style={{
                width: "100%",
                padding: "6px",
                border: "1px solid #ccc",
                borderRadius: "4px",
                fontSize: "14px"
              }}
            />
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {workTasks.map(task => (
              <div key={task.id} style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "4px",
                background: task.completed ? "#ffe0b2" : "white",
                borderRadius: "4px",
                textDecoration: task.completed ? "line-through" : "none"
              }}>
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleWorkTask(task.id)}
                />
                <span style={{ flex: 1, fontSize: "14px" }}>{task.content}</span>
                <select
                  value={task.priority}
                  onChange={(e) => setTaskPriority(task.id, e.target.value)}
                  style={{
                    fontSize: "12px",
                    padding: "2px",
                    border: "1px solid #ccc",
                    borderRadius: "3px"
                  }}
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                </select>
                <span style={{ fontSize: "12px", color: "#666" }}>
                  {new Date(task.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Games Mode Panel */}
      {chatModes.gamesMode && (
        <div style={{
          background: "#f3e5f5",
          border: "1px solid #9c27b0",
          borderRadius: "8px",
          padding: "12px",
          margin: "8px 16px",
          maxHeight: "400px",
          overflowY: "auto"
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
            <h4 style={{ margin: 0, color: "#7b1fa2", display: "flex", alignItems: "center", gap: "8px" }}>
              Games Mode
            </h4>
            <div style={{ display: "flex", gap: "8px" }}>
              {!currentGame && (
                <>
                  <button
                    onClick={() => setCurrentGame('tictactoe')}
                    style={{
                      padding: "6px 12px",
                      background: "#9c27b0",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "12px"
                    }}
                  >
                    Tic-Tac-Toe
                  </button>
                  <button
                    onClick={() => setCurrentGame('rockpaperscissors')}
                    style={{
                      padding: "6px 12px",
                      background: "#9c27b0",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "12px"
                    }}
                  >
                     RPS Game
                  </button>
                  <button
                    onClick={() => setCurrentGame('numberguessing')}
                    style={{
                      padding: "6px 12px",
                      background: "#9c27b0",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "12px"
                    }}
                  >
                    Guess Number
                  </button>
                  <button
                    onClick={() => setCurrentGame('wordguessing')}
                    style={{
                      padding: "6px 12px",
                      background: "#9c27b0",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "12px"
                    }}
                  >
                    Hangman
                  </button>
                  <button
                    onClick={() => setCurrentGame('infiniterunner')}
                    style={{
                      padding: "6px 12px",
                      background: "#9c27b0",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "12px"
                    }}
                  >
                    Runner
                  </button>
                </>
              )}
              {currentGame && (
                <button
                  onClick={() => setCurrentGame(null)}
                  style={{
                    padding: "6px 12px",
                    background: "#f44336",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "12px"
                  }}
                >
                  Close Game
                </button>
              )}
            </div>
          </div>

          {currentGame === 'tictactoe' && (
            <TicTacToe onGameEnd={(result) => {
              // Could send game result as a message
              console.log('TicTacToe result:', result);
            }} />
          )}

          {currentGame === 'rockpaperscissors' && (
            <RockPaperScissors onGameEnd={(result) => {
              console.log('RockPaperScissors result:', result);
            }} />
          )}

          {currentGame === 'numberguessing' && (
            <NumberGuessing onGameEnd={(result) => {
              console.log('NumberGuessing result:', result);
            }} />
          )}

          {currentGame === 'wordguessing' && (
            <WordGuessing onGameEnd={(result) => {
              console.log('WordGuessing result:', result);
            }} />
          )}

          {currentGame === 'infiniterunner' && (
            <InfiniteRunner onGameEnd={(result) => {
              console.log('InfiniteRunner result:', result);
            }} />
          )}
        </div>
      )}

      <MessageInput
        chatId={chat._id}
        onTyping={handleTyping}
        onSend={(payload) => send({ ...payload, reply: replyTo })}
        replyTo={replyTo}
        onCancelReply={() => setReplyTo(null)}
      />
    </div>
  );
}
