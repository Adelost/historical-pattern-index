# Contributing to Historical Pattern Index (HPI)

Thank you for your interest in contributing to HPI. This is a data-driven project aimed at identifying historical patterns of atrocity for prevention.

## Core Principles

1.  **No Opinions:** We do not accept moral judgments or emotional narratives. Every data point must be backed by a source.
2.  **Data Over Narrative:** We focus on measurable mechanics (e.g., "Was language banned?") rather than descriptions of suffering.
3.  **Transparency:** All sources must be cited.

## How to Add an Event

1.  **Fork the Repository.**
2.  **Create a JSON file** in `data/events/` following the naming convention `event_name_year.json` (e.g., `congo_free_state_1885.json`).
3.  **Use the Schema:** Ensure your JSON matches `data/schema.json`.
4.  **Fill in Metrics:**
    *   Use the checklists in `docs/methodology.md` to calculate scores.
    *   Provide `min` and `max` estimates for mortality.
5.  **Cite Sources:** Include author, title, and year for your data.
6.  **Submit a Pull Request.**

## Review Process

Pull requests will be reviewed for:
*   **Source Verification:** Does the source support the data?
*   **Methodological Consistency:** Were the scores calculated correctly according to the checklist?
*   **JSON Validity:** Does it pass the schema check?
