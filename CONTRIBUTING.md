# Contributing to Historical Pattern Index (HPI)

Thank you for your interest in contributing to HPI. This is a data-driven project aimed at identifying historical patterns of atrocity for prevention.

## Core Principles

1.  **No Opinions:** We do not accept moral judgments or emotional narratives. Every data point must be backed by a source.
2.  **Data Over Narrative:** We focus on measurable mechanics (e.g., "Was language banned?") rather than descriptions of suffering.
3.  **Transparency:** All sources must be cited.

## How to Add an Event

1.  **Fork the Repository.**
2.  **Copy the Template:** Copy `data/events/_template.json` to a new file named `event_name_year.json`.
3.  **Fill in the Data:**
    *   **Scores must match Breakdowns:** If you check 7 boxes in `breakdowns.systematic_intensity`, your score MUST be 70.
    *   **Use Range Estimates:** Always provide `min` and `max` for mortality if uncertain.
4.  **Validate:** Ensure your JSON matches `data/schema.json`.
5.  **Submit a Pull Request.**

## Review Process

Pull requests will be reviewed for:
*   **Source Verification:** Does the source support the data?
*   **Methodological Consistency:** Do the scores mathematically match the checklist?
*   **JSON Validity:** Does it pass the automated tests?