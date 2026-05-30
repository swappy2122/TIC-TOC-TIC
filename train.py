"""
CLI entry point for training the Q-Learning agent on Tic-Tac-Toe.

Usage:
    python train.py --episodes 100000 --policy models/trained_agent.json
"""

import argparse
import sys
from pathlib import Path
from training.trainer import train_agent


def main():
    """Main CLI entry point for training."""
    parser = argparse.ArgumentParser(
        description="Train a Q-Learning agent to play Tic-Tac-Toe through self-play",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python train.py                                    # Train with defaults (100k episodes)
  python train.py --episodes 50000                   # Train for 50k episodes
  python train.py --policy models/my_agent.json     # Save to custom path
  python train.py --episodes 200000 --policy models/large_model.json
        """
    )
    
    parser.add_argument(
        '--episodes',
        type=int,
        default=100000,
        help='Number of self-play episodes to train (default: 100000)'
    )
    
    parser.add_argument(
        '--policy',
        type=str,
        default='models/trained_agent.json',
        help='Path to save trained policy (default: models/trained_agent.json)'
    )
    
    args = parser.parse_args()
    
    # Ensure models directory exists
    policy_path = Path(args.policy)
    policy_path.parent.mkdir(parents=True, exist_ok=True)
    
    print(f"🎮 Starting Tic-Tac-Toe Q-Learning Agent Training")
    print(f"   Episodes: {args.episodes}")
    print(f"   Policy save path: {args.policy}")
    print(f"   {'=' * 60}")
    
    # Train the agent
    agent = train_agent(episodes=args.episodes)
    
    # Save the trained policy
    agent.save_policy(str(policy_path))
    
    print(f"\n✅ Training complete!")
    print(f"   Final Q-table size: {agent.get_q_table_size()} unique states")
    print(f"   Final epsilon: {agent.get_epsilon():.6f}")
    print(f"   Policy saved to: {policy_path}")


if __name__ == "__main__":
    main()
