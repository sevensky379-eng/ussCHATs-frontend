import React from 'react';
import './AuthBackground.css';

const AuthBackground = ({ children }) => {
  return (
    <div className="auth-background-wrapper">
      <div className="floating-bubbles">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="bubble"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${10 + Math.random() * 10}s`,
              width: `${20 + Math.random() * 40}px`,
              height: `${20 + Math.random() * 40}px`,
            }}
          />
        ))}
      </div>
      <div className="auth-content">
        {children}
      </div>
    </div>
  );
};

export default AuthBackground;

