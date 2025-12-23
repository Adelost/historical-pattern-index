/**
 * HPI Domain - Theme configuration
 * Tier colors, driver colors, and related metadata
 */

// Tier colors (Catppuccin Mocha)
// Spectrum: warm (intentional) → cool (chaotic)
export const TIERS = {
  'TOTAL ERASURE': {
    color: '#f38ba8',  // red
    variant: 'danger',
    shortLabel: 'Extermination',
    description: 'Deliberate elimination of entire peoples'
  },
  'INDUSTRIAL MEGA-EVENT': {
    color: '#fab387',  // peach
    variant: 'peach',
    shortLabel: 'Bureaucratic',
    description: 'State infrastructure for mass killing'
  },
  'PROFIT-DRIVEN ATTRITION': {
    color: '#f9e2af',  // yellow
    variant: 'warning',
    shortLabel: 'Exploitation',
    description: 'Death through economic exploitation'
  },
  'CONTINENTAL COLLAPSE': {
    color: '#74c7ec',  // sapphire
    variant: 'sapphire',
    shortLabel: 'Conquest',
    description: 'Conquest and civilizational destruction'
  },
  'CHAOTIC ATROCITY': {
    color: '#b4befe',  // lavender
    variant: 'lavender',
    shortLabel: 'Violence',
    description: 'Opportunistic mass violence'
  }
};

export const DEFAULT_TIER = {
  color: '#a6adc8',
  variant: 'muted',
  shortLabel: 'Unknown',
  description: ''
};

// Driver colors for Knowledge Lost/Saved
export const DRIVERS = {
  'religious_ideology': {
    label: 'Religious',
    color: '#f38ba8',  // red
    variant: 'danger'
  },
  'conquest': {
    label: 'Conquest',
    color: '#6c7086',  // overlay0
    variant: 'muted'
  },
  'ethnic_ideology': {
    label: 'Ethnic',
    color: '#cba6f7',  // mauve
    variant: 'mauve'
  },
  'political_ideology': {
    label: 'Political',
    color: '#fab387',  // peach
    variant: 'peach'
  },
  'economic_exploitation': {
    label: 'Economic',
    color: '#a6e3a1',  // green
    variant: 'success'
  }
};

export const DEFAULT_DRIVER = {
  label: 'Unknown',
  color: '#6c7086',
  variant: 'muted'
};

// Score types and their colors
export const SCORE_TYPES = {
  systematic_intensity: {
    key: 'systematic_intensity',
    label: 'Systematic',
    color: '#f38ba8',  // red
    type: 'systematic',
    description: 'Organization, infrastructure, state involvement. How planned was it?'
  },
  profit: {
    key: 'profit',
    label: 'Profit',
    color: '#cba6f7',  // mauve
    type: 'profit',
    description: 'Economic extraction as driver. Was wealth the goal?'
  },
  ideology: {
    key: 'ideology',
    label: 'Ideology',
    color: '#89b4fa',  // blue
    type: 'ideology',
    description: 'Ethnic/religious "purification" as goal. Was purity the vision?'
  },
  complicity: {
    key: 'complicity',
    label: 'Complicity',
    color: '#a6e3a1',  // green
    type: 'complicity',
    description: 'How society enabled it. Did ordinary people benefit or look away?'
  }
};

// Checklist item explanations
export const CHECKLIST_ITEMS = {
  // Systematic Intensity
  policy: 'Were there explicit orders, laws, or decrees authorizing violence?',
  state_involvement: 'Were state institutions (military, police, courts) directly involved?',
  infrastructure: 'Was specific infrastructure built (camps, prisons, transport networks)?',
  propaganda: 'Was organized propaganda used to dehumanize victims?',
  generational_targeting: 'Were children or reproduction specifically targeted?',
  cultural_ban: 'Was language, religion, or culture legally prohibited?',
  property_seizure: 'Was property or land systematically confiscated?',
  identification: 'Were registry/ID systems used to identify victims?',
  deliberate_deprivation: 'Was starvation, disease, or sterilization used as a weapon?',
  // Profit
  direct_revenue: 'Did the event generate measurable revenue for the state/entity?',
  resource_extraction: 'Was the primary goal raw materials (gold, rubber, land, oil)?',
  forced_labor: 'Was slave or coerced labor used?',
  economic_dependence: 'Was the national/corporate economy dependent on this system?',
  market_integration: 'Were goods/resources sold to international markets?',
  // Ideology
  purity_ideal: 'Was ethnic/religious/political "cleansing" a stated goal?',
  dehumanization: 'Were victims labeled as subhuman ("rats," "cockroaches," "vermin")?',
  mass_mobilization: 'Were civilians actively recruited to participate in killing?',
  existential_threat: 'Did perpetrators claim existential self-defense?',
  utopianism: 'Was a "golden age" or purified society promised after elimination?',
  // Complicity
  distance: 'Geographic/psychological separation between perpetrators and victims?',
  benefit: 'Did the general public benefit economically?',
  euphemisms: 'Was sanitizing language used (e.g. relocation instead of death march)?',
  diffused_responsibility: 'Was the chain of command fragmented across institutions?',
  silence: 'Was dissent punished or socially ostracized?'
};

// Breakdown key labels
export const BREAKDOWN_LABELS = {
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

// === Helper Functions ===

export function getTier(tierName) {
  return TIERS[tierName] || DEFAULT_TIER;
}

export function getDriver(driverName) {
  return DRIVERS[driverName] || DEFAULT_DRIVER;
}

export function getScoreType(key) {
  return SCORE_TYPES[key] || null;
}

export function getBreakdownLabel(key) {
  return BREAKDOWN_LABELS[key] || key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export function getChecklistTooltip(key) {
  return CHECKLIST_ITEMS[key] || null;
}

// Filter tier options for UI
export function getTierOptions() {
  return [
    { value: 'all', label: 'All', variant: null },
    ...Object.entries(TIERS).map(([key, tier]) => ({
      value: key,
      label: tier.shortLabel,
      variant: tier.variant
    }))
  ];
}

// Filter driver options for UI
export function getDriverOptions() {
  return [
    { value: 'all', label: 'All', variant: null },
    ...Object.entries(DRIVERS).map(([key, driver]) => ({
      value: key,
      label: driver.label,
      variant: driver.variant
    }))
  ];
}
