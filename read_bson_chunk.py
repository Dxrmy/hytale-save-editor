import bson
import os

def read_bson(file_path):
    with open(file_path, "rb") as f:
        data = f.read()
        try:
            # BSON decode
            decoded = bson.BSON(data).decode()
            
            # Find Chests
            # Based on what we saw, they might be in Components.BlockComponentChunk
            # or something similar
            print("Successfully decoded BSON.")
            
            # Print keys in root
            print(f"Root keys: {list(decoded.keys())}")
            
            # Print Components keys
            if "Components" in decoded:
                comp = decoded["Components"]
                print(f"Components keys: {list(comp.keys())}")
                
                # Check for BlockComponentChunk
                if "BlockComponentChunk" in comp:
                    bcc = comp["BlockComponentChunk"]
                    print(f"BlockComponentChunk keys: {list(bcc.keys())}")
                    
                    if "BlockComponents" in bcc:
                        bc = bcc["BlockComponents"]
                        print(f"Found {len(bc)} BlockComponents.")
                        # Chests are probably here
                        for pos, data in bc.items():
                            if isinstance(data, dict):
                                # Check for inventory
                                if "StorageInventory" in data.get("Components", {}):
                                    print(f"FOUND CHEST AT {pos}:")
                                    print(data["Components"]["StorageInventory"])
            
            # Save decoded JSON for inspection
            import json
            def json_serial(obj):
                if isinstance(obj, bytes):
                    return obj.hex()
                return str(obj)
                
            with open("chunk_data.json", "w") as out:
                json.dump(decoded, out, indent=2, default=json_serial)
                print("Saved to chunk_data.json")
                
        except Exception as e:
            print(f"BSON decoding failed: {e}")

if __name__ == "__main__":
    read_bson("chunk_data.bin")
