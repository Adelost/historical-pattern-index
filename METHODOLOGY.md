# Methodology

This document explains how HPI scores are calculated.

---

## Historical Scope

This index covers events from 146 BCE to present.

**Lower bound (146 BCE)**: The Destruction of Carthage is chosen because:
1. Documentation becomes unreliable before classical antiquity
2. Pre-Roman events lack the mortality estimates our methodology requires
3. The framework assumes state capacity (policy, infrastructure) that ancient societies lacked

**Upper bound (present - 10 years)**: Events need at least a decade of scholarly analysis before inclusion. Death tolls stabilize, archives open, and political dust settles.

This rule is strictly enforced. Ongoing events (e.g., Uyghur persecution, Rohingya crisis, Tigray war) are **not included** regardless of severity, because:
1. Death tolls are unstable and politically contested
2. Including some ongoing events but not others invites accusations of bias
3. The project documents history, not current affairs

These events may be added once the 10-year threshold is reached and scholarly consensus emerges.

Events outside this scope are not excluded for being "less important"—they're excluded because our methodology cannot score them reliably.

---

## Event Selection Criteria

This project prioritizes **overlooked atrocities** over well-known conflicts. Our goal is to shine light on patterns history often ignores.

### We INCLUDE:

| Type | Example | Why |
|------|---------|-----|
| **Forgotten atrocities** | Putumayo, Mfecane | Most people have never heard of them |
| **Profit-driven mass death** | Congo Free State, British India Famines | "Profit kills as much as ideology" |
| **Colonial extraction systems** | Rubber atrocities, slave trade | Systematic but often uncounted |
| **Asymmetric violence** | Genocides, ethnic cleansing | State vs civilian population |
| **Cultural erasure (epistemicide)** | Maya codex burning, Sack of Baghdad | Loss of knowledge/heritage |

### We EXCLUDE:

| Type | Example | Why |
|------|---------|-----|
| **Battlefield combat** | D-Day, Stalingrad, Midway | Army vs army (military history) |
| **Natural disasters** | Black Death, earthquakes | No perpetrator |
| **Ongoing events** | Uyghur, Yemen, Gaza | 10-year rule (see Historical Scope) |
| **Low-documentation events** | Pre-Roman conflicts | Cannot score reliably |

### Battlefield vs Slaughter: The Key Distinction

We measure **atrocities against civilians**, not wars between armies.

| Type | Definition | Example | Included? |
|------|------------|---------|-----------|
| **Battlefield** | Soldier vs soldier | Battle of Somme, Normandy | ❌ No |
| **Slaughter** | System vs civilian | Holocaust, Rwanda | ✅ Yes |
| **Extraction** | Corporation vs labor | Congo, Putumayo | ✅ Yes |

This is why the **Holocaust is included** but **WW2 as a whole is not**:
- WW2 = primarily armies fighting armies (military history)
- Holocaust = state systematically killing civilians (atrocity)

**Exception**: If a conventional war triggers a distinct genocide, that specific atrocity is indexed. Example: The Armenian Genocide occurred during WWI, but we index the genocide—not the war.

### Why We Include Famous Events (Benchmarks)

We intentionally include highly documented events like **The Holocaust**, **The Rwandan Genocide**, and **The Atlantic Slave Trade**.

These serve as **calibration points**:
1. They provide a baseline for our scoring system (what does "100% Ideology" look like?)
2. They allow users to compare mechanisms of famous tragedies against unknown ones
3. They reveal patterns: how the "forgotten" Herero Genocide (1904) served as a prototype for the Holocaust

**We do not censor history. We use the known to illuminate the unknown.**

Without the Holocaust as reference, users cannot understand what Putumayo's "100% Profit Score" means. Without Rwanda, the patterns in Darfur become invisible.

### The "Profit Kills" Thesis

A core finding: profit-driven systems (colonial extraction, resource wars, forced labor) kill as many people as ideological genocides, but receive less attention. We intentionally include events that demonstrate this pattern:

- **Congo Free State** (rubber) — 8-13M deaths
- **Putumayo** (rubber) — 30-100k deaths
- **British India Famines** (export policy) — 12-29M deaths
- **Second Congo War** (minerals) — 3-5M deaths

---

## Core Principle

All scores are derived from **binary checklists**. Each item is either true (1) or false (0), verified against academic sources. No subjective weighting.

```
Score = (items checked / total items) × 100
```

Example: If 8 of 9 systematic intensity items are true, the score is 89%.

### What "100%" Actually Means

Since scores are derived from checklists, a 100% score indicates the presence of all tracked structural elements.

| Score Category | 100% Benchmark | What it indicates |
|----------------|----------------|-------------------|
| **Systematic** | The Holocaust | Maximum state infrastructure: camps, trains, bureaucracy, ID systems |
| **Profit** | Congo Free State | Pure extraction: quotas, forced labor, mutilation for missed targets |
| **Ideology** | Rwanda (1994) | Total purification goal: dehumanization, propaganda, intent to erase |
| **Complicity** | Second Congo War | Total societal enabling: states, militias, and global trade all complicit |

---

## 1. Systematic Intensity (9 items)

Measures organization, state involvement, and infrastructure of violence.

