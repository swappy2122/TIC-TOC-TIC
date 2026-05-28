"""
Core Tic-Tac-Toe game engine.
Implements game rules, board state management, and game flow.
"""

import numpy as np
from enum import Enum
from typing import Tuple, List, Optional


class Player(Enum):
    """Enum for player types."""
    X = 1
    O = -1
    EMPTY = 0


class GameEngine:
    """
    Tic-Tac-Toe game engine managing board state and game logic.
    
    Board representation:
    - 1 for X (player)
    - -1 for O (opponent)
    - 0 for empty
    """
    
    def __init__(self):
        """Initialize a new game."""
        self.board = np.zeros((3, 3), dtype=np.int8)
        self.current_player = Player.X
        self.game_over = False
        self.winner = None
        self.move_count = 0
    
    def reset(self) -> None:
        """Reset the game to initial state."""
        self.board = np.zeros((3, 3), dtype=np.int8)
        self.current_player = Player.X
        self.game_over = False
        self.winner = None
        self.move_count = 0
    
    def get_valid_moves(self) -> List[int]:
        """
        Get list of valid move positions (0-8).
        
        Board indexing:
        0 | 1 | 2
        ---------
        3 | 4 | 5
        ---------
        6 | 7 | 8
        
        Returns:
            List of valid move indices.
        """
        return [i for i in range(9) if self.board.flat[i] == 0]
    
    def make_move(self, position: int) -> bool:
        """
        Make a move at the specified position.
        
        Args:
            position: Position index (0-8)
            
        Returns:
            True if move was valid, False otherwise.
        """
        if self.game_over or position < 0 or position > 8:
            return False
        
        row, col = position // 3, position % 3
        
        if self.board[row, col] != 0:
            return False
        
        self.board[row, col] = self.current_player.value
        self.move_count += 1
        
        # Check for win/draw
        self._check_game_state()
        
        # Switch player
        self.current_player = Player.O if self.current_player == Player.X else Player.X
        
        return True
    
    def _check_game_state(self) -> None:
        """Check if game is over and determine winner."""
        # Check rows
        for row in self.board:
            if row[0] == row[1] == row[2] != 0:
                self.game_over = True
                self.winner = Player(row[0])
                return
        
        # Check columns
        for col in range(3):
            if self.board[0, col] == self.board[1, col] == self.board[2, col] != 0:
                self.game_over = True
                self.winner = Player(self.board[0, col])
                return
        
        # Check diagonals
        if self.board[0, 0] == self.board[1, 1] == self.board[2, 2] != 0:
            self.game_over = True
            self.winner = Player(self.board[0, 0])
            return
        
        if self.board[0, 2] == self.board[1, 1] == self.board[2, 0] != 0:
            self.game_over = True
            self.winner = Player(self.board[0, 2])
            return
        
        # Check for draw
        if self.move_count == 9:
            self.game_over = True
            self.winner = None  # Draw
    
    def get_board_state(self) -> np.ndarray:
        """
        Get current board state as a flattened array.
        
        Returns:
            Flattened board state (9 elements).
        """
        return self.board.flatten().copy()
    
    def get_board_2d(self) -> np.ndarray:
        """
        Get current board state as 3x3 array.
        
        Returns:
            2D board state.
        """
        return self.board.copy()
    
    def is_game_over(self) -> bool:
        """Check if game is over."""
        return self.game_over
    
    def get_winner(self) -> Optional[Player]:
        """
        Get the winner.
        
        Returns:
            Player.X if X won, Player.O if O won, None for draw.
        """
        return self.winner
    
    def __str__(self) -> str:
        """String representation of board."""
        symbols = {0: ' ', 1: 'X', -1: 'O'}
        lines = []
        for i in range(3):
            row = [symbols[self.board[i, j]] for j in range(3)]
            lines.append(' | '.join(row))
            if i < 2:
                lines.append('-----------')
        return '\n'.join(lines)
