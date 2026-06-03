/**
 * Q-Table Loader
 * Fetches and parses the pre-trained q-table.json, converting string representation of
 * Python tuples into standard JS array-like comma-joined string keys.
 */

const QTableLoader = {
  qTable: null,
  isLoaded: false,
  loadPromise: null,

  /**
   * Load the Q-table JSON file and parse it.
   * @returns {Promise<object>} - Resolves with the parsed Q-table
   */
  load() {
    if (this.loadPromise) {
      return this.loadPromise;
    }

    console.log('[QTableLoader] Initiating load for web/data/q-table.json...');
    this.loadPromise = fetch('data/q-table.json')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(rawData => {
        const parsedQTable = {};
        
        // Convert keys like "(0, 1, 0, 0, 0, -1, 0, 0, 0)" to "0,1,0,0,0,-1,0,0,0"
        // Also convert action keys from string digits ("0") to integers (0)
        for (const [stateStr, actions] of Object.entries(rawData)) {
          const cleanKey = stateStr
            .replace(/[()]/g, '') // remove parentheses
            .split(',')           // split by comma
            .map(s => s.trim())   // trim spaces
            .join(',');           // rejoin with commas (standard key format)

          const actionMap = {};
          for (const [actionStr, qValue] of Object.entries(actions)) {
            actionMap[parseInt(actionStr, 10)] = qValue;
          }

          parsedQTable[cleanKey] = actionMap;
        }

        this.qTable = parsedQTable;
        this.isLoaded = true;
        console.log(`[QTableLoader] Q-table loaded and parsed. Total states: ${Object.keys(this.qTable).length}`);
        return parsedQTable;
      })
      .catch(error => {
        console.error('[QTableLoader] Failed to load Q-table:', error);
        throw error;
      });

    return this.loadPromise;
  }
};

// Export for module systems or attach to global window
if (typeof module !== 'undefined' && module.exports) {
  module.exports = QTableLoader;
} else {
  window.QTableLoader = QTableLoader;
}
