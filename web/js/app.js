/**
 * TIC-TAC-TOE | Web Application
 * Day 4: Start Menu with Mode & Symbol Selection
 * 
 * Manages menu screen, game modes, and transitions.
 */

// ========== DOM REFERENCES ==========
// Screens
const startScreen = document.getElementById('startScreen');
const gameScreen = document.getElementById('gameScreen');

// Menu Elements
const modeSection = document.getElementById('modeSection');
const symbolSection = document.getElementById('symbolSection');
const playButtonContainer = document.getElementById('playButtonContainer');
const modeCards = document.querySelectorAll('.mode-card');
const symbolButtons = document.querySelectorAll('.symbol-button');
const playButton = document.getElementById('playButton');
const gameSubtitle = document.getElementById('gameSubtitle');

// Game Elements
const gameBoard = document.getElementById('gameBoard');
const gameStatus = document.getElementById('gameStatus');
const resetButton = document.getElementById('resetButton');

// ========== APPLICATION STATE ==========
const gameEngine = new GameEngine();
const appState = {
  gameMode: null, // 'ai' or 'human'
  playerSymbol: null, // 1 (X) or -1 (O)
  statistics: {
    xWins: 0,
    oWins: 0,
    draws: 0,
  },
  animating: false,
};

// ========== MENU MANAGEMENT ==========
/**
 * Handle mode card selection
 */
function handleModeSelect(event) {
  const mode = event.currentTarget.dataset.mode;
  
  // Remove previous selection
  modeCards.forEach(card => card.classList.remove('selected'));
  
  // Mark selected
  event.currentTarget.classList.add('selected');
  appState.gameMode = mode;
  
  console.log(`[Menu] Mode selected: ${mode}`);
  
  // Show symbol section
  setTimeout(() => {
    symbolSection.style.display = 'block';
  }, 200);
}

/**
 * Handle symbol selection
 */
function handleSymbolSelect(event) {
  const symbol = parseInt(event.currentTarget.dataset.symbol, 10);
  
  // Remove previous selection
  symbolButtons.forEach(btn => btn.classList.remove('selected'));
  
  // Mark selected
  event.currentTarget.classList.add('selected');
  appState.playerSymbol = symbol;
  
  console.log(`[Menu] Symbol selected: ${symbol === 1 ? 'X' : 'O'}`);
  
  // Show play button
  setTimeout(() => {
    playButtonContainer.style.display = 'block';
  }, 200);
}

/**
 * Start the game from menu
 */
function startGame() {
  if (!appState.gameMode || appState.playerSymbol === null) {
    console.warn('[Menu] Game mode or symbol not selected');
    return;
  }
  
  console.log('[Menu] Starting game...');
  
  // Transition from menu to game
  startScreen.classList.add('screen-exit');
  startScreen.classList.remove('screen-active');
  
  setTimeout(() => {
    gameScreen.classList.add('screen-active');
    
    // Initialize game
    gameEngine.reset();
    renderGameBoard();
    attachEventListeners();
    updateGameStatus(`Player X's turn`);
    
    // Update subtitle based on mode
    gameSubtitle.textContent = appState.gameMode === 'ai' ? 'vs AI' : 'vs Human';
    
    console.log('[Game] Game initialized');
  }, 200);
}

/**
 * Reset game to return to menu
 */
function returnToMenu() {
  console.log('[Game] Returning to menu...');
  
  // Reset states
  appState.gameMode = null;
  appState.playerSymbol = null;
  gameEngine.reset();
  appState.animating = false;
  
  // Reset menu UI
  modeCards.forEach(card => card.classList.remove('selected'));
  symbolButtons.forEach(btn => btn.classList.remove('selected'));
  symbolSection.style.display = 'none';
  playButtonContainer.style.display = 'none';
  
  // Transition back to menu
  gameScreen.classList.remove('screen-active');
  startScreen.classList.remove('screen-exit');
  startScreen.classList.add('screen-active');
}

// ========== MENU INITIALIZATION ==========
/**
 * Initialize menu system
 */
function initializeMenu() {
  // Mode card listeners
  modeCards.forEach(card => {
    card.addEventListener('click', handleModeSelect);
  });
  
  // Symbol button listeners
  symbolButtons.forEach(btn => {
    btn.addEventListener('click', handleSymbolSelect);
  });
  
  // Play button listener
  playButton.addEventListener('click', startGame);
  
  console.log('[Menu] Menu initialized');
}

