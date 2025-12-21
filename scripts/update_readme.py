#!/usr/bin/env python3
"""
Updates README.md, KNOWLEDGE_LOST.md, and KNOWLEDGE_SAVED.md with statistics.

Usage: python scripts/update_readme.py

Markers in markdown files:
  <!-- STATS:key -->...<!-- /STATS:key -->

Replaces content between markers with generated statistics.
"""

import json
import glob
import re
from pathlib import Path

ROOT = Path(__file__).parent.parent
DATA_DIR = ROOT / "data" / "events"
README_PATH = ROOT / "README.md"
KNOWLEDGE_LOST_PATH = ROOT / "KNOWLEDGE_LOST.md"
KNOWLEDGE_SAVED_PATH = ROOT / "KNOWLEDGE_SAVED.md"
KNOWLEDGE_LOST_JSON = ROOT / "data" / "knowledge_lost.json"
KNOWLEDGE_SAVED_JSON = ROOT / "data" / "knowledge_saved.json"


def load_events():
    """Load all event JSON files."""
    events = []
    for filepath in sorted(DATA_DIR.glob("*.json")):
        if "template" in filepath.name:
            continue
        with open(filepath, encoding="utf-8") as f:
            events.append(json.load(f))
    return events


def calc_stats(events):
    """Calculate statistics from events."""
    total_deaths_min = 0
    total_deaths_max = 0
    year_min = 9999
    year_max = 0

    by_tier = {}
    by_region = {}
    by_denial = {"denied": [], "partial": [], "acknowledged": [], "disputed": [], "suppressed": []}

    for e in events:
        # Deaths
        mortality = e.get("metrics", {}).get("mortality", {})
        total_deaths_min += mortality.get("min", 0)
        total_deaths_max += mortality.get("max", 0)

        # Years
        period = e.get("period", {})
        year_min = min(year_min, period.get("start", 9999))
        year_max = max(year_max, period.get("end", 0))

        # Tier
        tier = e.get("analysis", {}).get("tier", "Unknown")
        by_tier[tier] = by_tier.get(tier, 0) + 1

        # Region
        region = e.get("geography", {}).get("region", "Unknown").split("/")[0].split("(")[0].strip()
        by_region[region] = by_region.get(region, 0) + 1

        # Denial status
        denial = e.get("denial_status", "unknown")
        if denial in by_denial:
            by_denial[denial].append(e)

    return {
        "count": len(events),
        "deaths_min": total_deaths_min,
        "deaths_max": total_deaths_max,
        "year_min": year_min,
        "year_max": year_max,
        "year_span": year_max - year_min,
        "by_tier": by_tier,
        "by_region": by_region,
        "by_denial": by_denial,
    }


def format_millions(n):
    """Format large numbers as millions."""
    if n >= 1_000_000:
        return f"{n / 1_000_000:.0f}M"
    elif n >= 1_000:
        return f"{n / 1_000:.0f}k"
    return str(n)


def format_deaths(min_d, max_d):
    """Format death range."""
    if min_d == 0 and max_d == 0:
        return "N/A*"
    return f"{format_millions(min_d)}-{format_millions(max_d)}"


def format_year(year):
    """Format year with BCE/CE suffix."""
    if year < 0:
        return f"{abs(year)} BCE"
    return str(year)


def generate_summary(events, stats):
    """Generate summary line."""
    year_start = format_year(stats['year_min'])
    return f"{stats['count']} events. {stats['year_span']:,} years of history ({year_start}–present). {format_millions(stats['deaths_min'])}-{format_millions(stats['deaths_max'])} documented deaths."


def get_primary_driver(event):
    """Determine primary driver (Profit vs Ideology) from scores."""
    scores = event.get("metrics", {}).get("scores", {})
    profit = scores.get("profit", 0)
    ideology = scores.get("ideology", 0)

    if profit > ideology:
        return "Profit"
    elif ideology > profit:
        return "Ideology"
    else:
        # If equal, look at which is non-zero, or default to Mixed
        if profit > 0 or ideology > 0:
            return "Mixed"
        return "—"


