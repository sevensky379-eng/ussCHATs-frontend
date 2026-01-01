import { useState, useEffect, useRef } from 'react';
import { FaHandRock, FaHandPaper, FaHandScissors } from 'react-icons/fa';

const TicTacToe = ({ onGameEnd }) => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [winner, setWinner] = useState(null);
  const [winningLine, setWinningLine] = useState(null);
  const [scores, setScores] = useState({ X: 0, O: 0, draws: 0 });

  const calculateWinner = (squares) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
      [0, 4, 8], [2, 4, 6] // diagonals
    ];

    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return { winner: squares[a], line: lines[i] };
      }
    }
    return null;
  };

  const handleClick = (i) => {
    if (winner || board[i]) return;

    const newBoard = [...board];
    newBoard[i] = isXNext ? 'X' : 'O';
    setBoard(newBoard);
    setIsXNext(!isXNext);

    const result = calculateWinner(newBoard);
    if (result) {
      setWinner(result.winner);
      setWinningLine(result.line);
      setScores(prev => ({
        ...prev,
        [result.winner]: prev[result.winner] + 1
      }));
      onGameEnd && onGameEnd(`${result.winner} wins!`);
    } else if (newBoard.every(square => square)) {
      setWinner('Draw');
      setScores(prev => ({ ...prev, draws: prev.draws + 1 }));
      onGameEnd && onGameEnd('It\'s a draw!');
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
    setWinningLine(null);
  };

  const resetScores = () => {
    setScores({ X: 0, O: 0, draws: 0 });
  };

  const renderSquare = (i) => {
    const isWinningSquare = winningLine && winningLine.includes(i);
    return (
      <button
        key={i}
        onClick={() => handleClick(i)}
        style={{
          width: '80px',
          height: '80px',
          fontSize: '32px',
          fontWeight: 'bold',
          border: '3px solid #333',
          background: isWinningSquare ? '#4caf50' : winner || board[i] ? '#f5f5f5' : '#fff',
          cursor: winner || board[i] ? 'default' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease',
          color: isWinningSquare ? 'white' : board[i] === 'X' ? '#2196f3' : '#f44336',
          transform: board[i] ? 'scale(1.1)' : 'scale(1)',
          boxShadow: isWinningSquare ? '0 0 15px rgba(76, 175, 80, 0.5)' : 'none'
        }}
      >
        {board[i]}
      </button>
    );
  };

  return (
    <div style={{ textAlign: 'center', padding: '16px' }}>
      <h3>Tic-Tac-Toe</h3>

      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center', gap: '20px', fontSize: '18px' }}>
        <div style={{ color: '#2196f3' }}>Player X: {scores.X}</div>
        <div style={{ color: '#666' }}>Draws: {scores.draws}</div>
        <div style={{ color: '#f44336' }}>Player O: {scores.O}</div>
      </div>

      <div style={{ marginBottom: '16px', fontSize: '20px', fontWeight: 'bold' }}>
        {winner ? (
          winner === 'Draw' ? (
            <span style={{ color: '#ff9800' }}>🤝 It's a draw!</span>
          ) : (
            <span style={{ color: winner === 'X' ? '#2196f3' : '#f44336' }}>
              🏆 {winner} wins!
            </span>
          )
        ) : (
          <span>Next player: <span style={{ color: isXNext ? '#2196f3' : '#f44336', fontSize: '24px' }}>{isXNext ? 'X' : 'O'}</span></span>
        )}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '8px',
        marginBottom: '16px',
        justifyContent: 'center'
      }}>
        {Array(9).fill(null).map((_, i) => renderSquare(i))}
      </div>

      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
        <button
          onClick={resetGame}
          style={{
            padding: '10px 20px',
            background: '#2196f3',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => e.target.style.background = '#1976d2'}
          onMouseOut={(e) => e.target.style.background = '#2196f3'}
        >
          New Game
        </button>
        <button
          onClick={resetScores}
          style={{
            padding: '10px 20px',
            background: '#ff9800',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => e.target.style.background = '#f57c00'}
          onMouseOut={(e) => e.target.style.background = '#ff9800'}
        >
          Reset Scores
        </button>
      </div>
    </div>
  );
};

