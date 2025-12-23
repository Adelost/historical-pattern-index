/**
 * Alpine Component Library
 * Generic, reusable UI components
 *
 * Usage:
 * <script src="lib/components/index.js"></script>
 * <!-- Or import as module -->
 * import { registerComponents } from './lib/components/index.js';
 * registerComponents(Alpine);
 */

import { dataTable } from './data-table.js';
import { filterBar } from './filter-bar.js';
import { timeline } from './timeline.js';
import { scoreBar } from './score-bar.js';

// Export individual components
export { dataTable, filterBar, timeline, scoreBar };

/**
 * Register all components with Alpine
 * @param {Alpine} Alpine - Alpine.js instance
 */
export function registerComponents(Alpine) {
  Alpine.data('dataTable', dataTable);
  Alpine.data('filterBar', filterBar);
  Alpine.data('timeline', timeline);
  Alpine.data('scoreBar', scoreBar);
}

/**
 * Auto-register if Alpine is available globally
 */
if (typeof window !== 'undefined' && window.Alpine) {
  registerComponents(window.Alpine);
}

// Default export for convenience
export default {
  dataTable,
  filterBar,
  timeline,
  scoreBar,
  registerComponents
};
