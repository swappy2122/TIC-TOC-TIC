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
let qAgent = null; // AI Agent instance

const appState = {
  gameMode: null, // 'ai' or 'human'
  playerSymbol: null, // 1 (X) or -1 (O)
  statistics: {
    aiMode: {
      wins: 0,
      losses: 0,
      draws: 0,
      gamesPlayed: 0,
      streakType: null,
      streakCount: 0,
      history: [],
    },
    humanMode: {
      wins: 0,
      losses: 0,
      draws: 0,
      gamesPlayed: 0,
      streakType: null,
      streakCount: 0,
      history: [],
    },
  },
  movesCount: 0,
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
    
    // Reset move counter
    appState.movesCount = 0;
    document.getElementById('moveCounter').textContent = '0 / 9';
    
    // Display stats and configure labels
    updateStatsUI(false);
    
    // Update subtitle based on mode
    gameSubtitle.textContent = appState.gameMode === 'ai' ? 'vs AI' : 'vs Human';
    
    // Determine who goes first
    if (appState.gameMode === 'ai') {
      if (appState.playerSymbol === -1) {
        // AI is X, goes first
        updateGameStatus(`Player X's turn (AI)`);
        makeAIMove();
      } else {
        // Human is X, goes first
        updateGameStatus(`Player X's turn (You)`);
      }
    } else {
      updateGameStatus(`Player X's turn`);
    }
    
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
 * Handles game termination: updates streaks, history, persists stats, and triggers animations.
 */
function endCurrentGame() {
  gameBoard.classList.add('game-over');
  appState.animating = true;

  const mode = appState.gameMode;
  const stats = mode === 'ai' ? appState.statistics.aiMode : appState.statistics.humanMode;
  const winner = gameEngine.winner;

  // Increment games played
  stats.gamesPlayed++;

  let result = 'draw';
  if (winner !== null) {
    let isHumanWinner = false;
    if (mode === 'ai') {
      isHumanWinner = (winner === appState.playerSymbol);
    } else {
      isHumanWinner = (winner === 1); // Player X
    }

    if (isHumanWinner) {
      stats.wins++;
      result = 'win';
      if (stats.streakType === 'w') {
        stats.streakCount++;
      } else {
        stats.streakType = 'w';
        stats.streakCount = 1;
      }
    } else {
      stats.losses++;
      result = 'loss';
      if (stats.streakType === 'l') {
        stats.streakCount++;
      } else {
        stats.streakType = 'l';
        stats.streakCount = 1;
      }
    }
  } else {
    stats.draws++;
    stats.streakCount = 0; // resets streak
  }

  // Append history (limit to last 10 games)
  stats.history = stats.history || [];
  stats.history.push({
    gameNum: stats.gamesPlayed,
    result: result
  });
  if (stats.history.length > 10) {
    stats.history.shift();
  }

  // Save to localStorage
  saveStats();

  // Show celebration/UI updates
  setTimeout(() => {
    if (winner === null) {
      celebrateDraw();
    } else {
      celebrateWin();
    }
    updateStatsUI(true); // animate count-ups and progress bar
    appState.animating = false;
  }, 100);
}

/**
 * Triggers the AI to calculate and play a move
 */
function makeAIMove() {
  if (gameEngine.gameOver || appState.animating) return;

  const state = gameEngine.getState();
  if (state.currentPlayer === appState.playerSymbol) {
    return;
  }

  appState.animating = true;
  updateGameStatus('🤖 AI is thinking...', 'thinking');

  const delay = Math.floor(Math.random() * 300) + 300;

  setTimeout(() => {
    if (gameEngine.gameOver) {
      appState.animating = false;
      return;
    }

    const availableActions = gameEngine.getAvailableActions();
    if (availableActions.length === 0) {
      appState.animating = false;
      return;
    }

    const chosenAction = qAgent.chooseAction(gameEngine.board, availableActions);
    if (chosenAction === null || chosenAction === undefined) {
      console.error('[AI] Chosen action was invalid or null');
      appState.animating = false;
      return;
    }

    const success = gameEngine.makeMove(chosenAction);
    if (!success) {
      console.error('[AI] Failsafe: AI move rejected by engine');
      appState.animating = false;
      return;
    }

    const cells = document.querySelectorAll('.game-cell');
    const cell = cells[chosenAction];
    const symbol = gameEngine.board[chosenAction];

    if (symbol === 1) {
      cell.classList.add('x', 'active', 'ai-move');
    } else if (symbol === -1) {
      cell.classList.add('o', 'active', 'ai-move');
    }

    const scanline = document.createElement('div');
    scanline.className = 'scanline-overlay';
    cell.appendChild(scanline);

    // Increment move counter
    appState.movesCount++;
    document.getElementById('moveCounter').textContent = `${appState.movesCount} / 9`;

    if (gameEngine.gameOver) {
      endCurrentGame();
    } else {
      updateBoardGlow();
      const currentSymbolName = gameEngine.currentPlayer === 1 ? 'X' : 'O';
      updateGameStatus(`Player ${currentSymbolName}'s turn (You)`);
      appState.animating = false;
    }
  }, delay);
}

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

  const cells = document.querySelectorAll('.game-cell');
  const symbol = gameEngine.board[index];
  if (symbol === 1) {
    cells[index].classList.add('x', 'active');
  } else if (symbol === -1) {
    cells[index].classList.add('o', 'active');
  }

  // Increment move counter
  appState.movesCount++;
  document.getElementById('moveCounter').textContent = `${appState.movesCount} / 9`;

  if (gameEngine.gameOver) {
    endCurrentGame();
  } else {
    updateBoardGlow();

    if (appState.gameMode === 'ai') {
      updateGameStatus(`Player ${gameEngine.currentPlayer === 1 ? 'X' : 'O'}'s turn (AI)`);
      makeAIMove();
    } else {
      updateGameStatus(`Player ${gameEngine.currentPlayer === 1 ? 'X' : 'O'}'s turn`);
    }
  }
}

