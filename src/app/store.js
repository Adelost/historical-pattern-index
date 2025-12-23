/**
 * HPI Alpine Store
 * Central state management for the application
 */

import {
  filterEvents,
  filterKnowledge,
  sortKnowledge,
  calcStats,
  getTier,
  getDriver
} from '../domain/index.js';

/**
 * Initialize the HPI Alpine store
 */
export function initStore(Alpine) {
  Alpine.store('hpi', {
    // === Raw Data ===
    events: [],
    knowledgeLost: [],
    knowledgeSaved: [],
    knowledgeByEvent: {},
    loading: true,
    error: null,

    // === UI State ===
    currentView: 'main',        // 'main' | 'chart' | 'knowledge'
    selectedEvent: null,        // Event ID for expanded row
    chartMode: 'systematic',    // 'systematic' | 'driver'

    // === Filters ===
    filters: {
      period: 'all',
      tier: 'all',
      denial: 'all'
    },
    search: '',
    knowledgeSearch: '',
    knowledgeDriver: 'all',

    // === Sort ===
    sort: JSON.parse(localStorage.getItem('hpi-sort')) || {
      field: 'period',
      direction: 'asc'
    },

    // === Computed Getters ===
    get filteredEvents() {
      return filterEvents(this.events, {
        ...this.filters,
        search: this.search
      });
    },

    get filteredKnowledgeLost() {
      return filterKnowledge(this.knowledgeLost, {
        driver: this.knowledgeDriver,
        search: this.knowledgeSearch
      });
    },

    get filteredKnowledgeSaved() {
      return filterKnowledge(this.knowledgeSaved, {
        driver: this.knowledgeDriver,
        search: this.knowledgeSearch
      });
    },

    get sortedKnowledgeLost() {
      return sortKnowledge(this.filteredKnowledgeLost, 'asc');
    },

    get sortedKnowledgeSaved() {
      return sortKnowledge(this.filteredKnowledgeSaved, 'asc');
    },

    get stats() {
      return calcStats(this.events);
    },

    get filteredStats() {
      return calcStats(this.filteredEvents);
    },

    // === Actions ===

    /**
     * Set a filter value
     */
    setFilter(key, value) {
      this.filters[key] = value;
      this.syncToURL();
    },

    /**
     * Set search query
     */
    setSearch(query) {
      this.search = query.toLowerCase().trim();
    },

    /**
     * Set knowledge search
     */
    setKnowledgeSearch(query) {
      this.knowledgeSearch = query.toLowerCase().trim();
    },

    /**
     * Set knowledge driver filter
     */
    setKnowledgeDriver(driver) {
      this.knowledgeDriver = driver;
    },

    /**
     * Set sort field/direction
     */
    setSort(field) {
      if (this.sort.field === field) {
        this.sort.direction = this.sort.direction === 'asc' ? 'desc' : 'asc';
      } else {
        this.sort.field = field;
        this.sort.direction = 'asc';
      }
      localStorage.setItem('hpi-sort', JSON.stringify(this.sort));
    },

    /**
     * Toggle event expansion
     */
    toggleEvent(id) {
      this.selectedEvent = this.selectedEvent === id ? null : id;
      this.syncToURL();
    },

    /**
     * Select event by ID
     */
    selectEvent(id) {
      this.selectedEvent = id;
      this.syncToURL();
    },

    /**
     * Switch view
     */
    switchView(view) {
      this.currentView = view;
      if (view !== 'main') {
        this.selectedEvent = null;
      }
      localStorage.setItem('hpi-view', view);
      this.syncToURL();
    },

    /**
     * Set chart mode
     */
    setChartMode(mode) {
      this.chartMode = mode;
      this.syncToURL();
    },

    // === URL State ===

    /**
     * Sync state to URL hash
     */
    syncToURL() {
      const params = new URLSearchParams();

      if (this.currentView !== 'main') params.set('view', this.currentView);
      if (this.selectedEvent) params.set('event', this.selectedEvent);
      if (this.filters.period !== 'all') params.set('period', this.filters.period);
      if (this.filters.tier !== 'all') params.set('tier', this.filters.tier);
      if (this.filters.denial !== 'all') params.set('denial', this.filters.denial);
      if (this.search) params.set('search', this.search);
      if (this.chartMode !== 'systematic') params.set('chartMode', this.chartMode);

      const hash = params.toString();
      history.replaceState(null, '', hash ? '#' + hash : location.pathname);
    },

    /**
     * Apply URL state on load
     */
    applyURLState() {
      const hash = location.hash.slice(1);
      if (!hash) return;

      const params = Object.fromEntries(new URLSearchParams(hash));

      if (params.view) this.currentView = params.view;
      if (params.event) this.selectedEvent = params.event;
      if (params.period) this.filters.period = params.period;
      if (params.tier) this.filters.tier = params.tier;
      if (params.denial) this.filters.denial = params.denial;
      if (params.search) this.search = params.search;
      if (params.chartMode) this.chartMode = params.chartMode;
    },

    // === Data Loading ===

    /**
     * Build reverse lookup: event_id → knowledge entries
     */
    buildKnowledgeLookup() {
      const lookup = {};

      const process = (entries, isSaved) => {
        entries.forEach(entry => {
          if (entry.connected_event) {
            if (!lookup[entry.connected_event]) {
              lookup[entry.connected_event] = [];
            }
            lookup[entry.connected_event].push({ ...entry, isSaved });
          }
        });
      };

      process(this.knowledgeLost, false);
      process(this.knowledgeSaved, true);

      return lookup;
    },

    /**
     * Get linked knowledge for an event
     */
    getLinkedKnowledge(eventId) {
      return this.knowledgeByEvent[eventId] || [];
    },

    /**
     * Get connected event for a knowledge entry
     */
    getConnectedEvent(entry) {
      if (!entry.connected_event) return null;
      return this.events.find(e => e.id === entry.connected_event);
    },

    /**
     * Initialize the store (load data)
     */
    async init() {
      try {
        this.loading = true;
        this.error = null;

        // Load event index
        const indexResponse = await fetch('data/index.json');
        const eventUrls = await indexResponse.json();

        // Load all events in parallel
        const eventPromises = eventUrls.map(url => fetch(url).then(r => r.json()));
        this.events = await Promise.all(eventPromises);

        // Load knowledge data
        const [lostResponse, savedResponse] = await Promise.all([
          fetch('data/knowledge_lost.json'),
          fetch('data/knowledge_saved.json')
        ]);

        this.knowledgeLost = await lostResponse.json();
        this.knowledgeSaved = await savedResponse.json();

        // Build lookup
        this.knowledgeByEvent = this.buildKnowledgeLookup();

        // Apply URL state
        this.applyURLState();

        // Restore view from localStorage if not in URL
        if (!location.hash.includes('view=')) {
          const savedView = localStorage.getItem('hpi-view');
          if (savedView) this.currentView = savedView;
        }

        this.loading = false;
      } catch (err) {
        console.error('Failed to load data:', err);
        this.error = err.message;
        this.loading = false;
      }
    }
  });

  // Listen for popstate (browser back/forward)
  window.addEventListener('popstate', () => {
    Alpine.store('hpi').applyURLState();
  });
}

// === Helper Functions for Templates ===

/**
 * Get tier info for an event
 */
export function getEventTier(event) {
  return getTier(event?.analysis?.tier);
}

/**
 * Get driver info for a knowledge entry
 */
export function getEntryDriver(entry) {
  return getDriver(entry?.driver);
}

// Auto-initialize if Alpine is available
if (typeof window !== 'undefined' && window.Alpine) {
  document.addEventListener('alpine:init', () => {
    initStore(window.Alpine);
  });
}
