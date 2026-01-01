import React, { createContext, useState, useEffect, useContext } from "react";

export const SettingsContext = createContext();

export function SettingsProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem("notifications");
    return saved ? JSON.parse(saved) : {
      messages: true,
      sounds: true,
      desktopNotifications: true,
      pushNotifications: true
    };
  });
  const [privacy, setPrivacy] = useState(() => {
    const saved = localStorage.getItem("privacy");
    return saved ? JSON.parse(saved) : {
      lastSeen: "everyone",
      readReceipts: true,
      typingIndicator: true,
      profileVisibility: "everyone",
      invisibleReading: false, // New: Read messages without sending receipts
      blockedUsers: []
    };
  });
  const [chatModes, setChatModes] = useState(() => {
    const saved = localStorage.getItem("chatModes");
    return saved ? JSON.parse(saved) : {
      studyMode: false, // Mute notifications + show study notes
      workMode: false,   // Task-style messages
      focusMode: false,  // Hide distracting elements
      gamesMode: true    // Show offline games by default
    };
  });

  const [appearance, setAppearance] = useState(() => {
    const saved = localStorage.getItem("appearance");
    return saved ? JSON.parse(saved) : {
      messageBackground: "default", // "default", "custom", "none"
      customBackgroundUrl: null,
      chatWallpaper: "default", // WhatsApp-like wallpaper options
      bubbleStyle: "whatsapp", // "whatsapp", "ios", "minimal"
      fontSize: "medium", // "small", "medium", "large"
      showAvatars: true,
      showOnlineStatus: true
    };
  });

  useEffect(() => {
    localStorage.setItem("theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("notifications", JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem("privacy", JSON.stringify(privacy));
  }, [privacy]);

  useEffect(() => {
    localStorage.setItem("chatModes", JSON.stringify(chatModes));
  }, [chatModes]);

  useEffect(() => {
    localStorage.setItem("appearance", JSON.stringify(appearance));
  }, [appearance]);

  return (
    <SettingsContext.Provider value={{
      theme,
      setTheme,
      notifications,
      setNotifications,
      privacy,
      setPrivacy,
      chatModes,
      setChatModes,
      appearance,
      setAppearance
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}