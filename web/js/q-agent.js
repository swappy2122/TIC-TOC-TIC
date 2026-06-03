/**
 * Q-Learning Agent for Tic-Tac-Toe
 * Pure JavaScript port of agent/q_agent.py
 * 
 * Implements epsilon-greedy policy for exploration-exploitation trade-off.
 */

class QAgent {
  /**
   * Initialize QAgent
   * @param {number} epsilon - Exploration rate (0.0 for pure exploitation/optimal play)
   */
  constructor(epsilon = 0.0) {
    this.epsilon = epsilon;
    this.qTable = {}; // Structure: { "0,1,0,...": { action_int: q_value_float } }
  }

  /**
   * Set the pre-trained Q-table
   * @param {object} qTable - Loaded and parsed Q-table
   */
  setQTable(qTable) {
    this.qTable = qTable;
  }

  /**
   * Get Q-values for a state. Defaults to 0.0 for all actions if state not in Q-table.
   * @param {number[]} state - Board state as 9-element array
   * @param {number[]} availableActions - Array of valid cell indices (0-8)
   * @returns {object} - Map of { action: q_value }
   */
  getQValues(state, availableActions) {
    const key = state.join(',');
    if (this.qTable && this.qTable[key]) {
      return this.qTable[key];
    }
    
    // Default: return 0.0 for all valid actions
    const defaultVals = {};
    availableActions.forEach(action => {
      defaultVals[action] = 0.0;
    });
    return defaultVals;
  }

  /**
   * Choose an action using the epsilon-greedy policy
   * @param {number[]} state - Board state as 9-element array
   * @param {number[]} availableActions - Array of valid cell indices (0-8)
   * @returns {number|null} - Chosen action index (0-8)
   */
  chooseAction(state, availableActions) {
    if (!availableActions || availableActions.length === 0) {
      return null;
    }

    // Epsilon-greedy exploration
    if (Math.random() < this.epsilon) {
      const randomIndex = Math.floor(Math.random() * availableActions.length);
      console.log(`[AI] Exploring: chose random action ${availableActions[randomIndex]}`);
      return availableActions[randomIndex];
    }

    // Exploitation: choose action with highest Q-value
    const qVals = this.getQValues(state, availableActions);
    
    // Find the maximum Q-value for available actions
    let maxVal = -Infinity;
    availableActions.forEach(action => {
      const val = qVals[action] !== undefined ? qVals[action] : 0.0;
      if (val > maxVal) {
        maxVal = val;
      }
    });

    // Get all available actions that match the maximum Q-value
    const bestActions = availableActions.filter(action => {
      const val = qVals[action] !== undefined ? qVals[action] : 0.0;
      // Allow minor float differences in comparison
      return Math.abs(val - maxVal) < 1e-9;
    });

    // Choose randomly among the best actions to break ties
    const chosenAction = bestActions[Math.floor(Math.random() * bestActions.length)];
    console.log(`[AI] Exploiting: Q-values:`, qVals, `Max: ${maxVal}, Selected: ${chosenAction}`);
    return chosenAction;
  }
}

// Export for module systems or attach to global window
if (typeof module !== 'undefined' && module.exports) {
  module.exports = QAgent;
} else {
  window.QAgent = QAgent;
}
