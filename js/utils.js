/**
 * HPI Utils - Theme configuration and utility functions
 */

// --- DATA DICTIONARY (Single Source of Truth) ---

// Driver colors for Knowledge Lost/Saved
export const DRIVERS = {
    'religious_ideology': { label: 'Religious', color: '#ef4444' },
    'conquest': { label: 'Conquest', color: '#64748b' },
    'ethnic_ideology': { label: 'Ethnic', color: '#a855f7' },
    'political_ideology': { label: 'Political', color: '#f97316' },
    'economic_exploitation': { label: 'Economic', color: '#22c55e' }
};

// Semantic colors: Profit=Gold, Ideology=Red, Collapse=SlateBlue
export const THEME = {
    tiers: {
        'TOTAL ERASURE': {
            color: '#dc2626',  // Crimson - blood, ethnic cleansing
            shortLabel: 'Erasure',
            icon: '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-9h10v2H7z"/>'
        },
        'INDUSTRIAL MEGA-EVENT': {
            color: '#ef4444',  // Red - ideology, industrialized killing
            shortLabel: 'Industrial',
            icon: '<path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10z"/>'
        },
        'CONTINENTAL COLLAPSE': {
            color: '#64748b',  // Slate - war, empire collapse
            shortLabel: 'Collapse',
            icon: '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>'
        },
        'PROFIT-DRIVEN ATTRITION': {
            color: '#d97706',  // Amber/Gold - profit, greed, extraction
            shortLabel: 'Profit',
            icon: '<path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>'
        },
        'CHAOTIC ATROCITY': {
            color: '#78716c',  // Stone gray - chaotic, opportunistic
            shortLabel: 'Chaotic',
            icon: '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>'
        }
    },
    default: { color: '#94a3b8', shortLabel: 'Unknown', icon: '' }
};

// --- UTILS (Pure Functions) ---
export const Utils = {
    formatNum: (n) => n ? n.toLocaleString() : 'N/A',

    formatDeaths: (min, max) => {
        if (!min && !max) return 'N/A';
        const formatM = (n) => {
            if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
            if (n >= 1000) return (n / 1000).toFixed(0) + 'k';
            return n.toLocaleString();
        };
        if (min === max) return formatM(max);
        return `${formatM(min)}–${formatM(max)}`;
    },

    formatDuration: (start, end) => {
        const years = Math.abs(end - start);
        if (years === 0) return '< 1 year';
        if (years === 1) return '1 year';
        return `${years} years`;
    },

    formatYear: (year, yearEnd = null) => {
        const fmt = (y) => y < 0 ? `${Math.abs(y)} BCE` : y;
        if (yearEnd) return `${fmt(year)} – ${fmt(yearEnd)}`;
        return fmt(year);
    },

    getDriver: (driverName) => DRIVERS[driverName] || DRIVERS['conquest'],

    getTheme: (tierName) => THEME.tiers[tierName] || THEME.default,

    // Logic for filtering
    matches: (event, filters) => {
        const { period, tier, denial } = filters;
        const { start } = event.period;

        if (period === 'ancient' && start >= 500) return false;
        if (period === 'medieval' && (start < 500 || start >= 1500)) return false;
        if (period === 'colonial' && (start < 1500 || start >= 1900)) return false;
        if (period === 'modern' && start < 1900) return false;
        if (tier !== 'all' && event.analysis.tier !== tier) return false;
        if (denial !== 'all' && event.denial_status !== denial) return false;

        return true;
    },

    // Calculate statistics from events
    calcStats: (events) => {
        const years = events.map(e => [e.period.start, e.period.end]).flat();
        const minYear = Math.min(...years);
        const maxYear = Math.max(...years);

        let totalDeathsMin = 0;
        let totalDeathsMax = 0;
        events.forEach(e => {
            totalDeathsMin += e.metrics.mortality.min || 0;
            totalDeathsMax += e.metrics.mortality.max || 0;
        });

        const denied = events.filter(e => e.denial_status === 'denied').length;

        return {
            count: events.length,
            years: maxYear - minYear,
            deathsMin: totalDeathsMin,
            deathsMax: totalDeathsMax,
            denied
        };
    }
};
