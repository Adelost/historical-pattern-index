/**
 * HPI App - Main application logic
 */

import { Utils, DRIVERS, DOT_STYLE } from './utils.js';
import { Card, MapPopup, TableRow, TableHeader, KnowledgeCard, EventTooltip, Dot } from './components.js';

// --- APP LOGIC (State & Effects) ---
const App = {
    state: {
        events: [],
        knowledgeLost: [],
        knowledgeSaved: [],
        map: null,
        markers: [],
        currentView: localStorage.getItem('hpi-view') || 'cards',
        filters: { period: 'all', tier: 'all', denial: 'all' },
        search: '',
        sort: JSON.parse(localStorage.getItem('hpi-sort')) || { field: 'period', direction: 'asc' },
        // Knowledge filters
        knowledgeSearch: '',
        knowledgeDriver: 'all'
    },

    async init() {
        try {
            // Load main events
            const idx = await fetch('data/index.json').then(r => r.json());
            const promises = idx.map(url => fetch(url).then(r => r.json()));
            this.state.events = await Promise.all(promises);

            // Load knowledge data
            this.state.knowledgeLost = await fetch('data/knowledge_lost.json').then(r => r.json());
            this.state.knowledgeSaved = await fetch('data/knowledge_saved.json').then(r => r.json());

            this.updateStats();
            this.bindEvents();

            // Apply saved view from localStorage
            this.switchView(this.state.currentView);
        } catch (e) {
            console.error("Init failed:", e);
            document.querySelector('main').innerHTML = `<div class="error-message">Failed to load data. ${e.message}</div>`;
        }
    },

    updateStats() {
        const stats = Utils.calcStats(this.state.events);
        document.getElementById('stat-events').textContent = stats.count;
        document.getElementById('stat-deaths').textContent = Utils.formatDeaths(stats.deathsMin, stats.deathsMax);
        document.getElementById('stat-years').textContent = stats.years.toLocaleString();
        document.getElementById('stat-denied').textContent = stats.denied;
    },

    bindEvents() {
        // Search Input
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.state.search = e.target.value.toLowerCase().trim();
                this.render();
            });
        }

        // Filter Changes
        ['filterPeriod', 'filterTier', 'filterDenial'].forEach(id => {
            document.getElementById(id).addEventListener('change', (e) => {
                const key = id.replace('filter', '').toLowerCase();
                this.state.filters[key] = e.target.value;
                this.render();
            });
        });

        // Era Pill Filters
        document.querySelectorAll('.era-pill').forEach(pill => {
            pill.addEventListener('click', () => {
                const period = pill.dataset.period;
                this.state.filters.period = period;

                // Update pill active state
                document.querySelectorAll('.era-pill').forEach(p => p.classList.remove('active'));
                pill.classList.add('active');

                // Sync hidden dropdown
                document.getElementById('filterPeriod').value = period;

                this.render();
            });
        });

        // Tier Pill Filters
        document.querySelectorAll('.tier-pill').forEach(pill => {
            pill.addEventListener('click', () => {
                const tier = pill.dataset.tier;
                this.state.filters.tier = tier;

                // Update pill active state
                document.querySelectorAll('.tier-pill').forEach(p => p.classList.remove('active'));
                pill.classList.add('active');

                // Sync hidden dropdown
                document.getElementById('filterTier').value = tier;

                this.render();
            });
        });

        // View Tabs
        document.querySelectorAll('.view-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const view = tab.dataset.view;
                this.switchView(view);
            });
        });

        // Download
        document.getElementById('btnDownload').addEventListener('click', () => {
            const blob = new Blob([JSON.stringify(this.state.events, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = 'hpi_dataset.json'; a.click();
        });

        // Knowledge Search
        const knowledgeSearch = document.getElementById('knowledgeSearch');
        if (knowledgeSearch) {
            knowledgeSearch.addEventListener('input', (e) => {
                this.state.knowledgeSearch = e.target.value.toLowerCase().trim();
                this.renderKnowledge();
            });
        }

        // Knowledge Driver Filter
        document.querySelectorAll('.driver-pill').forEach(pill => {
            pill.addEventListener('click', () => {
                const driver = pill.dataset.driver;
                this.state.knowledgeDriver = driver;

                document.querySelectorAll('.driver-pill').forEach(p => p.classList.remove('active'));
                pill.classList.add('active');

                this.renderKnowledge();
            });
        });
    },

    switchView(view) {
        this.state.currentView = view;
        localStorage.setItem('hpi-view', view);

        // Update tabs
        document.querySelectorAll('.view-tab').forEach(t => t.classList.remove('active'));
        document.querySelector(`[data-view="${view}"]`).classList.add('active');

        // Update views
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        document.getElementById(`${view}View`).classList.add('active');

        // Show/hide filter sections based on active view
        document.querySelectorAll('.filter-section[data-views]').forEach(section => {
            const views = section.dataset.views.split(' ');
            section.classList.toggle('visible', views.includes(view));
        });

        // Handle map view special case
        if (view === 'map' && !this.state.map) {
            this.initMap();
        } else if (view === 'map') {
            setTimeout(() => this.state.map.invalidateSize(), 100);
        }

        // Render the current view
        this.render();
    },

    initMap() {
        const map = L.map('mapCanvas', {
            center: [20, 0],
            zoom: 2,
            minZoom: 2,
            maxBounds: [[-90, -180], [90, 180]]
        });

        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 19
        }).addTo(map);

        this.state.map = map;
        this.updateMap(this.getFilteredEvents());
    },

    updateMap(events) {
        if (!this.state.map) return;

        // Clear existing markers
        this.state.markers.forEach(m => m.remove());
        this.state.markers = [];

        // Add new markers
        events.forEach(event => {
            const coords = event.geography.coordinates;
            if (!coords || coords.length !== 2) return;

            const { color } = Utils.getTheme(event.analysis.tier);

            const marker = L.circleMarker([coords[0], coords[1]], {
                radius: Math.min(20, Math.max(6, Math.log10(event.metrics.mortality.max || 1000) * 3)),
                fillColor: color,
                color: '#fff',
                weight: 1,
                opacity: 0.8,
                fillOpacity: 0.6
            });

            marker.bindPopup(MapPopup(event), {
                className: 'dark-popup'
            });

            marker.on('click', () => {
                // Switch to table view and expand the row
                if (this.state.currentView !== 'cards') {
                    this.switchView('cards');
                }
                setTimeout(() => {
                    const row = document.querySelector(`.table-row[data-id="${event.id}"]`);
                    if (row) {
                        row.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        row.click(); // Expand the row
                    }
                }, 100);
            });

            marker.addTo(this.state.map);
            this.state.markers.push(marker);
        });
    },

    renderTimeline(events) {
        const timeline = document.getElementById('timeline');
        const rowsContainer = document.getElementById('timelineRows');

        // Sort by start year
        const sorted = [...events].sort((a, b) => a.period.start - b.period.start);

        // Fixed spacing per event (pixels) - allows horizontal scroll
        const pxPerEvent = 90;
        const padding = 40;
        const totalWidth = Math.max(sorted.length * pxPerEvent + padding * 2, timeline.parentElement.clientWidth);

        // Create timeline dots with fixed pixel spacing
        const dotsHtml = sorted.map((event, index) => {
            const x = padding + index * pxPerEvent;
            const { color } = Utils.getTheme(event.analysis.tier);

            // Short name for label
            let shortName = event.name.replace(/\s*\([^)]+\)/, '').trim();
            if (shortName.length > 12) {
                shortName = shortName.substring(0, 11) + '…';
            }

            return `
                <span class="timeline-year" style="left: ${x}px;">${event.period.start}</span>
                ${Dot({ id: event.id, color, x, unit: 'px' })}
                <span class="timeline-label" style="left: ${x}px;">${shortName}</span>`;
        }).join('');

        timeline.style.width = `${totalWidth}px`;
        timeline.innerHTML = `
            <div class="timeline-axis"></div>
            ${dotsHtml}
        `;

        // Render TableRows below timeline
        const rowsHtml = sorted.map(event => TableRow(event)).join('');
        rowsContainer.innerHTML = rowsHtml;

        // Bind row + dot events
        this.bindTimelineRowEvents();

        // Scroll indicator handling
        const container = timeline.parentElement;
        const updateScrollState = () => {
            const canScroll = container.scrollWidth > container.clientWidth;
            const scrolled = container.scrollLeft > 10;
            const atEnd = container.scrollLeft + container.clientWidth >= container.scrollWidth - 10;

            container.classList.toggle('can-scroll', canScroll && !scrolled);
            container.classList.toggle('scrolled', scrolled);
            container.classList.toggle('at-end', atEnd);
        };

        container.addEventListener('scroll', updateScrollState);
        updateScrollState();

        // Drag-to-scroll
        let isDragging = false;
        let startX, scrollLeft;

        container.addEventListener('mousedown', (e) => {
            if (e.target.closest('.timeline-dot')) return;
            isDragging = true;
            container.classList.add('dragging');
            startX = e.pageX - container.offsetLeft;
            scrollLeft = container.scrollLeft;
        });

        container.addEventListener('mouseleave', () => {
            isDragging = false;
            container.classList.remove('dragging');
        });

        container.addEventListener('mouseup', () => {
            isDragging = false;
            container.classList.remove('dragging');
        });

        container.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            e.preventDefault();
            const x = e.pageX - container.offsetLeft;
            const walk = (x - startX) * 1.5;
            container.scrollLeft = scrollLeft - walk;
        });
    },

    bindTimelineRowEvents() {
        const container = document.getElementById('timelineRows');
        const timeline = document.getElementById('timeline');
        const dots = timeline.querySelectorAll('.timeline-dot');

        this.bindExpandableRows({
            container,
            rowSelector: '.table-row',
            detailsSelector: '.table-row-details',
            dots,
            autoExpand: true
        });

        // Score row click to expand breakdown
        this.bindScoreRowEvents(container);
    },

    getFilteredEvents() {
        return this.state.events.filter(e => {
            // Apply filters
            if (!Utils.matches(e, this.state.filters)) return false;

            // Apply search
            if (this.state.search) {
                const searchFields = [
                    e.name,
                    e.geography.region,
                    e.geography.country || '',
                    e.analysis.tier,
                    e.analysis.pattern_note || ''
                ].join(' ').toLowerCase();

                return searchFields.includes(this.state.search);
            }

            return true;
        });
    },

    sortEvents(events) {
        const { field, direction } = this.state.sort;
        const modifier = direction === 'asc' ? 1 : -1;

        return [...events].sort((a, b) => {
            switch (field) {
                case 'name':
                    return modifier * a.name.localeCompare(b.name);
                case 'period':
                    return modifier * (a.period.start - b.period.start);
                case 'deaths':
                    return modifier * ((a.metrics.mortality.max || 0) - (b.metrics.mortality.max || 0));
                case 'region':
                    return modifier * a.geography.region.localeCompare(b.geography.region);
                default:
                    return 0;
            }
        });
    },

    // Generic expandable rows with optional dot sync
    bindExpandableRows({ container, rowSelector, detailsSelector, dots = null, autoExpand = false }) {
        const rows = container.querySelectorAll(rowSelector);

        rows.forEach(row => {
            row.addEventListener('click', () => {
                const id = row.dataset.id;
                const details = container.querySelector(`${detailsSelector}[data-for="${id}"]`);
                if (!details) return;

                const isExpanded = row.classList.contains('expanded');

                // Close all other rows
                rows.forEach(r => {
                    r.classList.remove('expanded');
                    const d = container.querySelector(`${detailsSelector}[data-for="${r.dataset.id}"]`);
                    if (d) d.classList.remove('expanded');
                });
                if (dots) dots.forEach(d => d.classList.remove('selected'));

                // Toggle this row
                if (!isExpanded) {
                    row.classList.add('expanded');
                    details.classList.add('expanded');
                    if (dots) {
                        const dot = [...dots].find(d => d.dataset.id === id);
                        if (dot) dot.classList.add('selected');
                    }
                }
            });
        });

        // Dot click → scroll to row and expand
        if (dots) {
            dots.forEach(dot => {
                dot.addEventListener('click', () => {
                    const row = container.querySelector(`${rowSelector}[data-id="${dot.dataset.id}"]`);
                    if (row) {
                        row.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        setTimeout(() => row.click(), 300);
                    }
                });
            });
        }

        // Auto-expand first row
        if (autoExpand && rows.length > 0) {
            const firstRow = rows[0];
            const firstDetails = container.querySelector(`${detailsSelector}[data-for="${firstRow.dataset.id}"]`);
            if (firstDetails) {
                firstRow.classList.add('expanded');
                firstDetails.classList.add('expanded');
                if (dots && dots.length > 0) dots[0].classList.add('selected');
            }
        }
    },

    bindTableEvents() {
        const table = document.getElementById('eventTable');
        if (!table) return;

        this.bindExpandableRows({
            container: table,
            rowSelector: '.table-row',
            detailsSelector: '.table-row-details'
        });

        // Header click to sort
        table.querySelectorAll('.table-header .table-cell[data-sort]').forEach(cell => {
            cell.addEventListener('click', () => {
                const field = cell.dataset.sort;
                if (this.state.sort.field === field) {
                    this.state.sort.direction = this.state.sort.direction === 'asc' ? 'desc' : 'asc';
                } else {
                    this.state.sort.field = field;
                    this.state.sort.direction = 'asc';
                }
                localStorage.setItem('hpi-sort', JSON.stringify(this.state.sort));
                this.render();
            });
        });

        // Score row click to expand breakdown
        this.bindScoreRowEvents(table);
    },

    bindScoreRowEvents(container) {
        container.querySelectorAll('.score-row').forEach(row => {
            const header = row.querySelector('.score-row-header');
            if (!header) return;

            header.addEventListener('click', (e) => {
                e.stopPropagation(); // Don't bubble up to parent row
                row.classList.toggle('expanded');
            });
        });
    },

    render() {
        const filtered = this.getFilteredEvents();
        const sorted = this.sortEvents(filtered);
        const total = this.state.events.length;

        // Update result count
        const countEl = document.getElementById('resultCount');
        if (filtered.length === total) {
            countEl.innerHTML = `<span class="count">${total}</span> events`;
        } else {
            countEl.innerHTML = `Showing <span class="count">${filtered.length}</span> of ${total}`;
        }

        // Update Table
        const table = document.getElementById('eventTable');
        if (table) {
            // Update sort indicators in header
            const headerHtml = TableHeader();
            const rowsHtml = sorted.length
                ? sorted.map(TableRow).join('')
                : '<div class="table-empty">No matching events.</div>';

            table.innerHTML = headerHtml + rowsHtml;

            // Update active sort indicator
            const activeHeader = table.querySelector(`.table-cell[data-sort="${this.state.sort.field}"]`);
            if (activeHeader) {
                activeHeader.classList.add('sort-active');
                if (this.state.sort.direction === 'desc') {
                    activeHeader.classList.add('sort-desc');
                }
            }

            // Bind table event handlers
            this.bindTableEvents();

            // Auto-expand first row to show users what's available
            const firstRow = table.querySelector('.table-row');
            const firstDetails = table.querySelector('.table-row-details');
            if (firstRow && firstDetails) {
                firstRow.classList.add('expanded');
                firstDetails.classList.add('expanded');
            }
        }

        // Update based on current view
        if (this.state.currentView === 'map') {
            this.updateMap(filtered);
        } else if (this.state.currentView === 'timeline') {
            this.renderTimeline(filtered);
        } else if (this.state.currentView === 'chart') {
            this.updateChart(filtered);
        } else if (this.state.currentView === 'knowledge') {
            this.renderKnowledge();
        }
    },

    updateChart(events) {
        const container = document.getElementById('chartContainer');

        // Filter out events with unknown/zero deaths
        const chartEvents = events.filter(e => e.metrics.mortality.max > 0);

        // Chart dimensions
        const margin = { top: 20, right: 30, bottom: 50, left: 60 };
        const width = container.clientWidth;
        const height = container.clientHeight || 400;
        const plotWidth = width - margin.left - margin.right;
        const plotHeight = height - margin.top - margin.bottom;

        // Log scale for X axis (mortality)
        const xMin = Math.min(...chartEvents.map(e => e.metrics.mortality.max)) * 0.5;
        const xMax = Math.max(...chartEvents.map(e => e.metrics.mortality.max)) * 1.5;
        const logScale = (val) => {
            const logMin = Math.log10(xMin);
            const logMax = Math.log10(xMax);
            return ((Math.log10(val) - logMin) / (logMax - logMin)) * plotWidth;
        };

        // Linear scale for Y axis (0-100%)
        const yScale = (val) => plotHeight - (val / 100) * plotHeight;

        // Generate X axis ticks (powers of 10)
        const logMin = Math.floor(Math.log10(xMin));
        const logMax = Math.ceil(Math.log10(xMax));
        const xTicks = [];
        for (let i = logMin; i <= logMax; i++) {
            const val = Math.pow(10, i);
            if (val >= xMin && val <= xMax) {
                xTicks.push(val);
            }
        }

        // Y axis ticks
        const yTicks = [0, 20, 40, 60, 80, 100];

        // Format large numbers
        const formatTick = (n) => {
            if (n >= 1000000) return (n / 1000000) + 'M';
            if (n >= 1000) return (n / 1000) + 'k';
            return n;
        };

        // Build SVG
        const svg = `
            <svg class="chart-svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet">
                <!-- Grid lines -->
                <g class="chart-grid" transform="translate(${margin.left}, ${margin.top})">
                    ${yTicks.map(t => `<line x1="0" y1="${yScale(t)}" x2="${plotWidth}" y2="${yScale(t)}"/>`).join('')}
                    ${xTicks.map(t => `<line x1="${logScale(t)}" y1="0" x2="${logScale(t)}" y2="${plotHeight}"/>`).join('')}
                </g>

                <!-- X axis ticks -->
                <g transform="translate(${margin.left}, ${margin.top + plotHeight + 15})">
                    ${xTicks.map(t => `<text class="chart-tick" x="${logScale(t)}" text-anchor="middle">${formatTick(t)}</text>`).join('')}
                </g>

                <!-- X axis label -->
                <text class="chart-axis-label" x="${margin.left + plotWidth / 2}" y="${height - 10}" text-anchor="middle">Mortality (Log Scale)</text>

                <!-- Y axis ticks -->
                <g transform="translate(${margin.left - 10}, ${margin.top})">
                    ${yTicks.map(t => `<text class="chart-tick" x="0" y="${yScale(t) + 4}" text-anchor="end">${t}%</text>`).join('')}
                </g>

                <!-- Y axis label -->
                <text class="chart-axis-label" x="${15}" y="${margin.top + plotHeight / 2}" text-anchor="middle" transform="rotate(-90, 15, ${margin.top + plotHeight / 2})">Systematic Intensity</text>

                <!-- Data points (using shared Dot component) -->
                <g transform="translate(${margin.left}, ${margin.top})">
                    ${chartEvents.map(e => {
                        const { color } = Utils.getTheme(e.analysis.tier);
                        const x = logScale(e.metrics.mortality.max);
                        const y = yScale(e.metrics.scores.systematic_intensity);
                        return Dot({ id: e.id, color, x, y, svg: true });
                    }).join('')}
                </g>
            </svg>
        `;

        container.innerHTML = svg;

        // Bind events to dots
        this.bindChartEvents(chartEvents);
    },

    bindChartEvents(events) {
        const container = document.getElementById('chartContainer');
        const dots = container.querySelectorAll('.chart-dot');

        // Get or create tooltip
        let tooltip = document.getElementById('chart-tooltip');
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.id = 'chart-tooltip';
            tooltip.className = 'chart-tooltip';
            document.body.appendChild(tooltip);
        }

        dots.forEach(dot => {
            const event = events.find(e => e.id === dot.dataset.id);
            if (!event) return;

            // Hover - show tooltip
            dot.addEventListener('mouseenter', (e) => {
                tooltip.innerHTML = EventTooltip(event);
                tooltip.style.opacity = 1;

                const rect = dot.getBoundingClientRect();
                tooltip.style.left = rect.left + rect.width / 2 + 'px';
                tooltip.style.top = rect.top + rect.height / 2 + 'px';
            });

            dot.addEventListener('mouseleave', () => {
                tooltip.style.opacity = 0;
            });

            // Click - navigate to table
            dot.addEventListener('click', () => {
                this.switchView('cards');
                setTimeout(() => {
                    const row = document.querySelector(`.table-row[data-id="${event.id}"]`);
                    if (row) {
                        row.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        row.click();
                    }
                }, 100);
            });
        });
    },

    renderKnowledge() {
        // Helper: get short name for timeline labels
        const getShortName = (name) => {
            let shortName = name.replace(/\s*\([^)]+\)/, '').trim();
            if (shortName.includes(' of ')) {
                shortName = shortName.split(' of ').pop().split(' ')[0];
            } else if (shortName.includes(' für ')) {
                shortName = shortName.split(' ')[0];
            } else {
                shortName = shortName.split(' ')[0];
            }
            return shortName.length > 10 ? shortName.substring(0, 9) + '…' : shortName;
        };

        // Filter knowledge entries
        const filterEntries = (entries) => {
            return entries.filter(entry => {
                // Driver filter
                if (this.state.knowledgeDriver !== 'all' && entry.driver !== this.state.knowledgeDriver) {
                    return false;
                }
                // Search filter
                if (this.state.knowledgeSearch) {
                    const searchFields = [
                        entry.name,
                        entry.what_lost || entry.saved_how || '',
                        entry.description || '',
                        entry.driver_note || ''
                    ].join(' ').toLowerCase();
                    return searchFields.includes(this.state.knowledgeSearch);
                }
                return true;
            });
        };

        // Render a section (timeline + cards)
        const renderSection = (data, timelineId, cardsId, isSaved = false) => {
            const timelineEl = document.getElementById(timelineId);
            const cardsEl = document.getElementById(cardsId);

            if (!data.length) {
                timelineEl.innerHTML = '';
                cardsEl.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 2rem;">No results</p>';
                return;
            }

            const sorted = [...data].sort((a, b) => a.year - b.year);
            const padding = 5;
            const usableWidth = 100 - (padding * 2);

            // Timeline
            const dotsHtml = sorted.map((entry, index) => {
                const x = sorted.length > 1
                    ? padding + (index / (sorted.length - 1)) * usableWidth
                    : 50;

                const driver = Utils.getDriver(entry.driver);
                const yearLabel = Utils.formatYear(entry.year);
                const shortName = getShortName(entry.name);

                return `
                    <span class="timeline-year" style="left: ${x}%;">${yearLabel}</span>
                    ${Dot({ id: entry.id, color: driver.color, x, unit: '%' })}
                    <span class="timeline-label" style="left: ${x}%;">${shortName}</span>
                `;
            }).join('');

            timelineEl.innerHTML = `
                <div class="timeline-track">
                    <div class="timeline-line"></div>
                    ${dotsHtml}
                </div>
            `;

            // Cards - using KnowledgeCard component (same pattern as TableRow)
            const cardsHtml = sorted.map(entry => {
                const connectedEvent = entry.connected_event
                    ? this.state.events.find(e => e.id === entry.connected_event)
                    : null;
                return KnowledgeCard(entry, isSaved, connectedEvent);
            }).join('');

            cardsEl.innerHTML = cardsHtml;
        };

        // Filter and render both sections
        const lostFiltered = filterEntries(this.state.knowledgeLost);
        const savedFiltered = filterEntries(this.state.knowledgeSaved);
        const totalLost = this.state.knowledgeLost.length;
        const totalSaved = this.state.knowledgeSaved.length;

        // Update counts
        document.getElementById('lostCount').textContent = lostFiltered.length === totalLost
            ? `${totalLost} irreversible`
            : `${lostFiltered.length} of ${totalLost}`;
        document.getElementById('savedCount').textContent = savedFiltered.length === totalSaved
            ? `${totalSaved} rescued`
            : `${savedFiltered.length} of ${totalSaved}`;

        // Update result count
        const total = totalLost + totalSaved;
        const filtered = lostFiltered.length + savedFiltered.length;
        const countEl = document.getElementById('knowledgeResultCount');
        if (countEl) {
            countEl.textContent = filtered === total ? '' : `Showing ${filtered} of ${total}`;
        }

        renderSection(lostFiltered, 'knowledgeLostTimeline', 'knowledgeLostCards', false);
        renderSection(savedFiltered, 'knowledgeSavedTimeline', 'knowledgeSavedCards', true);

        // Bind events
        this.bindKnowledgeEvents();
    },

    bindKnowledgeEvents() {
        // Bind Lost section
        const lostCards = document.getElementById('knowledgeLostCards');
        const lostDots = document.querySelectorAll('#knowledgeLostTimeline .timeline-dot');
        this.bindExpandableRows({
            container: lostCards,
            rowSelector: '.knowledge-row',
            detailsSelector: '.knowledge-row-details',
            dots: lostDots,
            autoExpand: true
        });

        // Bind Saved section
        const savedCards = document.getElementById('knowledgeSavedCards');
        const savedDots = document.querySelectorAll('#knowledgeSavedTimeline .timeline-dot');
        this.bindExpandableRows({
            container: savedCards,
            rowSelector: '.knowledge-row',
            detailsSelector: '.knowledge-row-details',
            dots: savedDots,
            autoExpand: true
        });

        // Connected event links (navigate to Table view)
        document.querySelectorAll('.knowledge-link[data-event-id]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const eventId = link.dataset.eventId;

                this.switchView('cards');
                setTimeout(() => {
                    const row = document.querySelector(`.table-row[data-id="${eventId}"]`);
                    if (row) {
                        row.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        row.click();
                    }
                }, 100);
            });
        });
    }
};

// Boot
App.init();
