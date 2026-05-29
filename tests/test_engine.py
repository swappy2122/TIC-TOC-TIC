"""
Verification tests for TicTacToe game engine.
Tests core game rules: valid moves, state transitions, win detection, and draws.
"""

import pytest
from src.game_engine import TicTacToe


class TestGameRulesVerification:
    """Verify core game rules and state transitions."""
    
    def test_valid_move_state_transition(self):
        """Verify valid move updates board state correctly."""
        game = TicTacToe()
        board, winner, done = game.make_move(0)
        
        assert board[0] == 1  # X placed at position 0
        assert winner is None  # No winner yet
        assert done is False  # Game ongoing
    
    def test_alternating_player_turns(self):
        """Verify players alternate turns correctly."""
        game = TicTacToe()
        
        # X makes move
        assert game.current_player == 1
        game.make_move(0)
        assert game.current_player == -1  # Switch to O
        
        # O makes move
        game.make_move(1)
        assert game.current_player == 1  # Back to X
    
    def test_invalid_move_occupied_cell_raises_error(self):
        """Verify error raised for occupied cell."""
        game = TicTacToe()
        game.make_move(0)
        
        with pytest.raises(ValueError, match="Invalid move: spot already taken"):
            game.make_move(0)
    
    def test_available_actions_update(self):
        """Verify available actions decrease after moves."""
        game = TicTacToe()
        initial_actions = game.get_available_actions()
        assert len(initial_actions) == 9
        
        game.make_move(0)
        after_one_move = game.get_available_actions()
        assert len(after_one_move) == 8
        assert 0 not in after_one_move


class TestWinDetectionVerification:
    """Verify win detection across all configurations."""
    
    def test_detect_win_row(self):
        """Verify row win detection."""
        game = TicTacToe()
        game.make_move(0)  # X
        game.make_move(3)  # O
        game.make_move(1)  # X
        game.make_move(4)  # O
        board, winner, done = game.make_move(2)  # X wins on top row
        
        assert done is True
        assert winner == 1  # X wins
    
    def test_detect_win_column(self):
        """Verify column win detection."""
        game = TicTacToe()
        game.make_move(0)  # X
        game.make_move(1)  # O
        game.make_move(3)  # X
        game.make_move(2)  # O
        board, winner, done = game.make_move(6)  # X wins on left column
        
        assert done is True
        assert winner == 1  # X wins
    
    def test_detect_win_diagonal_main(self):
        """Verify main diagonal win detection."""
        game = TicTacToe()
        game.make_move(0)  # X at (0,0)
        game.make_move(1)  # O
        game.make_move(4)  # X at (1,1)
        game.make_move(2)  # O
        board, winner, done = game.make_move(8)  # X at (2,2) - wins
        
        assert done is True
        assert winner == 1
    
    def test_detect_win_diagonal_anti(self):
        """Verify anti-diagonal win detection."""
        game = TicTacToe()
        game.make_move(2)  # X at (0,2)
        game.make_move(0)  # O
        game.make_move(4)  # X at (1,1)
        game.make_move(1)  # O
        board, winner, done = game.make_move(6)  # X at (2,0) - wins
        
        assert done is True
        assert winner == 1
    
    def test_detect_opponent_win(self):
        """Verify O can win."""
        game = TicTacToe()
        game.make_move(0)  # X
        game.make_move(4)  # O
        game.make_move(2)  # X
        game.make_move(1)  # O
        game.make_move(3)  # X
        board, winner, done = game.make_move(7)  # O wins on middle column
        
        assert done is True
        assert winner == -1  # O wins


class TestDrawDetection:
    """Verify draw detection."""
    
    def test_detect_draw_condition(self):
        """Verify draw when board is full without winner."""
        game = TicTacToe()
        moves = [0, 2, 1, 3, 5, 4, 6, 7, 8]
        
        for i, move in enumerate(moves):
            board, winner, done = game.make_move(move)
            
            if i == len(moves) - 1:  # Last move
                assert done is True
                assert winner == 0  # Draw indicated by 0
    
    def test_board_fills_completely(self):
        """Verify all 9 squares can be filled."""
        game = TicTacToe()
        
        for move in range(9):
            available = game.get_available_actions()
            assert move in available
            game.make_move(move)
        
        available = game.get_available_actions()
        assert len(available) == 0  # No moves left


class TestBoardStateIntegrity:
    """Verify board state remains consistent."""
    
    def test_board_is_immutable_tuple(self):
        """Verify board is represented as immutable tuple."""
        game = TicTacToe()
        board = game.get_board_state()
        
        assert isinstance(board, tuple)
        assert len(board) == 9
    
    def test_board_values_valid(self):
        """Verify board only contains valid values (0, 1, -1)."""
        game = TicTacToe()
        
        for move in range(5):
            board = game.get_board_state()
            valid_values = {0, 1, -1}
            assert all(val in valid_values for val in board)
            game.make_move(move)
    
    def test_reset_clears_board(self):
        """Verify reset restores initial state."""
        game = TicTacToe()
        game.make_move(0)
        game.make_move(1)
        
        reset_board = game.reset()
        assert reset_board == (0,) * 9
        assert game.current_player == 1


class TestGameFlow:
    """Verify complete game flow scenarios."""
    
    def test_complete_winning_game(self):
        """Simulate a complete winning game."""
        game = TicTacToe()
        moves = [0, 3, 1, 4, 2]  # X wins on top row
        
        for i, move in enumerate(moves[:-1]):
            board, winner, done = game.make_move(move)
            assert done is False
            assert winner is None
        
        board, winner, done = game.make_move(moves[-1])
        assert done is True
        assert winner == 1
    
    def test_complete_draw_game(self):
        """Simulate a complete draw game."""
        game = TicTacToe()
        moves = [0, 2, 1, 3, 5, 4, 6, 7, 8]
        
        for move in moves:
            board, winner, done = game.make_move(move)
        
        assert done is True
        assert winner == 0  # Draw


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
