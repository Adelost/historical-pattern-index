#!/usr/bin/env python3
"""
Add Wikipedia URLs to event JSON files.
Uses Wikipedia API to find matching articles.
"""

import json
import os
import urllib.request
import urllib.parse
import time

EVENTS_DIR = os.path.join(os.path.dirname(__file__), '..', 'data', 'events')

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
            # data = [query, [titles], [descriptions], [urls]]
            if len(data) >= 4 and data[3]:
                return data[1][0], data[3][0]  # title, url
    except Exception as e:
        print(f"  Error searching: {e}")

    return None, None

def process_events():
    """Process all event files and add Wikipedia URLs."""
    files = sorted([f for f in os.listdir(EVENTS_DIR) if f.endswith('.json') and f != '_template.json'])

    updated = 0
    skipped = 0
    manual_review = []

    for filename in files:
        filepath = os.path.join(EVENTS_DIR, filename)

        with open(filepath, 'r', encoding='utf-8') as f:
            event = json.load(f)

        # Skip if already has wikipedia_url
        if event.get('wikipedia_url'):
            print(f"✓ {event['name'][:50]} - already has URL")
            skipped += 1
            continue

        print(f"\n→ {event['name']}")

        # Search Wikipedia
        title, url = search_wikipedia(event['name'])

        if url:
            print(f"  Found: {title}")
            print(f"  URL: {url}")

            # Add to event
            event['wikipedia_url'] = url

            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(event, f, indent=2, ensure_ascii=False)
                f.write('\n')

            updated += 1
        else:
            print(f"  ⚠ No match found - needs manual review")
            manual_review.append(event['name'])

        # Rate limit
        time.sleep(0.5)

    print(f"\n{'='*50}")
    print(f"Updated: {updated}")
    print(f"Skipped (already had URL): {skipped}")
    print(f"Needs manual review: {len(manual_review)}")

    if manual_review:
        print("\nEvents needing manual Wikipedia URLs:")
        for name in manual_review:
            print(f"  - {name}")

if __name__ == '__main__':
    process_events()
