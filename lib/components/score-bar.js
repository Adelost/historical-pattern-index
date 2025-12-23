/**
 * ScoreBar - Generic progress/score bar with optional expandable breakdown
 *
 * Usage:
 * <div x-data="scoreBar({
 *   value: 75,
 *   max: 100,
 *   label: 'Progress',
 *   color: 'var(--color-accent)',
 *   type: 'systematic',
 *   expandable: true,
 *   breakdown: {
 *     description: 'Score explanation',
 *     items: [
 *       { label: 'Item 1', checked: true, tooltip: 'Details' },
 *       { label: 'Item 2', checked: false }
 *     ],
 *     rationale: 'Why this score was given'
 *   }
 * })">
 *   <!-- Use template -->
 * </div>
 */

export function scoreBar(config = {}) {
  return {
    // === Configuration ===
    value: config.value ?? 0,
    max: config.max ?? 100,
    label: config.label || '',
    color: config.color || 'var(--color-accent)',
    type: config.type || null, // For CSS data-type attribute
    expandable: config.expandable ?? false,
    breakdown: config.breakdown || null,
    showValue: config.showValue ?? true,
    valueFormat: config.valueFormat || ((v, max) => `${Math.round((v / max) * 100)}%`),

    // === State ===
    expanded: false,
    activeChipIndex: null,

    // === Computed ===
    get percentage() {
      if (this.max === 0) return 0;
      return (this.value / this.max) * 100;
    },

    get displayValue() {
      return this.valueFormat(this.value, this.max);
    },

    get hasBreakdown() {
      return this.breakdown && (
        this.breakdown.items?.length > 0 ||
        this.breakdown.description ||
        this.breakdown.rationale
      );
    },

    get barStyle() {
      return {
        '--bar-value': `${this.percentage}%`,
        '--bar-color': this.color
      };
    },

    get activeChipTooltip() {
      if (this.activeChipIndex === null || !this.breakdown?.items) {
        return null;
      }
      return this.breakdown.items[this.activeChipIndex]?.tooltip || null;
    },

    // === Actions ===
    toggle() {
      if (!this.expandable || !this.hasBreakdown) return;
      this.expanded = !this.expanded;
      this.activeChipIndex = null;

      this.$dispatch('scorebar:toggle', {
        expanded: this.expanded,
        label: this.label
      });
    },

    expand() {
      if (this.expandable && this.hasBreakdown) {
        this.expanded = true;
      }
    },

    collapse() {
      this.expanded = false;
      this.activeChipIndex = null;
    },

    selectChip(index) {
      this.activeChipIndex = this.activeChipIndex === index ? null : index;
    },

    // === Helpers ===
    isChipActive(index) {
      return this.activeChipIndex === index;
    }
  };
}

// Register with Alpine if available
if (typeof Alpine !== 'undefined') {
  Alpine.data('scoreBar', scoreBar);
}
