import os
import json
import zipfile
import re
from pathlib import Path

def get_dynamic_data():
    # Priority 1: Common Hytale install paths
    possible_paths = [
        Path(os.path.expandvars(r"%APPDATA%\Hytale\install\release\package\game\latest")),
        Path(os.path.expandvars(r"%LOCALAPPDATA%\Hytale\install\release\package\game\latest")),
        Path(r"C:\Program Files\Hytale\install\release\package\game\latest"),
        Path(r"C:\Program Files (x86)\Hytale\install\release\package\game\latest"),
    ]
    
    # Try to find from launcher logs if available
    launcher_log = Path(os.path.expandvars(r"%APPDATA%\Hytale\hytale-launcher.log"))
    if launcher_log.exists():
        try:
            with open(launcher_log, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
                match = re.search(r'Install path:\s*(.*)', content)
                if match:
                    log_path = Path(match.group(1).strip())
                    possible_paths.insert(0, log_path)
        except:
            pass

    game_dir = None
    for p in possible_paths:
        if (p / "Assets.zip").exists():
            game_dir = p
            break
            
    if not game_dir:
        return {"error": f"Hytale installation not found. Checked: {', '.join([str(p) for p in possible_paths])}"}
    
    assets_zip = game_dir / "Assets.zip"
    items = set()
    memories = set()
    translations = {}
    
    # 1. Parse Language file for translations
    lang_file = game_dir / "Client" / "Data" / "Shared" / "Language" / "en-US" / "client.lang"
    if lang_file.exists():
        try:
            with open(lang_file, 'r', encoding='utf-8', errors='ignore') as f:
                for line in f:
                    if '=' in line:
                        key, val = line.split('=', 1)
                        translations[key.strip()] = val.strip()
        except:
            pass

    try:
        with zipfile.ZipFile(assets_zip, 'r') as z:
            for f in z.infolist():
                # 2. Scan for Items
                if f.filename.startswith('Server/Item/Items/') and f.filename.endswith('.json'):
                    item_id = "hytale:" + re.sub(r'\.json$', '', f.filename.split('/')[-1]).lower()
                    items.add(item_id)
                
                # 3. Scan for Memories (NPC Roles)
                if f.filename.startswith('Server/NPC/Roles/') and f.filename.endswith('.json') and not '/_Core/' in f.filename:
                    try:
                        role_data = json.loads(z.read(f.filename).decode())
                        is_memory = False
                        if role_data.get("IsMemory"): is_memory = True
                        elif role_data.get("Modify", {}).get("IsMemory"): is_memory = True
                        
                        if is_memory:
                            memory_id = "hytale:" + re.sub(r'\.json$', '', f.filename.split('/')[-1]).lower()
                            memories.add(memory_id)
                    except:
                        continue

        # Fallback if list is too small
        if len(memories) < 20:
             for f in z.infolist():
                if f.filename.startswith('Server/NPC/Roles/') and f.filename.endswith('.json') and not '/_Core/' in f.filename:
                    name = f.filename.split('/')[-1].lower()
                    if any(c in name for c in ['kweebec', 'trork', 'outlander', 'scarak', 'feran', 'skeleton', 'zombie', 'void', 'bear', 'wolf', 'owl', 'fox', 'eel', 'shark', 'golem']):
                         memories.add("hytale:" + re.sub(r'\.json$', '', name))

        return {
            "items": sorted(list(items)),
            "memories": sorted(list(memories)),
            "translations": translations,
            "assets_path": str(assets_zip)
        }
        
    except Exception as e:
        return {"error": f"Error reading Assets.zip: {str(e)}"}

if __name__ == "__main__":
    data = get_dynamic_data()
    # Print subset of translations for verification
    if "translations" in data:
        print(f"Loaded {len(data['translations'])} translations.")
        # Filter for waypoint related
        wp_trans = {k: v for k, v in data['translations'].items() if 'portal' in k.lower() or 'temple' in k.lower()}
        print(json.dumps({"wp_subset": wp_trans}, indent=2))
    print(json.dumps({k: v for k, v in data.items() if k != "translations"}, indent=2))
