import os
import json
import zipfile
import re
from pathlib import Path

# Try to find the Hytale installation path
HYTALE_INSTALL_PATH = Path(os.path.expandvars(r"%APPDATA%\Hytale\install\release\package\game\latest"))
ASSETS_ZIP = HYTALE_INSTALL_PATH / "Assets.zip"

def get_dynamic_data():
    if not ASSETS_ZIP.exists():
        return {"error": f"Assets.zip not found at {ASSETS_ZIP}"}
    
    items = set()
    memories = set()
    
    try:
        with zipfile.ZipFile(ASSETS_ZIP, 'r') as z:
            # 1. Scan for Items
            # Items are primarily in Server/Item/Items/
            for f in z.infolist():
                if f.filename.startswith('Server/Item/Items/') and f.filename.endswith('.json'):
                    # Strip path and extension, add hytale: prefix
                    item_id = "hytale:" + re.sub(r'\.json$', '', f.filename.split('/')[-1]).lower()
                    items.add(item_id)
                
                # 2. Scan for Memories (NPC Roles)
                # We scan NPC Roles and look for "IsMemory": true
                if f.filename.startswith('Server/NPC/Roles/') and f.filename.endswith('.json') and not '/_Core/' in f.filename:
                    try:
                        role_data = json.loads(z.read(f.filename).decode())
                        is_memory = False
                        if role_data.get("IsMemory"):
                            is_memory = True
                        elif role_data.get("Modify", {}).get("IsMemory"):
                            is_memory = True
                        
                        if is_memory:
                            memory_id = "hytale:" + re.sub(r'\.json$', '', f.filename.split('/')[-1]).lower()
                            memories.add(memory_id)
                    except:
                        continue

        # Fallback logic: if memory list is suspiciously empty, use common creature keywords
        if len(memories) < 20:
             for f in z.infolist():
                if f.filename.startswith('Server/NPC/Roles/') and f.filename.endswith('.json') and not '/_Core/' in f.filename:
                    name = f.filename.split('/')[-1].lower()
                    # Broad keywords for Hytale creatures
                    if any(c in name for c in ['kweebec', 'trork', 'outlander', 'scarak', 'feran', 'skeleton', 'zombie', 'void', 'bear', 'wolf', 'owl', 'fox', 'eel', 'shark', 'golem']):
                         memories.add("hytale:" + re.sub(r'\.json$', '', name))

        return {
            "items": sorted(list(items)),
            "memories": sorted(list(memories))
        }
        
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    print(json.dumps(get_dynamic_data(), indent=2))
