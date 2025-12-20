# Contributing to Historical Pattern Index (HPI)

HPI is a data-driven project identifying historical patterns of atrocity for prevention.

## Core Principles

1.  **No Opinions:** We do not accept moral judgments or emotional narratives. Every data point must be backed by a source.
2.  **Data Over Narrative:** We focus on measurable mechanics (e.g., "Was language banned?") rather than descriptions of suffering.
3.  **Transparency:** All sources must be cited.

## Scope & Data Stability (The "10-Year Guideline")

To maintain scientific integrity, HPI prioritizes **data stability** over speed.

*   **Historical Consensus:** We prioritize events where the "fog of war" has lifted and academic consensus has formed.
*   **Ongoing/Recent Conflicts:** We exercise extreme caution with events occurring within the last **10 years**.
    *   If mortality estimates fluctuate wildly (e.g., in active war zones), the HPI score cannot be reliably calculated.
    *   If factual claims (checklist items) are currently subject to active litigation (e.g., pending ICJ rulings) or intense information warfare, the event will likely be **rejected or marked as 'disputed'** until independent verification is available.
    *   **We do not use "Breaking News" as sources.** Only reports from established international bodies (UN, Human Rights Watch, Amnesty) or peer-reviewed academic studies are accepted for recent events.

## How to Add an Event

1.  **Fork the Repository.**
2.  **Copy the Template:** Copy `data/events/_template.json` to a new file named `event_name_year.json`.
3.  **Fill in the Data:**
    *   **Scores must match Breakdowns:** If you check 7 boxes in `breakdowns.systematic_intensity`, your score MUST be 70.
    *   **Use Range Estimates:** Always provide `min` and `max` for mortality if uncertain.
4.  **Validate:** Check that your JSON matches `data/schema.json`.
5.  **Submit a Pull Request.**

## Review Process

Pull requests will be reviewed for:
*   **Source Verification:** Does the source support the data?
*   **Methodological Consistency:** Do the scores mathematically match the checklist?
*   **JSON Validity:** Does it pass the automated tests?