// ========== GAME RENDERING ==========
/**
 * Render the game board based on engine state
 */
function renderGameBoard() {
  gameBoard.innerHTML = '';
  gameBoard.classList.remove('game-over');

  const state = gameEngine.getState();

  // Create 9 cells
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement('div');
    cell.className = 'game-cell';
    cell.dataset.index = i;
    cell.setAttribute('role', 'button');
    cell.setAttribute('tabindex', '0');
    cell.setAttribute('aria-label', `Cell ${i + 1}`);

    // Add symbol if occupied
    const symbol = state.board[i];
    if (symbol === 1) {
      cell.classList.add('x', 'active');
    } else if (symbol === -1) {
      cell.classList.add('o', 'active');
    }

    gameBoard.appendChild(cell);
  }

  // Update turn-based glow for available cells
  updateBoardGlow();

  console.log('[Render] Board updated');
}

/**
 * Update board cell glow based on current player
 */
function updateBoardGlow() {
  if (gameEngine.gameOver) return;

  const cells = document.querySelectorAll('.game-cell');
  const playerClass = gameEngine.currentPlayer === 1 ? 'player-x-turn' : 'player-o-turn';

  cells.forEach(cell => {
    cell.classList.remove('player-x-turn', 'player-o-turn');
    if (!cell.classList.contains('active')) {
      cell.classList.add(playerClass);
    }
  });
}

/**
 * Highlight winning cells and draw winning line
 */
function celebrateWin() {
  const winningCombo = gameEngine.getWinningCombo();
  if (!winningCombo) return;

  const cells = document.querySelectorAll('.game-cell');
  const winnerSymbol = gameEngine.winner === 1 ? 'X' : 'O';

  // Add win class to winning cells
  winningCombo.forEach(index => {
    cells[index].classList.add('win');
  });

  // Draw winning line
  drawWinningLine(winningCombo);

  // Trigger confetti
  triggerConfetti(winnerSymbol);

  // Update status with celebration
  const winnerName = gameEngine.winner === 1 ? 'X' : 'O';
  updateGameStatus(`🎉 Player ${winnerName} wins!`, 'victory');

  console.log('[Celebration] Win animated');
}

/**
 * Celebrate draw
 */
function celebrateDraw() {
  updateGameStatus('🤝 It\'s a draw!', 'draw');
  triggerConfetti('draw');
  console.log('[Celebration] Draw animated');
}

/**
 * Draw an animated line across winning combination
 * @param {number[]} combo - Indices of winning cells
 */
function drawWinningLine(combo) {
  const [a, b, c] = combo;
  const line = document.createElement('div');
  line.className = 'winning-line';

  // Determine line orientation
  if ((a === 0 && b === 1 && c === 2) || (a === 3 && b === 4 && c === 5) || (a === 6 && b === 7 && c === 8)) {
    line.classList.add('horizontal');
  }
  else if ((a === 0 && b === 3 && c === 6) || (a === 1 && b === 4 && c === 7) || (a === 2 && b === 5 && c === 8)) {
    line.classList.add('vertical');
  }
  else if (a === 0 && b === 4 && c === 8) {
    line.classList.add('diagonal-tlbr');
  }
  else if (a === 2 && b === 4 && c === 6) {
    line.classList.add('diagonal-trbl');
  }

  gameBoard.appendChild(line);
}

/**
 * Trigger confetti animation
 * @param {string} type - 'X', 'O', or 'draw'
 */
function triggerConfetti(type) {
  const colors = type === 'X' ? ['cyan'] : type === 'O' ? ['pink'] : ['cyan', 'pink', 'green'];
  const count = 30;

  for (let i = 0; i < count; i++) {
    const confetti = document.createElement('div');
    confetti.className = `confetti ${colors[i % colors.length]}`;

    const x = Math.random() * window.innerWidth;
    const y = Math.random() * window.innerHeight - window.innerHeight;
    const tx = (Math.random() - 0.5) * 200;

    confetti.style.left = x + 'px';
    confetti.style.top = y + 'px';
    confetti.style.setProperty('--tx', tx + 'px');

    document.body.appendChild(confetti);

    setTimeout(() => confetti.remove(), 2000);
  }
}

/**
 * Update game status display
 * @param {string} message - Status message
 * @param {string} type - 'victory', 'draw', or null
 */
