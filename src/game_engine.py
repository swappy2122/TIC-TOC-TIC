"""
Core Tic-Tac-Toe game engine.
Implements game rules, board state management, and game flow.
Optimized for Q-Learning with immutable tuple-based board representation.
"""

from typing import Tuple, List, Optional


class TicTacToe:
    """
    Tic-Tac-Toe game engine with immutable tuple-based board representation.
    
    Board representation:
    - 1D tuple of size 9 (immutable for use as dict keys in Q-Learning)
    - States: 0 for empty, 1 for X, -1 for O
    - Indexing:
      0 | 1 | 2
      ---------
      3 | 4 | 5
      ---------
      6 | 7 | 8
    """
    
    def __init__(self):
        """Initialize a new game."""
        self.board = (0,) * 9  # Immutable tuple is perfect for dict keys
        self.current_player = 1  # 1 for X, -1 for O

    def reset(self) -> Tuple:
        """
        Reset the game to initial state.
        
        Returns:
            The reset board state (tuple).
        """
        self.board = (0,) * 9
        self.current_player = 1
        return self.board

    def get_available_actions(self) -> List[int]:
        """
        Get list of available action positions (0-8).
        
        Returns:
            List of valid move indices.
        """
        return [i for i, val in enumerate(self.board) if val == 0]

    def make_move(self, action: int) -> Tuple[Tuple, Optional[int], bool]:
        """
        Make a move at the specified position.
        
        Args:
            action: Position index (0-8)
            
        Returns:
            Tuple of (new_board_state, winner, done)
            - new_board_state: Updated board as tuple
            - winner: 1 (X won), -1 (O won), 0 (draw), None (game ongoing)
            - done: True if game is over, False otherwise
            
        Raises:
            ValueError: If move is invalid (spot already taken).
        """
        if self.board[action] != 0:
            raise ValueError("Invalid move: spot already taken.")
        
        board_list = list(self.board)
        board_list[action] = self.current_player
        self.board = tuple(board_list)
        
        # Check game state
        winner = self.check_winner()
        if winner is not None:
            return self.board, winner, True  # state, winner, done
        
        if 0 not in self.board:
            return self.board, 0, True  # draw
        
        self.current_player = -self.current_player  # Switch turn
        return self.board, None, False

    def check_winner(self) -> Optional[int]:
        """
        Check if there's a winner on the current board.
        
        Returns:
            1 if X won, -1 if O won, None if no winner yet.
        """
        win_combinations = [
            (0, 1, 2), (3, 4, 5), (6, 7, 8),  # Rows
            (0, 3, 6), (1, 4, 7), (2, 5, 8),  # Columns
            (0, 4, 8), (2, 4, 6)              # Diagonals
        ]
        for a, b, c in win_combinations:
            if self.board[a] == self.board[b] == self.board[c] != 0:
                return self.board[a]
        return None

    def get_board_state(self) -> Tuple:
        """
        Get current board state.
        
        Returns:
            The board as a tuple.
        """
        return self.board

    def __str__(self) -> str:
        """String representation of board."""
        symbols = {0: ' ', 1: 'X', -1: 'O'}
        lines = []
        for i in range(3):
            row = [symbols[self.board[i * 3 + j]] for j in range(3)]
            lines.append(' | '.join(row))
            if i < 2:
                lines.append('-----------')
        return '\n'.join(lines)
