/**
 * Timeline - Generic horizontal timeline with dots
 *
 * Usage:
 * <div x-data="timeline({
 *   items: myItems,
 *   getId: (item) => item.id,
 *   getX: (item, index, total) => (index / (total - 1)) * 100,
 *   getColor: (item) => item.color,
 *   getLabel: (item) => item.name,
 *   getYear: (item) => item.year,
 *   onSelect: (id, item) => console.log('Selected', id)
 * })">
 *   <!-- Use template -->
 * </div>
 */

export function timeline(config = {}) {
  return {
    // === Configuration ===
    items: config.items || [],
    getId: config.getId || ((item) => item.id),
    getX: config.getX || ((item, index, total) => total > 1 ? (index / (total - 1)) * 100 : 50),
    getColor: config.getColor || (() => 'var(--color-accent)'),
    getLabel: config.getLabel || ((item) => item.label || item.name || ''),
    getYear: config.getYear || ((item) => item.year || ''),
    unit: config.unit || '%',
    padding: config.padding ?? 2, // Percentage padding on each side
    onSelect: config.onSelect || null,
    onHover: config.onHover || null,

    // === State ===
    selectedId: config.defaultSelected || null,
    hoveredId: null,

    // === Computed ===
    get sortedItems() {
      // Sort by year if getYear is provided
      if (this.getYear) {
        return [...this.items].sort((a, b) => {
          const yearA = this.getYear(a);
          const yearB = this.getYear(b);
          return (yearA || 0) - (yearB || 0);
        });
      }
      return this.items;
    },

    get count() {
      return this.items.length;
    },

    // === Methods ===
    getDotX(item, index) {
      const x = this.getX(item, index, this.count);
      // Apply padding
      const range = 100 - (this.padding * 2);
      return this.padding + (x / 100) * range;
    },

    getDotStyle(item, index) {
      const x = this.getDotX(item, index);
      const color = this.getColor(item);
      return {
        left: `${x}${this.unit}`,
        '--dot-color': color,
        background: color
      };
    },

    isSelected(item) {
      return this.selectedId === this.getId(item);
    },

    isHovered(item) {
      return this.hoveredId === this.getId(item);
    },

    // === Actions ===
    select(item) {
      const id = this.getId(item);
      const wasSelected = this.selectedId === id;
      this.selectedId = wasSelected ? null : id;

      this.$dispatch('timeline:select', {
        id: this.selectedId,
        item: wasSelected ? null : item
      });

      this.onSelect?.(this.selectedId, wasSelected ? null : item);
    },

    selectById(id) {
      const item = this.items.find(i => this.getId(i) === id);
      if (item) {
        this.selectedId = id;
        this.onSelect?.(id, item);
      }
    },

    hover(item) {
      this.hoveredId = item ? this.getId(item) : null;

      this.$dispatch('timeline:hover', {
        id: this.hoveredId,
        item
      });

      this.onHover?.(this.hoveredId, item);
    },

    clearSelection() {
      this.selectedId = null;
      this.$dispatch('timeline:select', { id: null, item: null });
    }
  };
}

// Register with Alpine if available
if (typeof Alpine !== 'undefined') {
  Alpine.data('timeline', timeline);
}
