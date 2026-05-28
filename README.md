# Tic-Tac-Toe RL Agent

A Reinforcement Learning implementation of Tic-Tac-Toe using Q-Learning.

## Project Structure

```
tic-tac-toe-rl/
├── src/
│   ├── __init__.py
│   ├── game_engine.py      # Core Tic-Tac-Toe rules
│   └── agent.py            # Q-Learning agent
├── tests/
│   ├── __init__.py
│   └── test_game_engine.py # Unit tests
├── models/                 # Trained models directory
├── requirements.txt
├── .gitignore
└── README.md
```

## Setup

```bash
pip install -r requirements.txt
pytest tests/
```

## Overview

- **Core ML**: Q-Learning agent trained through self-play
- **Game Engine**: Tic-Tac-Toe game rules and state management
- **Testing**: Comprehensive unit tests for game logic

## Day 1: Game Engine & Agent Initialization

### Commit 1.1: Project Setup & Infrastructure ✅
- [x] Project setup and infrastructure
- [x] Core game engine implementation
- [x] Unit tests for game logic (60+ tests)
- [x] Q-Learning agent initialization

**Implementation Details:**
- `GameEngine`: Full Tic-Tac-Toe rules (win detection, draws, move validation)
- `QLearningAgent`: Epsilon-greedy exploration, Q-table management, self-play training
- Comprehensive test suite covering all game scenarios
- Model save/load functionality for trained agents
