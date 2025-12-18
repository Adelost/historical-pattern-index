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

## Core Principle

All scores are derived from **binary checklists**. Each item is either true (1) or false (0), verified against academic sources. No subjective weighting.

```
Score = (items checked / total items) × 100
```

Example: If 8 of 9 systematic intensity items are true, the score is 89%.

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
| `biological_warfare` | Was starvation, disease, or sterilization used as a weapon? |

**Note**: `biological_warfare` is interpreted broadly to include deliberate famine and disease spread, not just laboratory pathogens.

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
        "biological_warfare": false,
        "duration_over_5y": false
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
