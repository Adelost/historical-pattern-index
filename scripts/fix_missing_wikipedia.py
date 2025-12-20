#!/usr/bin/env python3
"""
Fix missing Wikipedia URLs with manual search terms.
"""

import json
import os
import urllib.request
import urllib.parse
import time

EVENTS_DIR = os.path.join(os.path.dirname(__file__), '..', 'data', 'events')

# Manual mappings for events that need different search terms
MANUAL_SEARCH = {
    "Anfal Campaign (Kurdish Genocide)": "Anfal campaign",
    "Assyrian Genocide (Seyfo)": "Seyfo",
    "Banda Islands Massacre (Dutch VOC)": "Banda Islands",
    "Bangladesh Genocide (Operation Searchlight)": "1971 Bangladesh genocide",
    "Biafra War & Famine (Nigerian Civil War)": "Nigerian Civil War",
    "Bosnian Genocide (including Srebrenica)": "Bosnian genocide",
    "British India Famines (Late Victorian Holocausts)": "Late Victorian Holocausts",
    "British Opium Trade in China": "Opium Wars",
    "Cambodian Genocide (Khmer Rouge)": "Cambodian genocide",
    "Destruction of Carthage (Third Punic War)": "Third Punic War",
    "Fall of Nojpetén (Last Maya Kingdom)": "Nojpetén",
    "French Algeria (Conquest & Colonial Rule)": "French Algeria",
    "Great Leap Forward (Chinese Famine)": "Great Leap Forward",
    "Greek Genocide (Pontic Greeks)": "Greek genocide",
    "Guatemalan Genocide (Maya)": "Guatemalan genocide",
    "Holodomor (Ukrainian Famine)": "Holodomor",
    "Khmelnytsky Uprising (Jewish Massacres)": "Khmelnytsky Uprising",
    "Mfecane (Southern African Wars)": "Mfecane",
    "Nakba (Palestinian Exodus)": "Nakba",
    "Nanking Massacre (Rape of Nanking)": "Nanjing Massacre",
    "Napoleonic Haiti Campaign (Saint-Domingue)": "Saint-Domingue expedition",
    "Native American Genocide (US Indian Wars & Removal)": "American Indian Wars",
    "Paraguayan War (War of the Triple Alliance)": "Paraguayan War",
    "Putumayo Genocide (Amazon Rubber Atrocities)": "Putumayo rubber boom atrocities",
    "Second Congo War (Africa's World War)": "Second Congo War",
    "Soviet Ethnic Deportations": "Population transfer in the Soviet Union",
    "Soviet Great Purge (Great Terror)": "Great Purge",
    "Colonization of the Americas (Initial Phase)": "European colonization of the Americas",
    "Spanish Conquest of Yucatán (Cultural Erasure)": "Spanish conquest of Yucatán",
    "Swedish Deluge (Potop)": "Deluge (history)",
    "The Black War (Tasmania)": "Black War",
}

def search_wikipedia(query):
    """Search Wikipedia and return the best matching article URL."""
    encoded = urllib.parse.quote(query)
    api_url = f"https://en.wikipedia.org/w/api.php?action=opensearch&search={encoded}&limit=3&format=json"

    try:
        req = urllib.request.Request(
            api_url,
            headers={'User-Agent': 'HistoricalPatternIndex/1.0 (research project)'}
        )
        with urllib.request.urlopen(req, timeout=10) as response:
            data = json.loads(response.read().decode())
            if len(data) >= 4 and data[3]:
                return data[1][0], data[3][0]
    except Exception as e:
        print(f"  Error: {e}")

    return None, None

def process_events():
    """Process events with manual search terms."""
    files = sorted([f for f in os.listdir(EVENTS_DIR) if f.endswith('.json') and f != '_template.json'])

    updated = 0
    failed = []

    for filename in files:
        filepath = os.path.join(EVENTS_DIR, filename)

        with open(filepath, 'r', encoding='utf-8') as f:
            event = json.load(f)

        # Skip if already has URL
        if event.get('wikipedia_url'):
            continue

        name = event['name']
        if name not in MANUAL_SEARCH:
            continue

        search_term = MANUAL_SEARCH[name]
        print(f"→ {name}")
        print(f"  Searching: {search_term}")

        title, url = search_wikipedia(search_term)

        if url:
            print(f"  Found: {url}")
            event['wikipedia_url'] = url

            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(event, f, indent=2, ensure_ascii=False)
                f.write('\n')

            updated += 1
        else:
            print(f"  ⚠ Still not found")
            failed.append(name)

        time.sleep(0.5)

    print(f"\n{'='*50}")
    print(f"Updated: {updated}")
    if failed:
        print(f"\nStill missing:")
        for name in failed:
            print(f"  - {name}")

if __name__ == '__main__':
    process_events()
