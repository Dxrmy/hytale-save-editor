import struct
import os
import zstandard as zstd
import bson
import json

def scan_region_for_chests(file_path):
    chests = []
    with open(file_path, "rb") as f:
        f.seek(20)
        header = f.read(12)
        version, entries, chunk_size = struct.unpack(">III", header)
        
        # Read the table (8 bytes per entry: Offset sector + Timestamp)
        table = f.read(entries * 8)
        
        dctx = zstd.ZstdDecompressor()
        
        for i in range(entries):
            entry = table[i*8:(i+1)*8]
            sector, timestamp = struct.unpack(">II", entry)
            
            if sector == 0:
                continue
            
            # Read chunk header at sector
            f.seek(sector * 4096 + 32)
            len_data = f.read(8)
            if len(len_data) < 8: continue
            uncomp_len, comp_len = struct.unpack(">II", len_data)
            
            if comp_len == 0 or comp_len > 1000000: # Safety check
                continue
                
            # Read compressed data
            f.seek(sector * 4096 + 40)
            compressed = f.read(comp_len)
            
            try:
                uncompressed = dctx.decompress(compressed, max_output_size=uncomp_len + 1024)
                # BSON decode
                decoded = bson.BSON(uncompressed).decode()
                
                # Check for chests
                bc_chunk = decoded.get("Components", {}).get("BlockComponentChunk", {})
                bc = bc_chunk.get("BlockComponents", {})
                
                for pos, data in bc.items():
                    if isinstance(data, dict):
                        inv = data.get("Components", {}).get("StorageInventory", {})
                        if inv:
                            chunk_x = i % 32
                            chunk_z = i // 32
                            chests.append({
                                "pos_index": pos,
                                "chunk": (chunk_x, chunk_z),
                                "inventory": inv
                            })
            except Exception:
                continue # Skip failed chunks
                
    return chests

if __name__ == "__main__":
    path = r"C:\Users\kmric\AppData\Roaming\Hytale\UserData\Saves\Orbis Origin\universe\worlds\default\chunks\1.0.region.bin"
    print(f"Scanning {path} for chests...")
    chests = scan_region_for_chests(path)
    print(f"Found {len(chests)} chests.")
    
    for c in chests:
        print(f"\nChest at Chunk {c['chunk']} Index {c['pos_index']}:")
        # Pretty print inventory
        inv = c['inventory'].get('Inventory', {})
        items = inv.get('Items', [])
        if not items:
            print("  (Empty)")
        else:
            for item in items:
                print(f"  - {item.get('Count', 1)}x {item.get('Id')}")