def generate_events_table(events):
    """Generate main events table."""
    # Sort chronologically (by start year) to show historical patterns
    sorted_events = sorted(events, key=lambda e: e.get("period", {}).get("start", 0))

    lines = ["| Event | Period | Deaths | Driver | Systematic | Denied? |", "|-------|--------|--------|--------|------------|---------|"]

    for e in sorted_events:
        name = e.get("name", "Unknown")
        period = e.get("period", {})
        period_str = f"{period.get('start', '?')}-{period.get('end', '?')}"

        mortality = e.get("metrics", {}).get("mortality", {})
        deaths = format_deaths(mortality.get("min", 0), mortality.get("max", 0))

        driver = get_primary_driver(e)

        # Get systematic intensity score as percentage
        scores = e.get("metrics", {}).get("scores", {})
        systematic = scores.get("systematic_intensity", 0)
        systematic_str = f"{systematic}%"

        denial = e.get("denial_status", "unknown")
        denial_str = {
            "denied": "**Denied**",
            "partial": "Partial",
            "acknowledged": "No",
            "disputed": "Disputed",
            "suppressed": "Suppressed"
        }.get(denial, denial)

        lines.append(f"| {name} | {period_str} | {deaths} | {driver} | {systematic_str} | {denial_str} |")

    return "\n".join(lines)


def generate_denied_table(stats):
    """Generate denied events table."""
    denied_events = stats["by_denial"].get("denied", [])
    if not denied_events:
        return "No currently denied events."

    lines = ["| Event | Denier | Deaths |", "|-------|--------|--------|"]

    for e in sorted(denied_events, key=lambda x: -x.get("metrics", {}).get("mortality", {}).get("max", 0)):
        name = e.get("name", "Unknown")
        perpetrators = e.get("participants", {}).get("perpetrators", ["Unknown"])
        denier = perpetrators[0] if perpetrators else "Unknown"
        # Simplify denier name
        denier = denier.replace("Ottoman Empire", "Turkey").replace("Soviet Union", "Russia")

        mortality = e.get("metrics", {}).get("mortality", {})
        deaths = format_deaths(mortality.get("min", 0), mortality.get("max", 0))

        lines.append(f"| {name} | {denier} | {deaths} |")

    return "\n".join(lines)


def generate_tier_breakdown(stats):
    """Generate tier breakdown."""
    lines = []
    for tier, count in sorted(stats["by_tier"].items(), key=lambda x: -x[1]):
        lines.append(f"- **{tier}**: {count} events")
    return "\n".join(lines)


def generate_patterns_table(events):
    """Generate recurring warning signs patterns table from pattern_tags."""
    # Map pattern tags to human-readable labels
    PATTERN_LABELS = {
        "DEHUMANIZATION": "Dehumanizing rhetoric",
        "SCAPEGOATING": "Minorities scapegoated",
        "ETHNIC_NATIONALISM": "Nationalist/ethnic purity ideology",
        "MILITIA_VIOLENCE": "Militias and death squads",
        "EMERGENCY_LAWS": "Emergency laws/state of exception",
        "MEDIA_INCITEMENT": "Media incitement",
        "ECONOMIC_CRISIS": "Economic crisis exploited",
        "PROPERTY_SEIZURE": "Property seizures",
        "FORCED_DISPLACEMENT": "Forced displacement/deportation",
        "INTERNATIONAL_INACTION": "International inaction",
        "COLONIAL_JUSTIFICATION": "Colonial 'civilizing' justification",
        "DELIBERATE_STARVATION": "Deliberate starvation"
    }

    total_events = len(events)
    tag_counts = {tag: 0 for tag in PATTERN_LABELS}

    for event in events:
        pattern_tags = event.get("analysis", {}).get("pattern_tags", [])
        for tag in pattern_tags:
            if tag in tag_counts:
                tag_counts[tag] += 1

    # Sort by frequency
    sorted_tags = sorted(tag_counts.items(), key=lambda x: -x[1])

    lines = ["| Warning Sign Pattern | Frequency |", "|---------------------|-----------|"]

    for tag, count in sorted_tags:
        if count == 0:
            continue
        pct = round(count / total_events * 100)
        label = PATTERN_LABELS.get(tag, tag)
        lines.append(f"| {label} | {pct}% ({count}/{total_events}) |")

    return "\n".join(lines)


def update_markdown(content, generators):
    """Update markdown content with generated statistics."""
    for key, generator in generators.items():
        pattern = rf"(<!-- STATS:{key} -->).*?(<!-- /STATS:{key} -->)"
        generated = generator()

        def make_replacement(match, gen=generated):
            # Inline stats (single values) don't need newlines
            if "\n" not in gen:
                return f"{match.group(1)}{gen}{match.group(2)}"
            else:
                return f"{match.group(1)}\n{gen}\n{match.group(2)}"

        content = re.sub(pattern, make_replacement, content, flags=re.DOTALL)

    return content


