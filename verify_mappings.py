import json
from pathlib import Path
import sys

# Mocking parts of hse.py to test the mapping logic
def get_nested(data, keys):
    for key in keys:
        if isinstance(data, dict):
            data = data.get(key)
        else:
            return None
    return data

# Sample data from the actual Hytale save
sample_json = """
{
  "Components": {
    "EntityStats": {
      "Stats": {
        "Health": { "Value": 100.0 }
      }
    },
    "Transform": {
      "Position": { "X": 848.5, "Y": 112.1, "Z": 319.0 }
    },
    "HotbarInventory": {
      "Inventory": {
        "Items": { "0": { "Id": "Weapon_Sword", "Quantity": 1 } }
      }
    }
  }
}
"""

def test_mappings():
    data = json.loads(sample_json)
    
    # Test Stats
    hp_path = ["Components", "EntityStats", "Stats", "Health", "Value"]
    hp = get_nested(data, hp_path)
    print(f"Health check: {hp} (Expected: 100.0)")
    assert hp == 100.0
    
    # Test Position
    pos_path = ["Components", "Transform", "Position", "X"]
    x = get_nested(data, pos_path)
    print(f"Position X check: {x} (Expected: 848.5)")
    assert x == 848.5
    
    # Test Inventory
    inv_path = ["Components", "HotbarInventory", "Inventory", "Items"]
    items = get_nested(data, inv_path)
    print(f"Hotbar check: {items.get('0', {}).get('Id')} (Expected: Weapon_Sword)")
    assert items.get("0", {}).get("Id") == "Weapon_Sword"

    print("ALL MAPPINGS VERIFIED.")

if __name__ == "__main__":
    try:
        test_mappings()
    except Exception as e:
        print(f"MAPPING FAILED: {e}")
        sys.exit(1)
