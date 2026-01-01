import React, { useContext, useState } from "react";
import { SettingsContext } from "../context/SettingsContext";
import { logoutEverywhere, logout } from "../api/auth";
import useAuth from "../hooks/useAuth";
import { FaCog, FaBell, FaLock, FaPalette, FaUser, FaShieldAlt, FaSignOutAlt, FaArrowLeft } from "react-icons/fa";

export default function SettingsModal({ onClose }) {
  const { theme, setTheme, notifications, setNotifications, privacy, setPrivacy, chatModes, setChatModes, appearance, setAppearance } = useContext(SettingsContext);
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("general");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(user?.status || "");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  const handleLogoutEverywhere = async () => {
    if (!window.confirm("Logout from all devices? You'll need to login again.")) return;

    setLoading(true);
    try {
      await logoutEverywhere();
      alert("Logged out from all devices.");
      logout();
    } catch (err) {
      alert("Error: " + (err.message || "Failed to logout everywhere"));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm("Logout from this device?")) {
      logout();
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== "DELETE") {
      alert("Please type 'DELETE' to confirm account deletion");
      return;
    }

    if (!window.confirm("⚠️ WARNING: This action cannot be undone!\n\nYour account, all messages, and chat history will be permanently deleted. Are you absolutely sure?")) {
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("usschats_token");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/delete-account`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ confirmation: deleteConfirmation })
      });

      if (response.ok) {
        alert("Account deleted successfully. You will be logged out.");
        logout();
      } else {
        const error = await response.json();
        alert("Failed to delete account: " + (error.msg || error.error));
      }
    } catch (err) {
      alert("Error deleting account: " + err.message);
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
      setDeleteConfirmation("");
    }
  };

  const handleUpdateStatus = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id || user._id, status })
      });
      if (res.ok) {
        alert("Status updated!");
      } else {
        alert("Failed to update status");
      }
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const tabs = [
    { id: "general", label: "General", icon: FaCog },
    { id: "notifications", label: "Notifications", icon: FaBell },
    { id: "privacy", label: "Privacy & Safety", icon: FaShieldAlt },
    { id: "chatmodes", label: "Chat Modes", icon: FaPalette },
    { id: "appearance", label: "Appearance", icon: FaPalette },
    { id: "account", label: "Account", icon: FaUser },
    { id: "security", label: "Security", icon: FaLock }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "general":
        return (
          <div className="settings-section">
            <h3>General Settings</h3>
            <div style={{ marginTop: 16 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={notifications.sounds}
                  onChange={e => setNotifications({ ...notifications, sounds: e.target.checked })}
                />
                <span>Play message sounds</span>
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={notifications.desktopNotifications}
                  onChange={e => setNotifications({ ...notifications, desktopNotifications: e.target.checked })}
                />
                <span>Show desktop notifications</span>
              </label>
            </div>
          </div>
        );

      case "notifications":
        return (
          <div className="settings-section">
            <h3>Notification Settings</h3>
            <div style={{ marginTop: 16 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={notifications.messages}
                  onChange={e => setNotifications({ ...notifications, messages: e.target.checked })}
                />
                <span>Message notifications</span>
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={notifications.pushNotifications}
                  onChange={e => setNotifications({ ...notifications, pushNotifications: e.target.checked })}
                />
                <span>Push notifications</span>
                <div style={{ fontSize: 12, color: "#666", marginLeft: "auto" }}>
                  Cross-device alerts
                </div>
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={notifications.sounds}
                  onChange={e => setNotifications({ ...notifications, sounds: e.target.checked })}
                />
                <span>Sound effects</span>
              </label>
              
              {/* Browser Notification Permission */}
              <div style={{ marginTop: 16, padding: 12, background: "#f8f9fa", borderRadius: 8, border: "1px solid #e9ecef" }}>
                <h4 style={{ margin: "0 0 8px 0", fontSize: 14 }}>Browser Notifications</h4>
                <p style={{ fontSize: 12, color: "#666", margin: "0 0 12px 0" }}>
                  Allow ussCHATs to show notifications in your browser even when the app is not active.
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 12, color: "#666" }}>
                    Status: {Notification.permission === "granted" ? "Enabled" : 
                             Notification.permission === "denied" ? "Blocked" : 
                             "Not requested"}
                  </span>
                  {Notification.permission !== "granted" && (
                    <button
                      onClick={async () => {
                        try {
                          const permission = await Notification.requestPermission();
                          if (permission === "granted") {
                            alert("Browser notifications enabled! You'll now receive notifications for new messages.");
                          } else {
                            alert("Browser notifications denied. You can enable them in your browser settings.");
                          }
                        } catch (err) {
                          alert("Error requesting notification permission: " + err.message);
                        }
                      }}
                      style={{
                        padding: "6px 12px",
                        background: "#0a84ff",
                        color: "#fff",
                        border: "none",
                        borderRadius: 4,
                        cursor: "pointer",
                        fontSize: 12
                      }}
                    >
                      Enable Browser Notifications
                    </button>
                  )}
                </div>
              </div>
              
              <div style={{ marginTop: 12 }}>
                <label style={{ display: "block", marginBottom: 8 }}>
                  <strong>Notification Tone:</strong>
                  <select style={{ width: "100%", padding: 8, marginTop: 4 }}>
                    <option>Default</option>
                    <option>Silent</option>
                    <option>Bell</option>
                    <option>Chime</option>
                  </select>
                </label>
              </div>
            </div>
          </div>
        );

      case "privacy":
        return (
          <div className="settings-section">
            <h3>Privacy & Safety</h3>
            <div style={{ marginTop: 16 }}>
              <label style={{ display: "block", marginBottom: 12 }}>
                <strong>Last Seen:</strong>
                <select
                  value={privacy.lastSeen}
                  onChange={e => setPrivacy({ ...privacy, lastSeen: e.target.value })}
                  style={{ width: "100%", padding: 8, marginTop: 4 }}
                >
                  <option value="everyone">Everyone</option>
                  <option value="contacts">Contacts only</option>
                  <option value="nobody">Nobody</option>
                </select>
              </label>

              <label style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={privacy.readReceipts}
                  onChange={e => setPrivacy({ ...privacy, readReceipts: e.target.checked })}
                />
                <span>Send read receipts</span>
              </label>

              <label style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={privacy.typingIndicator}
                  onChange={e => setPrivacy({ ...privacy, typingIndicator: e.target.checked })}
                />
                <span>Show typing indicator</span>
              </label>

              <label style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={privacy.invisibleReading}
                  onChange={e => setPrivacy({ ...privacy, invisibleReading: e.target.checked })}
                />
                <span>Invisible Reading Mode</span>
                <div style={{ fontSize: 12, color: "#666", marginLeft: "auto" }}>
                  Read without sending receipts
                </div>
              </label>

              <label style={{ display: "block", marginBottom: 12 }}>
                <strong>Profile Visibility:</strong>
                <select
                  value={privacy.profileVisibility}
                  onChange={e => setPrivacy({ ...privacy, profileVisibility: e.target.value })}
                  style={{ width: "100%", padding: 8, marginTop: 4 }}
                >
                  <option value="everyone">Everyone</option>
                  <option value="contacts">Contacts only</option>
                  <option value="nobody">Nobody</option>
                </select>
              </label>
            </div>
          </div>
        );

      case "chatmodes":
        return (
          <div className="settings-section">
            <h3>Smart Chat Modes</h3>
            <p style={{ fontSize: 14, color: "#666", marginBottom: 16 }}>
              Enable special modes to enhance your chatting experience.
            </p>
            <div style={{ marginTop: 16 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, cursor: "pointer", padding: "12px", border: "1px solid #eee", borderRadius: 8 }}>
                <input
                  type="checkbox"
                  checked={chatModes.focusMode}
                  onChange={e => setChatModes({ ...chatModes, focusMode: e.target.checked })}
                />
                <div>
                  <div style={{ fontWeight: "bold", color: "#0a84ff" }}>Focus Mode</div>
                  <div style={{ fontSize: 13, color: "#666" }}>Hide distracting elements and notifications</div>
                </div>
              </label>

              <label style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, cursor: "pointer", padding: "12px", border: "1px solid #eee", borderRadius: 8 }}>
                <input
                  type="checkbox"
                  checked={chatModes.studyMode}
                  onChange={e => setChatModes({ ...chatModes, studyMode: e.target.checked })}
                />
                <div>
                  <div style={{ fontWeight: "bold", color: "#25d366" }}>Study Mode</div>
                  <div style={{ fontSize: 13, color: "#666" }}>Mute notifications and show study notes</div>
                </div>
              </label>

              <label style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, cursor: "pointer", padding: "12px", border: "1px solid #eee", borderRadius: 8 }}>
                <input
                  type="checkbox"
                  checked={chatModes.workMode}
                  onChange={e => setChatModes({ ...chatModes, workMode: e.target.checked })}
                />
                <div>
                  <div style={{ fontWeight: "bold", color: "#ff6b35" }}>Work Mode</div>
                  <div style={{ fontSize: 13, color: "#666" }}>Task-style messages and productivity features</div>
                </div>
              </label>

              <label style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, cursor: "pointer", padding: "12px", border: "1px solid #eee", borderRadius: 8 }}>
                <input
                  type="checkbox"
                  checked={chatModes.gamesMode}
                  onChange={e => setChatModes({ ...chatModes, gamesMode: e.target.checked })}
                />
                <div>
                  <div style={{ fontWeight: "bold", color: "#9c27b0" }}>ames Mode</div>
                  <div style={{ fontSize: 13, color: "#666" }}>Play offline games</div>
                </div>
              </label>
            </div>
          </div>
        );

      case "appearance":
        return (
          <div className="settings-section">
            <h3>Appearance</h3>
            <div style={{ marginTop: 16 }}>
              {/* Theme Selection */}
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: "block", marginBottom: 12 }}>
                  <strong>Theme:</strong>
                </label>
                <div style={{ display: "flex", gap: 12 }}>
                  {["light", "dark", "auto"].map(t => (
                    <button
                      key={t}
                      onClick={() => setTheme(t)}
                      style={{
                        padding: "8px 16px",
                        background: theme === t ? "#0a84ff" : "#eee",
                        color: theme === t ? "#fff" : "#000",
                        border: "none",
                        borderRadius: 6,
                        cursor: "pointer",
                        textTransform: "capitalize",
                        fontWeight: theme === t ? "bold" : "normal"
                      }}
                    >
                      {t === "auto" ? "System" : t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Wallpaper */}
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: "block", marginBottom: 12 }}>
                  <strong>Chat Wallpaper:</strong>
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                  {[
                    { id: "default", name: "Default", color: "#e5ddd5" },
                    { id: "whatsapp", name: "WhatsApp", color: "#dcf8c6" },
                    { id: "dark", name: "Dark", color: "#1a1a1a" },
                    { id: "blue", name: "Blue", color: "#4a90e2" },
                    { id: "green", name: "Green", color: "#25d366" },
                    { id: "custom", name: "Custom", color: "#ccc" }
                  ].map(wallpaper => (
                    <div
                      key={wallpaper.id}
                      onClick={() => {
                        if (wallpaper.id === "custom") {
                          // Handle custom wallpaper upload
                          const input = document.createElement("input");
                          input.type = "file";
                          input.accept = "image/*";
                          input.onchange = (e) => {
                            const file = e.target.files[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = () => {
                                setAppearance({
                                  ...appearance,
                                  chatWallpaper: "custom",
                                  customWallpaperUrl: reader.result
                                });
                              };
                              reader.readAsDataURL(file);
                            }
                          };
                          input.click();
                        } else {
                          setAppearance({
                            ...appearance,
                            chatWallpaper: wallpaper.id,
                            customWallpaperUrl: null
                          });
                        }
                      }}
                      style={{
                        height: 60,
                        background: wallpaper.id === "custom" && appearance.customWallpaperUrl
                          ? `url(${appearance.customWallpaperUrl})`
                          : wallpaper.color,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        border: appearance.chatWallpaper === wallpaper.id ? "3px solid #0a84ff" : "1px solid #ddd",
                        borderRadius: 8,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 12,
                        fontWeight: "bold",
                        color: wallpaper.id === "dark" ? "#fff" : "#000"
                      }}
                    >
                      {wallpaper.name}
                    </div>
                  ))}
                </div>
              </div>

              {/* Message Background */}
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: "block", marginBottom: 12 }}>
                  <strong>Message Background:</strong>
                </label>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  {[
                    { id: "default", name: "Default", preview: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
                    { id: "whatsapp", name: "WhatsApp", preview: "linear-gradient(135deg, #dcf8c6 0%, #dcf8c6 100%)" },
                    { id: "ios", name: "iOS Blue", preview: "linear-gradient(135deg, #007aff 0%, #007aff 100%)" },
                    { id: "custom", name: "Custom", preview: "linear-gradient(135deg, #ccc 0%, #999 100%)" }
                  ].map(bg => (
                    <div
                      key={bg.id}
                      onClick={() => {
                        if (bg.id === "custom") {
                          const input = document.createElement("input");
                          input.type = "file";
                          input.accept = "image/*";
                          input.onchange = (e) => {
                            const file = e.target.files[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = () => {
                                setAppearance({
                                  ...appearance,
                                  messageBackground: "custom",
                                  customBackgroundUrl: reader.result
                                });
                              };
                              reader.readAsDataURL(file);
                            }
                          };
                          input.click();
                        } else {
                          setAppearance({
                            ...appearance,
                            messageBackground: bg.id,
                            customBackgroundUrl: null
                          });
                        }
                      }}
                      style={{
                        width: 80,
                        height: 60,
                        background: bg.id === "custom" && appearance.customBackgroundUrl
                          ? `url(${appearance.customBackgroundUrl})`
                          : bg.preview,
                        backgroundSize: "cover",
                        border: appearance.messageBackground === bg.id ? "3px solid #0a84ff" : "1px solid #ddd",
                        borderRadius: 8,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 10,
                        fontWeight: "bold",
                        color: "#fff",
                        textShadow: "0 1px 2px rgba(0,0,0,0.5)"
                      }}
                    >
                      {bg.name}
                    </div>
                  ))}
                </div>
              </div>

              {/* Font Size */}
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: "block", marginBottom: 8 }}>
                  <strong>Font Size:</strong>
                  <select
                    value={appearance.fontSize}
                    onChange={e => setAppearance({ ...appearance, fontSize: e.target.value })}
                    style={{ width: "100%", padding: 8, marginTop: 4 }}
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                </label>
              </div>

              {/* Display Options */}
              <div>
                <label style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={appearance.showAvatars}
                    onChange={e => setAppearance({ ...appearance, showAvatars: e.target.checked })}
                  />
                  <span>Show profile pictures in chats</span>
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={appearance.showOnlineStatus}
                    onChange={e => setAppearance({ ...appearance, showOnlineStatus: e.target.checked })}
                  />
                  <span>Show online status</span>
                </label>
              </div>
            </div>
          </div>
        );

      case "account":
        return (
          <div className="settings-section">
            <h3>Account Settings</h3>
            <div style={{ marginTop: 16 }}>
              <p style={{ fontSize: 14, color: "#666", marginBottom: 12 }}>
                Manage your account information, phone number, and email.
              </p>
              <div style={{ marginBottom: 12 }}>
                <label>Status Message:</label>
                <input
                  type="text"
                  placeholder="Set your status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  style={{ width: "100%", padding: 8, border: "1px solid #ddd", borderRadius: 4, marginTop: 4 }}
                />
                <button
                  onClick={handleUpdateStatus}
                  style={{
                    padding: "8px 16px",
                    background: "#0a84ff",
                    color: "#fff",
                    border: "none",
                    borderRadius: 4,
                    cursor: "pointer",
                    marginTop: 8
                  }}
                >
                  Update Status
                </button>
              </div>
              <button
                onClick={() => window.location.href = "/profile"}
                style={{
                  padding: "10px 16px",
                  background: "#0a84ff",
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  cursor: "pointer",
                  width: "100%"
                }}
              >
                Edit Profile
              </button>
              <button
                onClick={() => alert("Change phone: Not implemented yet")}
                style={{
                  padding: "10px 16px",
                  background: "#f5f5f5",
                  border: "1px solid #ddd",
                  borderRadius: 6,
                  cursor: "pointer",
                  width: "100%",
                  marginTop: 8
                }}
              >
                Change Phone Number
              </button>
              <button
                onClick={() => alert("Change email: Not implemented yet")}
                style={{
                  padding: "10px 16px",
                  background: "#f5f5f5",
                  border: "1px solid #ddd",
                  borderRadius: 6,
                  cursor: "pointer",
                  width: "100%",
                  marginTop: 8
                }}
              >
                Change Email
              </button>
              
              {/* Delete Account Section */}
              <div style={{ marginTop: 24, padding: "16px", background: "#fff5f5", border: "1px solid #fed7d7", borderRadius: 8 }}>
                <h4 style={{ margin: "0 0 8px 0", color: "#c53030", fontSize: 16 }}>Danger Zone</h4>
                <p style={{ fontSize: 13, color: "#666", marginBottom: 12 }}>
                  Once you delete your account, there is no going back. This will permanently delete your account and remove your data from our servers.
                </p>
                {!showDeleteConfirm ? (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    style={{
                      padding: "10px 16px",
                      background: "#e53e3e",
                      color: "#fff",
                      border: "none",
                      borderRadius: 6,
                      cursor: "pointer",
                      width: "100%",
                      fontWeight: "bold"
                    }}
                  >
                    Delete Account
                  </button>
                ) : (
                  <div style={{ marginTop: 12 }}>
                    <p style={{ fontSize: 13, color: "#c53030", marginBottom: 8, fontWeight: "bold" }}>
                      Type "DELETE" to confirm:
                    </p>
                    <input
                      type="text"
                      value={deleteConfirmation}
                      onChange={(e) => setDeleteConfirmation(e.target.value)}
                      placeholder="Type DELETE here"
                      style={{
                        width: "100%",
                        padding: 8,
                        border: "1px solid #e53e3e",
                        borderRadius: 4,
                        marginBottom: 8,
                        fontSize: 14
                      }}
                    />
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        onClick={handleDeleteAccount}
                        disabled={loading || deleteConfirmation !== "DELETE"}
                        style={{
                          flex: 1,
                          padding: "8px 16px",
                          background: deleteConfirmation === "DELETE" ? "#e53e3e" : "#ccc",
                          color: "#fff",
                          border: "none",
                          borderRadius: 4,
                          cursor: deleteConfirmation === "DELETE" && !loading ? "pointer" : "not-allowed",
                          fontWeight: "bold",
                          opacity: loading ? 0.6 : 1
                        }}
                      >
                        {loading ? "Deleting..." : "Confirm Delete"}
                      </button>
                      <button
                        onClick={() => {
                          setShowDeleteConfirm(false);
                          setDeleteConfirmation("");
                        }}
                        style={{
                          padding: "8px 16px",
                          background: "#f7fafc",
                          color: "#4a5568",
                          border: "1px solid #e2e8f0",
                          borderRadius: 4,
                          cursor: "pointer"
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case "security":
        return (
          <div className="settings-section">
            <h3>Security</h3>
            <div style={{ marginTop: 16 }}>
              <p style={{ fontSize: 14, color: "#666", marginBottom: 12 }}>
                Manage your session and login security.
              </p>
              <button
                onClick={handleLogoutEverywhere}
                disabled={loading}
                style={{
                  padding: "10px 16px",
                  background: "#ff6b6b",
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  cursor: loading ? "not-allowed" : "pointer",
                  width: "100%",
                  opacity: loading ? 0.6 : 1
                }}
              >
                {loading ? "Logging out..." : "Logout Everywhere"}
              </button>
              <button
                onClick={handleLogout}
                style={{
                  padding: "10px 16px",
                  background: "#d32f2f",
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  cursor: "pointer",
                  width: "100%",
                  marginTop: 8
                }}
              >
                Logout This Device
              </button>
              <div style={{ marginTop: 16, padding: 12, background: "#f0f0f0", borderRadius: 6 }}>
                <p style={{ fontSize: 13, marginBottom: 8 }}>
                  <strong>Two-Factor Authentication:</strong>
                </p>
                <p style={{ fontSize: 12, color: "#666", marginBottom: 8 }}>
                  Add an extra layer of security to your account.
                </p>
                <button
                  onClick={() => alert("2FA: Not implemented yet")}
                  style={{
                    padding: "8px 12px",
                    background: "#0a84ff",
                    color: "#fff",
                    border: "none",
                    borderRadius: 4,
                    cursor: "pointer"
                  }}
                >
                  Enable 2FA
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="modal" style={{ maxWidth: 600, maxHeight: "90vh", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            fontSize: 20,
            cursor: "pointer",
            marginRight: 12
          }}
          aria-label="Close settings"
        >
          <FaArrowLeft />
        </button>
        <h2 style={{ margin: 0 }}>Settings</h2>
      </div>

      <div style={{ display: "flex", height: "calc(100% - 60px)" }}>
        {/* Sidebar */}
        <div style={{
          width: 140,
          borderRight: "1px solid #eee",
          overflowY: "auto",
          paddingRight: 12
        }}>
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  background: activeTab === tab.id ? "#e3f2fd" : "transparent",
                  border: "none",
                  borderRadius: 6,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 13,
                  color: activeTab === tab.id ? "#0a84ff" : "#666",
                  marginBottom: 4,
                  fontWeight: activeTab === tab.id ? "bold" : "normal"
                }}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div style={{
          flex: 1,
          padding: "0 16px",
          overflowY: "auto"
        }}>
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}