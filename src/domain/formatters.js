/**
 * HPI Domain - Formatting functions
 * Pure functions for formatting event data
 */

/**
 * Format a number with locale-aware separators
 */
export function formatNum(n) {
  return n ? n.toLocaleString() : 'N/A';
}

/**
 * Format death toll range (e.g., "1.2M–1.5M" or "500k")
 */
export function formatDeaths(min, max) {
  if (!min && !max) return 'N/A';

  const formatM = (n) => {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(0) + 'k';
    return n.toLocaleString();
  };

  if (min === max || !min) return formatM(max);
  if (!max) return formatM(min);
  return `${formatM(min)}–${formatM(max)}`;
}

/**
 * Format duration in years
 */
export function formatDuration(start, end) {
  const years = Math.abs(end - start);
  if (years === 0) return '< 1 year';
  if (years === 1) return '1 year';
  return `${years} years`;
}

/**
 * Format year (handles BCE dates)
 */
export function formatYear(year, yearEnd = null) {
  const fmt = (y) => y < 0 ? `${Math.abs(y)} BCE` : String(y);
  if (yearEnd && yearEnd !== year) {
    return `${fmt(year)}–${fmt(yearEnd)}`;
  }
  return fmt(year);
}

/**
 * Get short name for timeline labels
 * Uses event.short_name if available, otherwise first word
 */
export function getShortName(event, maxLen = 12) {
  if (event.short_name) return event.short_name;

  // Fallback: first significant word
  const words = event.name.split(' ');
  const skipWords = ['The', 'A', 'An'];
  const firstWord = skipWords.includes(words[0]) && words.length > 1 ? words[1] : words[0];
  return firstWord.length > maxLen ? firstWord.substring(0, maxLen - 1) + '…' : firstWord;
}

/**
 * Calculate index score (average of all scores)
 */
export function calcIndex(event) {
  const s = event.metrics?.scores;
  if (!s) return 0;
  const sum = (s.systematic_intensity || 0) + (s.profit || 0) + (s.ideology || 0) + (s.complicity || 0);
  return Math.round(sum / 4);
}

/**
 * Format index as percentage string
 */
export function formatIndex(event) {
  return `${calcIndex(event)}%`;
}

/**
 * Calculate statistics from events array
 */
export function calcStats(events) {
  if (!events || events.length === 0) {
    return { count: 0, years: 0, deathsMin: 0, deathsMax: 0, denied: 0 };
  }

  const years = events.flatMap(e => [e.period.start, e.period.end]);
  const minYear = Math.min(...years);
  const maxYear = Math.max(...years);

  let totalDeathsMin = 0;
  let totalDeathsMax = 0;
  events.forEach(e => {
    totalDeathsMin += e.metrics?.mortality?.min || 0;
    totalDeathsMax += e.metrics?.mortality?.max || 0;
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

/**
 * Format period string from event
 */
export function formatPeriod(event) {
  return formatYear(event.period.start, event.period.end);
}

/**
 * Format deaths from event
 */
export function formatEventDeaths(event) {
  const m = event.metrics?.mortality;
  if (!m) return 'N/A';
  return formatDeaths(m.min, m.max);
}

/**
 * Get region from event (first part before comma)
 */
export function getRegion(event) {
  const region = event.geography?.region || '';
  return region.split(',')[0].trim();
}

/**
 * Escape HTML for safe rendering
 */
export function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
