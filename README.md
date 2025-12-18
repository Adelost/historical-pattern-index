# Historical Pattern Index (HPI)

> "History without opinions. Just data."

**The Historical Pattern Index (HPI)** is an open-source framework designed to quantify and identify recurring patterns in historical atrocities. By moving away from emotional narratives and towards measurable data, HPI aims to make history scientifically comparable for the sole purpose of prevention.

## 🎯 The Mission

Traditional history often focuses on the "winners" or the most visible tragedies. This creates a bias where small-scale total erasures are forgotten, and profit-driven destruction is minimized compared to ideological violence.

**HPI changes this by using:**
1.  **Logarithmic Scales:** To ensure that the total extermination of a small population (e.g., Tasmania) is visualized with the same gravity as a continental collapse (e.g., The Americas).
2.  **Systemic Intensity Metrics:** Measuring the *mechanics* of destruction (bureaucracy, infrastructure, policy) rather than just the body count.
3.  **Driver Analysis:** Distinguishing between **Ideological Hatred** and **Profit-Driven Indifference** to identify modern risk profiles in supply chains and policy.

---

## 📊 The Tier System

HPI classifies historical events based on their data profile, not a moral ranking.

```text
       HIGH (100%)
      ^
      |    [TIER 1: TOTAL ERASURE]           [TIER 2: MEGA-EVENT]
I     |    (Tasmania, Herero)                (Holocaust, Cambodia)
N     |          * *
T     |
E     |
N     |
S     |
I     |    [TIER ?? : FAILED/CHAOTIC]        [TIER 3 & 4: PROFIT/COLLAPSE]
T     |    (Pogroms, Riots)                  (Congo, Spanish Americas)
Y     |          .                                 *
      |
      +-------------------------------------------------------->
      LOW              VOLUME (Logarithmic Scale)           HIGH
      (1k)             (100k)            (10M)             (100M)
```

| Tier | Profile Name | Characteristics | Historic Examples |
| :--- | :--- | :--- | :--- |
| **I** | **TOTAL ERASURE** | Low Absolute Volume • Max Intensity (100%) | Tasmania, Herero/Nama |
| **II** | **INDUSTRIAL MEGA-EVENT** | High Volume • Max Intensity (100%) | The Holocaust, Cambodia (Khmer Rouge) |
| **III** | **CONTINENTAL COLLAPSE** | Max Volume • Mixed Intensity | Spanish Americas, Mongol Conquests |
| **IV** | **PROFIT-DRIVEN ATTRITION** | High Volume • Max Profit Score | Congo Free State, Trans-Atlantic Slave Trade |

---

## 📐 Methodology & Scoring

HPI calculates scores based on **Binary Checklists**. For an event to receive a score, indicators must be verified by academic sources (Yes=1, No=0). Scores are expressed as percentages (0-100%).

### 1. Systematic Intensity Score (Y-Axis)
*Measures the level of intent, organization, and state involvement.*

* [ ] **Policy:** Were there explicit orders, laws, or decrees authorizing violence?
* [ ] **State Involvement:** Were state institutions (military, police, courts) directly involved?
* [ ] **Infrastructure:** Was specific infrastructure built (camps, prisons, transport)?
* [ ] **Propaganda:** Was organized propaganda used to dehumanize victims?
* [ ] **Broad Targeting:** Was violence directed at civilians (women, children, elderly)?
* [ ] **Cultural Ban:** Was language, religion, or culture legally prohibited?
* [ ] **Property Seizure:** Was property or land systematically confiscated?
* [ ] **Identification:** Were registry/ID systems used to identify victims?
* [ ] **Biological Warfare:** Was starvation, disease, or sterilization used as a weapon?
* [ ] **Duration:** Did the system persist continuously for >5 years?

### 2. Profit Score (Driver A)
*Measures the economic incentive behind the atrocity.*

* [ ] **Direct Revenue:** Did the event generate measurable revenue for the state/entity?
* [ ] **Resource Extraction:** Was the primary goal raw materials (gold, rubber, land)?
* [ ] **Forced Labor:** Was slave or coerced labor utilized?
* [ ] **Economic Dependence:** Was the national/corporate economy dependent on this system?
* [ ] **Market Integration:** Were goods/resources sold to consumer markets?

### 3. Ideology Score (Driver B)
*Measures the conviction and "higher purpose".*

* [ ] **Purity Ideal:** Was ethnic/religious cleansing a stated goal?
* [ ] **Historical Claim:** Justified by "ancient rights" or "destiny"?
* [ ] **Higher Purpose:** Framed as necessary for national survival/salvation?
* [ ] **Victim Narrative:** Did perpetrators claim self-defense?
* [ ] **Utopianism:** Was a "golden age" promised post-cleansing?

### 4. Complicity Score (Enabler)
*Measures how ordinary society enabled the event.*

* [ ] **Distance:** Geographic separation between perpetrators/beneficiaries and victims?
* [ ] **Benefit:** Did the general public benefit economically (prices, taxes, land)?
* [ ] **Euphemisms:** Was sanitizing language used (e.g., "relocation" vs "death march")?
* [ ] **Diffused Responsibility:** Was the chain of command fragmented?
* [ ] **Silence:** Was dissent or criticism punished/socially ostracized?

---

## 💾 Data Structure

All events are stored as JSON files in `/data/events/`. We use range estimates (`min`/`max`) to account for historical uncertainty.

```json
{
  "id": "event_id",
  "name": "Event Name",
  "period": { "start": 1800, "end": 1805 },
  "metrics": {
    "mortality": {
      "min": 5000,
      "max": 8000,
      "population_loss_percent": 99.0,
      "confidence": "high"
    },
    "scores": {
      "systematic_intensity": 90,
      "profit": 100,
      "ideology": 40,
      "complicity": 80
    }
  },
  "tags": ["colonialism", "total_erasure"],
  "sources": [
    { "author": "Author Name", "title": "Book Title", "year": 2020 }
  ]
}
```

## 🤝 Contributing
This is a data project, not a forum for political debate.

* **No Opinions:** All data points must be backed by at least one reputable academic or primary source.
* **Show the Range:** Do not use single numbers for death tolls if there is academic disagreement. Use the min and max fields.
* **Pull Requests:** Submit new events via PR using the JSON template.
* **License:** MIT
