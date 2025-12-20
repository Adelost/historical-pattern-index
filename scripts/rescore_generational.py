#!/usr/bin/env python3
"""
Replace broad_targeting with generational_targeting in all events.

broad_targeting was true for 98% of events (useless discriminator).
generational_targeting asks: Were children/reproduction specifically
targeted to eliminate the group's future?

This distinguishes:
- Brutality (we don't care if children die)
- Extermination (we want to end their future)
"""

import json
from pathlib import Path

ROOT = Path(__file__).parent.parent
DATA_DIR = ROOT / "data" / "events"

# New values based on historical analysis
# True = children/reproduction specifically targeted to eliminate future
# False = children died but weren't specifically targeted for elimination

GENERATIONAL_TARGETING = {
    # === TRUE: Specifically targeted children/reproduction ===

    # Genocides with intent to eliminate
    "the_holocaust": True,          # Children killed, sterilization programs
    "rwandan_genocide": True,       # "Kill the cockroaches" included children
    "armenian_genocide": True,      # Death marches with entire families
    "greek_genocide": True,         # Same pattern as Armenian
    "assyrian_genocide": True,      # Same pattern as Armenian
    "cambodia_khmer_rouge": True,   # Killed entire families, "Year Zero"
    "yazidi_genocide": True,        # Sexual slavery, child abduction
    "bosnian_genocide": True,       # Srebrenica targeted males 12+
    "darfur_genocide": True,        # Village attacks included families
    "anfal_genocide": True,         # Destroyed Kurdish villages entirely
    "guatemalan_genocide": True,    # Scorched earth on Maya villages
    "bangladesh_genocide": True,    # Targeted families of intellectuals
    "dzungar_genocide": True,       # Intent to eliminate entire group
    "circassian_genocide": True,    # Expelled entire families, many died
    "herero_nama_genocide": True,   # Drove families into desert to die
    "native_american_genocide": True, # Boarding schools, family separation

    # State terror targeting families
    "holodomor": True,              # Entire families starved
    "cultural_revolution": True,    # Targeted "class enemy" families
    "indonesian_killings": True,    # Killed families of "communists"
    "dirty_war_argentina": True,    # Stole children of "subversives"
    "soviet_deportations": True,    # Deported entire families
    "soviet_great_purge": True,     # Family members often arrested too
    "great_leap_forward": True,     # Entire families starved

    # Communal violence targeting families
    "partition_of_india": True,     # Mobs killed entire families
    "khmelnytsky_uprising": True,   # Killed Jewish families
    "nanking_massacre": True,       # Killed civilians including families
    "taiping_rebellion": True,      # Mass civilian slaughter

    # Colonial erasure
    "tasmania_black_war": True,     # Intent to eliminate Aboriginal Tasmanians
    "destruction_of_carthage": True, # City destroyed, population killed/enslaved

    # Debatable but leaning True
    "nakba_1948": True,             # Expelled families, Deir Yassin massacre
    "east_timor_genocide": True,    # Attacked villages with families
    "italian_ethiopia": True,       # Used poison gas on villages
    "second_congo_war": True,       # Ethnic violence targeted families

    # === FALSE: Children died but not specifically targeted for elimination ===

    # Profit-driven (needed future labor)
    "congo_free_state": False,      # Needed future workers
    "putumayo_genocide": False,     # Same - labor value
    "transatlantic_slave_trade": False,  # Children had economic value
    "british_india_famines": False, # Policy indifference, not elimination
    "bengal_famine_1943": False,    # Wartime policy, not targeted
    "great_famine_ireland": False,  # Ideological neglect, not elimination
    "british_opium_trade": False,   # Commercial exploitation
    "banda_islands_massacre": False, # Commercial violence, replaced population

    # Wars/conquests (terror strategy, not generational elimination)
    "mongol_conquests": False,      # Terror to force surrender
    "sack_of_baghdad": False,       # Conquest destruction
    "timur_conquests": False,       # Terror strategy
    "an_lushan_rebellion": False,   # Civil war
    "swedish_deluge": False,        # Plundering war
    "paraguayan_war": False,        # War, though devastating
    "mfecane": False,               # Military expansion
    "jewish_roman_wars": False,     # Imperial suppression

    # Colonial exploitation (not elimination)
    "spanish_americas": False,      # Needed labor, not elimination
    "spanish_conquest_yucatan": False,  # Cultural destruction, but kept workers
    "french_algeria": False,        # Colonization, not elimination
    "fall_of_nojpeten": False,      # Conquest, small scale
    "napoleon_haiti": False,        # Restore slavery, not eliminate

    # Other
    "biafra_famine": False,         # Blockade strategy, not generational
}


def rescore_event(filepath: Path) -> bool:
    """Update generational_targeting for a single event."""
    stem = filepath.stem

    if stem not in GENERATIONAL_TARGETING:
        print(f"⚠️  No mapping for {stem}")
        return False

    with open(filepath, encoding="utf-8") as f:
        event = json.load(f)

    new_value = GENERATIONAL_TARGETING[stem]
    sys_breakdown = event["metrics"]["breakdowns"]["systematic_intensity"]

    # Get old value
    old_value = sys_breakdown.get("broad_targeting", False)

    # Remove old key, add new key
    if "broad_targeting" in sys_breakdown:
        del sys_breakdown["broad_targeting"]

    # Insert generational_targeting in the right position
    new_breakdown = {}
    for key, value in sys_breakdown.items():
        new_breakdown[key] = value
        if key == "propaganda":
            new_breakdown["generational_targeting"] = new_value

    # If propaganda wasn't found, just add it
    if "generational_targeting" not in new_breakdown:
        new_breakdown["generational_targeting"] = new_value

    event["metrics"]["breakdowns"]["systematic_intensity"] = new_breakdown

    # Recalculate systematic_intensity score
    true_count = sum(1 for v in new_breakdown.values() if v is True)
    new_score = int((true_count / 9) * 100)
    old_score = event["metrics"]["scores"]["systematic_intensity"]
    event["metrics"]["scores"]["systematic_intensity"] = new_score

    # Write back
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(event, f, indent=2, ensure_ascii=False)
        f.write("\n")

    # Report change
    val_change = "T→T" if old_value and new_value else "T→F" if old_value and not new_value else "F→T" if not old_value and new_value else "F→F"
    score_change = new_score - old_score
    symbol = "↑" if score_change > 0 else "↓" if score_change < 0 else "="

    if old_value != new_value:
        print(f"{'✓' if score_change != 0 else '·'} {stem:40} {val_change}  {old_score:3}% → {new_score:3}% ({symbol}{abs(score_change)})")

    return True


def main():
    print("=== REPLACING broad_targeting → generational_targeting ===\n")
    print("Question: Were children/reproduction specifically targeted")
    print("          to eliminate the group's future?\n")

    modified = 0
    changes = 0

    for filepath in sorted(DATA_DIR.glob("*.json")):
        if "template" in filepath.name:
            continue

        stem = filepath.stem
        if stem in GENERATIONAL_TARGETING:
            with open(filepath) as f:
                d = json.load(f)
            old_val = d["metrics"]["breakdowns"]["systematic_intensity"].get("broad_targeting", False)
            new_val = GENERATIONAL_TARGETING[stem]
            if old_val != new_val:
                changes += 1

        if rescore_event(filepath):
            modified += 1

    print(f"\n✓ Modified {modified} events")
    print(f"✓ Changed {changes} values from True to False")


if __name__ == "__main__":
    main()
