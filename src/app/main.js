/**
 * HPI Main Application Entry Point
 * Initializes Alpine.js with store and components
 */

import { registerComponents } from '../../lib/components/index.js';
import { initStore } from './store.js';

// Import domain helpers for global access in templates
import * as domain from '../domain/index.js';

// Make domain available globally for templates
window.HPI = domain;

/**
 * Initialize the application
 */
export async function initApp(Alpine) {
  // Register generic components
  registerComponents(Alpine);

  // Initialize store
  initStore(Alpine);

  // Register HPI-specific Alpine data components
  registerHPIComponents(Alpine);
}

/**
 * Register HPI-specific Alpine components
 */
function registerHPIComponents(Alpine) {

  // Event details renderer
  Alpine.data('eventDetails', (event) => ({
    event,

    get tier() {
      return domain.getTier(this.event?.analysis?.tier);
    },

    get scores() {
      const s = this.event?.metrics?.scores || {};
      return Object.entries(domain.SCORE_TYPES).map(([key, info]) => ({
        key,
        label: info.label,
        value: s[key] || 0,
        color: info.color,
        type: info.type,
        description: info.description,
        breakdown: this.getBreakdown(key),
        rationale: this.event?.metrics?.rationales?.[key]
      }));
    },

    getBreakdown(scoreKey) {
      const breakdown = this.event?.metrics?.breakdowns?.[scoreKey];
      if (!breakdown) return null;

      return {
        items: Object.entries(breakdown).map(([key, checked]) => ({
          key,
          label: domain.getBreakdownLabel(key),
          checked: !!checked,
          tooltip: domain.getChecklistTooltip(key)
        }))
      };
    },

    get linkedKnowledge() {
      return Alpine.store('hpi').getLinkedKnowledge(this.event?.id) || [];
    },

    get formattedDeaths() {
      return domain.formatEventDeaths(this.event);
    },

    get formattedPeriod() {
      return domain.formatPeriod(this.event);
    },

    get perpetrators() {
      return this.event?.participants?.perpetrators || [];
    },

    get victims() {
      return this.event?.participants?.victims || [];
    },

    get sources() {
      return this.event?.sources || [];
    },

    get wikiUrl() {
      return this.event?.wikipedia_url;
    }
  }));

  // Knowledge details renderer
  Alpine.data('knowledgeDetails', (entry, isSaved) => ({
    entry,
    isSaved,

    get driver() {
      return domain.getDriver(this.entry?.driver);
    },

    get connectedEvent() {
      return Alpine.store('hpi').getConnectedEvent(this.entry);
    },

    get formattedYear() {
      return domain.formatYear(this.entry?.year, this.entry?.year_end);
    },

    get sources() {
      return this.entry?.sources || [];
    },

    get wikiUrl() {
      return this.entry?.wikipedia_url;
    },

    goToEvent() {
      if (this.connectedEvent) {
        Alpine.store('hpi').switchView('main');
        Alpine.store('hpi').selectEvent(this.connectedEvent.id);
      }
    }
  }));

  // Stats display
  Alpine.data('statsDisplay', () => ({
    get stats() {
      return Alpine.store('hpi').stats;
    },

    get formattedDeaths() {
      return domain.formatDeaths(this.stats.deathsMin, this.stats.deathsMax);
    },

    get formattedYears() {
      return domain.formatNum(this.stats.years);
    }
  }));
}

// Auto-initialize
if (typeof window !== 'undefined') {
  document.addEventListener('alpine:init', () => {
    initApp(window.Alpine);
  });

  // Initialize store after Alpine loads
  document.addEventListener('alpine:initialized', () => {
    // Start loading data
    window.Alpine.store('hpi').init();
  });
}
