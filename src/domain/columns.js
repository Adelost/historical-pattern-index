/**
 * HPI Domain - Column configurations
 * Defines how data is displayed in tables
 */

import { getTier, getDriver } from './theme.js';
import {
  formatPeriod,
  formatEventDeaths,
  formatIndex,
  calcIndex,
  getShortName,
  getRegion
} from './formatters.js';

/**
 * Event table columns configuration
 */
export const eventColumns = [
  {
    key: 'tier',
    label: '',
    width: '40px',
    sortable: false,
    render: (event) => `<span class="row-dot"></span>`
  },
  {
    key: 'name',
    label: 'Event',
    sortable: true,
    render: (event) => {
      const tier = getTier(event.analysis?.tier);
      const denied = event.denial_status === 'denied';
      return `
        <span class="event-name">${event.name}</span>
        <span class="event-meta">
          <span class="tier-label">${tier.shortLabel}</span>
          ${denied ? '<span class="chip" data-variant="danger">DENIED</span>' : ''}
        </span>
      `;
    }
  },
  {
    key: 'period',
    label: 'Period',
    width: '120px',
    sortable: true,
    sortFn: (a, b) => a.period.start - b.period.start,
    render: (event) => formatPeriod(event)
  },
  {
    key: 'deaths',
    label: 'Deaths',
    width: '100px',
    sortable: true,
    sortFn: (a, b) => (a.metrics?.mortality?.max || 0) - (b.metrics?.mortality?.max || 0),
    defaultDir: 'desc',
    render: (event) => formatEventDeaths(event)
  },
  {
    key: 'index',
    label: 'Index',
    width: '80px',
    sortable: true,
    sortFn: (a, b) => calcIndex(a) - calcIndex(b),
    defaultDir: 'desc',
    render: (event) => formatIndex(event)
  }
];

/**
 * Knowledge table columns configuration
 */
export const knowledgeColumns = [
  {
    key: 'driver',
    label: '',
    width: '40px',
    sortable: false,
    render: (entry) => `<span class="row-dot"></span>`
  },
  {
    key: 'name',
    label: 'Knowledge',
    sortable: true,
    render: (entry) => {
      const driver = getDriver(entry.driver);
      return `
        <span class="event-name">${entry.name}</span>
        <span class="event-meta">
          <span class="tier-label">${driver.label}</span>
        </span>
      `;
    }
  },
  {
    key: 'year',
    label: 'Year',
    width: '100px',
    sortable: true,
    sortFn: (a, b) => (a.year || 0) - (b.year || 0),
    render: (entry) => entry.year || 'Unknown'
  },
  {
    key: 'type',
    label: 'Type',
    width: '120px',
    sortable: true,
    render: (entry) => entry.type || ''
  }
];

/**
 * Get row style for event (sets CSS variable for tier color)
 */
export function getEventRowStyle(event) {
  const tier = getTier(event.analysis?.tier);
  return { '--row-color': tier.color };
}

/**
 * Get row class for event
 */
export function getEventRowClass(event) {
  const classes = [];
  if (event.denial_status === 'denied') {
    classes.push('denied');
  }
  return classes.join(' ');
}

/**
 * Get row style for knowledge entry
 */
export function getKnowledgeRowStyle(entry) {
  const driver = getDriver(entry.driver);
  return { '--row-color': driver.color };
}

/**
 * Timeline configuration for events
 */
export function getEventTimelineConfig(events) {
  return {
    items: events,
    getId: (event) => event.id,
    getX: (event, index, total) => {
      // Position based on index for even spacing
      return total > 1 ? (index / (total - 1)) * 100 : 50;
    },
    getColor: (event) => getTier(event.analysis?.tier).color,
    getLabel: (event) => getShortName(event),
    getYear: (event) => event.period.start
  };
}

/**
 * Timeline configuration for knowledge
 */
export function getKnowledgeTimelineConfig(entries) {
  return {
    items: entries,
    getId: (entry) => entry.id,
    getX: (entry, index, total) => {
      return total > 1 ? (index / (total - 1)) * 100 : 50;
    },
    getColor: (entry) => getDriver(entry.driver).color,
    getLabel: (entry) => entry.name?.substring(0, 15) || '',
    getYear: (entry) => entry.year
  };
}
