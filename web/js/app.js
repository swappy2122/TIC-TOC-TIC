/**
 * TIC-TAC-TOE | Web Application
 * Day 1: Foundation & Design System
 * 
 * Entry point for the web application.
 * Initializes DOM references, state management, and event listeners.
 */

// ========== DOM REFERENCES ==========
const app = document.getElementById('app');
const gameBoard = document.getElementById('gameBoard');
const gameStatus = document.getElementById('gameStatus');
const appHeader = document.querySelector('.app-header');
const appTitle = document.querySelector('.app-title');

// ========== APPLICATION STATE ==========
const appState = {
  gameActive: false,
  currentPlayer: 'X', // Human player
  aiPlayer: 'O',      // AI opponent
  board: [null, null, null, null, null, null, null, null, null],
  gameHistory: [],
  statistics: {
    wins: 0,
    losses: 0,
    draws: 0,
  },
};

// ========== INITIALIZATION ==========
/**
 * Initialize the application
 * Set up DOM elements, event listeners, and initial state
 */
function initializeApp() {
  console.log('[App] Initializing Tic-Tac-Toe Web Application');
  
  // Log design system tokens
  logDesignTokens();
  
  // Set up game board UI (placeholder for game cells)
  renderGameBoard();
  
  // Initialize status display
  updateGameStatus('Ready to play!');
  
  // Set up event listeners
  attachEventListeners();
  
  console.log('[App] Application initialized successfully');
}

/**
 * Render the game board grid
 * Creates 9 cell elements for the 3x3 board
 */
function renderGameBoard() {
  gameBoard.innerHTML = ''; // Clear existing content
  
  // Create 9 cells
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement('div');
    cell.className = 'game-cell';
    cell.dataset.index = i;
    cell.setAttribute('role', 'button');
    cell.setAttribute('tabindex', '0');
    cell.setAttribute('aria-label', `Cell ${i + 1}`);
    
    gameBoard.appendChild(cell);
  }
  
  console.log('[Board] Game board rendered with 9 cells');
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

/**
 * Attach event listeners to interactive elements
 */
function attachEventListeners() {
  // Game cell click listeners
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
  
  console.log(`[Game] Cell ${index} clicked`);
  // Game logic will be implemented later
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

// ========== APPLICATION START ==========
document.addEventListener('DOMContentLoaded', initializeApp);

// Export state for debugging (optional)
window.appState = appState;
window.updateGameStatus = updateGameStatus;
