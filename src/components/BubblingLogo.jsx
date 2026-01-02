import React, { useEffect, useState } from 'react';
import './BubblingLogo.css';

const BubblingLogo = () => {
  const [animationStarted, setAnimationStarted] = useState(false);
  const text = "ussCHATs";

  useEffect(() => {
    // Start animation after component mounts
    const timer = setTimeout(() => {
      setAnimationStarted(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Helper functions for button actions
  const scrollToSidebar = () => {
    const sidebar = document.querySelector('.sidebar-container');
    if (sidebar) {
      sidebar.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const focusSearch = () => {
    const searchInput = document.querySelector('input[placeholder*="Search"]');
    if (searchInput) {
      searchInput.focus();
      searchInput.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="bubbling-logo-container">
      <div className={`bubbling-logo ${animationStarted ? 'animate' : ''}`}>
        {text.split('').map((letter, index) => (
          <span
            key={index}
            className={`bubbling-letter ${letter === ' ' ? 'space' : ''} ${animationStarted ? 'animate' : ''}`}
            style={{
              animationDelay: `${index * 0.1}s`,
              animationDuration: `${1.5 + (index % 3) * 0.3}s`
            }}
          >
            {letter === ' ' ? '\u00A0' : letter}
          </span>
        ))}
      </div>

      <div className="logo-subtitle">
        Chat like PRO
      </div>

      <div className="action-buttons">
        <button onClick={scrollToSidebar} className="action-btn primary">
          Start Chatting
        </button>
        <button onClick={focusSearch} className="action-btn secondary">
          Find Friends
        </button>
      </div>
    </div>
  );
};

export default BubblingLogo;
