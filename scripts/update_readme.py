#!/usr/bin/env python3
"""
Updates README.md with statistics from data/events/*.json

Usage: python scripts/update_readme.py

Markers in README.md:
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


def generate_events_table(events):
    """Generate main events table."""
    # Sort chronologically (by start year) to show historical patterns
    sorted_events = sorted(events, key=lambda e: e.get("period", {}).get("start", 0))

    lines = ["| Event | Period | Deaths | Tier | Denied? |", "|-------|--------|--------|------|---------|"]

    for e in sorted_events:
        name = e.get("name", "Unknown")
        period = e.get("period", {})
        period_str = f"{period.get('start', '?')}-{period.get('end', '?')}"

        mortality = e.get("metrics", {}).get("mortality", {})
        deaths = format_deaths(mortality.get("min", 0), mortality.get("max", 0))

        tier = e.get("analysis", {}).get("tier", "Unknown")
        tier_short = {
            "TOTAL ERASURE": "Erasure",
            "INDUSTRIAL MEGA-EVENT": "Industrial",
            "CONTINENTAL COLLAPSE": "Collapse",
            "PROFIT-DRIVEN ATTRITION": "Profit",
            "CHAOTIC ATROCITY": "Chaotic"
        }.get(tier, tier)

        denial = e.get("denial_status", "unknown")
        denial_str = {
            "denied": "**Denied**",
            "partial": "Partial",
            "acknowledged": "No",
            "disputed": "Disputed",
            "suppressed": "Suppressed"
        }.get(denial, denial)

        lines.append(f"| {name} | {period_str} | {deaths} | {tier_short} | {denial_str} |")

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
    """Generate recurring warning signs patterns table."""
    # Pattern categories with keywords to match (based on actual warning signs in data)
    PATTERN_CATEGORIES = {
        "Dehumanizing rhetoric": [
            "dehumaniz", "vermin", "cockroach", "savage", "parasite",
            "uncivilized", "devil worship", "inferior", "subversive",
            "dying race", "enemies"
        ],
        "Minorities scapegoated": [
            "scapegoat", "blamed", "existential threat", "internal enemy",
            "foreign element", "traitor", "labeled security threat",
            "labeled 'traitors'"
        ],
        "Nationalist/ethnic purity ideology": [
            "national", "ethnic", "purity", "racial", "religious",
            "homogen", "supremac", "greater serbia", "turkey for turks"
        ],
        "Militias and death squads": [
            "militia", "paramilitary", "death squad", "weapon distribut",
            "death list", "military coordinat", "armed group", "janjaweed"
        ],
        "Legal exclusion escalating": [
            "legal exclusion", "emergency", "martial law", "enabling act",
            "laws suspend", "citizenship strip"
        ],
        "State media incitement": [
            "propaganda", "radio incit", "media", "state-controlled",
            "inciting violence"
        ],
        "Economic crisis exploited": [
            "economic crisis", "hyperinflation", "crisis blamed",
            "depression", "blamed on outgroup"
        ],
        "Land/property seizures": [
            "land seizure", "property", "settler land", "confiscat",
            "land targeted", "land cleared"
        ],
        "Forced displacement/deportation": [
            "deportation", "displacement", "removal", "evacuation",
            "forced relocation", "expulsion", "ethnic cleansing"
        ],
        "International passivity": [
            "international", "passive", "looking away", "ignored",
            "abandoned", "slow to respond"
        ],
        "Colonial/imperial 'civilizing' claims": [
            "civilizing", "colonial", "imperial", "mission", "humanitarian cover"
        ],
        "Deliberate starvation policies": [
            "famine", "starvation", "blockade", "food export", "grain quota"
        ]
    }

    total_events = len(events)
    category_events = {cat: set() for cat in PATTERN_CATEGORIES}

    for event in events:
        event_id = event.get("id", "unknown")
        signs = event.get("analysis", {}).get("warning_signs", [])

        for sign in signs:
            sign_lower = sign.lower()
            for category, keywords in PATTERN_CATEGORIES.items():
                if any(kw in sign_lower for kw in keywords):
                    category_events[category].add(event_id)

    # Sort by frequency
    sorted_cats = sorted(category_events.items(), key=lambda x: -len(x[1]))

    lines = ["| Warning Sign Pattern | Frequency |", "|---------------------|-----------|"]

    for cat, event_ids in sorted_cats:
        count = len(event_ids)
        if count == 0:
            continue
        pct = round(count / total_events * 100)
        lines.append(f"| {cat} | {pct}% ({count}/{total_events}) |")

    return "\n".join(lines)


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

    for key, generator in generators.items():
        pattern = rf"(<!-- STATS:{key} -->).*?(<!-- /STATS:{key} -->)"
        generated = generator()

        def make_replacement(match):
            # Inline stats (single values) don't need newlines
            if "\n" not in generated:
                return f"{match.group(1)}{generated}{match.group(2)}"
            else:
                return f"{match.group(1)}\n{generated}\n{match.group(2)}"

        content = re.sub(pattern, make_replacement, content, flags=re.DOTALL)

    return content


def main():
    print("Loading events...")
    events = load_events()
    print(f"Found {len(events)} events")

    print("Calculating statistics...")
    stats = calc_stats(events)

    print("Reading README.md...")
    with open(README_PATH, encoding="utf-8") as f:
        content = f.read()

    print("Updating content...")
    new_content = update_readme(content, events, stats)

    if new_content != content:
        print("Writing updated README.md...")
        with open(README_PATH, "w", encoding="utf-8") as f:
            f.write(new_content)
        print("Done! README.md updated.")
    else:
        print("No changes needed.")


if __name__ == "__main__":
    main()
