import os
import json
import shutil
import struct
import argparse
import sys
from datetime import datetime
from pathlib import Path
from typing import Final, List, Optional, Any
from InquirerPy import inquirer
from rich.console import Console
from rich.table import Table

try:
    import zstandard as zstd
except ImportError:
    zstd = None

try:
    import bson
except ImportError:
    bson = None


# Global console instance for rich output
console = Console()


# Deterministic path constants
SAVE_BASE_PATH: Final[Path] = Path(os.path.expandvars(r"%APPDATA%\Hytale\UserData\Saves"))
BACKUP_DIR_NAME: Final[str] = "HSE_Backups"


def json_output(data: Any) -> None:
    """Prints data as JSON for headless mode."""
    print(json.dumps(data, indent=2))


def validate_environment() -> bool:
    """
    Validates the local Hytale save environment.
    """
    if not SAVE_BASE_PATH.exists():
        if "--headless" not in sys.argv:
            print(f"Environment Error: Hytale save directory not found at {SAVE_BASE_PATH}")
        return False
    return True


def ensure_backup_infrastructure() -> Path:
    """
    Ensures that the backup directory exists.
    """
    backup_path = SAVE_BASE_PATH / BACKUP_DIR_NAME
    backup_path.mkdir(parents=True, exist_ok=True)
    return backup_path


def get_saves() -> List[Path]:
    """
    Finds valid Hytale saves.
    """
    if not SAVE_BASE_PATH.exists():
        return []
    saves = [d for d in SAVE_BASE_PATH.iterdir() if d.is_dir() and d.name != BACKUP_DIR_NAME and (d / "universe").exists()]
    return sorted(saves, key=lambda x: x.name)


def create_backup(save_path: Path) -> Path:
    """
    Creates a timestamped backup of the save.
    """
    backup_root = ensure_backup_infrastructure()
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_path = backup_root / f"{save_path.name}_{timestamp}"
    shutil.copytree(save_path, backup_path)
    return backup_path


def get_nested(data: dict, keys: List[str]) -> Any:
    """Helper to get nested dictionary values safely."""
    for key in keys:
        if isinstance(data, dict):
            data = data.get(key)
        else:
            return None
    return data


def set_nested(data: dict, keys: List[str], value: Any) -> bool:
    """Helper to set nested dictionary values safely."""
    for key in keys[:-1]:
        if key not in data or not isinstance(data[key], dict):
            data[key] = {}
        data = data[key]
    data[keys[-1]] = value
    return True


def get_players(save_path: Path) -> List[Path]:
    """Maps player JSON files."""
    player_dir = save_path / "universe" / "players"
    return list(player_dir.glob("*.json")) if player_dir.exists() else []


def select_with_numbers(message: str, choices: List[str]) -> str:
    """Helper to provide numeric selection in menus."""
    numbered_choices = [f"{i+1}. {choice}" for i, choice in enumerate(choices)]
    selection = inquirer.select(message=message, choices=numbered_choices).execute()
    # Extract the original text after the number
    return selection.split(". ", 1)[1]


def edit_vital_stats(player_path: Path) -> None:
    try:
        with open(player_path, "r") as f:
            data = json.load(f)
    except Exception as e:
        print(f"Error: {e}")
        return

    while True:
        stats_path = ["Components", "EntityStats", "Stats"]
        
        # Pre-fetch values for display
        hp = get_nested(data, stats_path + ["Health", "Value"])
        mana = get_nested(data, stats_path + ["Mana", "Value"])
        stam = get_nested(data, stats_path + ["Stamina", "Value"])
        
        selection = select_with_numbers(
            f"Editing Vital Stats ({player_path.name})",
            [f"Health (Current: {hp})", f"Mana (Current: {mana})", f"Stamina (Current: {stam})", "Back"]
        )

        if selection == "Back":
            break

        if "Health" in selection:
            new_val = inquirer.text(message="Enter new Health (or 'c' to cancel):").execute()
            if new_val and new_val.lower() != 'c':
                set_nested(data, stats_path + ["Health", "Value"], float(new_val))
        elif "Mana" in selection:
            new_val = inquirer.text(message="Enter new Mana (or 'c' to cancel):").execute()
            if new_val and new_val.lower() != 'c':
                set_nested(data, stats_path + ["Mana", "Value"], float(new_val))
        elif "Stamina" in selection:
            new_val = inquirer.text(message="Enter new Stamina (or 'c' to cancel):").execute()
            if new_val and new_val.lower() != 'c':
                set_nested(data, stats_path + ["Stamina", "Value"], float(new_val))

        with open(player_path, "w") as f:
            json.dump(data, f, indent=4)
        print("Updated successfully.")


def edit_player_position(player_path: Path) -> None:
    try:
        with open(player_path, "r") as f:
            data = json.load(f)
    except Exception as e:
        print(f"Error: {e}")
        return

    pos_path = ["Components", "Transform", "Position"]
    
    while True:
        x = get_nested(data, pos_path + ["X"])
        y = get_nested(data, pos_path + ["Y"])
        z = get_nested(data, pos_path + ["Z"])
        
        selection = select_with_numbers(
            f"Editing Player Position ({player_path.name})",
            [f"X (Current: {x})", f"Y (Current: {y})", f"Z (Current: {z})", "Back"]
        )

        if selection == "Back":
            break

        axis = selection[0] # X, Y, Z
        new_val = inquirer.text(message=f"Enter new {axis} (or 'c' to cancel):").execute()
        if new_val and new_val.lower() != 'c':
            try:
                set_nested(data, pos_path + [axis], float(new_val))
                with open(player_path, "w") as f:
                    json.dump(data, f, indent=4)
                print(f"Updated {axis} successfully.")
            except ValueError:
                print("Invalid value. Must be a number.")