function updateGameStatus(message, type = null) {
  const statusText = gameStatus.querySelector('.status-text') || 
                     document.createElement('p');
  statusText.className = 'status-text';
  if (type) statusText.classList.add(type);
  statusText.textContent = message;

  if (!statusText.parentElement) {
    gameStatus.appendChild(statusText);
  }

  console.log(`[Status] ${message}`);
}

/**
 * Handle invalid move with shake animation
 * @param {number} index - Cell index
 */
function handleInvalidMove(index) {
  const cell = document.querySelector(`[data-index="${index}"]`);
  cell.classList.add('shake');

  setTimeout(() => {
    cell.classList.remove('shake');
  }, 400);

  console.log('[Game] Invalid move attempted');
}

// ========== GAME MANAGEMENT ==========
/**
 * Make a move and update UI
 * @param {number} index - Cell index
 */
function playMove(index) {
  if (appState.animating || gameEngine.gameOver) return;

  const success = gameEngine.makeMove(index);

  if (!success) {
    handleInvalidMove(index);
    return;
  }

  // Update board display
  const cells = document.querySelectorAll('.game-cell');
  const symbol = gameEngine.board[index];
  if (symbol === 1) {
    cells[index].classList.add('x', 'active');
  } else if (symbol === -1) {
    cells[index].classList.add('o', 'active');
  }

  // Check game state
  if (gameEngine.gameOver) {
    gameBoard.classList.add('game-over');
    appState.animating = true;

    setTimeout(() => {
      if (gameEngine.winner === null) {
        appState.statistics.draws++;
        celebrateDraw();
      } else {
        if (gameEngine.winner === 1) {
          appState.statistics.xWins++;
        } else {
          appState.statistics.oWins++;
        }
        celebrateWin();
      }
      appState.animating = false;
    }, 100);

    console.log(`[Game] Game over. Winner: ${gameEngine.winner}`);
  } else {
    // Continue playing
    updateBoardGlow();
    updateGameStatus(`Player ${gameEngine.currentPlayer === 1 ? 'X' : 'O'}'s turn`);
  }
}

/**
 * Reset game for new round
 */
function resetGame() {
  gameEngine.reset();
  appState.animating = false;
  renderGameBoard();
  updateGameStatus(`Player ${gameEngine.currentPlayer === 1 ? 'X' : 'O'}'s turn`);
  console.log('[Game] New game started');
}

// ========== EVENT HANDLERS ==========
/**
 * Attach event listeners to game cells
 */
function attachEventListeners() {
  const cells = document.querySelectorAll('.game-cell');
  cells.forEach(cell => {
    cell.addEventListener('click', handleCellClick);
    cell.addEventListener('keydown', handleCellKeydown);
  });
  
  resetButton.addEventListener('click', resetGame);

  console.log('[Events] Game event listeners attached');
}

/**
 * Handle cell click
 * @param {Event} event
 */
function handleCellClick(event) {
  const cell = event.currentTarget;
  const index = parseInt(cell.dataset.index, 10);
  playMove(index);
}

/**
 * Handle cell keyboard interaction
 * @param {KeyboardEvent} event
 */
function handleCellKeydown(event) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    event.currentTarget.click();
  }
}

/**
 * Log design system tokens (for verification)
 */
function logDesignTokens() {
  const root = document.documentElement;
  const computedStyle = getComputedStyle(root);

  console.group('[Design System] Tokens Loaded');
  console.log('Primary Background:', computedStyle.getPropertyValue('--bg-primary').trim());
  console.log('Accent X (Cyan):', computedStyle.getPropertyValue('--accent-x').trim());
  console.log('Accent O (Pink):', computedStyle.getPropertyValue('--accent-o').trim());
  console.log('Win Accent (Green):', computedStyle.getPropertyValue('--accent-win').trim());
  console.groupEnd();
}

// ========== INITIALIZATION ==========
/**
 * Initialize the application
 */
function initializeApp() {
  console.log('[App] Initializing Tic-Tac-Toe Web Application');

  logDesignTokens();
  initializeMenu();

  console.log('[App] Application initialized successfully');
}

// ========== APPLICATION START ==========
document.addEventListener('DOMContentLoaded', initializeApp);

// Export for debugging
window.gameEngine = gameEngine;
window.appState = appState;
window.resetGame = resetGame;
window.playMove = playMove;
window.returnToMenu = returnToMenu;
window.startGame = startGame;

// ========== APPLICATION STATE ==========
const gameEngine = new GameEngine();
const appState = {
  statistics: {
    xWins: 0,
    oWins: 0,
    draws: 0,
  },
  animating: false,
};

