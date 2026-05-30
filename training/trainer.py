"""
Self-play training loop for Q-Learning Tic-Tac-Toe agent.
Implements relative rewards where winner gets +1.0, loser gets -1.0, draws get 0.5.
"""

from typing import Optional
from src.game_engine import TicTacToe
from agent.q_agent import QLearningAgent


def train_agent(episodes: int = 100000) -> QLearningAgent:
    """
    Train a Q-Learning agent through self-play.
    
    The agent plays against itself, with a single agent controlling both X and O.
    Q-table is updated retrospectively at the end of each game based on outcomes.
    
    Reward Scheme:
    - Winner (player who got 3 in a row): +1.0
    - Loser (opponent): -1.0
    - Draw: +0.5 for both players (mild reward for not losing)
    
    Args:
        episodes: Number of self-play games to run.
        
    Returns:
        Trained QLearningAgent with populated Q-table.
    """
    agent = QLearningAgent()
    
    for episode in range(episodes):
        game = TicTacToe()
        state = game.board
        done = False
        
        # Track state and action for each player to enable retrospective Q-value updates
        # Key: player (1 for X, -1 for O), Value: {"state": board_tuple, "action": int}
        history = {1: {"state": None, "action": None}, -1: {"state": None, "action": None}}
        
        while not done:
            player = game.current_player
            actions = game.get_available_actions()
            
            # Agent chooses action using epsilon-greedy policy
            action = agent.choose_action(state, actions)
            next_state, winner, done = game.make_move(action)
            
            # If this player made a move before, update that previous move's Q-value
            if history[player]["state"] is not None:
                prev_state = history[player]["state"]
                prev_action = history[player]["action"]
                # Intermediate rewards are 0 (no outcome yet)
                prev_actions = game.get_available_actions() if not done else []
                agent.update_q(
                    prev_state,
                    prev_action,
                    0.0,  # Intermediate reward
                    state,
                    prev_actions,
                    False
                )
            
            # Record current state and action for this player
            history[player]["state"] = state
            history[player]["action"] = action
            
            if done:
                # Game is over; assign final rewards
                if winner == 0:
                    # Draw: both players get mild reward of 0.5
                    agent.update_q(state, action, 0.5, next_state, [], True)
                    
                    # Update opponent's last move with draw reward
                    opponent = -player
                    if history[opponent]["state"] is not None:
                        agent.update_q(
                            history[opponent]["state"],
                            history[opponent]["action"],
                            0.5,
                            next_state,
                            [],
                            True
                        )
                else:
                    # Winner exists: +1.0 for winner, -1.0 for loser
                    if winner == player:
                        # Current player won
                        agent.update_q(state, action, 1.0, next_state, [], True)
                        # Opponent lost
                        opponent = -player
                        if history[opponent]["state"] is not None:
                            agent.update_q(
                                history[opponent]["state"],
                                history[opponent]["action"],
                                -1.0,
                                next_state,
                                [],
                                True
                            )
                    else:
                        # Current player lost
                        agent.update_q(state, action, -1.0, next_state, [], True)
                        # Opponent won
                        opponent = -player
                        if history[opponent]["state"] is not None:
                            agent.update_q(
                                history[opponent]["state"],
                                history[opponent]["action"],
                                1.0,
                                next_state,
                                [],
                                True
                            )
            
            state = next_state
        
        # Decay exploration rate after each episode
        agent.decay_exploration()
        
        # Progress reporting
        if (episode + 1) % 10000 == 0:
            print(f"Episode {episode + 1}/{episodes} - Q-table size: {len(agent.q_table)}, Epsilon: {agent.epsilon:.4f}")
    
    print(f"\nTraining complete! Final Q-table size: {len(agent.q_table)}")
    return agent


if __name__ == "__main__":
    # Example usage
    trained_agent = train_agent(episodes=100000)
    print(f"Agent trained with {len(trained_agent.q_table)} unique states in Q-table")