def show_inventory_table(data: dict, section_name: str, items_path: List[str]):
    items = get_nested(data, items_path)
    if not items:
        print(f"Section '{section_name}' not found or empty.")
        return False

    table = Table(title=f"{section_name} Inventory")
    table.add_column("Slot", justify="right", style="cyan")
    table.add_column("Item ID", style="white")
    table.add_column("Quantity", justify="right", style="green")
    
    # Items can be a dict where keys are slot indices as strings
    for slot, item in items.items():
        table.add_row(str(slot), item.get("Id", "Empty"), str(item.get("Quantity", 0)))
    
    console.print(table)
    return True


def edit_inventory(player_path: Path):
    try:
        with open(player_path, "r") as f:
            data = json.load(f)
    except Exception as e:
        print(f"Error: {e}")
        return

    inv_maps = {
        "Hotbar": ["Components", "HotbarInventory", "Inventory", "Items"],
        "Storage": ["Components", "StorageInventory", "Inventory", "Items"],
        "Backpack": ["Components", "BackpackInventory", "Inventory", "Items"],
        "Armor": ["Components", "ArmorInventory", "Inventory", "Items"],
        "Utility": ["Components", "UtilityInventory", "Inventory", "Items"]
    }

    while True:
        os.system('cls' if os.name == 'nt' else 'clear')
        selection = select_with_numbers("Select Inventory Section:", list(inv_maps.keys()) + ["Back"])
        
        if selection == "Back":
            break

        path = inv_maps[selection]
        if show_inventory_table(data, selection, path):
            items = get_nested(data, path)
            slot_to_edit = inquirer.text(message="Enter Slot ID to edit (or 'c' to cancel):").execute()
            
            if slot_to_edit and slot_to_edit.lower() != 'c':
                item = items.get(slot_to_edit, {"Id": "Empty", "Quantity": 1})
                new_id = inquirer.text(message=f"New Item ID (Current: {item.get('Id')}, 'c' to cancel):").execute()
                if new_id and new_id.lower() != 'c':
                    item["Id"] = new_id
                
                new_qty = inquirer.text(message=f"New Quantity (Current: {item.get('Quantity')}, 'c' to cancel):").execute()
                if new_qty and new_qty.lower() != 'c':
                    item["Quantity"] = int(new_qty)
                
                items[slot_to_edit] = item
                with open(player_path, "w") as f:
                    json.dump(data, f, indent=4)
                print("Inventory updated.")
        input("Press Enter to continue...")


def edit_gameplay_toggles(save_path: Path):
    conf_path = save_path / "universe" / "worlds" / "default" / "config.json"
    if not conf_path.exists():
        print("Config not found.")
        return

    with open(conf_path, "r") as f:
        data = json.load(f)

    while True:
        toggles = {
            "NPC Spawning": "IsSpawningNPC",
            "Time Ticking": "IsTicking",
            "Block Ticking": "IsBlockTicking",
            "Fall Damage": "IsFallDamageEnabled"
        }
        toggle_options = [f"{k} (Current: {data.get(v)})" for k, v in toggles.items()]
        toggle_choice = select_with_numbers("Gameplay Toggles:", toggle_options + ["Back"])
        
        if toggle_choice == "Back":
            break
        
        key_label = toggle_choice.split(" (Current:")[0]
        config_key = toggles[key_label]
        data[config_key] = inquirer.confirm(message=f"Enable {key_label}?", default=data.get(config_key)).execute()

        with open(conf_path, "w") as f:
            json.dump(data, f, indent=4)
        print("Updated gameplay toggles.")


def edit_world_config(save_path: Path):
    conf_path = save_path / "universe" / "worlds" / "default" / "config.json"
    if not conf_path.exists():
        print("Config not found.")
        return

    with open(conf_path, "r") as f:
        data = json.load(f)

    while True:
        selection = select_with_numbers("World Config:", ["Name", "Seed", "PVP", "Back"])
        if selection == "Back":
            break
        
        if selection == "Name":
            new_val = inquirer.text(message=f"New Name (Current: {data.get('DisplayName')}, 'c' to cancel):").execute()
            if new_val and new_val.lower() != 'c':
                data["DisplayName"] = new_val
        elif selection == "Seed":
            print("[WARNING] Editing the seed of a generated world can cause major chunk borders and world corruption.")
            if inquirer.confirm(message="Are you sure you want to edit the seed?").execute():
                new_val = inquirer.text(message=f"New Seed (Current: {data.get('Seed')}, 'c' to cancel):").execute()
                if new_val and new_val.lower() != 'c':
                    try:
                        data["Seed"] = int(new_val)
                    except ValueError:
                        print("Invalid seed. Must be an integer.")
        elif selection == "PVP":
            data["IsPvpEnabled"] = inquirer.confirm(message="Enable PVP?", default=data.get("IsPvpEnabled")).execute()

        with open(conf_path, "w") as f:
            json.dump(data, f, indent=4)
        print("Updated world config.")


