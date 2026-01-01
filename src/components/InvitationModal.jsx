import React, { useState } from "react";
import "./InvitationModal.css";

const InvitationModal = ({ isOpen, onClose, currentUser }) => {
  const [invitationMessage, setInvitationMessage] = useState("");
  const [copied, setCopied] = useState(false);

  const generateInvitationLink = () => {
    const baseUrl = window.location.origin;
    const inviteCode = btoa(`${currentUser._id}_${Date.now()}`).replace(/=/g, '');
    return `${baseUrl}/register?ref=${inviteCode}`;
  };

  const generateInvitationMessage = () => {
    const inviteLink = generateInvitationLink();
    const message = `Hey! Join me on ussCHATs - the best messaging app! Sign up here: ${inviteLink}`;
    setInvitationMessage(message);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(invitationMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const shareViaWhatsApp = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(invitationMessage)}`;
    window.open(whatsappUrl, '_blank');
  };

  const shareViaEmail = () => {
    const subject = "Join me on ussCHATs!";
    const body = invitationMessage;
    const emailUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(emailUrl, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="invitation-modal-overlay" onClick={onClose}>
      <div className="invitation-modal" onClick={(e) => e.stopPropagation()}>
        <div className="invitation-modal-header">
          <h2>Invite Friends</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="invitation-modal-body">
          <p>Share ussCHATs with your friends and let them join the conversation!</p>

          {!invitationMessage ? (
            <button
              className="generate-button"
              onClick={generateInvitationMessage}
            >
              Generate Invitation Message
            </button>
          ) : (
            <div className="invitation-content">
              <textarea
                value={invitationMessage}
                readOnly
                className="invitation-textarea"
                rows={4}
              />
              <div className="invitation-actions">
                <button
                  className={`copy-button ${copied ? 'copied' : ''}`}
                  onClick={copyToClipboard}
                >
                  {copied ? 'Copied!' : 'Copy Link'}
                </button>
                <button className="share-whatsapp" onClick={shareViaWhatsApp}>
                  Share via WhatsApp
                </button>
                <button className="share-email" onClick={shareViaEmail}>
                  Share via Email
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvitationModal;