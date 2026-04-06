import struct
import os

def peek_region(file_path):
    if not os.path.exists(file_path):
        print(f"File {file_path} does not exist.")
        return
    
    with open(file_path, "rb") as f:
        # Read first 8192 bytes (header and timestamps maybe)
        header = f.read(8192)
        
        print(f"File size: {os.path.getsize(file_path)}")
        print("First 64 bytes (hex):")
        print(header[:64].hex(' '))
        
        # Check if there are non-zero offsets in the first 4096 bytes
        offsets = struct.unpack(">1024I", header[:4096])
        non_zero = [(i, val) for i, val in enumerate(offsets) if val != 0]
        print(f"Found {len(non_zero)} non-zero offsets in first 4096 bytes.")
        if non_zero:
            for i, val in non_zero[:10]:
                chunk_x = i % 32
                chunk_z = i // 32
                offset = (val >> 8) * 4096
                length = (val & 0xFF) * 4096
                print(f"  Index {i} (Chunk {chunk_x}, {chunk_z}): Offset {offset}, Length {length}")

if __name__ == "__main__":
    path = r"C:\Users\kmric\AppData\Roaming\Hytale\UserData\Saves\Orbis Origin\universe\worlds\default\chunks\1.0.region.bin"
    peek_region(path)