def edit_world_time(save_path: Path):
    time_path = save_path / "universe" / "worlds" / "default" / "resources" / "Time.json"
    if not time_path.exists():
        print("Time.json not found.")
        return

    with open(time_path, "r") as f:
        data = json.load(f)

    while True:
        cur_time = data.get("Now")
        selection = select_with_numbers(f"World Time (Current: {cur_time})", ["Enter ISO String", "Time Presets", "Back"])
        
        if selection == "Back":
            break
            
        new_time = None
        if selection == "Enter ISO String":
            new_time = inquirer.text(message="Enter new ISO Time string (or 'c' to cancel):", placeholder="e.g. 1970-01-01T01:00:00.000Z").execute()
            if new_time and new_time.lower() == 'c':
                new_time = None
        elif selection == "Time Presets":
            presets = {
                "Dawn (06:00)": "1970-01-01T06:00:00.000Z",
                "Noon (12:00)": "1970-01-01T12:00:00.000Z",
                "Dusk (18:00)": "1970-01-01T18:00:00.000Z",
                "Midnight (00:00)": "1970-01-01T00:00:00.000Z"
            }
            preset_choice = select_with_numbers("Select Preset:", list(presets.keys()) + ["Back"])
            if preset_choice != "Back":
                new_time = presets[preset_choice]

        if new_time:
            data["Now"] = new_time
            with open(time_path, "w") as f:
                json.dump(data, f, indent=4)
            print(f"Time updated to {new_time}.")


def edit_reputation(player_path: Path) -> None:
    try:
        with open(player_path, "r") as f:
            data = json.load(f)
    except Exception as e:
        print(f"Error: {e}")
        return

    rep_path = ["Components", "Player", "PlayerData", "ReputationData"]
    reputation = get_nested(data, rep_path)
    
    if not reputation:
        print("Reputation data not found for this player.")
        return

    while True:
        factions = list(reputation.keys())
        selection = select_with_numbers("Select Faction to Edit:", factions + ["Back"])
        
        if selection == "Back":
            break
        
        current_val = reputation.get(selection)
        new_val = inquirer.text(message=f"Enter new value for {selection} (Current: {current_val}, 'c' to cancel):").execute()
        
        if new_val and new_val.lower() != 'c':
            try:
                reputation[selection] = float(new_val)
                with open(player_path, "w") as f:
                    json.dump(data, f, indent=4)
                print(f"Updated {selection} reputation.")
            except ValueError:
                print("Invalid numeric value.")


def edit_recipes(player_path: Path) -> None:
    try:
        with open(player_path, "r") as f:
            data = json.load(f)
    except Exception as e:
        print(f"Error: {e}")
        return

    recipes_path = ["Components", "Player", "PlayerData", "KnownRecipes"]
    recipes = get_nested(data, recipes_path)
    
    if recipes is None:
        recipes = []
        set_nested(data, recipes_path, recipes)

    while True:
        selection = select_with_numbers(
            f"Recipe Unlocker ({len(recipes)} Unlocked)",
            ["Unlock All (Comprehensive Pack)", "Add Specific Recipe ID", "Clear All Recipes", "Back"]
        )

        if selection == "Back":
            break

        if selection.startswith("Unlock All"):
            # These are fallbacks if dynamic scan fails
            comprehensive_recipes = [
                "hytale:crafting_table", "hytale:wooden_sword", "hytale:wooden_pickaxe",
                "hytale:stone_sword", "hytale:stone_pickaxe", "hytale:iron_sword",
                "hytale:iron_pickaxe", "hytale:gold_sword", "hytale:gold_pickaxe",
                "hytale:diamond_sword", "hytale:diamond_pickaxe", "hytale:torch",
                "hytale:furnace", "hytale:chest", "hytale:bed",
            ]
            # Merge and de-duplicate
            recipes = list(set(recipes + comprehensive_recipes))
            set_nested(data, recipes_path, recipes)
            print(f"Unlocked {len(comprehensive_recipes)} comprehensive recipes.")
        
        elif selection.startswith("Add Specific"):
            recipe_id = inquirer.text(message="Enter Recipe ID to add (e.g. hytale:iron_sword):").execute()
            if recipe_id and recipe_id not in recipes:
                recipes.append(recipe_id)
                set_nested(data, recipes_path, recipes)
                print(f"Added {recipe_id}.")
        
        elif selection.startswith("Clear All"):
            if inquirer.confirm(message="Are you sure you want to clear all recipes?").execute():
                recipes = []
                set_nested(data, recipes_path, recipes)
                print("Cleared all recipes.")

        with open(player_path, "w") as f:
            json.dump(data, f, indent=4)


