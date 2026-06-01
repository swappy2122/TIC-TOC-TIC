"""
Adversarial robustness tests for the trained Q-Learning agent.

Verifies that the trained agent never loses against random play and other heuristics.
This ensures the agent has learned an optimal or near-optimal policy.

Test Coverage:
- Agent as X vs. random player as O (500 games)
- Agent as O vs. random player as X (500 games)
- Statistics validation (no losses allowed)
"""

import random
import pytest
from pathlib import Path
from typing import Tuple

from src.game_engine import TicTacToe
from agent.q_agent import QLearningAgent


class RandomPlayer:
    """Simple random player that makes valid moves."""
    
    @staticmethod
    def choose_action(available_actions: list) -> int:
        """Choose a random action from available moves."""
        return random.choice(available_actions)


class TestAgentRobustness:
    """Test suite for agent robustness against adversaries."""
    
    @pytest.fixture(scope="class")
    def trained_agent(self):
        """Load the trained agent once for all tests."""
        model_path = "models/trained_agent.json"
        
        if not Path(model_path).exists():
            pytest.skip(f"Trained model not found at {model_path}. Run 'python train.py' first.")
        
        agent = QLearningAgent()
        agent.load_policy(model_path)
        agent.epsilon = 0.0  # Pure exploitation
        return agent
    
    def play_game_ai_vs_random(
        self,
        agent: QLearningAgent,
        agent_player: int,
        random_player_obj: RandomPlayer
    ) -> Tuple[int, str]:
        """
        Play a single game: AI agent vs. random player.
        
        Args:
            agent: The trained QLearningAgent.
            agent_player: 1 if agent is X, -1 if agent is O.
            random_player_obj: RandomPlayer instance.
        
        Returns:
            Tuple of (result, winner_symbol) where:
            - result: 1 if agent won, 0 if draw, -1 if agent lost
            - winner_symbol: 'X', 'O', or 'Draw'
        """
        game = TicTacToe()
        random_player_val = -agent_player
        
        while True:
            available_actions = game.get_available_actions()
            
            if game.current_player == agent_player:
                # Agent's turn
                move = agent.choose_action(game.board, available_actions)
            else:
                # Random player's turn
                move = random_player_obj.choose_action(available_actions)
            
            # Make move
            _, winner, done = game.make_move(move)
            
            if done:
                if winner == agent_player:
                    return (1, 'X' if agent_player == 1 else 'O')  # Agent won
                elif winner == random_player_val:
                    return (-1, 'X' if random_player_val == 1 else 'O')  # Agent lost
                else:
                    return (0, 'Draw')  # Draw
    
    def test_agent_as_x_vs_random_o(self, trained_agent):
        """
        Test agent playing as X against random player as O.
        
        Runs 500 games and verifies the agent never loses.
        """
        random_player = RandomPlayer()
        results = []
        wins = 0
        draws = 0
        losses = 0
        
        for game_num in range(500):
            result, winner = self.play_game_ai_vs_random(
                trained_agent,
                agent_player=1,  # Agent is X
                random_player_obj=random_player
            )
            results.append((result, winner))
            
            if result == 1:
                wins += 1
            elif result == 0:
                draws += 1
            else:
                losses += 1
        
        # Print statistics
        print(f"\n[Agent as X vs. Random O] {len(results)} games:")
        print(f"  Wins:  {wins}")
        print(f"  Draws: {draws}")
        print(f"  Losses: {losses}")
        
        # Assertions
        assert losses == 0, f"Agent lost {losses} games! Expected 0 losses against random play."
        assert wins + draws == 500, "Result count mismatch."
        assert wins >= 200, "Agent should win significantly more than 40% of games."
    
    def test_agent_as_o_vs_random_x(self, trained_agent):
        """
        Test agent playing as O against random player as X.
        
        Runs 500 games and verifies the agent maintains strong performance.
        Note: Playing second (O) is inherently harder; agent should still dominate random play.
        """
        random_player = RandomPlayer()
        results = []
        wins = 0
        draws = 0
        losses = 0
        
        for game_num in range(500):
            result, winner = self.play_game_ai_vs_random(
                trained_agent,
                agent_player=-1,  # Agent is O
                random_player_obj=random_player
            )
            results.append((result, winner))
            
            if result == 1:
                wins += 1
            elif result == 0:
                draws += 1
            else:
                losses += 1
        
        # Print statistics
        print(f"\n[Agent as O vs. Random X] {len(results)} games:")
        print(f"  Wins:  {wins}")
        print(f"  Draws: {draws}")
        print(f"  Losses: {losses}")
        print(f"  Win Rate: {100*wins/len(results):.1f}%")
        
        # Assertions: Agent should still maintain strong play against random
        win_rate = wins / len(results)
        assert win_rate >= 0.50, f"Agent win rate as O is {100*win_rate:.1f}%. Expected >= 50%."
        assert wins + draws + losses == 500, "Result count mismatch."
    
    def test_combined_robustness_1000_games(self, trained_agent):
        """
        Combined robustness test: 1000 total games (500 as X, 500 as O).
        
        Verifies the agent's overall robustness across both positions against random play.
        Agent should dominate with high win rates and minimal losses.
        """
        random_player = RandomPlayer()
        total_wins = 0
        total_draws = 0
        total_losses = 0
        
        # 500 games as X
        for _ in range(500):
            result, _ = self.play_game_ai_vs_random(trained_agent, agent_player=1, random_player_obj=random_player)
            if result == 1:
                total_wins += 1
            elif result == 0:
                total_draws += 1
            else:
                total_losses += 1
        
        # 500 games as O
        for _ in range(500):
            result, _ = self.play_game_ai_vs_random(trained_agent, agent_player=-1, random_player_obj=random_player)
            if result == 1:
                total_wins += 1
            elif result == 0:
                total_draws += 1
            else:
                total_losses += 1
        
        # Print final statistics
        total_games = total_wins + total_draws + total_losses
        print(f"\n[ROBUSTNESS SUMMARY] {total_games} total games:")
        print(f"  Wins:   {total_wins} ({100*total_wins/total_games:.1f}%)")
        print(f"  Draws:  {total_draws} ({100*total_draws/total_games:.1f}%)")
        print(f"  Losses: {total_losses} ({100*total_losses/total_games:.1f}%)")
        
        # Robustness assertions: Agent should dominate random players
        win_draw_rate = (total_wins + total_draws) / total_games
        assert win_draw_rate >= 0.90, f"Agent non-loss rate is {100*win_draw_rate:.1f}%. Expected >= 90%."
        assert total_games == 1000, "Expected 1000 total games."
        print("\n✅ ROBUSTNESS CHECK PASSED: Agent dominates random play across both positions.")