/**
 * Reset game for new round
 */
function resetGame() {
  gameEngine.reset();
  appState.animating = false;
  appState.movesCount = 0;
  document.getElementById('moveCounter').textContent = '0 / 9';

  updateStatsUI(false);

  if (appState.gameMode === 'ai') {
    if (appState.playerSymbol === -1) {
      updateGameStatus(`Player X's turn (AI)`);
      makeAIMove();
    } else {
      updateGameStatus(`Player X's turn (You)`);
    }
  } else {
    updateGameStatus(`Player X's turn`);
  }

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

// ========== PERSISTENCE & ANIMATIONS ==========
const LOCAL_STORAGE_KEY = 'tictactoe_session_stats_v2';

/**
 * Load statistics from localStorage
 */
function loadStats() {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed) {
        if (parsed.aiMode) Object.assign(appState.statistics.aiMode, parsed.aiMode);
        if (parsed.humanMode) Object.assign(appState.statistics.humanMode, parsed.humanMode);
        console.log('[Stats] Loaded stats from localStorage:', appState.statistics);
      }
    }
  } catch (e) {
    console.error('[Stats] Error loading stats from localStorage:', e);
  }
}

/**
 * Save statistics to localStorage
 */
function saveStats() {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(appState.statistics));
    console.log('[Stats] Saved stats to localStorage');
  } catch (e) {
    console.error('[Stats] Error saving stats to localStorage:', e);
  }
}

/**
 * Easing animation for counting numbers
 */
function animateNumber(element, start, end, duration = 400) {
  if (!element) return;
  if (start === end) {
    element.textContent = end;
    return;
  }

  element.classList.remove('count-up-animate');
  void element.offsetWidth; // trigger reflow
  element.classList.add('count-up-animate');

  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easeProgress = progress * (2 - progress); // ease out quad
    const currentValue = Math.floor(start + (end - start) * easeProgress);

    element.textContent = currentValue;

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      element.textContent = end;
      element.classList.remove('count-up-animate');
    }
  }

  requestAnimationFrame(update);
}

/**
 * Update the stats board and game history UI
 */