def edit_skills(player_path: Path) -> None:
    try:
        with open(player_path, "r") as f:
            data = json.load(f)
    except Exception as e:
        print(f"Error: {e}")
        return

    # Check for potential skill/progression paths
    potential_paths = [
        ["Components", "Progression"],
        ["Components", "Skills"],
        ["Components", "Player", "PlayerData", "Progression"],
        ["Components", "EndgamePlayerData"],
        ["Components", "Player", "PlayerData"]
    ]
    
    skills_path = None
    for path in potential_paths:
        if get_nested(data, path) is not None:
            skills_path = path
            break
    
    if not skills_path:
        print("Standard Skills/Progression component not found.")
        if inquirer.confirm(message="Search for other numeric components?").execute():
            components = data.get("Components", {})
            potential_comps = [k for k, v in components.items() if isinstance(v, dict) and any(isinstance(val, (int, float)) for val in v.values())]
            if not potential_comps:
                print("No suitable numeric components found.")
                return
            selection = select_with_numbers("Select Component to Edit:", potential_comps + ["Back"])
            if selection == "Back":
                return
            skills_path = ["Components", selection]
        else:
            return

    skills = get_nested(data, skills_path)
    while True:
        skill_keys = [k for k, v in skills.items() if isinstance(v, (int, float, dict))]
        if not skill_keys:
            print("No editable skills found in this component.")
            break
            
        # Display skills nicely
        options = []
        for k in skill_keys:
            val = skills[k]
            if isinstance(val, dict):
                # Check for "Level" or "Value" subkeys
                sub_val = val.get("Level") or val.get("Value") or val.get("Current")
                options.append(f"{k} (Current: {sub_val if sub_val is not None else 'Complex Object'})")
            else:
                options.append(f"{k} (Current: {val})")
        
        selection = select_with_numbers("Select Skill to Edit:", options + ["Back"])
        if selection == "Back":
            break
            
        key = selection.split(" (Current:")[0]
        current_val = skills[key]
        
        if isinstance(current_val, dict):
            sub_key = None
            for sk in ["Level", "Value", "Current", "Experience", "Exp"]:
                if sk in current_val:
                    sub_key = sk
                    break
            
            if sub_key:
                new_val = inquirer.text(message=f"Enter new {sub_key} for {key} (Current: {current_val[sub_key]}):").execute()
                if new_val and new_val.lower() != 'c':
                    try:
                        current_val[sub_key] = float(new_val) if "." in new_val else int(new_val)
                        with open(player_path, "w") as f:
                            json.dump(data, f, indent=4)
                        print(f"Updated {key} {sub_key}.")
                    except ValueError:
                        print("Invalid value.")
            else:
                print("This skill has a complex structure. Use Mod Components menu for raw edit.")
        else:
            new_val = inquirer.text(message=f"Enter new value for {key} (Current: {current_val}):").execute()
            if new_val and new_val.lower() != 'c':
                try:
                    skills[key] = float(new_val) if "." in new_val else int(new_val)
                    with open(player_path, "w") as f:
                        json.dump(data, f, indent=4)
                    print(f"Updated {key}.")
                except ValueError:
                    print("Invalid value.")


def edit_quests(player_path: Path) -> None:
    try:
        with open(player_path, "r") as f:
            data = json.load(f)
    except Exception as e:
        print(f"Error: {e}")
        return

    active_path = ["Components", "Player", "PlayerData", "ActiveObjectiveUUIDs"]
    history_path = ["Components", "ObjectiveHistory"]
    
    active = get_nested(data, active_path)
    
    print(f"Active Objectives: {active if active else 'None'}")
    
    selection = select_with_numbers("Quest Options:", ["Clear Active Objectives", "Clear Objective History", "Back"])
    
    if selection == "Back":
        return
    
    if selection == "Clear Active Objectives":
        if inquirer.confirm(message="Are you sure you want to clear active objectives?").execute():
            set_nested(data, active_path, [])
            print("Cleared active objectives.")
    elif selection == "Clear Objective History":
        if inquirer.confirm(message="Are you sure you want to clear objective history?").execute():
            set_nested(data, history_path, {})
            print("Cleared objective history.")

    with open(player_path, "w") as f:
        json.dump(data, f, indent=4)


def waypoint_teleport(player_path: Path, save_path: Path) -> None:
    # CLI version still uses simple logic, GUI uses the new list-waypoints command
    marker_path = save_path / "universe" / "worlds" / "default" / "resources" / "BlockMapMarkers.json"
    if not marker_path.exists():
        print(f"Markers file not found at {marker_path}")
        return

    try:
        with open(marker_path, "r") as f:
            marker_data = json.load(f)
        with open(player_path, "r") as f:
            player_data = json.load(f)
    except Exception as e:
        print(f"Error loading files: {e}")
        return

    markers_raw = marker_data.get("Markers", [])
    if isinstance(markers_raw, dict):
        markers = list(markers_raw.values())
    else:
        markers = markers_raw

    if not markers:
        print("No markers found in BlockMapMarkers.json.")
        return

    marker_names = [m.get("Name", "Unnamed") if isinstance(m, dict) else str(m) for m in markers]
    selection = select_with_numbers("Select Waypoint to Teleport:", marker_names + ["Back"])
    
    if selection == "Back":
        return

    selected_marker = next((m for m in markers if m.get("Name") == selection), None)
    if not selected_marker:
        print("Marker not found.")
        return

    pos = selected_marker.get("Position")
    if not pos:
        print("Marker has no position data.")
        return

    new_pos = {
        "X": float(pos.get("X", 0)),
        "Y": float(pos.get("Y", 0)) + 2.0, # Add 2.0 to avoid spawning underground
        "Z": float(pos.get("Z", 0))
    }

    # Update current position
    set_nested(player_data, ["Components", "Transform", "Position"], new_pos)
    
    # Update last position (per world data)
    last_pos_path = ["Components", "Player", "PlayerData", "PerWorldData", "default", "LastPosition"]
    set_nested(player_data, last_pos_path, new_pos)

    with open(player_path, "w") as f:
        json.dump(player_data, f, indent=4)
    print(f"Teleported to {selection} (Position: {new_pos})")


