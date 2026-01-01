import { useState } from "react";
import { createDirectChat, createGroupChat } from "../api/chats";

export default function CreateChatModal({ onClose, currentUserId, selectedUser }) {
  const [name, setName] = useState(selectedUser ? selectedUser.name : "");
  const [userIds, setUserIds] = useState("");

  const createDirect = async () => {
    if (selectedUser) {
      // Create direct chat with selected user
      await createDirectChat({ userId: selectedUser._id, chatName: selectedUser.name });
    } else {
      await createDirectChat({ userId: currentUserId, chatName: name });
    }
    onClose();
  };

  const createGroup = async () => {
    const arr = userIds.split(",").map(s => s.trim()).filter(Boolean);
    if (selectedUser) arr.push(selectedUser._id);
    await createGroupChat({ chatName: name, userIds: arr });
    onClose();
  };

  return (
    <div className="modal">
      <h3>Create chat</h3>
      <input placeholder="Chat name" value={name} onChange={(e)=>setName(e.target.value)} />
      <input placeholder="User IDs (comma)" value={userIds} onChange={(e)=>setUserIds(e.target.value)} />
      <button onClick={createGroup}>Create group</button>
      <button onClick={createDirect}>Create direct</button>
      <button onClick={onClose}>Close</button>
    </div>
  );
}
