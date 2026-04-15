import struct
import os

def read_chunk_at_sector(file_path, sector, size=128):
    offset = sector * 4096
    with open(file_path, "rb") as f:
        f.seek(offset)
        data = f.read(size)
        print(f"Data at sector {sector} (offset {offset}) (hex):")
        print(data[:64].hex(' '))
        
        # Check for Zstd magic or similar
        # Zstd magic: 28 b5 2f fd
        if data.startswith(b"\x28\xb5\x2f\xfd"):
            print("Detected Zstd compression.")
        
        # Hytale often uses VarInt for sizes
        # Let's see if the first few bytes are a length
        try:
            length = struct.unpack(">I", data[:4])[0]
            print(f"First 4 bytes as Big-Endian Int: {length}")
        except:
            pass

if __name__ == "__main__":
    import sys
    if len(sys.argv) < 3:
        print("Usage: python peek_sector.py <file_path> <sector> [size]")
        sys.exit(1)
    
    path = sys.argv[1]
    sector = int(sys.argv[2])
    size = int(sys.argv[3]) if len(sys.argv) > 3 else 128
    read_chunk_at_sector(path, sector, size)