def edit_mod_components(player_path: Path) -> None:
    try:
        with open(player_path, "r") as f:
            data = json.load(f)
    except Exception as e:
        print(f"Error: {e}")
        return

    known_components = {
        "Nameplate", "BackpackInventory", "HotbarInventory", "StorageInventory", 
        "Transform", "EntityStats", "Player", "UIComponentList", "hotbar_manager", 
        "HitboxCollision", "UniqueItemUsages", "Instance", "UUID", "ArmorInventory", 
        "HeadRotation", "DisplayName", "UtilityInventory"
    }

    components = data.get("Components", {})
    mod_components = [k for k in components.keys() if k not in known_components]

    if not mod_components:
        print("No modded/unknown components found.")
        return

    while True:
        selection = select_with_numbers("Select Mod Component to Edit:", mod_components + ["Back"])
        
        if selection == "Back":
            break

        comp_data = components[selection]
        print(f"Current data for {selection}:")
        console.print_json(data=comp_data)
        
        if inquirer.confirm(message="Edit this component as raw JSON?").execute():
            new_json = inquirer.text(message="Enter new JSON string (or 'c' to cancel):", multiline=True).execute()
            if new_json and new_json.lower() != 'c':
                try:
                    components[selection] = json.loads(new_json)
                    with open(player_path, "w") as f:
                        json.dump(data, f, indent=4)
                    print(f"Updated {selection}.")
                except json.JSONDecodeError as e:
                    print(f"JSON Error: {e}")


def safe_chunk_reset(save_path: Path) -> None:
    """
    Allows selective deletion of chunk files to force regeneration.
    """
    chunks_dir = save_path / "universe" / "worlds" / "default" / "chunks"
    if not chunks_dir.exists():
        print("Chunks directory not found.")
        return

    chunk_files = list(chunks_dir.glob("*.region.bin"))
    if not chunk_files:
        print("No .region.bin files found.")
        return

    chunk_files.sort(key=lambda x: x.name)
    choices = [f.name for f in chunk_files]
    
    selected = inquirer.checkbox(
        message="Select chunk files to delete (force regeneration):",
        choices=choices
    ).execute()

    if not selected:
        print("No files selected.")
        return

    if inquirer.confirm(message=f"Delete {len(selected)} selected chunk files?").execute():
        for file_name in selected:
            file_path = chunks_dir / file_name
            try:
                file_path.unlink()
                print(f"Deleted {file_name}")
            except Exception as e:
                print(f"Error deleting {file_name}: {e}")
        print("Safe chunk reset complete.")


def scan_region_for_chests_logic(file_path: Path, headless: bool = False) -> List[dict]:
    if not (zstd and bson):
        if not headless: print("Error: zstandard and pymongo (bson) are required for region scanning.")
        return []

    chests = []
    try:
        with open(file_path, "rb") as f:
            f.seek(20)
            header = f.read(12)
            if len(header) < 12: return []
            version, entries, chunk_size = struct.unpack(">III", header)
            
            table = f.read(entries * 8)
            dctx = zstd.ZstdDecompressor()
            
            for i in range(entries):
                entry = table[i*8:(i+1)*8]
                sector, timestamp = struct.unpack(">II", entry)
                
                if sector == 0:
                    continue
                
                f.seek(sector * 4096 + 32)
                len_data = f.read(8)
                if len_data) < 8: continue
                uncomp_len, comp_len = struct.unpack(">II", len_data)
                
                if comp_len == 0 or comp_len > 1000000: continue
                    
                f.seek(sector * 4096 + 40)
                compressed = f.read(comp_len)
                
                try:
                    uncompressed = dctx.decompress(compressed, max_output_size=uncomp_len + 1024)
                    decoded = bson.BSON(uncompressed).decode()
                    
                    bc_chunk = decoded.get("Components", {}).get("BlockComponentChunk", {})
                    bc = bc_chunk.get("BlockComponents", {})
                    
                    for pos, data in bc.items():
                        if isinstance(data, dict):
                            # Try to extract multiple things
                            inv = data.get("Components", {}).get("StorageInventory", {})
                            spawner = data.get("Components", {}).get("Spawner", {})
                            sign = data.get("Components", {}).get("Sign", {})
                            
                            chunk_x = i % 32
                            chunk_z = i // 32
                            
                            if inv:
                                chests.append({
                                    "type": "Chest",
                                    "pos_index": pos,
                                    "chunk": (chunk_x, chunk_z),
                                    "inventory": inv,
                                    "sector": sector,
                                    "full_data": decoded
                                })
                            elif spawner:
                                chests.append({
                                    "type": "Spawner",
                                    "pos_index": pos,
                                    "chunk": (chunk_x, chunk_z),
                                    "spawner": spawner,
                                    "sector": sector,
                                    "full_data": decoded
                                })
                            elif sign:
                                chests.append({
                                    "type": "Sign",
                                    "pos_index": pos,
                                    "chunk": (chunk_x, chunk_z),
                                    "sign": sign,
                                    "sector": sector,
                                    "full_data": decoded
                                })
                except Exception:
                    continue
    except Exception as e:
        if not headless: print(f"Error scanning region: {e}")
                
    return chests


