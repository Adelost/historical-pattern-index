/**
 * HPI Domain - Filter configurations
 * Defines filters and matching logic for events
 */

import { getTierOptions, getDriverOptions } from './theme.js';

/**
 * Denial status options
 */
export const denialOptions = [
  { value: 'all', label: 'All' },
  { value: 'denied', label: 'Denied', variant: 'danger' },
  { value: 'partial', label: 'Partial', variant: 'warning' },
  { value: 'acknowledged', label: 'Acknowledged', variant: 'success' }
];

/**
 * Period options (historical eras)
 */
export const periodOptions = [
  { value: 'all', label: 'All' },
  { value: 'ancient', label: 'Ancient', description: 'Before 500 CE' },
  { value: 'medieval', label: 'Medieval', description: '500–1500 CE' },
  { value: 'colonial', label: 'Colonial', description: '1500–1900 CE' },
  { value: 'modern', label: 'Modern', description: '1900–Present' }
];

/**
 * Event filter configuration for FilterBar component
 */
export const eventFilterConfig = [
  {
    key: 'tier',
    type: 'pills',
    options: getTierOptions(),
    default: 'all'
  }
];

/**
 * Knowledge filter configuration
 */
export const knowledgeFilterConfig = [
  {
    key: 'driver',
    type: 'pills',
    options: getDriverOptions(),
    default: 'all'
  }
];

/**
 * Check if event matches period filter
 */
function matchesPeriod(event, period) {
  if (period === 'all') return true;

  const start = event.period.start;
  switch (period) {
    case 'ancient': return start < 500;
    case 'medieval': return start >= 500 && start < 1500;
    case 'colonial': return start >= 1500 && start < 1900;
    case 'modern': return start >= 1900;
    default: return true;
  }
}

/**
 * Check if event matches tier filter
 */
function matchesTier(event, tier) {
  if (tier === 'all') return true;
  return event.analysis?.tier === tier;
}

/**
 * Check if event matches denial filter
 */
function matchesDenial(event, denial) {
  if (denial === 'all') return true;
  return event.denial_status === denial;
}

/**
 * Check if event matches search query
 */
function matchesSearch(event, query) {
  if (!query) return true;

  const searchFields = [
    event.name,
    event.geography?.region,
    event.geography?.country,
    event.analysis?.tier,
    event.analysis?.pattern_note,
    event.description,
    ...(event.participants?.perpetrators || []),
    ...(event.participants?.victims || [])
  ].filter(Boolean).join(' ').toLowerCase();

  return searchFields.includes(query.toLowerCase());
}

/**
 * Filter events based on all active filters
 */
export function filterEvents(events, filters = {}) {
  const { period = 'all', tier = 'all', denial = 'all', search = '' } = filters;

  return events.filter(event => {
    if (!matchesPeriod(event, period)) return false;
    if (!matchesTier(event, tier)) return false;
    if (!matchesDenial(event, denial)) return false;
    if (!matchesSearch(event, search)) return false;
    return true;
  });
}

/**
 * Check if knowledge entry matches driver filter
 */
function matchesDriver(entry, driver) {
  if (driver === 'all') return true;
  return entry.driver === driver;
}

/**
 * Check if knowledge entry matches search
 */
function matchesKnowledgeSearch(entry, query) {
  if (!query) return true;

  const searchFields = [
    entry.name,
    entry.description,
    entry.type,
    entry.what_lost,
    entry.saved_how
  ].filter(Boolean).join(' ').toLowerCase();

  return searchFields.includes(query.toLowerCase());
}

/**
 * Filter knowledge entries
 */
export function filterKnowledge(entries, filters = {}) {
  const { driver = 'all', search = '' } = filters;

  return entries.filter(entry => {
    if (!matchesDriver(entry, driver)) return false;
    if (!matchesKnowledgeSearch(entry, search)) return false;
    return true;
  });
}

/**
 * Sort events by field
 */
export function sortEvents(events, field, direction = 'asc') {
  const sorted = [...events];
  const mod = direction === 'asc' ? 1 : -1;

  sorted.sort((a, b) => {
    switch (field) {
      case 'name':
        return mod * a.name.localeCompare(b.name);
      case 'period':
        return mod * (a.period.start - b.period.start);
      case 'deaths':
        return mod * ((a.metrics?.mortality?.max || 0) - (b.metrics?.mortality?.max || 0));
      case 'index': {
        const calcIndex = (e) => {
          const s = e.metrics?.scores || {};
          return (s.systematic_intensity || 0) + (s.profit || 0) + (s.ideology || 0) + (s.complicity || 0);
        };
        return mod * (calcIndex(a) - calcIndex(b));
      }
      case 'region':
        return mod * (a.geography?.region || '').localeCompare(b.geography?.region || '');
      default:
        return 0;
    }
  });

  return sorted;
}

/**
 * Sort knowledge entries by year
 */
export function sortKnowledge(entries, direction = 'asc') {
  return [...entries].sort((a, b) => {
    const mod = direction === 'asc' ? 1 : -1;
    return mod * ((a.year || 0) - (b.year || 0));
  });
}
