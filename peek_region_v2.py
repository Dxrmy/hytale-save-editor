import struct
import os

def peek_region(file_path):
    with open(file_path, "rb") as f:
        magic = f.read(20)
        print(f"Magic: {magic.decode('ascii')}")
        version = struct.unpack(">I", f.read(4))[0]
        entries = struct.unpack(">I", f.read(4))[0]
        chunk_size = struct.unpack(">I", f.read(4))[0]
        print(f"Version: {version}, Entries: {entries}, ChunkSize: {chunk_size}")
        
        # Read the table(s)
        # Let's read 1024 * 8 bytes to see if it's (offset, length) or something else
        table = f.read(entries * 8)
        print("First 5 entries (8 bytes each):")
        for i in range(5):
            entry = table[i*8:(i+1)*8]
            val1, val2 = struct.unpack(">II", entry)
            print(f"  Entry {i}: {val1:08x} {val2:08x} ({val1}, {val2})")

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        peek_region(sys.argv[1])
    else:
        print("Usage: python peek_region_v2.py <file_path>")
