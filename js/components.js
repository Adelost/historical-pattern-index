/**
 * HPI Components - Pure HTML generator functions
 */

import { Utils } from './utils.js';

// --- COMPONENTS (HTML Generators) ---

export const Icon = (path) =>
    `<svg style="width:16px; height:16px; fill:currentColor" viewBox="0 0 24 24">${path}</svg>`;

export const Badge = (tierName) => {
    const { icon, shortLabel } = Utils.getTheme(tierName);
    return `<div class="badge">${Icon(icon)} ${shortLabel || tierName}</div>`;
};

export const ScoreBar = (label, value, type) => `
    <div class="score-item">
        <div class="score-header">
            <span>${label}</span>
            <span>${value}%</span>
        </div>
        <div class="score-bar">
            <div class="score-fill ${type}" style="width: ${value}%"></div>
        </div>
    </div>`;

export const DenialBadge = (status) => {
    if (status === 'denied') {
        return '<span class="denial-badge denied">DENIED</span>';
    } else if (status === 'partial') {
        return '<span class="denial-badge partial">PARTIAL</span>';
    }
    return '';
};

export const StatusBadge = (status) => {
    if (status === 'ongoing') {
        return '<span class="status-badge ongoing">ONGOING</span>';
    }
    return '';
};

export const Metric = (label, value) => `
    <div class="metric">
        <b>${value}</b>
        ${label}
    </div>`;

// Format breakdown key to readable label
const formatKey = (key) => {
    const labels = {
        // Systematic Intensity
        policy: 'Official Policy',
        state_involvement: 'State Involvement',
        infrastructure: 'Dedicated Infrastructure',
        propaganda: 'Propaganda Campaign',
        broad_targeting: 'Broad Targeting',
        cultural_ban: 'Cultural/Religious Ban',
        property_seizure: 'Property Seizure',
        identification: 'Identification System',
        deliberate_deprivation: 'Deliberate Deprivation',
        duration_over_5y: 'Duration > 5 Years',
        // Profit
        direct_revenue: 'Direct Revenue',
        resource_extraction: 'Resource Extraction',
        forced_labor: 'Forced Labor',
        economic_dependence: 'Economic Dependence',
        market_integration: 'Market Integration',
        // Ideology
        purity_ideal: 'Purity Ideal',
        dehumanization: 'Dehumanization',
        mass_mobilization: 'Mass Mobilization',
        victim_narrative: 'Existential Threat Narrative',
        utopianism: 'Utopian Vision',
        // Complicity
        distance: 'Geographic Distance',
        benefit: 'Benefiting Population',
        euphemisms: 'Euphemistic Language',
        diffused_responsibility: 'Diffused Responsibility',
        silence: 'Institutional Silence'
    };
    return labels[key] || key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
};

// Category labels and colors
const categoryMeta = {
    systematic_intensity: { label: 'Systematic Intensity', color: '#ef4444' },
    profit: { label: 'Profit Motive', color: '#a78bfa' },
    ideology: { label: 'Ideology', color: '#38bdf8' },
    complicity: { label: 'Complicity', color: '#4ade80' }
};

// Breakdown checklist component
export const BreakdownSection = (breakdowns, rationales = {}) => {
    if (!breakdowns) return '';

    const categories = Object.entries(breakdowns).map(([category, items]) => {
        const meta = categoryMeta[category] || { label: category, color: '#94a3b8' };
        const rationale = rationales[category] || '';

        const itemsList = Object.entries(items).map(([key, value]) => `
            <div class="breakdown-item ${value ? 'checked' : ''}">
                <span class="breakdown-check">${value ? '✓' : '✗'}</span>
                <span>${formatKey(key)}</span>
            </div>
        `).join('');

        return `
            <div class="breakdown-category">
                <div class="breakdown-category-header" style="--cat-color: ${meta.color}">
                    ${meta.label}
                </div>
                <div class="breakdown-items">
                    ${itemsList}
                </div>
                ${rationale ? `<div class="breakdown-rationale">${rationale}</div>` : ''}
            </div>
        `;
    }).join('');

    return `
        <details class="breakdown-details">
            <summary class="breakdown-toggle">
                <span>View Score Breakdown</span>
                <svg class="chevron" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                    <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
                </svg>
            </summary>
            <div class="breakdown-content">
                ${categories}
            </div>
        </details>
    `;
};

