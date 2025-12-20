#!/usr/bin/env python3
"""
Rescore ideology items for all events.

Replaces:
  - historical_claim → dehumanization
  - higher_purpose → mass_mobilization

Based on historical analysis of each event.
"""

import json
from pathlib import Path

ROOT = Path(__file__).parent.parent
DATA_DIR = ROOT / "data" / "events"

# New ideology values based on historical analysis
# Format: event_stem -> (dehumanization, mass_mobilization)
#
# dehumanization: Were victims labeled subhuman ("rats", "cockroaches", "vermin")?
# mass_mobilization: Were civilians actively recruited to kill?

NEW_VALUES = {
    # === CLEAR DEHUMANIZATION + MASS MOBILIZATION (True genocides) ===
    "the_holocaust": (True, False),        # "Vermin", "parasites" but state-run killing
    "rwandan_genocide": (True, True),      # "Inyenzi" (cockroaches), machete mobs
    "armenian_genocide": (True, False),    # Dehumanized, but military/gendarme killing
    "greek_genocide": (True, False),       # Same pattern as Armenian
    "assyrian_genocide": (True, False),    # Same pattern as Armenian
    "cambodia_khmer_rouge": (True, True),  # "Enemies", forced civilian denunciations
    "cultural_revolution": (True, True),   # "Class enemies", Red Guards were civilians
    "indonesian_killings": (True, True),   # "Communists", civilian militias
    "bosnian_genocide": (True, False),     # Dehumanization, but military killing
    "darfur_genocide": (True, True),       # Janjaweed militias + rhetoric
    "yazidi_genocide": (True, True),       # "Devil worshippers", ISIS + local recruits

    # === DEHUMANIZATION BUT NO MASS MOBILIZATION (State machinery) ===
    "holodomor": (True, False),            # "Kulaks" as class enemies, state apparatus
    "soviet_great_purge": (True, False),   # "Enemies of the people", NKVD
    "soviet_deportations": (True, False),  # Ethnic groups as "traitors"
    "anfal_genocide": (True, False),       # Kurds dehumanized, military operation
    "bangladesh_genocide": (True, False),  # Bengalis dehumanized, Pakistani army
    "guatemalan_genocide": (True, False),  # Maya as "subversives", military
    "dirty_war_argentina": (True, False),  # "Subversives", state apparatus
    "east_timor_genocide": (False, False), # Occupation, less dehumanizing rhetoric
    "herero_nama_genocide": (True, False), # Racial ideology, military extermination order
    "nanking_massacre": (True, False),     # Chinese dehumanized, but army killing
    "dzungar_genocide": (True, False),     # Labeled as threat, Qing military
    "circassian_genocide": (True, False),  # Dehumanized, Russian military

    # === MASS MOBILIZATION BUT LESS DEHUMANIZATION ===
    "khmelnytsky_uprising": (True, True),  # Jews as "Christ-killers", Cossack mobs
    "partition_of_india": (False, True),   # Communal mobs, less systematic dehumanization
    "biafra_famine": (False, False),       # Blockade strategy, not dehumanization

    # === PROFIT-DRIVEN (Low/No dehumanization, No mass mobilization) ===
    "congo_free_state": (False, False),    # Workers as labor units, company agents
    "putumayo_genocide": (False, False),   # Same as Congo - extraction, not ideology
    "transatlantic_slave_trade": (False, False),  # Dehumanized as property, but not "vermin"
    "british_india_famines": (False, False),      # Policy indifference, not hate
    "bengal_famine_1943": (False, False),  # Wartime policy, not ideology
    "great_famine_ireland": (False, False),       # Ideological (laissez-faire), not hate
    "british_opium_trade": (False, False), # Pure commerce
    "banda_islands_massacre": (False, False),     # VOC commercial violence

    # === COLONIAL/CONQUEST (Mixed - some ideology, but primarily extraction) ===
    "spanish_americas": (False, False),    # "Uncivilized" but not vermin-language
    "spanish_conquest_yucatan": (False, False),   # Religious, not dehumanizing
    "french_algeria": (False, False),      # Colonial subjects, not vermin
    "native_american_genocide": (True, False),    # "Savages", but state/military killing
    "tasmania_black_war": (True, False),   # "Dying race" ideology, settler violence
    "fall_of_nojpeten": (False, False),    # Conquest, religious mission
    "napoleon_haiti": (False, False),      # Slave revolt suppression

    # === ANCIENT/MEDIEVAL (Different dynamics) ===
    "destruction_of_carthage": (True, False),     # "Carthago delenda est", but army
    "jewish_roman_wars": (False, False),   # Imperial suppression, not dehumanization
    "mongol_conquests": (False, False),    # Terror strategy, not hate ideology
    "sack_of_baghdad": (False, False),     # Conquest, not ideological purge
    "timur_conquests": (False, False),     # Terror strategy, not dehumanization
    "an_lushan_rebellion": (False, False), # Civil war, not genocide
    "swedish_deluge": (False, False),      # Religious war + plunder
    "taiping_rebellion": (False, True),    # Messianic, civilian armies

    # === COMPLEX CONFLICTS ===
    "second_congo_war": (True, True),      # Ethnic militias, civilian involvement

    # === OTHER ===
    "mfecane": (False, False),             # Military revolution, not dehumanization
    "paraguayan_war": (False, False),      # War, not genocide ideology
    "great_leap_forward": (True, True),    # "Class enemies", civilian denunciations
    "italian_ethiopia": (True, False),     # Racist ideology, military
    "nakba_1948": (False, False),          # Displacement, not extermination rhetoric
}


def rescore_event(filepath: Path) -> bool:
    """Update ideology items for a single event. Returns True if modified."""
    stem = filepath.stem

    if stem not in NEW_VALUES:
        print(f"⚠️  No mapping for {stem}")
        return False

    with open(filepath, encoding="utf-8") as f:
        event = json.load(f)

    dehumanization, mass_mobilization = NEW_VALUES[stem]

    ideology = event["metrics"]["breakdowns"].get("ideology", {})

    # Get existing values we're keeping
    purity_ideal = ideology.get("purity_ideal", False)
    victim_narrative = ideology.get("victim_narrative", False)
    utopianism = ideology.get("utopianism", False)

    # Build new ideology breakdown
    new_ideology = {
        "purity_ideal": purity_ideal,
        "dehumanization": dehumanization,
        "mass_mobilization": mass_mobilization,
        "victim_narrative": victim_narrative,
        "utopianism": utopianism
    }

    # Calculate new score
    true_count = sum(1 for v in new_ideology.values() if v)
    new_score = int((true_count / 5) * 100)

    old_score = event["metrics"]["scores"]["ideology"]

    # Update event
    event["metrics"]["breakdowns"]["ideology"] = new_ideology
    event["metrics"]["scores"]["ideology"] = new_score

    # Write back
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(event, f, indent=2, ensure_ascii=False)
        f.write("\n")

    change = new_score - old_score
    symbol = "↑" if change > 0 else "↓" if change < 0 else "="
    print(f"{'✓' if change != 0 else '·'} {stem:40} {old_score:3}% → {new_score:3}% ({symbol}{abs(change)})")

    return True


def main():
    print("=== RESCORING IDEOLOGY ===\n")
    print("Replacing: historical_claim → dehumanization")
    print("Replacing: higher_purpose → mass_mobilization\n")

    modified = 0
    for filepath in sorted(DATA_DIR.glob("*.json")):
        if "template" in filepath.name:
            continue
        if rescore_event(filepath):
            modified += 1

    print(f"\n✓ Modified {modified} events")


if __name__ == "__main__":
    main()