def update_readme(content, events, stats):
    """Update README content with generated statistics."""
    generators = {
        "SUMMARY": lambda: generate_summary(events, stats),
        "EVENTS_TABLE": lambda: generate_events_table(events),
        "DENIED_TABLE": lambda: generate_denied_table(stats),
        "DENIED_COUNT": lambda: str(len(stats["by_denial"].get("denied", []))),
        "EVENT_COUNT": lambda: str(stats["count"]),
        "TIER_BREAKDOWN": lambda: generate_tier_breakdown(stats),
        "PATTERNS_TABLE": lambda: generate_patterns_table(events),
    }
    return update_markdown(content, generators)


# =============================================================================
# Knowledge files support
# =============================================================================

def load_knowledge_lost():
    """Load knowledge_lost.json."""
    if not KNOWLEDGE_LOST_JSON.exists():
        return []
    with open(KNOWLEDGE_LOST_JSON, encoding="utf-8") as f:
        return json.load(f)


def load_knowledge_saved():
    """Load knowledge_saved.json."""
    if not KNOWLEDGE_SAVED_JSON.exists():
        return []
    with open(KNOWLEDGE_SAVED_JSON, encoding="utf-8") as f:
        return json.load(f)


def get_event_name(event_id, events):
    """Look up event name from event ID."""
    for e in events:
        if e.get("id") == event_id:
            return e.get("name", event_id)
    return event_id


def format_knowledge_year(entry):
    """Format year or year range for knowledge entry."""
    year = entry.get("year", 0)
    year_end = entry.get("year_end")

    if year < 0:
        year_str = f"{abs(year)} BCE"
    else:
        year_str = str(year)

    if year_end and year_end != year:
        return f"{year_str}-{year_end}"
    return year_str


# Driver labels for genocide parallels
DRIVER_PARALLELS = {
    "religious_ideology": "Religious purification genocides",
    "ethnic_ideology": "Ethnic cleansing",
    "political_ideology": "Ideological purges",
    "conquest": "Territorial conquest atrocities",
    "economic_exploitation": "Profit-driven atrocities",
}


def generate_lost_driver_table(lost_entries):
    """Generate driver count table for KNOWLEDGE_LOST.md."""
    driver_counts = {}
    for entry in lost_entries:
        driver = entry.get("driver", "unknown")
        driver_counts[driver] = driver_counts.get(driver, 0) + 1

    # Sort by count descending
    sorted_drivers = sorted(driver_counts.items(), key=lambda x: -x[1])

    lines = ["| Driver | Count | Genocide parallel |", "|--------|-------|-------------------|"]
    for driver, count in sorted_drivers:
        parallel = DRIVER_PARALLELS.get(driver, driver)
        lines.append(f"| {driver} | {count} | {parallel} |")

    return "\n".join(lines)


def generate_lost_data_table(lost_entries):
    """Generate main data table for KNOWLEDGE_LOST.md."""
    # Sort by year
    sorted_entries = sorted(lost_entries, key=lambda x: x.get("year", 0))

    lines = ["| Event | Year | Driver | What was lost | Quantity |",
             "|-------|------|--------|---------------|----------|"]

    for entry in sorted_entries:
        name = entry.get("name", "Unknown")
        year = format_knowledge_year(entry)
        driver = entry.get("driver", "unknown")
        what_lost = entry.get("what_lost", "")
        quantity = entry.get("quantity", "")
        lines.append(f"| {name} | {year} | {driver} | {what_lost} | {quantity} |")

    return "\n".join(lines)


def generate_lost_connection_table(lost_entries, events):
    """Generate connection to main index table for KNOWLEDGE_LOST.md."""
    lines = ["| Knowledge lost | Connected genocide |",
             "|----------------|-------------------|"]

    for entry in lost_entries:
        connected = entry.get("connected_event")
        if connected:
            name = entry.get("name", "Unknown")
            event_name = get_event_name(connected, events)
            # Clean up event name (remove dates, parentheses)
            event_name = re.sub(r'\s*\([^)]*\)', '', event_name)
            event_name = re.sub(r'\s*\d{4}.*', '', event_name)
            lines.append(f"| {name} | {event_name} |")

    return "\n".join(lines)


def generate_lost_sources(lost_entries):
    """Generate sources section for KNOWLEDGE_LOST.md."""
    lines = []

    for entry in sorted(lost_entries, key=lambda x: x.get("year", 0)):
        sources = entry.get("sources", [])
        if sources:
            name = entry.get("name", "Unknown")
            sources_str = "; ".join(sources)
            lines.append(f"- **{name}**: {sources_str}")

    return "\n".join(lines) if lines else "No sources available."


