import { useState, useEffect } from 'react';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      // Show the install prompt after a delay
      setTimeout(() => setShowPrompt(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (isStandalone) {
      setShowPrompt(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;

    // Reset the deferred prompt
    setDeferredPrompt(null);
    setShowPrompt(false);

    // Log the result
    console.log(`User ${outcome === 'accepted' ? 'accepted' : 'dismissed'} the install prompt`);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Remember that user dismissed it
    localStorage.setItem('installPromptDismissed', Date.now().toString());
  };

  // Don't show if user has already dismissed it recently (within 7 days)
  const lastDismissed = localStorage.getItem('installPromptDismissed');
  if (lastDismissed && Date.now() - parseInt(lastDismissed) < 7 * 24 * 60 * 60 * 1000) {
    return null;
  }

  if (!showPrompt) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      left: '20px',
      right: '20px',
      background: '#fff',
      border: '1px solid #e6e6e6',
      borderRadius: '12px',
      padding: '16px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
      zIndex: 1000,
      maxWidth: '400px',
      margin: '0 auto'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ fontSize: '24px' }}>📱</div>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '600' }}>
            Install ussCHATs
          </h3>
          <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
            Get the full app experience with offline support and push notifications
          </p>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
        <button
          onClick={handleInstallClick}
          style={{
            flex: 1,
            background: '#0a84ff',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 16px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          Install
        </button>
        <button
          onClick={handleDismiss}
          style={{
            background: 'transparent',
            color: '#666',
            border: '1px solid #e6e6e6',
            borderRadius: '8px',
            padding: '8px 16px',
            cursor: 'pointer'
          }}
        >
          Not now
        </button>
      </div>
    </div>
  );
}