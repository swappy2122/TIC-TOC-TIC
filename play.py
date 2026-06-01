"""
Interactive command-line interface for playing Tic-Tac-Toe against the trained AI agent.

A human player can choose to play as X or O and compete against the trained agent.
The board is displayed in a clean format with position numbers for easy input.

Usage:
    python play.py                    # Play against AI using default trained model
    python play.py --model models/my_agent.json  # Use custom trained model
"""

import argparse
import sys
from pathlib import Path

from src.game_engine import TicTacToe
from agent.q_agent import QLearningAgent


def display_board(board: tuple) -> None:
    """
    Display the game board in a beautiful text format.
    
    The board shows:
    - X and O for played positions
    - Numbers (0-8) for available moves
    
    Args:
        board: 9-element tuple representing the board state.
    """
    # Map values: 1 for X, -1 for O, 0 for empty (show position number)
    symbols = []
    for i, cell in enumerate(board):
        if cell == 1:
            symbols.append('X')
        elif cell == -1:
            symbols.append('O')
        else:
            symbols.append(str(i))
    
    print("\n")
    print(f"  {symbols[0]} | {symbols[1]} | {symbols[2]}")
    print("  -----------")
    print(f"  {symbols[3]} | {symbols[4]} | {symbols[5]}")
    print("  -----------")
    print(f"  {symbols[6]} | {symbols[7]} | {symbols[8]}")
    print()


def get_human_move(game: TicTacToe) -> int:
    """
    Get a valid move from the human player via CLI input.
    
    Validates that:
    - Input is a number between 0-8
    - The position is not already taken
    
    Args:
        game: The TicTacToe game engine instance.
        
    Returns:
        Valid move position (0-8).
    """
    available = game.get_available_actions()
    
    while True:
        try:
            user_input = input("🎮 Your move (0-8): ").strip()
            move = int(user_input)
            
            if move not in available:
                print(f"❌ Invalid move! Position {move} is either taken or out of range.")
                print(f"   Available positions: {available}")
                continue
            
            return move
        except ValueError:
            print("❌ Invalid input. Please enter a number between 0 and 8.")


def play_game(agent: QLearningAgent, human_player: int, model_path: str) -> None:
    """
    Execute a complete game of Tic-Tac-Toe between human and AI.
    
    Args:
        agent: The trained QLearningAgent instance.
        human_player: 1 if human is X, -1 if human is O.
        model_path: Path to the trained model (for display purposes).
    """
    game = TicTacToe()
    ai_player = -human_player
    
    print("=" * 50)
    print("🎮 TIC-TAC-TOE: HUMAN vs AI")
    print("=" * 50)
    print(f"Model: {model_path}")
    print(f"You are: {'X' if human_player == 1 else 'O'}")
    print(f"AI is:   {'O' if human_player == 1 else 'X'}")
    print("\nEnter a number (0-8) to place your move on the board:")
    print("  0 | 1 | 2")
    print("  ---------")
    print("  3 | 4 | 5")
    print("  ---------")
    print("  6 | 7 | 8")
    
    move_count = 0
    
    while True:
        move_count += 1
        display_board(game.board)
        
        # Determine who plays this turn
        if game.current_player == human_player:
            print(f"[Move {move_count}] Your turn (You are {('X' if human_player == 1 else 'O')}):")
            move = get_human_move(game)
            print(f"✅ You placed on position {move}")
        else:
            print(f"[Move {move_count}] AI is thinking...")
            available_actions = game.get_available_actions()
            move = agent.choose_action(game.board, available_actions)
            print(f"🤖 AI placed on position {move} ({'X' if ai_player == 1 else 'O'})")
        
        # Make the move
        _, winner, done = game.make_move(move)
        
        # Check game state
        if done:
            display_board(game.board)
            print("=" * 50)
            
            if winner == 1:  # X won
                if human_player == 1:
                    print("🎉 YOU WIN! Congratulations!")
                else:
                    print("🤖 AI WINS! Better luck next time.")
            elif winner == -1:  # O won
                if human_player == -1:
                    print("🎉 YOU WIN! Congratulations!")
                else:
                    print("🤖 AI WINS! Better luck next time.")
            else:  # Draw
                print("🤝 It's a DRAW! Well played!")
            
            print("=" * 50)
            break


def main():
    """Main CLI entry point for interactive play."""
    parser = argparse.ArgumentParser(
        description="Play Tic-Tac-Toe against a trained AI agent",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python play.py                              # Play with default model
  python play.py --model models/my_agent.json  # Use custom model
        """
    )
    
    parser.add_argument(
        '--model',
        type=str,
        default='models/trained_agent.json',
        help='Path to trained agent model (default: models/trained_agent.json)'
    )
    
    args = parser.parse_args()
    
    # Check if model file exists
    model_path = Path(args.model)
    if not model_path.exists():
        print(f"❌ Error: Model file not found at {args.model}")
        print("   Please train an agent first with: python train.py")
        sys.exit(1)
    
    # Load the trained agent
    print(f"🤖 Loading trained agent from {args.model}...")
    agent = QLearningAgent()
    agent.load_policy(args.model)
    
    # Set epsilon to 0.0 for no exploration (pure exploitation)
    agent.epsilon = 0.0
    print("✅ Agent loaded in exploitation mode (epsilon = 0.0)")
    
    # Ask human to choose X or O
    print("\n" + "=" * 50)
    while True:
        player_choice = input("Do you want to play as X or O? (x/o): ").strip().upper()
        if player_choice in ['X', 'O']:
            break
        print("❌ Invalid choice. Please enter 'x' or 'o'.")
    
    human_symbol = 1 if player_choice == 'X' else -1
    
    # Play the game
    play_game(agent, human_symbol, args.model)
    
    # Ask to play again
    while True:
        again = input("\nPlay again? (y/n): ").strip().lower()
        if again == 'y':
            # Reset and play again with same choice
            play_game(agent, human_symbol, args.model)
        elif again == 'n':
            print("\n👋 Thanks for playing! Goodbye.")
            break
        else:
            print("❌ Invalid choice. Please enter 'y' or 'n'.")


if __name__ == '__main__':
    main()
