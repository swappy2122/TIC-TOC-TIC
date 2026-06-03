/**
 * Q-Learning AI Brain Visualizer
 * 
 * Renders the Q-value heatmap, move confidence metrics, decision logs, 
 * and controls the collapsible toggle behavior of the dashboard card.
 */

const AIVisualizer = {
  /**
   * Initialize visualizer event listeners (collapsible behavior)
   */
  init() {
    const collapsible = document.getElementById('aiBrainTitle');
    const content = document.getElementById('aiBrainContent');
    
    if (collapsible && content) {
      collapsible.addEventListener('click', () => {
        const isCollapsed = content.classList.toggle('collapsed');
        collapsible.classList.toggle('collapsed');
        
        // Save collapse preference to localStorage
        localStorage.setItem('tictactoe_aibrain_collapsed', isCollapsed ? 'true' : 'false');
      });

      // Load collapse preference
      const savedPreference = localStorage.getItem('tictactoe_aibrain_collapsed');
      if (savedPreference === 'true') {
        content.classList.add('collapsed');
        collapsible.classList.add('collapsed');
      }
    }

    this.reset();
  },

  /**
   * Color mapping for heatmap Q-values
   * @param {number} qVal 
   * @returns {string} - RGBA color string
   */
  getQColor(qVal) {
    if (qVal === undefined || qVal === null) {
      return 'rgba(255, 255, 255, 0.05)'; // gray for occupied/unavailable
    }
    
    if (qVal >= 0) {
      // Scale alpha from 0.15 for Q=0, up to 0.9 for Q=1
      const alpha = 0.15 + qVal * 0.75;
      return `rgba(0, 255, 136, ${alpha})`; // Bright green
    } else {
      // Scale alpha from 0.15 for Q=0, up to 0.9 for Q=-1
      const absQ = Math.abs(qVal);
      const alpha = 0.15 + absQ * 0.75;
      return `rgba(255, 107, 157, ${alpha})`; // Dim neon pink/red
    }
  },

  /**
   * Renders the 3x3 mini heatmap grid
   * @param {number[]} board - Current board state
   * @param {number[]} availableActions - Actions available at this turn
   * @param {object} qValues - Q-values map for the state
   * @param {number} chosenAction - Selected action
   */
  renderHeatmap(board, availableActions, qValues, chosenAction) {
    const grid = document.getElementById('heatmapGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    for (let i = 0; i < 9; i++) {
      const cell = document.createElement('div');
      cell.className = 'heatmap-cell';
      
      const isOccupied = board[i] !== 0;
      
      if (isOccupied) {
        cell.classList.add('occupied');
        cell.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
        cell.setAttribute('data-tooltip', 'Occupied');
      } else {
        const qVal = qValues[i] !== undefined ? qValues[i] : 0.0;
        cell.style.backgroundColor = this.getQColor(qVal);
        cell.setAttribute('data-tooltip', `Cell ${i}: Q = ${qVal.toFixed(3)}`);
        
        if (i === chosenAction) {
          cell.classList.add('best-move');
        }
      }
      
      grid.appendChild(cell);
    }
  },

  /**
   * Calculates move confidence: (best Q - second best Q) / 2
   * @param {object} qValues 
   * @param {number[]} availableActions 
   */
  updateConfidence(qValues, availableActions) {
    const valueEl = document.getElementById('confidenceValue');
    const barEl = document.getElementById('confidenceBar');
    if (!valueEl || !barEl) return;

    if (availableActions.length <= 1) {
      // Only one move left (forced move), 100% confidence
      valueEl.textContent = '100%';
      barEl.style.width = '100%';
      return;
    }

    const vals = availableActions.map(action => qValues[action] !== undefined ? qValues[action] : 0.0);
    vals.sort((a, b) => b - a);

    const q0 = vals[0];
    const q1 = vals[1];
    
    const diff = q0 - q1;
    // Scale diff (maximum difference is 2.0: 1.0 to -1.0)
    const confidencePct = Math.max(0, Math.min(100, Math.round((diff / 2.0) * 100)));
    
    valueEl.textContent = `${confidencePct}%`;
    barEl.style.width = `${confidencePct}%`;
  },

  /**
   * Appends decision comparative logs
   */
  appendDecisionLog(chosenAction, qValues, availableActions) {
    const logEl = document.getElementById('decisionLog');
    if (!logEl) return;

    const emptyLog = logEl.querySelector('.log-empty');
    if (emptyLog) emptyLog.remove();

    const chosenQ = (qValues[chosenAction] !== undefined ? qValues[chosenAction] : 0.0).toFixed(2);
    let logMessage = '';

    if (availableActions.length === 1) {
      logMessage = `AI played cell ${chosenAction} (Q=${chosenQ}) [Forced Move]`;
    } else {
      const alternatives = availableActions.filter(a => a !== chosenAction);
      
      let bestAlt = alternatives[0];
      let bestAltQ = qValues[bestAlt] !== undefined ? qValues[bestAlt] : 0.0;
      
      alternatives.forEach(alt => {
        const altQ = qValues[alt] !== undefined ? qValues[alt] : 0.0;
        if (altQ > bestAltQ) {
          bestAlt = alt;
          bestAltQ = altQ;
        }
      });

      logMessage = `AI chose cell ${chosenAction} (Q=${chosenQ}) over cell ${bestAlt} (Q=${bestAltQ.toFixed(2)})`;
    }

    const item = document.createElement('div');
    item.className = 'log-item';
    item.textContent = logMessage;
    
    logEl.appendChild(item);
    
    // Auto-scroll to the latest log
    logEl.scrollTop = logEl.scrollHeight;
  },

  /**
   * Reset the visualizer elements
   */
  reset() {
    const grid = document.getElementById('heatmapGrid');
    if (grid) {
      grid.innerHTML = '';
      for (let i = 0; i < 9; i++) {
        const cell = document.createElement('div');
        cell.className = 'heatmap-cell occupied';
        grid.appendChild(cell);
      }
    }

    const valueEl = document.getElementById('confidenceValue');
    const barEl = document.getElementById('confidenceBar');
    if (valueEl) valueEl.textContent = '0%';
    if (barEl) barEl.style.width = '0%';

    const logEl = document.getElementById('decisionLog');
    if (logEl) {
      logEl.innerHTML = '<div class="log-empty">Waiting for AI move...</div>';
    }
  }
};

// Export or attach to window
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AIVisualizer;
} else {
  window.AIVisualizer = AIVisualizer;
}
