"""
Q-Learning agent for Tic-Tac-Toe.
Implements reinforcement learning agent with state representation and Q-value tracking.
"""

import numpy as np
from typing import Dict, Tuple, List, Optional
import json
import os
from src.game_engine import GameEngine, Player


class QLearningAgent:
    """
    Q-Learning agent for Tic-Tac-Toe.
    
    State representation: Flattened board state (9 elements) converted to tuple.
    Q-values stored in dictionary: state -> {action: q_value}
    """
    
    def __init__(self, learning_rate: float = 0.1, discount_factor: float = 0.95,
                 exploration_rate: float = 0.1):
        """
        Initialize Q-Learning agent.
        
        Args:
            learning_rate: Learning rate (alpha) for Q-value updates.
            discount_factor: Discount factor (gamma) for future rewards.
            exploration_rate: Epsilon for epsilon-greedy exploration.
        """
        self.learning_rate = learning_rate
        self.discount_factor = discount_factor
        self.exploration_rate = exploration_rate
        
        # Q-table: {state: {action: q_value}}
        self.q_table: Dict[Tuple[int, ...], Dict[int, float]] = {}
        
        # Statistics
        self.total_games = 0
        self.wins = 0
        self.losses = 0
        self.draws = 0
    
    def _state_to_key(self, state: np.ndarray) -> Tuple[int, ...]:
        """
        Convert board state to hashable dictionary key.
        
        Args:
            state: Flattened board state.
            
        Returns:
            Tuple representation of state.
        """
        return tuple(state.flatten().astype(int))
    
    def _initialize_state(self, state: np.ndarray) -> None:
        """
        Initialize state in Q-table if not present.
        
        Args:
            state: Board state.
        """
        state_key = self._state_to_key(state)
        if state_key not in self.q_table:
            self.q_table[state_key] = {}
    
    def get_valid_actions(self, engine: GameEngine) -> List[int]:
        """
        Get valid actions for current state.
        
        Args:
            engine: Game engine instance.
            
        Returns:
            List of valid move positions.
        """
        return engine.get_valid_moves()
    
    def select_action(self, engine: GameEngine, training: bool = True) -> int:
        """
        Select action using epsilon-greedy strategy.
        
        Args:
            engine: Game engine instance.
            training: If True, use epsilon-greedy; if False, use greedy.
            
        Returns:
            Selected action (move position).
        """
        state = engine.get_board_state()
        state_key = self._state_to_key(state)
        valid_actions = self.get_valid_actions(engine)
        
        # Initialize state if new
        self._initialize_state(state)
        
        # Epsilon-greedy selection
        if training and np.random.random() < self.exploration_rate:
            # Explore: random action
            return np.random.choice(valid_actions)
        else:
            # Exploit: best Q-value action
            q_values = self.q_table[state_key]
            
            # Filter to valid actions
            valid_q_values = {a: q_values.get(a, 0.0) for a in valid_actions}
            
            if not valid_q_values:
                return np.random.choice(valid_actions)
            
            # Return action with max Q-value
            max_q = max(valid_q_values.values())
            best_actions = [a for a, q in valid_q_values.items() if q == max_q]
            return np.random.choice(best_actions)
    
    def update_q_value(self, state: np.ndarray, action: int, reward: float,
                       next_state: np.ndarray, next_valid_actions: List[int]) -> None:
        """
        Update Q-value using Q-learning formula.
        
        Q(s,a) = Q(s,a) + α[r + γmax(Q(s',a')) - Q(s,a)]
        
        Args:
            state: Current state.
            action: Action taken.
            reward: Reward received.
            next_state: Next state.
            next_valid_actions: Valid actions in next state.
        """
        state_key = self._state_to_key(state)
        next_state_key = self._state_to_key(next_state)
        
        # Initialize states if needed
        self._initialize_state(state)
        self._initialize_state(next_state)
        
        # Initialize action if needed
        if action not in self.q_table[state_key]:
            self.q_table[state_key][action] = 0.0
        
        # Calculate max Q-value for next state
        if next_valid_actions:
            next_q_values = {a: self.q_table[next_state_key].get(a, 0.0)
                           for a in next_valid_actions}
            max_next_q = max(next_q_values.values())
        else:
            max_next_q = 0.0
        
        # Q-learning update
        current_q = self.q_table[state_key][action]
        new_q = current_q + self.learning_rate * (reward + self.discount_factor * max_next_q - current_q)
        self.q_table[state_key][action] = new_q
    
    def play_game(self, opponent_agent: 'QLearningAgent' = None, 
                  training: bool = True) -> Tuple[Optional[Player], List]:
        """
        Play a complete game of Tic-Tac-Toe.
        
        Args:
            opponent_agent: Opponent Q-Learning agent (self-play if None).
            training: Whether to train during gameplay.
            
        Returns:
            Tuple of (winner, list of (state, action, reward) for this agent).
        """
        engine = GameEngine()
        self_history = []  # Track states, actions, rewards for this agent
        
        # Determine which player this agent is
        agent_player = Player.X
        opponent = opponent_agent if opponent_agent else self
        
        while not engine.is_game_over():
            state = engine.get_board_state()
            
            if engine.current_player == agent_player:
                # This agent's turn
                action = self.select_action(engine, training=training)
                engine.make_move(action)
                self_history.append((state.copy(), action))
            else:
                # Opponent's turn
                action = opponent.select_action(engine, training=training)
                engine.make_move(action)
        
        winner = engine.get_winner()
        
        # Update statistics
        self.total_games += 1
        if winner == agent_player:
            self.wins += 1
        elif winner is not None:
            self.losses += 1
        else:
            self.draws += 1
        
        return winner, self_history
    
    def train(self, episodes: int = 1000, verbose: bool = False) -> None:
        """
        Train agent through self-play.
        
        Args:
            episodes: Number of training episodes.
            verbose: Print progress every 100 episodes.
        """
        for episode in range(episodes):
            # Play game against itself
            engine = GameEngine()
            states_actions_x = []
            states_actions_o = []
            
            while not engine.is_game_over():
                state = engine.get_board_state()
                valid_actions = engine.get_valid_moves()
                
                # Select action (training mode)
                action = self.select_action(engine, training=True)
                
                if engine.current_player == Player.X:
                    states_actions_x.append((state.copy(), action))
                else:
                    states_actions_o.append((state.copy(), action))
                
                engine.make_move(action)
            
            # Backpropagate rewards
            winner = engine.get_winner()
            
            # Reward: +1 for win, -1 for loss, 0 for draw
            x_reward = 1.0 if winner == Player.X else (-1.0 if winner == Player.O else 0.0)
            o_reward = 1.0 if winner == Player.O else (-1.0 if winner == Player.X else 0.0)
            
            # Update Q-values for X
            for i, (state, action) in enumerate(states_actions_x):
                if i < len(states_actions_x) - 1:
                    next_state = states_actions_x[i + 1][0]
                else:
                    next_state = states_actions_o[-1][0] if states_actions_o else engine.get_board_state()
                
                next_valid = [a for a in range(9) if next_state.flat[a] == 0] or [0]
                self.update_q_value(state, action, x_reward, next_state, next_valid)
            
            # Update Q-values for O
            for i, (state, action) in enumerate(states_actions_o):
                if i < len(states_actions_o) - 1:
                    next_state = states_actions_o[i + 1][0]
                else:
                    next_state = engine.get_board_state()
                
                next_valid = [a for a in range(9) if next_state.flat[a] == 0] or [0]
                self.update_q_value(state, action, o_reward, next_state, next_valid)
            
            # Statistics
            if verbose and (episode + 1) % 100 == 0:
                win_rate = (self.wins / self.total_games) * 100 if self.total_games > 0 else 0
                print(f"Episode {episode + 1}/{episodes} - Win rate: {win_rate:.1f}% "
                      f"({self.wins}W/{self.losses}L/{self.draws}D)")
    
    def save_model(self, filepath: str) -> None:
        """
        Save trained model to JSON file.
        
        Args:
            filepath: Path to save model.
        """
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        
        # Convert Q-table for JSON serialization
        q_table_json = {
            str(k): v for k, v in self.q_table.items()
        }
        
        model_data = {
            'q_table': q_table_json,
            'learning_rate': self.learning_rate,
            'discount_factor': self.discount_factor,
            'exploration_rate': self.exploration_rate,
            'total_games': self.total_games,
            'wins': self.wins,
            'losses': self.losses,
            'draws': self.draws
        }
        
        with open(filepath, 'w') as f:
            json.dump(model_data, f, indent=2)
    
    def load_model(self, filepath: str) -> None:
        """
        Load trained model from JSON file.
        
        Args:
            filepath: Path to load model from.
        """
        with open(filepath, 'r') as f:
            model_data = json.load(f)
        
        # Reconstruct Q-table
        self.q_table = {}
        for k_str, v in model_data['q_table'].items():
            # Parse the string representation of tuple
            k = tuple(map(int, k_str.strip('()').split(', ')))
            self.q_table[k] = {int(action): float(q) for action, q in v.items()}
        
        self.learning_rate = model_data['learning_rate']
        self.discount_factor = model_data['discount_factor']
        self.exploration_rate = model_data['exploration_rate']
        self.total_games = model_data['total_games']
        self.wins = model_data['wins']
        self.losses = model_data['losses']
        self.draws = model_data['draws']
    
    def get_statistics(self) -> Dict:
        """
        Get training statistics.
        
        Returns:
            Dictionary with statistics.
        """
        win_rate = (self.wins / self.total_games * 100) if self.total_games > 0 else 0
        return {
            'total_games': self.total_games,
            'wins': self.wins,
            'losses': self.losses,
            'draws': self.draws,
            'win_rate': win_rate,
            'q_table_size': len(self.q_table)
        }