// Warning signs and root causes section
export const CausesSection = (analysis) => {
    const signs = analysis.warning_signs || [];
    const causes = analysis.root_causes || '';

    if (!signs.length && !causes) return '';

    const signsList = signs.map(sign => `
        <div class="warning-sign">
            <span class="warning-icon">⚠</span>
            <span>${sign}</span>
        </div>
    `).join('');

    return `
        <details class="causes-details">
            <summary class="causes-toggle">
                <span>Why Did This Happen?</span>
                <svg class="chevron" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                    <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
                </svg>
            </summary>
            <div class="causes-content">
                ${signs.length ? `
                    <div class="warning-signs">
                        <div class="causes-label">Warning Signs</div>
                        ${signsList}
                    </div>
                ` : ''}
                ${causes ? `
                    <div class="root-causes">
                        <div class="causes-label">Root Causes</div>
                        <p>${causes}</p>
                    </div>
                ` : ''}
            </div>
        </details>
    `;
};

export const Card = (event) => {
    const { color } = Utils.getTheme(event.analysis.tier);
    const deaths = event.metrics.mortality;
    const scores = event.metrics.scores;
    const breakdowns = event.metrics.breakdowns;
    const rationales = event.metrics.rationales || {};
    const denialStatus = event.denial_status || 'acknowledged';

    return `
    <article class="card" id="card-${event.id}" style="--tier-color: ${color}" tabindex="0" aria-label="${event.name}, ${event.analysis.tier}">
        <div class="card-header">
            <div>
                <h3>${event.name}${DenialBadge(denialStatus)}${StatusBadge(event.status)}</h3>
                <div class="meta">${event.geography.region} · ${event.period.start}–${event.period.end}</div>
            </div>
            ${Badge(event.analysis.tier)}
        </div>

        <div class="card-summary">
            <span class="death-count">${Utils.formatDeaths(deaths.min, deaths.max)}</span>
            <span class="death-label">deaths</span>
            ${deaths.population_loss_percent ? `<span class="pop-loss">${deaths.population_loss_percent}% of population</span>` : ''}
        </div>

        <details class="card-details">
            <summary class="details-toggle">
                <span>View analysis</span>
                <svg class="chevron" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                    <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
                </svg>
            </summary>

            <div class="scores">
                ${ScoreBar('Systematic', scores.systematic_intensity, 'systematic')}
                ${ScoreBar('Profit', scores.profit, 'profit')}
                ${ScoreBar('Ideology', scores.ideology, 'ideology')}
                ${ScoreBar('Complicity', scores.complicity, 'complicity')}
            </div>

            ${BreakdownSection(breakdowns, rationales)}

            ${CausesSection(event.analysis)}

            <div class="note">"${event.analysis.pattern_note}"</div>
        </details>

        ${event.wikipedia_url ? `<a href="${event.wikipedia_url}" target="_blank" rel="noopener" class="wiki-link">Wikipedia →</a>` : ''}
    </article>`;
};

// Map popup
export const MapPopup = (event) => {
    const deaths = event.metrics.mortality;
    return `
    <div class="map-popup">
        <h4>${event.name}</h4>
        <div class="meta">${event.period.start}–${event.period.end}</div>
        <div class="deaths">${Utils.formatDeaths(deaths.min, deaths.max)} deaths</div>
    </div>`;
};

// Timeline event
export const TimelineEvent = (event, x, row) => {
    const { color } = Utils.getTheme(event.analysis.tier);
    const y = 41 + (row * 50);
    return `
    <div class="timeline-event"
         style="left: ${x}%; top: ${y}px; background: ${color};"
         data-id="${event.id}">
        <div class="timeline-tooltip">
            <strong>${event.name}</strong><br>
            ${event.period.start}–${event.period.end}<br>
            ${Utils.formatDeaths(event.metrics.mortality.min, event.metrics.mortality.max)} deaths
        </div>
    </div>
    <div class="timeline-label" style="left: ${x}%; top: ${y + 20}px;">
        ${event.name.length > 20 ? event.name.substring(0, 18) + '…' : event.name}
    </div>`;
};
