/**
 * HPI App - Main application logic
 */

import { Utils, DRIVERS } from './utils.js';
import { Card, MapPopup, TableRow, TableHeader, KnowledgeCard } from './components.js';

// --- APP LOGIC (State & Effects) ---
const App = {
    state: {
        events: [],
        knowledgeLost: [],
        knowledgeSaved: [],
        chart: null,
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

        // Hide/show filter bar based on view (not relevant for Knowledge Lost)
        const filterBar = document.querySelector('.filter-bar');
        const toolbar = document.querySelector('.toolbar-compact');
        if (view === 'knowledge') {
            filterBar.classList.add('hidden');
            toolbar.classList.add('hidden');
        } else {
            filterBar.classList.remove('hidden');
            toolbar.classList.remove('hidden');
        }

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
                <div class="timeline-event"
                     style="left: ${x}px; background: ${color};"
                     data-id="${event.id}">
                    <div class="timeline-tooltip">
                        <strong>${event.name}</strong><br>
                        ${event.period.start}–${event.period.end}
                    </div>
                </div>
                <span class="timeline-year-label" style="left: ${x}px;">${event.period.start}</span>
                <span class="timeline-name-label" style="left: ${x}px;">${shortName}</span>`;
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
            if (e.target.closest('.timeline-event')) return;
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
        const dots = timeline.querySelectorAll('.timeline-event');

        this.bindExpandableRows({
            container,
            rowSelector: '.table-row',
            detailsSelector: '.table-row-details',
            dots,
            autoExpand: true
        });
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
                            backgroundColor: '#181825',  // ctp-mantle
                            titleColor: '#cdd6f4',       // ctp-text
                            bodyColor: '#a6adc8',        // ctp-subtext
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
                            grid: { color: '#45475a' },   // ctp-surface1
                            ticks: { color: '#6c7086' },  // ctp-overlay0
                            title: { display: true, text: 'Mortality (Log Scale)', color: '#a6adc8' }
                        },
                        y: {
                            min: 0,
                            max: 105,
                            grid: { color: '#45475a' },   // ctp-surface1
                            ticks: { color: '#6c7086' },  // ctp-overlay0
                            title: { display: true, text: 'Systematic Intensity (%)', color: '#a6adc8' }
                        }
                    }
                }
            });
        }
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
                    <div class="timeline-dot"
                         style="left: calc(${x}% - 8px); background: ${driver.color};"
                         data-id="${entry.id}"
                         title="${entry.name}">
                    </div>
                    <span class="timeline-year" style="left: ${x}%;">${yearLabel}</span>
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
