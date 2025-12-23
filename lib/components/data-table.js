/**
 * DataTable - Generic sortable, expandable data table
 *
 * Usage:
 * <div x-data="dataTable({
 *   columns: [...],
 *   data: myData,
 *   getId: (row) => row.id,
 *   expandable: true,
 *   rowClass: (row) => row.active ? 'active' : '',
 *   rowStyle: (row) => ({ '--row-color': getColor(row) })
 * })">
 *   <!-- Use template, see data-table.html for example -->
 * </div>
 */

export function dataTable(config = {}) {
  return {
    // === Configuration ===
    columns: config.columns || [],
    getId: config.getId || ((row) => row.id),
    expandable: config.expandable ?? false,
    rowClass: config.rowClass || null,
    rowStyle: config.rowStyle || null,
    onRowClick: config.onRowClick || null,
    onSortChange: config.onSortChange || null,
    onExpandChange: config.onExpandChange || null,

    // === State ===
    _data: config.data || [],
    sortField: config.defaultSort?.field || null,
    sortDir: config.defaultSort?.dir || 'asc',
    expandedId: config.defaultExpanded || null,

    // === Reactive data getter/setter ===
    get data() {
      return this._data;
    },
    set data(value) {
      this._data = value;
    },

    // === Computed ===
    get sortedData() {
      if (!this.sortField) return this.data;

      const col = this.columns.find(c => c.key === this.sortField);
      const data = [...this.data];

      return data.sort((a, b) => {
        let cmp;
        if (col?.sortFn) {
          cmp = col.sortFn(a, b);
        } else {
          const aVal = this.getCellValue(a, this.sortField);
          const bVal = this.getCellValue(b, this.sortField);
          if (typeof aVal === 'string') {
            cmp = aVal.localeCompare(bVal);
          } else {
            cmp = (aVal || 0) - (bVal || 0);
          }
        }
        return this.sortDir === 'asc' ? cmp : -cmp;
      });
    },

    get count() {
      return this.data.length;
    },

    // === Methods ===
    getCellValue(row, key) {
      // Support nested keys like 'period.start'
      return key.split('.').reduce((obj, k) => obj?.[k], row);
    },

    renderCell(row, col) {
      if (col.render) {
        return col.render(row);
      }
      const value = this.getCellValue(row, col.key);
      return value ?? '';
    },

    getRowClasses(row) {
      const base = this.rowClass?.(row) || '';
      const expanded = this.isExpanded(row) ? 'expanded' : '';
      return [base, expanded].filter(Boolean).join(' ');
    },

    getRowStyles(row) {
      return this.rowStyle?.(row) || {};
    },

    isExpanded(row) {
      return this.expandable && this.expandedId === this.getId(row);
    },

    // === Actions ===
    sort(field) {
      const col = this.columns.find(c => c.key === field);
      if (!col?.sortable) return;

      if (this.sortField === field) {
        this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortField = field;
        this.sortDir = col.defaultDir || 'asc';
      }

      this.$dispatch('datatable:sort', {
        field: this.sortField,
        dir: this.sortDir
      });

      this.onSortChange?.({ field: this.sortField, dir: this.sortDir });
    },

    toggleRow(row) {
      if (!this.expandable) return;

      const id = this.getId(row);
      const wasExpanded = this.expandedId === id;
      this.expandedId = wasExpanded ? null : id;

      this.$dispatch('datatable:expand', {
        id: this.expandedId,
        row: wasExpanded ? null : row
      });

      this.onExpandChange?.({ id: this.expandedId, row: wasExpanded ? null : row });
      this.onRowClick?.(row);
    },

    expandRow(id) {
      this.expandedId = id;
    },

    collapseRow() {
      this.expandedId = null;
    },

    // === Helpers for template ===
    isSortActive(field) {
      return this.sortField === field;
    },

    getSortDir(field) {
      return this.sortField === field ? this.sortDir : null;
    }
  };
}

// Register with Alpine if available
if (typeof Alpine !== 'undefined') {
  Alpine.data('dataTable', dataTable);
}
