"""
Unit tests for the Tic-Tac-Toe game engine.
"""

import pytest
import numpy as np
from src.game_engine import GameEngine, Player


class TestGameEngineBasics:
    """Test basic game engine functionality."""
    
    def test_initialization(self):
        """Test game initializes correctly."""
        engine = GameEngine()
        assert engine.board.shape == (3, 3)
        assert np.all(engine.board == 0)
        assert engine.current_player == Player.X
        assert not engine.game_over
        assert engine.winner is None
        assert engine.move_count == 0
    
    def test_reset(self):
        """Test game reset functionality."""
        engine = GameEngine()
        # Make some moves
        engine.make_move(0)
        engine.make_move(1)
        assert engine.move_count == 2
        
        # Reset
        engine.reset()
        assert np.all(engine.board == 0)
        assert engine.current_player == Player.X
        assert engine.move_count == 0
        assert not engine.game_over
    
    def test_valid_moves_initial(self):
        """Test valid moves at game start."""
        engine = GameEngine()
        valid_moves = engine.get_valid_moves()
        assert len(valid_moves) == 9
        assert valid_moves == list(range(9))
    
    def test_valid_moves_after_move(self):
        """Test valid moves after making moves."""
        engine = GameEngine()
        engine.make_move(0)
        valid_moves = engine.get_valid_moves()
        assert len(valid_moves) == 8
        assert 0 not in valid_moves
        assert all(i in valid_moves for i in range(1, 9))


class TestMoveValidation:
    """Test move validation and execution."""
    
    def test_valid_move(self):
        """Test making a valid move."""
        engine = GameEngine()
        result = engine.make_move(0)
        assert result is True
        assert engine.board[0, 0] == 1  # X's value
        assert engine.move_count == 1
        assert engine.current_player == Player.O
    
    def test_invalid_move_occupied_cell(self):
        """Test invalid move on occupied cell."""
        engine = GameEngine()
        engine.make_move(0)
        result = engine.make_move(0)
        assert result is False
        assert engine.move_count == 1  # Should still be 1
    
    def test_invalid_move_out_of_range(self):
        """Test invalid move with out-of-range position."""
        engine = GameEngine()
        assert engine.make_move(-1) is False
        assert engine.make_move(9) is False
        assert engine.make_move(100) is False
    
    def test_player_alternation(self):
        """Test players alternate correctly."""
        engine = GameEngine()
        assert engine.current_player == Player.X
        
        engine.make_move(0)
        assert engine.current_player == Player.O
        assert engine.board[0, 0] == 1
        
        engine.make_move(1)
        assert engine.current_player == Player.X
        assert engine.board[0, 1] == -1
    
    def test_move_after_game_over(self):
        """Test move rejection after game over."""
        engine = GameEngine()
        # Create a winning position
        engine.make_move(0)  # X at 0
        engine.make_move(3)  # O at 3
        engine.make_move(1)  # X at 1
        engine.make_move(4)  # O at 4
        engine.make_move(2)  # X at 2 - X wins
        
        assert engine.game_over
        assert engine.make_move(5) is False


