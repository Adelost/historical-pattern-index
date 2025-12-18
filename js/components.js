/**
 * HPI Components - Pure HTML generator functions
 */

import { Utils } from './utils.js';

// --- COMPONENTS (HTML Generators) ---

export const Icon = (path) =>
    `<svg style="width:16px; height:16px; fill:currentColor" viewBox="0 0 24 24">${path}</svg>`;

export const Badge = (tierName) => {
    const { icon } = Utils.getTheme(tierName);
    return `<div class="badge">${Icon(icon)} ${tierName}</div>`;
};

export const Metric = (label, value, sub) => `
    <div class="metric">
        <b>${value}</b>
        ${label}
        ${sub ? `<div style="opacity:0.7">${sub}</div>` : ''}
    </div>`;

export const Card = (event) => {
    const { color } = Utils.getTheme(event.analysis.tier);
    const deaths = event.metrics.mortality;
    const scores = event.metrics.scores;

    return `
    <article class="card" style="--tier-color: ${color}" tabindex="0" aria-label="${event.name}, ${event.analysis.tier}">
        <div class="card-header">
            <div>
                <h3>${event.name}</h3>
                <div class="meta">${event.geography.region} • ${event.period.start}-${event.period.end}</div>
            </div>
            ${Badge(event.analysis.tier)}
        </div>

        <div class="metrics-row">
            ${Metric('Deaths', Utils.formatNum(deaths.max), `Init: ${Utils.formatMillions(deaths.population_initial)}`)}
            ${Metric('Intensity', scores.systematic_intensity + '%')}
            ${Metric('Profit', scores.profit + '%')}
        </div>

        <div class="note">"${event.analysis.pattern_note}"</div>
    </article>`;
};
