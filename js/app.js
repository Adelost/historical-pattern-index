/**
 * HPI App - Main application logic
 */

import { Utils } from './utils.js';
import { Card } from './components.js';

// --- APP LOGIC (State & Effects) ---
const App = {
    state: {
        events: [],
        chart: null,
        filters: { period: 'all', tier: 'all', region: 'all' }
    },

    async init() {
        try {
            const idx = await fetch('data/index.json').then(r => r.json());
            const promises = idx.map(url => fetch(url).then(r => r.json()));
            this.state.events = await Promise.all(promises);

            this.bindEvents();
            this.render();
        } catch (e) {
            console.error("Init failed:", e);
            document.querySelector('main').innerHTML = `<div class="error-message">Failed to load data. ${e.message}</div>`;
        }
    },

    bindEvents() {
        // Filter Changes
        ['filterPeriod', 'filterTier', 'filterRegion'].forEach(id => {
            document.getElementById(id).addEventListener('change', (e) => {
                const key = id.replace('filter', '').toLowerCase();
                this.state.filters[key] = e.target.value;
                this.render();
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

    render() {
        const filtered = this.state.events.filter(e => Utils.matches(e, this.state.filters));
        const sorted = [...filtered].sort((a, b) => b.metrics.mortality.max - a.metrics.mortality.max);

        // Update Grid
        const grid = document.getElementById('cardGrid');
        grid.setAttribute('aria-busy', 'false');
        grid.innerHTML = sorted.length
            ? sorted.map(Card).join('')
            : '<p style="grid-column:1/-1;text-align:center;color:#64748b">No matching events.</p>';

        // Update Chart
        this.updateChart(sorted);
    },

    updateChart(events) {
        const ctx = document.getElementById('hpiChart').getContext('2d');
        const data = events.map(e => ({
            x: Math.max(1, e.metrics.mortality.max),
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
                            title: { display: true, text: 'Mortality (Log)', color: '#64748b' }
                        },
                        y: {
                            min: 0,
                            max: 105,
                            grid: { color: '#334155' },
                            title: { display: true, text: 'Systematic Intensity (%)', color: '#64748b' }
                        }
                    }
                }
            });
        }
    }
};

// Boot
App.init();
