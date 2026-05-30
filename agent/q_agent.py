"""
Q-Learning Agent for Tic-Tac-Toe.
Implements epsilon-greedy policy for exploration-exploitation trade-off.

Q-Learning Update Rule:
Q(s, a) ← Q(s, a) + α(r + γ max_a' Q(s', a') - Q(s, a))

Where:
- α (alpha): Learning rate [0, 1]
- γ (gamma): Discount factor [0, 1]
- ε (epsilon): Exploration probability [0, 1]
"""

import random
from typing import Dict, List, Tuple, Optional


class QLearningAgent:
    """
    Q-Learning Agent for Tic-Tac-Toe using epsilon-greedy exploration.
    
    Q-Table Structure: {state_tuple: {action_int: q_value_float}}
    - state_tuple: Immutable representation of board (9-element tuple)
    - action_int: Board position (0-8)
    - q_value_float: Expected discounted reward for state-action pair
    """
    
    def __init__(
        self,
        alpha: float = 0.5,
        gamma: float = 0.9,
        epsilon: float = 0.3,
        min_epsilon: float = 0.01,
        decay_rate: float = 0.9999
    ):
        """
        Initialize Q-Learning Agent.
        
        Args:
            alpha: Learning rate [0, 1]. Higher = faster learning but less stable.
            gamma: Discount factor [0, 1]. Higher = considers future rewards more.
            epsilon: Initial exploration probability [0, 1].
            min_epsilon: Minimum exploration probability after decay.
            decay_rate: Factor to decay epsilon each episode.
        """
        self.q_table: Dict[Tuple, Dict[int, float]] = {}  # {state: {action: q_value}}
        self.alpha = alpha
        self.gamma = gamma
        self.epsilon = epsilon
        self.min_epsilon = min_epsilon
        self.decay_rate = decay_rate

    def get_q_values(
        self,
        state: Tuple,
        available_actions: List[int]
    ) -> Dict[int, float]:
        """
        Get Q-values for a state. Initialize if not in Q-table.
        
        Args:
            state: Board state as tuple.
            available_actions: List of valid action indices.
            
        Returns:
            Dictionary of {action: q_value} for the state.
        """
        if state not in self.q_table:
            self.q_table[state] = {action: 0.0 for action in available_actions}
        return self.q_table[state]

    def choose_action(
        self,
        state: Tuple,
        available_actions: List[int]
    ) -> int:
        """
        Choose action using epsilon-greedy policy.
        
        With probability ε: choose random action (exploration)
        With probability 1-ε: choose best Q-value action (exploitation)
        
        Args:
            state: Board state as tuple.
            available_actions: List of valid action indices.
            
        Returns:
            Chosen action index (0-8).
        """
        # Epsilon-greedy exploration
        if random.random() < self.epsilon:
            return random.choice(available_actions)
        
        # Exploitation: choose action with highest Q-value
        q_vals = self.get_q_values(state, available_actions)
        max_val = max(q_vals.values())
        best_actions = [a for a, q in q_vals.items() if q == max_val]
        return random.choice(best_actions)

    def update_q(
        self,
        state: Tuple,
        action: int,
        reward: float,
        next_state: Tuple,
        next_actions: List[int],
        done: bool
    ) -> None:
        """
        Update Q-value using Q-Learning update rule.
        
        Q(s, a) ← Q(s, a) + α(r + γ max_a' Q(s', a') - Q(s, a))
        
        Args:
            state: Current board state.
            action: Action taken.
            reward: Reward received.
            next_state: Resulting board state.
            next_actions: Available actions in next state.
            done: Whether episode is finished.
        """
        q_vals = self.get_q_values(state, [action])
        current_q = q_vals.get(action, 0.0)
        
        if done:
            # Terminal state: target Q = reward only
            target = reward
        else:
            # Non-terminal: target Q = reward + discounted future reward
            next_q_vals = self.get_q_values(next_state, next_actions)
            max_next_q = max(next_q_vals.values(), default=0.0)
            target = reward + self.gamma * max_next_q
        
        # Q-Learning update
        new_q = current_q + self.alpha * (target - current_q)
        q_vals[action] = new_q

    def decay_exploration(self) -> None:
        """
        Decay epsilon to reduce exploration over time.
        Gradually shifts from exploration to exploitation.
        """
        self.epsilon = max(self.min_epsilon, self.epsilon * self.decay_rate)

    def get_epsilon(self) -> float:
        """
        Get current exploration probability.
        
        Returns:
            Current epsilon value.
        """
        return self.epsilon

    def get_q_table_size(self) -> int:
        """
        Get number of states in Q-table.
        
        Returns:
            Number of unique states visited.
        """
        return len(self.q_table)

    def reset_q_table(self) -> None:
        """Reset Q-table to empty state."""
        self.q_table = {}

    def save_policy(self, filepath: str) -> None:
        """
        Save learned policy (Q-table) to JSON file.
        
        Converts tuple keys to strings for JSON compatibility.
        
        Args:
            filepath: Path to save policy file.
        """
        import json
        # Convert tuples to strings for JSON serialization
        q_table_str = {str(state): actions for state, actions in self.q_table.items()}
        with open(filepath, 'w') as f:
            json.dump(q_table_str, f, indent=2)
        print(f"Policy saved to {filepath}")

    def load_policy(self, filepath: str) -> None:
        """
        Load learned policy (Q-table) from JSON file.
        
        Converts string keys back to tuples for Q-Learning and action keys back to integers.
        
        Args:
            filepath: Path to load policy file from.
        """
        import json
        with open(filepath, 'r') as f:
            q_table_str = json.load(f)
        # Convert strings back to tuples for states and strings back to ints for actions
        self.q_table = {
            eval(state_str): {int(action_str): q_val for action_str, q_val in actions.items()}
            for state_str, actions in q_table_str.items()
        }
        print(f"Policy loaded from {filepath}. Q-table size: {len(self.q_table)}")