// ========== RENDERING ==========
/**
 * Render the game board based on engine state
 */
function renderGameBoard() {
  gameBoard.innerHTML = '';
  gameBoard.classList.remove('game-over');

  const state = gameEngine.getState();

  // Create 9 cells
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement('div');
    cell.className = 'game-cell';
    cell.dataset.index = i;
    cell.setAttribute('role', 'button');
    cell.setAttribute('tabindex', '0');
    cell.setAttribute('aria-label', `Cell ${i + 1}`);

    // Add symbol if occupied
    const symbol = state.board[i];
    if (symbol === 1) {
      cell.classList.add('x', 'active');
    } else if (symbol === -1) {
      cell.classList.add('o', 'active');
    }

    gameBoard.appendChild(cell);
  }

  // Update turn-based glow for available cells
  updateBoardGlow();

  console.log('[Render] Board updated');
}

/**
 * Update board cell glow based on current player
 */
function updateBoardGlow() {
  if (gameEngine.gameOver) return;

  const cells = document.querySelectorAll('.game-cell');
  const playerClass = gameEngine.currentPlayer === 1 ? 'player-x-turn' : 'player-o-turn';

  cells.forEach(cell => {
    cell.classList.remove('player-x-turn', 'player-o-turn');
    if (!cell.classList.contains('active')) {
      cell.classList.add(playerClass);
    }
  });
}

/**
 * Highlight winning cells and draw winning line
 */
function celebrateWin() {
  const winningCombo = gameEngine.getWinningCombo();
  if (!winningCombo) return;

  const cells = document.querySelectorAll('.game-cell');
  const winnerSymbol = gameEngine.winner === 1 ? 'X' : 'O';

  // Add win class to winning cells
  winningCombo.forEach(index => {
    cells[index].classList.add('win');
  });

  // Draw winning line
  drawWinningLine(winningCombo);

  // Trigger confetti
  triggerConfetti(winnerSymbol);

  // Update status with celebration
  const winnerName = gameEngine.winner === 1 ? 'X' : 'O';
  updateGameStatus(`🎉 Player ${winnerName} wins!`, 'victory');

  console.log('[Celebration] Win animated');
}

/**
 * Celebrate draw
 */
function celebrateDraw() {
  updateGameStatus('🤝 It\'s a draw!', 'draw');
  triggerConfetti('draw');
  console.log('[Celebration] Draw animated');
}

/**
 * Draw an animated line across winning combination
 * @param {number[]} combo - Indices of winning cells
 */
function drawWinningLine(combo) {
  const [a, b, c] = combo;
  const line = document.createElement('div');
  line.className = 'winning-line';

  // Determine line orientation
  // Rows: 0-2, 3-5, 6-8
  if ((a === 0 && b === 1 && c === 2) || (a === 3 && b === 4 && c === 5) || (a === 6 && b === 7 && c === 8)) {
    line.classList.add('horizontal');
  }
  // Columns: 0-3-6, 1-4-7, 2-5-8
  else if ((a === 0 && b === 3 && c === 6) || (a === 1 && b === 4 && c === 7) || (a === 2 && b === 5 && c === 8)) {
    line.classList.add('vertical');
  }
  // Diagonal: 0-4-8
  else if (a === 0 && b === 4 && c === 8) {
    line.classList.add('diagonal-tlbr');
  }
  // Diagonal: 2-4-6
  else if (a === 2 && b === 4 && c === 6) {
    line.classList.add('diagonal-trbl');
  }

  gameBoard.appendChild(line);
}

/**
 * Trigger confetti animation
 * @param {string} type - 'X', 'O', or 'draw'
 */
function triggerConfetti(type) {
  const colors = type === 'X' ? ['cyan'] : type === 'O' ? ['pink'] : ['cyan', 'pink', 'green'];
  const count = 30;

  for (let i = 0; i < count; i++) {
    const confetti = document.createElement('div');
    confetti.className = `confetti ${colors[i % colors.length]}`;

    const x = Math.random() * window.innerWidth;
    const y = Math.random() * window.innerHeight - window.innerHeight;
    const tx = (Math.random() - 0.5) * 200;

    confetti.style.left = x + 'px';
    confetti.style.top = y + 'px';
    confetti.style.setProperty('--tx', tx + 'px');

    document.body.appendChild(confetti);

    // Remove after animation
    setTimeout(() => confetti.remove(), 2000);
  }
}

