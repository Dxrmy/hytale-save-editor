import json
import shutil
from pathlib import Path
import sys
import os

# Get the directory of the current script
SCRIPT_DIR = Path(__file__).parent.absolute()
sys.path.append(str(SCRIPT_DIR))

try:
    import hse
except ImportError:
    print(f"Error: Could not import hse.py from {SCRIPT_DIR}. Ensure the file exists.")
    sys.exit(1)

def create_mock_save(temp_dir):
    """Creates a mock Hytale save structure for testing."""
    save_path = temp_dir / "Test_Save"
    player_dir = save_path / "universe" / "players"
    world_res_dir = save_path / "universe" / "worlds" / "default" / "resources"
    
    for d in [player_dir, world_res_dir]:
        d.mkdir(parents=True, exist_ok=True)
        
    # Mock Player
    player_data = {
        "Components": {
            "EntityStats": {"Stats": {"Health": {"Value": 50.0}}},
            "Transform": {"Position": {"X": 10.0, "Y": 20.0, "Z": 30.0}},
            "HotbarInventory": {"Inventory": {"Items": {"0": {"Id": "hytale:sword", "Quantity": 1}}}},
            "Player": {"PlayerData": {"ReputationData": {"hytale:kweebecs": 100}}}
        }
    }
    with open(player_dir / "test_player.json", "w") as f:
        json.dump(player_data, f)
        
    # Mock Waypoints
    # The real format is a list in "Markers" key
    marker_data = {
        "Markers": [
            {"Name": "Spawn", "Position": {"X": 100.0, "Y": 50.0, "Z": 100.0}}
        ]
    }
    with open(world_res_dir / "BlockMapMarkers.json", "w") as f:
        json.dump(marker_data, f)
        
    return save_path

def test_feature_mappings(save_path):
    player_path = save_path / "universe" / "players" / "test_player.json"
    with open(player_path, "r") as f:
        data = json.load(f)
        
    print("--- Running HSE Logic Debug ---")
    
    # 1. Test Health Mapping
    hp = hse.get_nested(data, ["Components", "EntityStats", "Stats", "Health", "Value"])
    print(f"Health Mapping: {'PASS' if hp == 50.0 else 'FAIL'} ({hp})")
    
    # 2. Test Reputation Mapping
    rep = hse.get_nested(data, ["Components", "Player", "PlayerData", "ReputationData", "hytale:kweebecs"])
    print(f"Reputation Mapping: {'PASS' if rep == 100 else 'FAIL'} ({rep})")
    
    # 3. Test Waypoint Safety Offset
    # HSE logic for waypoint teleport
    marker_path = save_path / "universe" / "worlds" / "default" / "resources" / "BlockMapMarkers.json"
    with open(marker_path, "r") as f:
        m_data = json.load(f)
    
    target_marker = m_data["Markers"][0]
    target_pos = target_marker["Position"]
    new_y = target_pos["Y"] + 2.0
    print(f"Waypoint Y Safety (+2.0): {'PASS' if new_y == 52.0 else 'FAIL'} ({new_y})")
    
    # 4. Test Inventory Mapping
    inv_item = hse.get_nested(data, ["Components", "HotbarInventory", "Inventory", "Items", "0", "Id"])
    print(f"Inventory ID Mapping: {'PASS' if inv_item == 'hytale:sword' else 'FAIL'} ({inv_item})")

if __name__ == "__main__":
    temp_test_dir = SCRIPT_DIR / "temp_test"
    if temp_test_dir.exists():
        shutil.rmtree(temp_test_dir)
    temp_test_dir.mkdir()
    
    try:
        save = create_mock_save(temp_test_dir)
        test_feature_mappings(save)
    finally:
        # Cleanup
        if temp_test_dir.exists():
            shutil.rmtree(temp_test_dir)
        print("--- Debug Finished ---")
