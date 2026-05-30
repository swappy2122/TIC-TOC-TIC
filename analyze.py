"""
Evaluation script to analyze trained agent performance against a random baseline.

Runs 1,000 matches where the trained agent (epsilon=0, pure exploitation) plays 
against a random player and reports win/loss/draw statistics.

Usage:
    python analyze.py --policy models/trained_agent.json
    python analyze.py --policy models/trained_agent.json --matches 1000
"""

import argparse
import random
from pathlib import Path
from src.game_engine import TicTacToe
from agent.q_agent import QLearningAgent


class RandomPlayer:
    """Simple baseline: random move player."""
    
    def choose_action(self, actions):
        """Choose a random action from available moves."""
        return random.choice(actions)


def evaluate_agent(agent: QLearningAgent, matches: int = 1000):
    """
    Evaluate trained agent against random player.
    
    Agent plays as X (first player) and random player as O.
    
    Args:
        agent: Trained QLearningAgent with loaded policy.
        matches: Number of matches to play.
        
    Returns:
        Dictionary with results: {wins, losses, draws, win_rate, loss_rate, draw_rate}
    """
    random_player = RandomPlayer()
    
    # Set epsilon to 0 for pure exploitation (no exploration)
    original_epsilon = agent.epsilon
    agent.epsilon = 0.0
    
    results = {"wins": 0, "losses": 0, "draws": 0}
    
    for match_num in range(matches):
        game = TicTacToe()
        state = game.board
        done = False
        
        while not done:
            if game.current_player == 1:  # Agent's turn (X)
                actions = game.get_available_actions()
                action = agent.choose_action(state, actions)
            else:  # Random player's turn (O)
                actions = game.get_available_actions()
                action = random_player.choose_action(actions)
            
            state, winner, done = game.make_move(action)
        
        # Record results from agent's perspective (agent is X, player 1)
        if winner == 1:
            results["wins"] += 1
        elif winner == -1:
            results["losses"] += 1
        elif winner == 0:
            results["draws"] += 1
        
        # Progress reporting
        if (match_num + 1) % 100 == 0:
            print(f"  Completed {match_num + 1}/{matches} matches...")
    
    # Restore original epsilon
    agent.epsilon = original_epsilon
    
    # Calculate percentages
    total = matches
    results["win_rate"] = (results["wins"] / total) * 100
    results["loss_rate"] = (results["losses"] / total) * 100
    results["draw_rate"] = (results["draws"] / total) * 100
    results["total"] = total
    
    return results


def main():
    """Main CLI entry point for evaluation."""
    parser = argparse.ArgumentParser(
        description="Evaluate trained Q-Learning agent against random baseline",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python analyze.py --policy models/trained_agent.json              # Default 1000 matches
  python analyze.py --policy models/trained_agent.json --matches 500
        """
    )
    
    parser.add_argument(
        '--policy',
        type=str,
        required=True,
        help='Path to trained agent policy JSON file'
    )
    
    parser.add_argument(
        '--matches',
        type=int,
        default=1000,
        help='Number of matches to play (default: 1000)'
    )
    
    args = parser.parse_args()
    
    policy_path = Path(args.policy)
    
    # Verify policy file exists
    if not policy_path.exists():
        print(f"❌ Error: Policy file not found at {policy_path}")
        print(f"   Please train the agent first: python train.py --policy {policy_path}")
        return 1
    
    print(f"📊 Evaluating Trained Agent")
    print(f"   Policy: {policy_path}")
    print(f"   Matches: {args.matches}")
    print(f"   {'=' * 60}")
    
    # Load trained agent
    print(f"\n📥 Loading trained agent...")
    agent = QLearningAgent()
    agent.load_policy(str(policy_path))
    
    # Run evaluation
    print(f"\n🎮 Running evaluation ({args.matches} matches)...")
    results = evaluate_agent(agent, matches=args.matches)
    
    # Print results
    print(f"\n{'=' * 60}")
    print(f"📈 Results (Agent vs Random Player)")
    print(f"{'=' * 60}")
    print(f"  Wins:   {results['wins']:>5} ({results['win_rate']:>6.2f}%)")
    print(f"  Losses: {results['losses']:>5} ({results['loss_rate']:>6.2f}%)")
    print(f"  Draws:  {results['draws']:>5} ({results['draw_rate']:>6.2f}%)")
    print(f"  {'─' * 56}")
    print(f"  Total:  {results['total']:>5}")
    print(f"{'=' * 60}")
    
    # Summary
    if results['win_rate'] > 50:
        print(f"\n✅ Agent performs well! Win rate: {results['win_rate']:.2f}%")
    elif results['win_rate'] > 30:
        print(f"\n⚠️  Agent shows promise. Win rate: {results['win_rate']:.2f}%")
    else:
        print(f"\n❌ Agent needs more training. Win rate: {results['win_rate']:.2f}%")
    
    return 0


if __name__ == "__main__":
    exit(main())