def generate_saved_sources(saved_entries):
    """Generate sources section for KNOWLEDGE_SAVED.md."""
    lines = []

    for entry in sorted(saved_entries, key=lambda x: x.get("year", 0)):
        sources = entry.get("sources", [])
        if sources:
            name = entry.get("name", "Unknown")
            sources_str = "; ".join(sources)
            lines.append(f"- **{name}**: {sources_str}")

    return "\n".join(lines) if lines else "No sources available."


def generate_saved_driver_summary(lost_entries, saved_entries):
    """Generate driver summary table for KNOWLEDGE_SAVED.md (cross-reference)."""
    # Group entries by driver
    drivers = {}

    for entry in lost_entries:
        driver = entry.get("driver", "unknown")
        if driver not in drivers:
            drivers[driver] = {"lost": [], "rescued": [], "recovered": []}
        drivers[driver]["lost"].append(entry.get("name", "Unknown"))

    for entry in saved_entries:
        driver = entry.get("driver", "unknown")
        if driver not in drivers:
            drivers[driver] = {"lost": [], "rescued": [], "recovered": []}

        saved_by = entry.get("saved_by", "")
        if saved_by == "hidden_and_recovered":
            drivers[driver]["recovered"].append(entry.get("name", "Unknown"))
        else:
            drivers[driver]["rescued"].append(entry.get("name", "Unknown"))

    lines = ["| Driver | Lost | Rescued | Recovered |",
             "|--------|------|---------|-----------|"]

    # Sort by total entries
    for driver in ["religious_ideology", "ethnic_ideology", "political_ideology", "conquest", "economic_exploitation"]:
        if driver not in drivers:
            continue
        d = drivers[driver]
        # Take first 2 examples max for readability
        lost = ", ".join(d["lost"][:2]) or "—"
        rescued = ", ".join(d["rescued"][:2]) or "—"
        recovered = ", ".join(d["recovered"][:2]) or "—"
        lines.append(f"| {driver} | {lost} | {rescued} | {recovered} |")

    return "\n".join(lines)


def generate_saved_rescued_table(saved_entries):
    """Generate rescued entries table for KNOWLEDGE_SAVED.md."""
    rescued = [e for e in saved_entries if e.get("saved_by") != "hidden_and_recovered"]
    sorted_entries = sorted(rescued, key=lambda x: x.get("year", 0), reverse=True)

    lines = ["| Event | Year | Driver | Threat | How saved |",
             "|-------|------|--------|--------|-----------|"]

    for entry in sorted_entries:
        name = entry.get("name", "Unknown")
        year = format_knowledge_year(entry)
        driver = entry.get("driver", "unknown")
        threat = entry.get("threat", "")[:50] + "..." if len(entry.get("threat", "")) > 50 else entry.get("threat", "")
        saved_how = entry.get("saved_how", "")[:40] + "..." if len(entry.get("saved_how", "")) > 40 else entry.get("saved_how", "")
        lines.append(f"| {name} | {year} | {driver} | {threat} | {saved_how} |")

    return "\n".join(lines)


def generate_saved_recovered_table(saved_entries):
    """Generate recovered entries table for KNOWLEDGE_SAVED.md."""
    recovered = [e for e in saved_entries if e.get("saved_by") == "hidden_and_recovered"]
    sorted_entries = sorted(recovered, key=lambda x: x.get("year", 0))

    lines = ["| Event | Hidden | Found | Driver | How found |",
             "|-------|--------|-------|--------|-----------|"]

    for entry in sorted_entries:
        name = entry.get("name", "Unknown")
        # Extract "hidden" year from description or driver_note
        driver_note = entry.get("driver_note", "")
        hidden_match = re.search(r'(\d+)\s*CE', driver_note)
        hidden = f"~{hidden_match.group(1)} CE" if hidden_match else "Ancient"

        found = str(entry.get("year", "?"))
        driver = entry.get("driver", "unknown")
        saved_how = entry.get("saved_how", "")[:40] + "..." if len(entry.get("saved_how", "")) > 40 else entry.get("saved_how", "")
        lines.append(f"| {name} | {hidden} | {found} | {driver} | {saved_how} |")

    return "\n".join(lines)


