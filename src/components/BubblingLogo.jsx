import React, { useEffect, useState } from 'react';
import './BubblingLogo.css';
import { useOffline } from '../hooks/useOffline';
import { TicTacToe, RockPaperScissors, NumberGuessing, WordGuessing, InfiniteRunner } from './Games';

const BubblingLogo = () => {
  const [animationStarted, setAnimationStarted] = useState(false);
  const [currentGame, setCurrentGame] = useState(null);
  const isOffline = useOffline();

  useEffect(() => {
    // Start animation after component mounts
    const timer = setTimeout(() => {
      setAnimationStarted(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // If offline, show a game instead of the animation
  if (isOffline && !currentGame) {
    return (
      <div className="offline-container">
        <h2>You're offline! Play a game while you wait.</h2>
        <div className="game-buttons">
          <button onClick={() => setCurrentGame('tictactoe')} className="game-btn tictactoe">
            Tic Tac Toe
          </button>
          <button onClick={() => setCurrentGame('rockpaperscissors')} className="game-btn rockpaper">
            Rock Paper Scissors
          </button>
          <button onClick={() => setCurrentGame('numberguessing')} className="game-btn numberguess">
            Number Guessing
          </button>
        </div>
      </div>
    );
  }

  if (currentGame) {
    return (
      <div className="game-container">
        <button
          onClick={() => setCurrentGame(null)}
          className="back-btn"
        >
          Back
        </button>

        {currentGame === 'tictactoe' && <TicTacToe />}
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

