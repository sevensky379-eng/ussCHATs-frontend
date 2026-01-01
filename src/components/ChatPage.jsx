import React, { useState } from "react";
import UserSearch from "../components/UserSearch";
import ChatList from "../components/ChatList";
import ChatWindow from "../components/ChatWindow";
import ContactsList from "../components/ContactsList";
import CreateGroupModal from "../components/CreateGroupModal";

const ChatPage = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [activeTab, setActiveTab] = useState("chats");
  const [showGroupModal, setShowGroupModal] = useState(false);

  const handleSelectUser = async (user) => {
    // Call backend to create/get chat with this user
    const token = localStorage.getItem("usschats_token");
    const res = await fetch("http://localhost:5000/api/chats/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ userId: user._id, chatName: user.name }),
    });
    const chat = await res.json();
    setSelectedChat(chat);
  };

  const handleCreateGroup = async ({ groupName, members }) => {
    const token = localStorage.getItem("usschats_token");
    const res = await fetch("http://localhost:5000/api/chats/group", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name: groupName, members }),
    });
    const chat = await res.json();
    setSelectedChat(chat);
  };

  return (
    <div className="chat-page">
      <div className="sidebar-tabs">
        <button
          className={activeTab === "chats" ? "active" : ""}
          onClick={() => setActiveTab("chats")}
        >
          Chats
        </button>
        <button
          className={activeTab === "contacts" ? "active" : ""}
          onClick={() => setActiveTab("contacts")}
        >
          Contacts
        </button>
      </div>
      <div className="sidebar-content">
        {activeTab === "chats" && (
          <>
            <button
              className="new-group-btn"
              onClick={() => setShowGroupModal(true)}
            >
              + New Group
            </button>
            <UserSearch onSelectUser={handleSelectUser} />
            <ChatList onSelectChat={setSelectedChat} />
          </>
        )}
        {activeTab === "contacts" && (
          <ContactsList onSelectUser={handleSelectUser} />
        )}
      </div>
      {selectedChat && <ChatWindow chat={selectedChat} />}
      <CreateGroupModal
        open={showGroupModal}
        onClose={() => setShowGroupModal(false)}
        onCreate={handleCreateGroup}
      />
    </div>
  );
};

export default ChatPage;
