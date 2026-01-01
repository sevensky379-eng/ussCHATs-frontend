import { useEffect, useState } from "react";
import useAuth from "../hooks/useAuth";
import { getUserChats } from "../api/chats";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import { useSettings } from "../context/SettingsContext";

export default function ChatLayout() {
  const { user } = useAuth();
  const { chatModes } = useSettings();
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [sidebarHidden, setSidebarHidden] = useState(false);

  const loadChats = async () => {
    if (!user) return;
    const { data } = await getUserChats(user.id || user._id);
    setChats(data);
    if (!activeChat && data.length) setActiveChat(data[0]);
  };

  useEffect(() => {
    loadChats();
  }, [user]);

  // Keyboard shortcut for toggling sidebar (Ctrl/Cmd + B)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        toggleSidebar();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleSidebar = () => {
    setSidebarHidden(!sidebarHidden);
  };

  return (
    <div className="app-container flex flex-col md:flex-row h-screen">
      <div
        className={`sidebar-container ${sidebarHidden || chatModes.focusMode ? 'hidden' : ''}`}
        style={{
          transition: 'width 0.3s ease-in-out',
          width: sidebarHidden || chatModes.focusMode ? '0' : 'auto',
          overflow: 'hidden'
        }}
      >
        {!sidebarHidden && !chatModes.focusMode && (
          <Sidebar
            chats={chats}
            onSelectChat={setActiveChat}
            activeChat={activeChat}
            onChatCreated={loadChats}
          />
        )}
      </div>
      {activeChat ? (
        <ChatWindow
          chat={activeChat}
          className="flex-1"
          sidebarHidden={sidebarHidden}
          onToggleSidebar={toggleSidebar}
        />
      ) : (
        <div className="empty-chat flex-1 flex items-center justify-center">
          <h2>Select a chat</h2>
        </div>
      )}
    </div>
  );
}
