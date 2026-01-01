import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

export default function useSocket(userId, activeChatId) {
  const socketRef = useRef(null);

  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL, { transports: ["websocket"] });
    socketRef.current = socket;

    socket.emit("setup", userId);

    if (activeChatId) socket.emit("join chat", activeChatId);

    return () => {
      try { socket.disconnect(); } catch(e){/*ignore*/ }
      socketRef.current = null;
    };
  }, [userId, activeChatId]);

  return socketRef;
}
