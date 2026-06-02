/**
 * TIC-TAC-TOE | Web Application
 * Day 2: Interactive Game Board
 * 
 * Implements interactive 3×3 game board with turn tracking,
 * cell placement, and two-player local mode.
 */

// ========== DOM REFERENCES ==========
const app = document.getElementById('app');
const gameBoard = document.getElementById('gameBoard');
const gameStatus = document.getElementById('gameStatus');
const appHeader = document.querySelector('.app-header');
const appTitle = document.querySelector('.app-title');

// ========== APPLICATION STATE ==========
const appState = {
  gameActive: true,
  currentPlayer: 'X', // Starts with X
  board: [null, null, null, null, null, null, null, null, null],
  gameOver: false,
  winner: null,
  gameHistory: [],
  statistics: {
    xWins: 0,
    oWins: 0,
    draws: 0,
  },
};

// ========== GAME LOGIC ==========
/**
 * Check if the board is full (draw condition)
 */
function isBoardFull() {
  return appState.board.every(cell => cell !== null);
}

/**
 * Check for winner
 * @returns {string|null} - 'X', 'O', or null if no winner
 */
function checkWinner() {
  const winPatterns = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6],             // Diagonals
  ];

  for (const pattern of winPatterns) {
    const [a, b, c] = pattern;
    if (
      appState.board[a] &&
      appState.board[a] === appState.board[b] &&
      appState.board[a] === appState.board[c]
    ) {
      return appState.board[a];
    }
  }
  return null;
}

/**
 * Switch the current player
 */
function switchPlayer() {
  appState.currentPlayer = appState.currentPlayer === 'X' ? 'O' : 'X';
}

/**
 * Make a move on the board
 * @param {number} index - Cell index (0-8)
 * @returns {boolean} - True if move was valid, false otherwise
 */
function makeMove(index) {
  // Check if move is valid
  if (appState.board[index] !== null || appState.gameOver) {
    return false;
  }

  // Place the current player's symbol
  appState.board[index] = appState.currentPlayer;
  console.log(`[Game] ${appState.currentPlayer} placed at cell ${index}`);

  // Check for winner
  const winner = checkWinner();
  if (winner) {
    appState.gameOver = true;
    appState.winner = winner;
    appState.statistics[winner === 'X' ? 'xWins' : 'oWins']++;
    updateGameStatus(`🎉 Player ${winner} wins!`);
    console.log(`[Game] Player ${winner} wins!`);
    return true;
  }

  // Check for draw
  if (isBoardFull()) {
    appState.gameOver = true;
    appState.statistics.draws++;
    updateGameStatus('🤝 It\'s a draw!');
    console.log('[Game] Draw!');
    return true;
  }

  // Switch player
  switchPlayer();
  updateGameStatus(`Player ${appState.currentPlayer}'s turn`);
  updateBoardGlow();
  return true;
}

/**
 * Reset the game board
 */
function resetGame() {
  appState.board = [null, null, null, null, null, null, null, null, null];
  appState.currentPlayer = 'X';
  appState.gameOver = false;
  appState.winner = null;
  renderGameBoard();
  attachEventListeners();
  updateBoardGlow();
  updateGameStatus(`Player ${appState.currentPlayer}'s turn`);
  console.log('[Game] Game reset');
}

// ========== UI UPDATES ==========
/**
 * Update board cell glow based on whose turn it is
 */
function updateBoardGlow() {
  const cells = document.querySelectorAll('.game-cell');
  cells.forEach(cell => {
    cell.classList.remove('player-x-turn', 'player-o-turn');
    if (!appState.gameOver && cell.textContent === '') {
      const turnClass = appState.currentPlayer === 'X' ? 'player-x-turn' : 'player-o-turn';
      cell.classList.add(turnClass);
    }
  });
}

/**
 * Render the game board grid with current state
 */
function renderGameBoard() {
  gameBoard.innerHTML = ''; // Clear existing content

  // Create 9 cells based on board state
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement('div');
    cell.className = 'game-cell';
    cell.dataset.index = i;
    cell.setAttribute('role', 'button');
    cell.setAttribute('tabindex', '0');
    cell.setAttribute('aria-label', `Cell ${i + 1}`);

    // Add X or O class if cell is occupied
    if (appState.board[i] === 'X') {
      cell.classList.add('x', 'active');
    } else if (appState.board[i] === 'O') {
      cell.classList.add('o', 'active');
    }

    gameBoard.appendChild(cell);
  }

  console.log('[Board] Game board rendered with current state');
}

/**
 * Update game status display
 * @param {string} message - Status message to display
 */
function updateGameStatus(message) {
  const statusText = gameStatus.querySelector('.status-text') || 
                     document.createElement('p');
  statusText.className = 'status-text';
  statusText.textContent = message;

  if (!statusText.parentElement) {
    gameStatus.appendChild(statusText);
  }

  console.log(`[Status] ${message}`);
}

// ========== EVENT HANDLERS ==========
/**
 * Attach event listeners to interactive elements
 */
function attachEventListeners() {
  const cells = document.querySelectorAll('.game-cell');
  cells.forEach((cell) => {
    cell.addEventListener('click', handleCellClick);
    cell.addEventListener('keydown', handleCellKeydown);
  });

  console.log('[Events] Event listeners attached');
}

/**
 * Handle cell click events
 * @param {Event} event - Click event
 */
function handleCellClick(event) {
  const cell = event.currentTarget;
  const index = parseInt(cell.dataset.index, 10);

  if (makeMove(index)) {
    // Update the cell with the new symbol
    if (appState.board[index] === 'X') {
      cell.classList.add('x', 'active');
    } else if (appState.board[index] === 'O') {
      cell.classList.add('o', 'active');
    }
  }
}

/**
 * Handle cell keyboard events (Enter, Space)
 * @param {KeyboardEvent} event - Keyboard event
 */
function handleCellKeydown(event) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    event.currentTarget.click();
  }
}

/**
 * Log design system tokens to console for verification
 */
function logDesignTokens() {
  const root = document.documentElement;
  const computedStyle = getComputedStyle(root);

  console.group('[Design System] Tokens Loaded');
  console.log('Primary Background:', computedStyle.getPropertyValue('--bg-primary').trim());
  console.log('Accent X (Cyan):', computedStyle.getPropertyValue('--accent-x').trim());
  console.log('Accent O (Pink):', computedStyle.getPropertyValue('--accent-o').trim());
  console.log('Display Font:', computedStyle.getPropertyValue('--font-display').trim());
  console.log('Body Font:', computedStyle.getPropertyValue('--font-body').trim());
  console.groupEnd();
}

// ========== INITIALIZATION ==========
/**
 * Initialize the application
 */
function initializeApp() {
  console.log('[App] Initializing Tic-Tac-Toe Web Application');

  // Log design system tokens
  logDesignTokens();

  // Set up game board UI
  renderGameBoard();

  // Apply turn-based glow
  updateBoardGlow();

  // Initialize status display
  updateGameStatus(`Player ${appState.currentPlayer}'s turn`);

  // Set up event listeners
  attachEventListeners();

  console.log('[App] Application initialized successfully');
}

// ========== APPLICATION START ==========
document.addEventListener('DOMContentLoaded', initializeApp);

// Export state and functions for debugging
window.appState = appState;
window.updateGameStatus = updateGameStatus;
window.resetGame = resetGame;
window.makeMove = makeMove;
