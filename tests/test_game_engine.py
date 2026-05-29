"""
Unit tests for the Tic-Tac-Toe game engine.
"""

import pytest
from src.game_engine import TicTacToe


class TestGameEngineBasics:
    """Test basic game engine functionality."""
    
    def test_initialization(self):
        """Test game initializes correctly."""
        game = TicTacToe()
        assert game.board == (0,) * 9
        assert game.current_player == 1  # X = 1
        assert isinstance(game.board, tuple)
    
    def test_reset(self):
        """Test game reset functionality."""
        game = TicTacToe()
        # Make some moves
        game.make_move(0)
        game.make_move(1)
        
        # Reset
        board = game.reset()
        assert board == (0,) * 9
        assert game.current_player == 1
        assert isinstance(board, tuple)
    
    def test_available_actions_initial(self):
        """Test available actions at game start."""
        game = TicTacToe()
        actions = game.get_available_actions()
        assert len(actions) == 9
        assert actions == list(range(9))
    
    def test_available_actions_after_move(self):
        """Test available actions after making moves."""
        game = TicTacToe()
        game.make_move(0)
        actions = game.get_available_actions()
        assert len(actions) == 8
        assert 0 not in actions
        assert all(i in actions for i in range(1, 9))


class TestMoveValidation:
    """Test move validation and execution."""
    
    def test_valid_move(self):
        """Test making a valid move."""
        game = TicTacToe()
        board, winner, done = game.make_move(0)
        assert board == (1, 0, 0, 0, 0, 0, 0, 0, 0)
        assert winner is None
        assert done is False
        assert game.current_player == -1  # O = -1
    
    def test_invalid_move_occupied_cell(self):
        """Test invalid move on occupied cell."""
        game = TicTacToe()
        game.make_move(0)
        with pytest.raises(ValueError):
            game.make_move(0)
    
    def test_player_alternation(self):
        """Test players alternate correctly."""
        game = TicTacToe()
        assert game.current_player == 1  # X
        
        board1, _, _ = game.make_move(0)
        assert game.current_player == -1  # O
        assert board1[0] == 1
        
        board2, _, _ = game.make_move(1)
        assert game.current_player == 1  # X
        assert board2[1] == -1


class TestWinConditions:
    """Test win detection."""
    
    def test_win_row_top(self):
        """Test win detection on top row."""
        game = TicTacToe()
        game.make_move(0)  # X at 0
        game.make_move(3)  # O at 3
        game.make_move(1)  # X at 1
        game.make_move(4)  # O at 4
        board, winner, done = game.make_move(2)  # X at 2 - X wins
        
        assert done is True
        assert winner == 1  # X
    
    def test_win_row_middle(self):
        """Test win detection on middle row."""
        game = TicTacToe()
        game.make_move(3)  # X at 3
        game.make_move(0)  # O at 0
        game.make_move(4)  # X at 4
        game.make_move(1)  # O at 1
        board, winner, done = game.make_move(5)  # X at 5 - X wins
        
        assert done is True
        assert winner == 1  # X
    
    def test_win_row_bottom(self):
        """Test win detection on bottom row."""
        game = TicTacToe()
        game.make_move(6)  # X at 6
        game.make_move(0)  # O at 0
        game.make_move(7)  # X at 7
        game.make_move(1)  # O at 1
        board, winner, done = game.make_move(8)  # X at 8 - X wins
        
        assert done is True
        assert winner == 1  # X
    
    def test_win_column_left(self):
        """Test win detection on left column."""
        game = TicTacToe()
        game.make_move(0)  # X at 0
        game.make_move(1)  # O at 1
        game.make_move(3)  # X at 3
        game.make_move(2)  # O at 2
        board, winner, done = game.make_move(6)  # X at 6 - X wins
        
        assert done is True
        assert winner == 1  # X
    
    def test_win_column_middle(self):
        """Test win detection on middle column."""
        game = TicTacToe()
        game.make_move(1)  # X at 1
        game.make_move(0)  # O at 0
        game.make_move(4)  # X at 4
        game.make_move(2)  # O at 2
        board, winner, done = game.make_move(7)  # X at 7 - X wins
        
        assert done is True
        assert winner == 1  # X
    
    def test_win_column_right(self):
        """Test win detection on right column."""
        game = TicTacToe()
        game.make_move(2)  # X at 2
        game.make_move(0)  # O at 0
        game.make_move(5)  # X at 5
        game.make_move(1)  # O at 1
        board, winner, done = game.make_move(8)  # X at 8 - X wins
        
        assert done is True
        assert winner == 1  # X
    
    def test_win_diagonal_main(self):
        """Test win detection on main diagonal (0-4-8)."""
        game = TicTacToe()
        game.make_move(0)  # X at 0
        game.make_move(1)  # O at 1
        game.make_move(4)  # X at 4
        game.make_move(2)  # O at 2
        board, winner, done = game.make_move(8)  # X at 8 - X wins
        
        assert done is True
        assert winner == 1  # X
    
    def test_win_diagonal_anti(self):
        """Test win detection on anti-diagonal (2-4-6)."""
        game = TicTacToe()
        game.make_move(2)  # X at 2
        game.make_move(0)  # O at 0
        game.make_move(4)  # X at 4
        game.make_move(1)  # O at 1
        board, winner, done = game.make_move(6)  # X at 6 - X wins
        
        assert done is True
        assert winner == 1  # X
    
    def test_o_wins(self):
        """Test O can win."""
        game = TicTacToe()
        game.make_move(0)  # X at 0
        game.make_move(4)  # O at 4
        game.make_move(2)  # X at 2
        game.make_move(1)  # O at 1
        game.make_move(3)  # X at 3
        board, winner, done = game.make_move(7)  # O at 7 - O wins
        
        assert done is True
        assert winner == -1  # O


class TestDrawCondition:
    """Test draw detection."""
    
    def test_draw(self):
        """Test draw condition."""
        game = TicTacToe()
        # Play a draw game
        # X | X | O
        # O | O | X
        # X | O | X
        moves = [0, 2, 1, 3, 5, 4, 6, 7, 8]
        for i, move in enumerate(moves):
            board, winner, done = game.make_move(move)
            if i == len(moves) - 1:  # Last move
                assert done is True
                assert winner == 0  # Draw


class TestBoardState:
    """Test board state retrieval."""
    
    def test_get_board_state(self):
        """Test getting board state."""
        game = TicTacToe()
        game.make_move(0)
        game.make_move(4)
        
        state = game.get_board_state()
        assert isinstance(state, tuple)
        assert len(state) == 9
        assert state[0] == 1  # X at position 0
        assert state[4] == -1  # O at position 4
        assert state[1] == 0  # Empty at position 1
    
    def test_board_state_immutability(self):
        """Test that board state is immutable tuple."""
        game = TicTacToe()
        game.make_move(0)
        
        state = game.get_board_state()
        # Tuples are immutable, so this will raise an error
        with pytest.raises(TypeError):
            state[0] = 99


class TestStringRepresentation:
    """Test board string representation."""
    
    def test_str_empty_board(self):
        """Test string representation of empty board."""
        game = TicTacToe()
        board_str = str(game)
        assert ' | ' in board_str
        assert '-----------' in board_str
    
    def test_str_with_moves(self):
        """Test string representation with moves."""
        game = TicTacToe()
        game.make_move(0)  # X at 0
        game.make_move(4)  # O at 4
        
        board_str = str(game)
        assert 'X' in board_str
        assert 'O' in board_str


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