/**
 * Update game status display
 * @param {string} message - Status message
 * @param {string} type - 'victory', 'draw', or null
 */
function updateGameStatus(message, type = null) {
  const statusText = gameStatus.querySelector('.status-text') || 
                     document.createElement('p');
  statusText.className = 'status-text';
  if (type) statusText.classList.add(type);
  statusText.textContent = message;

  if (!statusText.parentElement) {
    gameStatus.appendChild(statusText);
  }

  console.log(`[Status] ${message}`);
}

/**
 * Handle invalid move with shake animation
 * @param {number} index - Cell index
 */
function handleInvalidMove(index) {
  const cell = document.querySelector(`[data-index="${index}"]`);
  cell.classList.add('shake');

  setTimeout(() => {
    cell.classList.remove('shake');
  }, 400);

  console.log('[Game] Invalid move attempted');
}

// ========== GAME MANAGEMENT ==========
/**
 * Make a move and update UI
 * @param {number} index - Cell index
 */
function playMove(index) {
  if (appState.animating || gameEngine.gameOver) return;

  const success = gameEngine.makeMove(index);

  if (!success) {
    handleInvalidMove(index);
    return;
  }

  // Update board display
  const cells = document.querySelectorAll('.game-cell');
  const symbol = gameEngine.board[index];
  if (symbol === 1) {
    cells[index].classList.add('x', 'active');
  } else if (symbol === -1) {
    cells[index].classList.add('o', 'active');
  }

  // Check game state
  if (gameEngine.gameOver) {
    gameBoard.classList.add('game-over');
    appState.animating = true;

    setTimeout(() => {
      if (gameEngine.winner === null) {
        // Draw
        appState.statistics.draws++;
        celebrateDraw();
      } else {
        // Win
        if (gameEngine.winner === 1) {
          appState.statistics.xWins++;
        } else {
          appState.statistics.oWins++;
        }
        celebrateWin();
      }
      appState.animating = false;
    }, 100);

    console.log(`[Game] Game over. Winner: ${gameEngine.winner}`);
  } else {
    // Continue playing
    updateBoardGlow();
    updateGameStatus(`Player ${gameEngine.currentPlayer === 1 ? 'X' : 'O'}'s turn`);
  }
}

/**
 * Reset game to play again
 */
function resetGame() {
  gameEngine.reset();
  appState.animating = false;
  renderGameBoard();
  updateGameStatus(`Player ${gameEngine.currentPlayer === 1 ? 'X' : 'O'}'s turn`);
  console.log('[Game] New game started');
}

// ========== EVENT HANDLERS ==========
/**
 * Attach event listeners to game cells
 */
function attachEventListeners() {
  const cells = document.querySelectorAll('.game-cell');
  cells.forEach(cell => {
    cell.addEventListener('click', handleCellClick);
    cell.addEventListener('keydown', handleCellKeydown);
  });

  console.log('[Events] Event listeners attached');
}

/**
 * Handle cell click
 * @param {Event} event
 */
function handleCellClick(event) {
  const cell = event.currentTarget;
  const index = parseInt(cell.dataset.index, 10);
  playMove(index);
}

/**
 * Handle cell keyboard interaction
 * @param {KeyboardEvent} event
 */
function handleCellKeydown(event) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    event.currentTarget.click();
  }
}

/**
 * Log design system tokens (for verification)
 */
function logDesignTokens() {
  const root = document.documentElement;
  const computedStyle = getComputedStyle(root);

  console.group('[Design System] Tokens Loaded');
  console.log('Primary Background:', computedStyle.getPropertyValue('--bg-primary').trim());
  console.log('Accent X (Cyan):', computedStyle.getPropertyValue('--accent-x').trim());
  console.log('Accent O (Pink):', computedStyle.getPropertyValue('--accent-o').trim());
  console.log('Win Accent (Green):', computedStyle.getPropertyValue('--accent-win').trim());
  console.groupEnd();
}

// ========== INITIALIZATION ==========
/**
 * Initialize the application
 */
function initializeApp() {
  console.log('[App] Initializing Tic-Tac-Toe Web Application');

  logDesignTokens();
  renderGameBoard();
  attachEventListeners();
  updateGameStatus(`Player X's turn`);

  console.log('[App] Application initialized successfully');
}

// ========== APPLICATION START ==========
document.addEventListener('DOMContentLoaded', initializeApp);

// Export for debugging
window.gameEngine = gameEngine;
window.appState = appState;
window.resetGame = resetGame;
window.playMove = playMove;
