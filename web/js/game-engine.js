/**
 * TIC-TAC-TOE | Game Engine
 * Pure JavaScript port of src/game_engine.py
 * 
 * Handles core game logic:
 * - Board state management
 * - Move validation and execution
 * - Win/draw detection
 * - Available actions enumeration
 */

class GameEngine {
  constructor() {
    // Board representation:
    // 0 = empty cell
    // 1 = X player
    // -1 = O player
    this.board = new Array(9).fill(0);
    
    // Win combinations: all rows, columns, and diagonals
    this.WIN_COMBOS = [
      [0, 1, 2], // Row 1
      [3, 4, 5], // Row 2
      [6, 7, 8], // Row 3
      [0, 3, 6], // Column 1
      [1, 4, 7], // Column 2
      [2, 5, 8], // Column 3
      [0, 4, 8], // Diagonal (top-left to bottom-right)
      [2, 4, 6], // Diagonal (top-right to bottom-left)
    ];
    
    this.currentPlayer = 1; // 1 = X, -1 = O
    this.gameOver = false;
    this.winner = null;
  }

  /**
   * Make a move on the board
   * @param {number} index - Cell index (0-8)
   * @returns {boolean} - True if move was valid, false otherwise
   */
  makeMove(index) {
    // Validate index
    if (index < 0 || index > 8) {
      console.warn(`[Engine] Invalid index: ${index}`);
      return false;
    }

    // Check if cell is already occupied
    if (this.board[index] !== 0) {
      console.warn(`[Engine] Cell ${index} is already occupied`);
      return false;
    }

    // Check if game is over
    if (this.gameOver) {
      console.warn('[Engine] Game is over. Cannot make move.');
      return false;
    }

    // Place the symbol
    this.board[index] = this.currentPlayer;
    console.log(`[Engine] Player ${this.currentPlayer === 1 ? 'X' : 'O'} moved to cell ${index}`);

    // Check for winner
    this.winner = this.checkWinner();
    if (this.winner !== null) {
      this.gameOver = true;
      console.log(`[Engine] Player ${this.winner === 1 ? 'X' : 'O'} wins!`);
      return true;
    }

    // Check for draw
    if (this.isBoardFull()) {
      this.gameOver = true;
      this.winner = 0; // Draw
      console.log('[Engine] Draw!');
      return true;
    }

    // Switch player
    this.switchPlayer();
    return true;
  }

  /**
   * Check if there's a winner
   * @returns {number|null} - 1 (X wins), -1 (O wins), or null (no winner yet)
   */
  checkWinner() {
    for (const combo of this.WIN_COMBOS) {
      const [a, b, c] = combo;
      const sum = this.board[a] + this.board[b] + this.board[c];

      // X wins: three 1s sum to 3
      if (sum === 3) {
        return 1;
      }

      // O wins: three -1s sum to -3
      if (sum === -3) {
        return -1;
      }
    }

    return null;
  }

  /**
   * Get the winning combination (if any)
   * @returns {number[]|null} - Array of indices forming the winning line
   */
  getWinningCombo() {
    if (this.winner === null) return null;

    for (const combo of this.WIN_COMBOS) {
      const [a, b, c] = combo;
      const sum = this.board[a] + this.board[b] + this.board[c];

      if ((this.winner === 1 && sum === 3) || (this.winner === -1 && sum === -3)) {
        return combo;
      }
    }

    return null;
  }

  /**
   * Check if the board is full
   * @returns {boolean}
   */
  isBoardFull() {
    return this.board.every(cell => cell !== 0);
  }

  /**
   * Get all available actions (empty cells)
   * @returns {number[]} - Array of available cell indices
   */
  getAvailableActions() {
    const actions = [];
    for (let i = 0; i < 9; i++) {
      if (this.board[i] === 0) {
        actions.push(i);
      }
    }
    return actions;
  }

  /**
   * Switch the current player
   */
  switchPlayer() {
    this.currentPlayer = this.currentPlayer === 1 ? -1 : 1;
  }

  /**
   * Reset the game to initial state
   */
  reset() {
    this.board = new Array(9).fill(0);
    this.currentPlayer = 1;
    this.gameOver = false;
    this.winner = null;
    console.log('[Engine] Game reset');
  }

  /**
   * Get board state as display symbols (for debugging)
   * @returns {string[]} - Array of display symbols
   */
  getBoardDisplay() {
    return this.board.map(cell => {
      if (cell === 0) return ' ';
      if (cell === 1) return 'X';
      if (cell === -1) return 'O';
    });
  }

  /**
   * Get game state snapshot
   * @returns {object} - Current game state
   */
  getState() {
    return {
      board: [...this.board],
      currentPlayer: this.currentPlayer,
      gameOver: this.gameOver,
      winner: this.winner,
      availableActions: this.getAvailableActions(),
    };
  }
}

// Export for use in app.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GameEngine;
}
