/**
 * HPI App - Main application logic
 */

import { Utils } from './utils.js';
import { Card, MapPopup, TableRow, TableHeader } from './components.js';

// --- APP LOGIC (State & Effects) ---
const App = {
    state: {
        events: [],
        chart: null,
        map: null,
        markers: [],
        currentView: 'cards',
        filters: { period: 'all', tier: 'all', denial: 'all' },
        sort: { field: 'period', direction: 'asc' }
    },

    async init() {
        try {
            const idx = await fetch('data/index.json').then(r => r.json());
            const promises = idx.map(url => fetch(url).then(r => r.json()));
            this.state.events = await Promise.all(promises);

            this.updateStats();
            this.bindEvents();
            this.render();
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
    },

    switchView(view) {
        this.state.currentView = view;

        // Update tabs
        document.querySelectorAll('.view-tab').forEach(t => t.classList.remove('active'));
        document.querySelector(`[data-view="${view}"]`).classList.add('active');

        // Update views
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        document.getElementById(`${view}View`).classList.add('active');

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

        // Sort by start year
        const sorted = [...events].sort((a, b) => a.period.start - b.period.start);

        // Calculate time range
        const years = sorted.map(e => [e.period.start, e.period.end]).flat();
        const minYear = Math.min(...years);
        const maxYear = Math.max(...years);
        const range = maxYear - minYear;

        // Create axis markers
        const markers = [];
        const step = range > 500 ? 200 : range > 200 ? 100 : 50;
        const startMarker = Math.ceil(minYear / step) * step;

        for (let year = startMarker; year <= maxYear; year += step) {
            const x = ((year - minYear) / range) * 100;
            markers.push(`<div class="timeline-marker" style="left: ${x}%">${year}</div>`);
        }

        // Create events - just dots, no labels
        const eventHtml = sorted.map(event => {
            const x = ((event.period.start - minYear) / range) * 100;
            const { color } = Utils.getTheme(event.analysis.tier);
            const deaths = Utils.formatDeaths(event.metrics.mortality.min, event.metrics.mortality.max);

            return `
                <div class="timeline-event"
                     style="left: ${x}%; background: ${color};"
                     data-id="${event.id}">
                    <div class="timeline-tooltip">
                        <strong>${event.name}</strong><br>
                        ${event.period.start}–${event.period.end} · ${deaths} deaths
                    </div>
                </div>`;
        }).join('');

        timeline.innerHTML = `
            <div class="timeline-axis"></div>
            ${markers.join('')}
            ${eventHtml}
        `;

        // Add click handlers - show info panel
        timeline.querySelectorAll('.timeline-event').forEach(el => {
            el.addEventListener('click', () => {
                const id = el.dataset.id;
                const event = this.state.events.find(e => e.id === id);
                if (!event) return;

                // Update selection state
                timeline.querySelectorAll('.timeline-event').forEach(e => e.classList.remove('selected'));
                el.classList.add('selected');

                // Show info panel
                const infoPanel = document.getElementById('timelineInfo');
                const scores = event.metrics.scores;
                const deaths = Utils.formatDeaths(event.metrics.mortality.min, event.metrics.mortality.max);

                document.getElementById('timelineInfoTitle').textContent = event.name;
                document.getElementById('timelineInfoMeta').innerHTML =
                    `${event.geography.region} · ${event.period.start}–${event.period.end} · <strong>${deaths} deaths</strong>`;
                document.getElementById('timelineInfoScores').innerHTML = `
                    <span class="score-pill" style="border-left: 3px solid #ef4444;">Systematic ${scores.systematic_intensity}%</span>
                    <span class="score-pill" style="border-left: 3px solid #a78bfa;">Profit ${scores.profit}%</span>
                    <span class="score-pill" style="border-left: 3px solid #38bdf8;">Ideology ${scores.ideology}%</span>
                    <span class="score-pill" style="border-left: 3px solid #4ade80;">Complicity ${scores.complicity}%</span>
                `;
                document.getElementById('timelineInfoNote').textContent = `"${event.analysis.pattern_note}"`;
                infoPanel.classList.add('visible');
            });
        });
    },

    getFilteredEvents() {
        return this.state.events.filter(e => Utils.matches(e, this.state.filters));
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

    bindTableEvents() {
        const table = document.getElementById('eventTable');
        if (!table) return;

        // Row click to expand/collapse
        table.querySelectorAll('.table-row').forEach(row => {
            row.addEventListener('click', () => {
                const id = row.dataset.id;
                const details = table.querySelector(`.table-row-details[data-for="${id}"]`);
                if (!details) return;

                const isExpanded = row.classList.contains('expanded');

                // Close all other rows
                table.querySelectorAll('.table-row.expanded').forEach(r => {
                    r.classList.remove('expanded');
                    const d = table.querySelector(`.table-row-details[data-for="${r.dataset.id}"]`);
                    if (d) d.classList.remove('expanded');
                });

                // Toggle this row
                if (!isExpanded) {
                    row.classList.add('expanded');
                    details.classList.add('expanded');
                }
            });
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
                this.render();
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
        }

        // Update based on current view
        if (this.state.currentView === 'map') {
            this.updateMap(filtered);
        } else if (this.state.currentView === 'timeline') {
            this.renderTimeline(filtered);
        } else if (this.state.currentView === 'chart') {
            this.updateChart(filtered);
        }
    },

    updateChart(events) {
        const ctx = document.getElementById('hpiChart').getContext('2d');
        // Filter out events with unknown/zero deaths - they can't be meaningfully plotted on mortality axis
        const chartEvents = events.filter(e => e.metrics.mortality.max > 0);
        const data = chartEvents.map(e => ({
            x: e.metrics.mortality.max,
            y: e.metrics.scores.systematic_intensity,
            tier: e.analysis.tier,
            raw: e
        }));

        if (this.state.chart) {
            this.state.chart.data.datasets[0].data = data;
            this.state.chart.update();
        } else {
            this.state.chart = new Chart(ctx, {
                type: 'scatter',
                data: {
                    datasets: [{
                        data: data,
                        backgroundColor: (ctx) => Utils.getTheme(ctx.raw?.tier).color,
                        pointRadius: 8,
                        pointHoverRadius: 12,
                        borderWidth: 1,
                        borderColor: 'rgba(255,255,255,0.3)'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    onClick: (evt, elements) => {
                        if (elements.length > 0) {
                            const event = elements[0].element.$context.raw.raw;
                            this.switchView('cards');
                            setTimeout(() => {
                                const row = document.querySelector(`.table-row[data-id="${event.id}"]`);
                                if (row) {
                                    row.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                    row.click();
                                }
                            }, 100);
                        }
                    },
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            backgroundColor: '#0f172a',
                            titleColor: '#f1f5f9',
                            bodyColor: '#cbd5e1',
                            callbacks: {
                                label: (c) => c.raw.raw.name,
                                afterLabel: (c) => [
                                    `Deaths: ${Utils.formatNum(c.raw.raw.metrics.mortality.max)}`,
                                    `Intensity: ${c.raw.y}%`,
                                    `Tier: ${c.raw.tier}`
                                ]
                            }
                        }
                    },
                    scales: {
                        x: {
                            type: 'logarithmic',
                            grid: { color: '#334155' },
                            ticks: { color: '#64748b' },
                            title: { display: true, text: 'Mortality (Log Scale)', color: '#94a3b8' }
                        },
                        y: {
                            min: 0,
                            max: 105,
                            grid: { color: '#334155' },
                            ticks: { color: '#64748b' },
                            title: { display: true, text: 'Systematic Intensity (%)', color: '#94a3b8' }
                        }
                    }
                }
            });
        }
    }
};

// Boot
App.init();