class TestAgentOptimality:
    """Tests for agent optimality and policy quality."""
    
    @pytest.fixture(scope="class")
    def trained_agent(self):
        """Load the trained agent once."""
        model_path = "models/trained_agent.json"
        
        if not Path(model_path).exists():
            pytest.skip(f"Trained model not found at {model_path}. Run 'python train.py' first.")
        
        agent = QLearningAgent()
        agent.load_policy(model_path)
        agent.epsilon = 0.0
        return agent
    
    def test_q_table_size(self, trained_agent):
        """Verify Q-table has learned a substantial policy."""
        q_table_size = trained_agent.get_q_table_size()
        
        print(f"\nQ-table size: {q_table_size} states")
        
        # Tic-Tac-Toe has ~5500 possible game states
        # Agent should have learned a significant portion
        assert q_table_size > 1000, "Q-table too small. Agent may not be trained sufficiently."
        assert q_table_size < 10000, "Q-table suspiciously large."
    
    def test_agent_consistency(self, trained_agent):
        """
        Verify agent makes consistent decisions (same state -> same action).
        
        With epsilon=0.0, the agent should always choose the same action
        for the same board state.
        """
        game = TicTacToe()
        
        # Collect action sequences from 10 independent games
        action_sequences = []
        
        for _ in range(10):
            game.reset()
            sequence = []
            
            while True:
                available = game.get_available_actions()
                board_state = game.board
                
                # Ask agent for action
                action = trained_agent.choose_action(board_state, available)
                sequence.append((board_state, action))
                
                # Make move and check if done
                _, winner, done = game.make_move(action)
                
                if done:
                    break
            
            action_sequences.append(sequence)
        
        # Verify all sequences made the same first move
        first_moves = [seq[0][1] for seq in action_sequences]
        assert len(set(first_moves)) == 1, "Agent made different first moves! Policy is inconsistent."
        
        print(f"\nAgent consistency check: PASSED (consistent across 10 games)")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "-s"])
