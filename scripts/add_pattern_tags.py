#!/usr/bin/env python3
"""
Adds standardized pattern_tags to all events for accurate pattern counting.

Pattern tags are assigned based on analysis of:
- warning_signs text
- root_causes text
- rationales text
- breakdowns (boolean flags)
- existing tags
- tier classification

This enables accurate frequency counting instead of fuzzy keyword matching.
"""

import json
from pathlib import Path

ROOT = Path(__file__).parent.parent
DATA_DIR = ROOT / "data" / "events"

# Standard pattern tags with detection rules
# WARNING SIGN patterns are detected from text (warning_signs, rationales, etc.)
# These should NOT use breakdowns - breakdowns describe what happened, not precursors
PATTERNS = {
    "DEHUMANIZATION": {
        "keywords": [
            "dehumaniz", "vermin", "cockroach", "parasite", "savage",
            "uncivilized", "inferior", "subhuman", "sub-human", "animal",
            "pest", "devil", "demon", "barbaric", "primitive", "dying race",
            "lesser", "rats", "dogs", "insects", "filth", "pollution"
        ],
        "description": "Rhetoric portraying victims as less than human"
    },
    "SCAPEGOATING": {
        "keywords": [
            "scapegoat", "blamed", "blamed on", "blamed for", "internal enemy",
            "existential threat", "fifth column", "traitor", "enemy within",
            "national problems", "military defeats", "security threat",
            "accused", "responsible for", "cause of"
        ],
        "description": "Blaming a group for society's problems"
    },
    "EMERGENCY_LAWS": {
        "keywords": [
            "martial law", "emergency", "enabling act", "wartime", "war powers",
            "security justification", "state of exception", "suspend",
            "special powers", "tehcir", "law legalized", "decree"
        ],
        "description": "Emergency powers or legal frameworks enabling persecution"
    },
    "ECONOMIC_CRISIS": {
        "keywords": [
            "economic crisis", "depression", "hyperinflation", "famine",
            "crop failure", "food shortage", "weimar", "collapse", "poverty",
            "unemployment", "crisis"
        ],
        "description": "Economic hardship exploited to target groups"
    },
    "MEDIA_INCITEMENT": {
        "keywords": [
            "radio", "incit", "broadcast", "newspaper", "rtlm", "der stürmer",
            "state media", "hate speech", "calls for violence", "list"
        ],
        "description": "Media inciting violence against target group"
    },
    "ETHNIC_NATIONALISM": {
        "keywords": [
            "national", "ethnic", "racial", "purity", "homogen", "cleansing",
            "turkification", "pan-turanism", "hutu power", "aryan", "volksgemeinschaft",
            "greater serbia", "nationalism", "ethnic", "one nation", "our people"
        ],
        "description": "Nationalist or ethnic purity ideology"
    },
    "FORCED_DISPLACEMENT": {
        "keywords": [
            "deportation", "removal", "march", "exile", "expulsion", "relocation",
            "evacuation", "transfer", "ethnic cleansing", "trail of tears",
            "death march", "tehcir", "forced movement"
        ],
        "description": "Forced population movements"
    },
    "MILITIA_VIOLENCE": {
        "keywords": [
            "militia", "paramilitary", "death squad", "interahamwe", "janjaweed",
            "einsatzgruppen", "irregular", "vigilante", "mob", "posse",
            "force publique", "special organization", "armed group"
        ],
        "description": "Paramilitaries, death squads, or militias"
    },
    "PROPERTY_SEIZURE": {
        "keywords": [
            "confiscat", "seized", "seizure", "aryanization", "land grab",
            "dispossess", "expropriate", "assets", "theft", "looting",
            "property taken"
        ],
        "description": "Systematic property confiscation"
    },
    "DELIBERATE_STARVATION": {
        "keywords": [
            "famine", "starvation", "food denial", "grain quota", "blockade",
            "food export", "requisition", "hunger", "starved", "starving"
        ],
        "description": "Famine as weapon or deliberate food denial"
    },
    "COLONIAL_JUSTIFICATION": {
        "keywords": [
            "civilizing", "humanitarian cover", "mission", "white man's burden",
            "bringing civilization", "modernization", "development"
        ],
        "description": "Colonial 'civilizing mission' justification"
    },
    "INTERNATIONAL_INACTION": {
        "keywords": [
            "abandoned", "withdrew", "looked away", "ignored", "un failed",
            "world watch", "passive", "inaction", "no intervention"
        ],
        "description": "International community failed to intervene"
    }
}


def get_searchable_text(event):
    """Extract all searchable text from an event."""
    texts = []

    # Warning signs
    signs = event.get("analysis", {}).get("warning_signs", [])
    texts.extend(signs)

    # Root causes
    causes = event.get("analysis", {}).get("root_causes", "")
    if causes:
        texts.append(causes)

    # Pattern note
    note = event.get("analysis", {}).get("pattern_note", "")
    if note:
        texts.append(note)

    # Rationales
    rationales = event.get("metrics", {}).get("rationales", {})
    texts.extend(rationales.values())

    # Tags
    tags = event.get("tags", [])
    texts.extend(tags)

    # Tier
    tier = event.get("analysis", {}).get("tier", "")
    texts.append(tier)

    # Mortality note
    mortality_note = event.get("metrics", {}).get("mortality", {}).get("note", "")
    if mortality_note:
        texts.append(mortality_note)

    return " ".join(texts).lower()


def detect_patterns(event):
    """Detect which patterns apply to an event based on text content only."""
    text = get_searchable_text(event)
    detected = []

    for pattern_id, pattern_def in PATTERNS.items():
        # Check keywords in text only - no breakdown-based detection
        for keyword in pattern_def.get("keywords", []):
            if keyword in text:
                detected.append(pattern_id)
                break

    return sorted(detected)


def process_events():
    """Process all events and add pattern_tags."""
    files = sorted(DATA_DIR.glob("*.json"))

    for filepath in files:
        if "template" in filepath.name:
            continue

        with open(filepath, encoding="utf-8") as f:
            event = json.load(f)

        # Detect patterns
        patterns = detect_patterns(event)

        # Add to analysis section
        if "analysis" not in event:
            event["analysis"] = {}

        event["analysis"]["pattern_tags"] = patterns

        # Write back
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(event, f, indent=2, ensure_ascii=False)
            f.write("\n")

        print(f"{filepath.name}: {len(patterns)} tags - {', '.join(patterns)}")

    print(f"\nProcessed {len(files) - 1} events")


if __name__ == "__main__":
    process_events()
