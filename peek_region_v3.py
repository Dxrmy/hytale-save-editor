import struct
import os
import sys

def peek_region(file_path):
    if not os.path.exists(file_path):
        print(f"File {file_path} does not exist.")
        return
    
    with open(file_path, "rb") as f:
        magic = f.read(20)
        print(f"File: {os.path.basename(file_path)}")
        try:
            print(f"Magic: {magic.decode('ascii')}")
        except:
            print(f"Magic (hex): {magic.hex()}")
        
        header = f.read(12)
        version, entries, chunk_size = struct.unpack(">III", header)
        print(f"Version: {version}, Entries: {entries}, ChunkSize: {chunk_size}")
        
        table = f.read(entries * 8)
        print("First 3 non-zero entries (8 bytes each):")
        found = 0
        for i in range(entries):
            entry = table[i*8:(i+1)*8]
            val1, val2 = struct.unpack(">II", entry)
            if val1 != 0 or val2 != 0:
                chunk_x = i % 32
                chunk_z = i // 32
                print(f"  Entry {i} (Chunk {chunk_x}, {chunk_z}): {val1:08x} {val2:08x} ({val1}, {val2})")
                found += 1
                if found >= 3:
                    break

if __name__ == "__main__":
    if len(sys.argv) > 1:
        peek_region(sys.argv[1])
    else:
        print("Usage: python peek_region_v3.py <file_path>")
