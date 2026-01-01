import React, { useEffect, useState } from 'react';
import './BubblingLogo.css';

const BubblingLogo = () => {
  const [animationStarted, setAnimationStarted] = useState(false);

  useEffect(() => {
    // Start animation after component mounts
    const timer = setTimeout(() => {
      setAnimationStarted(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`bubbling-logo ${animationStarted ? 'animate' : ''}`}>
      <span>U</span>
      <span>S</span>
      <span>S</span>
      <span>C</span>
      <span>H</span>
      <span>A</span>
      <span>T</span>
      <span>S</span>
    </div>
  );
};

export default BubblingLogo;
        {currentGame === 'rockpaperscissors' && <RockPaperScissors />}
        {currentGame === 'numberguessing' && <NumberGuessing />}
        {currentGame === 'wordguessing' && <WordGuessing />}
        {currentGame === 'infiniterunner' && <InfiniteRunner />}
      </div>
    );
  }

  const text = "ussCHATs";

  return (
    <div className="bubbling-logo-container">
      <div className="bubbling-logo">
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
        Connect, Chat, Create Memories
      </div>
      <div className="action-buttons">
        <button
          onClick={() => {
            // Scroll to sidebar or show search
            const sidebar = document.querySelector('.sidebar-container');
            if (sidebar) {
              sidebar.scrollIntoView({ behavior: 'smooth' });
            }
          }}
          className="action-btn primary"
        >
          Start Chatting
        </button>
        <button
          onClick={() => {
            // Show search modal or scroll to search
            const searchInput = document.querySelector('input[placeholder*="Search"]');
            if (searchInput) {
              searchInput.focus();
              searchInput.scrollIntoView({ behavior: 'smooth' });
            }
          }}
          className="action-btn secondary"
        >
          Find Friends
        </button>
      </div>
    </div>
  );
};

export default BubblingLogo;

