/**
 * FilterBar - Generic filter bar with pills, search, and dropdowns
 *
 * Usage:
 * <div x-data="filterBar({
 *   filters: [
 *     {
 *       key: 'status',
 *       options: [
 *         { value: 'all', label: 'All' },
 *         { value: 'active', label: 'Active', variant: 'success' }
 *       ],
 *       default: 'all'
 *     }
 *   ],
 *   search: true,
 *   searchPlaceholder: 'Search...',
 *   onFilterChange: (filters) => console.log(filters)
 * })">
 *   <!-- Use template -->
 * </div>
 */

export function filterBar(config = {}) {
  // Initialize filter values from config
  const initialValues = {};
  (config.filters || []).forEach(f => {
    initialValues[f.key] = f.default ?? 'all';
  });

  return {
    // === Configuration ===
    filters: config.filters || [],
    searchEnabled: config.search ?? true,
    searchPlaceholder: config.searchPlaceholder || 'Search...',
    debounceMs: config.debounceMs ?? 300,
    onFilterChange: config.onFilterChange || null,

    // === State ===
    values: initialValues,
    searchQuery: config.defaultSearch || '',
    _searchTimeout: null,

    // === Computed ===
    get activeFilters() {
      return {
        ...this.values,
        search: this.searchQuery
      };
    },

    get hasActiveFilters() {
      const hasNonDefaultFilter = Object.entries(this.values).some(([key, value]) => {
        const filter = this.filters.find(f => f.key === key);
        return value !== (filter?.default ?? 'all');
      });
      return hasNonDefaultFilter || this.searchQuery.length > 0;
    },

    // === Methods ===
    isActive(filterKey, value) {
      return this.values[filterKey] === value;
    },

    getFilter(key) {
      return this.filters.find(f => f.key === key);
    },

    getVariant(filterKey, value) {
      const filter = this.getFilter(filterKey);
      const option = filter?.options?.find(o => o.value === value);
      return option?.variant || null;
    },

    // === Actions ===
    setFilter(key, value) {
      this.values[key] = value;
      this._emitChange();
    },

    setSearch(query) {
      this.searchQuery = query.toLowerCase().trim();

      // Debounce the emit
      clearTimeout(this._searchTimeout);
      this._searchTimeout = setTimeout(() => {
        this._emitChange();
      }, this.debounceMs);
    },

    reset() {
      // Reset all filters to defaults
      this.filters.forEach(f => {
        this.values[f.key] = f.default ?? 'all';
      });
      this.searchQuery = '';
      this._emitChange();
    },

    _emitChange() {
      const payload = this.activeFilters;

      this.$dispatch('filterbar:change', payload);
      this.onFilterChange?.(payload);
    },

    // === Filter logic helpers ===
    /**
     * Check if an item matches all active filters
     * @param {Object} item - The item to check
     * @param {Object} matchers - Object mapping filter keys to match functions
     *                           { status: (item, value) => item.status === value }
     * @param {Function} searchFn - Function to check if item matches search
     *                             (item, query) => item.name.includes(query)
     */
    matches(item, matchers = {}, searchFn = null) {
      // Check each filter
      for (const [key, value] of Object.entries(this.values)) {
        if (value === 'all') continue;

        const matcher = matchers[key];
        if (matcher && !matcher(item, value)) {
          return false;
        }
      }

      // Check search
      if (this.searchQuery && searchFn) {
        if (!searchFn(item, this.searchQuery)) {
          return false;
        }
      }

      return true;
    }
  };
}

// Register with Alpine if available
if (typeof Alpine !== 'undefined') {
  Alpine.data('filterBar', filterBar);
}