const RockPaperScissors = ({ onGameEnd }) => {
  const [playerChoice, setPlayerChoice] = useState(null);
  const [computerChoice, setComputerChoice] = useState(null);
  const [result, setResult] = useState('');
  const [score, setScore] = useState({ player: 0, computer: 0 });
  const [isPlaying, setIsPlaying] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [streak, setStreak] = useState(0);

  const choices = ['Rock', 'Paper', 'Scissors'];
  const icons = { Rock: <FaHandRock />, Paper: <FaHandPaper />, Scissors: <FaHandScissors /> };
  const colors = { Rock: '#8B4513', Paper: '#2196F3', Scissors: '#4CAF50' };

  const playGame = async (choice) => {
    if (isPlaying) return;

    setIsPlaying(true);
    setPlayerChoice(choice);
    setComputerChoice(null);
    setResult('');

    // Countdown animation
    for (let i = 3; i > 0; i--) {
      setCountdown(i);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    setCountdown(0);

    // Computer makes choice with animation
    const computerChoice = choices[Math.floor(Math.random() * choices.length)];
    setComputerChoice(computerChoice);

    // Dramatic pause
    await new Promise(resolve => setTimeout(resolve, 800));

    let gameResult = '';
    let newStreak = streak;

    if (choice === computerChoice) {
      gameResult = 'It\'s a tie!';
      newStreak = 0;
    } else if (
      (choice === 'Rock' && computerChoice === 'Scissors') ||
      (choice === 'Paper' && computerChoice === 'Rock') ||
      (choice === 'Scissors' && computerChoice === 'Paper')
    ) {
      gameResult = 'You win!';
      setScore(prev => ({ ...prev, player: prev.player + 1 }));
      newStreak = streak + 1;
    } else {
      gameResult = 'Computer wins!';
      setScore(prev => ({ ...prev, computer: prev.computer + 1 }));
      newStreak = 0;
    }

    setResult(gameResult);
    setStreak(newStreak);
    onGameEnd && onGameEnd(gameResult);
    setIsPlaying(false);
  };

  const resetGame = () => {
    setPlayerChoice(null);
    setComputerChoice(null);
    setResult('');
    setCountdown(0);
    setStreak(0);
  };

  const resetScores = () => {
    setScore({ player: 0, computer: 0 });
    setStreak(0);
  };

  return (
    <div style={{ textAlign: 'center', padding: '16px' }}>
      <h3>Rock Paper Scissors Pro</h3>

      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center', gap: '30px', fontSize: '18px', fontWeight: 'bold' }}>
        <div style={{ color: '#4CAF50' }}>You: {score.player}</div>
        <div style={{ color: '#666' }}>
          {streak > 0 && `Streak: ${streak}`}
        </div>
        <div style={{ color: '#f44336' }}>Computer: {score.computer}</div>
      </div>

      {countdown > 0 && (
        <div style={{
          fontSize: '48px',
          fontWeight: 'bold',
          color: '#ff9800',
          marginBottom: '20px',
          animation: 'pulse 0.5s infinite'
        }}>
          {countdown}
        </div>
      )}

      {!playerChoice || countdown > 0 ? (
        <div>
          <div style={{ marginBottom: '20px', fontSize: '16px', color: '#666' }}>
            Choose your weapon!
          </div>
          <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center', gap: '12px' }}>
            {choices.map(choice => (
              <button
                key={choice}
                onClick={() => playGame(choice)}
                disabled={isPlaying}
                style={{
                  padding: '16px 24px',
                  fontSize: '20px',
                  background: colors[choice],
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: isPlaying ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  transform: 'scale(1)',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                  opacity: isPlaying ? 0.6 : 1
                }}
                onMouseOver={(e) => {
                  if (!isPlaying) {
                    e.target.style.transform = 'scale(1.1)';
                    e.target.style.boxShadow = '0 6px 12px rgba(0,0,0,0.3)';
                  }
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'scale(1)';
                  e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
                }}
              >
                {icons[choice]} {choice}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center', gap: '40px', fontSize: '24px' }}>
            <div style={{
              padding: '20px',
              borderRadius: '12px',
              background: colors[playerChoice],
              color: 'white',
              fontWeight: 'bold',
              boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
            }}>
              <div>You</div>
              <div style={{ fontSize: '32px', marginTop: '8px' }}>{icons[playerChoice]}</div>
              <div style={{ fontSize: '14px', marginTop: '4px' }}>{playerChoice}</div>
            </div>

            <div style={{
              alignSelf: 'center',
              fontSize: '24px',
              color: '#666'
            }}>
              VS
            </div>

            <div style={{
              padding: '20px',
              borderRadius: '12px',
              background: colors[computerChoice],
              color: 'white',
              fontWeight: 'bold',
              boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
            }}>
              <div>Computer</div>
              <div style={{ fontSize: '32px', marginTop: '8px' }}>{icons[computerChoice]}</div>
              <div style={{ fontSize: '14px', marginTop: '4px' }}>{computerChoice}</div>
            </div>
          </div>

          <div style={{
            marginBottom: '20px',
            fontSize: '20px',
            fontWeight: 'bold',
            padding: '12px',
            borderRadius: '8px',
            background: result.includes('win') ? '#4caf50' : result.includes('tie') ? '#ff9800' : '#f44336',
            color: 'white'
          }}>
            {result}
          </div>

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
            <button
              onClick={resetGame}
              style={{
                padding: '10px 20px',
                background: '#2196f3',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => e.target.style.background = '#1976d2'}
              onMouseOut={(e) => e.target.style.background = '#2196f3'}
            >
              Play Again
            </button>
            <button
              onClick={resetScores}
              style={{
                padding: '10px 20px',
                background: '#ff9800',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => e.target.style.background = '#f57c00'}
              onMouseOut={(e) => e.target.style.background = '#ff9800'}
            >
            Reset Scores
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

const NumberGuessing = ({ onGameEnd }) => {
  const [targetNumber, setTargetNumber] = useState(() => Math.floor(Math.random() * 100) + 1);
  const [guess, setGuess] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [message, setMessage] = useState('Guess a number between 1 and 100!');
  const [gameWon, setGameWon] = useState(false);
  const [difficulty, setDifficulty] = useState('normal'); // 'easy', 'normal', 'hard'
  const [hints, setHints] = useState([]);
  const [bestScore, setBestScore] = useState(() => {
    const saved = localStorage.getItem('numberGuessingBestScore');
    return saved ? JSON.parse(saved) : { easy: null, normal: null, hard: null };
  });

  const difficultySettings = {
    easy: { range: 50, maxAttempts: 10 },
    normal: { range: 100, maxAttempts: 7 },
    hard: { range: 200, maxAttempts: 5 }
  };

  const generateHint = (guess, target) => {
    const diff = Math.abs(guess - target);
    if (diff === 0) return '';

    if (diff <= 5) return 'Very hot!';
    if (diff <= 10) return 'Hot!';
    if (diff <= 20) return 'Warm!';
    if (diff <= 30) return 'Cold!';
    return 'Very cold!';
  };

  const makeGuess = () => {
    const numGuess = parseInt(guess);
    const settings = difficultySettings[difficulty];

    if (isNaN(numGuess) || numGuess < 1 || numGuess > settings.range) {
      setMessage(`Please enter a valid number between 1 and ${settings.range}!`);
      return;
    }

    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    const hint = generateHint(numGuess, targetNumber);
    const newHints = [...hints, { guess: numGuess, hint, attempt: newAttempts }];
    setHints(newHints);

    if (numGuess === targetNumber) {
      setMessage(`Correct! You guessed it in ${newAttempts} attempts!`);
      setGameWon(true);

      // Update best score
      if (!bestScore[difficulty] || newAttempts < bestScore[difficulty]) {
        const newBestScore = { ...bestScore, [difficulty]: newAttempts };
        setBestScore(newBestScore);
        localStorage.setItem('numberGuessingBestScore', JSON.stringify(newBestScore));
      }

      onGameEnd && onGameEnd(`Guessed ${targetNumber} in ${newAttempts} attempts on ${difficulty} mode!`);
    } else if (newAttempts >= settings.maxAttempts) {
      setMessage(`Game over! The number was ${targetNumber}.`);
      setGameWon(true);
      onGameEnd && onGameEnd(`Failed to guess ${targetNumber} within ${settings.maxAttempts} attempts.`);
    } else {
      const direction = numGuess < targetNumber ? 'higher' : 'lower';
      setMessage(`${hint} Try ${direction}! (${newAttempts}/${settings.maxAttempts} attempts)`);
    }

    setGuess('');
  };

  const newGame = () => {
    const settings = difficultySettings[difficulty];
    const newTarget = Math.floor(Math.random() * settings.range) + 1;
    setTargetNumber(newTarget);
    setGuess('');
    setAttempts(0);
    setMessage(`Guess a number between 1 and ${settings.range}!`);
    setGameWon(false);
    setHints([]);
  };

  const changeDifficulty = (newDifficulty) => {
    setDifficulty(newDifficulty);
    const settings = difficultySettings[newDifficulty];
    const newTarget = Math.floor(Math.random() * settings.range) + 1;
    setTargetNumber(newTarget);
    setGuess('');
    setAttempts(0);
    setMessage(`Guess a number between 1 and ${settings.range}!`);
    setGameWon(false);
    setHints([]);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !gameWon) {
      makeGuess();
    }
  };

  const settings = difficultySettings[difficulty];

  return (
    <div style={{ textAlign: 'center', padding: '16px' }}>
      <h3>Number Guessing Challenge</h3>

      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
        {Object.keys(difficultySettings).map(diff => (
          <button
            key={diff}
            onClick={() => changeDifficulty(diff)}
            style={{
              padding: '6px 12px',
              background: difficulty === diff ? '#2196f3' : '#e0e0e0',
              color: difficulty === diff ? 'white' : '#333',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 'bold',
              textTransform: 'capitalize'
            }}
          >
            {diff} (1-{difficultySettings[diff].range})
          </button>
        ))}
      </div>

      <div style={{ marginBottom: '12px', fontSize: '14px', color: '#666' }}>
        Best Score: {bestScore[difficulty] ? `${bestScore[difficulty]} attempts` : 'None yet'}
      </div>

      <div style={{ marginBottom: '16px', fontSize: '16px', minHeight: '40px', padding: '8px', background: '#f9f9f9', borderRadius: '6px' }}>
        {message}
      </div>

      {!gameWon && (
        <div style={{ marginBottom: '16px' }}>
          <input
            type="number"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Enter number (1-${settings.range})`}
            min="1"
            max={settings.range}
            style={{
              padding: '10px',
              fontSize: '16px',
              width: '200px',
              marginRight: '8px',
              border: '2px solid #ddd',
              borderRadius: '6px',
              textAlign: 'center'
            }}
          />
          <button
            onClick={makeGuess}
            style={{
              padding: '10px 20px',
              background: '#4caf50',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => e.target.style.background = '#45a049'}
            onMouseOut={(e) => e.target.style.background = '#4caf50'}
          >
            Guess
          </button>
        </div>
      )}

      <div style={{ marginBottom: '16px', fontSize: '14px', color: '#666' }}>
        Attempts: {attempts}/{settings.maxAttempts}
      </div>

      {hints.length > 0 && (
        <div style={{ marginBottom: '16px', maxHeight: '120px', overflowY: 'auto', background: '#f5f5f5', borderRadius: '6px', padding: '8px' }}>
          <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', color: '#666' }}>Previous Guesses:</div>
          {hints.slice(-5).map((hint, index) => (
            <div key={index} style={{ fontSize: '12px', marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
              <span>#{hint.attempt}: {hint.guess}</span>
              <span>{hint.hint}</span>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
        <button
          onClick={newGame}
          style={{
            padding: '8px 16px',
            background: gameWon ? '#4caf50' : '#ff9800',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => e.target.style.background = gameWon ? '#45a049' : '#f57c00'}
          onMouseOut={(e) => e.target.style.background = gameWon ? '#4caf50' : '#ff9800'}
        >
          {gameWon ? 'New Game' : 'Reset'}
        </button>
      </div>
    </div>
  );
};

const WordGuessing = ({ onGameEnd }) => {
  const words = [
    'javascript', 'react', 'computer', 'programming', 'algorithm',
    'database', 'network', 'security', 'interface', 'function',
    'variable', 'boolean', 'string', 'array', 'object',
    'framework', 'library', 'component', 'element', 'attribute'
  ];

  const [currentWord, setCurrentWord] = useState(words[Math.floor(Math.random() * words.length)]);
  const [guessedLetters, setGuessedLetters] = useState(new Set());
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [gameStatus, setGameStatus] = useState('playing'); // 'playing', 'won', 'lost'
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [hintUsed, setHintUsed] = useState(false);
  const maxWrongGuesses = 6;

  const displayWord = currentWord.split('').map(letter =>
    guessedLetters.has(letter.toLowerCase()) ? letter : '_'
  ).join(' ');

  const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
  const remainingLetters = alphabet.filter(letter => !guessedLetters.has(letter));

  const calculateScore = (word, wrongGuesses, hintUsed) => {
    const baseScore = word.length * 10;
    const wrongPenalty = wrongGuesses * 5;
    const hintPenalty = hintUsed ? 10 : 0;
    return Math.max(baseScore - wrongPenalty - hintPenalty, 0);
  };

  const guessLetter = (letter) => {
    if (gameStatus !== 'playing' || guessedLetters.has(letter)) return;

    const newGuessedLetters = new Set(guessedLetters);
    newGuessedLetters.add(letter);
    setGuessedLetters(newGuessedLetters);

    if (!currentWord.toLowerCase().includes(letter)) {
      const newWrongGuesses = wrongGuesses + 1;
      setWrongGuesses(newWrongGuesses);

      if (newWrongGuesses >= maxWrongGuesses) {
        setGameStatus('lost');
        setStreak(0);
        onGameEnd && onGameEnd(`Game over! The word was: ${currentWord}`);
      }
    } else {
      // Check if won
      const isWon = currentWord.split('').every(char =>
        newGuessedLetters.has(char.toLowerCase())
      );
      if (isWon) {
        setGameStatus('won');
        const gameScore = calculateScore(currentWord, wrongGuesses, hintUsed);
        setScore(prev => prev + gameScore);
        setStreak(prev => prev + 1);
        onGameEnd && onGameEnd(`Congratulations! You guessed: ${currentWord} (+${gameScore} points)`);
      }
    }
  };

  const useHint = () => {
    if (hintUsed || gameStatus !== 'playing') return;

    // Reveal a random unguessed letter
    const unguessedLetters = currentWord.split('').filter(letter =>
      !guessedLetters.has(letter.toLowerCase())
    );

    if (unguessedLetters.length > 0) {
      const randomLetter = unguessedLetters[Math.floor(Math.random() * unguessedLetters.length)];
      guessLetter(randomLetter.toLowerCase());
      setHintUsed(true);
    }
  };

  const newGame = () => {
    const newWord = words[Math.floor(Math.random() * words.length)];
    setCurrentWord(newWord);
    setGuessedLetters(new Set());
    setWrongGuesses(0);
    setGameStatus('playing');
    setHintUsed(false);
  };

  const resetScore = () => {
    setScore(0);
    setStreak(0);
  };

  const hangmanStages = [
    '', // 0 wrong guesses
    'O', // 1
    'O\n│', // 2
    'O\n┌│', // 3
    'O\n┌│┐', // 4
    'O\n┌│┐\n│', // 5
    'O\n┌│┐\n│\n┴' // 6
  ];

  const getHangmanColor = () => {
    if (wrongGuesses >= 5) return '#f44336';
    if (wrongGuesses >= 3) return '#ff9800';
    return '#4caf50';
  };

  return (
    <div style={{ textAlign: 'center', padding: '16px' }}>
      <h3>Advanced Hangman</h3>

      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center', gap: '20px', fontSize: '16px' }}>
        <div style={{ color: '#2196f3' }}>Score: {score}</div>
        <div style={{ color: '#ff9800' }}>
          {streak > 0 && `Streak: ${streak}`}
        </div>
        <div style={{ color: '#666' }}>Wrong: {wrongGuesses}/{maxWrongGuesses}</div>
      </div>

      <div style={{
        marginBottom: '16px',
        fontSize: '28px',
        fontFamily: 'monospace',
        letterSpacing: '6px',
        fontWeight: 'bold',
        color: gameStatus === 'won' ? '#4caf50' : gameStatus === 'lost' ? '#f44336' : '#333'
      }}>
        {displayWord}
      </div>

      <div style={{
        marginBottom: '16px',
        fontFamily: 'monospace',
        whiteSpace: 'pre',
        fontSize: '20px',
        color: getHangmanColor(),
        background: '#f9f9f9',
        padding: '12px',
        borderRadius: '8px',
        border: `2px solid ${getHangmanColor()}`,
        display: 'inline-block',
        minHeight: '120px',
        lineHeight: '1.2'
      }}>
        {hangmanStages[wrongGuesses]}
      </div>

      {gameStatus === 'playing' && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ marginBottom: '12px' }}>
            <button
              onClick={useHint}
              disabled={hintUsed}
              style={{
                padding: '6px 12px',
                background: hintUsed ? '#ccc' : '#ff9800',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: hintUsed ? 'not-allowed' : 'pointer',
                fontSize: '12px',
                marginRight: '8px'
              }}
            >
              Hint {hintUsed ? '(Used)' : '(-10pts)'}
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '4px', maxWidth: '300px', margin: '0 auto' }}>
            {remainingLetters.map(letter => (
              <button
                key={letter}
                onClick={() => guessLetter(letter)}
                style={{
                  padding: '8px',
                  background: '#2196f3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  transition: 'all 0.2s ease',
                  minWidth: '40px'
                }}
                onMouseOver={(e) => e.target.style.background = '#1976d2'}
                onMouseOut={(e) => e.target.style.background = '#2196f3'}
              >
                {letter.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      )}

      {gameStatus === 'won' && (
        <div style={{
          marginBottom: '16px',
          color: '#4caf50',
          fontSize: '18px',
          fontWeight: 'bold',
          padding: '12px',
          background: '#e8f5e8',
          borderRadius: '8px'
        }}>
          Congratulations! You saved the hangman!
          <br />
          <span style={{ fontSize: '14px', color: '#666' }}>
            +{calculateScore(currentWord, wrongGuesses, hintUsed)} points
          </span>
        </div>
      )}

      {gameStatus === 'lost' && (
        <div style={{
          marginBottom: '16px',
          color: '#f44336',
          fontSize: '18px',
          fontWeight: 'bold',
          padding: '12px',
          background: '#ffebee',
          borderRadius: '8px'
        }}>
          Game Over! The word was: <span style={{ fontFamily: 'monospace', fontSize: '20px' }}>{currentWord}</span>
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
        <button
          onClick={newGame}
          style={{
            padding: '10px 20px',
            background: '#4caf50',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => e.target.style.background = '#45a049'}
          onMouseOut={(e) => e.target.style.background = '#4caf50'}
        >
           New Word
        </button>
        <button
          onClick={resetScore}
          style={{
            padding: '10px 20px',
            background: '#ff9800',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => e.target.style.background = '#f57c00'}
          onMouseOut={(e) => e.target.style.background = '#ff9800'}
        >
          Reset Score
        </button>
      </div>
    </div>
  );
};

// Simple Canvas-based Infinite Runner (Chrome dino-style)
const InfiniteRunner = ({ onGameEnd }) => {
  const canvasRef = useRef(null);
  const [running, setRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(() => {
    try { return parseInt(localStorage.getItem('infiniteRunnerBest') || '0', 10); } catch { return 0; }
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf = null;
    const DPR = window.devicePixelRatio || 1;
    const width = 600;
    const height = 150;
    canvas.width = width * DPR;
    canvas.height = height * DPR;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.scale(DPR, DPR);

    // Game state
    let player = { x: 40, y: height - 40, vy: 0, w: 20, h: 30, grounded: true };
    const gravity = 0.9;
    const jumpVel = -14;
    let obstacles = [];
    let speed = 4;
    let tick = 0;
    let localScore = 0;

    const spawnObstacle = () => {
      const size = 20 + Math.random() * 20;
      obstacles.push({ x: width + 10, y: height - size - 10, w: size, h: size });
    };

    const reset = () => {
      player = { x: 40, y: height - 40, vy: 0, w: 20, h: 30, grounded: true };
      obstacles = [];
      speed = 4;
      tick = 0;
      localScore = 0;
      setScore(0);
    };

    const step = () => {
      tick++;
      // spawn obstacles occasionally
      if (tick % Math.max(60 - Math.floor(localScore / 10), 30) === 0) spawnObstacle();
      // update player
      player.vy += gravity * 0.6;
      player.y += player.vy;
      if (player.y >= height - player.h - 10) {
        player.y = height - player.h - 10;
        player.vy = 0;
        player.grounded = true;
      } else {
        player.grounded = false;
      }
      // update obstacles
      obstacles.forEach(o => { o.x -= speed; });
      // remove offscreen
      obstacles = obstacles.filter(o => o.x + o.w > -10);
      // collision
      for (let o of obstacles) {
        if (player.x < o.x + o.w && player.x + player.w > o.x && player.y < o.y + o.h && player.y + player.h > o.y) {
          // hit
          setRunning(false);
          if (localScore > best) {
            setBest(localScore);
            try { localStorage.setItem('infiniteRunnerBest', String(localScore)); } catch (e) {}
          }
          onGameEnd && onGameEnd(`Runner score: ${localScore}`);
          return; // stop updating further
        }
      }
      // increase difficulty
      if (tick % 300 === 0) speed += 0.5;
      // scoring
      localScore += 0.1;
      setScore(Math.floor(localScore));

      // draw
      ctx.clearRect(0, 0, width, height);
      // ground
      ctx.fillStyle = '#f4f4f4';
      ctx.fillRect(0, height - 10, width, 10);
      // player
      ctx.fillStyle = '#333';
      ctx.fillRect(player.x, player.y, player.w, player.h);
      // obstacles
      ctx.fillStyle = '#555';
      obstacles.forEach(o => ctx.fillRect(o.x, o.y, o.w, o.h));
      // score
      ctx.fillStyle = '#222';
      ctx.font = '14px sans-serif';
      ctx.fillText('Score: ' + Math.floor(localScore), width - 120, 20);
      ctx.fillText('Best: ' + best, width - 120, 40);

      raf = requestAnimationFrame(step);
    };

    if (running) raf = requestAnimationFrame(step);

    const handleKey = (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        if (!running) {
          setRunning(true);
          reset();
          requestAnimationFrame(step);
        }
        if (player.grounded) player.vy = jumpVel;
      }
    };

    const handleTouch = (e) => {
      if (!running) {
        setRunning(true);
        reset();
        requestAnimationFrame(step);
      }
      if (player.grounded) player.vy = jumpVel;
    };

    window.addEventListener('keydown', handleKey);
    canvas.addEventListener('touchstart', handleTouch);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('keydown', handleKey);
      canvas.removeEventListener('touchstart', handleTouch);
    };
  }, [running, best, onGameEnd]);

  return (
    <div style={{ textAlign: 'center', padding: '12px' }}>
      <h3>Infinite Runner</h3>
      <div style={{ marginBottom: 8 }}>Press <strong>Space</strong> or tap to jump. Avoid obstacles.</div>
      <canvas ref={canvasRef} style={{ width: '100%', maxWidth: 600, background: '#fff', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }} />
      <div style={{ marginTop: 12, display: 'flex', justifyContent: 'center', gap: 8 }}>
        <button onClick={() => { setRunning(true); }} style={{ padding: '8px 12px', background: '#9c27b0', color: 'white', border: 'none', borderRadius: 6 }}>Start</button>
        <button onClick={() => { setRunning(false); }} style={{ padding: '8px 12px', background: '#f44336', color: 'white', border: 'none', borderRadius: 6 }}>Stop</button>
      </div>
      <div style={{ marginTop: 8 }}>Score: {score} • Best: {best}</div>
    </div>
  );
};

export { TicTacToe, RockPaperScissors, NumberGuessing, WordGuessing, InfiniteRunner };

// Add global styles for animations
const style = document.createElement('style');
style.textContent = `
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
  }

  @keyframes bounce {
    0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
    40% { transform: translateY(-10px); }
    60% { transform: translateY(-5px); }
  }

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
    20%, 40%, 60%, 80% { transform: translateX(5px); }
  }

  @keyframes glow {
    0% { box-shadow: 0 0 5px rgba(76, 175, 80, 0.5); }
    50% { box-shadow: 0 0 20px rgba(76, 175, 80, 0.8); }
    100% { box-shadow: 0 0 5px rgba(76, 175, 80, 0.5); }
  }

  .game-button-hover:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  }

  .winning-square {
    animation: glow 1s infinite;
  }

  .countdown-animation {
    animation: bounce 0.5s infinite;
  }
`;
document.head.appendChild(style);