def explore_regions(save_path: Path) -> None:
    chunks_dir = save_path / "universe" / "worlds" / "default" / "chunks"
    if not chunks_dir.exists():
        print("Chunks directory not found.")
        return

    region_files = list(chunks_dir.glob("*.region.bin"))
    if not region_files:
        print("No .region.bin files found.")
        return

    while True:
        os.system('cls' if os.name == 'nt' else 'clear')
        choices = [f.name for f in region_files]
        selection = select_with_numbers("Select Region to Explore:", choices + ["Back"])
        
        if selection == "Back":
            break

        file_path = chunks_dir / selection
        console.print(f"[bold yellow]Scanning {selection} for interesting blocks (Chests)...[/]")
        chests = scan_region_for_chests_logic(file_path)
        
        if not chests:
            print("No chests found in this region.")
            input("Press Enter to continue...")
            continue

        while True:
            os.system('cls' if os.name == 'nt' else 'clear')
            print(f"Region: {selection} | Found {len(chests)} Chests")
            sub_menu = ["List All Chests", "Search for Item ID", "Back"]
            sub_choice = select_with_numbers("Region Explorer Options:", sub_menu)
            
            if sub_choice == "Back":
                break
            
            if sub_choice == "List All Chests":
                while True:
                    chest_options = [f"Chest at Chunk {c['chunk']} Index {c['pos_index']}" for c in chests]
                    chest_choice = select_with_numbers(f"Select Chest to View:", chest_options + ["Back"])
                    
                    if chest_choice == "Back":
                        break
                        
                    idx = chest_options.index(chest_choice)
                    chest = chests[idx]
                    view_chest_contents(chest)

            elif sub_choice == "Search for Item ID":
                search_term = inquirer.text(message="Enter Item ID to search (e.g. hytale:gold_ingot):").execute()
                if search_term:
                    results = []
                    for c in chests:
                        inv = c['inventory'].get('Inventory', {})
                        items = inv.get('Items', [])
                        matches = []
                        if isinstance(items, list):
                            matches = [i for i in items if search_term.lower() in i.get("Id", "").lower()]
                        elif isinstance(items, dict):
                            matches = [i for i in items.values() if search_term.lower() in i.get("Id", "").lower()]
                        
                        if matches:
                            results.append((c, matches))
                    
                    if not results:
                        print(f"No items matching '{search_term}' found.")
                    else:
                        table = Table(title=f"Search Results for '{search_term}'")
                        table.add_column("Location", style="cyan")
                        table.add_column("Item", style="white")
                        table.add_column("Count", justify="right", style="green")
                        for c, matches in results:
                            loc = f"Chunk {c['chunk']} [{c['pos_index']}]"
                            for m in matches:
                                table.add_row(loc, m.get("Id"), str(m.get("Count", 1)))
                        console.print(table)
                    input("Press Enter to continue...")


def view_chest_contents(chest: dict) -> None:
    while True:
        inv = chest['inventory'].get('Inventory', {})
        items = inv.get('Items', [])
        
        table = Table(title=f"Chest Content (Chunk {chest['chunk']} Index {chest['pos_index']})")
        table.add_column("Slot", justify="right", style="cyan")
        table.add_column("Item ID", style="white")
        table.add_column("Quantity", justify="right", style="green")
        
        if isinstance(items, list):
            for item in items:
                table.add_row(str(item.get("Slot", "?")), item.get("Id", "Unknown"), str(item.get("Count", 1)))
        elif isinstance(items, dict):
            for slot, item in items.items():
                table.add_row(str(slot), item.get("Id", "Unknown"), str(item.get("Count", 1)))

        console.print(table)
        print("\n[NOTE] Editing chest contents in binary files is currently READ-ONLY.")
        
        choice = select_with_numbers("Options:", ["Refresh", "Back"])
        if choice == "Back":
            break


def edit_instance_data(save_path: Path) -> None:
    """
    Edits the InstanceData.json world resource.
    """
    instance_path = save_path / "universe" / "worlds" / "default" / "resources" / "InstanceData.json"
    if not instance_path.exists():
        print("InstanceData.json not found.")
        return

    try:
        with open(instance_path, "r") as f:
            data = json.load(f)
    except Exception as e:
        print(f"Error loading InstanceData.json: {e}")
        return

    while True:
        keys = list(data.keys())
        options = [f"{k} (Current: {data[k]})" for k in keys]
        selection = select_with_numbers("Edit Instance Data:", options + ["Back"])

        if selection == "Back":
            break

        key = selection.split(" (Current:")[0]
        current_val = data[key]

        if isinstance(current_val, bool):
            data[key] = inquirer.confirm(message=f"Enable {key}?", default=current_val).execute()
        else:
            new_val = inquirer.text(message=f"Enter new value for {key} (Current: {current_val}):").execute()
            if new_val and new_val.lower() != 'c':
                if isinstance(current_val, int):
                    try:
                        data[key] = int(new_val)
                    except ValueError:
                        print("Invalid integer.")
                elif isinstance(current_val, float):
                    try:
                        data[key] = float(new_val)
                    except ValueError:
                        print("Invalid float.")
                else:
                    data[key] = new_val

        with open(instance_path, "w") as f:
            json.dump(data, f, indent=4)
        print(f"Updated {key} successfully.")


def hard_reset_world(save_path: Path) -> Path:
    """
    Performs a hard reset of the world.
    """
    console.print("[bold red]DANGER: This will delete all world progress and reset players![/]")
    if not inquirer.confirm(message="ARE YOU ABSOLUTELY SURE?").execute():
        return save_path

    new_seed = inquirer.text(message="Enter new Seed (integer):").execute()
    try:
        new_seed_val = int(new_seed)
    except ValueError:
        print("Invalid seed.")
        return save_path

    create_backup(save_path)

    # 1. Update config.json
    conf_path = save_path / "universe" / "worlds" / "default" / "config.json"
    if conf_path.exists():
        with open(conf_path, "r") as f: data = json.load(f)
        data["Seed"] = new_seed_val
        with open(conf_path, "w") as f: json.dump(data, f, indent=4)

    # 2. Delete chunks
    chunks_dir = save_path / "universe" / "worlds" / "default" / "chunks"
    if chunks_dir.exists():
        for chunk_file in chunks_dir.glob("*"):
            if chunk_file.is_file(): chunk_file.unlink()

    print("[BOLD GREEN]Hard reset complete.[/]")
    return save_path