def generate_saved_connection_table(saved_entries, events):
    """Generate connection to main index table for KNOWLEDGE_SAVED.md."""
    lines = ["| Knowledge saved | Connected event | What changed? |",
             "|-----------------|-----------------|---------------|"]

    for entry in saved_entries:
        connected = entry.get("connected_event")
        if connected:
            name = entry.get("name", "Unknown")
            event_name = get_event_name(connected, events)
            # Clean up event name
            event_name = re.sub(r'\s*\([^)]*\)', '', event_name)

            # Determine what changed based on saved_by
            saved_by = entry.get("saved_by", "")
            if saved_by == "hidden_and_recovered":
                what_changed = "Hidden, found later"
            elif saved_by == "exile":
                what_changed = "Exile"
            elif saved_by == "local_resistance":
                what_changed = "Local resistance"
            elif saved_by == "intervention":
                what_changed = "Intervention"
            else:
                what_changed = saved_by.replace("_", " ").title()

            lines.append(f"| {name} | {event_name} | {what_changed} |")

    return "\n".join(lines)


def update_knowledge_lost(content, lost_entries, events):
    """Update KNOWLEDGE_LOST.md with generated statistics."""
    generators = {
        "LOST_DRIVER_TABLE": lambda: generate_lost_driver_table(lost_entries),
        "LOST_DATA_TABLE": lambda: generate_lost_data_table(lost_entries),
        "LOST_CONNECTION_TABLE": lambda: generate_lost_connection_table(lost_entries, events),
        "LOST_COUNT": lambda: str(len(lost_entries)),
        "LOST_SOURCES": lambda: generate_lost_sources(lost_entries),
    }
    return update_markdown(content, generators)


def update_knowledge_saved(content, lost_entries, saved_entries, events):
    """Update KNOWLEDGE_SAVED.md with generated statistics."""
    generators = {
        "SAVED_DRIVER_SUMMARY": lambda: generate_saved_driver_summary(lost_entries, saved_entries),
        "SAVED_RESCUED_TABLE": lambda: generate_saved_rescued_table(saved_entries),
        "SAVED_RECOVERED_TABLE": lambda: generate_saved_recovered_table(saved_entries),
        "SAVED_CONNECTION_TABLE": lambda: generate_saved_connection_table(saved_entries, events),
        "SAVED_COUNT": lambda: str(len(saved_entries)),
        "SAVED_RESCUED_COUNT": lambda: str(len([e for e in saved_entries if e.get("saved_by") != "hidden_and_recovered"])),
        "SAVED_RECOVERED_COUNT": lambda: str(len([e for e in saved_entries if e.get("saved_by") == "hidden_and_recovered"])),
        "SAVED_SOURCES": lambda: generate_saved_sources(saved_entries),
    }
    return update_markdown(content, generators)


def update_file(path, content, new_content, name):
    """Write file if content changed."""
    if new_content != content:
        print(f"  Writing {name}...")
        with open(path, "w", encoding="utf-8") as f:
            f.write(new_content)
        return True
    return False


def main():
    print("Loading data...")
    events = load_events()
    lost = load_knowledge_lost()
    saved = load_knowledge_saved()
    print(f"  {len(events)} events, {len(lost)} lost, {len(saved)} saved")

    print("Calculating statistics...")
    stats = calc_stats(events)

    updated = []

    # Update README.md
    print("Processing README.md...")
    with open(README_PATH, encoding="utf-8") as f:
        content = f.read()
    new_content = update_readme(content, events, stats)
    if update_file(README_PATH, content, new_content, "README.md"):
        updated.append("README.md")

    # Update KNOWLEDGE_LOST.md
    if KNOWLEDGE_LOST_PATH.exists():
        print("Processing KNOWLEDGE_LOST.md...")
        with open(KNOWLEDGE_LOST_PATH, encoding="utf-8") as f:
            content = f.read()
        new_content = update_knowledge_lost(content, lost, events)
        if update_file(KNOWLEDGE_LOST_PATH, content, new_content, "KNOWLEDGE_LOST.md"):
            updated.append("KNOWLEDGE_LOST.md")

    # Update KNOWLEDGE_SAVED.md
    if KNOWLEDGE_SAVED_PATH.exists():
        print("Processing KNOWLEDGE_SAVED.md...")
        with open(KNOWLEDGE_SAVED_PATH, encoding="utf-8") as f:
            content = f.read()
        new_content = update_knowledge_saved(content, lost, saved, events)
        if update_file(KNOWLEDGE_SAVED_PATH, content, new_content, "KNOWLEDGE_SAVED.md"):
            updated.append("KNOWLEDGE_SAVED.md")

    if updated:
        print(f"Done! Updated: {', '.join(updated)}")
    else:
        print("No changes needed.")


if __name__ == "__main__":
    main()