| Item | Question |
|------|----------|
| `policy` | Were there explicit orders, laws, or decrees authorizing violence? |
| `state_involvement` | Were state institutions (military, police, courts) directly involved? |
| `infrastructure` | Was specific infrastructure built (camps, prisons, transport networks)? |
| `propaganda` | Was organized propaganda used to dehumanize victims? |
| `broad_targeting` | Was violence directed at civilians (women, children, elderly)? |
| `cultural_ban` | Was language, religion, or culture legally prohibited? |
| `property_seizure` | Was property or land systematically confiscated? |
| `identification` | Were registry/ID systems used to identify victims? |
| `deliberate_deprivation` | Was starvation, disease, or sterilization used as a weapon? |

**Note**: `deliberate_deprivation` includes famine, disease spread, and forced sterilization—any intentional denial of life necessities.

**Removed criterion**: `duration_over_5y` was removed because it conflates persistence with intensity. The Holocaust (4 years) was more systematically intense per unit time than many decades-long colonial campaigns. Speed of killing often indicates MORE organization, not less—and from a prevention standpoint, rapid genocides are more dangerous because there's less time to intervene.

---

## 2. Profit Score (5 items)

Measures economic incentive as a driver of violence.

| Item | Question |
|------|----------|
| `direct_revenue` | Did the event generate measurable revenue for the state/entity? |
| `resource_extraction` | Was the primary goal raw materials (gold, rubber, land, oil)? |
| `forced_labor` | Was slave or coerced labor utilized? |
| `economic_dependence` | Was the national/corporate economy dependent on this system? |
| `market_integration` | Were goods/resources sold to international consumer markets? |

---

## 3. Ideology Score (5 items)

Measures conviction and "higher purpose" as a driver.

| Item | Question |
|------|----------|
| `purity_ideal` | Was ethnic/religious "cleansing" a stated goal? |
| `historical_claim` | Justified by "ancient rights," "destiny," or historical grievance? |
| `higher_purpose` | Framed as necessary for national survival or salvation? |
| `victim_narrative` | Did perpetrators claim self-defense against victim group? |
| `utopianism` | Was a "golden age" or perfect society promised after cleansing? |

---

## 4. Complicity Score (5 items)

Measures how ordinary society enabled the atrocity.

| Item | Question |
|------|----------|
| `distance` | Geographic/psychological separation between perpetrators and victims? |
| `benefit` | Did the general public benefit economically (prices, taxes, land)? |
| `euphemisms` | Was sanitizing language used ("relocation" vs "death march")? |
| `diffused_responsibility` | Was the chain of command fragmented across institutions? |
| `silence` | Was dissent punished or socially ostracized? |

---

## 5. Denial Status

Added field tracking how successor states acknowledge (or don't) the event.

| Status | Meaning |
|--------|---------|
| `acknowledged` | Perpetrator state/successor officially recognizes the event |
| `partial` | Some recognition but incomplete or contested |
| `disputed` | Facts actively contested (death tolls, intent) |
| `denied` | Officially rejected by successor state |
| `suppressed` | Censored domestically, not publicly discussed |

---

## Tier Classification

Events are classified into tiers based on their score profile:

| Tier | Name | Characteristics |
|------|------|-----------------|
| I | **Total Erasure** | High intensity, low absolute volume (small populations wiped out) |
| II | **Industrial Mega-Event** | High intensity, high volume (organized mass killing) |
| III | **Continental Collapse** | Maximum volume, mixed intensity (colonial devastation) |
| IV | **Profit-Driven Attrition** | High volume, maximum profit score (extraction systems) |
| — | **Chaotic Atrocity** | High death toll but low systematic organization |

---

## Known Limitations

1. **Equal weighting**: All items count equally. "Infrastructure for killing" probably matters more than "propaganda," but we lack objective criteria for differential weighting.

2. **Biological warfare ambiguity**: Broad interpretation (includes famine) may overclaim. Narrow interpretation (pathogens only) undercounts.

3. **Ideology clustering**: Most events score 60-100% on ideology because perpetrators almost always claim "higher purpose." The scale doesn't differentiate well at the high end.

4. **Source language bias**: English-language academic sources are overrepresented.

---

## Data Schema

See [`/data/schema.json`](data/schema.json) for the full JSON schema specification.

Minimal example:

```json
{
  "id": "example_event_1900",
  "name": "Example Event",
  "status": "historic",
  "period": { "start": 1900, "end": 1905 },
  "metrics": {
    "mortality": {
      "min": 10000,
      "max": 50000,
      "population_initial": 100000,
      "population_loss_percent": 30.0,
      "confidence": "medium"
    },
    "scores": {
      "systematic_intensity": 70,
      "profit": 40,
      "ideology": 80,
      "complicity": 60
    },
    "breakdowns": {
      "systematic_intensity": {
        "policy": true,
        "state_involvement": true,
        "infrastructure": true,
        "propaganda": true,
        "broad_targeting": true,
        "cultural_ban": false,
        "property_seizure": true,
        "identification": false,
        "deliberate_deprivation": false
      },
      "profit": { ... },
      "ideology": { ... },
      "complicity": { ... }
    }
  },
  "denial_status": "acknowledged",
  "sources": [
    { "author": "Historian Name", "title": "Book Title", "year": 2020 }
  ]
}
```
