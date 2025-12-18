/**
 * HPI App - Main application logic
 */

import { Utils } from './utils.js';
import { Card, MapPopup } from './components.js';

// --- APP LOGIC (State & Effects) ---
const App = {
    state: {
        events: [],
        chart: null,
        map: null,
        markers: [],
        currentView: 'cards',
        filters: { period: 'all', tier: 'all', denial: 'all' }
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
                // Scroll to card when map marker clicked
                const card = document.getElementById(`card-${event.id}`);
                if (card && this.state.currentView === 'cards') {
                    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    card.focus();
                }
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

    render() {
        const filtered = this.getFilteredEvents();
        const sorted = [...filtered].sort((a, b) => a.period.start - b.period.start);

        // Update Grid (always, for when switching back)
        const grid = document.getElementById('cardGrid');
        grid.innerHTML = sorted.length
            ? sorted.map(Card).join('')
            : '<p style="grid-column:1/-1;text-align:center;color:#64748b">No matching events.</p>';

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
                                const card = document.getElementById(`card-${event.id}`);
                                if (card) {
                                    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                    card.focus();
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
