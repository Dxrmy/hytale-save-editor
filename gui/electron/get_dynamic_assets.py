import os
import json
import zipfile
import re
from pathlib import Path

def get_dynamic_data():
    # Priority 1: Common Hytale install paths
    possible_paths = [
        Path(os.path.expandvars(r"%APPDATA%\Hytale\install\release\package\game\latest\Assets.zip")),
        Path(os.path.expandvars(r"%LOCALAPPDATA%\Hytale\install\release\package\game\latest\Assets.zip")),
        Path(r"C:\Program Files\Hytale\install\release\package\game\latest\Assets.zip"),
        Path(r"C:\Program Files (x86)\Hytale\install\release\package\game\latest\Assets.zip"),
    ]
    
    # Try to find from launcher logs if available
    launcher_log = Path(os.path.expandvars(r"%APPDATA%\Hytale\hytale-launcher.log"))
    if launcher_log.exists():
        try:
            with open(launcher_log, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
                # Look for patterns like "Install path: ..." or similar
                match = re.search(r'Install path:\s*(.*)', content)
                if match:
                    log_path = Path(match.group(1).strip()) / "release/package/game/latest/Assets.zip"
                    possible_paths.insert(0, log_path)
        except:
            pass

    assets_zip = None
    for p in possible_paths:
        if p.exists():
            assets_zip = p
            break
            
    if not assets_zip:
        return {"error": f"Hytale Assets.zip not found. Checked: {', '.join([str(p) for p in possible_paths])}"}
    
    items = set()
    memories = set()
    
    try:
        with zipfile.ZipFile(assets_zip, 'r') as z:
            for f in z.infolist():
                # 1. Scan for Items
                if f.filename.startswith('Server/Item/Items/') and f.filename.endswith('.json'):
                    item_id = "hytale:" + re.sub(r'\.json$', '', f.filename.split('/')[-1]).lower()
                    items.add(item_id)
                
                # 2. Scan for Memories (NPC Roles)
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
            "assets_path": str(assets_zip)
        }
        
    except Exception as e:
        return {"error": f"Error reading Assets.zip: {str(e)}"}

if __name__ == "__main__":
    print(json.dumps(get_dynamic_data(), indent=2))
