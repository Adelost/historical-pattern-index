/**
 * HPI Components - Pure HTML generator functions
 */

import { Utils, DRIVERS } from './utils.js';

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
        generational_targeting: 'Generational Targeting',
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
        existential_threat: 'Existential Threat',
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

// Category labels and colors (Catppuccin Mocha)
const categoryMeta = {
    systematic_intensity: { label: 'Systematic Intensity', color: '#f38ba8' },  // red
    profit: { label: 'Profit Motive', color: '#cba6f7' },                       // mauve
    ideology: { label: 'Ideology', color: '#89b4fa' },                          // blue
    complicity: { label: 'Complicity', color: '#a6e3a1' }                       // green
};

// Breakdown checklist component
export const BreakdownSection = (breakdowns, rationales = {}) => {
    if (!breakdowns) return '';

    const categories = Object.entries(breakdowns).map(([category, items]) => {
        const meta = categoryMeta[category] || { label: category, color: '#a6adc8' };
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

// Detailed Analysis - combines causes and breakdown in one collapsible
export const DetailedAnalysis = (analysis, breakdowns, rationales) => {
    const signs = analysis.warning_signs || [];
    const causes = analysis.root_causes || '';
    const hasBreakdowns = breakdowns && Object.keys(breakdowns).length > 0;

    if (!signs.length && !causes && !hasBreakdowns) return '';

    const signsList = signs.map(sign => `
        <div class="warning-sign">
            <span class="warning-icon">⚠</span>
            <span>${sign}</span>
        </div>
    `).join('');

    // Build breakdown categories (Catppuccin Mocha)
    const categoryMeta = {
        systematic_intensity: { label: 'Systematic Intensity', color: '#f38ba8' },  // red
        profit: { label: 'Profit Motive', color: '#cba6f7' },                       // mauve
        ideology: { label: 'Ideology', color: '#89b4fa' },                          // blue
        complicity: { label: 'Complicity', color: '#a6e3a1' }                       // green
    };

    const formatKey = (key) => {
        const labels = {
            policy: 'Official Policy', state_involvement: 'State Involvement',
            infrastructure: 'Dedicated Infrastructure', propaganda: 'Propaganda Campaign',
            generational_targeting: 'Generational Targeting', cultural_ban: 'Cultural/Religious Ban',
            property_seizure: 'Property Seizure', identification: 'Identification System',
            deliberate_deprivation: 'Deliberate Deprivation', duration_over_5y: 'Duration > 5 Years',
            direct_revenue: 'Direct Revenue', resource_extraction: 'Resource Extraction',
            forced_labor: 'Forced Labor', economic_dependence: 'Economic Dependence',
            market_integration: 'Market Integration', purity_ideal: 'Purity Ideal',
            dehumanization: 'Dehumanization', mass_mobilization: 'Mass Mobilization',
            existential_threat: 'Existential Threat', utopianism: 'Utopian Vision',
            distance: 'Geographic Distance', benefit: 'Benefiting Population',
            euphemisms: 'Euphemistic Language', diffused_responsibility: 'Diffused Responsibility',
            silence: 'Institutional Silence'
        };
        return labels[key] || key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    };

    const breakdownHtml = hasBreakdowns ? Object.entries(breakdowns).map(([category, items]) => {
        const meta = categoryMeta[category] || { label: category, color: '#a6adc8' };
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
    }).join('') : '';

    return `
        <details class="detailed-analysis">
            <summary class="analysis-toggle">
                <span>Detailed Analysis</span>
                <svg class="chevron" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                    <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
                </svg>
            </summary>
            <div class="analysis-content">
                ${signs.length ? `
                    <div class="analysis-section">
                        <div class="analysis-label">Warning Signs</div>
                        ${signsList}
                    </div>
                ` : ''}
                ${causes ? `
                    <div class="analysis-section">
                        <div class="analysis-label">Root Causes</div>
                        <p>${causes}</p>
                    </div>
                ` : ''}
                ${breakdownHtml ? `
                    <div class="analysis-section">
                        <div class="analysis-label">Score Breakdown</div>
                        <div class="breakdown-content">
                            ${breakdownHtml}
                        </div>
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
            ${event.erasure_note ? `<div class="erasure-note"><strong>Beyond death toll:</strong> ${event.erasure_note}</div>` : ''}
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

// Table Row Component
export const TableRow = (event) => {
    const { color, shortLabel } = Utils.getTheme(event.analysis.tier);
    const deaths = event.metrics.mortality;
    const scores = event.metrics.scores;
    const breakdowns = event.metrics.breakdowns;
    const rationales = event.metrics.rationales || {};
    const denialStatus = event.denial_status || 'acknowledged';
    const period = `${event.period.start}–${event.period.end}`;

    // Truncate region for display
    const region = event.geography.region.split('(')[0].split(',')[0].trim();

    return `
    <div class="table-row expandable-row" data-id="${event.id}" style="--tier-color: ${color}">
        <div class="table-cell cell-tier">
            <span class="tier-dot"></span>
        </div>
        <div class="table-cell cell-name">
            <span class="event-name">${event.name}</span>
            <span class="event-meta">
                <span class="tier-label">${shortLabel}</span>
                ${denialStatus === 'denied' ? '<span class="denied-tag">DENIED</span>' : ''}
                <span class="mobile-deaths">${Utils.formatDeaths(deaths.min, deaths.max)}</span>
            </span>
        </div>
        <div class="table-cell cell-period">${period}</div>
        <div class="table-cell cell-deaths">${Utils.formatDeaths(deaths.min, deaths.max)}</div>
        <div class="table-cell cell-region">${region}</div>
        <div class="table-cell cell-expand">
            <span class="expand-hint">Details</span>
            <svg class="expand-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
            </svg>
        </div>
    </div>
    <div class="table-row-details expandable-row-details" data-for="${event.id}">
        <div class="details-inner">
            ${event.description ? `<p class="details-description">${event.description}</p>` : ''}

            <div class="details-scores">
                ${ScoreBar('Systematic', scores.systematic_intensity, 'systematic')}
                ${ScoreBar('Profit', scores.profit, 'profit')}
                ${ScoreBar('Ideology', scores.ideology, 'ideology')}
                ${ScoreBar('Complicity', scores.complicity, 'complicity')}
            </div>

            <div class="details-note">
                "${event.analysis.pattern_note}"
            </div>

            ${event.erasure_note ? `<div class="details-erasure"><strong>Beyond death toll:</strong> ${event.erasure_note}</div>` : ''}

            ${DetailedAnalysis(event.analysis, breakdowns, rationales)}

            ${event.wikipedia_url ? `<a href="${event.wikipedia_url}" target="_blank" rel="noopener" class="details-wiki">Read more on Wikipedia →</a>` : ''}
        </div>
    </div>`;
};

// Table Header
export const TableHeader = () => `
    <div class="table-header">
        <div class="table-cell cell-tier"></div>
        <div class="table-cell cell-name" data-sort="name">
            Event
            <svg class="sort-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5z"/></svg>
        </div>
        <div class="table-cell cell-period" data-sort="period">
            Period
            <svg class="sort-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5z"/></svg>
        </div>
        <div class="table-cell cell-deaths" data-sort="deaths">
            Deaths
            <svg class="sort-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5z"/></svg>
        </div>
        <div class="table-cell cell-region" data-sort="region">
            Region
            <svg class="sort-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5z"/></svg>
        </div>
        <div class="table-cell cell-expand"></div>
    </div>`;

// Knowledge Card - used for Knowledge Lost/Saved entries
// Follows same pattern as TableRow: row → expandable details
export const KnowledgeCard = (entry, isSaved = false, connectedEvent = null) => {
    const driver = Utils.getDriver(entry.driver);
    const yearLabel = Utils.formatYear(entry.year, entry.year_end);

    // Main content differs between lost and saved
    const mainContent = isSaved ? entry.saved_how : entry.what_lost;
    const quantity = isSaved ? entry.quantity_threatened : entry.quantity;

    // Connected event link
    const connectedHtml = connectedEvent ? `
        <a href="#" class="knowledge-link" data-event-id="${connectedEvent.id}">
            ↳ Connected: ${connectedEvent.name}
        </a>
    ` : '';

    return `
    <div class="knowledge-row expandable-row" data-id="${entry.id}" style="--driver-color: ${driver.color}">
        <div class="knowledge-row-header">
            <span class="knowledge-dot"></span>
            <div class="knowledge-info">
                <span class="knowledge-name">${entry.name}</span>
                <span class="knowledge-meta">
                    <span class="knowledge-year">${yearLabel}</span>
                    <span class="knowledge-driver" style="color: ${driver.color}">${driver.label}</span>
                    <span class="knowledge-type">${entry.type}</span>
                </span>
            </div>
            <div class="knowledge-expand">
                <span class="expand-hint">Details</span>
                <svg class="expand-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
                </svg>
            </div>
        </div>
    </div>
    <div class="knowledge-row-details expandable-row-details" data-for="${entry.id}">
        <div class="details-inner">
            ${entry.description ? `<p class="details-description">${entry.description}</p>` : ''}

            <div class="knowledge-facts">
                ${quantity ? `<div class="knowledge-fact"><strong>${isSaved ? 'Threatened:' : 'Lost:'}</strong> ${quantity}</div>` : ''}
                ${mainContent ? `<div class="knowledge-fact"><strong>${isSaved ? 'How saved:' : 'What was lost:'}</strong> ${mainContent}</div>` : ''}
            </div>

            <div class="details-note">
                "${entry.driver_note}"
            </div>

            ${connectedHtml}

            ${entry.sources ? `
                <details class="detailed-analysis">
                    <summary class="analysis-toggle">
                        <span>Sources</span>
                        <svg class="chevron" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                            <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
                        </svg>
                    </summary>
                    <div class="analysis-content">
                        <ul class="knowledge-sources">
                            ${entry.sources.map(s => `<li>${s}</li>`).join('')}
                        </ul>
                    </div>
                </details>
            ` : ''}
        </div>
    </div>`;
};