function updateStatsUI(animate = true) {
  const mode = appState.gameMode;
  if (!mode) return;

  const stats = mode === 'ai' ? appState.statistics.aiMode : appState.statistics.humanMode;

  const leftLabel = document.getElementById('leftPlayerLabel');
  const rightLabel = document.getElementById('rightPlayerLabel');
  const leftScoreEl = document.getElementById('leftPlayerScore');
  const rightScoreEl = document.getElementById('rightPlayerScore');
  const drawsScoreEl = document.getElementById('drawScore');
  const gamesPlayedEl = document.getElementById('gamesPlayed');
  const winRateEl = document.getElementById('winRatePct');
  const streakEl = document.getElementById('currentStreak');
  const winRateBar = document.getElementById('winRateBar');
  const aiInfoCard = document.querySelector('.ai-info-card');
  const historyList = document.getElementById('historyList');

  // Configure mode specific labels
  if (mode === 'ai') {
    leftLabel.textContent = 'You';
    rightLabel.textContent = 'AI';
    if (aiInfoCard) aiInfoCard.style.display = 'block';
  } else {
    leftLabel.textContent = 'Player X';
    rightLabel.textContent = 'Player O';
    if (aiInfoCard) aiInfoCard.style.display = 'none';
  }

  // Get previous displayed numbers
  const oldLeft = parseInt(leftScoreEl.textContent, 10) || 0;
  const oldRight = parseInt(rightScoreEl.textContent, 10) || 0;
  const oldDraws = parseInt(drawsScoreEl.textContent, 10) || 0;
  const oldGames = parseInt(gamesPlayedEl.textContent, 10) || 0;

  // Run animations
  if (animate) {
    animateNumber(leftScoreEl, oldLeft, stats.wins);
    animateNumber(rightScoreEl, oldRight, stats.losses);
    animateNumber(drawsScoreEl, oldDraws, stats.draws);
    animateNumber(gamesPlayedEl, oldGames, stats.gamesPlayed);
  } else {
    leftScoreEl.textContent = stats.wins;
    rightScoreEl.textContent = stats.losses;
    drawsScoreEl.textContent = stats.draws;
    gamesPlayedEl.textContent = stats.gamesPlayed;
  }

  // Win Rate Percentage
  const winRate = stats.gamesPlayed > 0 ? Math.round((stats.wins / stats.gamesPlayed) * 100) : 0;
  if (animate) {
    const oldPct = parseInt(winRateEl.textContent, 10) || 0;
    animateNumber(winRateEl, oldPct, winRate, 400);
    setTimeout(() => {
      winRateEl.textContent = winRate + '%';
    }, 410);
  } else {
    winRateEl.textContent = winRate + '%';
  }

  // Progress Bar Split
  const totalDecisive = stats.wins + stats.losses;
  const winRatioPct = totalDecisive > 0 ? (stats.wins / totalDecisive) * 100 : 50;
  winRateBar.style.width = `${winRatioPct}%`;

  // Streak Rendering
  if (stats.streakCount > 0) {
    if (stats.streakType === 'w') {
      streakEl.innerHTML = `<span class="streak-fire">🔥 W${stats.streakCount}</span>`;
    } else {
      streakEl.innerHTML = `<span class="streak-ice">❄️ L${stats.streakCount}</span>`;
    }
  } else {
    streakEl.textContent = '-';
  }

  // Render history list
  historyList.innerHTML = '';
  if (!stats.history || stats.history.length === 0) {
    historyList.innerHTML = '<div class="history-empty">No games played yet.</div>';
  } else {
    [...stats.history].reverse().forEach(item => {
      const div = document.createElement('div');
      div.className = `history-item ${item.result}`;
      
      let resultText = item.result;
      if (mode === 'ai') {
        resultText = item.result === 'win' ? 'Won' : item.result === 'loss' ? 'Lost' : 'Draw';
      } else {
        resultText = item.result === 'win' ? 'X Won' : item.result === 'loss' ? 'O Won' : 'Draw';
      }

      div.innerHTML = `
        <span class="history-game-num">Game #${item.gameNum}</span>
        <span class="history-result ${item.result}">${resultText}</span>
      `;
      historyList.appendChild(div);
    });
  }
}

// ========== INITIALIZATION ==========
/**
 * Initialize the application
 */
function initializeApp() {
  console.log('[App] Initializing Tic-Tac-Toe Web Application');

  logDesignTokens();
  initializeMenu();
  loadStats(); // Load previous stats

  // Load pre-trained Q-table and initialize the AI agent
  QTableLoader.load()
    .then(qTable => {
      qAgent = new QAgent(0.0); // epsilon = 0.0 for pure optimal play
      qAgent.setQTable(qTable);
      console.log('[App] Q-Agent loaded and initialized successfully.');
    })
    .catch(err => {
      console.error('[App] Failed to load Q-Table:', err);
    });

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
