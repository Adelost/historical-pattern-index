#!/usr/bin/env python3
"""
Updates data/index.json with the list of all event files in data/events/.
"""

import json
import glob
import os

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EVENTS_DIR = os.path.join(ROOT_DIR, "data", "events")
INDEX_FILE = os.path.join(ROOT_DIR, "data", "index.json")

def main():
    # Find all JSON files in data/events/
    pattern = os.path.join(EVENTS_DIR, "*.json")
    files = glob.glob(pattern)
    
    # Filter out templates and sort
    event_files = []
    for f in files:
        filename = os.path.basename(f)
        if filename == "_template.json":
            continue
        
        # Create relative path from project root (e.g., "data/events/event.json")
        rel_path = os.path.relpath(f, ROOT_DIR)
        # Use forward slashes for JSON compatibility
        rel_path = rel_path.replace(os.sep, "/")
        event_files.append(rel_path)
    
    event_files.sort()
    
    # Write to index.json
    print(f"Found {len(event_files)} events.")
    with open(INDEX_FILE, "w", encoding="utf-8") as f:
        json.dump(event_files, f, indent=2)
    print(f"Updated {INDEX_FILE}")

if __name__ == "__main__":
    main()
