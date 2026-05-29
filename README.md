# 🎮 Tic-Tac-Toe Q-Learning AI

A professional Reinforcement Learning implementation of Tic-Tac-Toe using **Q-Learning** with epsilon-greedy exploration. Self-teaching agent learns optimal strategies through self-play.

## 📋 Project Structure

```
TIC-TOC-TIC/
├── src/
│   ├── __init__.py
│   └── game_engine.py           # TicTacToe class - immutable tuple-based board
├── agent/
│   ├── __init__.py
│   └── q_agent.py               # QLearningAgent - Q-Learning with epsilon-greedy
├── tests/
│   ├── __init__.py
│   ├── test_game_engine.py      # Core game logic tests (21 tests)
│   └── test_engine.py           # Game rule verification (16 tests)
├── requirements.txt
├── .gitignore
└── README.md
```

## 🚀 Quick Start

```bash
# Install dependencies
pip install -r requirements.txt

# Run all tests
pytest tests/ -v

# Run specific test suite
pytest tests/test_engine.py -v          # Verification tests
pytest tests/test_game_engine.py -v     # Core tests
```

## 🧠 Core Components

### Game Engine: `TicTacToe`
**File**: [src/game_engine.py](src/game_engine.py)

- **Board Representation**: Immutable 9-element tuple `(0, 0, 1, -1, ...)`
  - `0` = empty, `1` = X (agent), `-1` = O (opponent)
- **Key Methods**:
  - `reset()` → returns initial board
  - `make_move(action)` → returns `(board, winner, done)`
  - `get_available_actions()` → list of valid positions
  - `check_winner()` → detects win/draw
- **Immutability**: Tuples allow board states as Q-table dictionary keys

### Q-Learning Agent: `QLearningAgent`
**File**: [agent/q_agent.py](agent/q_agent.py)

**Q-Learning Update Rule:**
$$Q(s, a) \leftarrow Q(s, a) + \alpha \left( r + \gamma \max_{a'} Q(s', a') - Q(s, a) \right)$$

- **Configuration**:
  - `alpha=0.5`: Learning rate
  - `gamma=0.9`: Discount factor
  - `epsilon=0.3`: Exploration probability (initial)
  - `min_epsilon=0.01`: Minimum exploration rate
  - `decay_rate=0.9999`: Epsilon decay factor

- **Key Methods**:
  - `choose_action(state, available_actions)` → epsilon-greedy action selection
  - `update_q(state, action, reward, next_state, next_actions, done)` → Q-table update
  - `decay_exploration()` → reduce epsilon over time
  - `get_q_table_size()` → monitor learning progress

## 📊 Day 1: Game Engine & Agent Initialization (Complete)

| Commit | Message | Status | Tests |
|--------|---------|--------|-------|
| `23dbc89` | feat(game): implement TicTacToe core game engine class | ✅ | 21 pass |
| `28ba19c` | test(game): add unit tests for TicTacToe game rules and state changes | ✅ | 16 pass |
| `a4260a5` | feat(agent): create QLearningAgent class with epsilon-greedy policy | ✅ | Verified |

**Total Tests**: 37 passing ✨

### Commit 1.2: Game Engine Implementation
- Replaced numpy-based implementation with optimized tuple-based `TicTacToe` class
- Immutable board states for Q-table dictionary keys
- Complete win detection (rows, columns, diagonals)
- Draw detection
- Player alternation

### Commit 1.3: Game Engine Verification Tests
- 16 focused verification tests:
  - Valid moves & state transitions
  - Player alternation
  - Win detection (all configurations)
  - Draw conditions
  - Board state integrity
  - Complete game flows

### Commit 1.4: Q-Learning Agent
- `QLearningAgent` class with full epsilon-greedy policy
- Dictionary-based Q-table: `{state_tuple: {action: q_value}}`
- Configurable hyperparameters
- Q-table persistence (save/load)
- Verified integration with game engine

## 🧪 Testing

**Run All Tests:**
```bash
pytest tests/ -v
```

**Expected Output:**
```
37 tests total
- 21 core game engine tests
- 16 game rule verification tests
```

**Test Coverage:**
- ✅ Game initialization and reset
- ✅ Valid/invalid move handling
- ✅ Player alternation
- ✅ Win detection (all 8 winning combinations)
- ✅ Draw detection (board full, no winner)
- ✅ Board state integrity
- ✅ Q-agent initialization
- ✅ Epsilon-greedy action selection
- ✅ Q-value updates

## 📈 Next Steps (Day 2-3)

- [ ] Training loop implementation (self-play)
- [ ] Reward shaping and episode tracking
- [ ] Model persistence (save/load trained agents)
- [ ] Performance evaluation metrics
- [ ] Visualization dashboard
- [ ] VS human player interface

## 🔧 Configuration

Customize agent hyperparameters in your training script:

```python
from agent.q_agent import QLearningAgent
from src.game_engine import TicTacToe

agent = QLearningAgent(
    alpha=0.5,        # Learning rate
    gamma=0.9,        # Discount factor
    epsilon=0.3,      # Exploration probability
    min_epsilon=0.01, # Minimum exploration
    decay_rate=0.9999 # Decay per episode
)
```

## 📝 License

MIT License - Open for educational and research use.