def save_renaming(save_path: Path) -> Path:
    new_name = inquirer.text(message=f"New name (Current: {save_path.name}):").execute()
    if not new_name or new_name.lower() == 'c': return save_path

    new_path = SAVE_BASE_PATH / new_name
    if new_path.exists(): return save_path

    try:
        conf_path = save_path / "universe" / "worlds" / "default" / "config.json"
        if conf_path.exists():
            with open(conf_path, "r") as f: data = json.load(f)
            data["DisplayName"] = new_name
            with open(conf_path, "w") as f: json.dump(data, f, indent=4)

        os.rename(save_path, new_path)
        return new_path
    except Exception as e:
        print(f"Error: {e}")
        return save_path


def get_player_path(save_path: Path) -> Optional[Path]:
    players = get_players(save_path)
    if not players: return None
    p_select = select_with_numbers("Select Player:", [p.name for p in players] + ["Back"])
    if p_select == "Back": return None
    return next(p for p in players if p.name == p_select)


def headless_main(args):
    if args.command == "list-saves":
        saves = get_saves()
        json_output([{"name": s.name, "path": str(s)} for s in saves])
    
    elif args.command == "list-players":
        save_path = SAVE_BASE_PATH / args.save
        players = get_players(save_path)
        json_output([{"name": p.name, "path": str(p)} for p in players])
        
    elif args.command == "get-player":
        player_path = Path(args.path)
        if player_path.exists():
            with open(player_path, "r") as f: json_output(json.load(f))
        else:
            json_output({"error": "Player not found"})

    elif args.command == "update-player":
        player_path = Path(args.path)
        try:
            data = json.loads(args.data)
            with open(player_path, "w") as f: json.dump(data, f, indent=4)
            json_output({"success": True})
        except Exception as e:
            json_output({"error": str(e)})

    elif args.command == "list-regions":
        save_path = SAVE_BASE_PATH / args.save
        chunks_dir = save_path / "universe" / "worlds" / "default" / "chunks"
        if not chunks_dir.exists():
            json_output([])
            return
        region_files = list(chunks_dir.glob("*.region.bin"))
        json_output([f.name for f in region_files])

    elif args.command == "scan-region":
        save_path = SAVE_BASE_PATH / args.save
        file_path = save_path / "universe" / "worlds" / "default" / "chunks" / args.region
        if not file_path.exists():
            json_output({"error": "Region file not found"})
            return
        
        chests = scan_region_for_chests_logic(file_path, headless=True)
        for c in chests:
            if "full_data" in c: del c["full_data"]
        print(json.dumps(chests, default=str))

    elif args.command == "scan-all-regions":
        save_path = SAVE_BASE_PATH / args.save
        chunks_dir = save_path / "universe" / "worlds" / "default" / "chunks"
        if not chunks_dir.exists():
            json_output([])
            return
        
        all_results = []
        for file_path in chunks_dir.glob("*.region.bin"):
            chests = scan_region_for_chests_logic(file_path, headless=True)
            for c in chests:
                if "full_data" in c: del c["full_data"]
                c["region_file"] = file_path.name
                all_results.append(c)
        print(json.dumps(all_results, default=str))

    elif args.command == "hard-reset":
        save_path = SAVE_BASE_PATH / args.save
        create_backup(save_path)
        conf_path = save_path / "universe" / "worlds" / "default" / "config.json"
        if conf_path.exists():
            with open(conf_path, "r") as f: data = json.load(f)
            data["Seed"] = int(args.seed)
            with open(conf_path, "w") as f: json.dump(data, f, indent=4)
        chunks_dir = save_path / "universe" / "worlds" / "default" / "chunks"
        if chunks_dir.exists():
            for chunk_file in chunks_dir.glob("*"):
                if chunk_file.is_file(): chunk_file.unlink()
        json_output({"success": True})

    elif args.command == "rename-save":
        save_path = SAVE_BASE_PATH / args.save
        new_path = SAVE_BASE_PATH / args.newname
        try:
            os.rename(save_path, new_path)
            json_output({"success": True, "new_path": str(new_path)})
        except Exception as e:
            json_output({"error": str(e)})

    elif args.command == "safe-chunk-reset":
        save_path = SAVE_BASE_PATH / args.save
        chunks_dir = save_path / "universe" / "worlds" / "default" / "chunks"
        try:
            target_file = chunks_dir / args.chunkfile
            if target_file.exists(): target_file.unlink()
            json_output({"success": True})
        except Exception as e:
            json_output({"error": str(e)})

    elif args.command == "list-waypoints":
        save_path = SAVE_BASE_PATH / args.save
        resource_dir = save_path / "universe" / "worlds" / "default" / "resources"
        all_markers = []
        
        # 1. BlockMapMarkers.json
        block_path = resource_dir / "BlockMapMarkers.json"
        if block_path.exists():
            try:
                with open(block_path, "r") as f: data = json.load(f)
                raw = data.get("Markers", [])
                markers = list(raw.values()) if isinstance(raw, dict) else raw
                for m in markers:
                    if isinstance(m, dict) and "Position" in m: all_markers.append(m)
            except: pass
            
        # 2. SharedUserMapMarkers.json
        user_path = resource_dir / "SharedUserMapMarkers.json"
        if user_path.exists():
            try:
                with open(user_path, "r") as f: data = json.load(f)
                raw = data.get("UserMarkers", [])
                for m in raw:
                    if isinstance(m, dict):
                        all_markers.append({
                            "Name": m.get("Label") or m.get("Id", "Custom Waypoint").split('_')[-1][:8],
                            "Position": {"X": m.get("X", 0), "Y": m.get("Y", 100), "Z": m.get("Z", 0)},
                            "Icon": m.get("Icon")
                        })
            except: pass
            
        unique_markers = []
        seen_names = set()
        for m in all_markers:
            name = m.get("Name")
            if name and name not in seen_names:
                unique_markers.append(m)
                seen_names.add(name)
        json_output(unique_markers)

    elif args.command == "teleport-player":
        save_path = SAVE_BASE_PATH / args.save
        player_path = Path(args.path)
        resource_dir = save_path / "universe" / "worlds" / "default" / "resources"
        try:
            with open(player_path, "r") as f: player_data = json.load(f)
            target_marker = None
            for fname in ["BlockMapMarkers.json", "SharedUserMapMarkers.json"]:
                mpath = resource_dir / fname
                if mpath.exists():
                    with open(mpath, "r") as f: data = json.load(f)
                    if fname == "BlockMapMarkers.json":
                        raw = data.get("Markers", [])
                        markers = list(raw.values()) if isinstance(raw, dict) else raw
                        target_marker = next((m for m in markers if m.get("Name") == args.waypoint), None)
                    else:
                        raw = data.get("UserMarkers", [])
                        m = next((m for m in raw if (m.get("Label") or m.get("Id", "").split('_')[-1][:8]) == args.waypoint), None)
                        if m: target_marker = {"Position": {"X": m.get("X", 0), "Y": m.get("Y", 100), "Z": m.get("Z", 0)}}
                    if target_marker: break
            
            if not target_marker:
                json_output({"error": "Waypoint not found"})
                return
            pos = target_marker.get("Position", {})
            new_pos = {"X": float(pos.get("X", 0)), "Y": float(pos.get("Y", 0)) + 2.0, "Z": float(pos.get("Z", 0))}
            set_nested(player_data, ["Components", "Transform", "Position"], new_pos)
            set_nested(player_data, ["Components", "Player", "PlayerData", "PerWorldData", "default", "LastPosition"], new_pos)
            with open(player_path, "w") as f: json.dump(player_data, f, indent=4)
            json_output({"success": True, "new_pos": new_pos})
        except Exception as e:
            json_output({"error": str(e)})

    elif args.command == "list-dynamic-assets":
        try:
            import sys
            possible_dirs = [Path(sys.executable).parent / "resources", Path(__file__).parent.absolute(), Path(os.getcwd())]
            script_found = False
            for d in possible_dirs:
                if (d / "get_dynamic_assets.py").exists():
                    if str(d) not in sys.path: sys.path.append(str(d))
                    script_found = True
                    break
            if not script_found:
                 json_output({"error": "get_dynamic_assets.py not found"})
                 return
            from get_dynamic_assets import get_dynamic_data
            json_output(get_dynamic_data())
        except Exception as e:
            json_output({"error": str(e)})


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Hytale Save Editor (HSE)")
    parser.add_argument("--headless", action="store_true", help="Run in headless mode")
    subparsers = parser.add_subparsers(dest="command")
    subparsers.add_parser("list-saves")
    list_p = subparsers.add_parser("list-players")
    list_p.add_argument("--save", required=True)
    get_p = subparsers.add_parser("get-player")
    get_p.add_argument("--path", required=True)
    upd_p = subparsers.add_parser("update-player")
    upd_p.add_argument("--path", required=True)
    upd_p.add_argument("--data", required=True)
    list_r = subparsers.add_parser("list-regions")
    list_r.add_argument("--save", required=True)
    scan_r = subparsers.add_parser("scan-region")
    scan_r.add_argument("--save", required=True)
    scan_r.add_argument("--region", required=True)
    hr_r = subparsers.add_parser("hard-reset")
    hr_r.add_argument("--save", required=True)
    hr_r.add_argument("--seed", required=True)
    ren_r = subparsers.add_parser("rename-save")
    ren_r.add_argument("--save", required=True)
    ren_r.add_argument("--newname", required=True)
    scr_r = subparsers.add_parser("safe-chunk-reset")
    scr_r.add_argument("--save", required=True)
    scr_r.add_argument("--chunkfile", required=True)
    lw_r = subparsers.add_parser("list-waypoints")
    lw_r.add_argument("--save", required=True)
    tp_r = subparsers.add_parser("teleport-player")
    tp_r.add_argument("--save", required=True)
    tp_r.add_argument("--path", required=True)
    tp_r.add_argument("--waypoint", required=True)
    sar_r = subparsers.add_parser("scan-all-regions")
    sar_r.add_argument("--save", required=True)
    subparsers.add_parser("list-dynamic-assets")

    args = parser.parse_args()
    if args.headless: headless_main(args)
    else:
        try: main()
        except KeyboardInterrupt: print("\nExiting...")
