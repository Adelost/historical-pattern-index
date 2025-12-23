/**
 * HPI Domain Layer
 * Exports all domain-specific logic
 */

// Theme
export {
  TIERS,
  DEFAULT_TIER,
  DRIVERS,
  DEFAULT_DRIVER,
  SCORE_TYPES,
  CHECKLIST_ITEMS,
  BREAKDOWN_LABELS,
  getTier,
  getDriver,
  getScoreType,
  getBreakdownLabel,
  getChecklistTooltip,
  getTierOptions,
  getDriverOptions
} from './theme.js';

// Formatters
export {
  formatNum,
  formatDeaths,
  formatDuration,
  formatYear,
  getShortName,
  calcIndex,
  formatIndex,
  calcStats,
  formatPeriod,
  formatEventDeaths,
  getRegion,
  escapeHtml
} from './formatters.js';

// Columns
export {
  eventColumns,
  knowledgeColumns,
  getEventRowStyle,
  getEventRowClass,
  getKnowledgeRowStyle,
  getEventTimelineConfig,
  getKnowledgeTimelineConfig
} from './columns.js';

// Filters
export {
  denialOptions,
  periodOptions,
  eventFilterConfig,
  knowledgeFilterConfig,
  filterEvents,
  filterKnowledge,
  sortEvents,
  sortKnowledge
} from './filters.js';