class TestWinConditions:
    """Test win detection."""
    
    def test_win_row_top(self):
        """Test win detection on top row."""
        engine = GameEngine()
        engine.make_move(0)  # X at 0
        engine.make_move(3)  # O at 3
        engine.make_move(1)  # X at 1
        engine.make_move(4)  # O at 4
        engine.make_move(2)  # X at 2 - X wins
        
        assert engine.game_over
        assert engine.winner == Player.X
    
    def test_win_row_middle(self):
        """Test win detection on middle row."""
        engine = GameEngine()
        engine.make_move(3)  # X at 3
        engine.make_move(0)  # O at 0
        engine.make_move(4)  # X at 4
        engine.make_move(1)  # O at 1
        engine.make_move(5)  # X at 5 - X wins
        
        assert engine.game_over
        assert engine.winner == Player.X
    
    def test_win_row_bottom(self):
        """Test win detection on bottom row."""
        engine = GameEngine()
        engine.make_move(6)  # X at 6
        engine.make_move(0)  # O at 0
        engine.make_move(7)  # X at 7
        engine.make_move(1)  # O at 1
        engine.make_move(8)  # X at 8 - X wins
        
        assert engine.game_over
        assert engine.winner == Player.X
    
    def test_win_column_left(self):
        """Test win detection on left column."""
        engine = GameEngine()
        engine.make_move(0)  # X at 0
        engine.make_move(1)  # O at 1
        engine.make_move(3)  # X at 3
        engine.make_move(2)  # O at 2
        engine.make_move(6)  # X at 6 - X wins
        
        assert engine.game_over
        assert engine.winner == Player.X
    
    def test_win_column_middle(self):
        """Test win detection on middle column."""
        engine = GameEngine()
        engine.make_move(1)  # X at 1
        engine.make_move(0)  # O at 0
        engine.make_move(4)  # X at 4
        engine.make_move(2)  # O at 2
        engine.make_move(7)  # X at 7 - X wins
        
        assert engine.game_over
        assert engine.winner == Player.X
    
    def test_win_column_right(self):
        """Test win detection on right column."""
        engine = GameEngine()
        engine.make_move(2)  # X at 2
        engine.make_move(0)  # O at 0
        engine.make_move(5)  # X at 5
        engine.make_move(1)  # O at 1
        engine.make_move(8)  # X at 8 - X wins
        
        assert engine.game_over
        assert engine.winner == Player.X
    
    def test_win_diagonal_main(self):
        """Test win detection on main diagonal (0-4-8)."""
        engine = GameEngine()
        engine.make_move(0)  # X at 0
        engine.make_move(1)  # O at 1
        engine.make_move(4)  # X at 4
        engine.make_move(2)  # O at 2
        engine.make_move(8)  # X at 8 - X wins
        
        assert engine.game_over
        assert engine.winner == Player.X
    
    def test_win_diagonal_anti(self):
        """Test win detection on anti-diagonal (2-4-6)."""
        engine = GameEngine()
        engine.make_move(2)  # X at 2
        engine.make_move(0)  # O at 0
        engine.make_move(4)  # X at 4
        engine.make_move(1)  # O at 1
        engine.make_move(6)  # X at 6 - X wins
        
        assert engine.game_over
        assert engine.winner == Player.X
    
    def test_o_wins(self):
        """Test O can win."""
        engine = GameEngine()
        engine.make_move(0)  # X at 0
        engine.make_move(1)  # O at 1
        engine.make_move(3)  # X at 3
        engine.make_move(4)  # O at 4
        engine.make_move(6)  # X at 6
        engine.make_move(7)  # O at 7 - O wins
        
        assert engine.game_over
        assert engine.winner == Player.O


class TestDrawCondition:
    """Test draw detection."""
    
    def test_draw(self):
        """Test draw condition."""
        engine = GameEngine()
        # Play a draw game
        moves = [0, 1, 2, 3, 5, 4, 7, 6, 8]
        for move in moves:
            engine.make_move(move)
        
        assert engine.game_over
        assert engine.winner is None
        assert engine.move_count == 9


class TestBoardState:
    """Test board state retrieval."""
    
    def test_get_board_state_flat(self):
        """Test getting flattened board state."""
        engine = GameEngine()
        engine.make_move(0)
        engine.make_move(4)
        
        state = engine.get_board_state()
        assert state.shape == (9,)
        assert state[0] == 1  # X at position 0
        assert state[4] == -1  # O at position 4
        assert state[1] == 0  # Empty at position 1
    
    def test_get_board_state_2d(self):
        """Test getting 2D board state."""
        engine = GameEngine()
        engine.make_move(0)
        engine.make_move(4)
        
        state = engine.get_board_state_2d()
        assert state.shape == (3, 3)
        assert state[0, 0] == 1  # X at (0, 0)
        assert state[1, 1] == -1  # O at (1, 1)
    
    def test_board_state_immutability(self):
        """Test that returned board state is a copy."""
        engine = GameEngine()
        engine.make_move(0)
        
        state = engine.get_board_state()
        state[0] = 999  # Modify returned state
        
        # Original board should be unchanged
        assert engine.board.flat[0] == 1


class TestGameStatus:
    """Test game status methods."""
    
    def test_is_game_over_false(self):
        """Test is_game_over returns False during game."""
        engine = GameEngine()
        engine.make_move(0)
        assert not engine.is_game_over()
    
    def test_is_game_over_true_win(self):
        """Test is_game_over returns True after win."""
        engine = GameEngine()
        engine.make_move(0)
        engine.make_move(3)
        engine.make_move(1)
        engine.make_move(4)
        engine.make_move(2)  # X wins
        
        assert engine.is_game_over()
    
    def test_get_winner_none_during_game(self):
        """Test get_winner returns None during game."""
        engine = GameEngine()
        engine.make_move(0)
        assert engine.get_winner() is None


class TestStringRepresentation:
    """Test board string representation."""
    
    def test_str_empty_board(self):
        """Test string representation of empty board."""
        engine = GameEngine()
        board_str = str(engine)
        assert ' | ' in board_str
        assert '-----------' in board_str
    
    def test_str_with_moves(self):
        """Test string representation with moves."""
        engine = GameEngine()
        engine.make_move(0)  # X at 0
        engine.make_move(4)  # O at 4
        
        board_str = str(engine)
        assert 'X' in board_str
        assert 'O' in board_str


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
